import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./ProfileHero.module.css";

export default function ProfileTabs({ active }) {
  const { usuario } = useAuth();
  const username = usuario?.username ? encodeURIComponent(usuario.username) : "";

  const profilePath = username ? `/profile/${username}` : "/profile";
  const vistasPath = username ? `/profile/${username}/vistas` : "/vistas";
  const porVerPath = username ? `/profile/${username}/porver` : "/porver";

  const tabs = [
    { key: "hilo", label: "Hilo", to: profilePath },
    { key: "vistas", label: "Vistas", to: vistasPath },
    { key: "porver", label: "Por ver", to: porVerPath },
  ];

  return (
    <nav className={styles.tabs} aria-label="Secciones del perfil">
      {tabs.map((t) => (
        <Link
          key={t.key}
          to={t.to}
          className={`${styles.tab} ${active === t.key ? styles.tabActive : ""}`}
          aria-current={active === t.key ? "page" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
