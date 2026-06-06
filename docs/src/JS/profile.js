import { apiRequest } from "../api/api.js";
import * as profileCommon from "./profileCommon.js";

console.log("profile.js cargado correctamente");

let usuarioActual = null;
let peliculaPerfilSeleccionada = null;

const escapeHtml = profileCommon.escapeHtml;
const normalizarContenidoApi = profileCommon.normalizarContenidoApi;

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded profile optimizado y limpio");

    const contexto = profileCommon.iniciarPerfilComun();

    if (!contexto) return;

    usuarioActual = contexto.usuarioActual;

    const idUsuario = contexto.idUsuario;

    profileCommon.inicializarEditarPerfil();
    profileCommon.inicializarTop5Modal();
    profileCommon.inicializarLogrosModal();

    inicializarComposerPerfil();

    profileCommon.cargarTop5Local();
    profileCommon.renderTop5();
    profileCommon.renderBioTags();

    mostrarEstadoFeed("Cargando posts...");

    const resultados = await Promise.allSettled([
        profileCommon.cargarDatosUsuario(idUsuario).then(usuarioActualizado => {
            usuarioActual = usuarioActualizado;
        }),

        cargarPostsUsuario(idUsuario),

        profileCommon.cargarTop5DesdeBackend().then(() => {
            profileCommon.renderBioTags();
        }),

        profileCommon.sincronizarVistasParaTags(idUsuario).then(() => {
            profileCommon.renderBioTags();
        }),

        profileCommon.cargarLogrosDestacadosHeaderRapido(idUsuario)
    ]);

    resultados.forEach((resultado, index) => {
        if (resultado.status === "rejected") {
            console.warn(`Carga parcial falló en profile.js tarea ${index}:`, resultado.reason);
        }
    });
});

function obtenerIdUsuario() {
    return profileCommon.obtenerIdUsuario();
}

/* ===============================
   POSTS / RESEÑAS
================================ */

async function cargarPostsUsuario(idUsuario) {
    try {
        const calificaciones = await apiRequest(`/calificaciones/usuario/${idUsuario}`);
        const publicaciones = calificaciones.filter(esPublicacion);

        const statPosts = document.getElementById("statPosts");

        if (statPosts) {
            statPosts.textContent = publicaciones.length;
        }

        const feed = document.getElementById("feed");

        if (!feed) return;

        if (publicaciones.length === 0) {
            mostrarEstadoFeed("Aún no has publicado nada.");
            return;
        }

        feed.innerHTML = publicaciones
            .slice()
            .reverse()
            .map(renderPost)
            .join("");
    } catch (error) {
        console.error("Error cargando posts:", error);
        mostrarEstadoFeed("No se pudieron cargar los posts.");
    }
}

function mostrarEstadoFeed(mensaje) {
    const feed = document.getElementById("feed");

    if (!feed) return;

    feed.innerHTML = `
        <p style="color:#aaa; text-align:center; margin-top:2rem;">
            ${escapeHtml(mensaje)}
        </p>
    `;
}

function esPublicacion(calificacion) {
    return calificacion.comentario &&
        String(calificacion.comentario).trim().length > 0;
}

function renderPost(calificacion) {
    const fecha = calificacion.fechaCalificacion
        ? String(calificacion.fechaCalificacion).split("T")[0]
        : "";

    const titulo =
        calificacion.tituloContenido ||
        calificacion.contenidoTitulo ||
        calificacion.titulo ||
        "Contenido";

    const tipo =
        calificacion.tipoContenido ||
        calificacion.contenidoTipo ||
        "Contenido";

    const poster =
        calificacion.posterUrl ||
        calificacion.contenidoPosterUrl ||
        "";

    const puntaje = Number(calificacion.puntaje || 0);

    return `
        <article class="post-card" id="post-${calificacion.idCalificacion || ""}">
            <div class="post-cover" style="${
                poster
                    ? `background-image:url('${poster}')`
                    : "background:linear-gradient(135deg,#2a1a4a,#5a2a8a)"
            }"></div>

            <div class="post-body">
                <div class="post-movie-info">
                    <span class="post-movie-title">${escapeHtml(titulo)}</span>
                    <span class="post-movie-meta">${escapeHtml(tipo)}</span>
                </div>

                ${puntaje > 0 ? `<div class="post-rating">${renderEstrellas(puntaje)}</div>` : ""}

                <p class="post-text">${escapeHtml(calificacion.comentario || "")}</p>

                <div class="post-footer">
                    <span class="post-date">${escapeHtml(fecha)}</span>
                </div>
            </div>
        </article>
    `;
}

function renderEstrellas(puntaje) {
    let html = `<span aria-label="${puntaje} de 5 estrellas">`;

    for (let i = 1; i <= 5; i++) {
        html += i <= puntaje ? "★" : "☆";
    }

    html += `</span>`;
    return html;
}

/* ===============================
   COMPOSER PERFIL
================================ */

function inicializarComposerPerfil() {
    const trigger = document.getElementById("composerTrigger");
    const body = document.getElementById("composerBody");
    const input = document.getElementById("profileFilmSearch");
    const results = document.getElementById("profileFilmResults");
    const textarea = document.getElementById("profilePostText");
    const publishBtn = document.getElementById("publishProfilePost");
    const cancelBtn = document.getElementById("cancelProfilePost");
    const removeBtn = document.getElementById("removeProfileFilm");

    if (!trigger || !body || !input || !results || !textarea || !publishBtn) return;

    if (body.dataset.composerInitialized === "true") return;
    body.dataset.composerInitialized = "true";

    let timeoutBusqueda = null;

    trigger.addEventListener("click", () => {
        const isOpen = body.classList.toggle("open");
        trigger.setAttribute("aria-expanded", String(isOpen));
        body.setAttribute("aria-hidden", String(!isOpen));

        if (isOpen) input.focus();
    });

    input.addEventListener("input", () => {
        clearTimeout(timeoutBusqueda);

        const query = input.value.trim();

        if (query.length < 2) {
            results.innerHTML = "";
            return;
        }

        results.innerHTML = `<div class="dropdown-message">Buscando...</div>`;

        timeoutBusqueda = setTimeout(() => buscarContenidoPerfil(query), 450);
    });

    textarea.addEventListener("input", validarPostPerfil);
    publishBtn.addEventListener("click", publicarResenaPerfil);

    if (cancelBtn) {
        cancelBtn.addEventListener("click", limpiarComposerPerfil);
    }

    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            peliculaPerfilSeleccionada = null;
            document.getElementById("profileSelectedFilm")?.classList.remove("is-visible");
            input.value = "";
            validarPostPerfil();
        });
    }
}

async function buscarContenidoPerfil(query) {
    const results = document.getElementById("profileFilmResults");

    if (!results) return;

    try {
        const data = await apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);

        if (!data || data.length === 0) {
            results.innerHTML = `<div class="dropdown-message">Sin resultados.</div>`;
            return;
        }

        const items = data.map(normalizarContenidoApi);

        results.innerHTML = items.map((item, index) => `
            <button type="button" class="film-dropdown-item" data-index="${index}">
                ${
                    item.posterUrl
                        ? `<img class="dropdown-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                        : `<div class="dropdown-poster"></div>`
                }

                <span>
                    <span class="dropdown-title">${escapeHtml(item.titulo)}</span>
                    <small class="dropdown-meta">
                        ${escapeHtml(item.tipoVisual)} ${item.anioEstreno ? "· " + item.anioEstreno : ""}
                    </small>
                </span>
            </button>
        `).join("");

        document.querySelectorAll(".film-dropdown-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = Number(btn.dataset.index);
                seleccionarPeliculaPerfil(items[index]);
                results.innerHTML = "";
            });
        });
    } catch (error) {
        console.error("Error buscando contenido:", error);
        results.innerHTML = `<div class="dropdown-message is-error">Error buscando contenido.</div>`;
    }
}

function seleccionarPeliculaPerfil(item) {
    peliculaPerfilSeleccionada = item;

    const search = document.getElementById("profileFilmSearch");
    const selected = document.getElementById("profileSelectedFilm");
    const cover = document.getElementById("profileSelectedCover");
    const title = document.getElementById("profileSelectedTitle");
    const meta = document.getElementById("profileSelectedMeta");

    if (search) search.value = "";

    if (cover) {
        cover.style.backgroundImage = item.posterUrl ? `url('${item.posterUrl}')` : "";
    }

    if (title) title.textContent = item.titulo;

    if (meta) {
        meta.textContent = `${item.tipoVisual} ${item.anioEstreno ? "· " + item.anioEstreno : ""}`;
    }

    selected?.classList.add("is-visible");

    validarPostPerfil();
}

function validarPostPerfil() {
    const textarea = document.getElementById("profilePostText");
    const publishBtn = document.getElementById("publishProfilePost");

    if (!publishBtn || !textarea) return;

    publishBtn.disabled = !(peliculaPerfilSeleccionada && textarea.value.trim());
}

async function publicarResenaPerfil() {
    const textarea = document.getElementById("profilePostText");
    const publishBtn = document.getElementById("publishProfilePost");

    if (!textarea || !publishBtn) return;

    const comentario = textarea.value.trim();

    if (!peliculaPerfilSeleccionada || !comentario) return;

    publishBtn.disabled = true;
    publishBtn.textContent = "Posteando...";

    try {
        const contenidoGuardado = await guardarContenidoExterno(peliculaPerfilSeleccionada);

        await apiRequest("/calificaciones", {
            method: "POST",
            body: JSON.stringify({
                idUsuario: obtenerIdUsuario(),
                idContenido: contenidoGuardado.idContenido,
                puntaje: 5,
                comentario
            })
        });

        await Promise.allSettled([
            cargarPostsUsuario(obtenerIdUsuario()),
            profileCommon.sincronizarVistasParaTags(obtenerIdUsuario()).then(() => {
                profileCommon.renderBioTags();
            }),
            profileCommon.cargarLogrosDestacadosHeaderRapido(obtenerIdUsuario())
        ]);

        limpiarComposerPerfil();
    } catch (error) {
        console.error("Error publicando reseña:", error);
        alert("No se pudo publicar la reseña.");
    } finally {
        publishBtn.textContent = "Postear";
        validarPostPerfil();
    }
}

async function guardarContenidoExterno(item) {
    return await apiRequest("/catalogo/guardar", {
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
            generos: item.generos || []
        })
    });
}

function limpiarComposerPerfil() {
    peliculaPerfilSeleccionada = null;

    const input = document.getElementById("profileFilmSearch");
    const textarea = document.getElementById("profilePostText");
    const results = document.getElementById("profileFilmResults");
    const selected = document.getElementById("profileSelectedFilm");
    const body = document.getElementById("composerBody");
    const trigger = document.getElementById("composerTrigger");

    if (input) input.value = "";
    if (textarea) textarea.value = "";
    if (results) results.innerHTML = "";
    if (selected) selected.classList.remove("is-visible");

    if (body) {
        body.classList.remove("open");
        body.setAttribute("aria-hidden", "true");
    }

    if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
    }

    validarPostPerfil();
}
