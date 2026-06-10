import styles from "./ProfileHero.module.css";

// Fondo del perfil v3:
// - una capa borrosa cubre toda la pantalla para no dejar bordes vacíos;
// - una imagen real, ancha y alta, queda detrás del contenido y se mueve con el scroll;
//   así se puede ver la parte superior al inicio y la parte inferior al bajar.
export default function ProfileBanner({ posterUrl }) {
  const backgroundStyle = posterUrl
    ? { backgroundImage: `url("${posterUrl}")` }
    : undefined;

  return (
    <>
      {posterUrl && (
        <div className={styles.pageBackdrop} aria-hidden="true">
          <div className={styles.backdropFill} style={backgroundStyle} />

          <img
            className={styles.backdropPosterFull}
            src={posterUrl}
            alt=""
            loading="eager"
            decoding="async"
            draggable="false"
          />

          <div className={styles.backdropShade} />
        </div>
      )}

      <div className={styles.banner} aria-hidden="true" />
    </>
  );
}
