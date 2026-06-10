import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo, guardarYAgregarContenidoEnLista } from "../../api/catalogoApi.js";
import { normalizarContenidoApi, convertirTipoBackend } from "../../lib/contenido.js";
import ProfileChrome from "../../components/profile/ProfileChrome.jsx";
import { useProfileChrome } from "../../components/profile/ProfileChromeContext.js";
import Modal from "../../components/Modal/Modal.jsx";
import mstyles from "../../components/Modal/Modal.module.css";
import pstyles from "../Profile/Profile.module.css";
import styles from "../../styles/library.module.css";

const LIMITE_VISTAS = 30;

const FILTROS_INICIALES = {
  query: "",
  tipo: "",
  genero: "",
  puntaje: "",
  sinPuntaje: false,
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

function normalizarVistaBackend(item) {
  return {
    idListaContenido: item.idListaContenido,
    idLista: item.idLista,
    idContenido: item.idContenido,
    titulo: item.titulo || item.tituloContenido || "Sin título",
    tipoContenido: item.tipoContenido || "SERIE",
    tipoVisual: obtenerTipoVisual(item.tipoContenido),
    descripcion: item.descripcion || "",
    anioEstreno: item.anioEstreno || null,
    fechaEstreno: item.fechaEstreno || null,
    posterUrl: item.posterUrl || "",
    idioma: item.idioma || "",
    apiProvider: item.apiProvider || item.proveedor || "BD",
    apiId: item.apiId || String(item.idContenido || ""),
    estado: item.estado || "VISTO",
    notaUsuario: item.notaUsuario || "",
    fechaAgregado: item.fechaAgregado || null,
    idCalificacion: item.idCalificacion || null,
    puntajeUsuario: item.puntajeUsuario || item.puntaje || 0,
    comentarioUsuario: item.comentarioUsuario || item.comentario || "",
    fechaCalificacion: item.fechaCalificacion || null,
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

function StarsRead({ puntaje }) {
  const valor = Number(puntaje || 0);

  if (valor <= 0) {
    return <small className={styles.mutedMessage}>Sin puntaje</small>;
  }

  return (
    <div className={styles.vistaStarsRead} aria-label={`Puntaje ${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= valor ? styles.starOn : styles.starOff}>
          ★
        </span>
      ))}
      <small>{valor}/5</small>
    </div>
  );
}

function StarsInput({ value, onChange }) {
  return (
    <div className={styles.ratingStars} aria-label="Seleccionar puntaje">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          className={styles.ratingStarBtn}
          aria-label={`${v} estrellas`}
          onClick={() => onChange(v)}
        >
          <span className={v <= Number(value || 0) ? styles.starOn : styles.starOff}>★</span>
        </button>
      ))}
    </div>
  );
}

function VistasSection() {
  const { idUsuario, recargar } = useProfileChrome();

  const [vistas, setVistas] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [detalleRating, setDetalleRating] = useState(0);
  const [detalleComentario, setDetalleComentario] = useState("");
  const [detalleMensaje, setDetalleMensaje] = useState("");
  const [detalleGuardando, setDetalleGuardando] = useState(false);

  const generosDisponibles = useMemo(() => {
    return Array.from(new Set(vistas.flatMap((item) => item.generos || [])))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [vistas]);

  const cargarVistas = useCallback(
    async (targetPage = 0, append = false) => {
      if (!idUsuario) return;

      setLoading(true);
      setErrorCarga("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("limite", String(LIMITE_VISTAS));
        params.set("orden", filtros.orden || "RECIENTES");

        if (normalizarTexto(filtros.query)) params.set("query", normalizarTexto(filtros.query));
        if (normalizarTexto(filtros.tipo)) params.set("tipo", normalizarTexto(filtros.tipo));
        if (normalizarTexto(filtros.genero)) params.set("genero", normalizarTexto(filtros.genero));
        if (normalizarTexto(filtros.puntaje)) params.set("puntaje", normalizarTexto(filtros.puntaje));
        if (normalizarTexto(filtros.anio)) params.set("anio", normalizarTexto(filtros.anio));
        if (filtros.sinPuntaje) params.set("sinPuntaje", "true");

        const data = await apiRequest(`/listas/usuario/${idUsuario}/vistas?${params.toString()}`);
        const normalizadas = Array.isArray(data) ? data.map(normalizarVistaBackend) : [];

        setVistas((prev) => (append ? dedupe([...prev, ...normalizadas]) : normalizadas));
        setPage(targetPage);
        setHasMore(normalizadas.length === LIMITE_VISTAS);
      } catch (error) {
        console.error("Error cargando vistas:", error);
        setErrorCarga("No se pudieron cargar tus vistas. Revisa que el backend tenga el endpoint de vistas.");
      } finally {
        setLoading(false);
      }
    },
    [idUsuario, filtros]
  );

  useEffect(() => {
    const timeout = setTimeout(() => cargarVistas(0, false), 280);
    return () => clearTimeout(timeout);
  }, [cargarVistas]);

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

  function actualizarFiltro(nombre, valor) {
    setFiltros((prev) => ({
      ...prev,
      [nombre]: valor,
      ...(nombre === "sinPuntaje" && valor ? { puntaje: "" } : {}),
      ...(nombre === "puntaje" && valor ? { sinPuntaje: false } : {}),
    }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
  }

  function cerrarAgregar() {
    setModalOpen(false);
    setQuery("");
    setResults(null);
    setSelected(null);
    setRating(0);
    setComentario("");
    setMensaje("");
    setGuardando(false);
  }

  async function obtenerIdListaVistas() {
    const listas = await apiRequest(`/listas/usuario/${idUsuario}`);
    const existente = Array.isArray(listas)
      ? listas.find((lista) => String(lista.titulo || "").toLowerCase() === "vistas")
      : null;

    if (existente?.idLista) return existente.idLista;

    const nueva = await apiRequest("/listas", {
      method: "POST",
      body: JSON.stringify({
        idUsuario,
        titulo: "Vistas",
        descripcion: "Lista automática de Vistas",
        visibilidad: "PUBLICA",
      }),
    });

    return nueva.idLista;
  }

  async function agregarVista() {
    if (!selected || rating < 1 || !idUsuario) return;

    setGuardando(true);
    setMensaje("");

    try {
      const item = selected;
      const tipoBackend = obtenerTipoBackend(item);
      const idLista = await obtenerIdListaVistas();

      const guardado = await guardarYAgregarContenidoEnLista(idLista, {
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
        estado: "VISTO",
        generos: normalizarGeneros(item, tipoBackend),
      });

      const idContenido = guardado.idContenido || guardado.contenido?.idContenido || item.idContenido;

      if (!idContenido) {
        throw new Error("No se recibió idContenido al guardar la vista.");
      }

      await apiRequest("/calificaciones", {
        method: "POST",
        body: JSON.stringify({
          idUsuario,
          idContenido,
          puntaje: rating,
          comentario: comentario.trim() || null,
        }),
      });

      setMensaje(
        comentario.trim()
          ? "Guardado como vista y publicado con comentario."
          : `Guardado como vista con ${rating}/5 estrellas.`
      );
      setSelected(null);
      setRating(0);
      setComentario("");
      setQuery("");
      setResults(null);
      await cargarVistas(0, false);
      recargar?.();
    } catch (error) {
      console.error("Error guardando vista:", error);
      setMensaje("No se pudo guardar la vista.");
    } finally {
      setGuardando(false);
    }
  }

  function abrirDetalle(item) {
    setDetalle(item);
    setDetalleRating(Number(item.puntajeUsuario || 0));
    setDetalleComentario(item.comentarioUsuario || "");
    setDetalleMensaje("");
  }

  function cerrarDetalle() {
    setDetalle(null);
    setDetalleRating(0);
    setDetalleComentario("");
    setDetalleMensaje("");
    setDetalleGuardando(false);
  }

  async function guardarDetalle() {
    if (!detalle || detalleRating < 1 || !idUsuario) return;

    setDetalleGuardando(true);
    setDetalleMensaje("");

    try {
      await apiRequest("/calificaciones", {
        method: "POST",
        body: JSON.stringify({
          idUsuario,
          idContenido: detalle.idContenido,
          puntaje: detalleRating,
          comentario: detalleComentario.trim() || null,
        }),
      });

      setDetalleMensaje(
        detalleComentario.trim()
          ? "Puntaje actualizado y comentario publicado."
          : "Puntaje actualizado sin publicar comentario."
      );

      await cargarVistas(0, false);
      recargar?.();
    } catch (error) {
      console.error("Error actualizando vista:", error);
      setDetalleMensaje("No se pudo actualizar esta vista.");
    } finally {
      setDetalleGuardando(false);
    }
  }

  return (
    <section className={styles.moviesViewSection}>
      <div className={styles.viewTitleRow}>
        <div>
          <p className={styles.viewEyebrow}>Biblioteca personal</p>
          <h2 className={styles.viewTitle}>Películas y series vistas</h2>
          <p className={styles.viewSubtitle}>
            Filtra por género, tipo, año y estrellas. Tu puntaje ayuda a mejorar las recomendaciones.
          </p>
        </div>

        <button type="button" className={pstyles.editBtn} onClick={() => setModalOpen(true)}>
          + Agregar vista
        </button>
      </div>

      <div className={styles.libraryToolbar}>
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
          <span>Estrellas</span>
          <select
            className={styles.filterSelect}
            value={filtros.puntaje}
            onChange={(e) => actualizarFiltro("puntaje", e.target.value)}
          >
            <option value="">Todas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
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
            <option value="MEJOR_CALIFICADAS">Mejor calificadas</option>
            <option value="PEOR_CALIFICADAS">Peor calificadas</option>
            <option value="TITULO_ASC">Título A-Z</option>
            <option value="TITULO_DESC">Título Z-A</option>
            <option value="ANIO_DESC">Año nuevo</option>
            <option value="ANIO_ASC">Año antiguo</option>
          </select>
        </label>

        <label className={styles.checkboxFilter}>
          <input
            type="checkbox"
            checked={filtros.sinPuntaje}
            onChange={(e) => actualizarFiltro("sinPuntaje", e.target.checked)}
          />
          Sin puntaje
        </label>

        <button type="button" className={styles.clearFiltersBtn} onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {errorCarga ? <p className={styles.feedbackMessage}>{errorCarga}</p> : null}

      <div className={styles.movieLibraryGrid}>
        {!loading && vistas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay vistas con estos filtros.</p>
            <small>Prueba limpiar filtros o agrega una película/serie vista.</small>
          </div>
        ) : (
          vistas.map((item) => (
            <button
              type="button"
              className={styles.libraryCard}
              key={`${item.apiProvider}-${item.idContenido}`}
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
                <span className={styles.libraryStatus}>Vista</span>
                <StarsRead puntaje={item.puntajeUsuario} />
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

      {loading ? <p className={styles.mutedMessage}>Cargando vistas...</p> : null}

      {hasMore && !loading ? (
        <div className={styles.loadMoreRow}>
          <button type="button" className={styles.loadMoreBtn} onClick={() => cargarVistas(page + 1, true)}>
            Cargar más
          </button>
        </div>
      ) : null}

      <Modal open={modalOpen} onClose={cerrarAgregar} size="lg" labelledBy="vistasModalLabel">
        <h3 className={mstyles.modalTitle} id="vistasModalLabel">
          AGREGAR A VISTAS
        </h3>
        <p className={styles.modalHint}>
          Si solo calificas, se guarda en Vistas. Si escribes comentario, también aparecerá como publicación.
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
            setSelected(null);
            setMensaje("");
          }}
        />

        <div className={styles.searchResults}>
          {selected ? (
            <div className={styles.addSelectedBox}>
              <div className={styles.addSelectedHeader}>
                {selected.posterUrl ? (
                  <img src={selected.posterUrl} alt={selected.titulo} />
                ) : (
                  <div className={styles.posterFallback}></div>
                )}
                <div>
                  <strong>{selected.titulo}</strong>
                  <small>
                    {selected.tipoVisual} {selected.anioEstreno ? `· ${selected.anioEstreno}` : ""}
                  </small>
                  {selected.descripcion ? <p>{selected.descripcion}</p> : null}
                </div>
              </div>

              <label className={styles.ratingBox}>
                <span>Tu puntaje</span>
                <StarsInput value={rating} onChange={setRating} />
                <small>{rating > 0 ? `${rating}/5 estrellas` : "Selecciona de 1 a 5 estrellas."}</small>
              </label>

              <label className={styles.commentBox}>
                <span>Comentario opcional</span>
                <textarea
                  value={comentario}
                  maxLength={1000}
                  placeholder="Si escribes aquí, se publicará en tu feed. Si lo dejas vacío, solo se guarda como vista."
                  onChange={(e) => setComentario(e.target.value)}
                />
                <small>{comentario.length}/1000</small>
              </label>

              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={mstyles.btnSave}
                  disabled={rating < 1 || guardando}
                  onClick={agregarVista}
                >
                  {guardando ? "Guardando..." : comentario.trim() ? "Guardar y publicar" : "Guardar como vista"}
                </button>
                <button type="button" className={mstyles.btnCancel} onClick={() => setSelected(null)}>
                  Volver a resultados
                </button>
              </div>
            </div>
          ) : results === null || results === "short" ? (
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
                onClick={() => setSelected(item)}
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

      <Modal open={Boolean(detalle)} onClose={cerrarDetalle} size="lg" labelledBy="vistaDetalleModalLabel">
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
              <p className={styles.viewEyebrow}>Vista guardada</p>
              <h3 className={mstyles.modalTitle} id="vistaDetalleModalLabel">
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

              <label className={styles.ratingBox}>
                <span>Tu puntaje</span>
                <StarsInput value={detalleRating} onChange={setDetalleRating} />
                <small>{detalleRating > 0 ? `${detalleRating}/5 estrellas` : "Selecciona un puntaje."}</small>
              </label>

              <label className={styles.commentBox}>
                <span>Comentario opcional</span>
                <textarea
                  value={detalleComentario}
                  maxLength={1000}
                  placeholder="Vacío = solo vista. Con texto = publicación en el feed."
                  onChange={(e) => setDetalleComentario(e.target.value)}
                />
                <small>{detalleComentario.length}/1000</small>
              </label>

              {detalleMensaje ? <p className={styles.feedbackMessage}>{detalleMensaje}</p> : null}

              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={mstyles.btnSave}
                  disabled={detalleRating < 1 || detalleGuardando}
                  onClick={guardarDetalle}
                >
                  {detalleGuardando ? "Guardando..." : "Actualizar"}
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

export default function Vistas() {
  return (
    <ProfileChrome activeTab="vistas">
      <VistasSection />
    </ProfileChrome>
  );
}
