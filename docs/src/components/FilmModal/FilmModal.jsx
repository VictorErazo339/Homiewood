import { useEffect, useState } from "react";
import { tagClass } from "../../lib/format.js";
import img from "../../assets/images.js";
import StarRating from "../StarRating/StarRating.jsx";
import AddToList from "../AddToList/AddToList.jsx";
import styles from "./FilmModal.module.css";

// In-memory per-title ratings, matching the legacy window.userRatings store.
const userRatings = {};

const LIST_OPTIONS = [
  { key: "top5", label: "Top 5", img: img.top5list },
  { key: "watchlist", label: "Watchlist", img: img.watchlist },
  { key: "porver", label: "Por ver", img: img.pendinglist },
];

// Controlled modal: render with `film` set to open, `null` to close.
export default function FilmModal({ film, onClose }) {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (film) setRating(userRatings[film.title] || 0);
  }, [film]);

  useEffect(() => {
    if (!film) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [film, onClose]);

  if (!film) return null;

  const sub = [film.director, film.year].filter(Boolean).join(" · ");
  const tags = film.tags || [];
  const actors = film.cast
    ? String(film.cast)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  function handleRating(v) {
    userRatings[film.title] = v;
    setRating(v);
  }

  return (
    <div
      className={`${styles.filmModalOverlay} ${styles.open}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={styles.filmModal}
        role="dialog"
        aria-modal="true"
        aria-label={film.title}
      >
        <button
          className={styles.filmModalClose}
          aria-label="Cerrar"
          onClick={onClose}
        >
          ✕
        </button>

        <div className={styles.filmModalBody}>
          <div
            className={styles.filmModalPoster}
            style={film.posterUrl ? { background: "none" } : { background: film.grad }}
          >
            {film.posterUrl ? (
              <img src={film.posterUrl} alt={film.title} />
            ) : (
              film.title
            )}
          </div>

          <div className={styles.filmModalInfo}>
            <div className={styles.filmModalTitle}>{film.title}</div>
            <div className={styles.filmModalSub}>{sub}</div>

            <div className={styles.filmModalTags}>
              {tags.map((tag, i) => (
                <span key={i} className={`tag ${tagClass(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>

            {actors.length > 0 && (
              <div className={styles.filmModalCast}>
                <span className={styles.filmModalCastLabel}>
                  Reparto principal
                </span>
                {actors.map((actor, i) => (
                  <span key={i} className={styles.castChip}>
                    {actor}
                  </span>
                ))}
              </div>
            )}

            <p className={styles.filmModalDesc}>{film.desc}</p>

            <div className={styles.filmModalRating}>
              <span className={styles.filmModalSectionLabel}>
                TU VALORACIÓN HOMIE
              </span>
              <StarRating variant="modal" value={rating} onChange={handleRating} />
            </div>

            <div className={styles.filmModalLists}>
              <span className={styles.filmModalSectionLabel}>
                Agregar a lista
              </span>
              <AddToList options={LIST_OPTIONS} showBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
