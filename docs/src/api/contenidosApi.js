import { apiRequest } from "./api.js";

// Per-id content-detail lookups. PostCard fetches these on mount to know the
// release date (for the spoiler filter) and reuses the synopsis for the film
// modal. Promises are cached so the same content isn't refetched across posts
// or re-renders; a failed lookup is evicted so it can be retried.
const cache = new Map();

export function obtenerContenido(idContenido) {
  if (idContenido == null) return Promise.reject(new Error("idContenido requerido"));

  if (cache.has(idContenido)) return cache.get(idContenido);

  const promesa = apiRequest(`/contenidos/${idContenido}`).catch((error) => {
    cache.delete(idContenido);
    throw error;
  });

  cache.set(idContenido, promesa);
  return promesa;
}
