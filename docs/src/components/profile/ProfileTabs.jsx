import { Link } from "react-router-dom";
import styles from "./ProfileHero.module.css";

const TABS = [
  { key: "hilo", label: "Hilo", to: "/profile" },
  { key: "vistas", label: "Vistas", to: "/vistas" },
  { key: "porver", label: "Por ver", to: "/porver" },
];

// Hilo / Vistas / Por ver tabs. `active` is the key of the current tab.
export default function ProfileTabs({ active }) {
  return (
    <nav className={styles.tabs} aria-label="Secciones del perfil">
      {TABS.map((t) => (
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
