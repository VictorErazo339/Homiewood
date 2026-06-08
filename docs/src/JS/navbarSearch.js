import { apiRequest } from "../api/api.js";

const SELECTOR_SEARCH_BUTTONS = [
    '.nav-icons button[aria-label="Buscar"]',
    '.nav-search-toggle[aria-label="Buscar"]',
    '[data-navbar-search-btn]'
].join(",");

let overlay = null;
let input = null;
let results = null;
let searchTimeout = null;
let initialized = false;

document.addEventListener("DOMContentLoaded", () => {
    inicializarNavbarSearch();
});

function inicializarNavbarSearch() {
    if (initialized) return;
    initialized = true;

    const searchButtons = document.querySelectorAll(SELECTOR_SEARCH_BUTTONS);

    if (!searchButtons || searchButtons.length === 0) {
        return;
    }

    crearOverlayBusqueda();

    searchButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            cerrarBuscadorViejoSiExiste();
            abrirBuscadorUsuarios();
        }, true);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            cerrarBuscadorUsuarios();
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            abrirBuscadorUsuarios();
        }
    });
}

function crearOverlayBusqueda() {
    if (document.getElementById("navbarSearchOverlay")) {
        overlay = document.getElementById("navbarSearchOverlay");
        input = document.getElementById("navbarSearchInput");
        results = document.getElementById("navbarSearchResults");
        return;
    }

    overlay = document.createElement("div");
    overlay.id = "navbarSearchOverlay";
    overlay.className = "navbar-search-overlay";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
        <div class="navbar-search-backdrop" data-navbar-search-close></div>

        <section class="navbar-search-panel" role="dialog" aria-modal="true" aria-labelledby="navbarSearchTitle">
            <div class="navbar-search-header">
                <div>
                    <h2 id="navbarSearchTitle">Buscar usuarios</h2>
                    <p>Encuentra perfiles por nombre o username.</p>
                </div>

                <button type="button" class="navbar-search-close" data-navbar-search-close aria-label="Cerrar buscador">
                    <i class="bi bi-x-lg" aria-hidden="true"></i>
                </button>
            </div>

            <div class="navbar-search-input-wrap">
                <i class="bi bi-search" aria-hidden="true"></i>

                <input
                    id="navbarSearchInput"
                    type="search"
                    placeholder="Buscar por nombre o @username..."
                    autocomplete="off"
                    aria-label="Buscar usuarios"
                >
            </div>

            <div id="navbarSearchResults" class="navbar-search-results" aria-live="polite">
                <p class="navbar-search-empty">Escribe al menos 2 letras para buscar usuarios.</p>
            </div>
        </section>
    `;

    document.body.appendChild(overlay);

    input = document.getElementById("navbarSearchInput");
    results = document.getElementById("navbarSearchResults");

    overlay.querySelectorAll("[data-navbar-search-close]").forEach(element => {
        element.addEventListener("click", cerrarBuscadorUsuarios);
    });

    input.addEventListener("input", manejarInputBusqueda);
}

function abrirBuscadorUsuarios() {
    if (!overlay) crearOverlayBusqueda();

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    document.body.classList.add("navbar-search-open");

    limpiarResultadosIniciales();

    setTimeout(() => {
        input?.focus();
    }, 80);
}

function cerrarBuscadorUsuarios() {
    if (!overlay) return;

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    document.body.classList.remove("navbar-search-open");

    if (input) input.value = "";

    limpiarResultadosIniciales();
}

function limpiarResultadosIniciales() {
    if (!results) return;

    results.innerHTML = `
        <p class="navbar-search-empty">Escribe al menos 2 letras para buscar usuarios.</p>
    `;
}

function manejarInputBusqueda() {
    clearTimeout(searchTimeout);

    const query = input.value.trim();

    if (query.length < 2) {
        limpiarResultadosIniciales();
        return;
    }

    results.innerHTML = `
        <p class="navbar-search-empty">Buscando usuarios...</p>
    `;

    searchTimeout = setTimeout(() => {
        buscarUsuarios(query);
    }, 350);
}

async function buscarUsuarios(query) {
    try {
        const usuarios = await apiRequest(`/usuarios/buscar?query=${encodeURIComponent(query)}`);

        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            results.innerHTML = `
                <p class="navbar-search-empty">No encontramos usuarios con esa búsqueda.</p>
            `;
            return;
        }

        renderUsuarios(usuarios);
    } catch (error) {
        console.error("Error buscando usuarios:", error);

        results.innerHTML = `
            <p class="navbar-search-empty is-error">No se pudo buscar usuarios.</p>
        `;
    }
}

function renderUsuarios(usuarios) {
    results.innerHTML = usuarios.map(usuario => {
        const nombre = escapeHtml(usuario.nombre || "Usuario");
        const username = escapeHtml(usuario.username || "usuario");
        const descripcion = escapeHtml(usuario.descripcion || "Sin descripción todavía.");
        const icono = Number(usuario.iconoPerfil || 1);

        return `
            <button type="button"
                    class="navbar-search-result"
                    data-username="${username}">
                <img src="../img/${icono}.webp"
                     alt=""
                     class="navbar-search-avatar"
                     onerror="this.src='../img/1.webp'">

                <span class="navbar-search-user-info">
                    <strong>${nombre}</strong>
                    <small>@${username}</small>
                    <em>${descripcion}</em>
                </span>

                <span class="navbar-search-arrow">
                    <i class="bi bi-chevron-right" aria-hidden="true"></i>
                </span>
            </button>
        `;
    }).join("");

    document.querySelectorAll(".navbar-search-result").forEach(button => {
        button.addEventListener("click", () => {
            const username = button.dataset.username;

            if (!username) return;

            window.location.href = `./profile.html?username=${encodeURIComponent(username)}`;
        });
    });
}

function cerrarBuscadorViejoSiExiste() {
    const oldSearchBar = document.getElementById("navSearchBar");
    const oldSearchToggle = document.getElementById("navSearchToggle");

    if (oldSearchBar) {
        oldSearchBar.classList.remove("open");
        oldSearchBar.setAttribute("aria-hidden", "true");
    }

    if (oldSearchToggle) {
        oldSearchToggle.setAttribute("aria-expanded", "false");
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
