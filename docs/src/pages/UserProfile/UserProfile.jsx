import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/api.js";
import {
  buscarUsuarioPorUsername,
  obtenerResumenSeguimiento,
  seguirUsuario,
  dejarDeSeguir,
} from "../../api/usuariosApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { obtenerIndicePortada, obtenerProfileTheme, prefsDesdeUsuario } from "../../lib/profileTheme.js";
import { soloFecha } from "../../lib/format.js";
import ProfileBanner from "../../components/profile/ProfileBanner.jsx";
import ProfileHero from "../../components/profile/ProfileHero.jsx";
import styles from "../Profile/Profile.module.css";

function estrellas(puntaje) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= puntaje ? "★" : "☆";
  return s;
}

function esPublicacion(c) {
  return c.comentario && String(c.comentario).trim().length > 0;
}

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { theme } = useTheme();
  const miId = usuario?.idUsuario || usuario?.id;

  const [estado, setEstado] = useState("loading"); // loading | ok | notfound
  const [perfil, setPerfil] = useState(null);
  const [posts, setPosts] = useState([]);
  const [top5, setTop5] = useState([null, null, null, null, null]);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [loSigo, setLoSigo] = useState(false);
  const [guardandoFollow, setGuardandoFollow] = useState(false);

  const cargarTop5 = useCallback(async (idUsuario) => {
    try {
      const data = await apiRequest(
        `/usuarios/${idUsuario}/listas/contenidos?estado=FAVORITO`
      );
      const arr = [null, null, null, null, null];
      data.forEach((item) => {
        const pos = item.posicion ? item.posicion - 1 : null;
        if (pos !== null && pos >= 0 && pos < 5) {
          arr[pos] = {
            titulo: item.tituloContenido,
            posterUrl: item.posterUrl,
            anioEstreno: item.anioEstreno,
            tipoContenido: item.tipoContenido,
          };
        }
      });
      setTop5(arr);
    } catch (error) {
      console.error("Error cargando Top 5:", error);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    setEstado("loading");

    (async () => {
      try {
        const u = await buscarUsuarioPorUsername(username);
        if (!activo) return;

        // Viewing your own profile → use the editable own-profile page.
        const esMiPerfil =
          (u.idUsuario && u.idUsuario === miId) ||
          (u.username &&
            usuario?.username &&
            u.username.toLowerCase() === usuario.username.toLowerCase());
        if (esMiPerfil) {
          navigate("/profile", { replace: true });
          return;
        }

        setPerfil(u);
        setEstado("ok");

        const resumen = await obtenerResumenSeguimiento(u.idUsuario, miId);
        if (!activo) return;
        setSeguidores(resumen.seguidores ?? 0);
        setSiguiendo(resumen.siguiendo ?? 0);
        setLoSigo(!!resumen.loSigo);

        // Private profiles only expose posts/Top 5 to followers.
        if (!u.perfilPrivado || resumen.loSigo) {
          const cal = await apiRequest(`/calificaciones/usuario/${u.idUsuario}`);
          if (!activo) return;
          setPosts(cal.filter(esPublicacion).slice().reverse());
          cargarTop5(u.idUsuario);
        } else {
          setPosts([]);
          setTop5([null, null, null, null, null]);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        if (activo) setEstado("notfound");
      }
    })();

    return () => {
      activo = false;
    };
  }, [username, miId, usuario?.username, navigate, cargarTop5]);

  async function toggleFollow() {
    if (!perfil || !miId || guardandoFollow) return;
    setGuardandoFollow(true);
    try {
      if (loSigo) {
        await dejarDeSeguir(miId, perfil.idUsuario);
        setLoSigo(false);
        setSeguidores((n) => Math.max(0, n - 1));
      } else {
        await seguirUsuario(perfil.idUsuario, miId);
        setLoSigo(true);
        setSeguidores((n) => n + 1);
      }
    } catch (error) {
      console.error("Error actualizando seguimiento:", error);
      alert("No se pudo actualizar el seguimiento.");
    } finally {
      setGuardandoFollow(false);
    }
  }

  if (estado === "loading") {
    return (
      <main className={styles.profileContainer}>
        <p className={styles.emptyFeed}>Cargando perfil...</p>
      </main>
    );
  }

  if (estado === "notfound") {
    return (
      <main className={styles.profileContainer}>
        <p className={styles.emptyFeed}>No encontramos ese usuario.</p>
      </main>
    );
  }

  const privadoBloqueado = perfil?.perfilPrivado && !loSigo;
  const top5Vacio = top5.filter(Boolean).length === 0;
  const profilePrefs = prefsDesdeUsuario(perfil);
  const profileTheme = obtenerProfileTheme(profilePrefs.colorTheme, theme);
  const profileCoverIndex = obtenerIndicePortada(profilePrefs.coverMode);
  const profileCoverPoster = profileCoverIndex >= 0 ? top5[profileCoverIndex]?.posterUrl : null;

  return (
    <div
      className={styles.profileShell}
      style={profileTheme.vars}
      data-cover-mode={profilePrefs.coverMode}
      data-color-theme={profilePrefs.colorTheme}
    >
      <ProfileBanner posterUrl={profileCoverPoster} />

      <main className={styles.profileContainer}>
        <ProfileHero
          perfil={perfil}
          stats={{ posts: posts.length, seguidores, siguiendo }}
          actions={
            <button
              className={`${styles.followBtn} ${loSigo ? styles.isFollowing : ""}`}
              type="button"
              disabled={guardandoFollow}
              onClick={toggleFollow}
            >
              {loSigo ? "✓ Siguiendo" : "+ Seguir"}
            </button>
          }
        />

        {privadoBloqueado ? (
          <section className={styles.top5Section}>
            <p className={styles.emptyFeed}>
              🔒 Este perfil es privado. Síguelo para ver su contenido.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.top5Section} aria-label="Top 5">
              <div className={styles.top5TitleRow}>
                <h2 className={styles.sectionTitle}>
                  🎬 <span>TOP 5</span>
                </h2>
              </div>

              <div className={styles.top5Grid}>
                {top5Vacio ? (
                  <div className={styles.top5EmptyState}>
                    <p>Sin Top 5 todavía.</p>
                  </div>
                ) : (
                  top5.map((item, index) =>
                    item ? (
                      <article key={index} className={styles.movieCard}>
                        <span className={styles.top5Rank}>#{index + 1}</span>
                        {item.posterUrl ? (
                          <img
                            className={styles.moviePoster}
                            src={item.posterUrl}
                            alt={item.titulo}
                          />
                        ) : (
                          <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>
                            {item.titulo}
                          </div>
                        )}
                      </article>
                    ) : (
                      <article key={index} className={`${styles.movieCard} ${styles.movieCardEmpty}`}>
                        <span className={styles.top5Rank}>#{index + 1}</span>
                        <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>
                          Vacío
                        </div>
                      </article>
                    )
                  )
                )}
              </div>
            </section>

            <section className={styles.profileFeed} aria-label="Posts del usuario">
              {posts.length === 0 ? (
                <p className={styles.emptyFeed}>Este usuario aún no ha publicado nada.</p>
              ) : (
                posts.map((c) => {
                  const titulo =
                    c.tituloContenido || c.contenidoTitulo || c.titulo || "Contenido";
                  const tipo = c.tipoContenido || c.contenidoTipo || "Contenido";
                  const poster = c.posterUrl || c.contenidoPosterUrl || "";
                  const puntaje = Number(c.puntaje || 0);
                  return (
                    <article className={styles.postCard} key={c.idCalificacion}>
                      <div
                        className={styles.postCover}
                        style={
                          poster
                            ? { backgroundImage: `url('${poster}')` }
                            : { background: "linear-gradient(135deg,#2a1a4a,#5a2a8a)" }
                        }
                      ></div>
                      <div className={styles.postBody}>
                        <div className={styles.postMovieInfo}>
                          <span className={styles.postMovieTitle}>{titulo}</span>
                          <span className={styles.postMovieMeta}>{tipo}</span>
                        </div>
                        {puntaje > 0 && (
                          <div className={styles.postRating} aria-label={`${puntaje} de 5 estrellas`}>
                            {estrellas(puntaje)}
                          </div>
                        )}
                        <p className={styles.postText}>{c.comentario || ""}</p>
                        <div className={styles.postFooter}>
                          <span className={styles.postDate}>{soloFecha(c.fechaCalificacion)}</span>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
