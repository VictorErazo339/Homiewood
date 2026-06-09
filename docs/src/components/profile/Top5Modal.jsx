import { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import { normalizarContenidoApi, convertirTipoBackend } from "../../lib/contenido.js";
import Modal from "../Modal/Modal.jsx";
import mstyles from "../Modal/Modal.module.css";
import styles from "../../pages/Profile/Profile.module.css";

const POSICIONES = [0, 1, 2, 3, 4];

function normalizarTop5(top5 = []) {
  const arr = [null, null, null, null, null];

  top5.slice(0, 5).forEach((item, index) => {
    arr[index] = item || null;
  });

  return arr;
}

function primeraPosicionDisponible(top5 = []) {
  const libre = top5.findIndex((item) => !item);
  return libre >= 0 ? libre : 0;
}

function textoMeta(item) {
  if (!item) return "";
  return [item.tipoVisual, item.anioEstreno].filter(Boolean).join(" · ");
}

function tituloCorto(texto = "") {
  return texto.length > 28 ? `${texto.slice(0, 28)}...` : texto;
}

function claseOpcional(nombre) {
  return styles[nombre] || styles[nombre.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] || "";
}

function cx(...nombres) {
  return nombres
    .filter(Boolean)
    .map((nombre) => claseOpcional(nombre))
    .filter(Boolean)
    .join(" ");
}

/**
 * Modal compartido para editar el Top 5.
 * Lo usan Profile, Vistas y PorVer mediante ProfileChrome.
 */
export default function Top5Modal({ open, onClose, idUsuario, top5 = [], onSaved }) {
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pos, setPos] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [draftTop5, setDraftTop5] = useState(() => normalizarTop5(top5));
  const [dragOverPos, setDragOverPos] = useState(null);

  const totalCompletos = useMemo(() => top5.filter(Boolean).length, [top5]);
  const posOcupada = pos !== null && !!top5[pos];
  const puedeGuardar = !!selected && pos !== null && !saving;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      setSelected(null);
      setPos(null);
      setMensaje("");
      setDragOverPos(null);
      setDraftTop5(normalizarTop5(top5));
      return;
    }

    const normalizado = normalizarTop5(top5);
    setDraftTop5(normalizado);
    setPos(primeraPosicionDisponible(normalizado));
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, top5]);

  useEffect(() => {
    if (!open) return undefined;

    const q = query.trim();

    if (q.length < 2) {
      setResults(q.length === 0 ? null : "short");
      return undefined;
    }

    setResults("loading");

    const timeout = setTimeout(async () => {
      try {
        const data = await buscarCatalogo(q);
        const normalizados = Array.isArray(data)
          ? data.map(normalizarContenidoApi).filter(Boolean)
          : [];

        setResults(normalizados);
      } catch (error) {
        console.error("Error buscando catálogo:", error);
        setResults("error");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, open]);

  function colocarEnPosicion(item, nuevaPos) {
    if (!item || nuevaPos === null) return;

    setSelected(item);
    setPos(nuevaPos);
    setMensaje(`"${item.titulo}" queda listo para la posición #${nuevaPos + 1}. Presiona Guardar para confirmar.`);

    setDraftTop5((actual) => {
      const copia = normalizarTop5(actual);
      copia[nuevaPos] = item;
      return copia;
    });
  }

  function seleccionarResultado(item) {
    const destino = pos !== null ? pos : primeraPosicionDisponible(draftTop5);
    colocarEnPosicion(item, destino);
  }

  function seleccionarPosicion(nuevaPos) {
    if (selected) {
      colocarEnPosicion(selected, nuevaPos);
      return;
    }

    setPos(nuevaPos);
    setMensaje("");
  }

  function handleDragStartResultado(event, item) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source: "catalogo", item })
    );
  }

  function handleDragOverSlot(event, nuevaPos) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragOverPos(nuevaPos);
  }

  function handleDropSlot(event, nuevaPos) {
    event.preventDefault();
    setDragOverPos(null);

    try {
      const raw = event.dataTransfer.getData("application/json");
      if (!raw) return;

      const payload = JSON.parse(raw);
      if (payload?.source === "catalogo" && payload.item) {
        colocarEnPosicion(payload.item, nuevaPos);
      }
    } catch (error) {
      console.error("Error recibiendo contenido arrastrado:", error);
    }
  }

  async function guardar() {
    if (!selected || pos === null || !idUsuario) return;

    setSaving(true);
    setMensaje("");

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

      setMensaje(
        posOcupada
          ? `Posición #${pos + 1} reemplazada correctamente.`
          : `Agregado en la posición #${pos + 1}.`
      );
      setSelected(null);
      setQuery("");
      setResults(null);
    } catch (error) {
      console.error("Error guardando Top 5:", error);
      setMensaje("No se pudo guardar en tu Top 5. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function vaciarPosicion() {
    if (pos === null || !top5[pos]) return;

    const item = top5[pos];
    const ok = confirm(`¿Eliminar "${item.titulo}" de la posición #${pos + 1}?`);
    if (!ok) return;

    setSaving(true);
    setMensaje("");

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

      setDraftTop5((actual) => {
        const copia = normalizarTop5(actual);
        copia[pos] = null;
        return copia;
      });

      await onSaved?.();
      setSelected(null);
      setMensaje(`Posición #${pos + 1} eliminada.`);
    } catch (error) {
      console.error("Error eliminando posición:", error);
      setMensaje("No se pudo eliminar la posición seleccionada.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" labelledBy="top5ModalLabel">
      <div className={cx("top5ModalShell")}>
        <header className={cx("top5ModalHead")}>
          <div>
            <p className={cx("top5ModalEyebrow")}>Ranking personal</p>
            <h3 className={mstyles.modalTitle} id="top5ModalLabel">
              EDITAR MI TOP 5
            </h3>
            <p className={cx("top5ModalSubtitle")}>
              Elige una posición, busca una película o serie y arrástrala al cuadro del ranking. Si la posición ya tiene contenido, se reemplaza al guardar.
            </p>
          </div>

          <span className={cx("top5ModalCounter")}>{totalCompletos}/5 completos</span>
        </header>

        <div
          className={cx("top5DraftSlots")}
          role="radiogroup"
          aria-label="Posiciones actuales del Top 5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(86px, 116px))",
            justifyContent: "start",
            alignItems: "start",
            gap: "0.65rem",
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            padding: "0.15rem 0 0.5rem",
            margin: "0.1rem 0 0.35rem",
          }}
        >
          {POSICIONES.map((i) => {
            const item = draftTop5[i];
            const selectedSlot = pos === i;
            const dropTarget = dragOverPos === i;

            return (
              <button
                key={i}
                type="button"
                className={cx("top5DraftSlot", selectedSlot && "isSelected", dropTarget && "isDropTarget", item && "isFilled")}
                aria-pressed={selectedSlot}
                onClick={() => seleccionarPosicion(i)}
                onDragOver={(event) => handleDragOverSlot(event, i)}
                onDragLeave={() => setDragOverPos(null)}
                onDrop={(event) => handleDropSlot(event, i)}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "clamp(126px, 15vw, 158px)",
                  minHeight: "126px",
                  maxHeight: "158px",
                  display: "block",
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: "14px",
                  border: selectedSlot || dropTarget
                    ? "1px solid var(--gold)"
                    : "1px solid rgba(255, 255, 255, 0.14)",
                  background: "rgba(18, 20, 28, 0.92)",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <span className={cx("top5DraftRank")}>#{i + 1}</span>

                {item?.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.titulo}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                ) : (
                  <span className={cx("top5DraftEmpty")}>+</span>
                )}

                <span className={cx("top5DraftOverlay")}>
                  <strong>{item ? tituloCorto(item.titulo) : "Vacío"}</strong>
                  <small>{selectedSlot ? "Seleccionado" : item ? "Cambiar" : "Arrastra aquí"}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className={cx("top5ModalGrid")}>
          <section className={cx("top5SearchPanel")}>
            <label className={mstyles.formLabel}>BUSCAR PELÍCULA O SERIE</label>

            <div className={cx("top5SearchBox")}>
              <i className={`bi bi-search ${cx("top5SearchIcon")}`} aria-hidden="true"></i>
              <input
                ref={inputRef}
                className={cx("top5SearchInput")}
                type="text"
                placeholder="Ej: Demon Slayer, Crash Landing on You..."
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setMensaje("");
                }}
              />
            </div>

            <div className={cx("top5Results")} role="listbox" aria-label="Resultados de búsqueda">
              {results === null ? (
                <p className={cx("top5Empty")}>Busca por título para encontrar películas, series o anime.</p>
              ) : results === "short" ? (
                <p className={cx("top5Empty")}>Escribe al menos 2 letras para buscar.</p>
              ) : results === "loading" ? (
                <p className={cx("top5Empty")}>Buscando...</p>
              ) : results === "error" ? (
                <p className={cx("top5Empty")}>No se pudo conectar con la API.</p>
              ) : results.length === 0 ? (
                <p className={cx("top5Empty")}>No se encontraron resultados.</p>
              ) : (
                results.map((item, i) => (
                  <button
                    key={`${item.proveedor || "BD"}-${item.apiId || item.titulo}-${i}`}
                    type="button"
                    className={cx("top5ResultBtn", selected === item && "isSelected")}
                    draggable
                    title="Arrastra esta película a una posición del Top 5"
                    onDragStart={(event) => handleDragStartResultado(event, item)}
                    onClick={() => seleccionarResultado(item)}
                  >
                    {item.posterUrl ? (
                      <img src={item.posterUrl} alt={item.titulo} />
                    ) : (
                      <div className={cx("top5ResultPlaceholder")}></div>
                    )}

                    <span>
                      <strong>{item.titulo}</strong>
                      <small>{textoMeta(item) || "Contenido"}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <aside className={cx("top5EditorPanel")}>
            <div className={cx("top5Preview", !selected && "isEmpty")} aria-live="polite">
              {selected ? (
                <>
                  {selected.posterUrl ? (
                    <img
                      className={cx("top5PreviewPoster")}
                      src={selected.posterUrl}
                      alt={selected.titulo}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "min(128px, 74%)",
                        maxHeight: "192px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className={cx("top5PreviewPosterEmpty")}></div>
                  )}

                  <strong>{selected.titulo}</strong>
                  <small>{textoMeta(selected) || "Contenido"}</small>
                </>
              ) : (
                <div className={cx("top5PreviewEmptyContent")}>
                  <span>🎞️</span>
                  <strong>Elige un resultado</strong>
                  <small>También puedes arrastrarlo directo al ranking.</small>
                </div>
              )}
            </div>

            <div className={cx("top5PositionBox")}>
              <label className={mstyles.formLabel}>ELEGIR POSICIÓN</label>

              <div className={cx("top5SlotOptions")} role="radiogroup" aria-label="Posición en el Top 5">
                {POSICIONES.map((p) => {
                  const item = draftTop5[p];

                  return (
                    <button
                      key={p}
                      type="button"
                      className={cx("top5SlotBtn", pos === p && "isSelected")}
                      onClick={() => seleccionarPosicion(p)}
                      onDragOver={(event) => handleDragOverSlot(event, p)}
                      onDragLeave={() => setDragOverPos(null)}
                      onDrop={(event) => handleDropSlot(event, p)}
                    >
                      <strong>#{p + 1}</strong>
                      <span>
                        <b>{item ? tituloCorto(item.titulo) : "Vacío"}</b>
                        <small>{item ? "Se puede reemplazar" : "Disponible"}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className={cx("top5PositionHint")}>
              {pos === null
                ? "Selecciona una posición."
                : posOcupada
                  ? `La posición #${pos + 1} se reemplazará al guardar.`
                  : `Se guardará en la posición #${pos + 1}.`}
            </p>

            {posOcupada && (
              <button
                type="button"
                className={`${mstyles.btnCancel} ${cx("top5ClearBtn")}`}
                disabled={saving}
                onClick={vaciarPosicion}
              >
                ✕ Eliminar de mi Top 5
              </button>
            )}

            {mensaje && <p className={cx("top5ModalMessage")}>{mensaje}</p>}
          </aside>
        </div>

        <div className={mstyles.modalActions}>
          <button type="button" className={mstyles.btnCancel} onClick={onClose} disabled={saving}>
            Listo
          </button>

          <button type="button" className={mstyles.btnSave} disabled={!puedeGuardar} onClick={guardar}>
            {saving ? "Guardando..." : posOcupada ? "Reemplazar posición" : "Guardar en Top 5"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
