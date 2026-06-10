import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { useCalificacionesSocket } from "../lib/websocket.js";
import {
  listarNotificacionesUsuario,
  marcarNotificacionesLeidas,
  limpiarNotificacionesUsuario,
} from "../api/notificacionesApi.js";
import styles from "./Notifications.module.css";

const NotificationsContext = createContext(null);
const MAX = 5;

const storageKey = (id) => `homiwood_notifs_${id}`;
const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function toTimestamp(value) {
  if (!value) return Date.now();
  if (typeof value === "number") return value;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function normalizarNotificacionBackend(n) {
  return {
    id: n.idNotificacion || n.id || rid(),
    idNotificacion: n.idNotificacion || null,
    tipo: n.tipo || "INFO",
    titulo: n.titulo || "Notificación",
    mensaje: n.mensaje || "",
    icono: n.icono || "🔔",
    leido: Boolean(n.leida ?? n.leido),
    ts: toTimestamp(n.fechaCreacion || n.ts),
  };
}

// Subscribes to live ratings only while logged in (keeps the socket off the
// login screen). Calling the hook in a child lets us mount it conditionally.
function SocketFeed({ onCalificacion }) {
  useCalificacionesSocket(onCalificacion);
  return null;
}

export function NotificationsProvider({ children }) {
  const { usuario } = useAuth();
  const miId = usuario?.idUsuario || usuario?.id || null;

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const knownIdsRef = useRef(new Set());

  const persist = useCallback(
    (list) => {
      if (miId) localStorage.setItem(storageKey(miId), JSON.stringify(list.slice(0, MAX)));
    },
    [miId]
  );

  const pushToast = useCallback((notif) => {
    const toastId = rid();
    setToasts((t) => [...t, { id: toastId, ...notif }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toastId)), 4200);
  }, []);

  const cargarDesdeBackend = useCallback(
    async ({ mostrarToastsNuevos = false } = {}) => {
      if (!miId) return;

      try {
        const data = await listarNotificacionesUsuario(miId);
        const normalizadas = (Array.isArray(data) ? data : [])
          .map(normalizarNotificacionBackend)
          .slice(0, MAX);

        if (mostrarToastsNuevos) {
          for (const notif of normalizadas) {
            const key = notif.idNotificacion || notif.id;
            if (!notif.leido && key && !knownIdsRef.current.has(key)) {
              pushToast(notif);
            }
          }
        }

        knownIdsRef.current = new Set(
          normalizadas.map((n) => n.idNotificacion || n.id).filter(Boolean)
        );

        setNotifications(normalizadas);
        persist(normalizadas);
      } catch (error) {
        // Fallback local para que la app no se rompa si el backend aún no fue
        // desplegado con el nuevo módulo de notificaciones.
        try {
          const local = JSON.parse(localStorage.getItem(storageKey(miId))) || [];
          setNotifications(local);
          knownIdsRef.current = new Set(local.map((n) => n.id).filter(Boolean));
        } catch {
          setNotifications([]);
          knownIdsRef.current = new Set();
        }
      }
    },
    [miId, persist, pushToast]
  );

  // Load this user's persisted notifications and then sync with backend.
  useEffect(() => {
    if (!miId) {
      setNotifications([]);
      knownIdsRef.current = new Set();
      return;
    }

    try {
      const local = JSON.parse(localStorage.getItem(storageKey(miId))) || [];
      setNotifications(local);
      knownIdsRef.current = new Set(local.map((n) => n.idNotificacion || n.id).filter(Boolean));
    } catch {
      setNotifications([]);
      knownIdsRef.current = new Set();
    }

    cargarDesdeBackend({ mostrarToastsNuevos: false });
  }, [miId, cargarDesdeBackend]);

  // Backend notifications are persisted, but there is no notification websocket
  // yet. Polling keeps the bell updated after LogroService unlocks achievements.
  useEffect(() => {
    if (!miId) return undefined;

    const interval = setInterval(() => {
      cargarDesdeBackend({ mostrarToastsNuevos: true });
    }, 12000);

    const onFocus = () => cargarDesdeBackend({ mostrarToastsNuevos: true });
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [miId, cargarDesdeBackend]);

  const addNotification = useCallback(
    (notif) => {
      setNotifications((prev) => {
        const next = [{ id: rid(), leido: false, ts: Date.now(), ...notif }, ...prev].slice(0, MAX);
        persist(next);
        return next;
      });
      pushToast(notif);
    },
    [persist, pushToast]
  );

  // A new rating by someone else becomes a local live notification.
  const onCalificacion = useCallback(
    (c) => {
      if (!c || !miId) return;
      const autorId = c.idUsuario || c.usuarioId || c.usuario?.idUsuario;
      if (autorId && Number(autorId) === Number(miId)) return;
      const autor =
        c.username || c.nombreUsuario || c.usuario?.username || "Alguien";
      const titulo = c.tituloContenido || c.contenidoTitulo || "una película";
      addNotification({
        tipo: c.comentario ? "post" : "like",
        titulo: c.comentario ? "Nueva publicación" : "Nueva calificación",
        mensaje: `@${autor} reseñó ${titulo}`,
        icono: "🎬",
      });
    },
    [miId, addNotification]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, leido: true }));
      persist(next);
      return next;
    });

    if (miId) {
      try {
        await marcarNotificacionesLeidas(miId);
      } catch (error) {
        console.error("Error marcando notificaciones como leídas:", error);
      }
    }
  }, [miId, persist]);

  const clear = useCallback(async () => {
    setNotifications([]);
    persist([]);

    if (miId) {
      try {
        await limpiarNotificacionesUsuario(miId);
      } catch (error) {
        console.error("Error limpiando notificaciones:", error);
      }
    }
  }, [miId, persist]);

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clear,
    refreshNotifications: cargarDesdeBackend,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {miId && <SocketFeed onCalificacion={onCalificacion} />}
      {children}
      <div className={styles.toastContainer} aria-live="assertive" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={styles.toast} role="status">
            <span className={styles.toastIcon}>{t.icono || "🔔"}</span>
            <div className={styles.toastBody}>
              <strong>{t.titulo}</strong>
              <span>{t.mensaje}</span>
            </div>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }
  return ctx;
}
