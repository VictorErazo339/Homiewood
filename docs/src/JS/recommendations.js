const API_URL = "https://homiewood.onrender.com/api";

let usuarioActual = null;
let recomendaciones = [];
let paginaActual = 1;
const itemsPorPagina = 12;

document.addEventListener("DOMContentLoaded", async function () {
    await cargarUsuarioLogueado();
    await cargarRecomendaciones();

    inicializarBuscador();
    inicializarFiltros();
    inicializarPaginacion();

    renderizarRecomendaciones();
});

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw await response.text();
    }

    return response.json();
}

async function cargarUsuarioLogueado() {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!token) {
        window.location.href = "./login.html";
        return;
    }

    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarUsuario();
        return;
    }

    try {
        usuarioActual = await apiRequest("/auth/me");
        localStorage.setItem("usuario", JSON.stringify(usuarioActual));
        mostrarUsuario();
    } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "./login.html";
    }
}

function mostrarUsuario() {
    const username1 = document.getElementById("nombreUsuario");
    const username2 = document.getElementById("navbar-username");

    const texto = `@${usuarioActual?.username || usuarioActual?.nombre || "Usuario"}`;

    if (username1) username1.textContent = texto;
    if (username2) username2.textContent = texto;
}

async function cargarRecomendaciones() {
    try {
        const listas = await apiRequest("/me/listas");

        if (listas && listas.length > 0) {
            recomendaciones = await cargarRecomendacionesDelUsuario();
        } else {
            recomendaciones = await cargarRecomendacionesPopulares();
        }

    } catch (error) {
        console.warn("No se pudieron cargar listas/recomendaciones del usuario. Usando populares.");
        recomendaciones = await cargarRecomendacionesPopulares();
    }
}

async function cargarRecomendacionesDelUsuario() {
    try {
        const data = await apiRequest(`/recomendaciones/usuario/${usuarioActual.idUsuario}?limite=40`);

        if (!data || data.length === 0) {
            return cargarRecomendacionesPopulares();
        }

        return data.map(normalizarItemApi);

    } catch (error) {
        console.warn("Error cargando recomendaciones personalizadas:", error);
        return cargarRecomendacionesPopulares();
    }
}

async function cargarRecomendacionesPopulares() {
    const busquedas = [
        "stranger things",
        "one piece",
        "naruto",
        "interstellar",
        "parasite",
        "breaking bad",
        "attack on titan",
        "demon slayer"
    ];

    const resultados = [];

    for (const query of busquedas) {
        try {
            const data = await apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);
            resultados.push(...data.map(normalizarItemApi));
        } catch (error) {
            console.warn("Error buscando popular:", query);
        }
    }

    return eliminarDuplicados(resultados).slice(0, 40);
}

function normalizarItemApi(item) {
    return {
        titulo: item.titulo || item.title || item.nombre || "Sin título",
        tipo: convertirTipo(item.tipoContenido || item.tipo || item.type, item.proveedor),
        anio: item.anioEstreno || item.anio || item.year || "",
        genero: item.genero || item.generos?.[0] || "",
        idioma: item.idiomaOriginal || item.idioma || "",
        poster: item.posterUrl || item.imageUrl || item.coverUrl || "",
        desc: item.descripcion || item.overview || item.synopsis || "Sin descripción disponible.",
        rating: Math.round(item.puntajeExterno || item.rating || 4),
        director: item.director || item.proveedor || "Homiwood",
        cast: item.cast || []
    };
}

function convertirTipo(tipo, proveedor) {
    const tipoUpper = String(tipo || "").toUpperCase();
    const proveedorUpper = String(proveedor || "").toUpperCase();

    if (proveedorUpper === "JIKAN") return "Anime";
    if (tipoUpper === "PELICULA") return "Película";
    if (tipoUpper === "SERIE") return "Serie";

    return tipo || "Contenido";
}

function eliminarDuplicados(items) {
    const mapa = new Map();

    items.forEach(item => {
        const clave = item.titulo.toLowerCase();

        if (!mapa.has(clave)) {
            mapa.set(clave, item);
        }
    });

    return Array.from(mapa.values());
}

function inicializarBuscador() {
    const input = document.getElementById("recSearchInput");
    const clear = document.getElementById("recSearchClear");

    if (!input) return;

    let timeoutBusqueda = null;

    input.addEventListener("input", function () {
        const query = input.value.trim();

        clearTimeout(timeoutBusqueda);

        if (!query) {
            paginaActual = 1;
            cargarRecomendaciones().then(() => {
                renderizarRecomendaciones();
            });
            return;
        }

        timeoutBusqueda = setTimeout(async function () {
            try {
                const data = await apiRequest(
                    `/catalogo/buscar?query=${encodeURIComponent(query)}`
                );

                recomendaciones = eliminarDuplicados(
                    data.map(normalizarItemApi)
                );

                paginaActual = 1;
                cargarAnios();
                renderizarRecomendaciones();

            } catch (error) {
                console.error("Error buscando en APIs:", error);
                recomendaciones = [];
                paginaActual = 1;
                renderizarRecomendaciones();
            }
        }, 450);
    });

    if (clear) {
        clear.addEventListener("click", async function () {
            input.value = "";
            paginaActual = 1;

            await cargarRecomendaciones();
            cargarAnios();
            renderizarRecomendaciones();
        });
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
        const coincidePuntuacion = !puntuacion || Number(item.rating) >= Number(puntuacion);
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
    const empty = document.getElementById("recEmpty");
    const count = document.getElementById("recCount");

    if (!grid) return;

    const filtradas = obtenerRecomendacionesFiltradas();

    if (count) {
        count.textContent = `+${filtradas.length} títulos`;
    }

    if (filtradas.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.classList.add("show");
        renderizarPaginacion(0);
        return;
    }

    if (empty) empty.classList.remove("show");

    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const pagina = filtradas.slice(inicio, fin);

    grid.innerHTML = pagina.map(renderCard).join("");

    document.querySelectorAll(".rec-card").forEach(card => {
        card.addEventListener("click", function () {
            const index = Number(card.dataset.index);
            abrirModalPelicula(pagina[index]);
        });
    });

    renderizarPaginacion(filtradas.length);
}

function renderCard(item, index) {
    const poster = item.poster
        ? `<img src="${item.poster}" alt="${item.titulo}">`
        : `<div class="rec-card-placeholder">${item.titulo}</div>`;

    return `
        <article class="rec-card" data-index="${index}">
            <div class="rec-card-poster">
                ${poster}
                <span class="rec-rating">★ ${item.rating || 4}</span>
            </div>

            <div class="rec-card-info">
                <h3>${escapeHtml(item.titulo)}</h3>
                <p>${escapeHtml(item.director || "Homiwood")} · ${escapeHtml(item.anio || "")}</p>

                <div class="rec-card-tags">
                    <span class="tag">${escapeHtml(item.tipo)}</span>
                    ${item.genero ? `<span class="tag">${escapeHtml(item.genero)}</span>` : ""}
                </div>
            </div>
        </article>
    `;
}

function inicializarPaginacion() {
    const prev = document.getElementById("pagePrev");
    const next = document.getElementById("pageNext");

    if (prev) {
        prev.addEventListener("click", function () {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarRecomendaciones();
            }
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            const total = obtenerRecomendacionesFiltradas().length;
            const totalPaginas = Math.ceil(total / itemsPorPagina);

            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarRecomendaciones();
            }
        });
    }
}

function renderizarPaginacion(totalItems) {
    const numbers = document.getElementById("pageNumbers");
    const prev = document.getElementById("pagePrev");
    const next = document.getElementById("pageNext");

    if (!numbers) return;

    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

    numbers.innerHTML = "";

    if (prev) prev.disabled = paginaActual <= 1;
    if (next) next.disabled = paginaActual >= totalPaginas;

    for (let i = 1; i <= totalPaginas; i++) {
        numbers.innerHTML += `
            <button class="page-number ${i === paginaActual ? "active" : ""}" onclick="irAPagina(${i})">
                ${i}
            </button>
        `;
    }
}

function irAPagina(pagina) {
    paginaActual = pagina;
    renderizarRecomendaciones();
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function abrirModalPelicula(item) {
    const overlay = document.getElementById("filmModalOverlay");
    const poster = document.getElementById("filmModalPoster");
    const title = document.getElementById("filmModalTitle");
    const sub = document.getElementById("filmModalSub");
    const tags = document.getElementById("filmModalTags");
    const cast = document.getElementById("filmModalCast");
    const desc = document.getElementById("filmModalDesc");

    if (!overlay) return;

    poster.innerHTML = item.poster
        ? `<img src="${item.poster}" alt="${item.titulo}">`
        : item.titulo;

    title.textContent = item.titulo;
    sub.textContent = `${item.director || "Homiwood"} · ${item.anio || ""}`;
    desc.textContent = item.desc || "Sin descripción disponible.";

    tags.innerHTML = `
        <span class="tag">${escapeHtml(item.tipo)}</span>
        ${item.genero ? `<span class="tag">${escapeHtml(item.genero)}</span>` : ""}
    `;

    cast.innerHTML = Array.isArray(item.cast)
        ? item.cast.map(actor => `<span class="cast-chip">${escapeHtml(actor)}</span>`).join("")
        : "";

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
}

document.addEventListener("click", function (event) {
    if (event.target.closest("#filmModalClose")) {
        cerrarModalPelicula();
    }

    if (event.target.id === "filmModalOverlay") {
        cerrarModalPelicula();
    }
});

function cerrarModalPelicula() {
    const overlay = document.getElementById("filmModalOverlay");
    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "./login.html";
}

window.irAPagina = irAPagina;
window.cerrarSesion = cerrarSesion;