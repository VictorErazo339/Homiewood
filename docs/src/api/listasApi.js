import { apiRequest } from "./api.js";

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

// =========================================================
// POR VER / VISTAS — biblioteca personal con filtros
// =========================================================
export function listarPorVerUsuario(idUsuario, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return apiRequest(`/listas/usuario/${idUsuario}/por-ver${queryString ? `?${queryString}` : ""}`);
}

export function marcarPorVerComoVista(idUsuario, idListaContenido) {
  return apiRequest(`/listas/usuario/${idUsuario}/por-ver/${idListaContenido}/marcar-vista`, {
    method: "POST",
  });
}

export function guardarContenidoUsuarioEnLista(idUsuario, tipoLista, contenido) {
  return apiRequest(`/usuarios/${idUsuario}/listas/${tipoLista}/contenidos/externo`, {
    method: "POST",
    body: JSON.stringify(contenido),
  });
}
