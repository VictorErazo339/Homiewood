import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api/api.js";
import {
  actualizarIconoUsuario,
  obtenerResumenSeguimiento,
  listarLogros,
  listarLogrosDestacados,
} from "../../api/usuariosApi.js";
import { avatars } from "../../assets/images.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { obtenerTagsDelItem } from "../../lib/contenido.js";
import ProfileBanner from "./ProfileBanner.jsx";
import ProfileHero from "./ProfileHero.jsx";
import ProfileTabs from "./ProfileTabs.jsx";
import AchievementsModal from "./AchievementsModal.jsx";
import Top5Modal from "./Top5Modal.jsx";
import Modal from "../Modal/Modal.jsx";
import mstyles from "../Modal/Modal.module.css";
import styles from "../../pages/Profile/Profile.module.css";
import { ProfileChromeContext } from "./ProfileChromeContext.js";

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

// Shared profile-family chrome (banner, header, Top 5, tabs + Top 5/Edit modals)
// used by the Vistas and PorVer pages. The page-specific library section is
// passed as children and can trigger a refresh via ProfileChromeContext.
export default function ProfileChrome({ activeTab, children }) {
  const { usuario, actualizarUsuario } = useAuth();
  const idUsuario = usuario?.idUsuario || usuario?.id;

  const [perfil, setPerfil] = useState(usuario);
  const [postsCount, setPostsCount] = useState(0);
  const [top5, setTop5] = useState([null, null, null, null, null]);
  const [vistas, setVistas] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [logros, setLogros] = useState([]);
  const [logrosDestacados, setLogrosDestacados] = useState([]);
  const bioTags = calcularBioTags(top5, vistas);
  // Header shows up to 3 unlocked featured achievements; the modal lists all.
  const headerLogros = (logrosDestacados.length ? logrosDestacados : logros)
    .filter((l) => l.desbloqueado)
    .slice(0, 3);

  const [top5Open, setTop5Open] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcono, setEditIcono] = useState(1);
  const [savingPerfil, setSavingPerfil] = useState(false);

  const cargarPostsCount = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const cal = await apiRequest(`/calificaciones/usuario/${idUsuario}`);
      setPostsCount(
        cal.filter((c) => c.comentario && String(c.comentario).trim().length > 0).length
      );
    } catch (error) {
      console.error("Error cargando cantidad de posts:", error);
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
        if (pos !== null && pos >= 0 && pos < 5) {
          arr[pos] = {
            idListaContenido: item.idListaContenido,
            idLista: item.idLista,
            idContenido: item.idContenido,
            titulo: item.tituloContenido,
            tipoVisual: item.tipoContenido === "PELICULA" ? "Película" : "Serie",
            posterUrl: item.posterUrl,
            generos: item.generos || [],
          };
        }
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
        posterUrl: item.posterUrl,
        generos: item.generos || [],
      }));
      localStorage.setItem(`homiwood_vistas_${idUsuario}`, JSON.stringify(vs));
      setVistas(vs);
    } catch (error) {
      console.error("Error sincronizando vistas:", error);
    }
  }, [idUsuario]);

  const recargar = useCallback(() => {
    cargarPostsCount();
    cargarTop5();
    cargarVistas();
  }, [cargarPostsCount, cargarTop5, cargarVistas]);

  useEffect(() => {
    if (!idUsuario) return;
    apiRequest(`/usuarios/${idUsuario}`)
      .then((u) => {
        const merged = { ...usuario, ...u };
        setPerfil(merged);
        actualizarUsuario(merged);
      })
      .catch((error) => console.error("Error cargando usuario:", error));
    recargar();
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

  function abrirEditar() {
    setEditNombre(perfil?.nombre || "");
    setEditDesc(perfil?.descripcion || "");
    setEditIcono(Number(perfil?.iconoPerfil) || 1);
    setEditOpen(true);
  }

  async function guardarPerfil() {
    const nombre = editNombre.trim();
    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    setSavingPerfil(true);
    try {
      let actualizado = await apiRequest(`/usuarios/${idUsuario}/perfil`, {
        method: "PUT",
        body: JSON.stringify({ nombre, descripcion: editDesc.trim() }),
      });
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

  return (
    <ProfileChromeContext.Provider value={{ idUsuario, recargar }}>
      <ProfileBanner posterUrl={top5[0]?.posterUrl} />

      <main className={styles.profileContainer}>
        <ProfileHero
          perfil={perfil}
          stats={{ posts: postsCount, seguidores, siguiendo }}
          bioTags={bioTags}
          headerLogros={headerLogros}
          onVerLogros={() => setAchOpen(true)}
          actions={
            <button className={styles.editBtn} type="button" onClick={abrirEditar}>
              ✏️ Editar perfil
            </button>
          }
        />

        <section className={styles.top5Section}>
          <div className={styles.top5TitleRow}>
            <h2 className={styles.sectionTitle}>
              🎬 <span>MI TOP 5</span>
            </h2>
            <button className={styles.editBtn} type="button" onClick={() => setTop5Open(true)}>
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
                  <article key={index} className={styles.movieCard}>
                    <span className={styles.top5Rank}>#{index + 1}</span>
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
                    <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>Vacío</div>
                  </article>
                )
              )
            )}
          </div>
        </section>

        <ProfileTabs active={activeTab} />

        {children}
      </main>

      {/* TOP 5 MODAL */}
      <Top5Modal
        open={top5Open}
        onClose={() => setTop5Open(false)}
        idUsuario={idUsuario}
        top5={top5}
        onSaved={cargarTop5}
      />

      {/* ACHIEVEMENTS MODAL */}
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

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} labelledBy="editModalLabel">
        <h3 className={mstyles.modalTitle} id="editModalLabel">EDITAR PERFIL</h3>
        <label className={mstyles.formLabel}>NOMBRE</label>
        <input
          className={mstyles.formControl}
          type="text"
          maxLength={100}
          placeholder="Tu nombre visible"
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
        <small style={{ color: "var(--muted)", fontSize: ".75rem" }}>{editDesc.length}/255</small>

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
          <button type="button" className={mstyles.btnSave} disabled={savingPerfil} onClick={guardarPerfil}>
            Guardar cambios
          </button>
        </div>
      </Modal>
    </ProfileChromeContext.Provider>
  );
}
