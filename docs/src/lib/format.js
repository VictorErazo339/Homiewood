// Small formatting helpers ported from the legacy page scripts.
// (escapeHtml is intentionally omitted — JSX escapes text by default.)

export function tagClass(tag) {
  const blue = ["Anime", "Sci-Fi", "Misterio", "SERIE", "Serie"];
  const yellow = ["TV Show", "Aventura", "Acción", "Fantasía", "Comedia"];
  const teal = ["Película", "PELICULA", "Drama", "Romance"];

  if (blue.includes(tag)) return "tag-blue";
  if (yellow.includes(tag)) return "tag-yellow";
  if (teal.includes(tag)) return "tag-teal";

  return "tag-blue";
}

export function normalizarTipoBackend(tipo) {
  if (!tipo) return "SERIE";

  const t = String(tipo).toUpperCase();

  if (t === "PELICULA" || t === "PELÍCULA" || t === "MOVIE") return "PELICULA";
  if (t === "SERIE" || t === "TV" || t === "ANIME") return "SERIE";

  return t;
}

// Trims an ISO date to its YYYY-MM-DD part, matching the legacy `.split("T")[0]`.
export function soloFecha(fecha) {
  return fecha ? String(fecha).split("T")[0] : "";
}
