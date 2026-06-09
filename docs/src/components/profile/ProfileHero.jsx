import { avatarPorIcono } from "../../assets/images.js";
import { iconoTag } from "../../lib/contenido.js";
import styles from "./ProfileHero.module.css";

function descripcionPerfil(perfil) {
  const d = perfil?.descripcion;
  if (d && String(d).trim().length > 0) return d;
  return "Cinéfilo 🎥 Aún sin descripción.";
}

/**
 * Reusable profile hero card: avatar, identity, an `actions` slot (edit/follow),
 * centered stats, and the "Géneros favoritos" + "Logros" blocks.
 *
 * Props:
 *  - perfil:       user object (nombre, username, descripcion, iconoPerfil)
 *  - stats:        { posts, seguidores, siguiendo }
 *  - bioTags:      string[]   (favourite genres)
 *  - headerLogros: logro[]    (featured, unlocked achievements)
 *  - actions:      ReactNode  (edit and/or follow buttons)
 *  - onVerLogros:  () => void (optional — shows the "Ver todos" button)
 */
export default function ProfileHero({
  perfil,
  stats,
  bioTags = [],
  headerLogros = [],
  actions = null,
  onVerLogros = null,
}) {
  const username = perfil?.username || "usuario";
  const nombre = perfil?.nombre || username;

  return (
    <section className={styles.profileHeader} aria-label="Información del perfil">
      <div className={styles.heroCard}>
        <div className={styles.mainRow}>
          <div className={styles.identity}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarCircle}>
                <img
                  className={styles.avatarImg}
                  src={avatarPorIcono(perfil?.iconoPerfil)}
                  alt={`Avatar de ${username}`}
                />
              </div>
              <div className={styles.avatarBadge} aria-hidden="true">
                🎬
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.topRow}>
                <div className={styles.nameBlock}>
                  <h1 className={styles.name}>{nombre}</h1>
                  <p className={styles.username}>@{username}</p>
                  <p className={styles.bio}>{descripcionPerfil(perfil)}</p>
                </div>
                {actions && <div className={styles.actions}>{actions}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.dividerLine} />

        <div
          className={`${styles.stats} ${styles.statsCentered}`}
          role="list"
          aria-label="Estadísticas del perfil"
        >
          <div className={styles.statItem} role="listitem">
            <span className={styles.statNumber}>{stats?.posts ?? 0}</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem} role="listitem">
            <span className={styles.statNumber}>{stats?.seguidores ?? 0}</span>
            <span className={styles.statLabel}>Homies</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem} role="listitem">
            <span className={styles.statNumber}>{stats?.siguiendo ?? 0}</span>
            <span className={styles.statLabel}>Siguiendo</span>
          </div>
        </div>

        <div className={`${styles.dividerLine} ${styles.dividerSoft}`} />

        <div className={styles.extraSections}>
          <div className={styles.sectionBlock}>
            <p className={styles.blockLabel}>Géneros favoritos</p>
            <ul className={styles.bioTags} role="list">
              {bioTags.length === 0 ? (
                <li>
                  <span className={styles.bioTag}>🎬 Sin preferencias aún</span>
                </li>
              ) : (
                bioTags.map((tag) => (
                  <li key={tag}>
                    <span className={styles.bioTag}>
                      {iconoTag(tag)} {tag}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <p className={styles.blockLabel}>Logros</p>
            <div className={styles.achievements}>
              {headerLogros.length === 0 ? (
                <div className={`${styles.achievementItem} ${styles.achievementEmpty}`}>
                  <span className={styles.achIcon} aria-hidden="true">
                    🏅
                  </span>
                  <span className={styles.achName}>Sin logros destacados</span>
                </div>
              ) : (
                headerLogros.map((l) => (
                  <div key={l.idLogro} className={styles.achievementItem}>
                    <span className={styles.achIcon} aria-hidden="true">
                      {l.icono || "🏅"}
                    </span>
                    <span className={styles.achName}>{l.nombre}</span>
                  </div>
                ))
              )}
              {onVerLogros && (
                <button
                  className={styles.verTodosBtn}
                  type="button"
                  onClick={onVerLogros}
                >
                  🏅 Ver todos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
