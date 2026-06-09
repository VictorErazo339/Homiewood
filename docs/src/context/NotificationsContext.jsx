import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { useCalificacionesSocket } from "../lib/websocket.js";
import styles from "./Notifications.module.css";

const NotificationsContext = createContext(null);
const MAX = 5;

const storageKey = (id) => `homiwood_notifs_${id}`;
const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

  // Load this user's persisted notifications.
  useEffect(() => {
    if (!miId) {
      setNotifications([]);
      return;
    }
    try {
      setNotifications(JSON.parse(localStorage.getItem(storageKey(miId))) || []);
    } catch {
      setNotifications([]);
    }
  }, [miId]);

  const persist = useCallback(
    (list) => {
      if (miId) localStorage.setItem(storageKey(miId), JSON.stringify(list.slice(0, MAX)));
    },
    [miId]
  );

  const addNotification = useCallback(
    (notif) => {
      setNotifications((prev) => {
        const next = [{ id: rid(), leido: false, ts: Date.now(), ...notif }, ...prev].slice(0, MAX);
        persist(next);
        return next;
      });
      const toastId = rid();
      setToasts((t) => [...t, { id: toastId, ...notif }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toastId)), 4200);
    },
    [persist]
  );

  // A new rating by someone else becomes a notification.
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

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, leido: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const clear = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, [persist]);

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const value = { notifications, unreadCount, addNotification, markAllRead, clear };

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
