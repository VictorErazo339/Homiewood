import { apiRequest } from "./api";

export function listarComentariosDeLista(idLista) {
    return apiRequest(`/listas/${idLista}/comentarios`);
}

export function crearComentarioEnLista(idLista, datos) {
    return apiRequest(`/listas/${idLista}/comentarios`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function actualizarComentarioLista(idComentario, datos) {
    return apiRequest(`/comentarios-lista/${idComentario}`, {
        method: "PUT",
        body: JSON.stringify(datos),
    });
}

export function eliminarComentarioLista(idComentario) {
    return apiRequest(`/comentarios-lista/${idComentario}`, {
        method: "DELETE",
    });
}

export function listarComentariosDeUsuario(idUsuario) {
    return apiRequest(`/usuarios/${idUsuario}/comentarios`);
}

export function contarComentariosDeLista(idLista) {
    return apiRequest(`/listas/${idLista}/comentarios/cantidad`);
}