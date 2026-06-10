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

function payloadTop5(item, posicion) {
  return {
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
    posicion: posicion + 1,
    estado: "FAVORITO",
    generos: item.generos || [],
  };
}

/**
 * Modal compartido para editar el Top 5.
 * Cambio v2:
 * - Ya no requiere botón Guardar.
 * - Primero eliges una posición (#1 a #5) y luego haces click en un resultado.
 * - El resultado se guarda inmediatamente en esa posición.
 * - También puedes arrastrar un resultado a un slot y se guarda al soltarlo.
 */
export default function Top5Modal({ open, onClose, idUsuario, top5 = [], onSaved }) {
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [pos, setPos] = useState(null);
  const [savingPos, setSavingPos] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [draftTop5, setDraftTop5] = useState(() => normalizarTop5(top5));
  const [dragOverPos, setDragOverPos] = useState(null);

  const saving = savingPos !== null;
  const totalCompletos = useMemo(() => draftTop5.filter(Boolean).length, [draftTop5]);
  const posicionActual = pos !== null ? draftTop5[pos] : null;
  const posOcupada = Boolean(posicionActual);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      setPos(null);
      setMensaje("");
      setSavingPos(null);
      setDragOverPos(null);
      setDraftTop5(normalizarTop5(top5));
      return;
    }

    const normalizado = normalizarTop5(top5);
    setDraftTop5(normalizado);
    setPos(primeraPosicionDisponible(normalizado));
    setMensaje("Elige una posición y toca un resultado: se guardará altiro.");
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

  function seleccionarPosicion(nuevaPos) {
    if (saving) return;
    setPos(nuevaPos);
    setMensaje(
      draftTop5[nuevaPos]
        ? `Posición #${nuevaPos + 1} seleccionada. El próximo resultado reemplazará "${draftTop5[nuevaPos].titulo}".`
        : `Posición #${nuevaPos + 1} seleccionada. El próximo resultado se guardará aquí.`
    );
  }

  async function guardarItemEnPosicion(item, nuevaPos) {
    if (!item || nuevaPos === null || nuevaPos === undefined || !idUsuario || saving) return;

    const anterior = draftTop5[nuevaPos] || null;

    setPos(nuevaPos);
    setSavingPos(nuevaPos);
    setMensaje(`Guardando "${item.titulo}" en la posición #${nuevaPos + 1}...`);

    setDraftTop5((actual) => {
      const copia = normalizarTop5(actual);
      copia[nuevaPos] = item;
      return copia;
    });

    try {
      await apiRequest(`/usuarios/${idUsuario}/listas/top5/contenidos/externo`, {
        method: "POST",
        body: JSON.stringify(payloadTop5(item, nuevaPos)),
      });

      await onSaved?.();

      setMensaje(
        anterior
          ? `Listo: reemplazaste la posición #${nuevaPos + 1} por "${item.titulo}".`
          : `Listo: "${item.titulo}" quedó en la posición #${nuevaPos + 1}.`
      );
    } catch (error) {
      console.error("Error guardando Top 5:", error);

      setDraftTop5((actual) => {
        const copia = normalizarTop5(actual);
        copia[nuevaPos] = anterior;
        return copia;
      });

      setMensaje("No se pudo guardar en tu Top 5. Intenta de nuevo.");
    } finally {
      setSavingPos(null);
    }
  }

  function seleccionarResultado(item) {
    const destino = pos !== null ? pos : primeraPosicionDisponible(draftTop5);
    guardarItemEnPosicion(item, destino);
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
    if (saving) return;
    event.dataTransfer.dropEffect = "copy";
    setDragOverPos(nuevaPos);
  }

  function handleDropSlot(event, nuevaPos) {
    event.preventDefault();
    setDragOverPos(null);
    if (saving) return;

    try {
      const raw = event.dataTransfer.getData("application/json");
      if (!raw) return;

      const payload = JSON.parse(raw);
      if (payload?.source === "catalogo" && payload.item) {
        guardarItemEnPosicion(payload.item, nuevaPos);
      }
    } catch (error) {
      console.error("Error recibiendo contenido arrastrado:", error);
    }
  }

  async function vaciarPosicion() {
    if (pos === null || !posicionActual || saving) return;

    const item = top5[pos] || posicionActual;
    const ok = confirm(`¿Eliminar "${posicionActual.titulo}" de la posición #${pos + 1}?`);
    if (!ok) return;

    if (!item.idListaContenido && !(item.idLista && item.idContenido)) {
      setMensaje("Espera un momento a que termine de sincronizarse antes de eliminar esta posición.");
      return;
    }

    setSavingPos(pos);
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
      setMensaje(`Posición #${pos + 1} eliminada.`);
    } catch (error) {
      console.error("Error eliminando posición:", error);
      setMensaje("No se pudo eliminar la posición seleccionada.");
    } finally {
      setSavingPos(null);
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
              Elige un cuadro del ranking y luego toca una película o serie. Se guardará automáticamente en esa posición.
            </p>
          </div>

          <span className={cx("top5ModalCounter")}>{totalCompletos}/5 completos</span>
        </header>

        <div
          className={cx("top5DraftSlots")}
          role="radiogroup"
          aria-label="Posiciones actuales del Top 5"
        >
          {POSICIONES.map((i) => {
            const item = draftTop5[i];
            const selectedSlot = pos === i;
            const dropTarget = dragOverPos === i;
            const savingThis = savingPos === i;

            return (
              <button
                key={i}
                type="button"
                className={cx(
                  "top5DraftSlot",
                  selectedSlot && "isSelected",
                  dropTarget && "isDropTarget",
                  item && "isFilled"
                )}
                aria-pressed={selectedSlot}
                disabled={saving}
                onClick={() => seleccionarPosicion(i)}
                onDragOver={(event) => handleDragOverSlot(event, i)}
                onDragLeave={() => setDragOverPos(null)}
                onDrop={(event) => handleDropSlot(event, i)}
              >
                <span className={cx("top5DraftRank")}>#{i + 1}</span>

                {item?.posterUrl ? (
                  <img src={item.posterUrl} alt={item.titulo} loading="lazy" decoding="async" />
                ) : (
                  <span className={cx("top5DraftEmpty")}>+</span>
                )}

                <span className={cx("top5DraftOverlay")}>
                  <strong>{savingThis ? "Guardando..." : item ? tituloCorto(item.titulo) : "Vacío"}</strong>
                  <small>{selectedSlot ? "Seleccionado" : item ? "Click para reemplazar" : "Click para usar"}</small>
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
                disabled={saving}
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
                    className={cx("top5ResultBtn")}
                    draggable={!saving}
                    disabled={saving}
                    title="Click para guardar en la posición seleccionada. También puedes arrastrar al cuadro."
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
            <div className={cx("top5Preview", !posicionActual && "isEmpty")} aria-live="polite">
              {posicionActual ? (
                <>
                  {posicionActual.posterUrl ? (
                    <img
                      className={cx("top5PreviewPoster")}
                      src={posicionActual.posterUrl}
                      alt={posicionActual.titulo}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={cx("top5PreviewPosterEmpty")}></div>
                  )}

                  <strong>#{pos + 1} · {posicionActual.titulo}</strong>
                  <small>{textoMeta(posicionActual) || "Contenido"}</small>
                </>
              ) : (
                <div className={cx("top5PreviewEmptyContent")}> 
                  <span>🎞️</span>
                  <strong>{pos === null ? "Elige una posición" : `Posición #${pos + 1} vacía`}</strong>
                  <small>Al tocar un resultado se guardará aquí.</small>
                </div>
              )}
            </div>

            <div className={cx("top5PositionBox")}> 
              <label className={mstyles.formLabel}>POSICIÓN SELECCIONADA</label>

              <div className={cx("top5SlotOptions")} role="radiogroup" aria-label="Posición en el Top 5">
                {POSICIONES.map((p) => {
                  const item = draftTop5[p];

                  return (
                    <button
                      key={p}
                      type="button"
                      className={cx("top5SlotBtn", pos === p && "isSelected", dragOverPos === p && "isDropTarget")}
                      disabled={saving}
                      onClick={() => seleccionarPosicion(p)}
                      onDragOver={(event) => handleDragOverSlot(event, p)}
                      onDragLeave={() => setDragOverPos(null)}
                      onDrop={(event) => handleDropSlot(event, p)}
                    >
                      <strong>#{p + 1}</strong>
                      <span>
                        <b>{item ? tituloCorto(item.titulo) : "Vacío"}</b>
                        <small>{item ? "Click para reemplazar" : "Disponible"}</small>
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
                  ? `La posición #${pos + 1} se reemplazará al tocar un resultado.`
                  : `El próximo resultado se guardará en la posición #${pos + 1}.`}
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
          <button type="button" className={mstyles.btnSave} onClick={onClose} disabled={saving}>
            {saving ? "Guardando..." : "Listo"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
