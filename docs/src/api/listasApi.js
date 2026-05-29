import { apiRequest } from "./api";

export function listarListas() {
    return apiRequest("/listas");
}

export function buscarListaPorId(idLista) {
    return apiRequest(`/listas/${idLista}`);
}

export function listarListasPorUsuario(idUsuario) {
    return apiRequest(`/listas/usuario/${idUsuario}`);
}

export function crearLista(datos) {
    return apiRequest("/listas", {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function eliminarLista(idLista) {
    return apiRequest(`/listas/${idLista}`, {
        method: "DELETE",
    });
}

export function listarContenidoDeLista(idLista) {
    return apiRequest(`/listas/${idLista}/contenidos`);
}

export function agregarContenidoALista(idLista, datos) {
    return apiRequest(`/listas/${idLista}/contenidos`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function eliminarContenidoDeLista(idListaContenido) {
    return apiRequest(`/listas/contenidos/${idListaContenido}`, {
        method: "DELETE",
    });
}

export function agregarContenidoExternoALista(idLista, contenido) {
    return apiRequest(`/listas/${idLista}/contenidos/externo`, {
        method: "POST",
        body: JSON.stringify(contenido),
    });
}

export function darLikeALista(idLista, idUsuario) {
    return apiRequest(`/listas/${idLista}/likes`, {
        method: "POST",
        body: JSON.stringify({
            idUsuario,
        }),
    });
}

export function quitarLikeALista(idLista, idUsuario) {
    return apiRequest(`/listas/${idLista}/likes/usuario/${idUsuario}`, {
        method: "DELETE",
    });
}

export function listarLikesDeLista(idLista) {
    return apiRequest(`/listas/${idLista}/likes`);
}

export function contarLikesDeLista(idLista) {
    return apiRequest(`/listas/${idLista}/likes/cantidad`);
}