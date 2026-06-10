// Live ratings over SockJS + STOMP. Ports legacy docs/src/JS/webSocket.js to
// the npm @stomp/stompjs v7 Client API (the CDN build used the old Stomp.over).
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Must point at the SAME backend instance as the REST API: the STOMP broker
// is in-memory per instance, so events posted to one host never reach
// subscribers on another. Mirrors the localhost logic in api.js.
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080/ws"
    : "https://homiewood-p3p5.onrender.com/ws");

function crearCliente() {
  return new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (str) => console.log(str),
    onStompError: (frame) => {
      console.log("❌ Error WebSocket:", frame);
    },
  });
}

// React hook: subscribes to /topic/calificaciones and invokes the latest
// callback for each incoming rating. Connects on mount, disconnects on unmount.
export function useCalificacionesSocket(onCalificacion) {
  const cbRef = useRef(onCalificacion);
  cbRef.current = onCalificacion;

  useEffect(() => {
    const client = crearCliente();
    client.onConnect = () => {
      console.log("✅ WebSocket conectado");
      client.subscribe("/topic/calificaciones", (mensaje) => {
        try {
          const calificacion = JSON.parse(mensaje.body);
          console.log("🔔 Nueva calificación:", calificacion);
          if (cbRef.current) cbRef.current(calificacion);
        } catch (error) {
          console.error("Error parseando calificación WS:", error);
        }
      });
    };
    client.activate();
    return () => client.deactivate();
  }, []);
}

// React hook: subscribes to /topic/comentarios/{idCalificacion} and invokes
// the latest callback for each incoming comment.
export function useComentariosSocket(idCalificacion, onComentario) {
  const cbRef = useRef(onComentario);
  cbRef.current = onComentario;

  useEffect(() => {
    if (!idCalificacion) return;

    const delay = Math.random() * 2000;
    let client;

    const timer = setTimeout(() => {
      client = crearCliente();
      client.onConnect = () => {
        client.subscribe(`/topic/comentarios/${idCalificacion}`, (mensaje) => {
          try {
            const comentario = JSON.parse(mensaje.body);
            if (cbRef.current) cbRef.current(comentario);
          } catch (error) {
            console.error("Error parseando comentario WS:", error);
          }
        });
      };
      client.activate();
    }, delay);

    return () => {
      clearTimeout(timer);
      client?.deactivate();
    };
  }, [idCalificacion]);
}
