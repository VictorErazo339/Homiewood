import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let vistas = [];
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
    await cargarVistasDesdeBackend();

    cargarTop5();
    renderTop5();

    renderVistas();
    renderBioTags();

    inicializarBuscadorVistas();
    inicializarEditarPerfil();
});

function obtenerIdUsuario() {
    return usuarioActual.idUsuario || usuarioActual.id;
}

function vistasStorageKey() {
    return `homiwood_vistas_${obtenerIdUsuario()}`;
}

function top5StorageKey() {
    return `homiwood_top5_${obtenerIdUsuario()}`;
}

/* ===============================
   USUARIO
================================ */

async function cargarDatosUsuario(idUsuario) {
    actualizarHeaderPerfil(usuarioActual);

    try {
        const usuario = await apiRequest(`/usuarios/${idUsuario}`);

        usuarioActual = {
            ...usuarioActual,
            ...usuario
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioActual));

        actualizarHeaderPerfil(usuarioActual);
    } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        actualizarHeaderPerfil(usuarioActual);
    }
}
function obtenerDescripcionPerfil(usuario) {
    const descripcion = usuario?.descripcion;

    if (descripcion && String(descripcion).trim().length > 0) {
        return descripcion;
    }

    return "Cinéfilo 🎥 Fan del terror psicológico y el drama independiente.";
}

function actualizarHeaderPerfil(usuario) {
    const nombreEl = document.getElementById("profileName");
    const usernameEl = document.getElementById("profileUsername");
    const bioEl = document.getElementById("profileBio");

    if (nombreEl) {
        nombreEl.textContent =
            usuario?.nombre ||
            usuario?.username ||
            "Usuario";
    }

    if (usernameEl) {
        usernameEl.textContent =
            `@${usuario?.username || "usuario"}`;
    }

    if (bioEl) {
        bioEl.textContent = obtenerDescripcionPerfil(usuario);
    }
}

function inicializarEditarPerfil() {
    const modalEl = document.getElementById("editProfileModal");
    const nombreInput = document.getElementById("editProfileNombre");
    const descripcionInput = document.getElementById("editProfileDescripcion");
    const contador = document.getElementById("editProfileCounter");
    const guardarBtn = document.getElementById("saveProfileBtn");

    if (!modalEl || !nombreInput || !descripcionInput || !guardarBtn) {
        return;
    }

    modalEl.addEventListener("show.bs.modal", function () {
        nombreInput.value = usuarioActual?.nombre || "";
        descripcionInput.value = usuarioActual?.descripcion || "";
        actualizarContadorDescripcion();
        setTimeout(() => nombreInput.focus(), 150);
    });

    descripcionInput.addEventListener("input", actualizarContadorDescripcion);

    guardarBtn.addEventListener("click", guardarPerfilEditado);

    function actualizarContadorDescripcion() {
        if (!contador) return;

        contador.textContent = `${descripcionInput.value.length}/255`;
    }
}

async function guardarPerfilEditado() {
    const nombreInput = document.getElementById("editProfileNombre");
    const descripcionInput = document.getElementById("editProfileDescripcion");
    const guardarBtn = document.getElementById("saveProfileBtn");

    if (!nombreInput || !descripcionInput || !guardarBtn) {
        return;
    }

    const nombre = nombreInput.value.trim();
    const descripcion = descripcionInput.value.trim();

    if (!nombre) {
        alert("El nombre no puede estar vacío.");
        nombreInput.focus();
        return;
    }

    if (nombre.length > 100) {
        alert("El nombre no puede superar los 100 caracteres.");
        nombreInput.focus();
        return;
    }

    if (descripcion.length > 255) {
        alert("La descripción no puede superar los 255 caracteres.");
        descripcionInput.focus();
        return;
    }

    guardarBtn.disabled = true;
    guardarBtn.textContent = "Guardando...";

    try {
        const usuarioActualizado = await apiRequest(`/usuarios/${obtenerIdUsuario()}/perfil`, {
            method: "PUT",
            body: JSON.stringify({
                nombre,
                descripcion
            })
        });

        usuarioActual = {
            ...usuarioActual,
            ...usuarioActualizado
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioActual));

        actualizarHeaderPerfil(usuarioActual);

        const modalEl = document.getElementById("editProfileModal");

        if (window.bootstrap && modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);

            if (modal) {
                modal.hide();
            }
        }
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        alert("No se pudo actualizar el perfil.");
    } finally {
        guardarBtn.disabled = false;
        guardarBtn.textContent = "Guardar cambios";
    }
}

async function cargarCantidadPosts(idUsuario) {
    try {
        const calificaciones = await apiRequest(`/calificaciones/usuario/${idUsuario}`);

        const publicaciones = calificaciones.filter(calificacion =>
            calificacion.comentario &&
            String(calificacion.comentario).trim().length > 0
        );

        const statPosts = document.getElementById("statPosts");

        if (statPosts) {
            statPosts.textContent = publicaciones.length;
        }
    } catch (error) {
        console.error("Error cargando cantidad de posts:", error);
    }
}

/* ===============================
   VISTAS DESDE BACKEND
================================ */

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

        const vistasBackend = dataVistas.map(item => {
            const calificacion = calificacionesPorContenido.get(Number(item.idContenido));

            return {
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
        });

        vistas = eliminarDuplicadosPorContenido(vistasBackend);

        guardarVistas();

    } catch (error) {
        console.error("Error cargando vistas desde backend:", error);
        cargarVistas();
    }
}

function cargarVistas() {
    vistas = JSON.parse(localStorage.getItem(vistasStorageKey())) || [];
}

function guardarVistas() {
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

/* ===============================
   RENDER VISTAS
================================ */

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

        document.querySelectorAll(".top5-result-btn").forEach(btn => {
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
        cancelarBtn.addEventListener("click", () => {
            document.getElementById("vistasResults").innerHTML = "";
            document.getElementById("vistasSearchInput").value = "";
        });
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

        guardarVistas();
        renderVistas();
        renderBioTags();

        const input = document.getElementById("vistasSearchInput");
        const results = document.getElementById("vistasResults");

        if (input) input.value = "";
        if (results) {
            results.innerHTML = `<p class="top5-empty">Agregado correctamente con ${puntaje}/5 estrellas.</p>`;
        }

        await cargarCantidadPosts(obtenerIdUsuario());

    } catch (error) {
        console.error("Error guardando vista:", error);

        const results = document.getElementById("vistasResults");

        if (results) {
            results.innerHTML = `<p class="top5-empty">No se pudo guardar la vista.</p>`;
        }
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
            tipoContenido: item.tipoBackend || convertirTipoBackend(item.tipoVisual),
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
            idContenido: idContenido,
            puntaje: puntaje,
            comentario: null
        })
    });
}

/* ===============================
   TOP 5 LATERAL / PERFIL
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
   BIO TAGS
================================ */

function renderBioTags() {
    const container = document.getElementById("bioTags");

    if (!container) return;

    const vistasGuardadas = JSON.parse(localStorage.getItem(vistasStorageKey())) || [];
    const top5Guardado = JSON.parse(localStorage.getItem(top5StorageKey())) || [];

    const base = [...top5Guardado.filter(Boolean), ...vistasGuardadas];

    if (base.length === 0) {
        container.innerHTML = `<li><span class="bio-tag">🎬 Sin preferencias aún</span></li>`;
        return;
    }

    const conteo = {};

    base.forEach(item => {
        const peso = item.puntaje || 1;

        obtenerTagsDelItem(item).forEach(tag => {
            conteo[tag] = (conteo[tag] || 0) + peso;
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
        proveedor,
        titulo: item.titulo || item.title || item.name || item.title_english || "Sin título",
        tipoVisual,
        tipoBackend,
        tipoContenido: tipoVisual,
        posterUrl: item.posterUrl || item.imageUrl || item.coverUrl || item.images?.jpg?.image_url || "",
        anioEstreno:
            item.anioEstreno ||
            item.year ||
            obtenerAnioDesdeFecha(item.fechaEstreno || item.release_date || item.aired?.from),
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

    if (String(item.proveedor || item.apiProvider || "").toUpperCase() === "JIKAN") {
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
        "Anime": "Anime",
        "Animation": "Animación",
        "Romance": "Romance",
        "Drama": "Drama",
        "Horror": "Terror",
        "Terror": "Terror",
        "Action": "Acción",
        "Adventure": "Aventura",
        "Comedy": "Comedia",
        "Fantasy": "Fantasía",
        "Mystery": "Misterio",
        "Science Fiction": "Sci-Fi",
        "Thriller": "Suspenso",
        "Crime": "Crimen",
        "Family": "Familia",
        "Music": "Música"
    };

    return mapa[limpio] || limpio;
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

    if (t.includes("romance")) return "❤️";
    if (t.includes("anime")) return "🌸";
    if (t.includes("terror")) return "👻";
    if (t.includes("drama")) return "🎭";
    if (t.includes("serie")) return "📺";
    if (t.includes("película") || t.includes("pelicula")) return "🎬";
    if (t.includes("acción") || t.includes("accion")) return "💥";
    if (t.includes("comedia")) return "😂";
    if (t.includes("fantas")) return "✨";
    if (t.includes("sci")) return "🚀";

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