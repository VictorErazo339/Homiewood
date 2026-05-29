import { apiRequest } from "./api";

export function listarUsuarios() {
    return apiRequest("/usuarios");
}

export function buscarUsuarioPorId(idUsuario) {
    return apiRequest(`/usuarios/${idUsuario}`);
}

export function crearUsuario(datos) {
    return apiRequest("/usuarios", {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function eliminarUsuario(idUsuario) {
    return apiRequest(`/usuarios/${idUsuario}`, {
        method: "DELETE",
    });
}

export function listarSeguidores(idUsuario) {
    return apiRequest(`/usuarios/${idUsuario}/seguidores`);
}

export function listarSiguiendo(idUsuario) {
    return apiRequest(`/usuarios/${idUsuario}/siguiendo`);
}

export function seguirUsuario(idSeguido, idSeguidor) {
    return apiRequest(`/usuarios/${idSeguido}/seguidores`, {
        method: "POST",
        body: JSON.stringify({
            idSeguidor,
        }),
    });
}

export function dejarDeSeguir(idSeguidor, idSeguido) {
    return apiRequest(`/usuarios/${idSeguidor}/siguiendo/${idSeguido}`, {
        method: "DELETE",
    });
}