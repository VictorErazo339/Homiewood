import { apiRequest, guardarToken, eliminarToken } from "./api.js";

export async function registrarUsuario(datos) {
    const respuesta = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(datos),
    });

    if (respuesta.token) {
        guardarToken(respuesta.token);
    }

    return respuesta;
}

export async function login(datos) {
    const respuesta = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(datos),
    });

    if (respuesta.token) {
        guardarToken(respuesta.token);
    }

    return respuesta;
}

export async function obtenerUsuarioAutenticado() {
    return apiRequest("/auth/me");
}

export function logout() {
    eliminarToken();
}