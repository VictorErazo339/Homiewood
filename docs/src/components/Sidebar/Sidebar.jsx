import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLayout } from "../Layout/LayoutContext.js";
import { recomendarParaUsuario } from "../../api/recomendacionesApi.js";
import styles from "./Sidebar.module.css";

// Static "Cartelera" covers, carried over verbatim from the legacy home markup.
const CARTELERA = [
  {
    title: "Devil Wears Prada 2",
    director: "David Frankel",
    year: "2025",
    tags: ["Película", "Drama"],
    cast: "Meryl Streep, Anne Hathaway, Emily Blunt",
    desc: "La secuela esperada del clásico de moda.",
    grad: "linear-gradient(135deg,#1a0050,#c050a0)",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZmM3ZDU3ODItZmY5Yi00OTQ2LWE5OTctZTA5NDBhMWJkOGY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  },
  {
    title: "Michael",
    director: "Antoine Fuqua",
    year: "2025",
    tags: ["Película", "Drama"],
    cast: "Jaafar Jackson, Nia Long, Colman Domingo",
    desc: "Biopic sobre la vida del rey del pop Michael Jackson.",
    grad: "linear-gradient(135deg,#0a0a0a,#1a1a3a)",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNzllNmRlN2EtMDQyOC00ODJjLTg4OWQtZDNmNGU3YzlkNjc1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  },
  {
    title: "Toy Story 5",
    director: "Andrew Stanton",
    year: "2026",
    tags: ["Película", "Aventura"],
    cast: "Tom Hanks, Tim Allen, Annie Potts",
    desc: "Woody, Buzz y el resto de los juguetes regresan.",
    grad: "linear-gradient(135deg,#000820,#1a4080)",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZTI1YTBiNmEtYWUxZi00YzFkLWIzNjMtMmZjMmY2NzM0ZWMzXkEyXkFqcGc@._V1_.jpg",
  },
];

function recToFilm(item) {
  return {
    title: item.titulo,
    director: "",
    year: item.anioEstreno || "",
    tags: [item.tipoContenido || "Contenido"],
    cast: "",
    desc: item.motivo || "Recomendado para ti",
    grad: "linear-gradient(135deg,#1a1a2e,#0a0a0a)",
    posterUrl: item.posterUrl || null,
  };
}

// Recommendations rail (desktop) + slide-in drawer (mobile). Used by Home and
// Trending. `onOpenFilm` opens the shared FilmModal.
export default function Sidebar({ onOpenFilm }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { sidebarOpen, setSidebarOpen, setHasSidebar } = useLayout();

  // recs: undefined = loading, null = error, [] = empty, [...] = data
  const [recs, setRecs] = useState(undefined);

  useEffect(() => {
    setHasSidebar(true);
    return () => setHasSidebar(false);
  }, [setHasSidebar]);

  useEffect(() => {
    const idUsuario = usuario?.idUsuario || usuario?.id;
    if (!idUsuario) return;
    let activo = true;
    recomendarParaUsuario(idUsuario, 4)
      .then((data) => activo && setRecs(data || []))
      .catch(() => activo && setRecs(null));
    return () => {
      activo = false;
    };
  }, [usuario]);

  function renderRecs() {
    if (recs === undefined) {
      return (
        <p className={styles.recommendationsLoading}>
          Cargando recomendaciones...
        </p>
      );
    }
    if (recs === null) {
      return (
        <p className={styles.recommendationsLoading}>
          No se pudieron cargar las recomendaciones.
        </p>
      );
    }
    if (recs.length === 0) {
      return (
        <p className={styles.recommendationsLoading}>
          Agrega películas a tus listas para recibir recomendaciones.
        </p>
      );
    }
    return recs.map((item, i) => (
      <div className="col-6" key={i}>
        <div
          className="cover cover-clickable"
          onClick={() => onOpenFilm(recToFilm(item))}
        >
          {item.posterUrl ? (
            <img src={item.posterUrl} alt={item.titulo} width="130" />
          ) : (
            <span>{item.titulo}</span>
          )}
        </div>
      </div>
    ));
  }

  const content = (
    <>
      <div className={styles.sidebarHeader}>
        <span>RECOMENDACIONES PARA TI</span>
        <button
          className={styles.btnVerTodas}
          onClick={() => navigate("/recommendations")}
        >
          Ver todas
        </button>
      </div>

      <div className="row g-2 mb-3">{renderRecs()}</div>

      <div className={styles.sidebarHeader}>
        <span>CARTELERA</span>
        <button
          className={styles.btnVerTodas}
          onClick={() => navigate("/recommendations?section=lanzamientos")}
        >
          Ver todas
        </button>
      </div>

      <div className="row g-2">
        {CARTELERA.map((c, i) => (
          <div className="col-4" key={i}>
            <div
              className="cover cover-clickable"
              onClick={() => onOpenFilm(c)}
            >
              <img src={c.posterUrl} alt={c.title} width="80" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      <aside className={styles.sidebarCol} aria-label="Recomendaciones">
        <div className={styles.sidebar}>{content}</div>
      </aside>

      <div
        className={`${styles.sidebarDrawer} ${sidebarOpen ? styles.open : ""}`}
        aria-hidden={!sidebarOpen}
      >
        <div className={styles.sidebarDrawerInner}>
          <button
            className={styles.sidebarDrawerClose}
            aria-label="Cerrar recomendaciones"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
          {content}
        </div>
      </div>

      <div
        className={`${styles.sidebarDrawerOverlay} ${
          sidebarOpen ? styles.open : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
    </>
  );
}
