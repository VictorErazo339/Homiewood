// Content normalization + genre/tag inference helpers, ported from the legacy
// profile.js. Shared by Profile / Vistas / PorVer.

export function inferirProveedor(item) {
  if (item.mal_id || item.images?.jpg?.image_url) return "JIKAN";
  return "TMDB";
}

export function convertirTipoVisual(tipo, proveedor) {
  const t = String(tipo || "").toUpperCase();
  const p = String(proveedor || "").toUpperCase();

  if (p === "JIKAN") return "Anime";
  if (t === "PELICULA" || t === "PELÍCULA" || t === "MOVIE") return "Película";
  if (t === "SERIE" || t === "TV" || t === "TV SHOW") return "Serie";

  return tipo || "Contenido";
}

export function convertirTipoBackend(tipoVisual) {
  if (tipoVisual === "Película") return "PELICULA";
  return "SERIE";
}

export function normalizarNombreTag(tag) {
  if (!tag) return "";
  const limpio = String(tag).trim();

  const mapa = {
    PELICULA: "Película",
    "PELÍCULA": "Película",
    Pelicula: "Película",
    Movie: "Película",
    "TV Show": "Serie",
    SERIE: "Serie",
    Series: "Serie",
    Anime: "Anime",
    Animation: "Animación",
    Romance: "Romance",
    Drama: "Drama",
    Horror: "Terror",
    Terror: "Terror",
    Action: "Acción",
    Adventure: "Aventura",
    Comedy: "Comedia",
    Fantasy: "Fantasía",
    Mystery: "Misterio",
    "Science Fiction": "Sci-Fi",
    Thriller: "Suspenso",
    Crime: "Crimen",
    Family: "Familia",
    Music: "Música",
  };

  return mapa[limpio] || limpio;
}

export function extraerGenerosApi(item) {
  const generos = [];

  if (Array.isArray(item.generos)) generos.push(...item.generos);

  if (Array.isArray(item.genres)) {
    item.genres.forEach((g) => {
      if (typeof g === "string") generos.push(g);
      else if (g?.name) generos.push(g.name);
    });
  }

  if (item.genero) generos.push(item.genero);

  return generos
    .filter(Boolean)
    .map((g) => normalizarNombreTag(g))
    .filter((g, index, arr) => arr.indexOf(g) === index);
}

export function inferirGeneros(item) {
  const texto = `
    ${item.titulo || ""}
    ${item.title || ""}
    ${item.name || ""}
    ${item.descripcion || ""}
    ${item.overview || ""}
    ${item.synopsis || ""}
  `.toLowerCase();

  const generos = [];

  if (texto.includes("romance") || texto.includes("amor") || texto.includes("love")) generos.push("Romance");
  if (texto.includes("terror") || texto.includes("horror")) generos.push("Terror");
  if (texto.includes("drama")) generos.push("Drama");
  if (texto.includes("action") || texto.includes("acción") || texto.includes("batalla")) generos.push("Acción");
  if (texto.includes("comedy") || texto.includes("comedia")) generos.push("Comedia");
  if (texto.includes("fantasy") || texto.includes("fantasía")) generos.push("Fantasía");
  if (texto.includes("sci-fi") || texto.includes("science fiction")) generos.push("Sci-Fi");

  if (String(item.apiProvider || item.proveedor || "").toUpperCase() === "JIKAN") {
    generos.push("Anime");
  }

  return generos;
}

export function obtenerAnioDesdeFecha(fecha) {
  if (!fecha) return null;
  return Number(String(fecha).slice(0, 4)) || null;
}

export function normalizarContenidoApi(item) {
  const proveedor = item.apiProvider || item.proveedor || inferirProveedor(item);
  const tipoVisual = convertirTipoVisual(item.tipoContenido || item.tipo || "", proveedor);
  const tipoBackend = convertirTipoBackend(tipoVisual);

  const generosFinales = [...extraerGenerosApi(item), ...inferirGeneros(item)]
    .filter(Boolean)
    .map((g) => normalizarNombreTag(g))
    .filter((g, index, arr) => arr.indexOf(g) === index);

  return {
    idContenido: item.idContenido || null,
    apiId: item.apiId || item.id || item.mal_id || "",
    proveedor,
    titulo: item.titulo || item.title || item.name || item.title_english || "Sin título",
    tipoVisual,
    tipoBackend,
    tipoContenido: tipoVisual,
    posterUrl:
      item.posterUrl || item.imageUrl || item.coverUrl || item.images?.jpg?.image_url || "",
    anioEstreno:
      item.anioEstreno ||
      item.year ||
      obtenerAnioDesdeFecha(item.fechaEstreno || item.release_date || item.aired?.from),
    fechaEstreno: item.fechaEstreno || item.release_date || item.aired?.from || null,
    idioma: item.idioma || item.idiomaOriginal || item.original_language || "",
    puntajeExterno: item.puntajeExterno || item.vote_average || item.score || 0,
    genero: generosFinales[0] || "",
    generos: generosFinales,
    descripcion: item.descripcion || item.overview || item.synopsis || "",
  };
}

export function obtenerTagsDelItem(item) {
  const tags = [
    ...(item.generos || []),
    item.genero,
    item.tipoVisual,
    item.tipoContenido,
    ...inferirGeneros(item),
  ];

  return tags
    .filter(Boolean)
    .map(normalizarNombreTag)
    .filter((tag) => !["Contenido", "TMDB", "JIKAN", "API", "BD"].includes(tag))
    .filter((tag, index, array) => array.indexOf(tag) === index);
}

export function iconoTag(tag) {
  const t = String(tag).toLowerCase();

  if (t.includes("romance")) return "❤️";
  if (t.includes("anime")) return "🌸";
  if (t.includes("terror")) return "👻";
  if (t.includes("drama")) return "🎭";
  if (t.includes("serie")) return "📺";
  if (t.includes("película") || t.includes("pelicula")) return "🎬";
  if (t.includes("acción") || t.includes("accion")) return "💥";
  if (t.includes("comedia")) return "😂";
  if (t.includes("fantas")) return "✨";
  if (t.includes("sci")) return "🚀";

  return "🎞️";
}
