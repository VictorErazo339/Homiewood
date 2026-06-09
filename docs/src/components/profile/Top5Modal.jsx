import { useEffect, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import { normalizarContenidoApi, convertirTipoBackend } from "../../lib/contenido.js";
import Modal from "../Modal/Modal.jsx";
import mstyles from "../Modal/Modal.module.css";
import styles from "../../pages/Profile/Profile.module.css";

/**
 * Shared Top 5 editor modal (used by Profile, Vistas and PorVer chrome).
 * Pick a position from the draft strip, search a title, and save — or empty
 * an occupied position. `top5` items carry their list IDs so "vaciar" works.
 */
export default function Top5Modal({ open, onClose, idUsuario, top5, onSaved }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pos, setPos] = useState(null);
  const [saving, setSaving] = useState(false);

  // Reset transient state whenever the modal closes.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      setSelected(null);
      setPos(null);
    }
  }, [open]);

  // Debounced catalogue search.
  useEffect(() => {
    if (!open) return undefined;
    const q = query.trim();
    if (q.length < 2) {
      setResults("short");
      return undefined;
    }
    setResults("loading");
    const t = setTimeout(async () => {
      try {
        const data = await buscarCatalogo(q);
        setResults(data && data.length ? data.map(normalizarContenidoApi) : []);
      } catch (error) {
        console.error("Error buscando catálogo:", error);
        setResults("error");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [query, open]);

  async function guardar() {
    if (!selected) {
      alert("Primero elige una película o serie.");
      return;
    }
    if (pos === null) {
      alert("Elige una posición del 1 al 5.");
      return;
    }
    setSaving(true);
    try {
      const item = selected;
      await apiRequest(`/usuarios/${idUsuario}/listas/top5/contenidos/externo`, {
        method: "POST",
        body: JSON.stringify({
          proveedor: item.proveedor,
          apiId: String(item.apiId),
          titulo: item.titulo,
          tipoContenido: item.tipoBackend || convertirTipoBackend(item.tipoVisual),
          descripcion: item.descripcion || "",
          fechaEstreno: item.fechaEstreno || null,
          anioEstreno: item.anioEstreno || null,
          posterUrl: item.posterUrl || "",
          idiomaOriginal: item.idioma || "",
          puntajeExterno: item.puntajeExterno || 0,
          posicion: pos + 1,
          estado: "FAVORITO",
          generos: item.generos || [],
        }),
      });
      await onSaved?.();
      onClose?.();
    } catch (error) {
      console.error("Error guardando Top 5:", error);
      alert("No se pudo guardar en Top 5.");
    } finally {
      setSaving(false);
    }
  }

  async function vaciarPosicion() {
    if (pos === null) return;
    const item = top5[pos];
    if (!item) return;
    if (!confirm(`¿Vaciar la posición #${pos + 1} (${item.titulo})?`)) return;
    setSaving(true);
    try {
      if (item.idListaContenido) {
        await apiRequest(`/listas/contenidos/${item.idListaContenido}`, {
          method: "DELETE",
        });
      } else if (item.idLista && item.idContenido) {
        await apiRequest(`/listas/${item.idLista}/contenidos/${item.idContenido}`, {
          method: "DELETE",
        });
      }
      await onSaved?.();
      setPos(null);
    } catch (error) {
      console.error("Error vaciando posición:", error);
      alert("No se pudo vaciar la posición.");
    } finally {
      setSaving(false);
    }
  }

  const posOcupada = pos !== null && !!top5[pos];

  return (
    <Modal open={open} onClose={onClose} size="lg" labelledBy="top5ModalLabel">
      <h3 className={mstyles.modalTitle} id="top5ModalLabel">
        Editar mi Top 5
      </h3>
      <p className={styles.top5ModalSubtitle}>
        Elige una posición, busca una película o serie y arma tu ranking.
      </p>

      <div className={styles.top5DraftSlots} role="radiogroup" aria-label="Posiciones del Top 5">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            className={`${styles.top5DraftSlot} ${pos === i ? styles.isSelected : ""}`}
            aria-pressed={pos === i}
            onClick={() => setPos(i)}
          >
            <span className={styles.top5DraftRank}>#{i + 1}</span>
            {top5[i]?.posterUrl ? (
              <img src={top5[i].posterUrl} alt={top5[i].titulo} />
            ) : (
              <span className={styles.top5DraftEmpty}>Vacío</span>
            )}
          </button>
        ))}
      </div>

      <label className={mstyles.formLabel}>BUSCAR PELÍCULA O SERIE</label>
      <input
        className={mstyles.formControl}
        type="text"
        placeholder="Busca por título..."
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={`${styles.top5PickerLayout} mt-3`}>
        <div className={styles.top5Results} role="listbox">
          {results === null || results === "short" ? (
            <p className={styles.top5Empty}>
              {results === "short"
                ? "Escribe al menos 2 letras para buscar."
                : "Escribe para buscar."}
            </p>
          ) : results === "loading" ? (
            <p className={styles.top5Empty}>Buscando...</p>
          ) : results === "error" ? (
            <p className={styles.top5Empty}>No se pudo conectar con la API.</p>
          ) : results.length === 0 ? (
            <p className={styles.top5Empty}>No se encontraron resultados.</p>
          ) : (
            results.map((item, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.top5ResultBtn} ${selected === item ? styles.isSelected : ""}`}
                onClick={() => setSelected(item)}
              >
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.titulo} />
                ) : (
                  <div className={styles.top5ResultPlaceholder}></div>
                )}
                <span>
                  <strong>{item.titulo}</strong>
                  <small>
                    {item.tipoVisual} {item.anioEstreno ? `· ${item.anioEstreno}` : ""}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>

        <div className={styles.top5EditorPanel}>
          <div className={styles.top5Preview} aria-live="polite">
            {selected ? (
              <>
                {selected.posterUrl && (
                  <img src={selected.posterUrl} alt={selected.titulo} />
                )}
                <strong>{selected.titulo}</strong>
                <small>
                  {selected.tipoVisual}{" "}
                  {selected.anioEstreno ? `· ${selected.anioEstreno}` : ""}
                </small>
              </>
            ) : (
              "Elige una película o serie"
            )}
          </div>

          <label className={mstyles.formLabel}>ELEGIR POSICIÓN</label>
          <div
            className={styles.top5SlotOptions}
            role="radiogroup"
            aria-label="Posición en el Top 5"
          >
            {[0, 1, 2, 3, 4].map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.top5SlotBtn} ${pos === p ? styles.isSelected : ""}`}
                onClick={() => setPos(p)}
              >
                <strong>#{p + 1}</strong>
                <span>{top5[p]?.titulo || "Vacío"}</span>
              </button>
            ))}
          </div>

          {posOcupada && (
            <button
              type="button"
              className={`${mstyles.btnCancel} ${styles.top5ClearBtn}`}
              disabled={saving}
              onClick={vaciarPosicion}
            >
              Vaciar posición seleccionada
            </button>
          )}
        </div>
      </div>

      <div className={mstyles.modalActions}>
        <button type="button" className={mstyles.btnCancel} onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className={mstyles.btnSave}
          disabled={saving}
          onClick={guardar}
        >
          Guardar en Top 5
        </button>
      </div>
    </Modal>
  );
}
