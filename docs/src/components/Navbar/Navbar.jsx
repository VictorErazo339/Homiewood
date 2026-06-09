import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { buscarUsuarios } from "../../api/usuariosApi.js";
import img, { avatarPorIcono } from "../../assets/images.js";
import styles from "./Navbar.module.css";

function tiempoRelativo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

const navLinkClass = ({ isActive }) => (isActive ? styles.active : undefined);

export default function Navbar({ showSidebarToggle = false, onSidebarToggle }) {
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const isDark = theme === "dark";

  // Close the profile dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close the notifications dropdown on outside click / Escape.
  useEffect(() => {
    if (!notifOpen) return undefined;
    function onDoc(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  function toggleNotif() {
    setNotifOpen((v) => {
      const next = !v;
      if (next) markAllRead();
      return next;
    });
  }

  function irA(ruta) {
    setMenuOpen(false);
    navigate(ruta);
  }

  function cerrarSesion() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  const nombre = usuario?.username || usuario?.nombre || "Usuario";
  const usernamePerfil = usuario?.username
    ? encodeURIComponent(usuario.username)
    : "";

  const rutaMiPerfil = usernamePerfil
    ? `/profile/${usernamePerfil}`
    : "/profile";

  const rutaEditarPerfil = usernamePerfil
    ? `/profile/${usernamePerfil}?edit=1`
    : "/profile?edit=1";
  // Debounced user search while the search bar is open.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const q = query.trim();
    if (q.length < 2) {
      setResultados([]);
      setBuscando(false);
      return undefined;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await buscarUsuarios(q);
        setResultados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, searchOpen]);

  function cerrarBusqueda() {
    setSearchOpen(false);
    setQuery("");
    setResultados([]);
  }

  function irAPerfil(username) {
    if (!username) return;

    cerrarBusqueda();

    const usernameLimpio = String(username).trim();
    const esMiPerfil =
      usuario?.username &&
      usernameLimpio.toLowerCase() === usuario.username.toLowerCase();

    const ruta = esMiPerfil
      ? `/profile/${encodeURIComponent(usernameLimpio)}`
      : `/u/${encodeURIComponent(usernameLimpio)}`;

    navigate(ruta);
  }

  const mostrarResultados = searchOpen && query.trim().length >= 2;

  return (
    <nav className={styles.navbarHomi} aria-label="Navegación principal">
      <Link to="/home" className={styles.brand}>
        <img src={img.hamstersolo} alt="Homiewood" width="40" />
      </Link>

      <div className={`${styles.navLinks} d-none d-md-flex gap-4`}>
        <NavLink to="/trending" className={navLinkClass}>
          Trending
        </NavLink>
        <NavLink to="/home" className={navLinkClass}>
          Mis Homies
        </NavLink>
        <NavLink to="/cartelera" className={navLinkClass}>
          Cartelera
        </NavLink>
      </div>

      <div className={styles.navSearchWrap}>
        <button
          type="button"
          className={styles.navSearchToggle}
          aria-label="Buscar usuarios"
          aria-expanded={searchOpen}
          onClick={() => (searchOpen ? cerrarBusqueda() : setSearchOpen(true))}
        >
          <i className="bi bi-search"></i>
        </button>
        <div
          className={`${styles.navSearchBar} ${searchOpen ? styles.open : ""}`}
          aria-hidden={!searchOpen}
        >
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o @username..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className={styles.navSearchClose}
            aria-label="Cerrar búsqueda"
            onClick={cerrarBusqueda}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {mostrarResultados && (
          <div className={styles.navSearchResults} role="listbox">
            {buscando ? (
              <p className={styles.navSearchEmpty}>Buscando usuarios...</p>
            ) : resultados.length === 0 ? (
              <p className={styles.navSearchEmpty}>
                No encontramos usuarios con esa búsqueda.
              </p>
            ) : (
              resultados.map((u) => (
                <button
                  key={u.idUsuario}
                  type="button"
                  className={styles.navSearchItem}
                  onClick={() => irAPerfil(u.username)}
                >
                  <img
                    className={styles.navSearchAvatar}
                    src={avatarPorIcono(u.iconoPerfil)}
                    alt=""
                  />
                  <span className={styles.navSearchItemText}>
                    <strong>{u.nombre || "Usuario"}</strong>
                    <small>@{u.username}</small>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className={`${styles.navIcons} d-flex gap-1`}>
        <button
          type="button"
          className={styles.themeToggle}
          aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
          aria-pressed={!isDark}
          title={isDark ? "Modo claro" : "Modo oscuro"}
          onClick={toggleTheme}
        >
          <i className={isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"}></i>
        </button>
        <div className={styles.notifMenu} ref={notifRef}>
          <button
            type="button"
            aria-label="Notificaciones"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            onClick={toggleNotif}
          >
            <i className="bi bi-bell-fill"></i>
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown} role="menu">
              <div className={styles.notifHead}>
                <strong>Notificaciones</strong>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className={styles.notifClear}
                    onClick={clear}
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className={styles.notifEmpty}>Sin notificaciones todavía.</p>
              ) : (
                <ul className={styles.notifList} role="list">
                  {notifications.map((n) => (
                    <li key={n.id} className={styles.notifItem}>
                      <span className={styles.notifIcon}>{n.icono || "🔔"}</span>
                      <div className={styles.notifText}>
                        <strong>{n.titulo}</strong>
                        <span>{n.mensaje}</span>
                        <small>{tiempoRelativo(n.ts)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {showSidebarToggle && (
          <button
            type="button"
            className="d-md-none"
            aria-label="Ver recomendaciones"
            onClick={onSidebarToggle}
          >
            <i className="bi bi-list"></i>
          </button>
        )}
      </div>

      <div className={styles.profileMenu} ref={menuRef}>
        <button
          type="button"
          className={styles.profileTrigger}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.nombreUsuario}>@{nombre}</span>
          <span className={styles.avatar}>
            <img src={avatarPorIcono(usuario?.iconoPerfil)} alt="Perfil" width="30" />
          </span>
        </button>

        {menuOpen && (
          <div className={styles.profileDropdown} role="menu">
            <button
              type="button"
              role="menuitem"
              className={styles.profileOption}
              onClick={() => irA(rutaMiPerfil)}
            >
              <i className="bi bi-person-circle"></i>
              <span>Mi perfil</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.profileOption}
              onClick={() => irA(rutaEditarPerfil)}
            >
              <i className="bi bi-pencil-square"></i>
              <span>Editar perfil</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${styles.profileOption} ${styles.profileOptionDanger}`}
              onClick={cerrarSesion}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
