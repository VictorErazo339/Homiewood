import { apiRequest } from "../api/api.js";
import * as profileCommon from "./profileCommon.js";

let usuarioActual = null;
let porver = [];

const escapeHtml = profileCommon.escapeHtml;
const normalizarContenidoApi = profileCommon.normalizarContenidoApi;

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded porver optimizado y limpio");

    const contexto = profileCommon.iniciarPerfilComun();

    if (!contexto) return;

    usuarioActual = contexto.usuarioActual;

    const idUsuario = contexto.idUsuario;

    profileCommon.inicializarEditarPerfil();
    profileCommon.inicializarTop5Modal();
    profileCommon.inicializarLogrosModal();

    profileCommon.cargarTop5Local();
    profileCommon.renderTop5();
    profileCommon.renderBioTags();

    cargarPorVerLocal();
    renderPorVer();

    inicializarBuscadorPorVer();

    const resultados = await Promise.allSettled([
        profileCommon.cargarDatosUsuario(idUsuario).then(usuarioActualizado => {
            usuarioActual = usuarioActualizado;
        }),

        profileCommon.cargarCantidadPosts(idUsuario),

        profileCommon.cargarTop5DesdeBackend().then(() => {
            profileCommon.renderBioTags();
        }),

        profileCommon.sincronizarVistasParaTags(idUsuario).then(() => {
            profileCommon.renderBioTags();
        }),

        cargarPorVerDesdeBackend().then(() => {
            renderPorVer();
        }),

        profileCommon.cargarLogrosDestacadosHeaderRapido(idUsuario)
    ]);

    resultados.forEach((resultado, index) => {
        if (resultado.status === "rejected") {
            console.warn(`Carga parcial falló en porver.js tarea ${index}:`, resultado.reason);
        }
    });
});

function obtenerIdUsuario() {
    return profileCommon.obtenerIdUsuario();
}

function porverStorageKey() {
    return `homiwood_porver_${obtenerIdUsuario()}`;
}

/* ===============================
   POR VER
================================ */

function cargarPorVerLocal() {
    try {
        porver = JSON.parse(localStorage.getItem(porverStorageKey())) || [];
    } catch (error) {
        console.error("Error leyendo Por Ver desde localStorage:", error);
        porver = [];
    }
}

async function cargarPorVerDesdeBackend() {
    try {
        const idUsuario = obtenerIdUsuario();

        const data = await apiRequest(`/usuarios/${idUsuario}/listas/contenidos?estado=POR_VER`);

        porver = eliminarDuplicadosPorContenido(
            data.map(item => ({
                idListaContenido: item.idListaContenido,
                idLista: item.idLista,
                idContenido: item.idContenido,
                titulo: item.tituloContenido,
                tipoVisual: convertirTipoVisualDesdeBackend(item.tipoContenido),
                tipoBackend: item.tipoContenido,
                posterUrl: item.posterUrl,
                anioEstreno: item.anioEstreno,
                apiId: String(item.apiId || item.idContenido),
                proveedor: item.apiProvider || "BD",
                generos: item.generos || []
            }))
        );

        guardarPorVerLocal();

        return porver;
    } catch (error) {
        console.error("Error cargando Por Ver desde backend:", error);
        cargarPorVerLocal();

        return porver;
    }
}

function guardarPorVerLocal() {
    localStorage.setItem(porverStorageKey(), JSON.stringify(porver));
}

function eliminarDuplicadosPorContenido(items) {
    return items.filter((item, index, array) =>
        index === array.findIndex(i =>
            String(i.idContenido || i.apiId) === String(item.idContenido || item.apiId) &&
            String(i.proveedor || "BD") === String(item.proveedor || "BD")
        )
    );
}

function convertirTipoVisualDesdeBackend(tipoBackend) {
    const tipo = String(tipoBackend || "").toUpperCase();

    if (tipo === "PELICULA") return "Película";
    if (tipo === "ANIME") return "Anime";

    return "Serie";
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
                    ${escapeHtml(item.tipoVisual)}
                    ${item.anioEstreno ? " · " + item.anioEstreno : ""}
                </p>

                <span class="library-status">Por ver</span>
            </div>
        </article>
    `).join("");
}

/* ===============================
   BUSCADOR POR VER
================================ */

function inicializarBuscadorPorVer() {
    const input = document.getElementById("porverSearchInput");
    const results = document.getElementById("porverResults");

    if (!input || !results) return;

    if (input.dataset.searchInitialized === "true") return;
    input.dataset.searchInitialized = "true";

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

    if (!results) return;

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
                    <small>
                        ${escapeHtml(item.tipoVisual)}
                        ${item.anioEstreno ? " · " + item.anioEstreno : ""}
                    </small>
                </span>
            </button>
        `).join("");

        document.querySelectorAll("#porverResults .top5-result-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = Number(btn.dataset.index);
                agregarPorVer(items[index]);
            });
        });
    } catch (error) {
        console.error("Error buscando Por Ver:", error);
        results.innerHTML = `<p class="top5-empty">Error buscando contenido.</p>`;
    }
}

async function agregarPorVer(item) {
    const existe = porver.some(p =>
        String(p.idContenido || p.apiId) === String(item.idContenido || item.apiId) &&
        String(p.proveedor || "BD") === String(item.proveedor || "BD")
    );

    if (!existe) {
        porver.unshift(item);
        porver = eliminarDuplicadosPorContenido(porver);

        guardarPorVerLocal();
        renderPorVer();

        try {
            await guardarPorVerEnBackend(item);
            await profileCommon.cargarLogrosDestacadosHeaderRapido(obtenerIdUsuario());
        } catch (error) {
            console.error("Error guardando Por Ver en backend:", error);
        }
    }

    limpiarBuscadorPorVer("Agregado correctamente.");
}

async function guardarPorVerEnBackend(item) {
    const idUsuario = obtenerIdUsuario();

    return await apiRequest(`/usuarios/${idUsuario}/listas/porver/contenidos/externo`, {
        method: "POST",
        body: JSON.stringify({
            proveedor: item.proveedor,
            apiId: String(item.apiId),
            titulo: item.titulo,
            tipoContenido: item.tipoBackend || profileCommon.convertirTipoBackend(item.tipoVisual),
            descripcion: item.descripcion || "",
            fechaEstreno: item.fechaEstreno || null,
            anioEstreno: item.anioEstreno || null,
            posterUrl: item.posterUrl || "",
            idiomaOriginal: item.idioma || "",
            puntajeExterno: item.puntajeExterno || 0,
            estado: "POR_VER",
            generos: item.generos || []
        })
    });
}

function limpiarBuscadorPorVer(mensaje = "") {
    const input = document.getElementById("porverSearchInput");
    const results = document.getElementById("porverResults");

    if (input) input.value = "";

    if (results) {
        results.innerHTML = mensaje
            ? `<p class="top5-empty">${escapeHtml(mensaje)}</p>`
            : "";
    }
}
