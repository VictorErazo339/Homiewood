import { apiRequest } from "./api";

export function listarGrupos() {
    return apiRequest("/grupos");
}

export function buscarGrupoPorId(idGrupo) {
    return apiRequest(`/grupos/${idGrupo}`);
}

export function listarGruposDeUsuario(idUsuario) {
    return apiRequest(`/grupos/usuario/${idUsuario}`);
}

export function crearGrupo(datos) {
    return apiRequest("/grupos", {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function eliminarGrupo(idGrupo) {
    return apiRequest(`/grupos/${idGrupo}`, {
        method: "DELETE",
    });
}

export function listarMiembrosGrupo(idGrupo) {
    return apiRequest(`/grupos/${idGrupo}/miembros`);
}

export function contarMiembrosGrupo(idGrupo) {
    return apiRequest(`/grupos/${idGrupo}/miembros/cantidad`);
}

export function agregarMiembroGrupo(idGrupo, datos) {
    return apiRequest(`/grupos/${idGrupo}/miembros`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export function eliminarMiembroGrupo(idGrupo, idUsuario) {
    return apiRequest(`/grupos/${idGrupo}/miembros/${idUsuario}`, {
        method: "DELETE",
    });
}