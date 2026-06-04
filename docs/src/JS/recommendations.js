import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let recomendaciones = [];
let paginaActual = 1;

const ITEMS_POR_PAGINA = 12;

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        window.location.href = "./login.html";
        return;
    }

    usuarioActual = usuario;

    mostrarUsuario(usuario);
    inicializarBuscador();
    inicializarFiltros();
    inicializarPaginacion();
    inicializarModal();

    await cargarRecomendaciones(usuario.idUsuario || usuario.id);
});

// ===============================
// USUARIO
// ===============================

function mostrarUsuario(usuario) {
    const nombreEl = document.getElementById("nombreUsuario");

    if (nombreEl) {
        nombreEl.textContent = `@${usuario.username || usuario.nombre || "usuario"}`;
    }
}

// ===============================
// CARGAR RECOMENDACIONES
// ===============================

async function cargarRecomendaciones(idUsuario) {
    const grid = document.getElementById("recGrid");
    const count = document.getElementById("recCount");

    try {
        if (grid) {
            grid.innerHTML = `<p class="rec-loading">Cargando recomendaciones...</p>`;
        }

        const data = await apiRequest(`/recomendaciones/usuario/${idUsuario}?limite=30`);

        recomendaciones = eliminarDuplicados(data.map(normalizarRecomendacion));

        if (count) {
            count.textContent = `${recomendaciones.length} títulos`;
        }

        cargarAnios();
        paginaActual = 1;
        renderizarRecomendaciones();

    } catch (error) {
        console.error("Error cargando recomendaciones:", error);

        if (grid) {
            grid.innerHTML = `
                <div class="rec-empty visible">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>No se pudieron cargar las recomendaciones.</p>
                </div>
            `;
        }
    }
}

// ===============================
// NORMALIZAR DATOS
// ===============================

function normalizarRecomendacion(item) {
    const tipo = formatearTipo(item.tipoContenido || item.tipo);
    const motivo = item.motivo || "Recomendado para ti";

    return {
        idContenido: item.idContenido || null,
        titulo: item.titulo || item.title || "Sin título",
        tipoContenido: item.tipoContenido || item.tipo || "Contenido",
        tipoVisual: tipo,
        anioEstreno: item.anioEstreno || item.anio || item.year || null,
        posterUrl: item.posterUrl || item.poster || item.imageUrl || "",
        promedioCalificaciones: item.promedioCalificaciones || item.rating || 0,
        motivo,
        genero: item.genero || item.generos?.[0] || "",
        generos: item.generos || [],
        idioma: item.idioma || item.idiomaOriginal || "",
        descripcion: item.descripcion || item.desc || item.overview || item.synopsis || "",
        apiProvider: item.apiProvider || item.proveedor || "",
        apiId: item.apiId || ""
    };
}

function eliminarDuplicados(items) {
    const mapa = new Map();

    items.forEach(item => {
        const clave = `${item.titulo}-${item.anioEstreno || ""}`.toLowerCase();

        if (!mapa.has(clave)) {
            mapa.set(clave, item);
        }
    });

    return Array.from(mapa.values());
}

// ===============================
// BUSCADOR
// ===============================

function inicializarBuscador() {
    const input = document.getElementById("recSearchInput");
    const clear = document.getElementById("recSearchClear");

    if (!input) return;

    input.addEventListener("input", () => {
        paginaActual = 1;

        if (clear) {
            clear.classList.toggle("visible", input.value.trim().length > 0);
        }

        renderizarRecomendaciones();
    });

    if (clear) {
        clear.addEventListener("click", () => {
            input.value = "";
            clear.classList.remove("visible");
            paginaActual = 1;
            renderizarRecomendaciones();
        });
    }
}

// ===============================
// FILTROS
// ===============================

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
            elemento.addEventListener("change", () => {
                paginaActual = 1;
                renderizarRecomendaciones();
            });
        }
    });

    const reset = document.getElementById("filtersReset");
    const resetEmpty = document.getElementById("recEmptyReset");

    if (reset) reset.addEventListener("click", limpiarFiltros);
    if (resetEmpty) resetEmpty.addEventListener("click", limpiarFiltros);
}

function cargarAnios() {
    const select = document.getElementById("filterAnio");
    if (!select) return;

    const anios = [...new Set(
        recomendaciones
            .map(item => item.anioEstreno)
            .filter(Boolean)
    )].sort((a, b) => b - a);

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

    const clear = document.getElementById("recSearchClear");
    if (clear) clear.classList.remove("visible");

    paginaActual = 1;
    renderizarRecomendaciones();
}

function obtenerRecomendacionesFiltradas() {
    const busqueda = document.getElementById("recSearchInput")?.value.toLowerCase().trim() || "";
    const tipo = document.getElementById("filterTipo")?.value || "";
    const genero = document.getElementById("filterGenero")?.value || "";
    const puntuacion = document.getElementById("filterPuntuacion")?.value || "";
    const anio = document.getElementById("filterAnio")?.value || "";
    const idioma = document.getElementById("filterIdioma")?.value || "";
    const orden = document.getElementById("filterOrden")?.value || "reciente";

    let data = recomendaciones.filter(item => {
        const generos = [
            item.genero,
            ...(Array.isArray(item.generos) ? item.generos : [])
        ].filter(Boolean);

        const coincideBusqueda =
            !busqueda ||
            item.titulo.toLowerCase().includes(busqueda) ||
            item.descripcion.toLowerCase().includes(busqueda);

        const coincideTipo =
            !tipo ||
            item.tipoVisual === tipo ||
            item.tipoContenido === tipo ||
            (tipo === "Anime" && generos.includes("Anime"));

        const coincideGenero =
            !genero ||
            generos.includes(genero);

        const coincidePuntuacion =
            !puntuacion ||
            Number(item.promedioCalificaciones || 0) >= Number(puntuacion);

        const coincideAnio =
            !anio ||
            String(item.anioEstreno || "") === String(anio);

        const coincideIdioma =
            !idioma ||
            item.idioma === idioma;

        return coincideBusqueda &&
            coincideTipo &&
            coincideGenero &&
            coincidePuntuacion &&
            coincideAnio &&
            coincideIdioma;
    });

    if (orden === "az") {
        data.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    if (orden === "za") {
        data.sort((a, b) => b.titulo.localeCompare(a.titulo));
    }

    if (orden === "reciente") {
        data.sort((a, b) => Number(b.anioEstreno || 0) - Number(a.anioEstreno || 0));
    }

    if (orden === "antiguo") {
        data.sort((a, b) => Number(a.anioEstreno || 0) - Number(b.anioEstreno || 0));
    }

    return data;
}

// ===============================
// RENDER
// ===============================

function renderizarRecomendaciones() {
    const grid = document.getElementById("recGrid");
    const empty = document.getElementById("recEmpty");
    const count = document.getElementById("recCount");

    if (!grid) return;

    const filtradas = obtenerRecomendacionesFiltradas();

    if (count) {
        count.textContent = `${filtradas.length} títulos`;
    }

    if (filtradas.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.classList.add("visible");
        renderizarPaginacion(0);
        return;
    }

    if (empty) empty.classList.remove("visible");

    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const pagina = filtradas.slice(inicio, fin);

    grid.innerHTML = pagina.map((item, index) => renderCard(item, index)).join("");

    document.querySelectorAll(".rec-card").forEach(card => {
        card.addEventListener("click", () => {
            const index = Number(card.dataset.index);
            abrirModalPelicula(pagina[index]);
        });
    });

    renderizarPaginacion(filtradas.length);
}

function renderCard(item, index) {
    return `
        <article class="rec-card" data-index="${index}">
            ${
                item.posterUrl
                    ? `<img class="rec-card-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                    : `<div class="rec-card-poster-fallback">${escapeHtml(item.titulo)}</div>`
            }

            <div class="rec-card-rating">
                <i class="bi bi-star-fill"></i>
                ${item.promedioCalificaciones ? Number(item.promedioCalificaciones).toFixed(1) : "0.0"}
            </div>

            <div class="rec-card-info">
                <h3 class="rec-card-title">${escapeHtml(item.titulo)}</h3>

                <p class="rec-card-meta">
                    ${escapeHtml(item.tipoVisual)}
                    ${item.anioEstreno ? " · " + item.anioEstreno : ""}
                </p>

                <div class="rec-card-tags">
                    <span class="rec-card-tag tag-yellow">
                        ${escapeHtml(formatearMotivo(item.motivo))}
                    </span>
                </div>
            </div>
        </article>
    `;
}

// ===============================
// PAGINACIÓN
// ===============================

function inicializarPaginacion() {
    const prev = document.getElementById("pagePrev");
    const next = document.getElementById("pageNext");

    if (prev) {
        prev.addEventListener("click", () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarRecomendaciones();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            const total = obtenerRecomendacionesFiltradas().length;
            const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarRecomendaciones();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }
}

function renderizarPaginacion(totalItems) {
    const numbers = document.getElementById("pageNumbers");
    const prev = document.getElementById("pagePrev");
    const next = document.getElementById("pageNext");
    const wrap = document.getElementById("paginationWrap");

    if (!numbers) return;

    const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);

    if (wrap) {
        wrap.style.display = totalPaginas > 1 ? "flex" : "none";
    }

    numbers.innerHTML = "";

    if (prev) prev.disabled = paginaActual <= 1;
    if (next) next.disabled = paginaActual >= totalPaginas;

    for (let i = 1; i <= totalPaginas; i++) {
        numbers.innerHTML += `
            <button type="button" class="page-btn ${i === paginaActual ? "active" : ""}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    numbers.querySelectorAll("[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            paginaActual = Number(btn.dataset.page);
            renderizarRecomendaciones();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

// ===============================
// MODAL
// ===============================

function inicializarModal() {
    const close = document.getElementById("filmModalClose");
    const overlay = document.getElementById("filmModalOverlay");

    if (close) close.addEventListener("click", cerrarModalPelicula);

    if (overlay) {
        overlay.addEventListener("click", event => {
            if (event.target === overlay) cerrarModalPelicula();
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") cerrarModalPelicula();
    });
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

    if (poster) {
        poster.innerHTML = item.posterUrl
            ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
            : escapeHtml(item.titulo);
    }

    if (title) title.textContent = item.titulo;

    if (sub) {
        sub.textContent = [
            item.tipoVisual,
            item.anioEstreno,
            formatearMotivo(item.motivo)
        ].filter(Boolean).join(" · ");
    }

    if (desc) {
        desc.textContent = item.descripcion || item.motivo || "Sin descripción disponible.";
    }

    if (tags) {
        const generos = [
            item.tipoVisual,
            item.genero,
            ...(Array.isArray(item.generos) ? item.generos : [])
        ].filter(Boolean);

        tags.innerHTML = [...new Set(generos)]
            .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join("");
    }

    if (cast) {
        cast.innerHTML = "";
    }

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function cerrarModalPelicula() {
    const overlay = document.getElementById("filmModalOverlay");
    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// ===============================
// HELPERS
// ===============================

function formatearTipo(tipo) {
    if (!tipo) return "Contenido";

    const t = String(tipo).toUpperCase();

    if (t === "PELICULA") return "Película";
    if (t === "SERIE") return "Serie";

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