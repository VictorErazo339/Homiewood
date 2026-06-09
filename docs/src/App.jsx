import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import Layout from "./components/Layout/Layout.jsx";
import { obtenerToken } from "./lib/auth.js";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login/Login.jsx";
import Home from "./pages/Home/Home.jsx";
import Trending from "./pages/Trending/Trending.jsx";
import Cartelera from "./pages/Cartelera/Cartelera.jsx";
import Recommendations from "./pages/Recommendations/Recommendations.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx";
import Vistas from "./pages/Vistas/Vistas.jsx";
import PorVer from "./pages/PorVer/PorVer.jsx";

function ProfileSectionRedirect({ section }) {
  const { usuario } = useAuth();
  const username = usuario?.username ? encodeURIComponent(usuario.username) : null;

  if (!username) return <Navigate to="/profile" replace />;

  return <Navigate to={`/profile/${username}/${section}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={obtenerToken() ? "/home" : "/login"} replace />}
      />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/cartelera" element={<Cartelera />} />
          <Route path="/recommendations" element={<Recommendations />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/:username/vistas" element={<Vistas />} />
          <Route path="/profile/:username/porver" element={<PorVer />} />

          <Route path="/u/:username" element={<UserProfile />} />

          <Route path="/vistas" element={<ProfileSectionRedirect section="vistas" />} />
          <Route path="/porver" element={<ProfileSectionRedirect section="porver" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
