import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import BottomNav from "../BottomNav/BottomNav.jsx";
import { LayoutContext } from "./LayoutContext.js";

// Wraps every protected page with the shared navbar + bottom nav so the
// duplicated chrome from the legacy pages lives in one place.
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  const value = { sidebarOpen, setSidebarOpen, hasSidebar, setHasSidebar };

  return (
    <LayoutContext.Provider value={value}>
      <Navbar
        showSidebarToggle={hasSidebar}
        onSidebarToggle={() => setSidebarOpen(true)}
      />
      <Outlet />
      <BottomNav />
    </LayoutContext.Provider>
  );
}
