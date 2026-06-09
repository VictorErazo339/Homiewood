import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCalificacionesSocket } from "../../lib/websocket.js";
import Composer from "../../components/Composer/Composer.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import FilmModal from "../../components/FilmModal/FilmModal.jsx";
import styles from "./Home.module.css";

const POSTS_PER_PAGE = 10;

// The backend already filters out empty comments, but we keep this as a guard
// in case the endpoint ever returns plain ratings.
function esPublicacion(c) {
  return c.comentario && String(c.comentario).trim().length > 0;
}

export default function Home() {
  const { usuario } = useAuth();
  const idUsuario = usuario?.idUsuario || usuario?.id || null;

  const [posts, setPosts] = useState([]);
  const [modalFilm, setModalFilm] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [cargaInicial, setCargaInicial] = useState(true);

  // Mutable refs let the scroll observer read fresh paging state without
  // re-subscribing on every render.
  const paginaRef = useRef(0);
  const cargandoRef = useRef(false);
  const hayMasRef = useRef(true);
  const sentinelRef = useRef(null);

  const cargarMas = useCallback(
    async (reset = false) => {
      if (!idUsuario || cargandoRef.current) return;
      if (!reset && !hayMasRef.current) return;

      if (reset) {
        paginaRef.current = 0;
        hayMasRef.current = true;
        setHayMas(true);
        setCargaInicial(true);
      }

      cargandoRef.current = true;
      setCargando(true);

      try {
        const data = await apiRequest(
          `/calificaciones/feed/${idUsuario}?page=${paginaRef.current}&limite=${POSTS_PER_PAGE}`
        );
        // Server returns newest-first, so no reverse() needed.
        const nuevos = (Array.isArray(data) ? data : []).filter(esPublicacion);

        if (nuevos.length < POSTS_PER_PAGE) {
          hayMasRef.current = false;
          setHayMas(false);
        }

        setPosts((prev) => {
          if (reset) return nuevos;
          // De-dupe in case a live socket reload overlapped a page fetch.
          const vistos = new Set(prev.map((c) => c.idCalificacion));
          return [...prev, ...nuevos.filter((c) => !vistos.has(c.idCalificacion))];
        });

        paginaRef.current += 1;
      } catch (error) {
        console.error("Error cargando feed:", error);
        if (reset) {
          hayMasRef.current = false;
          setHayMas(false);
        }
      } finally {
        cargandoRef.current = false;
        setCargando(false);
        setCargaInicial(false);
      }
    },
    [idUsuario]
  );

  const recargar = useCallback(() => cargarMas(true), [cargarMas]);

  // (Re)load from the first page once the logged-in user is available.
  useEffect(() => {
    if (idUsuario) recargar();
  }, [idUsuario, recargar]);

  // Live updates: a new rating over the socket resets the feed to the top.
  useCalificacionesSocket(recargar);

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cargarMas(false);
      },
      { root: null, rootMargin: "300px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cargarMas]);

  const vacio = !cargaInicial && posts.length === 0;

  return (
    <>
      <div className={styles.mainRow}>
        <div className={styles.feedCol}>
          <Composer onPosted={recargar} />

          <div>
            {vacio ? (
              <p className={styles.feedEmpty}>
                Aún no hay publicaciones de tus homies.
              </p>
            ) : (
              posts.map((c) => (
                <PostCard
                  key={c.idCalificacion}
                  calificacion={c}
                  currentUser={usuario}
                />
              ))
            )}
          </div>

          {/* Infinite-scroll sentinel + status row */}
          <div ref={sentinelRef} aria-hidden="true" />
          {cargando && <p className={styles.feedStatus}>Cargando publicaciones…</p>}
          {!hayMas && posts.length > 0 && (
            <p className={styles.feedStatus}>No hay más publicaciones por ahora.</p>
          )}
        </div>

        <Sidebar onOpenFilm={setModalFilm} />
      </div>

      <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
    </>
  );
}
