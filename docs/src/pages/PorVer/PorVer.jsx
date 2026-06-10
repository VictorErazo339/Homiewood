import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import {
  guardarContenidoUsuarioEnLista,
  listarPorVerUsuario,
  marcarPorVerComoVista,
} from "../../api/listasApi.js";
import { normalizarContenidoApi, convertirTipoBackend } from "../../lib/contenido.js";
import ProfileChrome from "../../components/profile/ProfileChrome.jsx";
import { useProfileChrome } from "../../components/profile/ProfileChromeContext.js";
import Modal from "../../components/Modal/Modal.jsx";
import mstyles from "../../components/Modal/Modal.module.css";
import pstyles from "../Profile/Profile.module.css";
import styles from "../../styles/library.module.css";

const LIMITE_POR_VER = 30;

const FILTROS_INICIALES = {
  query: "",
  tipo: "",
  genero: "",
  anio: "",
  orden: "RECIENTES",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function obtenerTipoVisual(tipo) {
  const upper = String(tipo || "").toUpperCase();

  if (upper === "PELICULA" || upper === "MOVIE") return "Película";
  if (upper === "ANIME") return "Anime";
  return "Serie";
}

function obtenerTipoBackend(item) {
  const tipoDirecto = String(item?.tipoBackend || item?.tipoContenido || "").toUpperCase();

  if (["PELICULA", "SERIE", "ANIME"].includes(tipoDirecto)) {
    return tipoDirecto;
  }

  const tipoVisual = String(item?.tipoVisual || item?.tipo || "").toLowerCase();

  if (tipoVisual.includes("anime")) return "ANIME";
  if (tipoVisual.includes("pel")) return "PELICULA";

  return convertirTipoBackend(item?.tipoVisual || item?.tipo || "SERIE");
}

function normalizarGeneros(item, tipoBackend) {
  const generos = Array.isArray(item?.generos) ? item.generos.filter(Boolean) : [];
  const incluyeAnime = generos.some((g) => String(g).toLowerCase() === "anime");

  if (tipoBackend === "ANIME" && !incluyeAnime) {
    return ["Anime", ...generos];
  }

  return generos;
}

function normalizarPorVerBackend(item) {
  return {
    idListaContenido: item.idListaContenido || null,
    idLista: item.idLista || null,
    idContenido: item.idContenido || item.contenido?.idContenido || null,
    titulo: item.titulo || item.tituloContenido || item.contenido?.titulo || "Sin título",
    tipoContenido: item.tipoContenido || item.contenido?.tipoContenido || "SERIE",
    tipoVisual: obtenerTipoVisual(item.tipoContenido || item.contenido?.tipoContenido),
    descripcion: item.descripcion || item.contenido?.descripcion || "",
    anioEstreno: item.anioEstreno || item.contenido?.anioEstreno || null,
    fechaEstreno: item.fechaEstreno || item.contenido?.fechaEstreno || null,
    posterUrl: item.posterUrl || item.contenido?.posterUrl || "",
    idioma: item.idioma || item.idiomaOriginal || item.contenido?.idioma || "",
    apiProvider: item.apiProvider || item.proveedor || item.contenido?.apiProvider || "BD",
    apiId: String(item.apiId || item.contenido?.apiId || item.idContenido || item.contenido?.idContenido || ""),
    estado: item.estado || "POR_VER",
    notaUsuario: item.notaUsuario || "",
    fechaAgregado: item.fechaAgregado || null,
    generos: Array.isArray(item.generos) ? item.generos : [],
  };
}

function dedupe(items) {
  return items.filter(
    (item, index, array) =>
      index ===
      array.findIndex(
        (i) =>
          String(i.idContenido || i.apiId) === String(item.idContenido || item.apiId) &&
          String(i.apiProvider || i.proveedor || "BD") ===
            String(item.apiProvider || item.proveedor || "BD")
      )
  );
}

function PorVerSection() {
  const { idUsuario, recargar } = useProfileChrome();

  const [porVer, setPorVer] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [detalleMensaje, setDetalleMensaje] = useState("");
  const [marcandoVista, setMarcandoVista] = useState(false);

  const generosDisponibles = useMemo(() => {
    return Array.from(new Set(porVer.flatMap((item) => item.generos || [])))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [porVer]);

  const cargarPorVer = useCallback(
    async (targetPage = 0, append = false) => {
      if (!idUsuario) return;

      setLoading(true);
      setErrorCarga("");

      try {
        const data = await listarPorVerUsuario(idUsuario, {
          page: targetPage,
          limite: LIMITE_POR_VER,
          orden: filtros.orden || "RECIENTES",
          query: normalizarTexto(filtros.query),
          tipo: normalizarTexto(filtros.tipo),
          genero: normalizarTexto(filtros.genero),
          anio: normalizarTexto(filtros.anio),
        });

        const normalizadas = Array.isArray(data) ? data.map(normalizarPorVerBackend) : [];

        setPorVer((prev) => (append ? dedupe([...prev, ...normalizadas]) : normalizadas));
        setPage(targetPage);
        setHasMore(normalizadas.length === LIMITE_POR_VER);
      } catch (error) {
        console.error("Error cargando por ver:", error);
        setErrorCarga("No se pudo cargar tu lista Por ver. Revisa que el backend tenga el endpoint de Por ver.");
      } finally {
        setLoading(false);
      }
    },
    [idUsuario, filtros]
  );

  useEffect(() => {
    const timeout = setTimeout(() => cargarPorVer(0, false), 280);
    return () => clearTimeout(timeout);
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

  function actualizarFiltro(nombre, valor) {
    setFiltros((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
  }

  function cerrarAgregar() {
    setModalOpen(false);
    setQuery("");
    setResults(null);
    setMensaje("");
    setGuardando(false);
  }

  function abrirDetalle(item) {
    setDetalle(item);
    setDetalleMensaje("");
  }

  function cerrarDetalle() {
    setDetalle(null);
    setDetalleMensaje("");
    setMarcandoVista(false);
  }

  async function agregarPorVer(item) {
    if (!idUsuario || guardando) return;

    const tipoBackend = obtenerTipoBackend(item);
    const existe = porVer.some(
      (p) => String(p.apiId) === String(item.apiId) && String(p.apiProvider) === String(item.proveedor || item.apiProvider)
    );

    if (existe) {
      setMensaje("Ya está en tu lista Por ver.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      await guardarContenidoUsuarioEnLista(idUsuario, "porver", {
        proveedor: item.proveedor,
        apiId: String(item.apiId),
        titulo: item.titulo,
        tipoContenido: tipoBackend,
        descripcion: item.descripcion || "",
        fechaEstreno: item.fechaEstreno || null,
        anioEstreno: item.anioEstreno || null,
        posterUrl: item.posterUrl || "",
        idiomaOriginal: item.idioma || "",
        puntajeExterno: item.puntajeExterno || 0,
        estado: "POR_VER",
        generos: normalizarGeneros(item, tipoBackend),
      });

      setMensaje("Agregado correctamente a Por ver.");
      setQuery("");
      setResults(null);
      await cargarPorVer(0, false);
      recargar?.();
    } catch (error) {
      console.error("Error guardando por ver:", error);
      setMensaje("No se pudo agregar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function pasarAVistas() {
    if (!idUsuario || !detalle || marcandoVista) return;

    if (!detalle.idListaContenido) {
      setDetalleMensaje("No se encontró el identificador de esta fila en Por ver.");
      return;
    }

    setMarcandoVista(true);
    setDetalleMensaje("");

    try {
      await marcarPorVerComoVista(idUsuario, detalle.idListaContenido);

      setPorVer((prev) => prev.filter((item) => item.idListaContenido !== detalle.idListaContenido));
      setDetalleMensaje("Marcado como visto. Ya no aparecerá en Por ver.");
      await cargarPorVer(0, false);
      recargar?.();
      cerrarDetalle();
    } catch (error) {
      console.error("Error marcando como vista:", error);
      setDetalleMensaje("No se pudo marcar como vista. Intenta nuevamente.");
    } finally {
      setMarcandoVista(false);
    }
  }

  return (
    <section className={styles.moviesViewSection}>
      <div className={styles.viewTitleRow}>
        <div>
          <p className={styles.viewEyebrow}>Biblioteca personal</p>
          <h2 className={styles.viewTitle}>Películas y series por ver</h2>
          <p className={styles.viewSubtitle}>
            Filtra lo que quieres ver por género, tipo y año. Aquí no hay estrellas ni comentarios porque aún no lo viste.
          </p>
        </div>

        <button type="button" className={pstyles.editBtn} onClick={() => setModalOpen(true)}>
          + Agregar por ver
        </button>
      </div>

      <div className={cx(styles.libraryToolbar, styles.porVerToolbar)}>
        <label className={styles.filterField}>
          <span>Buscar</span>
          <input
            className={styles.filterInput}
            type="search"
            placeholder="Título..."
            value={filtros.query}
            onChange={(e) => actualizarFiltro("query", e.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>Tipo</span>
          <select
            className={styles.filterSelect}
            value={filtros.tipo}
            onChange={(e) => actualizarFiltro("tipo", e.target.value)}
          >
            <option value="">Todo</option>
            <option value="PELICULA">Película</option>
            <option value="SERIE">Serie</option>
            <option value="ANIME">Anime</option>
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Género</span>
          <select
            className={styles.filterSelect}
            value={filtros.genero}
            onChange={(e) => actualizarFiltro("genero", e.target.value)}
          >
            <option value="">Todos</option>
            {generosDisponibles.map((genero) => (
              <option key={genero} value={genero}>
                {genero}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Año</span>
          <select
            className={styles.filterSelect}
            value={filtros.anio}
            onChange={(e) => actualizarFiltro("anio", e.target.value)}
          >
            <option value="">Todos</option>
            {Array.from(
              { length: new Date().getFullYear() - 1899 },
              (_, index) => new Date().getFullYear() - index
            ).map((anio) => (
              <option key={anio} value={String(anio)}>
                {anio}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Orden</span>
          <select
            className={styles.filterSelect}
            value={filtros.orden}
            onChange={(e) => actualizarFiltro("orden", e.target.value)}
          >
            <option value="RECIENTES">Más recientes</option>
            <option value="TITULO_ASC">Título A-Z</option>
            <option value="TITULO_DESC">Título Z-A</option>
            <option value="ANIO_DESC">Año nuevo</option>
            <option value="ANIO_ASC">Año antiguo</option>
          </select>
        </label>

        <button type="button" className={styles.clearFiltersBtn} onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {errorCarga ? <p className={styles.feedbackMessage}>{errorCarga}</p> : null}

      <div className={styles.movieLibraryGrid}>
        {!loading && porVer.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay contenidos Por ver con estos filtros.</p>
            <small>Prueba limpiar filtros o agrega una película/serie.</small>
          </div>
        ) : (
          porVer.map((item) => (
            <button
              type="button"
              className={styles.libraryCard}
              key={`${item.apiProvider}-${item.idListaContenido || item.idContenido || item.apiId}`}
              onClick={() => abrirDetalle(item)}
            >
              <div className={styles.posterWrap}>
                {item.posterUrl ? (
                  <img className={styles.libraryPoster} src={item.posterUrl} alt={item.titulo} />
                ) : (
                  <div className={styles.moviePosterEmpty}>{item.titulo}</div>
                )}
                <div className={styles.libraryBadges}>
                  <span className={styles.libraryBadge}>{item.tipoVisual}</span>
                  {item.anioEstreno ? <span className={styles.libraryBadge}>{item.anioEstreno}</span> : null}
                </div>
              </div>

              <div className={styles.libraryCardBody}>
                <h3 className={styles.libraryCardTitle}>{item.titulo}</h3>
                <p className={styles.libraryCardMeta}>
                  {item.tipoVisual} {item.anioEstreno ? `· ${item.anioEstreno}` : ""}
                </p>
                <span className={styles.libraryStatus}>Por ver</span>
                <div className={styles.libraryGenres}>
                  {(item.generos || []).slice(0, 3).map((genero) => (
                    <span key={genero}>{genero}</span>
                  ))}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {loading ? <p className={styles.mutedMessage}>Cargando Por ver...</p> : null}

      {hasMore && !loading ? (
        <div className={styles.loadMoreRow}>
          <button type="button" className={styles.loadMoreBtn} onClick={() => cargarPorVer(page + 1, true)}>
            Cargar más
          </button>
        </div>
      ) : null}

      <Modal open={modalOpen} onClose={cerrarAgregar} size="lg" labelledBy="porVerModalLabel">
        <h3 className={mstyles.modalTitle} id="porVerModalLabel">
          AGREGAR A POR VER
        </h3>
        <p className={styles.modalHint}>
          Agrega contenido pendiente. No se pedirán estrellas ni comentario hasta que lo marques como visto.
        </p>

        <label className={mstyles.formLabel}>BUSCAR PELÍCULA, SERIE O ANIME</label>
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

        <div className={styles.searchResults}>
          {results === null || results === "short" ? (
            <p className={styles.mutedMessage}>
              {results === "short" ? "Escribe al menos 2 letras." : mensaje || "Escribe para buscar."}
            </p>
          ) : results === "loading" ? (
            <p className={styles.mutedMessage}>Buscando...</p>
          ) : results === "error" ? (
            <p className={styles.feedbackMessage}>Error buscando contenido.</p>
          ) : results.length === 0 ? (
            <p className={styles.mutedMessage}>No se encontraron resultados.</p>
          ) : (
            results.map((item, i) => (
              <button
                key={`${item.proveedor}-${item.apiId}-${i}`}
                type="button"
                className={styles.searchResultBtn}
                disabled={guardando}
                onClick={() => agregarPorVer(item)}
              >
                {item.posterUrl ? <img src={item.posterUrl} alt={item.titulo} /> : <div className={styles.posterFallback}></div>}
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

        {mensaje ? <p className={styles.feedbackMessage}>{mensaje}</p> : null}

        <div className={mstyles.modalActions}>
          <button type="button" className={mstyles.btnCancel} onClick={cerrarAgregar}>
            Cerrar
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(detalle)} onClose={cerrarDetalle} size="lg" labelledBy="porVerDetalleModalLabel">
        {detalle ? (
          <div className={styles.detailLayout}>
            <div className={styles.detailPoster}>
              {detalle.posterUrl ? (
                <img src={detalle.posterUrl} alt={detalle.titulo} />
              ) : (
                <div className={styles.moviePosterEmpty}>{detalle.titulo}</div>
              )}
            </div>

            <div className={styles.detailContent}>
              <p className={styles.viewEyebrow}>Pendiente por ver</p>
              <h3 className={mstyles.modalTitle} id="porVerDetalleModalLabel">
                {detalle.titulo}
              </h3>
              <p className={styles.detailMeta}>
                {detalle.tipoVisual} {detalle.anioEstreno ? `· ${detalle.anioEstreno}` : ""}
                {detalle.idioma ? ` · ${detalle.idioma}` : ""}
              </p>

              <div className={styles.detailTags}>
                {(detalle.generos || []).map((genero) => (
                  <span key={genero} className={styles.detailTag}>
                    {genero}
                  </span>
                ))}
              </div>

              <p className={styles.detailDescription}>
                {detalle.descripcion || "Este contenido todavía no tiene descripción guardada."}
              </p>

              {detalleMensaje ? <p className={styles.feedbackMessage}>{detalleMensaje}</p> : null}

              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={mstyles.btnSave}
                  disabled={marcandoVista}
                  onClick={pasarAVistas}
                >
                  {marcandoVista ? "Marcando..." : "Marcar como vista"}
                </button>
                <button type="button" className={mstyles.btnCancel} onClick={cerrarDetalle}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
