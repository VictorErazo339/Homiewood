import { apiRequest } from "../api/api.js";

let usuarioActual = null;
let top5 = [null, null, null, null, null];

let logrosUsuario = [];
let logrosDestacados = [];

/* ===============================
   INIT COMÚN
================================ */

export function iniciarPerfilComun() {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        window.location.href = "./login.html";
        return null;
    }

    try {
        usuarioActual = JSON.parse(usuarioGuardado);
    } catch (error) {
        console.error("Usuario inválido en localStorage:", error);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        window.location.href = "./login.html";
        return null;
    }

    actualizarHeaderPerfil(usuarioActual);

    return {
        usuarioActual,
        idUsuario: obtenerIdUsuario()
    };
}

export function obtenerUsuarioActual() {
    return usuarioActual;
}

export function obtenerIdUsuario() {
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

export function top5StorageKey() {
    return `homiwood_top5_${obtenerIdUsuario()}`;
}

export function vistasStorageKey() {
    return `homiwood_vistas_${obtenerIdUsuario()}`;
}

/* ===============================
   USUARIO
================================ */

export async function cargarDatosUsuario(idUsuario) {
    actualizarHeaderPerfil(usuarioActual);

    try {
        const usuario = await apiRequest(`/usuarios/${idUsuario}`);

        usuarioActual = {
            ...usuarioActual,
            ...usuario
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioActual));
        actualizarHeaderPerfil(usuarioActual);

        return usuarioActual;
    } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        actualizarHeaderPerfil(usuarioActual);
        return usuarioActual;
    }
}

function obtenerDescripcionPerfil(usuario) {
    const descripcion = usuario?.descripcion;

    if (descripcion && String(descripcion).trim().length > 0) {
        return descripcion;
    }

    return "Cinéfilo 🎥 da tú mejor descripcion.";
}

export function actualizarHeaderPerfil(usuario) {
    const nombreEl = document.getElementById("profileName");
    const usernameEl = document.getElementById("profileUsername");
    const bioEl = document.getElementById("profileBio");
    const profileAvatar = document.getElementById("profileAvatar");

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

    if (profileAvatar && usuario?.iconoPerfil) {
        profileAvatar.src = `../img/${usuario.iconoPerfil}.webp`;
    }
}

/* ===============================
   EDITAR PERFIL
================================ */

export function inicializarEditarPerfil() {
    const modalEl = document.getElementById("editProfileModal");
    const nombreInput = document.getElementById("editProfileNombre");
    const descripcionInput = document.getElementById("editProfileDescripcion");
    const contador = document.getElementById("editProfileCounter");
    const guardarBtn = document.getElementById("saveProfileBtn");

    if (!modalEl || !nombreInput || !descripcionInput || !guardarBtn) {
        return;
    }

    if (modalEl.dataset.profileEditInitialized === "true") {
        return;
    }

    modalEl.dataset.profileEditInitialized = "true";

    modalEl.addEventListener("show.bs.modal", function () {
        nombreInput.value = usuarioActual?.nombre || "";
        descripcionInput.value = usuarioActual?.descripcion || "";

        actualizarContadorDescripcion();

        const iconoActual = usuarioActual?.iconoPerfil;

        document.querySelectorAll(".icon-option").forEach(btn => {
            btn.classList.toggle(
                "selected",
                Number(btn.dataset.icono) === Number(iconoActual)
            );
        });

        setTimeout(() => nombreInput.focus(), 150);
    });

    descripcionInput.addEventListener("input", actualizarContadorDescripcion);

    document.querySelectorAll(".icon-option").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".icon-option")
                .forEach(b => b.classList.remove("selected"));

            btn.classList.add("selected");
        });
    });

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

        const iconoSeleccionado = document.querySelector(".icon-option.selected");

        if (iconoSeleccionado) {
            const icono = Number(iconoSeleccionado.dataset.icono);

            const usuarioConIcono = await apiRequest(
                `/usuarios/${obtenerIdUsuario()}/icono?iconoPerfil=${icono}`,
                {
                    method: "PATCH"
                }
            );

            usuarioActual = {
                ...usuarioActual,
                ...usuarioConIcono,
                iconoPerfil: icono
            };
        }

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
   POSTS COUNT
================================ */

export async function cargarCantidadPosts(idUsuario) {
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

        return publicaciones.length;
    } catch (error) {
        console.error("Error cargando cantidad de posts:", error);
        return 0;
    }
}

/* ===============================
   TOP 5 LOCAL + BACKEND
================================ */

export function cargarTop5Local() {
    const guardado = localStorage.getItem(top5StorageKey());

    if (guardado) {
        try {
            const data = JSON.parse(guardado);

            if (Array.isArray(data)) {
                top5 = normalizarSlotsTop5(data);
            }
        } catch (error) {
            console.error("Top 5 inválido en localStorage:", error);
            top5 = [null, null, null, null, null];
        }
    }

    return top5;
}

export function guardarTop5Local() {
    localStorage.setItem(top5StorageKey(), JSON.stringify(top5));
}

export function obtenerTop5() {
    return top5;
}

export function asignarTop5(nuevoTop5) {
    top5 = normalizarSlotsTop5(nuevoTop5);
    guardarTop5Local();
    return top5;
}

function normalizarSlotsTop5(data) {
    const slots = [null, null, null, null, null];

    data.slice(0, 5).forEach((item, index) => {
        slots[index] = item || null;
    });

    return slots;
}

export async function cargarTop5DesdeBackend() {
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

        guardarTop5Local();
        renderTop5();

        return top5;
    } catch (error) {
        console.error("Error cargando Top 5 desde backend:", error);
        cargarTop5Local();
        renderTop5();

        return top5;
    }
}

export function renderTop5() {
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

                ${
                    item.posterUrl
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
}

async function quitarDelTop5(index) {
    const item = top5[index];

    if (!item) return;

    const confirmar = confirm(`¿Quitar "${item.titulo}" de tu Top 5?`);

    if (!confirmar) return;

    try {
        await borrarItemTop5Backend(item, index);

        top5[index] = null;
        guardarTop5Local();

        renderTop5();
        renderBioTags();

        await cargarLogrosDestacadosHeaderRapido(obtenerIdUsuario());
    } catch (error) {
        console.error("Error quitando del Top 5:", error);
        alert("No se pudo quitar del Top 5.");
    }
}

/* ===============================
   VISTAS PARA TAGS
================================ */

export async function sincronizarVistasParaTags(idUsuario) {
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

        return vistas;
    } catch (error) {
        console.error("Error sincronizando vistas para tags:", error);
        return [];
    }
}

export function renderBioTags() {
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

/* ===============================
   LOGROS
================================ */

export async function cargarLogrosDestacadosHeaderRapido(idUsuario) {
    try {
        const destacados = await apiRequest(`/usuarios/${idUsuario}/logros/destacados`);

        logrosDestacados = Array.isArray(destacados) ? destacados : [];

        renderLogrosDestacadosHeader();

        return logrosDestacados;
    } catch (error) {
        console.error("Error cargando logros destacados:", error);
        renderLogrosHeaderError();

        return [];
    }
}

export function inicializarLogrosModal() {
    const modalEl = document.getElementById("achievementsModal");

    if (!modalEl) return;

    if (modalEl.dataset.achievementsInitialized === "true") {
        return;
    }

    modalEl.dataset.achievementsInitialized = "true";

    modalEl.addEventListener("show.bs.modal", async function () {
        await cargarLogrosPerfil(obtenerIdUsuario());
    });
}

export async function cargarLogrosPerfil(idUsuario) {
    try {
        const [todos, destacados] = await Promise.all([
            apiRequest(`/usuarios/${idUsuario}/logros`),
            apiRequest(`/usuarios/${idUsuario}/logros/destacados`)
        ]);

        logrosUsuario = Array.isArray(todos) ? todos : [];
        logrosDestacados = Array.isArray(destacados) ? destacados : [];

        renderLogrosDestacadosHeader();
        renderModalLogros();

        return {
            logrosUsuario,
            logrosDestacados
        };
    } catch (error) {
        console.error("Error cargando logros:", error);
        renderLogrosHeaderError();

        return {
            logrosUsuario: [],
            logrosDestacados: []
        };
    }
}

function renderLogrosDestacadosHeader() {
    const container = document.getElementById("profileAchievements");

    if (!container) return;

    const destacados = logrosDestacados
        .filter(logro => logro.desbloqueado)
        .slice(0, 3);

    const boton = `
        <button class="edit-btn" type="button" data-bs-toggle="modal" data-bs-target="#achievementsModal">
            🏅 Ver todos
        </button>
    `;

    if (destacados.length === 0) {
        container.innerHTML = `
            <div class="achievement-item achievement-empty">
                <span class="ach-icon" aria-hidden="true">🏅</span>
                <span class="ach-name">Sin logros destacados</span>
            </div>
            ${boton}
        `;
        return;
    }

    container.innerHTML = destacados.map(logro => `
        <div class="achievement-item" title="${escapeHtml(logro.descripcion)}">
            <span class="ach-icon" aria-hidden="true">${escapeHtml(logro.icono || "🏅")}</span>
            <span class="ach-name">${escapeHtml(logro.nombre)}</span>
        </div>
    `).join("") + boton;
}

function renderLogrosHeaderError() {
    const container = document.getElementById("profileAchievements");

    if (!container) return;

    container.innerHTML = `
        <div class="achievement-item achievement-empty">
            <span class="ach-icon" aria-hidden="true">⚠️</span>
            <span class="ach-name">Logros no disponibles</span>
        </div>

        <button class="edit-btn" type="button" data-bs-toggle="modal" data-bs-target="#achievementsModal">
            🏅 Ver todos
        </button>
    `;
}

function renderModalLogros() {
    const obtained = document.getElementById("achObtained");
    const easy = document.getElementById("achLockedEasy");
    const medium = document.getElementById("achLockedMedium");
    const hard = document.getElementById("achLockedHard");
    const hidden = document.getElementById("achHidden");
    const counter = document.getElementById("achSelectedCounter");

    if (!obtained || !easy || !medium || !hard || !hidden) return;

    const destacadosIds = new Set(
        logrosDestacados.map(logro => Number(logro.idLogro))
    );

    if (counter) {
        counter.textContent = `${destacadosIds.size}/3 destacados`;
    }

    const desbloqueados = logrosUsuario.filter(logro => logro.desbloqueado);

    const bloqueadosFaciles = logrosUsuario.filter(logro =>
        !logro.desbloqueado && logro.dificultad === "FACIL" && !logro.oculto
    );

    const bloqueadosMedios = logrosUsuario.filter(logro =>
        !logro.desbloqueado && logro.dificultad === "MEDIO" && !logro.oculto
    );

    const bloqueadosDificiles = logrosUsuario.filter(logro =>
        !logro.desbloqueado && logro.dificultad === "DIFICIL" && !logro.oculto
    );

    const ocultos = logrosUsuario.filter(logro => logro.oculto);

    obtained.innerHTML = renderListaLogros(
        desbloqueados,
        destacadosIds,
        "No tienes logros desbloqueados todavía."
    );

    easy.innerHTML = renderListaLogros(
        bloqueadosFaciles,
        destacadosIds,
        "No quedan logros fáciles bloqueados."
    );

    medium.innerHTML = renderListaLogros(
        bloqueadosMedios,
        destacadosIds,
        "No quedan logros medios bloqueados."
    );

    hard.innerHTML = renderListaLogros(
        bloqueadosDificiles,
        destacadosIds,
        "No quedan logros difíciles bloqueados."
    );

    hidden.innerHTML = renderListaLogros(
        ocultos,
        destacadosIds,
        "No hay logros ocultos disponibles."
    );

    document.querySelectorAll(".ach-select-btn").forEach(btn => {
        btn.addEventListener("click", async function () {
            const idLogro = Number(btn.dataset.idLogro);
            await toggleLogroDestacado(idLogro);
        });
    });
}

function renderListaLogros(lista, destacadosIds, mensajeVacio) {
    if (!lista || lista.length === 0) {
        return `<li class="ach-modal-empty">${escapeHtml(mensajeVacio)}</li>`;
    }

    return lista.map(logro => renderLogroCard(logro, destacadosIds)).join("");
}

function renderLogroCard(logro, destacadosIds) {
    const desbloqueado = Boolean(logro.desbloqueado);
    const destacado = destacadosIds.has(Number(logro.idLogro));
    const ocultoBloqueado = Boolean(logro.oculto) && !desbloqueado;

    const progresoActual = Number(logro.progresoActual || 0);
    const valorObjetivo = Number(logro.valorObjetivo || 1);

    const porcentaje = Math.max(
        0,
        Math.min(100, Math.round((progresoActual / valorObjetivo) * 100))
    );

    const claseEstado = desbloqueado ? "is-unlocked" : "is-locked";
    const claseOculto = ocultoBloqueado ? "is-hidden-locked" : "";

    const botonDestacar = desbloqueado
        ? `
            <button type="button"
                    class="ach-select-btn ${destacado ? "is-selected" : ""}"
                    data-id-logro="${logro.idLogro}"
                    title="${destacado ? "Quitar de destacados" : "Destacar logro"}">
                ${destacado ? "✓" : "+"}
            </button>
        `
        : `<span class="ach-modal-lock">🔒</span>`;

    return `
        <li class="ach-modal-card ${claseEstado} ${claseOculto}">
            <div class="ach-modal-main">
                <span class="ach-modal-icon" aria-hidden="true">
                    ${escapeHtml(logro.icono || "🏅")}
                </span>

                <div class="ach-modal-info">
                    <strong>${escapeHtml(logro.nombre || "???")}</strong>
                    <small>${escapeHtml(logro.descripcion || "")}</small>

                    <div class="ach-modal-progress">
                        <div class="ach-progress-bar" aria-hidden="true">
                            <div class="ach-progress-fill" style="width:${porcentaje}%"></div>
                        </div>

                        <span class="ach-progress-text">
                            ${progresoActual}/${valorObjetivo}
                        </span>
                    </div>
                </div>
            </div>

            ${botonDestacar}
        </li>
    `;
}

async function toggleLogroDestacado(idLogro) {
    const logro = logrosUsuario.find(item => Number(item.idLogro) === Number(idLogro));

    if (!logro || !logro.desbloqueado) {
        alert("Solo puedes destacar logros desbloqueados.");
        return;
    }

    const idsActuales = logrosDestacados.map(item => Number(item.idLogro));
    const yaDestacado = idsActuales.includes(Number(idLogro));

    let nuevosIds;

    if (yaDestacado) {
        nuevosIds = idsActuales.filter(id => id !== Number(idLogro));
    } else {
        if (idsActuales.length >= 3) {
            alert("Solo puedes destacar máximo 3 logros.");
            return;
        }

        nuevosIds = [...idsActuales, Number(idLogro)];
    }

    try {
        logrosDestacados = await apiRequest(`/usuarios/${obtenerIdUsuario()}/logros/destacados`, {
            method: "PUT",
            body: JSON.stringify({
                idsLogros: nuevosIds
            })
        });

        await cargarLogrosPerfil(obtenerIdUsuario());
    } catch (error) {
        console.error("Error actualizando logros destacados:", error);
        alert(error?.message || "No se pudieron actualizar los logros destacados.");
    }
}
/* ===============================
   MODAL TOP 5 COMÚN
================================ */

let top5Draft = [null, null, null, null, null];
let posicionDraftActiva = 0;
let peliculaSeleccionada = null;

export function inicializarTop5Modal() {
    const modalEl = document.getElementById("top5Modal");
    const input = document.getElementById("top5SearchInput");
    const saveBtn = document.getElementById("saveTop5Btn");
    const results = document.getElementById("top5Results");
    const clearSlotBtn = document.getElementById("clearTop5SlotBtn");

    if (!modalEl || !input || !saveBtn || !results) {
        return;
    }

    if (modalEl.dataset.top5Initialized === "true") {
        return;
    }

    modalEl.dataset.top5Initialized = "true";

    let timeoutBusqueda = null;

    modalEl.addEventListener("show.bs.modal", function () {
        prepararTop5Draft();

        setTimeout(() => {
            input.focus();
        }, 250);
    });

    modalEl.addEventListener("hidden.bs.modal", function () {
        limpiarModalTop5();
    });

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

    if (clearSlotBtn) {
        clearSlotBtn.addEventListener("click", function () {
            limpiarPosicionDraftActiva();
        });
    }

    saveBtn.addEventListener("click", guardarCambiosTop5Draft);
}

function prepararTop5Draft() {
    const top5Actual = obtenerTop5();

    top5Draft = top5Actual.map(item => item ? { ...item } : null);

    const primerVacio = top5Draft.findIndex(item => !item);
    posicionDraftActiva = primerVacio !== -1 ? primerVacio : 0;

    peliculaSeleccionada = null;

    renderTop5DraftSlots();
    renderPreviewTop5(top5Draft[posicionDraftActiva], true, posicionDraftActiva);
    actualizarEstadoBotonTop5();
}

function renderTop5DraftSlots() {
    const slotsContainer = document.getElementById("top5DraftSlots");

    if (!slotsContainer) return;

    slotsContainer.innerHTML = top5Draft.map((item, index) => {
        const activo = index === posicionDraftActiva;
        const vacio = !item;

        return `
            <article class="top5-draft-slot ${activo ? "is-active" : ""} ${vacio ? "is-empty" : ""}"
                     data-pos="${index}"
                     role="button"
                     tabindex="0"
                     aria-label="Editar posición ${index + 1} del Top 5">

                <div class="top5-draft-rank">#${index + 1}</div>

                ${item ? `
                    <button type="button"
                            class="top5-draft-remove"
                            data-pos="${index}"
                            title="Vaciar posición #${index + 1}"
                            aria-label="Vaciar posición #${index + 1}">
                        ×
                    </button>
                ` : ""}

                <div class="top5-draft-poster">
                    ${
                        item?.posterUrl
                            ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                            : `<span>Vacío</span>`
                    }
                </div>

                <div class="top5-draft-info">
                    <strong>${item ? escapeHtml(item.titulo) : "Elige una película"}</strong>
                    <small>
                        ${
                            item
                                ? `${escapeHtml(item.tipoVisual || item.tipoContenido || "Contenido")} ${item.anioEstreno ? "· " + item.anioEstreno : ""}`
                                : "Click para editar"
                        }
                    </small>
                </div>
            </article>
        `;
    }).join("");

    document.querySelectorAll(".top5-draft-slot").forEach(slot => {
        slot.addEventListener("click", function (event) {
            if (event.target.closest(".top5-draft-remove")) return;

            seleccionarSlotDraft(Number(slot.dataset.pos));
        });

        slot.addEventListener("keydown", function (event) {
            if (event.key !== "Enter" && event.key !== " ") return;

            event.preventDefault();
            seleccionarSlotDraft(Number(slot.dataset.pos));
        });
    });

    document.querySelectorAll(".top5-draft-remove").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();

            const pos = Number(btn.dataset.pos);
            top5Draft[pos] = null;

            if (pos === posicionDraftActiva) {
                renderPreviewTop5(null, true, pos);
            }

            renderTop5DraftSlots();
            actualizarEstadoBotonTop5();
        });
    });

    actualizarBotonVaciarSlot();
}

function seleccionarSlotDraft(posicion) {
    posicionDraftActiva = posicion;

    renderTop5DraftSlots();
    renderPreviewTop5(top5Draft[posicionDraftActiva], true, posicionDraftActiva);

    const input = document.getElementById("top5SearchInput");

    if (input) {
        input.focus();
    }
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

        renderResultadosBusquedaTop5(normalizadas);
    } catch (error) {
        console.error("Error buscando en catálogo:", error);
        results.innerHTML = `<p class="top5-empty">No se pudo conectar con la API.</p>`;
    }
}

function renderResultadosBusquedaTop5(items) {
    const results = document.getElementById("top5Results");

    if (!results) return;

    if (!items || items.length === 0) {
        results.innerHTML = `<p class="top5-empty">Sin resultados.</p>`;
        return;
    }

    results.innerHTML = items.map((item, index) => `
        <button type="button"
                class="top5-result-btn"
                data-index="${index}"
                title="Agregar a la posición #${posicionDraftActiva + 1}">
            ${
                item.posterUrl
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
            const item = items[index];

            document.querySelectorAll(".top5-result-btn")
                .forEach(b => b.classList.remove("is-selected"));

            btn.classList.add("is-selected");

            agregarResultadoAlDraft(item);
        });
    });
}

function agregarResultadoAlDraft(item) {
    if (!item) return;

    const posicionDestino = posicionDraftActiva;

    peliculaSeleccionada = item;

    const posicionRepetida = top5Draft.findIndex((actual, index) =>
        index !== posicionDestino && esMismoContenidoTop5(actual, item)
    );

    if (posicionRepetida !== -1) {
        top5Draft[posicionRepetida] = null;
        mostrarToastPerfil(`"${item.titulo}" se movió a la posición #${posicionDestino + 1}.`);
    } else {
        mostrarToastPerfil(`Agregado a la posición #${posicionDestino + 1}.`);
    }

    top5Draft[posicionDestino] = { ...item };

    const siguienteVacio = buscarSiguienteSlotVacio(posicionDestino);

    if (siguienteVacio !== null) {
        posicionDraftActiva = siguienteVacio;
    }

    renderTop5DraftSlots();
    renderPreviewTop5(item, false, posicionDestino);
    actualizarEstadoBotonTop5();
}

function buscarSiguienteSlotVacio(posicionActual) {
    for (let i = posicionActual + 1; i < top5Draft.length; i++) {
        if (!top5Draft[i]) return i;
    }

    for (let i = 0; i < top5Draft.length; i++) {
        if (!top5Draft[i]) return i;
    }

    return null;
}

function renderPreviewTop5(item, desdeSlot = false, posicion = posicionDraftActiva) {
    const preview = document.getElementById("top5Preview");

    if (!preview) return;

    if (!item) {
        preview.innerHTML = `
            <div class="top5-preview-empty">
                <span class="top5-preview-rank">#${posicion + 1}</span>
                <strong>Posición vacía</strong>
                <small>Busca una película o serie para agregarla aquí.</small>
            </div>
        `;
        return;
    }

    preview.innerHTML = `
        <span class="top5-preview-rank">#${posicion + 1}</span>

        ${
            item.posterUrl
                ? `<img src="${item.posterUrl}" alt="${escapeHtml(item.titulo)}">`
                : ""
        }

        <strong>${escapeHtml(item.titulo)}</strong>

        <small>
            ${escapeHtml(item.tipoVisual || item.tipoContenido || "Contenido")}
            ${item.anioEstreno ? "· " + item.anioEstreno : ""}
        </small>

        <span class="top5-preview-hint">
            ${desdeSlot ? "Editando esta posición" : "Agregado al borrador"}
        </span>
    `;
}

function limpiarPosicionDraftActiva() {
    const item = top5Draft[posicionDraftActiva];

    if (!item) {
        mostrarToastPerfil("Esta posición ya está vacía.");
        return;
    }

    top5Draft[posicionDraftActiva] = null;

    renderTop5DraftSlots();
    renderPreviewTop5(null, true, posicionDraftActiva);
    actualizarEstadoBotonTop5();

    mostrarToastPerfil(`Posición #${posicionDraftActiva + 1} vaciada. Guarda los cambios para confirmar.`);
}

async function guardarCambiosTop5Draft() {
    const saveBtn = document.getElementById("saveTop5Btn");

    if (!saveBtn) return;

    if (!top5TieneCambios()) {
        cerrarModalTop5();
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Guardando...";

    try {
        const top5Actual = obtenerTop5();

        const cambios = [];

        for (let i = 0; i < top5Draft.length; i++) {
            const original = top5Actual[i];
            const nuevo = top5Draft[i];

            if (!esMismoSlotTop5(original, nuevo)) {
                cambios.push({
                    index: i,
                    original,
                    nuevo
                });
            }
        }

        const eliminaciones = cambios.filter(cambio => cambio.original);
        const guardados = cambios.filter(cambio => cambio.nuevo);

        for (const cambio of eliminaciones) {
            await borrarItemTop5Backend(cambio.original, cambio.index);
        }

        for (const cambio of guardados) {
            await guardarTop5EnBackend(cambio.nuevo, cambio.index + 1);
        }

        await cargarTop5DesdeBackend();

        renderTop5();
        renderBioTags();

        await cargarLogrosDestacadosHeaderRapido(obtenerIdUsuario());

        limpiarModalTop5();
        cerrarModalTop5();

        mostrarToastPerfil("Top 5 actualizado.");
    } catch (error) {
        console.error("Error guardando cambios del Top 5:", error);
        alert("No se pudieron guardar los cambios del Top 5.");
    } finally {
        actualizarEstadoBotonTop5();
    }
}

async function borrarItemTop5Backend(item, index) {
    if (!item) return;

    if (item.idListaContenido) {
        await apiRequest(`/listas/contenidos/${item.idListaContenido}`, {
            method: "DELETE"
        });
        return;
    }

    if (item.idLista && item.idContenido) {
        await apiRequest(`/listas/${item.idLista}/contenidos/${item.idContenido}`, {
            method: "DELETE"
        });
        return;
    }

    if (item.idLista) {
        await apiRequest(`/listas/${item.idLista}/posiciones/${index + 1}`, {
            method: "DELETE"
        });
    }
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

function actualizarEstadoBotonTop5() {
    const saveBtn = document.getElementById("saveTop5Btn");

    if (!saveBtn) return;

    const tieneCambios = top5TieneCambios();

    saveBtn.disabled = !tieneCambios;
    saveBtn.textContent = tieneCambios ? "Guardar cambios" : "Sin cambios";

    actualizarBotonVaciarSlot();
}

function actualizarBotonVaciarSlot() {
    const clearSlotBtn = document.getElementById("clearTop5SlotBtn");

    if (!clearSlotBtn) return;

    clearSlotBtn.disabled = !top5Draft[posicionDraftActiva];
}

function top5TieneCambios() {
    const top5Actual = obtenerTop5();

    return top5Draft.some((item, index) => !esMismoSlotTop5(top5Actual[index], item));
}

function esMismoSlotTop5(original, nuevo) {
    if (!original && !nuevo) return true;
    if (!original || !nuevo) return false;

    return esMismoContenidoTop5(original, nuevo);
}

function esMismoContenidoTop5(a, b) {
    if (!a || !b) return false;

    return obtenerClaveContenidoTop5(a) === obtenerClaveContenidoTop5(b);
}

function obtenerClaveContenidoTop5(item) {
    if (!item) return "";

    const idContenido = item.idContenido || item.id_contenido;

    if (idContenido) {
        return `BD:${idContenido}`;
    }

    const proveedor = String(item.proveedor || item.apiProvider || "API").toUpperCase();
    const apiId = String(item.apiId || item.id || item.mal_id || "").trim();

    if (apiId) {
        return `${proveedor}:${apiId}`;
    }

    const titulo = String(item.titulo || item.tituloContenido || "").trim().toLowerCase();
    const anio = item.anioEstreno || "";

    return `TITULO:${titulo}:${anio}`;
}

function limpiarModalTop5() {
    const input = document.getElementById("top5SearchInput");
    const results = document.getElementById("top5Results");
    const preview = document.getElementById("top5Preview");

    if (input) input.value = "";

    if (results) {
        results.innerHTML = `<p class="top5-empty">Escribe para buscar.</p>`;
    }

    if (preview) {
        preview.innerHTML = `
            <div class="top5-preview-empty">
                Elige una posición y busca una película o serie.
            </div>
        `;
    }

    peliculaSeleccionada = null;

    const top5Actual = obtenerTop5();
    top5Draft = top5Actual.map(item => item ? { ...item } : null);
    posicionDraftActiva = 0;

    document.querySelectorAll(".top5-result-btn")
        .forEach(el => el.classList.remove("is-selected"));
}

function cerrarModalTop5() {
    const modalElement = document.getElementById("top5Modal");

    if (window.bootstrap && modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }
    }
}

function mostrarToastPerfil(mensaje) {
    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = mensaje;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    setTimeout(() => {
        toast.classList.remove("is-visible");

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 2200);
}
/* ===============================
   HELPERS CONTENIDO / TAGS
================================ */

export function normalizarContenidoApi(item) {
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

export function convertirTipoBackend(tipoVisual) {
    if (tipoVisual === "Película") return "PELICULA";
    return "SERIE";
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

export function escapeHtml(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}