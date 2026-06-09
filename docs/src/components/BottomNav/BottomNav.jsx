import { useLocation, useNavigate } from "react-router-dom";
import img from "../../assets/images.js";
import styles from "./BottomNav.module.css";

const items = [
  { to: "/trending", label: "Trending", src: img.trending, w: 50, alt: "Trending" },
  { to: "/home", label: "Mis Homies", src: img.myhomies, w: 70, alt: "Mis Homies" },
  { to: "/cartelera", label: "Estrenos", src: img.clapperboard, w: 40, alt: "Estrenos" },
  { to: "/profile", label: "Perfil", src: img.homeProfileicon, w: 40, alt: "Perfil" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className={styles.bottomNav} aria-label="Navegación móvil">
      <div className={styles.inner}>
        {items.map((it) => (
          <button
            key={it.to}
            type="button"
            className={`${styles.bottomNavBtn} ${
              pathname === it.to ? styles.active : ""
            }`}
            onClick={() => navigate(it.to)}
          >
            <span>
              <img src={it.src} alt={it.alt} width={it.w} />
            </span>
            <span className={styles.bottomNavLabel}>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
