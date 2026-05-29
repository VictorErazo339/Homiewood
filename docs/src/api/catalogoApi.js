import { apiRequest } from "./api.js";

export function buscarCatalogo(query) {
    return apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);
}

export function buscarTmdb(query) {
    return apiRequest(`/catalogo/tmdb?query=${encodeURIComponent(query)}`);
}

export function buscarAnime(query) {
    return apiRequest(`/catalogo/anime?query=${encodeURIComponent(query)}`);
}

export function guardarContenidoExterno(contenido) {
    return apiRequest("/catalogo/guardar", {
        method: "POST",
        body: JSON.stringify(contenido),
    });
}