import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let top5 = [null, null, null, null, null];
let peliculaSeleccionada = null;
let posicionSeleccionada = null;
let peliculaPerfilSeleccionada = null;

document.addEventListener("DOMContentLoaded", async function () {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        window.location.href = "./login.html";
        return;
    }

    usuarioActual = JSON.parse(usuarioGuardado);

    await cargarDatosUsuario(usuarioActual.idUsuario);
    await cargarPostsUsuario(usuarioActual.idUsuario);

    cargarTop5();
    renderTop5();
    renderBioTags();

    inicializarTop5Modal();
    inicializarComposerPerfil();
});

/* ===============================
   USUARIO
================================ */

async function cargarDatosUsuario(idUsuario) {
    try {
        const usuario = await apiRequest(`/usuarios/${idUsuario}`);

        document.getElementById("profileName").textContent =
            usuario.nombre || usuario.username || "Usuario";

        document.getElementById("profileUsername").textContent =
            `@${usuario.username || "usuario"}`;

    } catch (e) {
        console.error("Error cargando datos del usuario:", e);

        document.getElementById("profileName").textContent =
            usuarioActual.nombre || usuarioActual.username || "Usuario";

        document.getElementById("profileUsername").textContent =
            `@${usuarioActual.username || "usuario"}`;
    }
}

/* ===============================
   POSTS / RESEÑAS
================================ */

async function cargarPostsUsuario(idUsuario) {
    try {
        const calificaciones = await apiRequest(`/calificaciones/usuario/${idUsuario}`);

        const feed = document.getElementById("feed");
        const statPosts = document.getElementById("statPosts");

        if (statPosts) {
            statPosts.textContent = calificaciones.length;
        }

        if (!feed) return;

        if (calificaciones.length === 0) {
            feed.innerHTML = `
                <p style="color:#aaa; text-align:center; margin-top:2rem;">
                    Aún no has publicado nada.
                </p>
            `;
            return;
        }

        feed.innerHTML = calificaciones
            .slice()
            .reverse()
            .map(c => renderPost(c))
            .join("");

    } catch (e) {
        console.error("Error cargando posts:", e);
    }
}

function renderPost(c) {
    const fecha = c.fechaCalificacion
        ? c.fechaCalificacion.split("T")[0]
        : "";

    const titulo =
        c.tituloContenido ||
        c.contenidoTitulo ||
        c.titulo ||
        "Contenido";

    const tipo =
        c.tipoContenido ||
        c.contenidoTipo ||
        "Contenido";

    const poster =
        c.posterUrl ||
        c.contenidoPosterUrl ||
        "";

    return `
        <div class="post-card" id="post-${c.idCalificacion || ""}">
            <div class="post-cover" style="${poster
            ? `background-image:url('${poster}')`
            : "background:linear-gradient(135deg,#2a1a4a,#5a2a8a)"
        }"></div>

            <div class="post-body">
                <div class="post-movie-info">
                    <span class="post-movie-title">${escapeHtml(titulo)}</span>
                    <span class="post-movie-meta">${escapeHtml(tipo)}</span>
                </div>

                <p class="post-text">${escapeHtml(c.comentario || "")}</p>

                <div class="post-footer">
                    <span class="post-date">${escapeHtml(fecha)}</span>
                </div>
            </div>
        </div>
    `;
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

    let timeoutBusqueda = null;

    trigger.addEventListener("click", () => {
        body.classList.toggle("open");
        input.focus();
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
            document.getElementById("profileSelectedFilm").classList.remove("is-visible");
            input.value = "";
            validarPostPerfil();
        });
    }
}

async function buscarContenidoPerfil(query) {
    const results = document.getElementById("profileFilmResults");

    try {
        const data = await apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);

        if (!data || data.length === 0) {
            results.innerHTML = `<div class="dropdown-message">Sin resultados.</div>`;
            return;
        }

        const items = data.map(normalizarContenidoApi);

        results.innerHTML = items.map((item, index) => `
            <div class="film-dropdown-item" data-index="${index}">
                ${item.posterUrl
                ? `<img class="dropdown-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                : `<div class="dropdown-poster"></div>`
            }

                <div>
                    <div class="dropdown-title">${escapeHtml(item.titulo)}</div>
                    <div class="dropdown-meta">
                        ${escapeHtml(item.tipoVisual)} ${item.anioEstreno ? "· " + item.anioEstreno : ""}
                    </div>
                </div>
            </div>
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

    document.getElementById("profileFilmSearch").value = "";

    const selected = document.getElementById("profileSelectedFilm");
    const cover = document.getElementById("profileSelectedCover");
    const title = document.getElementById("profileSelectedTitle");
    const meta = document.getElementById("profileSelectedMeta");

    cover.style.backgroundImage = item.posterUrl ? `url('${item.posterUrl}')` : "";
    title.textContent = item.titulo;
    meta.textContent = `${item.tipoVisual} ${item.anioEstreno ? "· " + item.anioEstreno : ""}`;

    selected.classList.add("is-visible");

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
    const comentario = textarea.value.trim();

    if (!peliculaPerfilSeleccionada || !comentario) return;

    try {
        const contenidoGuardado = await guardarContenidoExterno(peliculaPerfilSeleccionada);

        await apiRequest("/calificaciones", {
            method: "POST",
            body: JSON.stringify({
                idUsuario: usuarioActual.idUsuario,
                idContenido: contenidoGuardado.idContenido,
                puntaje: 5,
                comentario: comentario
            })
        });

        await cargarPostsUsuario(usuarioActual.idUsuario);
        limpiarComposerPerfil();

    } catch (error) {
        console.error("Error publicando reseña:", error);
        alert("No se pudo publicar la reseña.");
    }
}

async function guardarContenidoExterno(item) {
    return await apiRequest("/catalogo/guardar", {
        method: "POST",
        body: JSON.stringify({
            proveedor: item.proveedor,
            apiId: String(item.apiId),
            titulo: item.titulo,
            tipoContenido: item.tipoBackend,
            descripcion: item.descripcion || "",
            fechaEstreno: item.fechaEstreno || null,
            anioEstreno: item.anioEstreno || null,
            posterUrl: item.posterUrl || "",
            idiomaOriginal: item.idioma || "",
            puntajeExterno: item.puntajeExterno || 0
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

    if (input) input.value = "";
    if (textarea) textarea.value = "";
    if (results) results.innerHTML = "";
    if (selected) selected.classList.remove("is-visible");
    if (body) body.classList.remove("open");

    validarPostPerfil();
}

/* ===============================
   TOP 5
================================ */

function top5StorageKey() {
    return `homiwood_top5_${usuarioActual.idUsuario}`;
}

function cargarTop5() {
    const guardado = localStorage.getItem(top5StorageKey());

    if (guardado) {
        top5 = JSON.parse(guardado);
    }
}

function guardarTop5() {
    localStorage.setItem(top5StorageKey(), JSON.stringify(top5));
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
        actualizarSlotLabels();
        return;
    }

    grid.innerHTML = top5.map((item, index) => {
        if (!item) {
            return `
                <article class="movie-card movie-card-empty">
                    <span class="top5-rank">#${index + 1}</span>
                    <div class="movie-poster movie-poster-empty">
                        Vacío
                    </div>
                </article>
            `;
        }

        return `
            <article class="movie-card">
                <span class="top5-rank">#${index + 1}</span>

                ${item.posterUrl
                ? `<img class="movie-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                : `<div class="movie-poster movie-poster-empty">${escapeHtml(item.titulo)}</div>`
            }
            </article>
        `;
    }).join("");

    actualizarSlotLabels();
}

function inicializarTop5Modal() {
    const input = document.getElementById("top5SearchInput");
    const saveBtn = document.getElementById("saveTop5Btn");
    const results = document.getElementById("top5Results");
    const slots = document.querySelectorAll(".top5-slot-btn");

    if (!input || !saveBtn || !results) return;

    let timeoutBusqueda = null;

    input.addEventListener("input", function () {
        clearTimeout(timeoutBusqueda);

        const query = input.value.trim();

        if (query.length < 2) {
            results.innerHTML = `<p class="top5-empty">Escribe al menos 2 letras para buscar.</p>`;
            return;
        }

        results.innerHTML = `<p class="top5-empty">Buscando...</p>`;

        timeoutBusqueda = setTimeout(async function () {
            await buscarPeliculasTop5(query);
        }, 450);
    });

    slots.forEach(slot => {
        slot.addEventListener("click", function () {
            posicionSeleccionada = Number(slot.dataset.pos);

            slots.forEach(s => s.classList.remove("is-selected"));
            slot.classList.add("is-selected");
        });
    });

    saveBtn.addEventListener("click", function () {
        if (!peliculaSeleccionada) {
            alert("Primero elige una película o serie.");
            return;
        }

        if (posicionSeleccionada === null) {
            alert("Elige una posición del 1 al 5.");
            return;
        }

        top5[posicionSeleccionada] = peliculaSeleccionada;

        guardarTop5();
        renderTop5();
        renderBioTags();
        limpiarModalTop5();

        const modalElement = document.getElementById("top5Modal");

        if (window.bootstrap && modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    });
}

async function buscarPeliculasTop5(query) {
    const results = document.getElementById("top5Results");

    if (!results) return;

    try {
        const data = await apiRequest(`/catalogo/buscar?query=${encodeURIComponent(query)}`);

        if (!data || data.length === 0) {
            results.innerHTML = `<p class="top5-empty">No se encontraron resultados.</p>`;
            return;
        }

        const normalizadas = data.map(normalizarContenidoApi);
        renderResultadosBusqueda(normalizadas);

    } catch (error) {
        console.error("Error buscando en catálogo:", error);
        results.innerHTML = `<p class="top5-empty">No se pudo conectar con la API.</p>`;
    }
}

function renderResultadosBusqueda(items) {
    const results = document.getElementById("top5Results");

    if (!results) return;

    if (!items || items.length === 0) {
        results.innerHTML = `<p class="top5-empty">Sin resultados.</p>`;
        return;
    }

    results.innerHTML = items.map((item, index) => `
        <button type="button" class="top5-result-btn" data-index="${index}">
            ${item.posterUrl
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

            peliculaSeleccionada = items[index];

            document.querySelectorAll(".top5-result-btn").forEach(b => b.classList.remove("is-selected"));
            btn.classList.add("is-selected");

            renderPreviewTop5(peliculaSeleccionada);
        });
    });
}

function renderPreviewTop5(item) {
    const preview = document.getElementById("top5Preview");

    if (!preview) return;

    preview.innerHTML = `
        ${item.posterUrl
            ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
            : ""
        }

        <strong>${escapeHtml(item.titulo)}</strong>
        <small>${escapeHtml(item.tipoVisual)} ${item.anioEstreno ? "· " + item.anioEstreno : ""}</small>
    `;
}

function actualizarSlotLabels() {
    document.querySelectorAll(".top5-slot-btn").forEach(slot => {
        const pos = Number(slot.dataset.pos);
        const span = slot.querySelector("span");

        if (!span) return;

        span.textContent = top5[pos]?.titulo || "Vacío";
    });
}

function limpiarModalTop5() {
    const input = document.getElementById("top5SearchInput");
    const results = document.getElementById("top5Results");
    const preview = document.getElementById("top5Preview");

    if (input) input.value = "";
    if (results) results.innerHTML = `<p class="top5-empty">Escribe para buscar en TMDB y Jikan.</p>`;
    if (preview) preview.textContent = "Elige una película o serie";

    peliculaSeleccionada = null;
    posicionSeleccionada = null;

    document.querySelectorAll(".top5-result-btn, .top5-slot-btn")
        .forEach(el => el.classList.remove("is-selected"));
}

/* ===============================
   NORMALIZAR CONTENIDO
================================ */

function normalizarContenidoApi(item) {
    const proveedor = item.apiProvider || item.proveedor || inferirProveedor(item);
    const tipoVisual = convertirTipoVisual(item.tipoContenido || item.tipo || "", proveedor);
    const tipoBackend = convertirTipoBackend(tipoVisual);

    const generosApi = extraerGenerosApi(item);
    const generosInferidos = inferirGeneros(item);

    const generosFinales = [
        ...generosApi,
        ...generosInferidos
    ]
        .filter(Boolean)
        .map(g => normalizarNombreTag(g))
        .filter((g, index, arr) => arr.indexOf(g) === index);

    return {
        idContenido: item.idContenido || null,
        apiId: item.apiId || item.id || item.mal_id || "",
        proveedor: proveedor,
        titulo: item.titulo || item.title || item.name || item.title_english || "Sin título",
        tipoVisual: tipoVisual,
        tipoBackend: tipoBackend,
        tipoContenido: tipoVisual,
        posterUrl: item.posterUrl || item.imageUrl || item.coverUrl || item.images?.jpg?.image_url || "",
        anioEstreno: item.anioEstreno || item.year || obtenerAnioDesdeFecha(item.fechaEstreno || item.release_date || item.aired?.from),
        fechaEstreno: item.fechaEstreno || item.release_date || item.aired?.from || null,
        idioma: item.idioma || item.idiomaOriginal || item.original_language || "",
        puntajeExterno: item.puntajeExterno || item.vote_average || item.score || 0,
        genero: generosFinales[0] || "",
        generos: generosFinales,
        descripcion: item.descripcion || item.overview || item.synopsis || ""
    };
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
    if (t === "SERIE" || t === "TV" || t === "TV SHOW") return "Serie";

    return tipo || "Contenido";
}

function convertirTipoBackend(tipoVisual) {
    if (tipoVisual === "Película") return "PELICULA";
    return "SERIE";
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

    return generos
        .filter(Boolean)
        .map(g => normalizarNombreTag(g))
        .filter((g, index, arr) => arr.indexOf(g) === index);
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

    if (String(item.apiProvider || item.proveedor || "").toUpperCase() === "JIKAN") {
        generos.push("Anime");
    }

    return generos;
}

function normalizarNombreTag(tag) {
    if (!tag) return "";

    const limpio = String(tag).trim();

    const mapa = {
        "PELICULA": "Película",
        "Pelicula": "Película",
        "Movie": "Película",
        "TV Show": "Serie",
        "SERIE": "Serie",
        "Series": "Serie",
        "Animation": "Animación",
        "Action": "Acción",
        "Adventure": "Aventura",
        "Comedy": "Comedia",
        "Fantasy": "Fantasía",
        "Horror": "Terror",
        "Mystery": "Misterio",
        "Science Fiction": "Sci-Fi",
        "Thriller": "Suspenso",
        "Crime": "Crimen",
        "Family": "Familia",
        "Music": "Música"
    };

    return mapa[limpio] || limpio;
}

function obtenerAnioDesdeFecha(fecha) {
    if (!fecha) return null;
    return Number(String(fecha).slice(0, 4)) || null;
}

/* ===============================
   TAGS / PINES
================================ */

function renderBioTags() {
    const container = document.getElementById("bioTags");
    if (!container) return;

    const idUsuario = usuarioActual.idUsuario || usuarioActual.id;

    const vistasGuardadas = JSON.parse(localStorage.getItem(`homiwood_vistas_${idUsuario}`)) || [];
    const top5Guardado = JSON.parse(localStorage.getItem(`homiwood_top5_${idUsuario}`)) || [];

    const base = [...top5Guardado.filter(Boolean), ...vistasGuardadas];

    if (base.length === 0) {
        container.innerHTML = `<li><span class="bio-tag">🎬 Sin preferencias aún</span></li>`;
        return;
    }

    const conteo = {};

    base.forEach(item => {
        const tags = obtenerTagsDelItem(item);

        tags.forEach(tag => {
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

function obtenerGenerosDelItem(item) {
    const generos = [];

    if (Array.isArray(item.generos)) generos.push(...item.generos);
    if (item.genero) generos.push(item.genero);

    generos.push(...inferirGeneros(item));

    return generos
        .filter(Boolean)
        .map(g => normalizarNombreTag(g))
        .filter(g => !esTagGenerico(g))
        .filter((g, index, arr) => arr.indexOf(g) === index);
}

function esTagGenerico(tag) {
    return ["Contenido", "Homiwood", "TMDB", "JIKAN", "API"].includes(tag);
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
function iconoTag(tag) {
    const t = String(tag).toLowerCase();

    if (t.includes("terror")) return "👻";
    if (t.includes("drama")) return "🎭";
    if (t.includes("serie")) return "📺";
    if (t.includes("película") || t.includes("pelicula")) return "🎬";
    if (t.includes("anime")) return "🌸";
    if (t.includes("acción") || t.includes("accion")) return "💥";
    if (t.includes("romance")) return "❤️";
    if (t.includes("comedia")) return "😂";
    if (t.includes("fantas")) return "✨";
    if (t.includes("sci")) return "🚀";

    return "🎞️";
}

/* ===============================
   HELPERS
================================ */

function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}