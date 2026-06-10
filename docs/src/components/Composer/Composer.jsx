import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  buscarTmdb,
  buscarAnime,
  guardarContenidoExterno,
} from "../../api/catalogoApi.js";
import { apiRequest } from "../../api/api.js";
import { tagClass, normalizarTipoBackend } from "../../lib/format.js";
import { esEstrenoSensible, motivoSpoiler } from "../../lib/spoiler.js";
import StarRating from "../StarRating/StarRating.jsx";
import styles from "./Composer.module.css";

// Collapsible post composer (Home/Trending/Profile). Searches TMDB + anime,
// lets the user rate and write, then POSTs a calificación.
export default function Composer({ onPosted }) {
  const { usuario } = useAuth();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingDisplay, setRatingDisplay] = useState(0);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef(null);
  const searchWrapRef = useRef(null);

  // Debounced search across TMDB and anime (400ms, like the legacy).
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const [tmdb, anime] = await Promise.allSettled([
          buscarTmdb(q),
          buscarAnime(q),
        ]);
        const r = [
          ...(tmdb.status === "fulfilled" ? tmdb.value : []),
          ...(anime.status === "fulfilled" ? anime.value : []),
        ];
        setResults(r);
        setDropdownOpen(r.length > 0);
      } catch (error) {
        console.error("Error buscando:", error);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close the results dropdown when clicking outside the search wrap.
  useEffect(() => {
    if (!dropdownOpen) return;
    function onDoc(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropdownOpen]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) setTimeout(() => inputRef.current?.focus(), 350);
      return next;
    });
  }

  function selectFilm(f) {
    const tipo = normalizarTipoBackend(f.tipoContenido);
    setSelectedFilm({
      title: f.titulo,
      type: tipo,
      tags: [tipo],
      posterUrl: f.posterUrl || null,
      apiId: f.apiId,
      proveedor: f.proveedor,
      generos: f.generos || [],
      fechaEstreno: f.fechaEstreno || null,
    });
    setQuery("");
    setResults([]);
    setDropdownOpen(false);
  }

  function removeFilm() {
    setSelectedFilm(null);
    setRating(0);
    setRatingDisplay(0);
  }

  const canPost =
    !!selectedFilm && postText.trim().length > 0 && rating > 0 && !submitting;

  async function handlePost() {
    if (!canPost) return;
    setSubmitting(true);
    try {
      const contenido = await guardarContenidoExterno({
        proveedor: selectedFilm.proveedor,
        apiId: selectedFilm.apiId,
        titulo: selectedFilm.title,
        tipoContenido: selectedFilm.type,
        posterUrl: selectedFilm.posterUrl,
      });

      await apiRequest("/calificaciones", {
        method: "POST",
        body: JSON.stringify({
          idUsuario: usuario.idUsuario,
          idContenido: contenido.idContenido,
          puntaje: rating,
          comentario: postText.trim(),
        }),
      });

      setPostText("");
      removeFilm();
      onPosted?.();
    } catch (error) {
      console.error("Error al postear:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const coverStyle = selectedFilm?.posterUrl
    ? {
        backgroundImage: `url('${selectedFilm.posterUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: "linear-gradient(135deg,#2a1a4a,#5a2a8a)" };

  return (
    <div className={styles.composer}>
      <button
        type="button"
        className={styles.composerCollapsedTrigger}
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <div className={styles.userIcon}>🎥</div>
        <span>¿Qué estás viendo hoy?</span>
      </button>

      <div
        className={`${styles.composerBody} ${open ? styles.open : ""}`}
        aria-hidden={!open}
      >
        <p className={styles.composerLabel}>1. Elige una película o serie</p>

        {!selectedFilm && (
          <div className={styles.filmSearchWrap} ref={searchWrapRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="🎬 Buscar película o serie..."
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div
              className={`${styles.filmDropdown} ${
                dropdownOpen ? styles.open : ""
              }`}
            >
              {results.map((f, i) => (
                <div
                  key={i}
                  className={styles.filmOption}
                  onClick={() => selectFilm(f)}
                >
                  <div
                    className={styles.miniCover}
                    style={{
                      background: "linear-gradient(135deg,#2a1a4a,#5a2a8a)",
                      overflow: "hidden",
                      padding: 0,
                    }}
                  >
                    {f.posterUrl ? (
                      <img
                        src={f.posterUrl}
                        alt={f.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: ".7rem", padding: 4 }}>
                        {f.titulo}
                      </span>
                    )}
                  </div>
                  <div>
                    <div>{f.titulo}</div>
                    <div className={styles.filmMeta}>
                      {f.tipoContenido || ""}
                      {f.anioEstreno ? ` · ${f.anioEstreno}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFilm && (
          <div className={`${styles.selectedFilm} ${styles.show}`}>
            <div className={styles.miniCover} style={coverStyle}>
              {!selectedFilm.posterUrl ? selectedFilm.title : ""}
            </div>
            <div className={styles.selectedFilmInfo}>
              <div className={styles.selectedTitle}>{selectedFilm.title}</div>
              <div className={styles.selectedMeta}>{selectedFilm.type}</div>
              <div className="chip-tags">
                {selectedFilm.tags.map((t, i) => (
                  <span
                    key={i}
                    className={`tag ${tagClass(t)}`}
                    style={{ fontSize: ".72rem", padding: "2px 10px" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              className={styles.removeFilm}
              title="Quitar"
              onClick={removeFilm}
            >
              ✕
            </button>
          </div>
        )}

        {selectedFilm && esEstrenoSensible(selectedFilm.fechaEstreno) && (
          <div className={styles.spoilerNotice}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <p>
              Tu post es sobre un{" "}
              <strong>
                estreno {motivoSpoiler(selectedFilm.fechaEstreno) === "futuro" ? "futuro" : "reciente"}
              </strong>{" "}
              y podrá ser susceptible a <strong>SPOILERS.</strong> Estará oculto
              para los demás a menos que decidan verlo.
            </p>
          </div>
        )}

        <div
          className={`${styles.composerRating} ${
            selectedFilm ? styles.visible : ""
          }`}
        >
          <p className={styles.composerLabel}>2. ¿Cuánto le das?</p>
          <StarRating
            variant="composer"
            value={rating}
            onChange={(v) => {
              setRating(v);
              setRatingDisplay(v);
            }}
            onHoverChange={(v) => setRatingDisplay(v)}
          />
          <span className={styles.composerRatingValue}>
            {ratingDisplay > 0 ? `${ratingDisplay}/5` : ""}
          </span>
        </div>

        <p className={styles.composerLabel}>3. ¿Qué quieres compartir?</p>
        <textarea
          placeholder="Cuéntale a tus homies..."
          className="mb-3"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />

        <div className={styles.composerActions}>
          <button
            className={styles.postSubmitBtn}
            disabled={!canPost}
            onClick={handlePost}
          >
            Postear
          </button>
        </div>
      </div>
    </div>
  );
}
