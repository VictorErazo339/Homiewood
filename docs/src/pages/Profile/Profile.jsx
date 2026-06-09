import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import {
  actualizarIconoUsuario,
  obtenerResumenSeguimiento,
  listarLogros,
  listarLogrosDestacados,
} from "../../api/usuariosApi.js";
import { avatars } from "../../assets/images.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  normalizarContenidoApi,
  obtenerTagsDelItem,
} from "../../lib/contenido.js";
import { soloFecha } from "../../lib/format.js";
import ProfileBanner from "../../components/profile/ProfileBanner.jsx";
import ProfileHero from "../../components/profile/ProfileHero.jsx";
import ProfileTabs from "../../components/profile/ProfileTabs.jsx";
import AchievementsModal from "../../components/profile/AchievementsModal.jsx";
import Top5Modal from "../../components/profile/Top5Modal.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import mstyles from "../../components/Modal/Modal.module.css";
import styles from "./Profile.module.css";

function estrellas(puntaje) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= puntaje ? "★" : "☆";
  return s;
}

function esPublicacion(c) {
  return c.comentario && String(c.comentario).trim().length > 0;
}

function calcularBioTags(top5, vistas) {
  const base = [...top5.filter(Boolean), ...vistas];
  if (base.length === 0) return [];
  const conteo = {};
  base.forEach((item) => {
    const peso = item.puntaje || 1;
    obtenerTagsDelItem(item).forEach((tag) => {
      conteo[tag] = (conteo[tag] || 0) + peso;
    });
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 5);
}

export default function Profile() {
  const { usuario, actualizarUsuario } = useAuth();
  const idUsuario = usuario?.idUsuario || usuario?.id;

  const [perfil, setPerfil] = useState(usuario);
  const [posts, setPosts] = useState([]);
  const [top5, setTop5] = useState([null, null, null, null, null]);
  const [vistas, setVistas] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [logros, setLogros] = useState([]);
  const [logrosDestacados, setLogrosDestacados] = useState([]);
  const bioTags = calcularBioTags(top5, vistas);

  // Modals
  const [top5Open, setTop5Open] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Profile composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [pQuery, setPQuery] = useState("");
  const [pResults, setPResults] = useState([]);
  const [pSelected, setPSelected] = useState(null);
  const [pText, setPText] = useState("");

  // Edit modal state
  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcono, setEditIcono] = useState(1);
  const [savingPerfil, setSavingPerfil] = useState(false);

  const composerInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Open the edit modal when arriving via the navbar's "Editar perfil" (?edit=1).
  useEffect(() => {
    if (searchParams.get("edit") === "1") {
      abrirEditar();
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ------- loaders ------- */
  const cargarPosts = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const cal = await apiRequest(`/calificaciones/usuario/${idUsuario}`);
      setPosts(cal.filter(esPublicacion).slice().reverse());
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  }, [idUsuario]);

  const cargarTop5 = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const data = await apiRequest(
        `/usuarios/${idUsuario}/listas/contenidos?estado=FAVORITO`
      );
      const arr = [null, null, null, null, null];
      data.forEach((item) => {
        const pos = item.posicion ? item.posicion - 1 : null;
        const normalizado = {
          idListaContenido: item.idListaContenido,
          idLista: item.idLista,
          idContenido: item.idContenido,
          titulo: item.tituloContenido,
          tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
          tipoBackend: item.tipoContenido,
          posterUrl: item.posterUrl,
          anioEstreno: item.anioEstreno,
          apiId: String(item.apiId || item.idContenido),
          proveedor: item.apiProvider || "BD",
          generos: item.generos || [],
        };
        if (pos !== null && pos >= 0 && pos < 5) arr[pos] = normalizado;
      });
      localStorage.setItem(`homiwood_top5_${idUsuario}`, JSON.stringify(arr));
      setTop5(arr);
    } catch (error) {
      console.error("Error cargando Top 5:", error);
    }
  }, [idUsuario]);

  const cargarVistas = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const data = await apiRequest(
        `/usuarios/${idUsuario}/listas/contenidos?estado=VISTO`
      );
      const vs = data.map((item) => ({
        titulo: item.tituloContenido,
        tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
        tipoBackend: item.tipoContenido,
        posterUrl: item.posterUrl,
        anioEstreno: item.anioEstreno,
        generos: item.generos || [],
      }));
      localStorage.setItem(`homiwood_vistas_${idUsuario}`, JSON.stringify(vs));
      setVistas(vs);
    } catch (error) {
      console.error("Error sincronizando vistas:", error);
    }
  }, [idUsuario]);

  useEffect(() => {
    if (!idUsuario) return;
    // Merge fresh user data into header + context.
    apiRequest(`/usuarios/${idUsuario}`)
      .then((u) => {
        const merged = { ...usuario, ...u };
        setPerfil(merged);
        actualizarUsuario(merged);
      })
      .catch((error) => console.error("Error cargando usuario:", error));
    cargarPosts();
    cargarTop5();
    cargarVistas();
    obtenerResumenSeguimiento(idUsuario, idUsuario)
      .then((r) => {
        setSeguidores(r.seguidores ?? 0);
        setSiguiendo(r.siguiendo ?? 0);
      })
      .catch((error) => console.error("Error cargando seguimiento:", error));
    listarLogros(idUsuario)
      .then((l) => setLogros(Array.isArray(l) ? l : []))
      .catch((error) => console.error("Error cargando logros:", error));
    listarLogrosDestacados(idUsuario)
      .then((l) => setLogrosDestacados(Array.isArray(l) ? l : []))
      .catch((error) => console.error("Error cargando logros destacados:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuario]);

  async function quitarDelTop5(index) {
    const item = top5[index];
    if (!item) return;
    if (!confirm(`¿Quitar "${item.titulo}" de tu Top 5?`)) return;
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
      await cargarTop5();
    } catch (error) {
      console.error("Error quitando del Top 5:", error);
      alert("No se pudo quitar del Top 5.");
    }
  }

  /* ------- Profile composer search ------- */
  useEffect(() => {
    if (!composerOpen) return;
    const q = pQuery.trim();
    if (q.length < 2) {
      setPResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await buscarCatalogo(q);
        setPResults(data && data.length ? data.map(normalizarContenidoApi) : []);
      } catch (error) {
        console.error("Error buscando contenido:", error);
        setPResults([]);
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [pQuery, composerOpen]);

  function toggleComposer() {
    setComposerOpen((v) => {
      const next = !v;
      if (next) setTimeout(() => composerInputRef.current?.focus(), 50);
      return next;
    });
  }

  function limpiarComposer() {
    setPSelected(null);
    setPQuery("");
    setPText("");
    setPResults([]);
    setComposerOpen(false);
  }

  async function publicarResena() {
    const comentario = pText.trim();
    if (!pSelected || !comentario) return;
    try {
      const item = pSelected;
      const contenido = await apiRequest("/catalogo/guardar", {
        method: "POST",
        body: JSON.stringify({
          proveedor: item.proveedor,
          apiId: String(item.apiId),
          titulo: item.titulo,
          tipoContenido: item.tipoBackend,
          descripcion: item.descripcion || "",
          fechaEstreno: item.fechaEstreno || null,
          anioEstreno: item.anioEstreno || null,
          posterUrl: item.posterUrl || "",
          idiomaOriginal: item.idioma || "",
          puntajeExterno: item.puntajeExterno || 0,
          generos: item.generos || [],
        }),
      });
      await apiRequest("/calificaciones", {
        method: "POST",
        body: JSON.stringify({
          idUsuario,
          idContenido: contenido.idContenido,
          puntaje: 5,
          comentario,
        }),
      });
      await cargarPosts();
      await cargarVistas();
      limpiarComposer();
    } catch (error) {
      console.error("Error publicando reseña:", error);
      alert("No se pudo publicar la reseña.");
    }
  }

  /* ------- Edit profile ------- */
  function abrirEditar() {
    setEditNombre(perfil?.nombre || "");
    setEditDesc(perfil?.descripcion || "");
    setEditIcono(Number(perfil?.iconoPerfil) || 1);
    setEditOpen(true);
  }

  async function guardarPerfil() {
    const nombre = editNombre.trim();
    const descripcion = editDesc.trim();
    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    setSavingPerfil(true);
    try {
      let actualizado = await apiRequest(`/usuarios/${idUsuario}/perfil`, {
        method: "PUT",
        body: JSON.stringify({ nombre, descripcion }),
      });
      // Persist the icon separately when it changed (dedicated PATCH endpoint).
      if (Number(editIcono) !== Number(perfil?.iconoPerfil || 1)) {
        actualizado = await actualizarIconoUsuario(idUsuario, editIcono);
      }
      const merged = { ...perfil, ...actualizado };
      setPerfil(merged);
      actualizarUsuario(merged);
      setEditOpen(false);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("No se pudo actualizar el perfil.");
    } finally {
      setSavingPerfil(false);
    }
  }

  const top5Vacio = top5.filter(Boolean).length === 0;
  const pCanPost = !!pSelected && pText.trim().length > 0;

  // Header shows up to 3 unlocked featured achievements; the modal lists all.
  const headerLogros = (logrosDestacados.length ? logrosDestacados : logros)
    .filter((l) => l.desbloqueado)
    .slice(0, 3);

  return (
    <>
      <ProfileBanner posterUrl={top5[0]?.posterUrl} />

      <main className={styles.profileContainer}>
        <ProfileHero
          perfil={perfil}
          stats={{ posts: posts.length, seguidores, siguiendo }}
          bioTags={bioTags}
          headerLogros={headerLogros}
          onVerLogros={() => setAchOpen(true)}
          actions={
            <button className={styles.editBtn} type="button" onClick={abrirEditar}>
              ✏️ Editar perfil
            </button>
          }
        />

        {/* TOP 5 */}
        <section className={styles.top5Section} aria-label="Mi Top 5">
          <div className={styles.top5TitleRow}>
            <h2 className={styles.sectionTitle}>
              🎬 <span>MI TOP 5</span>
            </h2>
            <button
              className={styles.editBtn}
              type="button"
              onClick={() => setTop5Open(true)}
            >
              + Agregar al Top 5
            </button>
          </div>

          <div className={styles.top5Grid}>
            {top5Vacio ? (
              <div className={styles.top5EmptyState}>
                <p>Tu Top 5 está vacío.</p>
                <small>Agrega tus películas o series favoritas.</small>
              </div>
            ) : (
              top5.map((item, index) =>
                item ? (
                  <article
                    key={index}
                    className={styles.movieCard}
                    style={{ position: "relative" }}
                  >
                    <span className={styles.top5Rank}>#{index + 1}</span>
                    <button
                      type="button"
                      className={styles.top5RemoveBtn}
                      title="Quitar del Top 5"
                      aria-label={`Quitar ${item.titulo} del Top 5`}
                      onClick={() => quitarDelTop5(index)}
                    >
                      ×
                    </button>
                    {item.posterUrl ? (
                      <img className={styles.moviePoster} src={item.posterUrl} alt={item.titulo} />
                    ) : (
                      <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>
                        {item.titulo}
                      </div>
                    )}
                  </article>
                ) : (
                  <article key={index} className={`${styles.movieCard} ${styles.movieCardEmpty}`}>
                    <span className={styles.top5Rank}>#{index + 1}</span>
                    <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>
                      Vacío
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </section>

        {/* TABS */}
        <ProfileTabs active="hilo" />

        {/* COMPOSER */}
        <section className={styles.profileComposerSection} aria-label="Crear post">
          <div className={styles.composerCard}>
            <button
              className={styles.composerTrigger}
              type="button"
              aria-expanded={composerOpen}
              onClick={toggleComposer}
            >
              <div className={styles.composerIcon} aria-hidden="true">🎥</div>
              <span>¿Qué estás viendo hoy?</span>
            </button>

            <div className={`${styles.composerBody} ${composerOpen ? styles.open : ""}`}>
              <label className={styles.composerLabel}>1. Elige una película o serie</label>

              <div className={styles.filmSearchWrap}>
                <input
                  ref={composerInputRef}
                  type="text"
                  placeholder="🎬 Buscar película o serie..."
                  autoComplete="off"
                  value={pQuery}
                  onChange={(e) => setPQuery(e.target.value)}
                />
                {pResults.length > 0 && (
                  <div className={styles.filmDropdown} role="listbox">
                    {pResults.map((item, i) => (
                      <div
                        key={i}
                        className={styles.filmDropdownItem}
                        onClick={() => {
                          setPSelected(item);
                          setPQuery("");
                          setPResults([]);
                        }}
                      >
                        {item.posterUrl ? (
                          <img className={styles.dropdownPoster} src={item.posterUrl} alt={item.titulo} />
                        ) : (
                          <div className={styles.dropdownPoster}></div>
                        )}
                        <div>
                          <div className={styles.dropdownTitle}>{item.titulo}</div>
                          <div className={styles.dropdownMeta}>
                            {item.tipoVisual} {item.anioEstreno ? `· ${item.anioEstreno}` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pSelected && (
                <div className={`${styles.selectedFilm} ${styles.isVisible}`}>
                  <div
                    className={styles.miniCover}
                    style={
                      pSelected.posterUrl
                        ? { backgroundImage: `url('${pSelected.posterUrl}')` }
                        : undefined
                    }
                  ></div>
                  <div className={styles.selectedFilmBody}>
                    <div className={styles.selectedFilmTitle}>{pSelected.titulo}</div>
                    <div className={styles.selectedFilmMeta}>
                      {pSelected.tipoVisual} {pSelected.anioEstreno ? `· ${pSelected.anioEstreno}` : ""}
                    </div>
                  </div>
                  <button
                    className={styles.removeFilm}
                    type="button"
                    aria-label="Quitar película seleccionada"
                    onClick={() => {
                      setPSelected(null);
                      setPQuery("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <label className={`${styles.composerLabel} mt-3`}>
                2. ¿Qué quieres compartir?
              </label>
              <textarea
                className={styles.profilePostTextarea}
                placeholder="Cuéntale a tus homies..."
                maxLength={500}
                value={pText}
                onChange={(e) => setPText(e.target.value)}
              ></textarea>

              <div className={styles.composerActions}>
                <button type="button" className={mstyles.btnCancel} onClick={limpiarComposer}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={mstyles.btnSave}
                  disabled={!pCanPost}
                  onClick={publicarResena}
                >
                  Postear
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEED */}
        <section className={styles.profileFeed} aria-label="Posts del usuario">
          {posts.length === 0 ? (
            <p className={styles.emptyFeed}>Aún no has publicado nada.</p>
          ) : (
            posts.map((c) => {
              const titulo =
                c.tituloContenido || c.contenidoTitulo || c.titulo || "Contenido";
              const tipo = c.tipoContenido || c.contenidoTipo || "Contenido";
              const poster = c.posterUrl || c.contenidoPosterUrl || "";
              const puntaje = Number(c.puntaje || 0);
              return (
                <article className={styles.postCard} key={c.idCalificacion}>
                  <div
                    className={styles.postCover}
                    style={
                      poster
                        ? { backgroundImage: `url('${poster}')` }
                        : { background: "linear-gradient(135deg,#2a1a4a,#5a2a8a)" }
                    }
                  ></div>
                  <div className={styles.postBody}>
                    <div className={styles.postMovieInfo}>
                      <span className={styles.postMovieTitle}>{titulo}</span>
                      <span className={styles.postMovieMeta}>{tipo}</span>
                    </div>
                    {puntaje > 0 && (
                      <div className={styles.postRating} aria-label={`${puntaje} de 5 estrellas`}>
                        {estrellas(puntaje)}
                      </div>
                    )}
                    <p className={styles.postText}>{c.comentario || ""}</p>
                    <div className={styles.postFooter}>
                      <span className={styles.postDate}>{soloFecha(c.fechaCalificacion)}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* ---------- TOP 5 MODAL ---------- */}
      <Top5Modal
        open={top5Open}
        onClose={() => setTop5Open(false)}
        idUsuario={idUsuario}
        top5={top5}
        onSaved={cargarTop5}
      />

      {/* ---------- ACHIEVEMENTS MODAL ---------- */}
      <AchievementsModal
        open={achOpen}
        onClose={() => setAchOpen(false)}
        idUsuario={idUsuario}
        logros={logros}
        editable
        onDestacadosChange={() => {
          listarLogros(idUsuario)
            .then((l) => setLogros(Array.isArray(l) ? l : []))
            .catch(() => {});
          listarLogrosDestacados(idUsuario)
            .then((l) => setLogrosDestacados(Array.isArray(l) ? l : []))
            .catch(() => {});
        }}
      />

      {/* ---------- EDIT PROFILE MODAL ---------- */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} labelledBy="editModalLabel">
        <h3 className={mstyles.modalTitle} id="editModalLabel">EDITAR PERFIL</h3>

        <label className={mstyles.formLabel}>NOMBRE</label>
        <input
          className={mstyles.formControl}
          type="text"
          maxLength={100}
          placeholder="Tu nombre visible"
          autoComplete="off"
          value={editNombre}
          onChange={(e) => setEditNombre(e.target.value)}
        />

        <label className={`${mstyles.formLabel} mt-2`}>DESCRIPCIÓN</label>
        <textarea
          className={mstyles.formControl}
          maxLength={255}
          rows={4}
          placeholder="Escribe una descripción para tu perfil..."
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
        ></textarea>
        <small style={{ color: "var(--muted)", fontSize: ".75rem" }}>
          {editDesc.length}/255
        </small>

        <label className={`${mstyles.formLabel} mt-2`}>ICONO DE PERFIL</label>
        <div className={styles.iconPicker} role="radiogroup" aria-label="Icono de perfil">
          {avatars.map((src, i) => {
            const n = i + 1;
            const selected = Number(editIcono) === n;
            return (
              <button
                key={n}
                type="button"
                className={`${styles.iconOption} ${selected ? styles.iconOptionSelected : ""}`}
                aria-pressed={selected}
                aria-label={`Icono ${n}`}
                onClick={() => setEditIcono(n)}
              >
                <img src={src} alt={`Icono ${n}`} />
              </button>
            );
          })}
        </div>

        <div className={mstyles.modalActions}>
          <button type="button" className={mstyles.btnCancel} onClick={() => setEditOpen(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className={mstyles.btnSave}
            disabled={savingPerfil}
            onClick={guardarPerfil}
          >
            Guardar cambios
          </button>
        </div>
      </Modal>
    </>
  );
}
