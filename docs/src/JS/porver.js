import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let porver = [];
let top5 = [null, null, null, null, null];

document.addEventListener("DOMContentLoaded", async function () {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        window.location.href = "./login.html";
        return;
    }

    usuarioActual = JSON.parse(usuarioGuardado);

    const idUsuario = obtenerIdUsuario();

    await cargarDatosUsuario(idUsuario);
    await cargarCantidadPosts(idUsuario);

    cargarTop5();
    renderTop5();

    renderBioTags();

    cargarPorVer();
    renderPorVer();

    inicializarBuscadorPorVer();
});

function obtenerIdUsuario() {
    return usuarioActual.idUsuario || usuarioActual.id;
}

function top5StorageKey() {
    return `homiwood_top5_${obtenerIdUsuario()}`;
}

function vistasStorageKey() {
    return `homiwood_vistas_${obtenerIdUsuario()}`;
}

function porverStorageKey() {
    return `homiwood_porver_${obtenerIdUsuario()}`;
}

/* ===============================
   USUARIO
================================ */

async function cargarDatosUsuario(idUsuario) {
    const nombreEl = document.getElementById("profileName");
    const usernameEl = document.getElementById("profileUsername");

    if (usuarioActual) {
        nombreEl.textContent = usuarioActual.nombre || usuarioActual.username || "Usuario";
        usernameEl.textContent = `@${usuarioActual.username || "usuario"}`;
    }

    try {
        const usuario = await apiRequest(`/usuarios/${idUsuario}`);

        nombreEl.textContent =
            usuario.nombre ||
            usuario.username ||
            usuarioActual?.nombre ||
            "Usuario";

        usernameEl.textContent =
            `@${usuario.username || usuarioActual?.username || "usuario"}`;

    } catch (error) {
        console.error("Error cargando usuario:", error);
    }
}

async function cargarCantidadPosts(idUsuario) {
    try {
        const calificaciones = await apiRequest(`/calificaciones/usuario/${idUsuario}`);
        const statPosts = document.getElementById("statPosts");

        if (statPosts) {
            statPosts.textContent = calificaciones.length;
        }
    } catch (error) {
        console.error("Error cargando cantidad de posts:", error);
    }
}

/* ===============================
   TOP 5 COMPARTIDO
================================ */

function cargarTop5() {
    const guardado = localStorage.getItem(top5StorageKey());

    if (guardado) {
        top5 = JSON.parse(guardado);
    }
}

function renderTop5() {
    const grid = document.getElementById("top5Grid");

    if (!grid) return;

    const seleccionadas = top5.filter(Boolean);

    if (seleccionadas.length === 0) {
        grid.innerHTML = `
            <div class="top5-empty-state">
                <p>Tu Top 5 está vacío.</p>
                <small>Agrega tus películas o series favoritas.</small>
            </div>
        `;
        return;
    }

    grid.innerHTML = top5.map((item, index) => {
        if (!item) {
            return `
                <article class="movie-card movie-card-empty">
                    <span class="top5-rank">#${index + 1}</span>
                    <div class="movie-poster movie-poster-empty">Vacío</div>
                </article>
            `;
        }

        return `
            <article class="movie-card">
                <span class="top5-rank">#${index + 1}</span>
                ${
                    item.posterUrl
                        ? `<img class="movie-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                        : `<div class="movie-poster movie-poster-empty">${escapeHtml(item.titulo)}</div>`
                }
            </article>
        `;
    }).join("");
}

/* ===============================
   POR VER
================================ */

function cargarPorVer() {
    porver = JSON.parse(localStorage.getItem(porverStorageKey())) || [];
}

function guardarPorVer() {
    localStorage.setItem(porverStorageKey(), JSON.stringify(porver));
}

function renderPorVer() {
    const grid = document.getElementById("porverGrid");

    if (!grid) return;

    if (porver.length === 0) {
        grid.innerHTML = `
            <div class="top5-empty-state">
                <p>Aún no agregas películas o series por ver.</p>
                <small>Presiona “Agregar por ver” para comenzar.</small>
            </div>
        `;
        return;
    }

    grid.innerHTML = porver.map(item => `
        <article class="library-card">
            ${
                item.posterUrl
                    ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                    : `<div class="movie-poster-empty">${escapeHtml(item.titulo)}</div>`
            }

            <div class="library-card-body">
                <h3 class="library-card-title">${escapeHtml(item.titulo)}</h3>
                <p class="library-card-meta">
                    ${escapeHtml(item.tipoVisual)} ${item.anioEstreno ? "· " + item.anioEstreno : ""}
                </p>
                <span class="library-status">Por ver</span>
            </div>
        </article>
    `).join("");
}

function inicializarBuscadorPorVer() {
    const input = document.getElementById("porverSearchInput");
    const results = document.getElementById("porverResults");

    if (!input || !results) return;

    let timeout = null;

    input.addEventListener("input", function () {
        clearTimeout(timeout);

        const query = input.value.trim();

        if (query.length < 2) {
            results.innerHTML = `<p class="top5-empty">Escribe al menos 2 letras.</p>`;
            return;
        }

        results.innerHTML = `<p class="top5-empty">Buscando...</p>`;

        timeout = setTimeout(() => buscarContenidoPorVer(query), 450);
    });
}

async function buscarContenidoPorVer(query) {
    const results = document.getElementById("porverResults");

    try {
        const data = await apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);

        if (!data || data.length === 0) {
            results.innerHTML = `<p class="top5-empty">No se encontraron resultados.</p>`;
            return;
        }

        const items = data.map(normalizarContenidoApi);

        results.innerHTML = items.map((item, index) => `
            <button type="button" class="top5-result-btn" data-index="${index}">
                ${
                    item.posterUrl
                        ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                        : `<div class="top5-result-placeholder"></div>`
                }

                <span>
                    <strong>${escapeHtml(item.titulo)}</strong>
                    <small>${escapeHtml(item.tipoVisual)} ${item.anioEstreno ? "· " + item.anioEstreno : ""}</small>
                </span>
            </button>
        `).join("");

        document.querySelectorAll(".top5-result-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = Number(btn.dataset.index);
                agregarPorVer(items[index]);
            });
        });

    } catch (error) {
        console.error("Error buscando por ver:", error);
        results.innerHTML = `<p class="top5-empty">Error buscando contenido.</p>`;
    }
}

function agregarPorVer(item) {
    const existe = porver.some(p =>
        p.apiId === item.apiId &&
        p.proveedor === item.proveedor
    );

    if (!existe) {
        porver.unshift(item);
        guardarPorVer();
        renderPorVer();
    }

    document.getElementById("porverSearchInput").value = "";
    document.getElementById("porverResults").innerHTML =
        `<p class="top5-empty">Agregado correctamente.</p>`;
}

/* ===============================
   PINES
   IMPORTANTE:
   Por ver NO modifica los pines.
   Solo usa Top 5 + Vistas.
================================ */

function renderBioTags() {
    const container = document.getElementById("bioTags");
    if (!container) return;

    const top5Guardado = JSON.parse(localStorage.getItem(top5StorageKey())) || [];
    const vistasGuardadas = JSON.parse(localStorage.getItem(vistasStorageKey())) || [];

    const base = [...top5Guardado.filter(Boolean), ...vistasGuardadas];

    if (base.length === 0) {
        container.innerHTML = `<li><span class="bio-tag">🎬 Sin preferencias aún</span></li>`;
        return;
    }

    const conteo = {};

    base.forEach(item => {
        obtenerTagsDelItem(item).forEach(tag => {
            conteo[tag] = (conteo[tag] || 0) + 1;
        });
    });

    const tagsFinales = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 5);

    container.innerHTML = tagsFinales.map(tag => `
        <li>
            <span class="bio-tag">${iconoTag(tag)} ${escapeHtml(tag)}</span>
        </li>
    `).join("");
}

/* ===============================
   NORMALIZAR
================================ */

function normalizarContenidoApi(item) {
    const proveedor = item.apiProvider || item.proveedor || inferirProveedor(item);
    const tipoVisual = convertirTipoVisual(item.tipoContenido || item.tipo || "", proveedor);

    return {
        apiId: item.apiId || item.id || item.mal_id || "",
        proveedor,
        titulo: item.titulo || item.title || item.name || item.title_english || "Sin título",
        tipoVisual,
        tipoContenido: tipoVisual,
        posterUrl: item.posterUrl || item.imageUrl || item.coverUrl || item.images?.jpg?.image_url || "",
        anioEstreno:
            item.anioEstreno ||
            item.year ||
            obtenerAnioDesdeFecha(item.fechaEstreno || item.release_date || item.aired?.from),
        genero: item.genero || "",
        generos: item.generos || extraerGenerosApi(item),
        descripcion: item.descripcion || item.overview || item.synopsis || ""
    };
}

function obtenerTagsDelItem(item) {
    const tags = [
        ...(item.generos || []),
        item.genero,
        item.tipoVisual,
        item.tipoContenido,
        ...inferirGeneros(item)
    ];

    return tags
        .filter(Boolean)
        .map(normalizarNombreTag)
        .filter(tag => !["Contenido", "TMDB", "JIKAN", "API"].includes(tag))
        .filter((tag, index, array) => array.indexOf(tag) === index);
}

function inferirGeneros(item) {
    const texto = `
        ${item.titulo || ""}
        ${item.title || ""}
        ${item.name || ""}
        ${item.descripcion || ""}
        ${item.overview || ""}
        ${item.synopsis || ""}
    `.toLowerCase();

    const generos = [];

    if (texto.includes("romance") || texto.includes("amor") || texto.includes("love")) generos.push("Romance");
    if (texto.includes("terror") || texto.includes("horror")) generos.push("Terror");
    if (texto.includes("drama")) generos.push("Drama");
    if (texto.includes("action") || texto.includes("acción") || texto.includes("batalla")) generos.push("Acción");
    if (texto.includes("comedy") || texto.includes("comedia")) generos.push("Comedia");
    if (texto.includes("fantasy") || texto.includes("fantasía")) generos.push("Fantasía");
    if (texto.includes("sci-fi") || texto.includes("science fiction")) generos.push("Sci-Fi");

    if (String(item.proveedor || item.apiProvider || "").toUpperCase() === "JIKAN") {
        generos.push("Anime");
    }

    return generos;
}

function inferirProveedor(item) {
    if (item.mal_id || item.images?.jpg?.image_url) return "JIKAN";
    return "TMDB";
}

function convertirTipoVisual(tipo, proveedor) {
    const t = String(tipo || "").toUpperCase();
    const p = String(proveedor || "").toUpperCase();

    if (p === "JIKAN") return "Anime";
    if (t === "PELICULA" || t === "MOVIE") return "Película";
    if (t === "SERIE" || t === "TV") return "Serie";

    return tipo || "Contenido";
}

function extraerGenerosApi(item) {
    const generos = [];

    if (Array.isArray(item.generos)) generos.push(...item.generos);

    if (Array.isArray(item.genres)) {
        item.genres.forEach(g => {
            if (typeof g === "string") generos.push(g);
            else if (g?.name) generos.push(g.name);
        });
    }

    if (item.genero) generos.push(item.genero);

    return generos.map(normalizarNombreTag);
}

function normalizarNombreTag(tag) {
    if (!tag) return "";

    const mapa = {
        PELICULA: "Película",
        Pelicula: "Película",
        Movie: "Película",
        SERIE: "Serie",
        Series: "Serie",
        Anime: "Anime",
        Romance: "Romance",
        Drama: "Drama",
        Horror: "Terror",
        Terror: "Terror",
        Action: "Acción",
        Comedy: "Comedia",
        Fantasy: "Fantasía",
        "Science Fiction": "Sci-Fi"
    };

    return mapa[tag] || tag;
}

function iconoTag(tag) {
    const t = String(tag).toLowerCase();

    if (t.includes("romance")) return "❤️";
    if (t.includes("anime")) return "🌸";
    if (t.includes("terror")) return "👻";
    if (t.includes("drama")) return "🎭";
    if (t.includes("serie")) return "📺";
    if (t.includes("película") || t.includes("pelicula")) return "🎬";
    if (t.includes("acción") || t.includes("accion")) return "💥";
    if (t.includes("fantas")) return "✨";

    return "🎞️";
}

function obtenerAnioDesdeFecha(fecha) {
    if (!fecha) return null;
    return Number(String(fecha).slice(0, 4)) || null;
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}