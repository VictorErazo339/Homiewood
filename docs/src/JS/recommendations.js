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

function inicializarFiltros() {
    const filtros = [
        "filterOrden",
        "filterTipo",
        "filterGenero",
        "filterPuntuacion",
        "filterAnio",
        "filterIdioma"
    ];

    filtros.forEach(id => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.addEventListener("change", function () {
                paginaActual = 1;
                renderizarRecomendaciones();
            });
        }
    });

    const reset = document.getElementById("filtersReset");
    const resetEmpty = document.getElementById("recEmptyReset");

    if (reset) reset.addEventListener("click", limpiarFiltros);
    if (resetEmpty) resetEmpty.addEventListener("click", limpiarFiltros);

    cargarAnios();
}

function cargarAnios() {
    const select = document.getElementById("filterAnio");
    if (!select) return;

    const anios = [...new Set(recomendaciones.map(item => item.anio).filter(Boolean))]
        .sort((a, b) => b - a);

    select.innerHTML = `<option value="">Todos</option>`;

    anios.forEach(anio => {
        select.innerHTML += `<option value="${anio}">${anio}</option>`;
    });
}

function limpiarFiltros() {
    const ids = [
        "recSearchInput",
        "filterTipo",
        "filterGenero",
        "filterPuntuacion",
        "filterAnio",
        "filterIdioma"
    ];

    ids.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = "";
    });

    const orden = document.getElementById("filterOrden");
    if (orden) orden.value = "reciente";

    paginaActual = 1;
    renderizarRecomendaciones();
}

function obtenerRecomendacionesFiltradas() {
    const busqueda = document.getElementById("recSearchInput")?.value.toLowerCase() || "";
    const tipo = document.getElementById("filterTipo")?.value || "";
    const genero = document.getElementById("filterGenero")?.value || "";
    const puntuacion = document.getElementById("filterPuntuacion")?.value || "";
    const anio = document.getElementById("filterAnio")?.value || "";
    const idioma = document.getElementById("filterIdioma")?.value || "";
    const orden = document.getElementById("filterOrden")?.value || "reciente";

    let data = recomendaciones.filter(item => {
        const coincideBusqueda =
            item.titulo.toLowerCase().includes(busqueda) ||
            String(item.director || "").toLowerCase().includes(busqueda);

        const coincideTipo = !tipo || item.tipo === tipo;
        const coincideGenero = !genero || item.genero === genero;
        const coincidePuntuacion = !puntuacion || Number(item.rating) === Number(puntuacion);
        const coincideAnio = !anio || String(item.anio) === String(anio);
        const coincideIdioma = !idioma || item.idioma === idioma;

        return coincideBusqueda &&
            coincideTipo &&
            coincideGenero &&
            coincidePuntuacion &&
            coincideAnio &&
            coincideIdioma;
    });

    if (orden === "az") data.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (orden === "za") data.sort((a, b) => b.titulo.localeCompare(a.titulo));
    if (orden === "reciente") data.sort((a, b) => Number(b.anio || 0) - Number(a.anio || 0));
    if (orden === "antiguo") data.sort((a, b) => Number(a.anio || 0) - Number(b.anio || 0));

    return data;
}

function renderizarRecomendaciones() {
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