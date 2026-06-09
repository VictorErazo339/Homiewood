import { useEffect } from "react";
import styles from "./Modal.module.css";

// React-state modal that replaces the legacy Bootstrap-JS modals. Exposes the
// shared modal/control class names (via the imported stylesheet) so callers can
// style buttons/inputs consistently with `import mstyles from Modal.module.css`.
export default function Modal({ open, onClose, size, labelledBy, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`${styles.modalDialog} ${size === "lg" ? styles.lg : ""}`}>
        <div
          className={styles.modalBox}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
