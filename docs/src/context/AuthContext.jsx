import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  obtenerToken,
  eliminarToken,
  guardarToken,
  obtenerUsuario,
  guardarUsuario,
  eliminarUsuario,
} from "../lib/auth.js";
import { obtenerUsuarioAutenticado } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerUsuario());
  const [cargando, setCargando] = useState(true);

  // On first load, mirror legacy cargarUsuarioLogueado: trust a cached usuario,
  // otherwise resolve it from /auth/me; on failure, clear the session.
  useEffect(() => {
    const token = obtenerToken();

    if (!token || usuario) {
      setCargando(false);
      return;
    }

    let activo = true;

    obtenerUsuarioAutenticado()
      .then((u) => {
        if (!activo) return;
        guardarUsuario(u);
        setUsuario(u);
      })
      .catch(() => {
        if (!activo) return;
        eliminarToken();
        eliminarUsuario();
        setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((token, usuarioData) => {
    if (token) guardarToken(token);
    if (usuarioData) {
      guardarUsuario(usuarioData);
      setUsuario(usuarioData);
    }
  }, []);

  const logout = useCallback(() => {
    eliminarToken();
    eliminarUsuario();
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((u) => {
    guardarUsuario(u);
    setUsuario(u);
  }, []);

  const value = { usuario, cargando, login, logout, actualizarUsuario };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
