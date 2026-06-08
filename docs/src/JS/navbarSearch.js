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
let lastSearchButton = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializarNavbarSearch();
    marcarNavbarActiva();
});

/* ============================================================
   NAVBAR SEARCH COMO DROPDOWN
============================================================ */

function inicializarNavbarSearch() {
    if (initialized) return;
    initialized = true;

    const searchButtons = document.querySelectorAll(SELECTOR_SEARCH_BUTTONS);

    if (!searchButtons || searchButtons.length === 0) {
        return;
    }

    crearDropdownBusqueda();

    searchButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            lastSearchButton = button;

            cerrarBuscadorViejoSiExiste();
            cerrarMenuPerfilSiExiste();

            if (overlay?.classList.contains("is-open")) {
                cerrarBuscadorUsuarios();
                return;
            }

            abrirBuscadorUsuarios(button);
        }, true);
    });

    document.addEventListener("click", event => {
        if (!overlay?.classList.contains("is-open")) return;

        const clickDentroDropdown = overlay.contains(event.target);
        const clickEnBotonBusqueda = event.target.closest(SELECTOR_SEARCH_BUTTONS);

        if (!clickDentroDropdown && !clickEnBotonBusqueda) {
            cerrarBuscadorUsuarios();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            cerrarBuscadorUsuarios();
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();

            const button = lastSearchButton || document.querySelector(SELECTOR_SEARCH_BUTTONS);

            cerrarMenuPerfilSiExiste();
            abrirBuscadorUsuarios(button);
        }
    });

    window.addEventListener("resize", () => {
        if (overlay?.classList.contains("is-open")) {
            posicionarDropdown(lastSearchButton || document.querySelector(SELECTOR_SEARCH_BUTTONS));
        }
    });

    window.addEventListener("scroll", () => {
        if (overlay?.classList.contains("is-open")) {
            posicionarDropdown(lastSearchButton || document.querySelector(SELECTOR_SEARCH_BUTTONS));
        }
    }, true);
}

function crearDropdownBusqueda() {
    const existing = document.getElementById("navbarSearchOverlay");

    if (existing) {
        existing.remove();
    }

    overlay = document.createElement("div");
    overlay.id = "navbarSearchOverlay";
    overlay.className = "navbar-search-overlay";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
        <section class="navbar-search-panel" role="search" aria-labelledby="navbarSearchTitle">
            <div class="navbar-search-header">
                <div>
                    <h2 id="navbarSearchTitle">Buscar usuarios</h2>
                    <p>Encuentra perfiles por nombre o username.</p>
                </div>

                <button type="button" class="navbar-search-close" aria-label="Cerrar buscador">
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

    overlay.addEventListener("click", event => {
        event.stopPropagation();
    });

    overlay.querySelector(".navbar-search-close")?.addEventListener("click", cerrarBuscadorUsuarios);

    input?.addEventListener("input", manejarInputBusqueda);
}

function abrirBuscadorUsuarios(button) {
    if (!overlay) crearDropdownBusqueda();

    lastSearchButton = button || lastSearchButton || document.querySelector(SELECTOR_SEARCH_BUTTONS);

    posicionarDropdown(lastSearchButton);

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    limpiarResultadosIniciales();

    setTimeout(() => {
        input?.focus();
    }, 80);
}

function cerrarBuscadorUsuarios() {
    if (!overlay) return;

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    clearTimeout(searchTimeout);

    if (input) input.value = "";

    limpiarResultadosIniciales();
}

function posicionarDropdown(button) {
    if (!overlay || !button) return;

    const rect = button.getBoundingClientRect();

    const top = rect.bottom + 12;
    const right = Math.max(12, window.innerWidth - rect.right - 2);

    overlay.style.setProperty("--navbar-search-top", `${top}px`);
    overlay.style.setProperty("--navbar-search-right", `${right}px`);
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
        const rawUsername = String(usuario.username || "");
        const username = escapeHtml(rawUsername);
        const descripcion = escapeHtml(
            usuario.descripcion ||
            usuario.biografia ||
            usuario.bio ||
            "Sin descripción todavía."
        );

        const avatar = escapeAttr(obtenerAvatarUsuario(usuario));

        return `
            <button type="button"
                    class="navbar-search-result"
                    data-username="${escapeAttr(rawUsername)}">
                <img src="${avatar}"
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

function obtenerAvatarUsuario(usuario) {
    if (usuario.fotoPerfilUrl) return usuario.fotoPerfilUrl;
    if (usuario.avatarUrl) return usuario.avatarUrl;
    if (usuario.fotoUrl) return usuario.fotoUrl;

    const icono = Number(usuario.iconoPerfil || usuario.icono || 1);

    return `../img/${icono}.webp`;
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

function cerrarMenuPerfilSiExiste() {
    document.querySelectorAll(".nav-profile-menu.is-open").forEach(menu => {
        menu.classList.remove("is-open");
    });
}

/* ============================================================
   NAVBAR ACTIVE LINKS
============================================================ */

function marcarNavbarActiva() {
    const path = window.location.pathname.toLowerCase();

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
    });

    const reglas = [
        {
            paginas: ["trending.html"],
            texto: "trending"
        },
        {
            paginas: ["home.html"],
            texto: "mis homies"
        },
        {
            paginas: ["cartelera.html"],
            texto: "cartelera"
        }
    ];

    const reglaActiva = reglas.find(regla =>
        regla.paginas.some(pagina => path.includes(pagina))
    );

    if (!reglaActiva) return;

    document.querySelectorAll(".nav-links a").forEach(link => {
        const texto = link.textContent.trim().toLowerCase();

        if (texto === reglaActiva.texto) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }
    });
}

/* ============================================================
   HELPERS
============================================================ */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}