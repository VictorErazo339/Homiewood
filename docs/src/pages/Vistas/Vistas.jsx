import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import { normalizarContenidoApi, convertirTipoBackend } from "../../lib/contenido.js";
import ProfileChrome from "../../components/profile/ProfileChrome.jsx";
import { useProfileChrome } from "../../components/profile/ProfileChromeContext.js";
import Modal from "../../components/Modal/Modal.jsx";
import mstyles from "../../components/Modal/Modal.module.css";
import pstyles from "../Profile/Profile.module.css";
import styles from "../../styles/library.module.css";

function dedupe(items) {
  return items.filter(
    (item, index, array) =>
      index ===
      array.findIndex(
        (i) =>
          String(i.idContenido || i.apiId) === String(item.idContenido || item.apiId) &&
          String(i.proveedor || "BD") === String(item.proveedor || "BD")
      )
  );
}

function StarsRead({ puntaje }) {
  const valor = Number(puntaje || 0);
  if (valor <= 0)
    return <small style={{ color: "var(--muted)" }}>Sin puntaje</small>;
  return (
    <div className={styles.vistaStarsRead} aria-label={`Puntaje ${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= valor ? "var(--gold)" : "var(--muted)" }}
        >
          ★
        </span>
      ))}{" "}
      <small style={{ color: "var(--muted)" }}>{valor}/5</small>
    </div>
  );
}

function VistasSection() {
  const { idUsuario, recargar } = useProfileChrome();
  const [vistas, setVistas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const cargarVistas = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const [dataVistas, dataCal] = await Promise.all([
        apiRequest(`/usuarios/${idUsuario}/listas/contenidos?estado=VISTO`),
        apiRequest(`/calificaciones/usuario/${idUsuario}`),
      ]);
      const calByContenido = new Map();
      dataCal.forEach((c) => {
        const idc = c.idContenido || c.contenidoId;
        if (idc) calByContenido.set(Number(idc), c);
      });
      const arr = dataVistas.map((item) => {
        const cal = calByContenido.get(Number(item.idContenido));
        return {
          idContenido: item.idContenido,
          titulo: item.tituloContenido,
          tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
          posterUrl: item.posterUrl,
          anioEstreno: item.anioEstreno,
          apiId: String(item.apiId || item.idContenido),
          proveedor: item.apiProvider || "BD",
          puntaje: cal?.puntaje || 0,
        };
      });
      const deduped = dedupe(arr);
      setVistas(deduped);
      localStorage.setItem(`homiwood_vistas_${idUsuario}`, JSON.stringify(deduped));
    } catch (error) {
      console.error("Error cargando vistas:", error);
    }
  }, [idUsuario]);

  useEffect(() => {
    cargarVistas();
  }, [cargarVistas]);

  /* Add-modal search */
  useEffect(() => {
    if (!modalOpen) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults("short");
      return;
    }
    setResults("loading");
    const timeout = setTimeout(async () => {
      try {
        const data = await buscarCatalogo(q);
        setResults(data && data.length ? data.map(normalizarContenidoApi) : []);
      } catch (error) {
        console.error("Error buscando vistas:", error);
        setResults("error");
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [query, modalOpen]);

  function cerrar() {
    setModalOpen(false);
    setQuery("");
    setResults(null);
    setSelected(null);
    setRating(0);
    setMensaje("");
  }

  async function agregarVista() {
    if (!selected || rating < 1) return;
    try {
      const item = selected;
      const guardado = await apiRequest(
        `/usuarios/${idUsuario}/listas/vistas/contenidos/externo`,
        {
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
            estado: "VISTO",
            generos: item.generos || [],
          }),
        }
      );
      const idContenido =
        guardado.idContenido || guardado.contenido?.idContenido || item.idContenido;
      if (idContenido) {
        await apiRequest("/calificaciones", {
          method: "POST",
          body: JSON.stringify({
            idUsuario,
            idContenido,
            puntaje: rating,
            comentario: null,
          }),
        });
      }
      setMensaje(`Agregado correctamente con ${rating}/5 estrellas.`);
      setSelected(null);
      setRating(0);
      setQuery("");
      await cargarVistas();
      recargar();
    } catch (error) {
      console.error("Error guardando vista:", error);
      setMensaje("No se pudo guardar la vista.");
    }
  }

  return (
    <section className={styles.moviesViewSection}>
      <div className={styles.viewTitleRow}>
        <h2 className={styles.viewTitle}>Películas y series vistas</h2>
        <button type="button" className={pstyles.editBtn} onClick={() => setModalOpen(true)}>
          + Agregar vista
        </button>
      </div>

      <div className={styles.movieLibraryGrid}>
        {vistas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aún no agregas películas o series vistas.</p>
            <small>Presiona “Agregar vista” para comenzar.</small>
          </div>
        ) : (
          vistas.map((item, i) => (
            <article className={styles.libraryCard} key={i}>
              {item.posterUrl ? (
                <img src={item.posterUrl} alt={item.titulo} />
              ) : (
                <div className={styles.moviePosterEmpty}>{item.titulo}</div>
              )}
              <div className={styles.libraryCardBody}>
                <h3 className={styles.libraryCardTitle}>{item.titulo}</h3>
                <p className={styles.libraryCardMeta}>
                  {item.tipoVisual} {item.anioEstreno ? `· ${item.anioEstreno}` : ""}
                </p>
                <span className={styles.libraryStatus}>Vista</span>
                <div style={{ marginTop: ".45rem" }}>
                  <StarsRead puntaje={item.puntaje} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      <Modal open={modalOpen} onClose={cerrar} size="lg" labelledBy="vistasModalLabel">
        <h3 className={mstyles.modalTitle} id="vistasModalLabel">AGREGAR A VISTAS</h3>
        <label className={mstyles.formLabel}>BUSCAR PELÍCULA O SERIE</label>
        <input
          className={mstyles.formControl}
          type="text"
          placeholder="Busca por título..."
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setMensaje("");
          }}
        />

        <div className={`${pstyles.top5Results} mt-3`}>
          {selected ? (
            <div className={styles.ratingBox}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {selected.posterUrl ? (
                  <img
                    src={selected.posterUrl}
                    alt={selected.titulo}
                    style={{ width: 64, height: 92, objectFit: "cover", borderRadius: 10 }}
                  />
                ) : (
                  <div style={{ width: 64, height: 92, borderRadius: 10, background: "#2a1a4a" }}></div>
                )}
                <div>
                  <strong style={{ display: "block", color: "var(--text-strong)" }}>{selected.titulo}</strong>
                  <small style={{ color: "var(--muted)" }}>
                    {selected.tipoVisual} {selected.anioEstreno ? `· ${selected.anioEstreno}` : ""}
                  </small>
                  <p style={{ margin: ".45rem 0 0", color: "var(--text)", fontSize: ".9rem" }}>
                    ¿Qué puntaje le das?
                  </p>
                  <div className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={styles.ratingStarBtn}
                        style={{ color: v <= rating ? "var(--gold)" : "var(--muted)" }}
                        onClick={() => setRating(v)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <small style={{ display: "block", color: "var(--muted)", marginTop: ".25rem" }}>
                    {rating > 0 ? `${rating}/5 estrellas` : "Selecciona de 1 a 5 estrellas."}
                  </small>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  className={mstyles.btnSave}
                  disabled={rating < 1}
                  onClick={agregarVista}
                >
                  Guardar como vista
                </button>
                <button type="button" className={mstyles.btnCancel} onClick={() => setSelected(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : results === null || results === "short" ? (
            <p className={pstyles.top5Empty}>
              {results === "short" ? "Escribe al menos 2 letras." : mensaje || "Escribe para buscar."}
            </p>
          ) : results === "loading" ? (
            <p className={pstyles.top5Empty}>Buscando...</p>
          ) : results === "error" ? (
            <p className={pstyles.top5Empty}>Error buscando contenido.</p>
          ) : results.length === 0 ? (
            <p className={pstyles.top5Empty}>No se encontraron resultados.</p>
          ) : (
            results.map((item, i) => (
              <button
                key={i}
                type="button"
                className={pstyles.top5ResultBtn}
                onClick={() => setSelected(item)}
              >
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.titulo} />
                ) : (
                  <div className={pstyles.top5ResultPlaceholder}></div>
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

        <div className={mstyles.modalActions}>
          <button type="button" className={mstyles.btnCancel} onClick={cerrar}>
            Cancelar
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default function Vistas() {
  return (
    <ProfileChrome activeTab="vistas">
      <VistasSection />
    </ProfileChrome>
  );
}
