// Token + current-user helpers backed by localStorage, matching the legacy
// pattern (token in "token", user object JSON in "usuario").
import { guardarToken, obtenerToken, eliminarToken } from "../api/api.js";

export { guardarToken, obtenerToken, eliminarToken };

export function guardarUsuario(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function obtenerUsuario() {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function eliminarUsuario() {
  localStorage.removeItem("usuario");
}

export function cerrarSesion() {
  eliminarToken();
  eliminarUsuario();
}
