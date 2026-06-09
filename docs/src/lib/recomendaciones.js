// Helpers shared by the Recommendations and Cartelera pages.

export function formatearTipo(tipo) {
  if (!tipo) return "Contenido";
  const t = String(tipo).toUpperCase();
  if (t === "PELICULA") return "Película";
  if (t === "SERIE") return "Serie";
  return tipo;
}

export function formatearMotivo(motivo) {
  if (!motivo) return "Recomendado para ti";
  if (motivo.includes("coincide con géneros")) return "Según tus gustos";
  if (motivo.includes("general")) return "Popular en Homiewood";
  return motivo;
}

export function normalizarRecomendacion(item) {
  return {
    idContenido: item.idContenido || null,
    titulo: item.titulo || item.title || "Sin título",
    tipoContenido: item.tipoContenido || item.tipo || "Contenido",
    tipoVisual: formatearTipo(item.tipoContenido || item.tipo),
    anioEstreno: item.anioEstreno || item.anio || item.year || null,
    posterUrl: item.posterUrl || item.poster || item.imageUrl || "",
    promedioCalificaciones: item.promedioCalificaciones || item.rating || 0,
    motivo: item.motivo || "Recomendado para ti",
    genero: item.genero || item.generos?.[0] || "",
    generos: item.generos || [],
    idioma: item.idioma || item.idiomaOriginal || "",
    descripcion: item.descripcion || item.desc || item.overview || item.synopsis || "",
    apiProvider: item.apiProvider || item.proveedor || "",
    apiId: item.apiId || "",
  };
}

export function eliminarDuplicados(items) {
  const mapa = new Map();
  items.forEach((item) => {
    const clave = `${item.titulo}-${item.anioEstreno || ""}`.toLowerCase();
    if (!mapa.has(clave)) mapa.set(clave, item);
  });
  return Array.from(mapa.values());
}

// Filtering + sorting shared by both pages.
export function filtrarRecomendaciones(recomendaciones, f) {
  const busqueda = (f.search || "").toLowerCase().trim();
  let data = recomendaciones.filter((item) => {
    const generos = [item.genero, ...(Array.isArray(item.generos) ? item.generos : [])].filter(
      Boolean
    );
    const coincideBusqueda =
      !busqueda ||
      item.titulo.toLowerCase().includes(busqueda) ||
      item.descripcion.toLowerCase().includes(busqueda);
    const coincideTipo =
      !f.tipo ||
      item.tipoVisual === f.tipo ||
      item.tipoContenido === f.tipo ||
      (f.tipo === "Anime" && generos.includes("Anime"));
    const coincideGenero = !f.genero || generos.includes(f.genero);
    const coincidePuntuacion =
      !f.puntuacion || Number(item.promedioCalificaciones || 0) >= Number(f.puntuacion);
    const coincideAnio = !f.anio || String(item.anioEstreno || "") === String(f.anio);
    return coincideBusqueda && coincideTipo && coincideGenero && coincidePuntuacion && coincideAnio;
  });

  if (f.orden === "az") data = [...data].sort((a, b) => a.titulo.localeCompare(b.titulo));
  if (f.orden === "za") data = [...data].sort((a, b) => b.titulo.localeCompare(a.titulo));
  if (f.orden === "reciente")
    data = [...data].sort((a, b) => Number(b.anioEstreno || 0) - Number(a.anioEstreno || 0));
  if (f.orden === "antiguo")
    data = [...data].sort((a, b) => Number(a.anioEstreno || 0) - Number(b.anioEstreno || 0));

  return data;
}

export function recToFilm(item) {
  return {
    title: item.titulo,
    director: item.tipoVisual,
    year: [item.anioEstreno, formatearMotivo(item.motivo)].filter(Boolean).join(" · "),
    tags: [...new Set([item.tipoVisual, item.genero, ...(item.generos || [])].filter(Boolean))],
    cast: "",
    desc: item.descripcion || item.motivo || "Sin descripción disponible.",
    grad: "linear-gradient(135deg,#1a1a2e,#0a0a0a)",
    posterUrl: item.posterUrl || null,
  };
}
