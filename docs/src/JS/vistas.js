import { apiRequest } from "../api/api.js";
import * as profileCommon from "./profileCommon.js";

let usuarioActual = null;
let vistas = [];

const escapeHtml = profileCommon.escapeHtml;
const normalizarContenidoApi = profileCommon.normalizarContenidoApi;

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded vistas optimizado y limpio");

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

    cargarVistasLocal();
    renderVistas();

    inicializarBuscadorVistas();

    const resultados = await Promise.allSettled([
        profileCommon.cargarDatosUsuario(idUsuario).then(usuarioActualizado => {
            usuarioActual = usuarioActualizado;
        }),

        profileCommon.cargarCantidadPosts(idUsuario),

        profileCommon.cargarTop5DesdeBackend().then(() => {
            profileCommon.renderBioTags();
        }),

        cargarVistasDesdeBackend().then(() => {
            renderVistas();
            profileCommon.renderBioTags();
        }),

        profileCommon.cargarLogrosDestacadosHeaderRapido(idUsuario)
    ]);

    resultados.forEach((resultado, index) => {
        if (resultado.status === "rejected") {
            console.warn(`Carga parcial falló en vistas.js tarea ${index}:`, resultado.reason);
        }
    });
});

function obtenerIdUsuario() {
    return profileCommon.obtenerIdUsuario();
}

function vistasStorageKey() {
    return profileCommon.vistasStorageKey();
}

/* ===============================
   VISTAS
================================ */

function cargarVistasLocal() {
    try {
        vistas = JSON.parse(localStorage.getItem(vistasStorageKey())) || [];
    } catch (error) {
        console.error("Error leyendo vistas desde localStorage:", error);
        vistas = [];
    }
}

async function cargarVistasDesdeBackend() {
    try {
        const idUsuario = obtenerIdUsuario();

        const [dataVistas, dataCalificaciones] = await Promise.all([
            apiRequest(`/usuarios/${idUsuario}/listas/contenidos?estado=VISTO`),
            apiRequest(`/calificaciones/usuario/${idUsuario}`)
        ]);

        const calificacionesPorContenido = new Map();

        dataCalificaciones.forEach(calificacion => {
            const idContenido = calificacion.idContenido || calificacion.contenidoId;

            if (idContenido) {
                calificacionesPorContenido.set(Number(idContenido), calificacion);
            }
        });

        vistas = eliminarDuplicadosPorContenido(
            dataVistas.map(item => {
                const calificacion = calificacionesPorContenido.get(Number(item.idContenido));

                return {
                    idListaContenido: item.idListaContenido,
                    idLista: item.idLista,
                    idContenido: item.idContenido,
                    titulo: item.tituloContenido,
                    tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
                    tipoBackend: item.tipoContenido,
                    posterUrl: item.posterUrl,
                    anioEstreno: item.anioEstreno,
                    apiId: String(item.apiId || item.idContenido),
                    proveedor: item.apiProvider || "BD",
                    generos: item.generos || [],
                    puntaje: calificacion?.puntaje || 0,
                    comentario: calificacion?.comentario || ""
                };
            })
        );

        guardarVistasLocal();

        return vistas;
    } catch (error) {
        console.error("Error cargando vistas desde backend:", error);
        cargarVistasLocal();

        return vistas;
    }
}

function guardarVistasLocal() {
    localStorage.setItem(vistasStorageKey(), JSON.stringify(vistas));
}

function eliminarDuplicadosPorContenido(items) {
    return items.filter((item, index, array) =>
        index === array.findIndex(i =>
            String(i.idContenido || i.apiId) === String(item.idContenido || item.apiId) &&
            String(i.proveedor || "BD") === String(item.proveedor || "BD")
        )
    );
}

function renderVistas() {
    const grid = document.getElementById("vistasGrid");

    if (!grid) return;

    if (vistas.length === 0) {
        grid.innerHTML = `
            <div class="top5-empty-state">
                <p>Aún no agregas películas o series vistas.</p>
                <small>Presiona “Agregar vista” para comenzar.</small>
            </div>
        `;
        return;
    }

    grid.innerHTML = vistas.map(item => `
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

                <span class="library-status">Vista</span>

                <div style="margin-top:.45rem;">
                    ${renderEstrellasLectura(item.puntaje || 0)}
                </div>
            </div>
        </article>
    `).join("");
}

function renderEstrellasLectura(puntaje) {
    const valor = Number(puntaje || 0);

    if (valor <= 0) {
        return `<small style="color:#aaa;">Sin puntaje</small>`;
    }

    let html = `<div class="vista-stars-read" aria-label="Puntaje ${valor} de 5">`;

    for (let i = 1; i <= 5; i++) {
        html += `<span style="color:${i <= valor ? "#ffd166" : "#777"};">★</span>`;
    }

    html += ` <small style="color:#ccc;">${valor}/5</small></div>`;

    return html;
}

/* ===============================
   BUSCADOR VISTAS
================================ */

function inicializarBuscadorVistas() {
    const input = document.getElementById("vistasSearchInput");
    const results = document.getElementById("vistasResults");

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

        timeout = setTimeout(() => buscarContenidoVistas(query), 450);
    });
}

async function buscarContenidoVistas(query) {
    const results = document.getElementById("vistasResults");

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

        document.querySelectorAll("#vistasResults .top5-result-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = Number(btn.dataset.index);
                mostrarSelectorPuntaje(items[index]);
            });
        });
    } catch (error) {
        console.error("Error buscando vistas:", error);
        results.innerHTML = `<p class="top5-empty">Error buscando contenido.</p>`;
    }
}

/* ===============================
   SELECTOR DE PUNTAJE
================================ */

function mostrarSelectorPuntaje(item) {
    const results = document.getElementById("vistasResults");

    if (!results) return;

    results.innerHTML = `
        <div class="vista-rating-box" style="
            background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.12);
            border-radius:16px;
            padding:1rem;
            margin-top:.75rem;
        ">
            <div style="display:flex; gap:1rem; align-items:center;">
                ${
                    item.posterUrl
                        ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}" style="width:64px;height:92px;object-fit:cover;border-radius:10px;">`
                        : `<div style="width:64px;height:92px;border-radius:10px;background:#2a1a4a;"></div>`
                }

                <div>
                    <strong style="display:block;color:#fff;">${escapeHtml(item.titulo)}</strong>
                    <small style="color:#aaa;">
                        ${escapeHtml(item.tipoVisual)}
                        ${item.anioEstreno ? " · " + item.anioEstreno : ""}
                    </small>

                    <p style="margin:.45rem 0 0;color:#ddd;font-size:.9rem;">
                        ¿Qué puntaje le das?
                    </p>

                    <div id="vistaRatingStars" data-rating="0" style="display:flex;gap:.35rem;margin-top:.35rem;">
                        ${[1, 2, 3, 4, 5].map(valor => `
                            <button type="button"
                                    class="vista-star-btn"
                                    data-value="${valor}"
                                    style="
                                        background:none;
                                        border:none;
                                        color:#777;
                                        font-size:1.6rem;
                                        cursor:pointer;
                                        line-height:1;
                                    ">
                                ★
                            </button>
                        `).join("")}
                    </div>

                    <small id="vistaRatingText" style="display:block;color:#aaa;margin-top:.25rem;">
                        Selecciona de 1 a 5 estrellas.
                    </small>
                </div>
            </div>

            <div style="display:flex;gap:.75rem;margin-top:1rem;">
                <button type="button" id="confirmarVistaBtn" disabled style="
                    padding:.55rem 1rem;
                    border-radius:999px;
                    border:none;
                    background:#8b5cf6;
                    color:white;
                    opacity:.5;
                    cursor:not-allowed;
                ">
                    Guardar como vista
                </button>

                <button type="button" id="cancelarVistaBtn" style="
                    padding:.55rem 1rem;
                    border-radius:999px;
                    border:1px solid rgba(255,255,255,.18);
                    background:transparent;
                    color:#ddd;
                ">
                    Cancelar
                </button>
            </div>
        </div>
    `;

    inicializarSelectorPuntaje(item);
}

function inicializarSelectorPuntaje(item) {
    const starsWrap = document.getElementById("vistaRatingStars");
    const ratingText = document.getElementById("vistaRatingText");
    const confirmarBtn = document.getElementById("confirmarVistaBtn");
    const cancelarBtn = document.getElementById("cancelarVistaBtn");

    if (!starsWrap || !confirmarBtn) return;

    starsWrap.querySelectorAll(".vista-star-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rating = Number(btn.dataset.value);

            starsWrap.dataset.rating = String(rating);

            starsWrap.querySelectorAll(".vista-star-btn").forEach(star => {
                const value = Number(star.dataset.value);
                star.style.color = value <= rating ? "#ffd166" : "#777";
            });

            if (ratingText) {
                ratingText.textContent = `${rating}/5 estrellas`;
            }

            confirmarBtn.disabled = false;
            confirmarBtn.style.opacity = "1";
            confirmarBtn.style.cursor = "pointer";
        });
    });

    confirmarBtn.addEventListener("click", async () => {
        const puntaje = Number(starsWrap.dataset.rating || 0);

        if (puntaje < 1 || puntaje > 5) {
            alert("Selecciona un puntaje entre 1 y 5.");
            return;
        }

        confirmarBtn.disabled = true;
        confirmarBtn.textContent = "Guardando...";

        await agregarVista(item, puntaje);
    });

    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", limpiarBuscadorVistas);
    }
}

/* ===============================
   GUARDAR VISTA + CALIFICACIÓN
================================ */

async function agregarVista(item, puntaje) {
    try {
        const contenidoEnLista = await guardarVistaEnBackend(item);

        const idContenido =
            contenidoEnLista.idContenido ||
            contenidoEnLista.contenido?.idContenido ||
            item.idContenido;

        if (!idContenido) {
            throw new Error("No se pudo obtener el idContenido guardado.");
        }

        await guardarCalificacionVista(idContenido, puntaje);

        const itemFinal = {
            ...item,
            idContenido,
            puntaje
        };

        const existe = vistas.some(v =>
            String(v.idContenido || v.apiId) === String(itemFinal.idContenido || itemFinal.apiId) &&
            String(v.proveedor || "BD") === String(itemFinal.proveedor || "BD")
        );

        if (!existe) {
            vistas.unshift(itemFinal);
        } else {
            vistas = vistas.map(v => {
                const mismo =
                    String(v.idContenido || v.apiId) === String(itemFinal.idContenido || itemFinal.apiId) &&
                    String(v.proveedor || "BD") === String(itemFinal.proveedor || "BD");

                return mismo ? { ...v, ...itemFinal } : v;
            });
        }

        vistas = eliminarDuplicadosPorContenido(vistas);

        guardarVistasLocal();
        renderVistas();
        profileCommon.renderBioTags();

        await Promise.allSettled([
            profileCommon.cargarCantidadPosts(obtenerIdUsuario()),
            profileCommon.cargarLogrosDestacadosHeaderRapido(obtenerIdUsuario())
        ]);

        limpiarBuscadorVistas(
            `Agregado correctamente con ${puntaje}/5 estrellas.`
        );
    } catch (error) {
        console.error("Error guardando vista:", error);
        limpiarBuscadorVistas("No se pudo guardar la vista.");
    }
}

async function guardarVistaEnBackend(item) {
    const idUsuario = obtenerIdUsuario();

    return await apiRequest(`/usuarios/${idUsuario}/listas/vistas/contenidos/externo`, {
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
            estado: "VISTO",
            generos: item.generos || []
        })
    });
}

async function guardarCalificacionVista(idContenido, puntaje) {
    return await apiRequest("/calificaciones", {
        method: "POST",
        body: JSON.stringify({
            idUsuario: obtenerIdUsuario(),
            idContenido,
            puntaje,
            comentario: null
        })
    });
}

function limpiarBuscadorVistas(mensaje = "") {
    const input = document.getElementById("vistasSearchInput");
    const results = document.getElementById("vistasResults");

    if (input) input.value = "";

    if (results) {
        results.innerHTML = mensaje
            ? `<p class="top5-empty">${escapeHtml(mensaje)}</p>`
            : "";
    }
}
