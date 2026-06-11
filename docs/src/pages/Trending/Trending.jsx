import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCalificacionesSocket } from "../../lib/websocket.js";
import Composer from "../../components/Composer/Composer.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import FilmModal from "../../components/FilmModal/FilmModal.jsx";
import styles from "../Home/Home.module.css";

const POSTS_PER_PAGE = 10;

function esPublicacion(c) {
  return c.comentario && String(c.comentario).trim().length > 0;
}

export default function Trending() {
  const { usuario } = useAuth();

  const [posts, setPosts] = useState([]);
  const [modalFilm, setModalFilm] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [cargaInicial, setCargaInicial] = useState(true);

  const paginaRef = useRef(0);
  const cargandoRef = useRef(false);
  const hayMasRef = useRef(true);
  const sentinelRef = useRef(null);

  const cargarMas = useCallback(async (reset = false) => {
    if (cargandoRef.current) return;
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
        `/calificaciones?page=${paginaRef.current}&limite=${POSTS_PER_PAGE}`
      );
      const nuevos = (Array.isArray(data) ? data : []).filter(esPublicacion);

      if (nuevos.length < POSTS_PER_PAGE) {
        hayMasRef.current = false;
        setHayMas(false);
      }

      setPosts((prev) => {
        if (reset) return nuevos;
        const vistos = new Set(prev.map((c) => c.idCalificacion));
        return [...prev, ...nuevos.filter((c) => !vistos.has(c.idCalificacion))];
      });

      paginaRef.current += 1;
    } catch (error) {
      console.error("Error cargando trending:", error);
      if (reset) {
        hayMasRef.current = false;
        setHayMas(false);
      }
    } finally {
      cargandoRef.current = false;
      setCargando(false);
      setCargaInicial(false);
    }
  }, []);

  useEffect(() => {
    cargarMas(true);
  }, [cargarMas]);

  // Live updates via WebSocket
  useCalificacionesSocket(useCallback(async (nuevaCalificacion) => {
    if (!esPublicacion(nuevaCalificacion)) return;
    try {
      const postCompleto = await apiRequest(`/calificaciones/${nuevaCalificacion.idCalificacion}`);
      setPosts((prev) => {
        const existe = prev.some((c) => c.idCalificacion === postCompleto.idCalificacion);
        if (existe) return prev.map((c) =>
          c.idCalificacion === postCompleto.idCalificacion ? postCompleto : c
        );
        return [postCompleto, ...prev];
      });
    } catch {
      setPosts((prev) => {
        const vistos = new Set(prev.map((c) => c.idCalificacion));
        if (vistos.has(nuevaCalificacion.idCalificacion)) return prev;
        return [nuevaCalificacion, ...prev];
      });
    }
  }, []));

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) cargarMas(false); },
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
          <Composer onPosted={null} />
          <div>
            {vacio ? (
              <p className={styles.feedEmpty}>No hay publicaciones aún.</p>
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