import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { recomendarParaUsuario } from "../../api/recomendacionesApi.js";
import {
  normalizarRecomendacion,
  eliminarDuplicados,
  formatearMotivo,
  filtrarRecomendaciones,
  recToFilm,
} from "../../lib/recomendaciones.js";
import FilmModal from "../../components/FilmModal/FilmModal.jsx";
import img from "../../assets/images.js";
import styles from "./Recommendations.module.css";

const ITEMS_POR_PAGINA = 12;

const GENEROS = [
  "Acción", "Aventura", "Animación", "Anime", "Biopic", "Comedia", "Crimen",
  "Deporte", "Documental", "Drama", "Familia", "Fantasía", "Film-Noir",
  "Historia", "Música", "Musical", "Misterio", "Reality TV", "Romance",
  "Sci-Fi", "Terror", "Videojuegos", "Guerra", "Western",
];

const IDIOMAS = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "ja", label: "Japonés" },
  { value: "ko", label: "Coreano" },
  { value: "pt", label: "Portugués" },
  { value: "hi", label: "Indio" },
];

export default function Recommendations() {
  const { usuario } = useAuth();
  const idUsuario = usuario?.idUsuario || usuario?.id;

  const [recomendaciones, setRecomendaciones] = useState([]);
  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [pagina, setPagina] = useState(1);
  const [modalFilm, setModalFilm] = useState(null);

  const [search, setSearch] = useState("");
  const [orden, setOrden] = useState("reciente");
  const [tipo, setTipo] = useState("");
  const [genero, setGenero] = useState("");
  const [puntuacion, setPuntuacion] = useState("");
  const [anio, setAnio] = useState("");
  const [idioma, setIdioma] = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setEstado("loading");
    recomendarParaUsuario(idUsuario, 30)
      .then((data) => {
        setRecomendaciones(eliminarDuplicados(data.map(normalizarRecomendacion)));
        setEstado("ok");
        setPagina(1);
      })
      .catch((error) => {
        console.error("Error cargando recomendaciones:", error);
        setEstado("error");
      });
  }, [idUsuario]);

  const anios = useMemo(
    () =>
      [...new Set(recomendaciones.map((r) => r.anioEstreno).filter(Boolean))].sort(
        (a, b) => b - a
      ),
    [recomendaciones]
  );

  const filtradas = useMemo(
    () =>
      filtrarRecomendaciones(recomendaciones, {
        search,
        tipo,
        genero,
        puntuacion,
        anio,
        orden,
      }).filter((item) => !idioma || item.idioma === idioma),
    [recomendaciones, search, tipo, genero, puntuacion, anio, idioma, orden]
  );

  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA);
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const paginaItems = filtradas.slice(inicio, inicio + ITEMS_POR_PAGINA);

  function resetFilters() {
    setSearch("");
    setTipo("");
    setGenero("");
    setPuntuacion("");
    setAnio("");
    setIdioma("");
    setOrden("reciente");
    setPagina(1);
  }

  function cambiarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirModal(item) {
    setModalFilm(recToFilm(item));
  }

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPagina(1);
  };

  return (
    <main className={styles.recPage}>
      <div className={styles.recHeader}>
        <div>
          <h1 className={styles.recTitle}>
            <img src={img.recommend} alt="Homiewood recomendaciones" width="150" />
            Recomendaciones
          </h1>
          <p className={styles.recSubtitle}>
            Descubre recomendaciones según tus gustos y actividad en Homiewood
          </p>
        </div>
        <div>
          <span className={styles.recCount}>{filtradas.length} títulos</span>
        </div>
      </div>

      <div className={styles.recSearchWrap}>
        <i className={`bi bi-search ${styles.recSearchIcon}`}></i>
        <input
          type="text"
          className={styles.recSearchInput}
          placeholder="Buscar por título..."
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagina(1);
          }}
        />
        <button
          type="button"
          className={`${styles.recSearchClear} ${search.trim() ? styles.visible : ""}`}
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setSearch("");
            setPagina(1);
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Orden</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={orden} onChange={onFilterChange(setOrden)}>
              <option value="reciente">Reciente a Antiguo</option>
              <option value="antiguo">Antiguo a Reciente</option>
              <option value="az">Alfabético A–Z</option>
              <option value="za">Alfabético Z–A</option>
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tipo</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={tipo} onChange={onFilterChange(setTipo)}>
              <option value="">Todos</option>
              <option value="Película">Película</option>
              <option value="Serie">Serie</option>
              <option value="Anime">Anime</option>
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Género</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={genero} onChange={onFilterChange(setGenero)}>
              <option value="">Todos</option>
              {GENEROS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Puntuación</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={puntuacion} onChange={onFilterChange(setPuntuacion)}>
              <option value="">Todas</option>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4+)</option>
              <option value="3">★★★☆☆ (3+)</option>
              <option value="2">★★☆☆☆ (2+)</option>
              <option value="1">★☆☆☆☆ (1+)</option>
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Año</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={anio} onChange={onFilterChange(setAnio)}>
              <option value="">Todos</option>
              {anios.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Idioma</label>
          <div className={styles.filterSelectWrap}>
            <select className={styles.filterSelect} value={idioma} onChange={onFilterChange(setIdioma)}>
              <option value="">Todos</option>
              {IDIOMAS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>

        <button type="button" className={styles.filtersReset} onClick={resetFilters}>
          <i className="bi bi-x-circle"></i>
          <span>Limpiar</span>
        </button>
      </div>

      {estado === "loading" ? (
        <div className={styles.recGrid}>
          <p className={styles.recLoading}>Cargando recomendaciones...</p>
        </div>
      ) : estado === "error" ? (
        <div className={`${styles.recEmpty} ${styles.visible}`}>
          <i className="bi bi-exclamation-triangle"></i>
          <p>No se pudieron cargar las recomendaciones.</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={`${styles.recEmpty} ${styles.visible}`}>
          <i className="bi bi-film"></i>
          <p>No se encontraron títulos con esos filtros.</p>
          <button type="button" className={styles.filtersReset} onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={styles.recGrid}>
            {paginaItems.map((item, index) => (
              <article key={index} className={styles.recCard} onClick={() => abrirModal(item)}>
                <div className={styles.recCardPoster}>
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.titulo} />
                  ) : (
                    <div className={styles.recCardPlaceholder}>{item.titulo}</div>
                  )}
                  <div className={styles.recRating}>
                    <i className="bi bi-star-fill"></i>
                    {item.promedioCalificaciones
                      ? Number(item.promedioCalificaciones).toFixed(1)
                      : "0.0"}
                  </div>
                </div>
                <div className={styles.recCardInfo}>
                  <h3>{item.titulo}</h3>
                  <p>
                    {item.tipoVisual}
                    {item.anioEstreno ? ` · ${item.anioEstreno}` : ""}
                  </p>
                  <div className={styles.recCardTags}>
                    <span className={styles.recTag}>{formatearMotivo(item.motivo)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPaginas > 1 && (
            <nav className={styles.paginationWrap} aria-label="Paginación">
              <button
                type="button"
                className={styles.pageBtn}
                aria-label="Página anterior"
                disabled={pagina <= 1}
                onClick={() => cambiarPagina(pagina - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.pageBtn} ${n === pagina ? styles.active : ""}`}
                    onClick={() => cambiarPagina(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.pageBtn}
                aria-label="Página siguiente"
                disabled={pagina >= totalPaginas}
                onClick={() => cambiarPagina(pagina + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </nav>
          )}
        </>
      )}

      <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
    </main>
  );
}
