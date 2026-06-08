const MAX_NOTIFICATIONS = 5;
const STORAGE_KEY = "homiwood_notifications";

const SELECTOR_NOTIFICATION_BUTTONS = [
    '[data-navbar-notifications-btn]',
    '.nav-icons button[aria-label="Notificaciones"]',
    '.nav-icons button[title="Notificaciones"]'
].join(",");

let notificationButton = null;
let dropdown = null;
let list = null;
let badge = null;
let toastContainer = null;
let notifications = [];
let initialized = false;

document.addEventListener("DOMContentLoaded", () => {
    inicializarNavbarNotifications();
});

/* ============================================================
   INIT
============================================================ */

function inicializarNavbarNotifications() {
    if (initialized) return;
    initialized = true;

    notificationButton = obtenerBotonCampana();

    if (!notificationButton) {
        return;
    }

    notificationButton.classList.add("nav-notification-trigger");
    notificationButton.setAttribute("aria-label", "Notificaciones");
    notificationButton.setAttribute("aria-expanded", "false");

    crearBadge();
    crearDropdown();
    crearToastContainer();

    notifications = cargarNotificaciones();
    renderNotificaciones();

    notificationButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        cerrarOtrosMenus();
        toggleDropdown();
    });

    dropdown.addEventListener("click", event => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        cerrarDropdown();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            cerrarDropdown();
        }
    });

    window.addEventListener("homiwood:notification", event => {
        agregarNotificacion(event.detail);
    });

    window.HomiwoodNotifications = {
        add: agregarNotificacion,
        clear: limpiarNotificaciones,
        open: abrirDropdown,
        close: cerrarDropdown
    };
}

function obtenerBotonCampana() {
    const explicitButton = document.querySelector(SELECTOR_NOTIFICATION_BUTTONS);

    if (explicitButton) return explicitButton;

    const navButtons = document.querySelectorAll(".nav-icons button");

    return Array.from(navButtons).find(button => {
        const icon = button.querySelector("i");

        if (!icon) return false;

        return Array.from(icon.classList).some(className =>
            className.includes("bi-bell")
        );
    });
}

/* ============================================================
   UI
============================================================ */

function crearBadge() {
    if (notificationButton.querySelector(".nav-notification-badge")) {
        badge = notificationButton.querySelector(".nav-notification-badge");
        return;
    }

    badge = document.createElement("span");
    badge.className = "nav-notification-badge";
    badge.hidden = true;

    notificationButton.appendChild(badge);
}

function crearDropdown() {
    const existing = document.getElementById("navbarNotificationsDropdown");

    if (existing) {
        dropdown = existing;
        list = document.getElementById("navbarNotificationsList");
        return;
    }

    dropdown = document.createElement("section");
    dropdown.id = "navbarNotificationsDropdown";
    dropdown.className = "nav-notification-dropdown";
    dropdown.setAttribute("aria-hidden", "true");

    dropdown.innerHTML = `
        <header class="nav-notification-header">
            <div>
                <h2>Notificaciones</h2>
                <p>Últimas interacciones de Homiewood</p>
            </div>

            <button type="button"
                    class="nav-notification-clear"
                    id="clearNavbarNotifications"
                    aria-label="Limpiar notificaciones">
                <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
        </header>

        <div id="navbarNotificationsList" class="nav-notification-list"></div>
    `;

    document.body.appendChild(dropdown);

    list = document.getElementById("navbarNotificationsList");

    document
        .getElementById("clearNavbarNotifications")
        ?.addEventListener("click", limpiarNotificaciones);
}

function crearToastContainer() {
    if (document.getElementById("navbarNotificationToasts")) {
        toastContainer = document.getElementById("navbarNotificationToasts");
        return;
    }

    toastContainer = document.createElement("div");
    toastContainer.id = "navbarNotificationToasts";
    toastContainer.className = "nav-notification-toasts";

    document.body.appendChild(toastContainer);
}

/* ============================================================
   DROPDOWN
============================================================ */

function toggleDropdown() {
    if (dropdown.classList.contains("is-open")) {
        cerrarDropdown();
    } else {
        abrirDropdown();
    }
}

function abrirDropdown() {
    posicionarDropdown();

    dropdown.classList.add("is-open");
    dropdown.setAttribute("aria-hidden", "false");

    notificationButton.setAttribute("aria-expanded", "true");

    marcarTodasComoLeidas();
}

function cerrarDropdown() {
    if (!dropdown) return;

    dropdown.classList.remove("is-open");
    dropdown.setAttribute("aria-hidden", "true");

    notificationButton?.setAttribute("aria-expanded", "false");
}

function posicionarDropdown() {
    if (!notificationButton || !dropdown) return;

    const rect = notificationButton.getBoundingClientRect();

    const top = rect.bottom + 12;
    const right = Math.max(12, window.innerWidth - rect.right - 2);

    dropdown.style.setProperty("--notification-top", `${top}px`);
    dropdown.style.setProperty("--notification-right", `${right}px`);
}

function cerrarOtrosMenus() {
    document.querySelectorAll(".nav-profile-menu.is-open").forEach(menu => {
        menu.classList.remove("is-open");
    });

    document.querySelectorAll(".navbar-search-overlay.is-open").forEach(search => {
        search.classList.remove("is-open");
        search.setAttribute("aria-hidden", "true");
    });
}

/* ============================================================
   NOTIFICACIONES
============================================================ */

function agregarNotificacion(data = {}) {
    const notification = normalizarNotificacion(data);

    notifications.unshift(notification);
    notifications = notifications.slice(0, MAX_NOTIFICATIONS);

    guardarNotificaciones();
    renderNotificaciones();
    mostrarToast(notification);
}

function normalizarNotificacion(data) {
    const type = data.type || "info";

    const config = obtenerConfigTipo(type);

    return {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        type,
        title: data.title || config.title,
        message: data.message || config.message,
        url: data.url || null,
        read: false,
        createdAt: new Date().toISOString()
    };
}

function obtenerConfigTipo(type) {
    const configs = {
        follow: {
            icon: "bi-person-plus-fill",
            title: "Nuevo seguidor",
            message: "Alguien empezó a seguirte."
        },
        like: {
            icon: "bi-heart-fill",
            title: "Nuevo like",
            message: "Le dieron like a tu publicación."
        },
        comment: {
            icon: "bi-chat-left-text-fill",
            title: "Nuevo comentario",
            message: "Comentaron tu publicación."
        },
        achievement: {
            icon: "bi-trophy-fill",
            title: "¡Felicidades!",
            message: "Ganaste un nuevo logro."
        },
        info: {
            icon: "bi-bell-fill",
            title: "Notificación",
            message: "Tienes una nueva notificación."
        }
    };

    return configs[type] || configs.info;
}

function renderNotificaciones() {
    actualizarBadge();

    if (!list) return;

    if (!notifications.length) {
        list.innerHTML = `
            <div class="nav-notification-empty">
                <i class="bi bi-bell" aria-hidden="true"></i>
                <strong>Sin notificaciones</strong>
                <span>Aquí aparecerán tus últimas interacciones.</span>
            </div>
        `;
        return;
    }

    list.innerHTML = notifications.map(notification => {
        const config = obtenerConfigTipo(notification.type);
        const unreadClass = notification.read ? "" : "is-unread";
        const time = formatearTiempo(notification.createdAt);

        return `
            <button type="button"
                    class="nav-notification-item ${unreadClass}"
                    data-id="${escapeAttr(notification.id)}"
                    ${notification.url ? `data-url="${escapeAttr(notification.url)}"` : ""}>
                <span class="nav-notification-icon nav-notification-${escapeAttr(notification.type)}">
                    <i class="bi ${config.icon}" aria-hidden="true"></i>
                </span>

                <span class="nav-notification-content">
                    <strong>${escapeHtml(notification.title)}</strong>
                    <small>${escapeHtml(notification.message)}</small>
                    <em>${time}</em>
                </span>
            </button>
        `;
    }).join("");

    list.querySelectorAll(".nav-notification-item").forEach(item => {
        item.addEventListener("click", () => {
            const id = item.dataset.id;
            const url = item.dataset.url;

            marcarUnaComoLeida(id);

            if (url) {
                window.location.href = url;
            }
        });
    });
}

function actualizarBadge() {
    if (!badge) return;

    const unread = notifications.filter(notification => !notification.read).length;

    if (unread <= 0) {
        badge.hidden = true;
        badge.textContent = "";
        return;
    }

    badge.hidden = false;
    badge.textContent = unread > 9 ? "9+" : String(unread);
}

function marcarTodasComoLeidas() {
    let changed = false;

    notifications = notifications.map(notification => {
        if (!notification.read) {
            changed = true;
            return {
                ...notification,
                read: true
            };
        }

        return notification;
    });

    if (changed) {
        guardarNotificaciones();
        renderNotificaciones();
    }
}

function marcarUnaComoLeida(id) {
    notifications = notifications.map(notification => {
        if (notification.id === id) {
            return {
                ...notification,
                read: true
            };
        }

        return notification;
    });

    guardarNotificaciones();
    renderNotificaciones();
}

function limpiarNotificaciones(event) {
    event?.stopPropagation();

    notifications = [];
    guardarNotificaciones();
    renderNotificaciones();
}

/* ============================================================
   TOAST EMERGENTE
============================================================ */

function mostrarToast(notification) {
    if (!toastContainer) return;

    const config = obtenerConfigTipo(notification.type);

    const toast = document.createElement("div");
    toast.className = `nav-notification-toast nav-notification-toast-${notification.type}`;

    toast.innerHTML = `
        <span class="nav-notification-toast-icon">
            <i class="bi ${config.icon}" aria-hidden="true"></i>
        </span>

        <span class="nav-notification-toast-content">
            <strong>${escapeHtml(notification.title)}</strong>
            <small>${escapeHtml(notification.message)}</small>
        </span>

        <button type="button" aria-label="Cerrar notificación">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    const removeToast = () => {
        toast.classList.add("is-hiding");

        setTimeout(() => {
            toast.remove();
        }, 220);
    };

    toast.querySelector("button")?.addEventListener("click", removeToast);

    setTimeout(removeToast, 4500);
}

/* ============================================================
   STORAGE
============================================================ */

function cargarNotificaciones() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed.slice(0, MAX_NOTIFICATIONS);
    } catch (error) {
        console.error("Error cargando notificaciones:", error);
        return [];
    }
}

function guardarNotificaciones() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
}

/* ============================================================
   HELPERS
============================================================ */

function formatearTiempo(dateValue) {
    const date = new Date(dateValue);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Ahora";
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) return `Hace ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);

    return `Hace ${diffDays} d`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}