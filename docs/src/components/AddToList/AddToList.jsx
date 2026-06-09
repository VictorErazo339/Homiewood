import { useEffect, useRef, useState } from "react";
import styles from "./AddToList.module.css";

// "Add to list" pill + dropdown used on post cards and in the film modal.
// Mirrors the legacy behavior: a local visual toggle (not persisted to the
// backend), closing when clicking outside.
export default function AddToList({
  options,
  showBadges = false,
  wrapClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  function toggleOption(key) {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div
      className={`${styles.addToListWrap} ${wrapClassName}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className={`${styles.addToListBtn} ${open ? styles.open : ""}`}
        aria-expanded={open}
        aria-label="Agregar a lista"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <i className="bi bi-plus-lg"></i>
      </button>

      <div
        className={`${styles.addToListDropdown} ${open ? styles.open : ""}`}
        aria-hidden={!open}
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`${styles.listOption} ${
              selected[opt.key] ? styles.inList : ""
            }`}
            onClick={() => toggleOption(opt.key)}
          >
            <img src={opt.img} width="40" alt={opt.label} />
            <span>{opt.label}</span>
            <i
              className={`bi bi-check2 ${styles.listCheck} ${
                selected[opt.key] ? styles.visible : ""
              }`}
            ></i>
          </button>
        ))}
      </div>

      {showBadges && <div className={styles.listBadges}></div>}
    </div>
  );
}
