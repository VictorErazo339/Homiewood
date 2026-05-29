import { apiRequest } from "./api";

export function compararUsuarios(idUsuario1, idUsuario2) {
    return apiRequest(`/comparaciones/usuarios/${idUsuario1}/${idUsuario2}`);
}

export function compararGrupo(idGrupo) {
    return apiRequest(`/comparaciones/grupos/${idGrupo}`);
}