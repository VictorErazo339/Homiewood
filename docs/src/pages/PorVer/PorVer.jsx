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

// Map a backend ListaContenido row to the card shape used here.
function normalizarPorVer(item) {
  return {
    titulo: item.tituloContenido,
    tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
    posterUrl: item.posterUrl,
    anioEstreno: item.anioEstreno,
    apiId: String(item.apiId || item.idContenido),
    proveedor: item.apiProvider || "BD",
    generos: item.generos || [],
  };
}

function PorVerSection() {
  const { idUsuario, recargar } = useProfileChrome();
  const storageKey = `homiwood_porver_${idUsuario}`;

  const [porver, setPorver] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Read the watchlist from the backend (POR_VER list), caching to localStorage
  // so a transient network error still shows the last-known list.
  const cargarPorVer = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const data = await apiRequest(
        `/usuarios/${idUsuario}/listas/contenidos?estado=POR_VER`
      );
      const lista = (Array.isArray(data) ? data : []).map(normalizarPorVer);
      setPorver(lista);
      localStorage.setItem(storageKey, JSON.stringify(lista));
    } catch (error) {
      console.error("Error cargando por ver:", error);
      try {
        setPorver(JSON.parse(localStorage.getItem(storageKey)) || []);
      } catch {
        setPorver([]);
      }
    }
  }, [idUsuario, storageKey]);

  useEffect(() => {
    cargarPorVer();
  }, [cargarPorVer]);

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
        console.error("Error buscando por ver:", error);
        setResults("error");
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [query, modalOpen]);

  function cerrar() {
    setModalOpen(false);
    setQuery("");
    setResults(null);
    setMensaje("");
  }

  async function agregarPorVer(item) {
    const existe = porver.some((p) => p.apiId === item.apiId && p.proveedor === item.proveedor);
    if (existe) {
      setQuery("");
      setMensaje("Ya está en tu lista por ver.");
      return;
    }
    try {
      await apiRequest(`/usuarios/${idUsuario}/listas/porver/contenidos/externo`, {
        method: "POST",
        body: JSON.stringify({
          proveedor: item.proveedor,
          apiId: String(item.apiId),
          titulo: item.titulo,
          tipoContenido: convertirTipoBackend(item.tipoVisual),
          descripcion: item.descripcion || "",
          fechaEstreno: item.fechaEstreno || null,
          anioEstreno: item.anioEstreno || null,
          posterUrl: item.posterUrl || "",
          idiomaOriginal: item.idioma || "",
          puntajeExterno: item.puntajeExterno || 0,
          estado: "POR_VER",
          generos: item.generos || [],
        }),
      });
      await cargarPorVer();
      recargar();
      setQuery("");
      setMensaje("Agregado correctamente.");
    } catch (error) {
      console.error("Error guardando por ver en backend:", error);
      setMensaje("No se pudo agregar. Intenta de nuevo.");
    }
  }

  return (
    <section className={styles.moviesViewSection}>
      <div className={styles.viewTitleRow}>
        <h2 className={styles.viewTitle}>Películas y series por ver</h2>
        <button type="button" className={pstyles.editBtn} onClick={() => setModalOpen(true)}>
          + Agregar por ver
        </button>
      </div>

      <div className={styles.movieLibraryGrid}>
        {porver.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aún no agregas películas o series por ver.</p>
            <small>Presiona “Agregar por ver” para comenzar.</small>
          </div>
        ) : (
          porver.map((item, i) => (
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
                <span className={styles.libraryStatus}>Por ver</span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      <Modal open={modalOpen} onClose={cerrar} size="lg" labelledBy="porverModalLabel">
        <h3 className={mstyles.modalTitle} id="porverModalLabel">AGREGAR A POR VER</h3>
        <label className={mstyles.formLabel}>BUSCAR PELÍCULA O SERIE</label>
        <input
          className={mstyles.formControl}
          type="text"
          placeholder="Busca por título..."
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMensaje("");
          }}
        />

        <div className={`${pstyles.top5Results} mt-3`}>
          {results === null || results === "short" ? (
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
                onClick={() => agregarPorVer(item)}
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

export default function PorVer() {
  return (
    <ProfileChrome activeTab="porver">
      <PorVerSection />
    </ProfileChrome>
  );
}
