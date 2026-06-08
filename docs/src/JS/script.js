import { obtenerUsuarioAutenticado } from "../api/authApi.js";
import { buscarTmdb, buscarAnime, guardarContenidoExterno } from "../api/catalogoApi.js";
import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let selectedFilm = null;

const POSTS_PER_PAGE = 10;
let feedPagina = 0;
let feedCargando = false;
let feedHayMas = true;
let feedObserver = null;

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
    await cargarRecomendacionesHome();
});

// ===============================
// USUARIO LOGUEADO
// ===============================

async function cargarUsuarioLogueado() {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    const nombreUsuario = document.getElementById("navbar-username");

    if (!token) {
        window.location.href = "./login.html";
        return;
    }

    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);

        if (nombreUsuario) {
            nombreUsuario.textContent = `@${usuarioActual.username || usuarioActual.nombre || "Usuario"}`;

            const avatarImg = document.querySelector(".avatar img");
            if (avatarImg && usuarioActual.iconoPerfil) {
                avatarImg.src = `../img/${usuarioActual.iconoPerfil}.webp`;
            }

        }

        return;
    }

    try {
        const usuario = await obtenerUsuarioAutenticado();

        usuarioActual = usuario;
        localStorage.setItem("usuario", JSON.stringify(usuario));

        if (nombreUsuario) {
            nombreUsuario.textContent = `@${usuario.username || usuario.nombre || "Usuario"}`;

            const avatarImg = document.querySelector(".avatar img");
            if (avatarImg && usuarioActual.iconoPerfil) {
                avatarImg.src = `../img/${usuarioActual.iconoPerfil}.webp`;
            }




        }

    } catch (error) {
        console.error("Error cargando usuario:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "./login.html";
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "./login.html";
}

// ===============================
// UTILIDADES
// ===============================

function tagClass(tag) {
    const blue = ["Anime", "Sci-Fi", "Misterio", "SERIE", "Serie"];
    const yellow = ["TV Show", "Aventura", "Acción", "Fantasía", "Comedia"];
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

function normalizarTipoBackend(tipo) {
    if (!tipo) return "SERIE";

    const t = String(tipo).toUpperCase();

    if (t === "PELICULA" || t === "PELÍCULA" || t === "MOVIE") return "PELICULA";
    if (t === "SERIE" || t === "TV" || t === "ANIME") return "SERIE";

    return t;
}

// ===============================
// FEED PAGINADO
// ===============================

async function cargarFeed() {
    const feed = document.getElementById("feed");
    const paginacion = document.getElementById("feedPaginacion");

    if (paginacion) {
        paginacion.remove();
    }

    feedPagina = 0;
    feedHayMas = true;
    feedCargando = false;

    if (feed) {
        feed.innerHTML = `
            <p id="feedLoadingText" style="color:#aaa; text-align:center; margin-top:2rem;">
                Cargando publicaciones de tus homies...
            </p>
        `;
    }

    await cargarMasFeed(true);
    inicializarScrollInfinitoFeed();
}
async function cargarMasFeed(esPrimeraCarga = false) {
    if (feedCargando || !feedHayMas) return;

    const idUsuario = usuarioActual?.idUsuario || usuarioActual?.id;
    const feed = document.getElementById("feed");

    if (!idUsuario || !feed) return;

    feedCargando = true;

    try {
        mostrarLoaderMasPosts();

        const calificaciones = await apiRequest(
            `/calificaciones/feed/${idUsuario}?page=${feedPagina}&limite=${POSTS_PER_PAGE}`
        );

        const publicaciones = calificaciones.filter(esPublicacion);

        document.getElementById("feedLoadingText")?.remove();

        if (esPrimeraCarga && publicaciones.length === 0) {
            feed.innerHTML = `
                <p style="color:#aaa; text-align:center; margin-top:2rem;">
                    Aún no hay publicaciones de tus homies.
                </p>
            `;
            feedHayMas = false;
            return;
        }

        if (publicaciones.length < POSTS_PER_PAGE) {
            feedHayMas = false;
        }

        const html = publicaciones.map(c => renderCalificacion(c)).join("");
        feed.insertAdjacentHTML("beforeend", html);

        publicaciones.forEach(c => cargarLikes(c.idCalificacion));

        feedPagina++;

    } catch (error) {
        console.error("Error cargando más publicaciones:", error);

        if (esPrimeraCarga) {
            feed.innerHTML = `
                <p style="color:#aaa; text-align:center; margin-top:2rem;">
                    No se pudieron cargar las publicaciones.
                </p>
            `;
        }
    } finally {
        feedCargando = false;
        ocultarLoaderMasPosts();
    }
}
function inicializarScrollInfinitoFeed() {
    let sentinel = document.getElementById("feedScrollSentinel");

    if (!sentinel) {
        sentinel = document.createElement("div");
        sentinel.id = "feedScrollSentinel";
        sentinel.style.height = "40px";
        document.getElementById("feed")?.after(sentinel);
    }

    if (feedObserver) {
        feedObserver.disconnect();
    }

    feedObserver = new IntersectionObserver(entries => {
        const entry = entries[0];

        if (entry.isIntersecting && feedHayMas && !feedCargando) {
            cargarMasFeed(false);
        }
    }, {
        root: null,
        rootMargin: "300px",
        threshold: 0
    });

    feedObserver.observe(sentinel);
}

function mostrarLoaderMasPosts() {
    let loader = document.getElementById("feedMoreLoader");

    if (!loader) {
        loader = document.createElement("p");
        loader.id = "feedMoreLoader";
        loader.style.color = "#aaa";
        loader.style.textAlign = "center";
        loader.style.margin = "1.5rem 0";
        loader.textContent = "Cargando más publicaciones...";
        document.getElementById("feedScrollSentinel")?.before(loader);
    }
}

function ocultarLoaderMasPosts() {
    document.getElementById("feedMoreLoader")?.remove();

    if (!feedHayMas) {
        let end = document.getElementById("feedEndMessage");

        if (!end) {
            end = document.createElement("p");
            end.id = "feedEndMessage";
            end.style.color = "#777";
            end.style.textAlign = "center";
            end.style.margin = "1.5rem 0";
            end.textContent = "No hay más publicaciones por ahora.";
            document.getElementById("feedScrollSentinel")?.before(end);
        }
    }
}
function esPublicacion(calificacion) {
    return calificacion.comentario &&
        String(calificacion.comentario).trim().length > 0;
}

function renderFeedPagina() {
    const feed = document.getElementById("feed");
    if (!feed) return;

    if (feedTodos.length === 0) {
        feed.innerHTML = `
            <p style="color:#aaa; text-align:center; margin-top:2rem;">
                Aún no hay publicaciones.
            </p>
        `;

        renderPaginacion(0);
        return;
    }

    const totalPaginas = Math.ceil(feedTodos.length / POSTS_PER_PAGE);
    const inicio = (feedPagina - 1) * POSTS_PER_PAGE;
    const fin = inicio + POSTS_PER_PAGE;
    const pagina = feedTodos.slice(inicio, fin);

    feed.innerHTML = pagina.map(c => renderCalificacion(c)).join("");

    pagina.forEach(c => cargarLikes(c.idCalificacion));

    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    let paginacionEl = document.getElementById("feedPaginacion");

    if (!paginacionEl) {
        paginacionEl = document.createElement("div");
        paginacionEl.id = "feedPaginacion";
        paginacionEl.className = "feed-pagination";
        document.getElementById("feed")?.after(paginacionEl);
    }

    if (!paginacionEl) return;

    if (totalPaginas <= 1) {
        paginacionEl.innerHTML = "";
        return;
    }

    let html = `
        <button class="pagination-btn" id="pagPrev" ${feedPagina === 1 ? "disabled" : ""}>
            &#8592;
        </button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        const visible = Math.abs(i - feedPagina) <= 1 || i === 1 || i === totalPaginas;

        if (visible) {
            html += `
                <button class="pagination-btn ${i === feedPagina ? "active" : ""}" data-pagina="${i}">
                    ${i}
                </button>
            `;
        } else if (!html.endsWith("...</span>")) {
            html += `<span class="pagination-btn" style="cursor:default;opacity:.4">...</span>`;
        }
    }

    html += `
        <button class="pagination-btn" id="pagNext" ${feedPagina === totalPaginas ? "disabled" : ""}>
            &#8594;
        </button>
    `;

    paginacionEl.innerHTML = html;

    paginacionEl.querySelectorAll("[data-pagina]").forEach(btn => {
        btn.addEventListener("click", () => {
            feedPagina = parseInt(btn.dataset.pagina);
            renderFeedPagina();
            document.getElementById("feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    document.getElementById("pagPrev")?.addEventListener("click", () => {
        if (feedPagina > 1) {
            feedPagina--;
            renderFeedPagina();
            document.getElementById("feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    document.getElementById("pagNext")?.addEventListener("click", () => {
        if (feedPagina < totalPaginas) {
            feedPagina++;
            renderFeedPagina();
            document.getElementById("feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

function renderEstrellas(puntaje, total = 5) {
    let html = `<div class="post-film-rating-stars">`;

    for (let i = 1; i <= total; i++) {
        html += `<i class="bi ${i <= puntaje ? "bi-star-fill" : "bi-star"}"></i>`;
    }

    html += `</div>`;
    return html;
}

function renderCalificacion(c) {
    const fecha = c.fechaCalificacion ? c.fechaCalificacion.split("T")[0] : "";
    const tipo = c.tipoContenido || "Contenido";
    const puntaje = c.puntaje || 0;

    const posterStyle = c.posterUrl
        ? `background-image:url('${c.posterUrl}');background-size:cover;background-position:center;`
        : "background:linear-gradient(135deg,#2a1a4a,#5a2a8a)";

    const posterContent = c.posterUrl ? "" : escapeHtml(c.tituloContenido);

    return `
        <div class="post-card" id="post-${c.idCalificacion}">
            <div class="timestamp">${fecha}</div>

            <div class="post-layout">

                <div class="post-col-poster">
                    <div class="post-thumb" style="${posterStyle}">
                        ${posterContent}
                    </div>
                </div>

                <div class="post-col-film">
                    <div class="post-film-title">
                        ${escapeHtml(c.tituloContenido || "Sin título")}
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        <span class="tag ${tagClass(tipo)}">${escapeHtml(tipo)}</span>
                    </div>

                    ${puntaje > 0 ? `
                        <div class="post-film-rating">
                            ${renderEstrellas(puntaje)}
                        </div>
                    ` : ""}

                    <div class="add-to-list-wrap" id="list-wrap-${c.idCalificacion}">
                        <button type="button"
                                class="add-to-list-btn post-add-list-btn"
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

                <div class="post-col-social">
                    <div class="username">
                        <div class="user-icon">👤</div>
                        ${escapeHtml(c.username || c.nombreUsuario || "Usuario")}
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
                    <input type="text"
                           id="comment-input-${c.idCalificacion}"
                           placeholder="Escribe un comentario..."
                           onkeydown="if(event.key==='Enter') addComment(${c.idCalificacion})">

                    <button onclick="addComment(${c.idCalificacion})">Comentar</button>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// LIKES
// ===============================

async function cargarLikes(idCalificacion) {
    try {
        if (!usuarioActual?.idUsuario) return;

        const data = await apiRequest(
            `/likes-calificacion/${idCalificacion}/${usuarioActual.idUsuario}`
        );

        actualizarLikesUI(data);

    } catch (error) {
        console.error("Error cargando likes:", error);
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
                idCalificacion,
                idUsuario: usuarioActual.idUsuario,
                tipo
            })
        });

        actualizarLikesUI(data);

    } catch (error) {
        console.error("Error en toggleLike:", error);
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
        </div>
    `;
}

async function cargarComentarios(idCalificacion) {
    try {
        const comentarios = await apiRequest(`/comentarios-calificacion/${idCalificacion}`);
        const list = document.getElementById(`comment-list-${idCalificacion}`);
        const countSpan = document.getElementById(`comment-count-${idCalificacion}`);

        if (list) {
            list.innerHTML = comentarios.map(c => renderComment({
                user: c.username || c.nombreUsuario || "Usuario",
                text: c.texto,
                time: c.fechaComentario ? c.fechaComentario.split("T")[0] : "ahora mismo"
            })).join("");
        }

        if (countSpan) {
            const count = comentarios.length;
            countSpan.textContent = `${count} comentario${count !== 1 ? "s" : ""}`;
        }

    } catch (error) {
        console.error("Error cargando comentarios:", error);
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

    } catch (error) {
        console.error("Error agregando comentario:", error);
    }
}

// ===============================
// BUSCADOR PELÍCULAS/SERIES
// ===============================

function inicializarBuscadorPeliculas() {
    const filmSearchInput = document.getElementById("filmSearchInput");
    const filmDropdown = document.getElementById("filmDropdown");

    if (!filmSearchInput || !filmDropdown) return;

    let searchTimeout = null;

    filmSearchInput.addEventListener("input", () => {
        const q = filmSearchInput.value.trim();

        if (!q) {
            filmDropdown.classList.remove("open");
            return;
        }

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(async () => {
            try {
                const [tmdb, anime] = await Promise.allSettled([
                    buscarTmdb(q),
                    buscarAnime(q)
                ]);

                const resultados = [
                    ...(tmdb.status === "fulfilled" ? tmdb.value : []),
                    ...(anime.status === "fulfilled" ? anime.value : [])
                ];

                if (!resultados.length) {
                    filmDropdown.classList.remove("open");
                    return;
                }

                filmDropdown._data = resultados;

                filmDropdown.innerHTML = resultados.map((f, i) => `
                    <div class="film-option" data-index="${i}">
                        <div class="mini-cover" style="background:linear-gradient(135deg,#2a1a4a,#5a2a8a); overflow:hidden; padding:0">
                            ${
                                f.posterUrl
                                    ? `<img src="${f.posterUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`
                                    : `<span style="font-size:.7rem;padding:4px">${escapeHtml(f.titulo)}</span>`
                            }
                        </div>

                        <div>
                            <div>${escapeHtml(f.titulo)}</div>
                            <div class="film-meta">
                                ${escapeHtml(f.tipoContenido || "")}
                                ${f.anioEstreno ? " · " + f.anioEstreno : ""}
                            </div>
                        </div>
                    </div>
                `).join("");

                filmDropdown.classList.add("open");

            } catch (error) {
                console.error("Error buscando:", error);
            }
        }, 400);
    });

    filmDropdown.addEventListener("click", e => {
        const option = e.target.closest(".film-option");
        if (!option) return;

        const f = filmDropdown._data[parseInt(option.dataset.index)];

        selectFilm({
            title: f.titulo,
            type: normalizarTipoBackend(f.tipoContenido),
            tags: [normalizarTipoBackend(f.tipoContenido)],
            posterUrl: f.posterUrl || null,
            apiId: f.apiId,
            proveedor: f.proveedor,
            generos: f.generos || []
        });
    });

    document.addEventListener("click", e => {
        if (!e.target.closest("#filmSearchWrap")) {
            filmDropdown.classList.remove("open");
        }
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
    const selectedTagsEl = document.getElementById("selectedTags");
    const filmSearchWrap = document.getElementById("filmSearchWrap");

    if (filmSearchInput) filmSearchInput.value = "";
    if (filmDropdown) filmDropdown.classList.remove("open");

    if (selectedCoverEl) {
        selectedCoverEl.textContent = "";
        selectedCoverEl.style.background = "";
        selectedCoverEl.style.backgroundImage = "";

        if (film.posterUrl) {
            selectedCoverEl.style.backgroundImage = `url('${film.posterUrl}')`;
            selectedCoverEl.style.backgroundSize = "cover";
            selectedCoverEl.style.backgroundPosition = "center";
        } else {
            selectedCoverEl.style.background = "linear-gradient(135deg,#2a1a4a,#5a2a8a)";
            selectedCoverEl.textContent = film.title;
        }
    }

    if (selectedTitleEl) selectedTitleEl.textContent = film.title;
    if (selectedMetaEl) selectedMetaEl.textContent = film.type;

    if (selectedTagsEl) {
        selectedTagsEl.innerHTML = film.tags
            .map(t => `<span class="tag ${tagClass(t)}" style="font-size:.72rem;padding:2px 10px">${escapeHtml(t)}</span>`)
            .join("");
    }

    if (filmSearchWrap) filmSearchWrap.style.display = "none";
    if (selectedFilmEl) selectedFilmEl.classList.add("show");

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
        try {
            const starsWrap = document.getElementById("composerStars");
            const puntaje = starsWrap ? (parseInt(starsWrap.dataset.rating) || 0) : 0;

            const contenido = await guardarContenidoExterno({
                proveedor: selectedFilm.proveedor,
                apiId: selectedFilm.apiId,
                titulo: selectedFilm.title,
                tipoContenido: selectedFilm.type,
                posterUrl: selectedFilm.posterUrl
            });

            await apiRequest("/calificaciones", {
                method: "POST",
                body: JSON.stringify({
                    idUsuario: usuarioActual.idUsuario,
                    idContenido: contenido.idContenido,
                    puntaje,
                    comentario: postText.value.trim()
                })
            });

            postText.value = "";

            if (removeFilm) removeFilm.click();

            checkPostReady();

            await cargarFeed();

        } catch (error) {
            console.error("Error al postear:", error);
        }
    });

    if (removeFilm) {
        removeFilm.addEventListener("click", () => {
            selectedFilm = null;

            const selectedFilmEl = document.getElementById("selectedFilm");
            const filmSearchWrap = document.getElementById("filmSearchWrap");
            const filmSearchInput = document.getElementById("filmSearchInput");

            selectedFilmEl?.classList.remove("show");

            if (filmSearchWrap) filmSearchWrap.style.display = "";
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
    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// ===============================
// MODAL
// ===============================

function inicializarModalPelicula() {
    const overlay = document.getElementById("filmModalOverlay");
    const closeBtn = document.getElementById("filmModalClose");

    if (!overlay || !closeBtn) return;

    closeBtn.addEventListener("click", cerrarModalPelicula);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) cerrarModalPelicula();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") cerrarModalPelicula();
    });

    document.addEventListener("click", event => {
        const cover = event.target.closest(".cover-clickable");
        if (!cover) return;

        abrirModalPelicula({
            title: cover.dataset.title || "Sin título",
            director: cover.dataset.director || "",
            year: cover.dataset.year || "",
            tags: cover.dataset.tags ? cover.dataset.tags.split(",") : [],
            cast: cover.dataset.cast || "",
            desc: cover.dataset.desc || "",
            grad: cover.dataset.grad || "linear-gradient(135deg,#1a1a2e,#0a0a0a)",
            posterUrl: cover.querySelector("img") ? cover.querySelector("img").src : null
        });
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

    if (!overlay) return;

    if (poster) {
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
    }

    if (title) title.textContent = film.title;
    if (sub) sub.textContent = [film.director, film.year].filter(Boolean).join(" · ");
    if (desc) desc.textContent = film.desc;

    if (tags) {
        tags.innerHTML = film.tags
            .map(tag => `<span class="tag ${tagClass(tag)}">${escapeHtml(tag)}</span>`)
            .join("");
    }

    if (castEl) {
        const actors = film.cast
            ? String(film.cast).split(",").map(s => s.trim()).filter(Boolean)
            : [];

        castEl.innerHTML = actors.length
            ? `<span class="film-modal-cast-label">Reparto principal</span>` +
              actors.map(actor => `<span class="cast-chip">${escapeHtml(actor)}</span>`).join("")
            : "";
    }

    inicializarEstrellasModal(film.title);

    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("open");

    document.body.style.overflow = "hidden";
}

function inicializarEstrellasModal(titulo) {
    const starsEl = document.getElementById("filmModalStars");
    if (!starsEl) return;

    if (!window.userRatings) window.userRatings = {};

    const freshStars = starsEl.cloneNode(true);
    starsEl.parentNode.replaceChild(freshStars, starsEl);

    const currentRating = window.userRatings[titulo] || 0;

    freshStars.querySelectorAll(".star-btn").forEach(btn => {
        const val = parseInt(btn.dataset.value);

        pintarEstrella(btn, val <= currentRating);

        btn.addEventListener("mouseenter", () => {
            freshStars.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= val);
            });
        });

        btn.addEventListener("mouseleave", () => {
            const saved = window.userRatings[titulo] || 0;
            freshStars.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= saved);
            });
        });

        btn.addEventListener("click", () => {
            const prev = window.userRatings[titulo] || 0;
            window.userRatings[titulo] = prev === val ? 0 : val;

            freshStars.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= window.userRatings[titulo]);
            });
        });
    });
}

function pintarEstrella(btn, activa) {
    const icon = btn.querySelector("i");
    if (!icon) return;

    icon.className = activa ? "bi bi-star-fill" : "bi bi-star";
    btn.classList.toggle("selected", activa);
}

function cerrarModalPelicula() {
    const overlay = document.getElementById("filmModalOverlay");
    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

// ===============================
// SIDEBAR DRAWER
// ===============================

function inicializarSidebarDrawer() {
    const toggleBtn = document.getElementById("sidebarToggle");
    const drawer = document.getElementById("sidebarDrawer");
    const closeBtn = document.getElementById("sidebarDrawerClose");
    const overlay = document.getElementById("sidebarDrawerOverlay");

    if (!toggleBtn || !drawer || !closeBtn || !overlay) return;

    const abrir = () => {
        drawer.classList.add("open");
        overlay.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
    };

    const cerrar = () => {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");
    };

    toggleBtn.addEventListener("click", abrir);
    closeBtn.addEventListener("click", cerrar);
    overlay.addEventListener("click", cerrar);
}

// ===============================
// COMPOSER
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

    inicializarEstrellasComposer();
}

function inicializarEstrellasComposer() {
    const starsWrap = document.getElementById("composerStars");
    const ratingValue = document.getElementById("composerRatingValue");

    if (!starsWrap) return;

    starsWrap.dataset.rating = "0";

    starsWrap.querySelectorAll(".star-btn").forEach(btn => {
        const val = parseInt(btn.dataset.value);

        btn.addEventListener("mouseenter", () => {
            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= val);
            });

            if (ratingValue) ratingValue.textContent = `${val}/5`;
        });

        btn.addEventListener("mouseleave", () => {
            const currentRating = parseInt(starsWrap.dataset.rating) || 0;

            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= currentRating);
            });

            if (ratingValue) {
                ratingValue.textContent = currentRating > 0 ? `${currentRating}/5` : "";
            }
        });

        btn.addEventListener("click", () => {
            const currentRating = parseInt(starsWrap.dataset.rating) || 0;
            const nextRating = currentRating === val ? 0 : val;

            starsWrap.dataset.rating = String(nextRating);

            starsWrap.querySelectorAll(".star-btn").forEach(b => {
                pintarEstrella(b, parseInt(b.dataset.value) <= nextRating);
            });

            if (ratingValue) {
                ratingValue.textContent = nextRating > 0 ? `${nextRating}/5` : "";
            }

            checkPostReady();
        });
    });
}

function mostrarRatingComposer(mostrar) {
    const wrap = document.getElementById("composerRatingWrap");
    const starsWrap = document.getElementById("composerStars");
    const ratingValue = document.getElementById("composerRatingValue");

    if (wrap) wrap.classList.toggle("visible", mostrar);

    if (!mostrar && starsWrap) {
        starsWrap.dataset.rating = "0";

        starsWrap.querySelectorAll(".star-btn").forEach(b => pintarEstrella(b, false));

        if (ratingValue) ratingValue.textContent = "";
    }
}

// ===============================
// LISTAS EN POSTS
// ===============================

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

            if (check) {
                check.classList.toggle("visible", window.postLists[postId][key]);
            }

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

// ===============================
// RECOMENDACIONES HOME
// ===============================

async function cargarRecomendacionesHome() {
    const desktop = document.getElementById("recommendationsGrid");
    const mobile = document.getElementById("recommendationsGridMobile");

    if (!desktop && !mobile) return;

    try {
        const idUsuario = usuarioActual?.idUsuario || usuarioActual?.id;

        if (!idUsuario) return;

        const recomendaciones = await apiRequest(
            `/recomendaciones/usuario/${idUsuario}?limite=4`
        );

        const html = renderRecomendacionesHome(recomendaciones);

        if (desktop) desktop.innerHTML = html;
        if (mobile) mobile.innerHTML = html;

    } catch (error) {
        console.error("Error cargando recomendaciones:", error);

        const errorHtml = `
            <p class="recommendations-loading">
                No se pudieron cargar las recomendaciones.
            </p>
        `;

        if (desktop) desktop.innerHTML = errorHtml;
        if (mobile) mobile.innerHTML = errorHtml;
    }
}

function renderRecomendacionesHome(recomendaciones) {
    if (!recomendaciones || recomendaciones.length === 0) {
        return `
            <p class="recommendations-loading">
                Agrega películas a tus listas para recibir recomendaciones.
            </p>
        `;
    }

    return recomendaciones.map(item => `
        <div class="col-6">
            <div class="cover cover-clickable"
                data-title="${escapeHtml(item.titulo)}"
                data-year="${item.anioEstreno || ""}"
                data-tags="${escapeHtml(item.tipoContenido || "Contenido")}"
                data-desc="${escapeHtml(item.motivo || "Recomendado para ti")}"
                data-grad="linear-gradient(135deg,#1a1a2e,#0a0a0a)">
                ${
                    item.posterUrl
                        ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}" width="130px">`
                        : `<span>${escapeHtml(item.titulo)}</span>`
                }
            </div>
        </div>
    `).join("");
}

// ===============================
// GLOBAL
// ===============================

window.toggleComments = toggleComments;
window.addComment = addComment;
window.cerrarSesion = cerrarSesion;
window.cargarFeed = cargarFeed;
window.toggleLike = toggleLike;