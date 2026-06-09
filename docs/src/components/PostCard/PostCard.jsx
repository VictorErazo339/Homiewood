import { useEffect, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { tagClass, soloFecha } from "../../lib/format.js";
import img from "../../assets/images.js";
import AddToList from "../AddToList/AddToList.jsx";
import styles from "./PostCard.module.css";

const POST_LIST_OPTIONS = [
  { key: "watchlist", label: "Watchlist", img: img.watchlist },
  { key: "porver", label: "Por ver", img: img.pendinglist },
];

function Estrellas({ puntaje, total = 5 }) {
  return (
    <div className={styles.postFilmRatingStars}>
      {Array.from({ length: total }, (_, idx) => {
        const i = idx + 1;
        return (
          <i key={i} className={`bi ${i <= puntaje ? "bi-star-fill" : "bi-star"}`}></i>
        );
      })}
    </div>
  );
}

// Single feed post (a calificación with a non-empty comment). Owns its likes,
// comments and add-to-list state.
export default function PostCard({ calificacion: c, currentUser }) {
  const [likes, setLikes] = useState({
    totalLikes: 0,
    totalDislikes: 0,
    tipoUsuario: null,
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentInput, setCommentInput] = useState("");

  const id = c.idCalificacion;
  const idUsuario = currentUser?.idUsuario;

  // Load like/dislike counts + the current user's reaction.
  useEffect(() => {
    if (!idUsuario) return;
    let activo = true;
    apiRequest(`/likes-calificacion/${id}/${idUsuario}`)
      .then((data) => activo && setLikes(data))
      .catch((error) => console.error("Error cargando likes:", error));
    return () => {
      activo = false;
    };
  }, [id, idUsuario]);

  async function toggleLike(tipo) {
    try {
      const data = await apiRequest("/likes-calificacion", {
        method: "POST",
        body: JSON.stringify({ idCalificacion: id, idUsuario, tipo }),
      });
      setLikes(data);
    } catch (error) {
      console.error("Error en toggleLike:", error);
    }
  }

  async function cargarComentarios() {
    try {
      const data = await apiRequest(`/comentarios-calificacion/${id}`);
      setComentarios(
        (data || []).map((cm) => ({
          user: cm.username || cm.nombreUsuario || "Usuario",
          text: cm.texto,
          time: cm.fechaComentario ? soloFecha(cm.fechaComentario) : "ahora mismo",
        }))
      );
      setCommentCount((data || []).length);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    }
  }

  async function toggleComments() {
    const willOpen = !commentsOpen;
    setCommentsOpen(willOpen);
    if (willOpen) await cargarComentarios();
  }

  async function addComment() {
    const text = commentInput.trim();
    if (!text) return;
    try {
      await apiRequest("/comentarios-calificacion", {
        method: "POST",
        body: JSON.stringify({ idCalificacion: id, idUsuario, texto: text }),
      });
      setCommentInput("");
      await cargarComentarios();
    } catch (error) {
      console.error("Error agregando comentario:", error);
    }
  }

  const fecha = soloFecha(c.fechaCalificacion);
  const tipo = c.tipoContenido || "Contenido";
  const puntaje = c.puntaje || 0;
  const titulo = c.tituloContenido || "Sin título";
  const username = c.username || c.nombreUsuario || "Usuario";

  const posterStyle = c.posterUrl
    ? {
        backgroundImage: `url('${c.posterUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: "linear-gradient(135deg,#2a1a4a,#5a2a8a)" };

  return (
    <div className={styles.postCard}>
      <div className={styles.timestamp}>{fecha}</div>

      <div className={styles.postLayout}>
        <div className={styles.postColPoster}>
          <div className={styles.postThumb} style={posterStyle}>
            {c.posterUrl ? "" : titulo}
          </div>
        </div>

        <div className={styles.postColFilm}>
          <div className={styles.postFilmTitle}>{titulo}</div>

          <div className="d-flex gap-2 flex-wrap">
            <span className={`tag ${tagClass(tipo)}`}>{tipo}</span>
          </div>

          {puntaje > 0 && (
            <div className={styles.postFilmRating}>
              <Estrellas puntaje={puntaje} />
            </div>
          )}

          <AddToList options={POST_LIST_OPTIONS} wrapClassName={styles.listWrap} />
        </div>

        <div className={styles.postColSocial}>
          <div className={styles.username}>
            <div className={styles.userIcon}>👤</div>
            {username}
          </div>

          <p className={`${styles.postText} mb-0`}>{c.comentario || ""}</p>

          <div className={styles.postFooterRow}>
            <button className={styles.commentToggle} onClick={toggleComments}>
              <img src={img.hamstercomment} alt="Comentar" width="40" />
              <span>
                {commentCount} comentario{commentCount !== 1 ? "s" : ""}
              </span>
            </button>

            <div className={styles.postActions}>
              <button
                className={likes.tipoUsuario === "LIKE" ? styles.active : ""}
                onClick={() => toggleLike("LIKE")}
              >
                <img
                  src={img.postlike}
                  alt="Me gustó"
                  width="50"
                  className={styles.glowImage}
                />
                <span>{likes.totalLikes}</span>
              </button>

              <button
                className={likes.tipoUsuario === "DISLIKE" ? styles.active : ""}
                onClick={() => toggleLike("DISLIKE")}
              >
                <img
                  src={img.postdislike}
                  alt="No me gustó"
                  width="50"
                  className={styles.glowImage}
                />
                <span>{likes.totalDislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.commentSection} ${commentsOpen ? styles.open : ""}`}>
        <div className={styles.commentList}>
          {comentarios.map((cm, i) => (
            <div className={styles.comment} key={i}>
              <div className={styles.cAvatar}>👤</div>
              <div>
                <div className={styles.cName}>{cm.user}</div>
                <div className={styles.cText}>{cm.text}</div>
                <div className={styles.cTime}>{cm.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.commentInputRow}>
          <input
            type="text"
            placeholder="Escribe un comentario..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addComment();
            }}
          />
          <button onClick={addComment}>Comentar</button>
        </div>
      </div>
    </div>
  );
}
