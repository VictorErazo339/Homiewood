import { apiRequest } from "./api.js";

export function listarUsuarios() {
  return apiRequest("/usuarios");
}

export function buscarUsuarioPorId(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}`);
}

export function obtenerPerfilResumen(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}/perfil-resumen`);
}


export function buscarUsuarioPorUsername(username) {
  return apiRequest(`/usuarios/username/${encodeURIComponent(username)}`);
}

export function buscarUsuarios(query) {
  return apiRequest(`/usuarios/buscar?query=${encodeURIComponent(query)}`);
}

// Follower/following counts (+ whether the logged-in user follows this profile).
export function obtenerResumenSeguimiento(idUsuario, idUsuarioLogueado) {
  const qs =
    idUsuarioLogueado != null ? `?idUsuarioLogueado=${idUsuarioLogueado}` : "";
  return apiRequest(`/usuarios/${idUsuario}/seguimiento/resumen${qs}`);
}

export function listarLogros(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}/logros`);
}

export function listarLogrosDestacados(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}/logros/destacados`);
}

export function actualizarLogrosDestacados(idUsuario, idsLogros) {
  return apiRequest(`/usuarios/${idUsuario}/logros/destacados`, {
    method: "PUT",
    body: JSON.stringify({ idsLogros }),
  });
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

export function actualizarIconoUsuario(idUsuario, iconoPerfil) {
  return apiRequest(`/usuarios/${idUsuario}/icono?iconoPerfil=${iconoPerfil}`, {
    method: "PATCH",
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
