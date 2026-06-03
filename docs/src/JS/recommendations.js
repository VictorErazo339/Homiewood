import { apiRequest } from "../api/api.js";

let recomendaciones = [];

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        window.location.href = "./login.html";
        return;
    }

    mostrarUsuario(usuario);
    await cargarRecomendaciones(usuario.idUsuario || usuario.id);
});

function mostrarUsuario(usuario) {
    const nombreEl = document.getElementById("nombreUsuario");

    if (nombreEl) {
        nombreEl.textContent = `@${usuario.username || usuario.nombre || "usuario"}`;
    }
}

async function cargarRecomendaciones(idUsuario) {
    const grid = document.getElementById("recGrid");
    const count = document.getElementById("recCount");

    try {
        grid.innerHTML = `<p class="rec-loading">Cargando recomendaciones...</p>`;

        recomendaciones = await apiRequest(`/recomendaciones/usuario/${idUsuario}?limite=30`);

        if (count) {
            count.textContent = `${recomendaciones.length} títulos`;
        }

        if (!recomendaciones || recomendaciones.length === 0) {
            grid.innerHTML = `
                <div class="rec-empty visible">
                    <i class="bi bi-film"></i>
                    <p>Aún no hay recomendaciones. Agrega películas a Vistas o Top 5.</p>
                </div>
            `;
            return;
        }

        renderRecomendaciones(recomendaciones);

    } catch (error) {
        console.error("Error cargando recomendaciones:", error);

        grid.innerHTML = `
            <div class="rec-empty visible">
                <i class="bi bi-exclamation-triangle"></i>
                <p>No se pudieron cargar las recomendaciones.</p>
            </div>
        `;
    }
}

function renderRecomendaciones(items) {
    const grid = document.getElementById("recGrid");

    grid.innerHTML = items.map(item => `
        <article class="rec-card">
            ${
                item.posterUrl
                    ? `<img class="rec-card-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                    : `<div class="rec-card-poster-fallback">${escapeHtml(item.titulo)}</div>`
            }

            <div class="rec-card-rating">
                <i class="bi bi-star-fill"></i>
                ${item.promedioCalificaciones ? item.promedioCalificaciones.toFixed(1) : "0.0"}
            </div>

            <div class="rec-card-info">
                <h3 class="rec-card-title">${escapeHtml(item.titulo)}</h3>

                <p class="rec-card-meta">
                    ${escapeHtml(formatearTipo(item.tipoContenido))}
                    ${item.anioEstreno ? " · " + item.anioEstreno : ""}
                </p>

                <div class="rec-card-tags">
                    <span class="rec-card-tag tag-yellow">
                        ${escapeHtml(formatearMotivo(item.motivo))}
                    </span>
                </div>
            </div>
        </article>
    `).join("");
}

function formatearTipo(tipo) {
    if (!tipo) return "Contenido";
    if (tipo === "PELICULA") return "Película";
    if (tipo === "SERIE") return "Serie";
    return tipo;
}

function formatearMotivo(motivo) {
    if (!motivo) return "Recomendado para ti";

    if (motivo.includes("coincide con géneros")) {
        return "Según tus gustos";
    }

    if (motivo.includes("general")) {
        return "Popular en Homiewood";
    }

    return motivo;
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}