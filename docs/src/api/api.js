// Base URL for the Spring Boot backend. An explicit VITE_API_URL always wins;
// otherwise we auto-target the local backend when the app is served from
// localhost and the production Render URL everywhere else. (Ported from the
// vanilla frontend's hostname switch, kept behind the Vite env override.)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080/api"
    : "https://homiewood-p3p5.onrender.com/api");

export function guardarToken(token) {
  localStorage.setItem("token", token);
}

export function obtenerToken() {
  return localStorage.getItem("token");
}

export function eliminarToken() {
  localStorage.removeItem("token");
}

export async function apiRequest(endpoint, options = {}) {
  const token = obtenerToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw data;
  }

  return data;
}
