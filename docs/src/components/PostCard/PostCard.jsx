import { useEffect, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { obtenerContenido } from "../../api/contenidosApi.js";
import { tagClass, soloFecha } from "../../lib/format.js";
import { esEstrenoSensible, motivoSpoiler } from "../../lib/spoiler.js";
import img, { avatarPorIcono } from "../../assets/images.js";
import AddToList from "../AddToList/AddToList.jsx";
import FilmModal from "../FilmModal/FilmModal.jsx";
import styles from "./PostCard.module.css";

import { useComentariosSocket } from "../../lib/websocket.js";


function avatarUsuario(iconoPerfil) {
  return avatarPorIcono(iconoPerfil);
}

const POST_LIST_OPTIONS = [
  { key: "watchlist", label: "Watchlist", img: img.watchlist },
  { key: "porver", label: "Por ver", img: img.pendinglist },
];

const POSTER_FALLBACK = "linear-gradient(135deg,#2a1a4a,#5a2a8a)";

function Estrellas({ puntaje, total = 5 }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: total }, (_, idx) => {
        const i = idx + 1;
        return (
          <i key={i} className={`bi ${i <= puntaje ? "bi-star-fill" : "bi-star"}`}></i>
        );
      })}
      <span className={styles.starsValue}>{puntaje}</span>
    </div>
  );
}

// Single feed post (a calificación with a non-empty comment). Owns its likes,
// comments, add-to-list, film-detail modal and spoiler-blur state. Used in
// every feed: Home ("my homies" / Trending) and Profile.
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

  // Content detail (release date + synopsis), fetched lazily on mount. Drives
  // the spoiler filter and feeds the film-detail modal.
  const [contenido, setContenido] = useState(null);
  const [modalFilm, setModalFilm] = useState(null);
  const [loadingFilm, setLoadingFilm] = useState(false);
  const [filmError, setFilmError] = useState("");

  const id = c.idCalificacion;
  const idContenido = c.idContenido;
  const idUsuario = currentUser?.idUsuario;

  // Spoiler filter: blur the post when the title is a recent/future release.
  const sensible = esEstrenoSensible(contenido?.fechaEstreno);
  const motivo = motivoSpoiler(contenido?.fechaEstreno);
  const [revealed, setRevealed] = useState(false);
  const spoilerOn = sensible && !revealed;
  const blurCls = spoilerOn ? styles.blurred : "";

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

  // Initial comment count.
  useEffect(() => {
    let activo = true;
    const timer = setTimeout(() => {
      apiRequest(`/comentarios-calificacion/${id}`)
        .then((data) => activo && setCommentCount((data || []).length))
        .catch((error) => console.error("Error cargando conteo comentarios:", error));
    }, 500);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [id]);

  // Content detail (for spoiler date + modal synopsis). Cached per idContenido.
  useEffect(() => {
    if (!idContenido) return undefined;
    let activo = true;
    obtenerContenido(idContenido)
      .then((data) => activo && setContenido(data))
      .catch((error) => console.error("Error cargando contenido:", error));
    return () => {
      activo = false;
    };
  }, [idContenido]);

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

  useComentariosSocket(id, (nuevoComentario) => {
    setComentarios((prev) => {
      const existe = nuevoComentario.idComentario
        ? prev.some((cm) => cm.idComentario === nuevoComentario.idComentario)
        : prev.some((cm) => cm.text === nuevoComentario.texto && cm.user === nuevoComentario.username);

      if (existe) return prev;

      return [...prev, {
        idComentario: nuevoComentario.idComentario,
        user: nuevoComentario.username,
        text: nuevoComentario.texto,
        time: "ahora mismo",
        iconoPerfil: nuevoComentario.iconoPerfil,
      }];
    });
    setCommentCount((prev) => prev + 1);
  });


  async function cargarComentarios() {
    try {
      const data = await apiRequest(`/comentarios-calificacion/${id}`);
      setComentarios(
        (data || []).map((cm) => ({
          idComentario: cm.idComentario,
          user: cm.username || cm.nombreUsuario || "Usuario",
          text: cm.texto,
          time: cm.fechaComentario ? soloFecha(cm.fechaComentario) : "ahora mismo",
          iconoPerfil: cm.iconoPerfil,
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

    const nuevoComentario = {
      user: currentUser?.username || currentUser?.nombreUsuario || "Usuario",
      text,
      time: "ahora mismo",
      iconoPerfil: currentUser?.iconoPerfil,
    };
    setComentarios((prev) => [...prev, nuevoComentario]);
    setCommentCount((prev) => prev + 1);
    setCommentInput("");

    try {
      await apiRequest("/comentarios-calificacion", {
        method: "POST",
        body: JSON.stringify({ idCalificacion: id, idUsuario, texto: text }),
      });
      await cargarComentarios();
    } catch (error) {
      console.error("Error agregando comentario:", error);
      setComentarios((prev) => prev.filter((cm) => cm !== nuevoComentario));
      setCommentCount((prev) => prev - 1);
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
    : { background: POSTER_FALLBACK };

  // Shape content detail into what FilmModal expects.
  function construirFilm(detalle) {
    return {
      title: titulo,
      tags: [tipo],
      posterUrl: c.posterUrl || detalle?.posterUrl || null,
      grad: POSTER_FALLBACK,
      year: detalle?.anioEstreno,
      desc: detalle?.descripcion || c.comentario,
    };
  }

  // Open the film-detail modal. The content is normally already cached from the
  // on-mount fetch, so this is instant; otherwise we fetch (showing a spinner).
  function openFilm() {
    if (contenido) {
      setModalFilm(construirFilm(contenido));
      return;
    }
    if (loadingFilm || !idContenido) return;
    setLoadingFilm(true);
    setFilmError("");
    obtenerContenido(idContenido)
      .then((data) => {
        setContenido(data);
        setModalFilm(construirFilm(data));
      })
      .catch((error) => {
        console.error("Error cargando detalle del contenido:", error);
        setFilmError("No se pudo cargar el detalle.");
      })
      .finally(() => setLoadingFilm(false));
  }

  return (
    <div className={styles.card}>
      {/* Re-hide control, shown once a spoiler post has been revealed */}
      {sensible && revealed && (
        <button
          className={styles.spoilerHide}
          onClick={() => setRevealed(false)}
          aria-label="Volver a ocultar el spoiler"
        >
          <i className="bi bi-eye-slash"></i> Ocultar
        </button>
      )}

      {/* Header: who posted + when (kept crisp above the spoiler overlay) */}
      <div className={`${styles.head} ${spoilerOn ? styles.lifted : ""}`}>
        <img
          className={styles.avatar}
          src={avatarPorIcono(c.iconoPerfil || 1)}
          alt={username}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = avatarPorIcono(1);
          }}
        />
        <div className={styles.headText}>
          <span className={styles.username}>{username}</span>
          <span className={styles.timestamp}>{fecha}</span>
        </div>
        <div className={styles.headSpacer} />
      </div>

      {/* Body: poster (with rating badge + add-to-list) + film info & review.
          The poster stays crisp so people can see what the spoiler is about. */}
      <div className={styles.body}>
        <div className={`${styles.posterCol} ${spoilerOn ? styles.lifted : ""}`}>
          <div
            className={styles.posterWrap}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de ${titulo}`}
            aria-busy={loadingFilm}
            onClick={openFilm}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilm();
              }
            }}
          >
            <div className={styles.poster} style={posterStyle}>
              {c.posterUrl ? "" : titulo}
            </div>
            {puntaje > 0 && (
              <div className={styles.ratingBadge}>
                <i className="bi bi-star-fill"></i>
                {puntaje}
              </div>
            )}
            {loadingFilm && (
              <div className={styles.posterLoading}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
            )}
          </div>
          <AddToList options={POST_LIST_OPTIONS} wrapClassName={styles.posterListWrap} />
          {filmError && <div className={styles.filmError}>{filmError}</div>}
        </div>

        <div className={`${styles.content} ${blurCls}`}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{titulo}</div>
            <span className={`tag ${tagClass(tipo)}`}>{tipo}</span>
          </div>

          {puntaje > 0 && <Estrellas puntaje={puntaje} />}

          <p className={styles.review}>{c.comentario || ""}</p>
        </div>
      </div>

      {/* Footer: comment toggle + like / dislike */}
      <div className={`${styles.footer} ${blurCls}`}>
        <button className={styles.commentToggle} onClick={toggleComments}>
          <img src={img.hamstercomment} alt="Comentar" width="36" />
          <span>
            {commentCount} comentario{commentCount !== 1 ? "s" : ""}
          </span>
        </button>

        <div className={styles.actions}>
          <button
            className={likes.tipoUsuario === "LIKE" ? styles.active : ""}
            onClick={() => toggleLike("LIKE")}
          >
            <img src={img.postlike} alt="Me gustó" className={styles.glowImage} />
            <span>{likes.totalLikes}</span>
          </button>

          <button
            className={likes.tipoUsuario === "DISLIKE" ? styles.active : ""}
            onClick={() => toggleLike("DISLIKE")}
          >
            <img src={img.postdislike} alt="No me gustó" className={styles.glowImage} />
            <span>{likes.totalDislikes}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className={`${styles.commentSection} ${commentsOpen ? styles.open : ""} ${blurCls}`}>
        <div className={styles.commentList}>
          {comentarios.map((cm, i) => (
            <div className={styles.comment} key={i}>
              <img
                className={styles.cAvatar}
                src={avatarPorIcono(cm.iconoPerfil || 1)}
                alt={cm.user}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarPorIcono(1);
                }}
              />
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

      {/* Spoiler overlay: dims the blurred post and offers a reveal button. */}
      {spoilerOn && (
        <div className={styles.spoilerOverlay}>
          <i className={`bi bi-eye-slash-fill ${styles.spoilerIcon}`}></i>
          <div className={styles.spoilerTitle}>Posible spoiler</div>
          <div className={styles.spoilerSub}>
            {motivo === "futuro"
              ? "Sobre un estreno que aún no se estrena"
              : "Sobre un estreno de hace menos de 21 días"}
          </div>
          <button
            type="button"
            className={styles.spoilerReveal}
            onClick={() => setRevealed(true)}
          >
            <i className="bi bi-eye"></i> Mostrar de todos modos
          </button>
        </div>
      )}

      {/* Film-detail modal, opened by clicking the poster */}
      <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
    </div>
  );
}
