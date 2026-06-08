const NAV_LINKS = [
    {
        label: "Trending",
        href: "./trending.html",
        match: "trending.html"
    },
    {
        label: "Mis Homies",
        href: "./home.html",
        match: "home.html"
    },
    {
        label: "Cartelera",
        href: "./cartelera.html",
        match: "cartelera.html"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    inicializarDropdownNavbar();
    abrirModalEditarPerfilSiVienePorURL();
});

function renderNavbar() {
    const root = document.getElementById("navbar-root");

    if (!root) return;

    limpiarNavbarDuplicada();

    const usuario = obtenerUsuarioLogueado();
    const username = obtenerUsername(usuario);
    const avatar = obtenerAvatar(usuario);

    root.innerHTML = `
    <nav class="navbar-homi" aria-label="Navegación principal">
      <a href="./home.html" class="brand" aria-label="Ir a inicio">
        <img src="../img/hamstersolo.webp" alt="Homiewood" class="brand-logo">
      </a>

      <ul class="nav-links" role="list">
        ${NAV_LINKS.map(link => crearNavLink(link)).join("")}
      </ul>

      <div class="nav-icons">
        <button type="button" aria-label="Buscar" data-navbar-search-btn>
          <i class="bi bi-search" aria-hidden="true"></i>
        </button>

        <button type="button" aria-label="Notificaciones">
          <i class="bi bi-bell-fill" aria-hidden="true"></i>
        </button>

        <div class="nav-profile-menu" id="navProfileMenu">
          <button
            type="button"
            class="nav-profile-trigger"
            id="navProfileTrigger"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span class="nav-profile-username" id="navProfileUsername">@${escapeHtml(username)}</span>

            <img
              id="navProfileAvatar"
              class="nav-profile-avatar"
              src="${avatar}"
              alt="Avatar de ${escapeHtml(username)}"
              onerror="this.src='../img/1.webp'"
            >
          </button>

          <div class="nav-profile-dropdown" id="navProfileDropdown">
            <button type="button" class="nav-profile-option" id="navGoProfileBtn">
              <i class="bi bi-person-circle"></i>
              <span>Mi perfil</span>
            </button>

            <button type="button" class="nav-profile-option" id="navEditProfileBtn">
              <i class="bi bi-pencil-square"></i>
              <span>Editar perfil</span>
            </button>

            <button type="button" class="nav-profile-option nav-profile-option-danger" id="navLogoutBtn">
              <i class="bi bi-box-arrow-right"></i>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}

function crearNavLink(link) {
    const pathname = window.location.pathname.toLowerCase();
    const activo = pathname.includes(link.match);

    return `
    <li>
      <a href="${link.href}" class="${activo ? "nav-link-active" : ""}">
        ${link.label}
      </a>
    </li>
  `;
}

function inicializarDropdownNavbar() {
    const menu = document.getElementById("navProfileMenu");
    const trigger = document.getElementById("navProfileTrigger");
    const dropdown = document.getElementById("navProfileDropdown");
    const profileBtn = document.getElementById("navGoProfileBtn");
    const editBtn = document.getElementById("navEditProfileBtn");
    const logoutBtn = document.getElementById("navLogoutBtn");

    if (!menu || !trigger || !dropdown) return;

    trigger.addEventListener("click", (event) => {
        event.stopPropagation();

        const abierto = menu.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    dropdown.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        cerrarDropdown(menu, trigger);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            cerrarDropdown(menu, trigger);
        }
    });

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            cerrarDropdown(menu, trigger);
            irAMiPerfil();
        });
    }

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            cerrarDropdown(menu, trigger);
            abrirEditarPerfil();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", cerrarSesion);
    }
}

function cerrarDropdown(menu, trigger) {
    menu.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
}

function irAMiPerfil() {
    const usuario = obtenerUsuarioLogueado();
    const username = obtenerUsername(usuario);

    window.location.href = `./profile.html?username=${encodeURIComponent(username)}`;
}

function abrirEditarPerfil() {
    const usuario = obtenerUsuarioLogueado();
    const usernameLogueado = obtenerUsername(usuario);

    const params = new URLSearchParams(window.location.search);
    const usernameUrl = params.get("username");

    const estoyEnPerfilDeOtro =
        usernameUrl &&
        normalizarUsername(usernameUrl) !== normalizarUsername(usernameLogueado);

    if (estoyEnPerfilDeOtro) {
        window.location.href = `./profile.html?username=${encodeURIComponent(usernameLogueado)}&edit=1`;
        return;
    }

    const modalElement = document.getElementById("editProfileModal");

    if (modalElement && window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
        return;
    }

    const botonEditar =
        document.querySelector(".js-edit-profile-btn") ||
        document.getElementById("btnEditarPerfil") ||
        document.getElementById("editProfileBtn");

    if (botonEditar) {
        botonEditar.click();
        return;
    }

    window.location.href = `./profile.html?username=${encodeURIComponent(usernameLogueado)}&edit=1`;
}

function abrirModalEditarPerfilSiVienePorURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("edit") !== "1") return;

    setTimeout(() => {
        abrirEditarPerfil();

        params.delete("edit");

        const query = params.toString();
        const nuevaURL = query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;

        window.history.replaceState({}, "", nuevaURL);
    }, 300);
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioLogueado");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("idUsuario");

    sessionStorage.clear();

    window.location.href = "./login.html";
}

function obtenerUsuarioLogueado() {
    const keys = [
        "usuario",
        "usuarioLogueado",
        "user",
        "currentUser"
    ];

    for (const key of keys) {
        const raw = localStorage.getItem(key) || sessionStorage.getItem(key);

        if (!raw) continue;

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`No se pudo leer ${key}`, error);
        }
    }

    return null;
}

function obtenerUsername(usuario) {
    if (!usuario) return "usuario";

    return (
        usuario.username ||
        usuario.nombreUsuario ||
        usuario.nombre ||
        "usuario"
    );
}

function obtenerAvatar(usuario) {
    if (!usuario) return "../img/1.webp";

    if (usuario.fotoPerfilUrl) return usuario.fotoPerfilUrl;
    if (usuario.foto_perfil_url) return usuario.foto_perfil_url;
    if (usuario.avatarUrl) return usuario.avatarUrl;
    if (usuario.imagenPerfil) return usuario.imagenPerfil;

    const icono = Number(usuario.iconoPerfil || usuario.icono || 1);

    if (Number.isFinite(icono) && icono > 0) {
        return `../img/${icono}.webp`;
    }

    return "../img/1.webp";
}

function limpiarNavbarDuplicada() {
    document.querySelectorAll("#navbarUserLink, .navbar-user-link").forEach(element => {
        element.remove();
    });
}

function normalizarUsername(username) {
    return String(username || "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}