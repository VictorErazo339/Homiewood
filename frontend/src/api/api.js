

// CORREGIDO: Si no existe import.meta.env, usa directo tu backend de Spring Boot en local
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL 
    : "http://localhost:8080/api";


//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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