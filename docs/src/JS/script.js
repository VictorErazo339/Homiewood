import { obtenerUsuarioAutenticado } from "../api/authApi.js";
import { buscarTmdb, buscarAnime, guardarContenidoExterno } from "../api/catalogoApi.js";
import { apiRequest } from "../api/api.js";

// const API_URL = "http://localhost:8080/api";

const API_URL = "https://homiewood.onrender.com/api";

let usuarioActual = null;
let selectedFilm = null;

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", async function () {
    console.log("script.js cargado correctamente");

    await cargarUsuarioLogueado();
    inicializarBuscadorPeliculas();
    inicializarPublicador();
    inicializarNavbar();
    inicializarModalPelicula();
    inicializarSidebarDrawer();
    inicializarComposer();
    inicializarListasFeed();
    await cargarFeed();
});

// ===============================
// USUARIO LOGUEADO
// ===============================

async function cargarUsuarioLogueado() {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    const nombreUsuario = document.getElementById("navbar-username");

    if (!token) {
        console.warn("No hay token. Redirigiendo al login.");
        window.location.href = "/Homiewood/html/login.html";
        return;
    }

    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        if (nombreUsuario) {
            nombreUsuario.textContent = `@${usuarioActual.username || usuarioActual.nombre || "Usuario"}`;
        }
        return;
    }

    try {
        const usuario = await obtenerUsuarioAutenticado();
        usuarioActual = usuario;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        if (nombreUsuario) {
            nombreUsuario.textContent = `@${usuario.username || usuario.nombre || "Usuario"}`;
        }
    } catch (error) {
        console.error("Error cargando usuario:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/Homiewood/html/login.html";
    }
}

function obtenerNombreUsuarioActual() {
    return usuarioActual?.username || usuarioActual?.nombre || "Usuario";
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/Homiewood/html/login.html";
}

// ===============================
// UTILIDADES
// ===============================

function timeNow() {
    return new Date().toLocaleString("es-CL", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function tagClass(tag) {
    const blue = ["Anime", "Sci-Fi", "Misterio", "SERIE", "Serie"];
    const yellow = ["TV Show", "Aventura", "Acción", "Fantasía"];
    const teal = ["Película", "PELICULA", "Drama", "Romance"];
    if (blue.includes(tag)) return "tag-blue";
    if (yellow.includes(tag)) return "tag-yellow";
    if (teal.includes(tag)) return "tag-teal";
    return "tag-blue";
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ===============================
// FEED DESDE BACKEND (PAGINADO)
// ===============================

const POSTS_PER_PAGE = 10;
let feedPagina = 1;
let feedTodos = [];

async function cargarFeed() {
    try {
        const calificaciones = await apiRequest("/calificaciones");
        feedTodos = calificaciones.reverse();
        feedPagina = 1;
        renderFeedPagina();
    } catch (e) {
        console.log("Error cargando feed:", e);
    }
}

async function renderFeedPagina() {
    const feed = document.getElementById("feed");
    if (!feed) return;

    const totalPaginas = Math.ceil(feedTodos.length / POSTS_PER_PAGE);
    const inicio = (feedPagina - 1) * POSTS_PER_PAGE;
    const fin = inicio + POSTS_PER_PAGE;
    const pagina = feedTodos.slice(inicio, fin);

    feed.innerHTML = pagina.map(c => renderCalificacion(c)).join("");

    for (const c of pagina) {
        await cargarLikes(c.idCalificacion);
    }

    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    let paginacionEl = document.getElementById("feedPaginacion");
    if (!paginacionEl) {
        paginacionEl = document.createElement("div");
        paginacionEl.id = "feedPaginacion";
        paginacionEl.className = "feed-pagination";
        document.getElementById("feed").after(paginacionEl);
    }

    if (totalPaginas <= 1) {
        paginacionEl.innerHTML = "";
        return;
    }

    let html = `<button class="pagination-btn" id="pagPrev" aria-label="Página anterior" ${feedPagina === 1 ? "disabled" : ""}>&#8592;</button>`;

    for (let i = 1; i <= totalPaginas; i++) {
        const esPuntos = (i > 2 && i < feedPagina - 1) || (i < totalPaginas - 1 && i > feedPagina + 1);
        const esAdyacente = Math.abs(i - feedPagina) <= 1 || i === 1 || i === totalPaginas;

        if (esPuntos) {
            if (html.slice(-4) !== "...") html += `<span class="pagination-btn" style="cursor:default;opacity:0.4">...</span>`;
        } else if (esAdyacente) {
            html += `<button class="pagination-btn ${i === feedPagina ? "active" : ""}" data-pagina="${i}">${i}</button>`;
        }
    }

    html += `<button class="pagination-btn" id="pagNext" aria-label="Página siguiente" ${feedPagina === totalPaginas ? "disabled" : ""}>&#8594;</button>`;

    paginacionEl.innerHTML = html;

    paginacionEl.querySelectorAll("[data-pagina]").forEach(btn => {
        btn.addEventListener("click", () => {
            feedPagina = parseInt(btn.dataset.pagina);
            renderFeedPagina();
            document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    const prev = document.getElementById("pagPrev");
    const next = document.getElementById("pagNext");

    if (prev) {
        prev.addEventListener("click", () => {
            if (feedPagina > 1) {
                feedPagina--;
                renderFeedPagina();
                document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            const total = Math.ceil(feedTodos.length / POSTS_PER_PAGE);
            if (feedPagina < total) {
                feedPagina++;
                renderFeedPagina();
                document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }
}


function renderEstrellas(puntaje, total = 10) {
    let html = '<div class="post-film-rating-stars">';
    for (let i = 1; i <= total; i++) {
        html += `<i class="bi ${i <= puntaje ? 'bi-star-fill' : 'bi-star'}"></i>`;
    }
    html += '</div>';
    return html;
}

function renderCalificacion(c) {
    const fecha = c.fechaCalificacion ? c.fechaCalificacion.split("T")[0] : "";
    const tipo = c.tipoContenido || "Contenido";
    const puntaje = c.puntaje || 0;

    const posterStyle = c.posterUrl
        ? `background-image:url('${c.posterUrl}');background-size:cover;background-position:center;`
        : 'background:linear-gradient(135deg,#2a1a4a,#5a2a8a)';

    const posterContent = c.posterUrl ? '' : escapeHtml(c.tituloContenido);

    const tagsHtml = `<span class="tag ${tagClass(tipo)}">${escapeHtml(tipo)}</span>`;

    const ratingHtml = puntaje > 0
        ? `<div class="post-film-rating">
               ${renderEstrellas(puntaje)}
           </div>`
        : '';

    return `
    <div class="post-card" id="post-${c.idCalificacion}">
        <div class="timestamp">${fecha}</div>

        <div class="post-layout">

            <!-- Columna 1: Poster -->
            <div class="post-col-poster">
                <div class="post-thumb" style="${posterStyle}"
                    data-film-id="${c.idCalificacion}">
                    ${posterContent}
                </div>
            </div>

            <!-- Columna 2: Datos de la película -->
            <div class="post-col-film">
                <div class="post-film-title">${escapeHtml(c.tituloContenido || "Sin título")}</div>
                <div class="d-flex gap-2 flex-wrap">
                ${tagsHtml}
                </div>
                ${c.director ? `<div class="post-film-meta">Dir. ${escapeHtml(c.director)} ${c.anio ? '· ' + escapeHtml(String(c.anio)) : ''}</div>` : ''}
                ${c.protagonistas ? `<div class="post-film-cast">${escapeHtml(c.protagonistas)}</div>` : ''}
                ${c.descripcion ? `<p class="post-film-desc">${escapeHtml(c.descripcion)}</p>` : ''}
                ${ratingHtml}
                <div class="add-to-list-wrap" id="list-wrap-${c.idCalificacion}">
                    <button type="button" class="add-to-list-btn post-add-list-btn"
                        aria-expanded="false"
                        aria-label="Agregar a lista"
                        data-post-id="${c.idCalificacion}">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <div class="add-to-list-dropdown" id="post-list-dropdown-${c.idCalificacion}" aria-hidden="true">
                        <button type="button" class="list-option" data-list="watchlist" data-post-id="${c.idCalificacion}">
                            <img src="../img/WATCHLIST(noglow).webp" width="40px" alt="Watchlist">
                            <span>Watchlist</span>
                            <i class="bi bi-check2 list-check"></i>
                        </button>
                        <button type="button" class="list-option" data-list="porver" data-post-id="${c.idCalificacion}">
                            <img src="../img/PENDINGLIST(noglow).webp" width="40px" alt="Por ver">
                            <span>Por ver</span>
                            <i class="bi bi-check2 list-check"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Columna 3: Info social -->
            <div class="post-col-social">
                <div class="username">
                    <div class="user-icon">👤</div>
                    ${escapeHtml(c.username || c.nombreUsuario)}
                </div>
                <p class="post-text mb-0">${escapeHtml(c.comentario || "")}</p>

                <div class="post-footer-row">
                    <button class="comment-toggle" onclick="toggleComments(${c.idCalificacion})">
                        <img src="../img/hamstercomment.webp" alt="Comentar" width="40px">
                        <span id="comment-count-${c.idCalificacion}">0 comentarios</span>
                    </button>
                    <div class="post-actions">
                        <button id="btn-like-${c.idCalificacion}" onclick="toggleLike(${c.idCalificacion}, 'LIKE')">
                            <img src="../img/postlike.webp" alt="Me gustó" width="50px" class="glow-image">
                            <span id="count-like-${c.idCalificacion}">0</span>
                        </button>
                        <button id="btn-dislike-${c.idCalificacion}" onclick="toggleLike(${c.idCalificacion}, 'DISLIKE')">
                            <img src="../img/postdislike.webp" alt="No me gustó" width="50px" class="glow-image">
                            <span id="count-dislike-${c.idCalificacion}">0</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>

        <div class="comment-section" id="comments-${c.idCalificacion}">
            <div class="comment-list" id="comment-list-${c.idCalificacion}"></div>
            <div class="comment-input-row">
                <input type="text" id="comment-input-${c.idCalificacion}"
                       placeholder="Escribe un comentario..."
                       onkeydown="if(event.key==='Enter') addComment(${c.idCalificacion})">
                <button onclick="addComment(${c.idCalificacion})">Comentar</button>
            </div>
        </div>
    </div>`;
}



// ===============================
// LIKES
// ===============================

async function cargarLikes(idCalificacion) {
    try {
        const data = await apiRequest(
            `/likes-calificacion/${idCalificacion}/${usuarioActual.idUsuario}`
        );
        actualizarLikesUI(data);
    } catch (e) {
        console.log("Error cargando likes:", e);
    }
}

function actualizarLikesUI(data) {
    const id = data.idCalificacion;

    const countLike = document.getElementById(`count-like-${id}`);
    const countDislike = document.getElementById(`count-dislike-${id}`);
    const btnLike = document.getElementById(`btn-like-${id}`);
    const btnDislike = document.getElementById(`btn-dislike-${id}`);

    if (countLike) countLike.textContent = data.totalLikes;
    if (countDislike) countDislike.textContent = data.totalDislikes;

    if (btnLike) btnLike.classList.toggle("active", data.tipoUsuario === "LIKE");
    if (btnDislike) btnDislike.classList.toggle("active", data.tipoUsuario === "DISLIKE");
}

async function toggleLike(idCalificacion, tipo) {
    try {
        const data = await apiRequest("/likes-calificacion", {
            method: "POST",
            body: JSON.stringify({
                idCalificacion: idCalificacion,
                idUsuario: usuarioActual.idUsuario,
                tipo: tipo
            })
        });
        actualizarLikesUI(data);
    } catch (e) {
        console.log("Error en toggleLike:", e);
    }
}



// ===============================
// COMENTARIOS
// ===============================

function renderComment(comment) {
    return `
    <div class="comment">
        <div class="c-avatar">👤</div>
        <div>
            <div class="c-name">${escapeHtml(comment.user)}</div>
            <div class="c-text">${escapeHtml(comment.text)}</div>
            <div class="c-time">${escapeHtml(comment.time)}</div>
        </div>
    </div>`;
}

async function cargarComentarios(idCalificacion) {
    try {
        const comentarios = await apiRequest(`/comentarios-calificacion/${idCalificacion}`);
        const list = document.getElementById(`comment-list-${idCalificacion}`);
        const toggle = document.querySelector(`#post-${idCalificacion} .comment-toggle`);

        if (list) {
            list.innerHTML = comentarios.map(c => renderComment({
                user: c.username,
                text: c.texto,
                time: c.fechaComentario ? c.fechaComentario.split("T")[0] : "ahora mismo"
            })).join("");
        }

        if (toggle) {
            const count = comentarios.length;
            const countSpan = document.getElementById(`comment-count-${idCalificacion}`);
            if (countSpan) {
                countSpan.textContent = `${count} comentario${count !== 1 ? "s" : ""}`;
            } else {
                toggle.innerHTML = `<img src="../img/hamstercomment.webp" alt="Comentar" width="40px"> ${count} comentario${count !== 1 ? "s" : ""}`;
            }
        }
    } catch (e) {
        console.log("Error cargando comentarios:", e);
    }
}

async function toggleComments(id) {
    const section = document.getElementById(`comments-${id}`);
    if (!section) return;
    const isOpen = section.classList.contains("open");
    section.classList.toggle("open");
    if (!isOpen) {
        await cargarComentarios(id);
    }
}

async function addComment(id) {
    const input = document.getElementById(`comment-input-${id}`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    try {
        await apiRequest("/comentarios-calificacion", {
            method: "POST",
            body: JSON.stringify({
                idCalificacion: id,
                idUsuario: usuarioActual.idUsuario,
                texto: text
            })
        });

        input.value = "";
        input.focus();
        await cargarComentarios(id);

    } catch (e) {
        console.log("Error agregando comentario:", e);
    }
}

// ===============================
// BUSCADOR DE PELÍCULAS/SERIES
// ===============================

function inicializarBuscadorPeliculas() {

    const filmSearchInput = document.getElementById("filmSearchInput");
    const filmDropdown = document.getElementById("filmDropdown");

    if (!filmSearchInput || !filmDropdown) return;

    let searchTimeout = null;



    filmSearchInput.addEventListener("input", () => {
        const q = filmSearchInput.value.trim();
        if (!q) { filmDropdown.classList.remove("open"); return; }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const [tmdb, anime] = await Promise.allSettled([
                    buscarTmdb(q),
                    buscarAnime(q)
                ]);

                console.log("TMDB:", tmdb);
                console.log("Anime:", anime);



                const resultados = [
                    ...(tmdb.status === "fulfilled" ? tmdb.value : []),
                    ...(anime.status === "fulfilled" ? anime.value : []),
                ];

                if (!resultados.length) { filmDropdown.classList.remove("open"); return; }

                filmDropdown._data = resultados;
                filmDropdown.innerHTML = resultados.map((f, i) => `
                    <div class="film-option" data-index="${i}">
                        <div class="mini-cover" style="background:linear-gradient(135deg,#2a1a4a,#5a2a8a); overflow:hidden; padding:0">
                            ${f.posterUrl
                        ? `<img src="${f.posterUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`
                        : `<span style="font-size:0.7rem;padding:4px">${escapeHtml(f.titulo)}</span>`}
                        </div>
                        <div>
                            <div>${escapeHtml(f.titulo)}</div>
                            <div class="film-meta">${escapeHtml(f.tipoContenido || "")} ${f.anioEstreno ? "· " + f.anioEstreno : ""}</div>
                        </div>
                    </div>`).join("");

                filmDropdown.classList.add("open");
            } catch (e) {
                console.log("Error buscando:", e);
            }
        }, 400);
    });

    filmDropdown.addEventListener("click", e => {
        const option = e.target.closest(".film-option");
        if (!option) return;
        const f = filmDropdown._data[parseInt(option.dataset.index)];
        selectFilm({
            title: f.titulo,
            type: f.tipoContenido || "Contenido",
            tags: [f.tipoContenido || "Contenido"],
            grad: "linear-gradient(135deg,#2a1a4a,#5a2a8a)",
            posterUrl: f.posterUrl || null,
            apiId: f.apiId,
            proveedor: f.proveedor,
        });
    });

    document.addEventListener("click", e => {
        if (!e.target.closest("#filmSearchWrap")) filmDropdown.classList.remove("open");
    });
}

function selectFilm(film) {
    selectedFilm = film;

    const filmSearchInput = document.getElementById("filmSearchInput");
    const filmDropdown = document.getElementById("filmDropdown");
    const selectedFilmEl = document.getElementById("selectedFilm");
    const selectedCoverEl = document.getElementById("selectedCover");
    const selectedTitleEl = document.getElementById("selectedTitle");
    const selectedMetaEl = document.getElementById("selectedMeta");
    const filmSearchWrap = document.getElementById("filmSearchWrap");

    filmSearchInput.value = "";
    filmDropdown.classList.remove("open");

    selectedCoverEl.textContent = "";
    selectedCoverEl.style.background = "";
    selectedCoverEl.style.backgroundImage = "";

    if (film.posterUrl) {
        selectedCoverEl.style.backgroundImage = `url('${film.posterUrl}')`;
        selectedCoverEl.style.backgroundSize = "cover";
        selectedCoverEl.style.backgroundPosition = "center";
    } else {
        selectedCoverEl.style.background = film.grad;
        selectedCoverEl.textContent = film.title;
    }

    selectedTitleEl.textContent = film.title;
    selectedMetaEl.textContent = film.type;

    document.getElementById("selectedTags").innerHTML = film.tags
        .map(t => `<span class="tag ${tagClass(t)}" style="font-size:0.72rem;padding:2px 10px">${escapeHtml(t)}</span>`)
        .join("");

    filmSearchWrap.style.display = "none";
    selectedFilmEl.classList.add("show");
    mostrarRatingComposer(true);
    checkPostReady();
}

// ===============================
// PUBLICAR POST
// ===============================

function inicializarPublicador() {
    const postText = document.getElementById("postText");
    const postBtn = document.getElementById("postBtn");
    const removeFilm = document.getElementById("removeFilm");

    if (!postText || !postBtn) return;

    postText.addEventListener("input", checkPostReady);

    postBtn.addEventListener("click", async () => {
        console.log("selectedFilm:", selectedFilm);
        try {
            const starsWrap = document.getElementById("composerStars");
            const puntaje = starsWrap ? (parseInt(starsWrap.dataset.rating) || 0) : 0;

            const contenido = await guardarContenidoExterno({
                proveedor: selectedFilm.proveedor,
                apiId: selectedFilm.apiId,
                titulo: selectedFilm.title,
                tipoContenido: selectedFilm.type,
                posterUrl: selectedFilm.posterUrl,
            });

            const usuario = await obtenerUsuarioAutenticado();
            await apiRequest("/calificaciones", {
                method: "POST",
                body: JSON.stringify({
                    idUsuario: usuario.idUsuario,
                    idContenido: contenido.idContenido,
                    puntaje: puntaje,
                    comentario: postText.value.trim(),
                })
            });

            postText.value = "";
            if (removeFilm) removeFilm.click();
            checkPostReady();
            await cargarFeed();

        } catch (e) {
            console.log("Error al postear:", e);
        }
    });

    if (removeFilm) {
        removeFilm.addEventListener("click", () => {
            selectedFilm = null;
            const selectedFilmEl = document.getElementById("selectedFilm");
            const filmSearchWrap = document.getElementById("filmSearchWrap");
            const filmSearchInput = document.getElementById("filmSearchInput");
            selectedFilmEl.classList.remove("show");
            filmSearchWrap.style.display = "";
            if (filmSearchInput) filmSearchInput.value = "";
            mostrarRatingComposer(false);
            checkPostReady();
        });
    }
}

function checkPostReady() {
    const postText = document.getElementById("postText");
    const postBtn = document.getElementById("postBtn");
    const starsWrap = document.getElementById("composerStars");
    if (!postText || !postBtn) return;
    const puntaje = starsWrap ? (parseInt(starsWrap.dataset.rating) || 0) : 0;
    postBtn.disabled = !(selectedFilm && postText.value.trim() && puntaje > 0);
}

// ===============================
// NAVBAR
// ===============================



function inicializarNavbar() {
    const menuBtn = document.getElementById("menuBtn");
    const drawer = document.getElementById("drawer");

    if (menuBtn && drawer) {
        menuBtn.addEventListener("click", () => {
            drawer.classList.toggle("open");
            menuBtn.textContent = drawer.classList.contains("open") ? "✕" : "☰";
        });
    }

    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// ===============================
// MODAL DE PELÍCULA
// ===============================

function inicializarModalPelicula() {
    const overlay = document.getElementById("filmModalOverlay");
    const closeBtn = document.getElementById("filmModalClose");

    if (!overlay || !closeBtn) return;

    closeBtn.addEventListener("click", cerrarModalPelicula);

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) cerrarModalPelicula();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") cerrarModalPelicula();
    });

    document.addEventListener("click", function (event) {
        const cover = event.target.closest(".cover-clickable");
        if (!cover) return;

        const filmData = {
            title: cover.dataset.title || "Sin título",
            director: cover.dataset.director || "",
            year: cover.dataset.year || "",
            tags: cover.dataset.tags ? cover.dataset.tags.split(",") : [],
            cast: cover.dataset.cast || "",
            desc: cover.dataset.desc || "",
            grad: cover.dataset.grad || "linear-gradient(135deg,#1a1a2e,#0a0a0a)",
            posterUrl: cover.querySelector("img") ? cover.querySelector("img").src : null
        };

        abrirModalPelicula(filmData);
    });
}

function abrirModalPelicula(film) {

    const overlay = document.getElementById("filmModalOverlay");
    const poster = document.getElementById("filmModalPoster");
    const title = document.getElementById("filmModalTitle");
    const sub = document.getElementById("filmModalSub");
    const tags = document.getElementById("filmModalTags");
    const castEl = document.getElementById("filmModalCast");
    const desc = document.getElementById("filmModalDesc");

    poster.innerHTML = "";
    if (film.posterUrl) {
        const img = document.createElement("img");
        img.src = film.posterUrl;
        img.alt = film.title;
        poster.appendChild(img);
        poster.style.background = "none";
    } else {
        poster.style.background = film.grad;
        poster.textContent = film.title;
    }

    title.textContent = film.title;
    sub.textContent = [film.director, film.year].filter(Boolean).join(" · ");
    desc.textContent = film.desc;

    tags.innerHTML = film.tags
        .map(tag => `<span class="tag ${tagClass(tag)}">${escapeHtml(tag)}</span>`)
        .join("");

    if (castEl) {
        if (film.cast && film.cast.length > 0) {
            const actors = Array.isArray(film.cast)
                ? film.cast
                : film.cast.split(",").map(s => s.trim()).filter(Boolean);
            castEl.innerHTML =
                `<span class="film-modal-cast-label">Reparto principal</span>` +
                actors.map(actor => `<span class="cast-chip">${escapeHtml(actor)}</span>`).join("");
        } else {
            castEl.innerHTML = "";
        }
    }
     // ESTRELLAS
    const starsEl = document.getElementById("filmModalStars");
    if (starsEl) {
        if (!window.userRatings) window.userRatings = {};
        const freshStars = starsEl.cloneNode(true);
        starsEl.parentNode.replaceChild(freshStars, starsEl);
        const currentRating = window.userRatings[film.title] || 0;

        freshStars.querySelectorAll(".star-btn").forEach(btn => {
            const val = parseInt(btn.dataset.value);
            const icon = btn.querySelector("i");
            if (val <= currentRating) {
                icon.className = "bi bi-star-fill";
                btn.classList.add("selected");
            }
            btn.addEventListener("mouseenter", () => {
                freshStars.querySelectorAll(".star-btn").forEach(b => {
                    const v = parseInt(b.dataset.value);
                    b.querySelector("i").className = v <= val ? "bi bi-star-fill" : "bi bi-star";
                });
            });
            btn.addEventListener("mouseleave", () => {
                const saved = window.userRatings[film.title] || 0;
                freshStars.querySelectorAll(".star-btn").forEach(b => {
                    const v = parseInt(b.dataset.value);
                    b.querySelector("i").className = v <= saved ? "bi bi-star-fill" : "bi bi-star";
                    b.classList.toggle("selected", v <= saved);
                });
            });
            btn.addEventListener("click", () => {
                const prev = window.userRatings[film.title] || 0;
                window.userRatings[film.title] = prev === val ? 0 : val;
                freshStars.querySelectorAll(".star-btn").forEach(b => {
                    const v = parseInt(b.dataset.value);
                    b.querySelector("i").className = v <= window.userRatings[film.title] ? "bi bi-star-fill" : "bi bi-star";
                    b.classList.toggle("selected", v <= window.userRatings[film.title]);
                });
            });
        });
    }

    // LISTAS
    const addBtn = document.getElementById("addToListBtn");
    const dropdown = document.getElementById("addToListDropdown");
    if (addBtn && dropdown) {
        if (!window.userLists) window.userLists = {};
        if (!window.userLists[film.title]) {
            window.userLists[film.title] = { top5: false, watchlist: false, porver: false };
        }
        dropdown.classList.remove("open");
        addBtn.classList.remove("open");

        const freshBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(freshBtn, addBtn);
        const freshDrop = dropdown.cloneNode(true);
        dropdown.parentNode.replaceChild(freshDrop, dropdown);

        freshBtn.addEventListener("click", e => {
            e.stopPropagation();
            freshDrop.classList.toggle("open");
            freshBtn.classList.toggle("open");
        });

        freshDrop.querySelectorAll(".list-option").forEach(opt => {
            opt.addEventListener("click", () => {
                const key = opt.dataset.list;
                window.userLists[film.title][key] = !window.userLists[film.title][key];
                const check = opt.querySelector(".list-check");
                if (check) check.classList.toggle("visible", window.userLists[film.title][key]);
                opt.classList.toggle("in-list", window.userLists[film.title][key]);
            });
        });

        document.addEventListener("click", function cerrar(e) {
            if (!e.target.closest(".add-to-list-wrap")) {
                freshDrop.classList.remove("open");
                freshBtn.classList.remove("open");
                document.removeEventListener("click", cerrar);
            }
        });
    }

    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("open");
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
// SIDEBAR DRAWER (MÓVIL)
// ===============================

function inicializarSidebarDrawer() {
    const toggleBtn = document.getElementById("sidebarToggle");
    const drawer = document.getElementById("sidebarDrawer");
    const closeBtn = document.getElementById("sidebarDrawerClose");
    const overlay = document.getElementById("sidebarDrawerOverlay");

    if (!toggleBtn || !drawer || !closeBtn || !overlay) return;

    toggleBtn.addEventListener("click", () => {
        drawer.classList.add("open");
        overlay.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
    });

    closeBtn.addEventListener("click", () => {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
    });

    overlay.addEventListener("click", () => {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
    });
}

// ===============================
// COMPOSER DESPLEGABLE
// ===============================

function inicializarComposer() {
    const composerTrigger = document.getElementById("composerTrigger");
    const composerBody = document.getElementById("composerBody");

    if (!composerTrigger || !composerBody) return;

    composerTrigger.addEventListener("click", function () {
        const isOpen = composerBody.classList.contains("open");
        composerBody.classList.toggle("open", !isOpen);
        composerTrigger.setAttribute("aria-expanded", String(!isOpen));
        composerBody.setAttribute("aria-hidden", String(isOpen));

        if (!isOpen) {
            const filmSearchInput = document.getElementById("filmSearchInput");
            if (filmSearchInput) {
                setTimeout(() => filmSearchInput.focus(), 350);
            }
        }
    });

    document.addEventListener("composerReset", function () {
        composerBody.classList.remove("open");
        composerTrigger.setAttribute("aria-expanded", "false");
        composerBody.setAttribute("aria-hidden", "true");
    });

    inicializarEstrellasComposer();
}

function inicializarEstrellasComposer() {
    const starsWrap = document.getElementById("composerStars");
    const ratingValue = document.getElementById("composerRatingValue");
    if (!starsWrap) return;

    let currentRating = 0;

    starsWrap.querySelectorAll(".star-btn").forEach(btn => {
        const val = parseInt(btn.dataset.value);

        btn.addEventListener("mouseenter", () => {
            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                const v = parseInt(b.dataset.value);
                b.querySelector("i").className = v <= val ? "bi bi-star-fill" : "bi bi-star";
                b.classList.toggle("hovered", v <= val);
            });
            if (ratingValue) ratingValue.textContent = `${val}/10`;
        });

        btn.addEventListener("mouseleave", () => {
            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                const v = parseInt(b.dataset.value);
                b.querySelector("i").className = v <= currentRating ? "bi bi-star-fill" : "bi bi-star";
                b.classList.remove("hovered");
                b.classList.toggle("selected", v <= currentRating);
            });
            if (ratingValue) ratingValue.textContent = currentRating > 0 ? `${currentRating}/10` : "";
        });

        btn.addEventListener("click", () => {
            currentRating = currentRating === val ? 0 : val;
            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                const v = parseInt(b.dataset.value);
                b.querySelector("i").className = v <= currentRating ? "bi bi-star-fill" : "bi bi-star";
                b.classList.toggle("selected", v <= currentRating);
            });
            if (ratingValue) ratingValue.textContent = currentRating > 0 ? `${currentRating}/10` : "";
            starsWrap.dataset.rating = currentRating;
            checkPostReady();
        });
    });
}

function mostrarRatingComposer(mostrar) {
    const wrap = document.getElementById("composerRatingWrap");
    if (wrap) wrap.classList.toggle("visible", mostrar);
    if (!mostrar) {
        const starsWrap = document.getElementById("composerStars");
        const ratingValue = document.getElementById("composerRatingValue");
        if (starsWrap) {
            starsWrap.dataset.rating = 0;
            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                b.querySelector("i").className = "bi bi-star";
                b.classList.remove("selected", "hovered");
            });
        }
        if (ratingValue) ratingValue.textContent = "";
    }
}

// Inicializar dropdown de listas en los posts del feed (delegado)
function inicializarListasFeed() {
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".post-add-list-btn");
        if (btn) {
            e.stopPropagation();
            const postId = btn.dataset.postId;
            const dropdown = document.getElementById(`post-list-dropdown-${postId}`);
            if (!dropdown) return;
            const isOpen = dropdown.classList.contains("open");
            document.querySelectorAll(".add-to-list-dropdown.open").forEach(d => {
                d.classList.remove("open");
                d.setAttribute("aria-hidden", "true");
            });
            document.querySelectorAll(".post-add-list-btn.open").forEach(b => b.classList.remove("open"));
            if (!isOpen) {
                dropdown.classList.add("open");
                dropdown.setAttribute("aria-hidden", "false");
                btn.classList.add("open");
            }
            return;
        }

        const listOpt = e.target.closest(".list-option[data-post-id]");
        if (listOpt) {
            const key = listOpt.dataset.list;
            const postId = listOpt.dataset.postId;
            if (!window.postLists) window.postLists = {};
            if (!window.postLists[postId]) window.postLists[postId] = {};
            window.postLists[postId][key] = !window.postLists[postId][key];
            const check = listOpt.querySelector(".list-check");
            if (check) check.classList.toggle("visible", window.postLists[postId][key]);
            listOpt.classList.toggle("in-list", window.postLists[postId][key]);
            return;
        }

        if (!e.target.closest(".add-to-list-wrap")) {
            document.querySelectorAll(".add-to-list-dropdown.open").forEach(d => {
                d.classList.remove("open");
                d.setAttribute("aria-hidden", "true");
            });
            document.querySelectorAll(".post-add-list-btn.open").forEach(b => b.classList.remove("open"));
        }
    });
}





window.toggleComments = toggleComments;
window.addComment = addComment;
window.cerrarSesion = cerrarSesion;
window.cargarFeed = cargarFeed;
window.toggleLike = toggleLike;