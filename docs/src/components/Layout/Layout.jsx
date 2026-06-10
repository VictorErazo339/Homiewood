import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { LayoutContext } from "./LayoutContext.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { obtenerProfileTheme, prefsDesdeUsuario } from "../../lib/profileTheme.js";

// Tema global del usuario logueado:
// Navbar, comentarios y vistas generales heredan estas variables.
// El perfil visitado puede sobreescribirlas solo dentro de su propio contenedor.
export default function Layout() {
  const { usuario } = useAuth();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  const viewerPrefs = prefsDesdeUsuario(usuario);
  const viewerTheme = useMemo(
    () => obtenerProfileTheme(viewerPrefs.colorTheme, theme),
    [viewerPrefs.colorTheme, theme]
  );

  const value = { sidebarOpen, setSidebarOpen, hasSidebar, setHasSidebar };

  return (
    <LayoutContext.Provider value={value}>
      <div
        className="app-theme-shell"
        style={viewerTheme.vars}
        data-viewer-color-theme={viewerPrefs.colorTheme}
      >
        <Navbar
          showSidebarToggle={hasSidebar}
          onSidebarToggle={() => setSidebarOpen(true)}
        />
        <Outlet />
        <BottomNav />
      </div>
    </LayoutContext.Provider>
  );
}
