import { useEffect, useState } from "react";
import { actualizarLogrosDestacados } from "../../api/usuariosApi.js";
import Modal from "../Modal/Modal.jsx";
import mstyles from "../Modal/Modal.module.css";
import styles from "../../pages/Profile/Profile.module.css";

const MAX_DESTACADOS = 3;

// Locked achievements are grouped by difficulty, in this order.
const DIFICULTADES = [
  { key: "FACIL", label: "Fáciles por desbloquear" },
  { key: "MEDIO", label: "Medios por desbloquear" },
  { key: "DIFICIL", label: "Difíciles por desbloquear" },
];

function norm(d) {
  return String(d || "").toUpperCase();
}

function progreso(l) {
  if (!l.valorObjetivo) return null;
  return `Progreso: ${l.progresoActual ?? 0}/${l.valorObjetivo}`;
}

/**
 * Achievements modal (own profile). Lists unlocked achievements with a
 * "destacar" star (max 3, persisted via PUT), locked ones grouped by
 * difficulty, and hidden ones. `editable` enables the destacar selector.
 */
export default function AchievementsModal({
  open,
  onClose,
  idUsuario,
  logros = [],
  editable = false,
  onDestacadosChange,
}) {
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    setDestacados(logros.filter((l) => l.destacado).map((l) => l.idLogro));
  }, [logros]);

  const obtenidos = logros.filter((l) => l.desbloqueado);
  const ocultos = logros.filter((l) => l.oculto && !l.desbloqueado);
  const bloqueados = logros.filter((l) => !l.desbloqueado && !l.oculto);

  async function toggleDestacado(idLogro) {
    let next;
    if (destacados.includes(idLogro)) {
      next = destacados.filter((x) => x !== idLogro);
    } else {
      if (destacados.length >= MAX_DESTACADOS) {
        alert(`Solo puedes destacar ${MAX_DESTACADOS} logros.`);
        return;
      }
      next = [...destacados, idLogro];
    }
    setDestacados(next);
    try {
      await actualizarLogrosDestacados(idUsuario, next);
      onDestacadosChange?.(next);
    } catch (error) {
      console.error("Error guardando destacados:", error);
    }
  }

  function renderObtenido(l) {
    const esDestacado = destacados.includes(l.idLogro);
    return (
      <li key={l.idLogro} className={`${styles.achModalCard} ${styles.isUnlocked}`}>
        <span className={styles.achModalIcon} aria-hidden="true">
          {l.icono || "🏅"}
        </span>
        <div className={styles.achModalInfo}>
          <strong>{l.nombre}</strong>
          <small>{l.descripcion}</small>
        </div>
        {editable ? (
          <button
            type="button"
            className={`${styles.achDestacarBtn} ${esDestacado ? styles.isDestacado : ""}`}
            title={esDestacado ? "Quitar de destacados" : "Destacar en mi perfil"}
            aria-pressed={esDestacado}
            onClick={() => toggleDestacado(l.idLogro)}
          >
            {esDestacado ? "★" : "☆"}
          </button>
        ) : (
          <span className={styles.achModalBadge}>✓</span>
        )}
      </li>
    );
  }

  function renderBloqueado(l) {
    return (
      <li key={l.idLogro} className={`${styles.achModalCard} ${styles.isLocked}`}>
        <span className={styles.achModalIcon} aria-hidden="true">
          {l.icono || "🏅"}
        </span>
        <div className={styles.achModalInfo}>
          <strong>{l.nombre}</strong>
          <small>{l.descripcion}</small>
          {progreso(l) && <small>{progreso(l)}</small>}
        </div>
        <span className={styles.achModalLock}>🔒</span>
      </li>
    );
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" labelledBy="achModalLabel">
      <div className={styles.achModalHeader}>
        <h3 className={mstyles.modalTitle} id="achModalLabel">
          🏆 Mis logros
        </h3>
        {editable && (
          <span className={styles.achSelectedCounter}>
            {destacados.length}/{MAX_DESTACADOS} destacados
          </span>
        )}
      </div>
      {editable && (
        <p className={styles.achModalHelp}>
          Destaca hasta {MAX_DESTACADOS} logros desbloqueados para mostrarlos en tu perfil.
        </p>
      )}

      <p className={styles.achModalSectionLabel}>Obtenidos</p>
      <ul className={styles.achModalGrid} role="list">
        {obtenidos.length === 0 ? (
          <li className={styles.achModalCard}>
            <div className={styles.achModalInfo}>
              <small>Aún no has desbloqueado logros.</small>
            </div>
          </li>
        ) : (
          obtenidos.map(renderObtenido)
        )}
      </ul>

      {DIFICULTADES.map(({ key, label }) => {
        const grupo = bloqueados.filter((l) => norm(l.dificultad) === key);
        if (grupo.length === 0) return null;
        return (
          <div key={key}>
            <p className={styles.achModalSectionLabel}>{label}</p>
            <ul className={styles.achModalGrid} role="list">
              {grupo.map(renderBloqueado)}
            </ul>
          </div>
        );
      })}

      {/* Locked achievements whose difficulty doesn't match a known bucket */}
      {(() => {
        const otros = bloqueados.filter(
          (l) => !DIFICULTADES.some((d) => d.key === norm(l.dificultad))
        );
        if (otros.length === 0) return null;
        return (
          <div>
            <p className={styles.achModalSectionLabel}>Por desbloquear</p>
            <ul className={styles.achModalGrid} role="list">
              {otros.map(renderBloqueado)}
            </ul>
          </div>
        );
      })()}

      {ocultos.length > 0 && (
        <>
          <p className={styles.achModalSectionLabel}>Ocultos</p>
          <ul className={styles.achModalGrid} role="list">
            {ocultos.map((l) => (
              <li
                key={l.idLogro}
                className={`${styles.achModalCard} ${styles.isLocked} ${styles.isHidden}`}
              >
                <span className={styles.achModalIcon} aria-hidden="true">
                  ❓
                </span>
                <div className={styles.achModalInfo}>
                  <strong>Logro secreto</strong>
                  <small>Sigue usando Homiewood para descubrirlo.</small>
                </div>
                <span className={styles.achModalLock}>🔒</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={mstyles.modalActions}>
        <button type="button" className={mstyles.btnCancel} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
