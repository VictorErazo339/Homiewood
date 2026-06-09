// Live ratings over SockJS + STOMP. Ports legacy docs/src/JS/webSocket.js to
// the npm @stomp/stompjs v7 Client API (the CDN build used the old Stomp.over).
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL =
  import.meta.env.VITE_WS_URL || "https://homiewood.onrender.com/ws";

export function crearStompClient(onCalificacion) {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: () => {},
    onConnect: () => {
      console.log("✅ WebSocket conectado");
      client.subscribe("/topic/calificaciones", (mensaje) => {
        try {
          const calificacion = JSON.parse(mensaje.body);
          console.log("🔔 Nueva calificación:", calificacion);
          if (typeof onCalificacion === "function") {
            onCalificacion(calificacion);
          }
        } catch (error) {
          console.error("Error parseando calificación WS:", error);
        }
      });
    },
    onStompError: (frame) => {
      console.log("❌ Error WebSocket:", frame);
    },
  });

  return client;
}

// React hook: subscribes to /topic/calificaciones and invokes the latest
// callback for each incoming rating. Connects on mount, disconnects on unmount.
export function useCalificacionesSocket(onCalificacion) {
  const cbRef = useRef(onCalificacion);
  cbRef.current = onCalificacion;

  useEffect(() => {
    const client = crearStompClient((calificacion) => {
      if (cbRef.current) cbRef.current(calificacion);
    });
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);
}
