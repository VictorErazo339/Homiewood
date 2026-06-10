import { useLocation, useNavigate } from "react-router-dom";
import img, { avatarPorUsuario } from "../../assets/images.js";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario } = useAuth();

  const usernamePerfil = usuario?.username
    ? encodeURIComponent(usuario.username)
    : "";

  const rutaMiPerfil = usernamePerfil
    ? `/profile/${usernamePerfil}`
    : "/profile";

  const avatarPerfilSrc = avatarPorUsuario(usuario);

  const items = [
    {
      to: "/trending",
      label: "Trending",
      src: img.trending,
      w: 50,
      alt: "Trending",
      active: pathname === "/trending",
    },
    {
      to: "/home",
      label: "Mis Homies",
      src: img.myhomies,
      w: 70,
      alt: "Mis Homies",
      active: pathname === "/home",
    },
    {
      to: "/cartelera",
      label: "Estrenos",
      src: img.clapperboard,
      w: 40,
      alt: "Estrenos",
      active: pathname === "/cartelera",
    },
    {
      to: rutaMiPerfil,
      label: "Perfil",
      src: avatarPerfilSrc || img.homeProfileicon,
      w: 40,
      alt: "Perfil",
      isAvatar: true,
      active: pathname === "/profile" || pathname.startsWith("/profile/") || pathname.startsWith("/u/"),
    },
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Navegación móvil">
      <div className={styles.inner}>
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            className={`${styles.bottomNavBtn} ${
              it.active ? styles.active : ""
            }`}
            onClick={() => navigate(it.to)}
          >
            <span className={it.isAvatar ? styles.profileNavAvatar : undefined}>
              <img src={it.src} alt={it.alt} width={it.w} />
            </span>

            <span className={styles.bottomNavLabel}>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}