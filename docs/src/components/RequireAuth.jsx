import { Navigate, Outlet, useLocation } from "react-router-dom";
import { obtenerToken } from "../lib/auth.js";

// Mirrors the legacy guard: no token -> bounce to /login.
export default function RequireAuth() {
  const token = obtenerToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
