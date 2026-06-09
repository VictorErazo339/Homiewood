import styles from "./ProfileHero.module.css";

// Profile-family top area: a fixed, blurred backdrop built from the user's #1
// Top 5 poster (pinned below the navbar, behind all cards) plus a transparent
// spacer that reserves the banner height so the hero card can overlap it.
export default function ProfileBanner({ posterUrl }) {
  return (
    <>
      {posterUrl && (
        <div
          className={styles.pageBackdrop}
          style={{ backgroundImage: `url('${posterUrl}')` }}
          aria-hidden="true"
        />
      )}
      <div className={styles.banner} aria-hidden="true" />
    </>
  );
}
