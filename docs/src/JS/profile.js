import { apiRequest } from "../api/api.js";

console.log("profile.js cargado correctamente");

let usuarioActual = null;
let top5 = [null, null, null, null, null];
let peliculaSeleccionada = null;
let posicionSeleccionada = null;
let peliculaPerfilSeleccionada = null;

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded profile");

    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        window.location.href = "./login.html";
        return;
    }

    try {
        usuarioActual = JSON.parse(usuarioGuardado);
    } catch (error) {
        console.error("Usuario inválido en localStorage:", error);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        window.location.href = "./login.html";
        return;
    }

    const idUsuario = obtenerIdUsuario();

    await cargarDatosUsuario(idUsuario);
    await cargarPostsUsuario(idUsuario);
    await cargarTop5DesdeBackend();
    await sincronizarVistasParaTags(idUsuario);

    renderTop5();
    renderBioTags();

    inicializarTop5Modal();
    inicializarComposerPerfil();
    inicializarEditarPerfil();
});

function obtenerIdUsuario() {
    const idUsuario = usuarioActual?.idUsuario || usuarioActual?.id;

    if (!idUsuario) {
        console.error("Usuario inválido en localStorage:", usuarioActual);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        window.location.href = "./login.html";
        throw new Error("No se encontró idUsuario en localStorage");
    }

    return idUsuario;
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
/* ===============================
   POSTS / RESEÑAS
================================ */

async function cargarPostsUsuario(idUsuario) {
    try {
        const calificaciones = await apiRequest(`/calificaciones/usuario/${idUsuario}`);
        const publicaciones = calificaciones.filter(esPublicacion);

        const feed = document.getElementById("feed");
        const statPosts = document.getElementById("statPosts");

        if (statPosts) {
            statPosts.textContent = publicaciones.length;
        }

        if (!feed) return;

        if (publicaciones.length === 0) {
            feed.innerHTML = `
                <p style="color:#aaa; text-align:center; margin-top:2rem;">
                    Aún no has publicado nada.
                </p>
            `;
            return;
        }

        feed.innerHTML = publicaciones
            .slice()
            .reverse()
            .map(c => renderPost(c))
            .join("");
    } catch (error) {
        console.error("Error cargando posts:", error);
    }
}

function esPublicacion(calificacion) {
    return calificacion.comentario &&
        String(calificacion.comentario).trim().length > 0;
}

function renderPost(c) {
    const fecha = c.fechaCalificacion
        ? String(c.fechaCalificacion).split("T")[0]
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

    const puntaje = Number(c.puntaje || 0);

    return `
        <article class="post-card" id="post-${c.idCalificacion || ""}">
            <div class="post-cover" style="${poster
                ? `background-image:url('${poster}')`
                : "background:linear-gradient(135deg,#2a1a4a,#5a2a8a)"
            }"></div>

            <div class="post-body">
                <div class="post-movie-info">
                    <span class="post-movie-title">${escapeHtml(titulo)}</span>
                    <span class="post-movie-meta">${escapeHtml(tipo)}</span>
                </div>

                ${puntaje > 0 ? `<div class="post-rating">${renderEstrellas(puntaje)}</div>` : ""}

                <p class="post-text">${escapeHtml(c.comentario || "")}</p>

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
   TOP 5 DESDE BACKEND
================================ */

async function cargarTop5DesdeBackend() {
    try {
        const idUsuario = obtenerIdUsuario();

        const data = await apiRequest(
            `/usuarios/${idUsuario}/listas/contenidos?estado=FAVORITO`
        );

        top5 = [null, null, null, null, null];

        data.forEach(item => {
            const posicion = item.posicion ? item.posicion - 1 : null;

            const normalizado = {
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
                generos: item.generos || []
            };

            if (posicion !== null && posicion >= 0 && posicion < 5) {
                top5[posicion] = normalizado;
            }
        });

        guardarTop5();
    } catch (error) {
        console.error("Error cargando Top 5 desde backend:", error);
        cargarTop5();
    }
}

function top5StorageKey() {
    return `homiwood_top5_${obtenerIdUsuario()}`;
}

function vistasStorageKey() {
    return `homiwood_vistas_${obtenerIdUsuario()}`;
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
                    <div class="movie-poster movie-poster-empty">Vacío</div>
                </article>
            `;
        }

        return `
            <article class="movie-card top5-card-wrap" style="position:relative;">
                <span class="top5-rank">#${index + 1}</span>

                <button type="button"
                        class="top5-remove-btn"
                        data-index="${index}"
                        title="Quitar del Top 5"
                        aria-label="Quitar ${escapeHtml(item.titulo)} del Top 5"
                        style="
                            position:absolute;
                            top:8px;
                            right:8px;
                            z-index:5;
                            width:28px;
                            height:28px;
                            border-radius:50%;
                            border:1px solid rgba(255,255,255,.35);
                            background:rgba(0,0,0,.78);
                            color:#fff;
                            font-size:18px;
                            line-height:1;
                            cursor:pointer;
                        ">
                    ×
                </button>

                ${item.posterUrl
                    ? `<img class="movie-poster" src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                    : `<div class="movie-poster movie-poster-empty">${escapeHtml(item.titulo)}</div>`
                }
            </article>
        `;
    }).join("");

    document.querySelectorAll(".top5-remove-btn").forEach(btn => {
        btn.addEventListener("click", async event => {
            event.stopPropagation();

            const index = Number(btn.dataset.index);
            await quitarDelTop5(index);
        });
    });

    actualizarSlotLabels();
}

async function quitarDelTop5(index) {
    const item = top5[index];

    if (!item) return;

    const confirmar = confirm(`¿Quitar "${item.titulo}" de tu Top 5?`);

    if (!confirmar) return;

    try {
        if (item.idListaContenido) {
            await apiRequest(`/listas/contenidos/${item.idListaContenido}`, {
                method: "DELETE"
            });
        } else if (item.idLista && item.idContenido) {
            await apiRequest(`/listas/${item.idLista}/contenidos/${item.idContenido}`, {
                method: "DELETE"
            });
        } else if (item.idLista) {
            await apiRequest(`/listas/${item.idLista}/posiciones/${index + 1}`, {
                method: "DELETE"
            });
        }

        top5[index] = null;

        guardarTop5();
        renderTop5();
        renderBioTags();
    } catch (error) {
        console.error("Error quitando del Top 5:", error);
        alert("No se pudo quitar del Top 5.");
    }
}

/* ===============================
   MODAL TOP 5
================================ */

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

    saveBtn.addEventListener("click", async function () {
        if (!peliculaSeleccionada) {
            alert("Primero elige una película o serie.");
            return;
        }

        if (posicionSeleccionada === null) {
            alert("Elige una posición del 1 al 5.");
            return;
        }

        try {
            const guardado = await guardarTop5EnBackend(
                peliculaSeleccionada,
                posicionSeleccionada + 1
            );

            top5[posicionSeleccionada] = {
                ...peliculaSeleccionada,
                idListaContenido: guardado.idListaContenido,
                idLista: guardado.idLista,
                idContenido: guardado.idContenido || peliculaSeleccionada.idContenido
            };

            await cargarTop5DesdeBackend();

            guardarTop5();
            renderTop5();
            renderBioTags();
            limpiarModalTop5();

            const modalElement = document.getElementById("top5Modal");

            if (window.bootstrap && modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error("Error guardando Top 5:", error);
            alert("No se pudo guardar en Top 5.");
        }
    });
}

async function guardarTop5EnBackend(item, posicion) {
    const idUsuario = obtenerIdUsuario();

    return await apiRequest(`/usuarios/${idUsuario}/listas/top5/contenidos/externo`, {
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
            posicion,
            estado: "FAVORITO",
            generos: item.generos || []
        })
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
    if (results) results.innerHTML = `<p class="top5-empty">Escribe para buscar.</p>`;
    if (preview) preview.textContent = "Elige una película o serie";

    peliculaSeleccionada = null;
    posicionSeleccionada = null;

    document.querySelectorAll(".top5-result-btn, .top5-slot-btn")
        .forEach(el => el.classList.remove("is-selected"));
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
    if (meta) meta.textContent = `${item.tipoVisual} ${item.anioEstreno ? "· " + item.anioEstreno : ""}`;

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
    const comentario = textarea.value.trim();

    if (!peliculaPerfilSeleccionada || !comentario) return;

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

        await cargarPostsUsuario(obtenerIdUsuario());
        await sincronizarVistasParaTags(obtenerIdUsuario());
        renderBioTags();
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
    if (trigger) trigger.setAttribute("aria-expanded", "false");

    validarPostPerfil();
}

/* ===============================
   TAGS / PINES
================================ */

async function sincronizarVistasParaTags(idUsuario) {
    try {
        const data = await apiRequest(`/usuarios/${idUsuario}/listas/contenidos?estado=VISTO`);

        const vistas = data.map(item => ({
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
            generos: item.generos || []
        }));

        localStorage.setItem(vistasStorageKey(), JSON.stringify(vistas));
    } catch (error) {
        console.error("Error sincronizando vistas para tags:", error);
    }
}

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

    if (tagsFinales.length === 0) {
        container.innerHTML = `<li><span class="bio-tag">🎬 Sin preferencias aún</span></li>`;
        return;
    }

    container.innerHTML = tagsFinales.map(tag => `
        <li>
            <span class="bio-tag">${iconoTag(tag)} ${escapeHtml(tag)}</span>
        </li>
    `).join("");
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
        .filter(tag => !["Contenido", "TMDB", "JIKAN", "API", "BD"].includes(tag))
        .filter((tag, index, array) => array.indexOf(tag) === index);
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
    if (t === "PELICULA" || t === "PELÍCULA" || t === "MOVIE") return "Película";
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
        "PELÍCULA": "Película",
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