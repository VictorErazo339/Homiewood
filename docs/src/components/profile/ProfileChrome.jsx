import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../api/api.js";
import {
  actualizarIconoUsuario,
  actualizarPerfilUsuario,
  obtenerPerfilResumen,
  listarLogros,
} from "../../api/usuariosApi.js";
import { avatars } from "../../assets/images.js";
import top5Icon from "../../assets/img/TOP5LIST(noglow).webp";
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


const DEFAULT_PROFILE_PREFS = {
  coverMode: "top1",
  colorTheme: "yellow",
};

const PROFILE_COLOR_THEMES = [
  {
    id: "yellow",
    label: "Predeterminado",
    note: "Dorado Homiewood",
    swatches: ["#FFD213", "#E8B94F", "#FFF0A3"],
    vars: {
      "--gold": "#FFD213",
      "--gold-dim": "#E8B94F",
      "--gold-glow": "rgba(255, 210, 19, 0.28)",
      "--gold-tint": "rgba(255, 210, 19, 0.11)",
      "--profile-accent-rgb": "255, 210, 19",
      "--profile-accent-2": "#FFF0A3",
      "--on-accent": "#1D1500",
    },
  },
  {
    id: "crimson",
    label: "Rojo cine",
    note: "Oscuro intenso / claro cálido",
    swatches: ["#C4192D", "#85040E", "#65080C", "#450205", "#080808"],
    lightSwatches: ["#65080C", "#862B0F", "#FF3D00", "#FFFCEB", "#B8B8B8"],
    vars: {
      "--gold": "#C4192D",
      "--gold-dim": "#C4192D",
      "--gold-glow": "rgba(196, 25, 45, 0.34)",
      "--gold-tint": "rgba(196, 25, 45, 0.13)",
      "--profile-accent-rgb": "196, 25, 45",
      "--profile-accent-2": "#85040E",
      "--on-accent": "#FFFCEB",
    },
    lightVars: {
      "--gold": "#65080C",
      "--gold-dim": "#862B0F",
      "--gold-glow": "rgba(255, 61, 0, 0.22)",
      "--gold-tint": "rgba(255, 61, 0, 0.10)",
      "--profile-accent-rgb": "101, 8, 12",
      "--profile-accent-2": "#FF3D00",
      "--on-accent": "#FFFCEB",
    },
  },
  {
    id: "blue",
    label: "Azul",
    note: "Cine nocturno",
    swatches: ["#68A2EB", "#4CD5D7", "#102225"],
    vars: {
      "--gold": "#68A2EB",
      "--gold-dim": "#9AC7FF",
      "--gold-glow": "rgba(104, 162, 235, 0.30)",
      "--gold-tint": "rgba(104, 162, 235, 0.12)",
      "--profile-accent-rgb": "104, 162, 235",
      "--profile-accent-2": "#4CD5D7",
      "--on-accent": "#06111F",
    },
  },
  {
    id: "pink",
    label: "Rosado",
    note: "Romance pop",
    swatches: ["#E23FC9", "#FF8FCF", "#2B0B35"],
    vars: {
      "--gold": "#FF8FCF",
      "--gold-dim": "#E23FC9",
      "--gold-glow": "rgba(226, 63, 201, 0.32)",
      "--gold-tint": "rgba(255, 143, 207, 0.13)",
      "--profile-accent-rgb": "255, 143, 207",
      "--profile-accent-2": "#E23FC9",
      "--on-accent": "#23061E",
    },
  },
  {
    id: "purple",
    label: "Morado",
    note: "Celestial dreams",
    swatches: ["#C3A9E0", "#4C9AB2", "#281E76"],
    vars: {
      "--gold": "#C3A9E0",
      "--gold-dim": "#4C9AB2",
      "--gold-glow": "rgba(195, 169, 224, 0.31)",
      "--gold-tint": "rgba(195, 169, 224, 0.13)",
      "--profile-accent-rgb": "195, 169, 224",
      "--profile-accent-2": "#4C9AB2",
      "--on-accent": "#140F30",
    },
  },
  {
    id: "neon",
    label: "Neón",
    note: "Ciudad cyber",
    swatches: ["#4CD5D7", "#C231C9", "#100225"],
    vars: {
      "--gold": "#4CD5D7",
      "--gold-dim": "#C231C9",
      "--gold-glow": "rgba(76, 213, 215, 0.34)",
      "--gold-tint": "rgba(194, 49, 201, 0.13)",
      "--profile-accent-rgb": "76, 213, 215",
      "--profile-accent-2": "#C231C9",
      "--on-accent": "#031D22",
    },
  },
  {
    id: "sunset",
    label: "Amanecer",
    note: "Pastel cálido",
    swatches: ["#2A1738", "#B89494", "#E7D2C7"],
    vars: {
      "--gold": "#E7B6C2",
      "--gold-dim": "#B89494",
      "--gold-glow": "rgba(231, 182, 194, 0.30)",
      "--gold-tint": "rgba(231, 182, 194, 0.13)",
      "--profile-accent-rgb": "231, 182, 194",
      "--profile-accent-2": "#E7D2C7",
      "--on-accent": "#281620",
    },
  },
  {
    id: "mint",
    label: "Menta",
    note: "Verde glass",
    swatches: ["#043D34", "#77B694", "#A6CBB6"],
    vars: {
      "--gold": "#A6CBB6",
      "--gold-dim": "#77B694",
      "--gold-glow": "rgba(166, 203, 182, 0.30)",
      "--gold-tint": "rgba(166, 203, 182, 0.13)",
      "--profile-accent-rgb": "166, 203, 182",
      "--profile-accent-2": "#77B694",
      "--on-accent": "#06231D",
    },
  },
  {
    id: "sage",
    label: "Verde suave",
    note: "Calma elegante",
    swatches: ["#B6D9CD", "#88B9A0", "#254C45"],
    vars: {
      "--gold": "#B6D9CD",
      "--gold-dim": "#88B9A0",
      "--gold-glow": "rgba(182, 217, 205, 0.30)",
      "--gold-tint": "rgba(182, 217, 205, 0.13)",
      "--profile-accent-rgb": "182, 217, 205",
      "--profile-accent-2": "#88B9A0",
      "--on-accent": "#08251F",
    },
  },
];

function detectarModoVisual() {
  if (typeof document === "undefined") return "dark";

  const root = document.documentElement;
  const body = document.body;
  const tokens = [
    root?.dataset?.theme,
    root?.dataset?.bsTheme,
    root?.dataset?.colorMode,
    body?.dataset?.theme,
    body?.dataset?.bsTheme,
    body?.dataset?.colorMode,
    root?.className,
    body?.className,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (tokens.includes("light") || tokens.includes("claro") || tokens.includes("dia")) return "light";
  if (tokens.includes("dark") || tokens.includes("oscuro") || tokens.includes("noche")) return "dark";

  try {
    const keys = ["theme", "tema", "appearance", "modo", "colorMode", "homiwood_theme"];
    const stored = keys
      .map((key) => window.localStorage.getItem(key))
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (stored.includes("light") || stored.includes("claro") || stored.includes("dia")) return "light";
    if (stored.includes("dark") || stored.includes("oscuro") || stored.includes("noche")) return "dark";
  } catch {
    // El modo visual no es crítico; se usa el color de fondo como respaldo.
  }

  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const brillo = (r * 299 + g * 587 + b * 114) / 1000;
      return brillo > 150 ? "light" : "dark";
    }
  } catch {
    // Sin fondo detectable, se conserva oscuro porque Homiewood usa dark como base.
  }

  return "dark";
}

function getProfilePrefsKey(idUsuario) {
  return `homiwood_profile_prefs_${idUsuario}`;
}

function normalizarProfilePrefs(value) {
  const coverMode = typeof value?.coverMode === "string" ? value.coverMode : DEFAULT_PROFILE_PREFS.coverMode;
  const coverModeValido = coverMode === "none" || /^top[1-5]$/.test(coverMode);

  return {
    coverMode: coverModeValido ? coverMode : DEFAULT_PROFILE_PREFS.coverMode,
    colorTheme: PROFILE_COLOR_THEMES.some((theme) => theme.id === value?.colorTheme)
      ? value.colorTheme
      : DEFAULT_PROFILE_PREFS.colorTheme,
  };
}

function leerProfilePrefs(idUsuario) {
  if (!idUsuario || typeof window === "undefined") return DEFAULT_PROFILE_PREFS;

  try {
    const raw = window.localStorage.getItem(getProfilePrefsKey(idUsuario));
    return normalizarProfilePrefs(raw ? JSON.parse(raw) : DEFAULT_PROFILE_PREFS);
  } catch {
    return DEFAULT_PROFILE_PREFS;
  }
}

function guardarProfilePrefs(idUsuario, prefs) {
  const normalizadas = normalizarProfilePrefs(prefs);

  if (idUsuario && typeof window !== "undefined") {
    window.localStorage.setItem(getProfilePrefsKey(idUsuario), JSON.stringify(normalizadas));
  }

  return normalizadas;
}

function obtenerIndicePortada(coverMode) {
  if (typeof coverMode !== "string") return 0;
  const match = coverMode.match(/^top([1-5])$/);
  return match ? Number(match[1]) - 1 : -1;
}

function crearGradientPaleta(colors = []) {
  const validColors = colors.filter(Boolean);
  if (!validColors.length) return "transparent";

  const step = 100 / validColors.length;
  return `linear-gradient(90deg, ${validColors
    .map((color, index) => `${color} ${index * step}% ${(index + 1) * step}%`)
    .join(", ")})`;
}

function obtenerProfileTheme(id, appearanceMode = "dark") {
  const theme = PROFILE_COLOR_THEMES.find((item) => item.id === id) || PROFILE_COLOR_THEMES[0];

  if (appearanceMode === "light" && theme.lightVars) {
    return {
      ...theme,
      vars: {
        ...theme.vars,
        ...theme.lightVars,
      },
    };
  }

  return theme;
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

export default function ProfileChrome({ activeTab, children }) {
  const { usuario, actualizarUsuario } = useAuth();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const idUsuarioLogueado = usuario?.idUsuario || usuario?.id;
  const idDesdeRuta =
    params.idUsuario ||
    params.usuarioId ||
    params.userId ||
    params.id ||
    searchParams.get("idUsuario") ||
    searchParams.get("usuarioId") ||
    searchParams.get("userId") ||
    searchParams.get("id");

  const idUsuario = Number(idDesdeRuta || idUsuarioLogueado);
  const esMiPerfil = Number(idUsuario) === Number(idUsuarioLogueado);

  const [perfil, setPerfil] = useState(usuario);
  const [postsCount, setPostsCount] = useState(0);
  const [top5, setTop5] = useState([null, null, null, null, null]);
  const [vistas, setVistas] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);

  const [logros, setLogros] = useState([]);
  const [logrosDestacados, setLogrosDestacados] = useState([]);
  const [logrosCargados, setLogrosCargados] = useState(false);

  const [top5Open, setTop5Open] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcono, setEditIcono] = useState(1);
  const [profilePrefs, setProfilePrefs] = useState(DEFAULT_PROFILE_PREFS);
  const [editCoverMode, setEditCoverMode] = useState(DEFAULT_PROFILE_PREFS.coverMode);
  const [editColorTheme, setEditColorTheme] = useState(DEFAULT_PROFILE_PREFS.colorTheme);

  const [appearanceMode, setAppearanceMode] = useState(() => detectarModoVisual());

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const actualizarModoVisual = () => setAppearanceMode(detectarModoVisual());
    actualizarModoVisual();

    const observer = new MutationObserver(actualizarModoVisual);
    const observerConfig = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-bs-theme", "data-color-mode"],
    };

    observer.observe(document.documentElement, observerConfig);
    if (document.body) observer.observe(document.body, observerConfig);

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: light)");
    mediaQuery?.addEventListener?.("change", actualizarModoVisual);
    window.addEventListener("storage", actualizarModoVisual);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.("change", actualizarModoVisual);
      window.removeEventListener("storage", actualizarModoVisual);
    };
  }, []);
  const [savingPerfil, setSavingPerfil] = useState(false);

  const bioTags = calcularBioTags(top5, vistas);

  const headerLogros = logrosDestacados
    .filter((l) => l.desbloqueado)
    .slice(0, 3);

  const cargarPerfilResumen = useCallback(async () => {
    if (!idUsuario) return;

    try {
      const resumen = await obtenerPerfilResumen(idUsuario);

      const perfilActualizado = {
        ...(esMiPerfil ? usuario : {}),
        idUsuario: resumen.idUsuario || idUsuario,
        id: resumen.idUsuario || idUsuario,
        nombre: resumen.nombre,
        username: resumen.username,
        descripcion: resumen.descripcion,
        iconoPerfil: resumen.iconoPerfil,
        perfilPrivado: resumen.perfilPrivado,
        temaPerfil: resumen.temaPerfil || DEFAULT_PROFILE_PREFS.colorTheme,
        portadaPerfil: resumen.portadaPerfil || DEFAULT_PROFILE_PREFS.coverMode,
      };

      setPerfil(perfilActualizado);
      if (esMiPerfil) {
        actualizarUsuario(perfilActualizado);
      }

      setProfilePrefs(normalizarProfilePrefs({
        colorTheme: perfilActualizado.temaPerfil,
        coverMode: perfilActualizado.portadaPerfil,
      }));

      setPostsCount(resumen.cantidadPosts ?? 0);
      setSeguidores(resumen.cantidadSeguidores ?? 0);
      setSiguiendo(resumen.cantidadSiguiendo ?? 0);
      setLogrosDestacados(
        Array.isArray(resumen.logrosDestacados)
          ? resumen.logrosDestacados
          : []
      );
    } catch (error) {
      console.error("Error cargando resumen de perfil:", error);
    }
  }, [idUsuario, usuario, actualizarUsuario, esMiPerfil]);

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
            tipoBackend: item.tipoContenido,
            posterUrl: item.posterUrl,
            anioEstreno: item.anioEstreno,
            apiId: String(item.apiId || item.idContenido),
            proveedor: item.apiProvider || "BD",
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
    cargarPerfilResumen();
    cargarTop5();
    cargarVistas();
  }, [cargarPerfilResumen, cargarTop5, cargarVistas]);

  useEffect(() => {
    if (!idUsuario) return;

    recargar();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuario]);

  useEffect(() => {
    setProfilePrefs(normalizarProfilePrefs({
      colorTheme: perfil?.temaPerfil,
      coverMode: perfil?.portadaPerfil,
    }));
  }, [perfil?.temaPerfil, perfil?.portadaPerfil]);

  const profileTheme = obtenerProfileTheme(profilePrefs.colorTheme, appearanceMode);
  const profileThemeStyle = profileTheme.vars;
  const profileCoverIndex = obtenerIndicePortada(profilePrefs.coverMode);
  const profileCoverPoster = profileCoverIndex >= 0 ? top5[profileCoverIndex]?.posterUrl : null;

  function abrirEditar() {
    if (!esMiPerfil) return;

    setEditNombre(perfil?.nombre || "");
    setEditDesc(perfil?.descripcion || "");
    setEditIcono(Number(perfil?.iconoPerfil) || 1);
    setEditCoverMode(profilePrefs.coverMode);
    setEditColorTheme(profilePrefs.colorTheme);
    setEditOpen(true);
  }

  async function abrirLogros() {
    setAchOpen(true);

    if (logrosCargados || !idUsuario) return;

    try {
      const data = await listarLogros(idUsuario);
      setLogros(Array.isArray(data) ? data : []);
      setLogrosCargados(true);
    } catch (error) {
      console.error("Error cargando logros:", error);
    }
  }

  async function guardarPerfil() {
    if (!esMiPerfil) return;

    const nombre = editNombre.trim();

    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    setSavingPerfil(true);

    try {
      let actualizado = await actualizarPerfilUsuario(idUsuario, {
        nombre,
        descripcion: editDesc.trim(),
        temaPerfil: editColorTheme,
        portadaPerfil: editCoverMode,
      });

      if (Number(editIcono) !== Number(perfil?.iconoPerfil || 1)) {
        actualizado = await actualizarIconoUsuario(idUsuario, editIcono);
      }

      const nextPrefs = normalizarProfilePrefs({
        colorTheme: actualizado.temaPerfil || editColorTheme,
        coverMode: actualizado.portadaPerfil || editCoverMode,
      });

      setProfilePrefs(nextPrefs);

      const merged = {
        ...perfil,
        ...actualizado,
        temaPerfil: nextPrefs.colorTheme,
        portadaPerfil: nextPrefs.coverMode,
      };

      setPerfil(merged);
      actualizarUsuario(merged);
      setEditOpen(false);

      await cargarPerfilResumen();
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("No se pudo actualizar el perfil.");
    } finally {
      setSavingPerfil(false);
    }
  }

  async function quitarDelTop5(index) {
    if (!esMiPerfil) return;

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
      await cargarPerfilResumen();
    } catch (error) {
      console.error("Error quitando del Top 5:", error);
      alert("No se pudo quitar del Top 5.");
    }
  }

  const top5Vacio = top5.filter(Boolean).length === 0;

  return (
    <ProfileChromeContext.Provider value={{ idUsuario, recargar, esMiPerfil }}>
      <div
        className={styles.profileShell}
        style={profileThemeStyle}
        data-cover-mode={profilePrefs.coverMode}
        data-color-theme={profilePrefs.colorTheme}
      >
        <ProfileBanner posterUrl={profileCoverPoster} />

      <main className={styles.profileContainer}>
        <ProfileHero
          perfil={perfil}
          stats={{ posts: postsCount, seguidores, siguiendo }}
          bioTags={bioTags}
          headerLogros={headerLogros}
          onVerLogros={abrirLogros}
          actions={
            esMiPerfil ? (
              <button
                className={styles.editBtn}
                type="button"
                onClick={abrirEditar}
              >
                ✏️ Editar perfil
              </button>
            ) : null
          }
        />

        <section className={styles.top5Section}>
          <div className={styles.top5TitleRow}>
            <h2 className={styles.sectionTitle}>
              <img
                className={styles.top5TitleIcon}
                src={top5Icon}
                alt=""
                aria-hidden="true"
              />
              <span>MI TOP 5</span>
            </h2>

            {esMiPerfil && (
              <button
                className={styles.editBtn}
                type="button"
                onClick={() => setTop5Open(true)}
              >
                + Agregar al Top 5
              </button>
            )}
          </div>

          <div className={`${styles.top5Grid} ${top5Vacio ? styles.top5GridEmpty : ""}`}>
            {top5Vacio ? (
              <div className={styles.top5EmptyState}>
                <p>Tu Top 5 está vacío.</p>
                <small>Agrega tus películas o series favoritas.</small>
              </div>
            ) : (
              top5.map((item, index) =>
                item ? (
                  <article key={index} className={styles.movieCard} data-title={item.titulo}>
                    <span className={styles.top5Rank}>#{index + 1}</span>

                    {esMiPerfil && (
                      <button
                        type="button"
                        className={styles.top5RemoveBtn}
                        title="Quitar del Top 5"
                        aria-label={`Quitar ${item.titulo} del Top 5`}
                        onClick={(event) => {
                          event.stopPropagation();
                          quitarDelTop5(index);
                        }}
                      >
                        ×
                      </button>
                    )}

                    {item.posterUrl ? (
                      <img
                        className={styles.moviePoster}
                        src={item.posterUrl}
                        alt={item.titulo}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    ) : (
                      <div
                        className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}
                      >
                        {item.titulo}
                      </div>
                    )}

                    <div className={styles.top5CardOverlay}>
                      <strong>{item.titulo}</strong>
                      <small>
                        {item.tipoVisual} {item.anioEstreno ? `· ${item.anioEstreno}` : ""}
                      </small>
                    </div>
                  </article>
                ) : (
                  <article
                    key={index}
                    className={`${styles.movieCard} ${styles.movieCardEmpty}`}
                  >
                    <span className={styles.top5Rank}>#{index + 1}</span>
                    <div
                      className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}
                    >
                      Vacío
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </section>

        <ProfileTabs active={activeTab} />

        {children}
      </main>

      {esMiPerfil && (
        <Top5Modal
          open={top5Open}
          onClose={() => setTop5Open(false)}
          idUsuario={idUsuario}
          top5={top5}
          onSaved={async () => {
            await cargarTop5();
            await cargarPerfilResumen();
          }}
        />
      )}

      <AchievementsModal
        open={achOpen}
        onClose={() => setAchOpen(false)}
        idUsuario={idUsuario}
        logros={logros}
        editable={esMiPerfil}
        onDestacadosChange={() => {
          listarLogros(idUsuario)
            .then((l) => {
              setLogros(Array.isArray(l) ? l : []);
              setLogrosCargados(true);
            })
            .catch(() => {});

          cargarPerfilResumen();
        }}
      />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        labelledBy="editModalLabel"
      >
        <h3 className={mstyles.modalTitle} id="editModalLabel">
          EDITAR PERFIL
        </h3>

        <p className={styles.editModalIntro}>
          Ajusta tus datos, portada e identidad visual. Estos cambios solo están disponibles en tu propio perfil.
        </p>

        <div className={styles.editModalScroll}>
          <section className={styles.editModalSection}>
            <div className={styles.editModalSectionHead}>
              <span className={styles.editModalStep}>01</span>
              <div>
                <h4>Datos básicos</h4>
                <p>Nombre visible y descripción corta para tu perfil.</p>
              </div>
            </div>

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
            />

            <small className={styles.editCounter}>{editDesc.length}/255</small>
          </section>

          <section className={styles.editModalSection}>
            <div className={styles.editModalSectionHead}>
              <span className={styles.editModalStep}>02</span>
              <div>
                <h4>Portada del perfil</h4>
                <p>Elige una portada de tu Top 5 como fondo difuminado, o usa el fondo base.</p>
              </div>
            </div>

            <div className={styles.coverOptions} role="radiogroup" aria-label="Portada del perfil">
              {top5.map((item, index) => {
                const coverId = `top${index + 1}`;
                const selected = editCoverMode === coverId;
                const disponible = Boolean(item?.posterUrl);

                return (
                  <button
                    key={coverId}
                    type="button"
                    className={`${styles.coverOption} ${selected ? styles.coverOptionSelected : ""}`}
                    aria-pressed={selected}
                    disabled={!disponible}
                    onClick={() => disponible && setEditCoverMode(coverId)}
                  >
                    <span className={styles.coverPreview}>
                      {disponible ? (
                        <img src={item.posterUrl} alt={`Portada del Top ${index + 1}`} />
                      ) : (
                        <span className={styles.coverPreviewEmpty}>TOP {index + 1}</span>
                      )}
                      <span className={styles.coverPreviewRank}>#{index + 1}</span>
                    </span>
                    <span>
                      <strong>Usar Top #{index + 1}</strong>
                      <small>{item?.titulo || "Sin contenido en esta posición."}</small>
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`${styles.coverOption} ${styles.coverOptionNoCover} ${editCoverMode === "none" ? styles.coverOptionSelected : ""}`}
                aria-pressed={editCoverMode === "none"}
                onClick={() => setEditCoverMode("none")}
              >
                <span className={`${styles.coverPreview} ${styles.coverPreviewNeutral}`}>
                  <span></span>
                </span>
                <span>
                  <strong>Sin portada</strong>
                  <small>Usa el fondo base, como cuando no tienes Top 5.</small>
                </span>
              </button>
            </div>
          </section>

          <section className={styles.editModalSection}>
            <div className={styles.editModalSectionHead}>
              <span className={styles.editModalStep}>03</span>
              <div>
                <h4>Color del perfil</h4>
                <p>Cambia el color que reemplaza al amarillo en botones, títulos, bordes y brillos.</p>
              </div>
            </div>

            <div className={styles.themeOptions} role="radiogroup" aria-label="Color del perfil">
              {PROFILE_COLOR_THEMES.map((theme) => {
                const selected = editColorTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`${styles.themeOption} ${selected ? styles.themeOptionSelected : ""}`}
                    aria-pressed={selected}
                    onClick={() => setEditColorTheme(theme.id)}
                  >
                    <span
                      className={`${styles.themeSwatches} ${theme.lightSwatches?.length ? styles.themeSwatchesSplit : ""}`}
                      aria-hidden="true"
                    >
                      <span
                        className={styles.themeSwatchRow}
                        style={{ background: crearGradientPaleta(theme.swatches) }}
                      ></span>
                      {theme.lightSwatches?.length ? (
                        <span
                          className={styles.themeSwatchRow}
                          style={{ background: crearGradientPaleta(theme.lightSwatches) }}
                        ></span>
                      ) : null}
                    </span>
                    <span>
                      <strong>{theme.label}</strong>
                      <small>{theme.note}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.editModalSection}>
            <div className={styles.editModalSectionHead}>
              <span className={styles.editModalStep}>04</span>
              <div>
                <h4>Icono de perfil</h4>
                <p>Selecciona tu avatar visible en la barra y en el perfil.</p>
              </div>
            </div>

            <div
              className={styles.iconPicker}
              role="radiogroup"
              aria-label="Icono de perfil"
            >
              {avatars.map((src, i) => {
                const n = i + 1;
                const selected = Number(editIcono) === n;

                return (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.iconOption} ${
                      selected ? styles.iconOptionSelected : ""
                    }`}
                    aria-pressed={selected}
                    aria-label={`Icono ${n}`}
                    onClick={() => setEditIcono(n)}
                  >
                    <img src={src} alt={`Icono ${n}`} />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        <div className={mstyles.modalActions}>
          <button
            type="button"
            className={mstyles.btnCancel}
            onClick={() => setEditOpen(false)}
          >
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
      </div>
    </ProfileChromeContext.Provider>
  );
}