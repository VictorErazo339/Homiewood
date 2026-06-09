import { useState } from "react";
import styles from "./StarRating.module.css";

// Reused by the Composer and the FilmModal. Hover previews the rating up to the
// pointer; clicking the current value clears it (toggle), matching the legacy.
export default function StarRating({
  value = 0,
  onChange,
  onHoverChange,
  variant = "modal",
}) {
  const [hover, setHover] = useState(0);
  const wrapClass =
    variant === "composer" ? styles.composerStarRating : styles.starRating;
  const display = hover || value;

  return (
    <div
      className={wrapClass}
      role="group"
      aria-label="Valoración de 1 a 5 estrellas"
      onMouseLeave={() => {
        setHover(0);
        onHoverChange?.(value);
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= display;
        return (
          <button
            key={i}
            type="button"
            className={`${styles.starBtn} ${on ? styles.selected : ""}`}
            aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
            onMouseEnter={() => {
              setHover(i);
              onHoverChange?.(i);
            }}
            onClick={() => onChange?.(i === value ? 0 : i)}
          >
            <i className={`bi ${on ? "bi-star-fill" : "bi-star"}`}></i>
          </button>
        );
      })}
    </div>
  );
}
