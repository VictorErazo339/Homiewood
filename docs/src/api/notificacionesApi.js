import { apiRequest } from "./api.js";

export function listarNotificacionesUsuario(idUsuario) {
  return apiRequest(`/notificaciones/usuario/${idUsuario}`);
}

export function marcarNotificacionesLeidas(idUsuario) {
  return apiRequest(`/notificaciones/usuario/${idUsuario}/leer`, {
    method: "PATCH",
  });
}

export function limpiarNotificacionesUsuario(idUsuario) {
  return apiRequest(`/notificaciones/usuario/${idUsuario}`, {
    method: "DELETE",
  });
}
