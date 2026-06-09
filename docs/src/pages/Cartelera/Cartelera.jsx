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
import rstyles from "../Recommendations/Recommendations.module.css";
import cstyles from "./Cartelera.module.css";

const ITEMS_POR_PAGINA = 12;

const TABS = ["", "En cines", "Streaming", "Próximamente"];

const GENEROS = [
  "Acción", "Aventura", "Animación", "Anime", "Comedia", "Drama", "Sci-Fi",
  "Terror", "Familia", "Fantasía", "Thriller", "Crimen", "Documental",
];

const PLATAFORMAS = [
  { value: "netflix", label: "Netflix" },
  { value: "disney", label: "Disney+" },
  { value: "hbo", label: "HBO Max" },
  { value: "amazon", label: "Prime Video" },
  { value: "apple", label: "Apple TV+" },
  { value: "paramount", label: "Paramount+" },
  { value: "cines", label: "En Cines" },
];

export default function Cartelera() {
  const { usuario } = useAuth();
  const idUsuario = usuario?.idUsuario || usuario?.id;

  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState("loading");
  const [pagina, setPagina] = useState(1);
  const [modalFilm, setModalFilm] = useState(null);
  const [tab, setTab] = useState("");

  const [search, setSearch] = useState("");
  const [orden, setOrden] = useState("reciente");
  const [tipo, setTipo] = useState("");
  const [genero, setGenero] = useState("");
  const [puntuacion, setPuntuacion] = useState("");
  const [anio, setAnio] = useState("");
  const [plataforma, setPlataforma] = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setEstado("loading");
    recomendarParaUsuario(idUsuario, 40)
      .then((data) => {
        setItems(eliminarDuplicados(data.map(normalizarRecomendacion)));
        setEstado("ok");
        setPagina(1);
      })
      .catch((error) => {
        console.error("Error cargando cartelera:", error);
        setEstado("error");
      });
  }, [idUsuario]);

  const anios = useMemo(
    () =>
      [...new Set(items.map((r) => r.anioEstreno).filter(Boolean))].sort((a, b) => b - a),
    [items]
  );

  const filtradas = useMemo(
    () => filtrarRecomendaciones(items, { search, tipo, genero, puntuacion, anio, orden }),
    [items, search, tipo, genero, puntuacion, anio, orden]
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
    setPlataforma("");
    setOrden("reciente");
    setPagina(1);
  }

  function cambiarPagina(n) {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPagina(1);
  };

  return (
    <main className={rstyles.recPage}>
      {/* HERO */}
      <div className={cstyles.carteleraHero}>
        <div className={cstyles.carteleraHeroBg}></div>
        <div className={cstyles.heroDeco} aria-hidden="true">
          <i className="bi bi-camera-reels-fill"></i>
          <i className="bi bi-film"></i>
        </div>
        <div className={cstyles.carteleraHeroContent}>
          <p className={cstyles.carteleraHeroLabel}>Homiewood</p>
          <h1 className={cstyles.carteleraHeroTitle}>Cartelera</h1>
          <p className={cstyles.carteleraHeroSub}>
            Lo que está en cines y plataformas ahora mismo
          </p>
        </div>
      </div>

      <div className={rstyles.recHeader}>
        <div>
          <div className={cstyles.carteleraTabs} role="tablist">
            {TABS.map((t) => (
              <button
                key={t || "todo"}
                className={`${cstyles.carteleraTab} ${tab === t ? cstyles.active : ""}`}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t || "Todo"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={rstyles.recCount}>{filtradas.length} títulos</span>
        </div>
      </div>

      <div className={rstyles.recSearchWrap}>
        <i className={`bi bi-search ${rstyles.recSearchIcon}`}></i>
        <input
          type="text"
          className={rstyles.recSearchInput}
          placeholder="Buscar por título, actor o director..."
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagina(1);
          }}
        />
        <button
          type="button"
          className={`${rstyles.recSearchClear} ${search.trim() ? rstyles.visible : ""}`}
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setSearch("");
            setPagina(1);
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className={rstyles.filtersBar}>
        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Orden</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={orden} onChange={onFilterChange(setOrden)}>
              <option value="reciente">Reciente a Antiguo</option>
              <option value="antiguo">Antiguo a Reciente</option>
              <option value="az">Alfabético A–Z</option>
              <option value="za">Alfabético Z–A</option>
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Tipo</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={tipo} onChange={onFilterChange(setTipo)}>
              <option value="">Todos</option>
              <option value="Película">Película</option>
              <option value="Serie">Serie</option>
              <option value="Anime">Anime</option>
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Género</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={genero} onChange={onFilterChange(setGenero)}>
              <option value="">Todos</option>
              {GENEROS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Puntuación</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={puntuacion} onChange={onFilterChange(setPuntuacion)}>
              <option value="">Todas</option>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4+)</option>
              <option value="3">★★★☆☆ (3+)</option>
              <option value="2">★★☆☆☆ (2+)</option>
              <option value="1">★☆☆☆☆ (1+)</option>
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Año</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={anio} onChange={onFilterChange(setAnio)}>
              <option value="">Todos</option>
              {anios.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <div className={rstyles.filterGroup}>
          <label className={rstyles.filterLabel}>Plataforma</label>
          <div className={rstyles.filterSelectWrap}>
            <select className={rstyles.filterSelect} value={plataforma} onChange={onFilterChange(setPlataforma)}>
              <option value="">Todas</option>
              {PLATAFORMAS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <i className={`bi bi-chevron-down ${rstyles.filterChevron}`}></i>
          </div>
        </div>

        <button type="button" className={rstyles.filtersReset} onClick={resetFilters}>
          <i className="bi bi-x-circle"></i>
          <span>Limpiar</span>
        </button>
      </div>

      {estado === "loading" ? (
        <div className={rstyles.recGrid}>
          <p className={rstyles.recLoading}>Cargando cartelera...</p>
        </div>
      ) : estado === "error" ? (
        <div className={`${rstyles.recEmpty} ${rstyles.visible}`}>
          <i className="bi bi-exclamation-triangle"></i>
          <p>No se pudo cargar la cartelera.</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={`${rstyles.recEmpty} ${rstyles.visible}`}>
          <i className="bi bi-camera-reels"></i>
          <p>No se encontraron títulos con esos filtros.</p>
          <button type="button" className={rstyles.filtersReset} onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={rstyles.recGrid}>
            {paginaItems.map((item, index) => (
              <article key={index} className={rstyles.recCard} onClick={() => setModalFilm(recToFilm(item))}>
                <div className={rstyles.recCardPoster}>
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.titulo} />
                  ) : (
                    <div className={rstyles.recCardPlaceholder}>{item.titulo}</div>
                  )}
                  <div className={rstyles.recRating}>
                    <i className="bi bi-star-fill"></i>
                    {item.promedioCalificaciones
                      ? Number(item.promedioCalificaciones).toFixed(1)
                      : "0.0"}
                  </div>
                </div>
                <div className={rstyles.recCardInfo}>
                  <h3>{item.titulo}</h3>
                  <p>
                    {item.tipoVisual}
                    {item.anioEstreno ? ` · ${item.anioEstreno}` : ""}
                  </p>
                  <div className={rstyles.recCardTags}>
                    <span className={rstyles.recTag}>{formatearMotivo(item.motivo)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPaginas > 1 && (
            <nav className={rstyles.paginationWrap} aria-label="Paginación">
              <button
                type="button"
                className={rstyles.pageBtn}
                aria-label="Página anterior"
                disabled={pagina <= 1}
                onClick={() => cambiarPagina(pagina - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className={rstyles.pageNumbers}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${rstyles.pageBtn} ${n === pagina ? rstyles.active : ""}`}
                    onClick={() => cambiarPagina(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={rstyles.pageBtn}
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
