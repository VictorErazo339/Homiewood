import { apiRequest } from "./api";

export function recomendarParaUsuario(idUsuario, limite = 10) {
    return apiRequest(`/recomendaciones/usuario/${idUsuario}?limite=${limite}`);
}

export function recomendarDesdeOtroUsuario(idUsuario, idOtroUsuario, limite = 10) {
    return apiRequest(
        `/recomendaciones/usuario/${idUsuario}/desde/${idOtroUsuario}?limite=${limite}`
    );
}

export function recomendarParaGrupo(idGrupo, limite = 10) {
    return apiRequest(`/recomendaciones/grupo/${idGrupo}?limite=${limite}`);
}