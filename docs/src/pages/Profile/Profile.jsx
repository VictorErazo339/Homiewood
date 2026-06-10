import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../api/api.js";
import { buscarCatalogo } from "../../api/catalogoApi.js";
import {
  actualizarIconoUsuario,
  actualizarPerfilUsuario,
  obtenerPerfilResumen,
  listarLogros,
} from "../../api/usuariosApi.js";
import { avatars } from "../../assets/images.js";
import top5Icon from "../../assets/img/TOP5LIST(noglow).webp";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  normalizarContenidoApi,
  obtenerTagsDelItem,
} from "../../lib/contenido.js";
import { esEstrenoSensible, motivoSpoiler } from "../../lib/spoiler.js";
import {
  getUnlockedAvatarRewards,
} from "../../utils/homiewoodAchievementAssets.js";
import PostCard from "../../components/PostCard/PostCard.jsx";
import ProfileBanner from "../../components/profile/ProfileBanner.jsx";
import ProfileHero from "../../components/profile/ProfileHero.jsx";
import ProfileTabs from "../../components/profile/ProfileTabs.jsx";
import AchievementsModal from "../../components/profile/AchievementsModal.jsx";
import Top5Modal from "../../components/profile/Top5Modal.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import mstyles from "../../components/Modal/Modal.module.css";
import styles from "./Profile.module.css";


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
      "--profile-accent-2": "#ff3d00",
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
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [posts, setPosts] = useState([]);
  const [top5, setTop5] = useState([null, null, null, null, null]);
  const [vistas, setVistas] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [logros, setLogros] = useState([]);
  const [logrosDestacados, setLogrosDestacados] = useState([]);
  const [logrosCargados, setLogrosCargados] = useState(false);
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
  const [editAvatarPerfil, setEditAvatarPerfil] = useState("");
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

  const composerInputRef = useRef(null);

  useEffect(() => {
    setLogros([]);
    setLogrosCargados(false);
  }, [idUsuario]);

  // Open the edit modal when arriving via the navbar's "Editar perfil" (?edit=1).
  useEffect(() => {
    if (esMiPerfil && searchParams.get("edit") === "1") {
      abrirEditar();
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
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
        avatarPerfil: resumen.avatarPerfil || null,
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
      setLogrosDestacados(Array.isArray(resumen.logrosDestacados) ? resumen.logrosDestacados : []);
    } catch (error) {
      console.error("Error cargando resumen de perfil:", error);
    }
  }, [idUsuario, usuario, actualizarUsuario, esMiPerfil]);



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

    cargarPerfilResumen();
    cargarPosts();
    cargarTop5();
    cargarVistas();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuario]);

  const cargarLogrosUsuario = useCallback(async () => {
    if (!idUsuario) return [];

    try {
      const data = await listarLogros(idUsuario);
      const normalizados = Array.isArray(data) ? data : [];
      setLogros(normalizados);
      setLogrosCargados(true);
      return normalizados;
    } catch (error) {
      console.error("Error cargando logros:", error);
      return [];
    }
  }, [idUsuario]);

  async function abrirLogros() {
    setAchOpen(true);

    if (logrosCargados || !idUsuario) return;

    await cargarLogrosUsuario();
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
    if (!esMiPerfil) return;

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
      await cargarPerfilResumen();
      limpiarComposer();
    } catch (error) {
      console.error("Error publicando reseña:", error);
      alert("No se pudo publicar la reseña.");
    }
  }

  /* ------- Edit profile ------- */
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
    setEditAvatarPerfil(perfil?.avatarPerfil || "");
    setEditCoverMode(profilePrefs.coverMode);
    setEditColorTheme(profilePrefs.colorTheme);
    setEditOpen(true);

    if (!logrosCargados) {
      cargarLogrosUsuario();
    }
  }

  async function guardarPerfil() {
    if (!esMiPerfil) return;

    const nombre = editNombre.trim();
    const descripcion = editDesc.trim();
    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }
    setSavingPerfil(true);
    try {
      let actualizado = await actualizarPerfilUsuario(idUsuario, {
        nombre,
        descripcion,
        temaPerfil: editColorTheme,
        portadaPerfil: editCoverMode,
        avatarPerfil: editAvatarPerfil || "",
      });
      // Persist the legacy numeric icon only when no unlocked avatar is selected.
      if (!editAvatarPerfil && Number(editIcono) !== Number(perfil?.iconoPerfil || 1)) {
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
        avatarPerfil: actualizado.avatarPerfil || null,
      };
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
  const unlockedAvatarRewards = getUnlockedAvatarRewards(logros);

  // Header shows up to 3 unlocked featured achievements; the modal lists all.
  const headerLogros = (logrosDestacados.length ? logrosDestacados : logros)
    .filter((l) => l.desbloqueado)
    .slice(0, 3);

  return (
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
              <button className={styles.editBtn} type="button" onClick={abrirEditar}>
                ✏️ Editar perfil
              </button>
            ) : null
          }
        />

        {/* TOP 5 */}
        <section className={styles.top5Section} aria-label="Mi Top 5">
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
                    data-title={item.titulo}
                  >
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
                      <div className={`${styles.moviePoster} ${styles.moviePosterEmpty}`}>
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
        {esMiPerfil && (
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

              {pSelected && esEstrenoSensible(pSelected.fechaEstreno) && (
                <div className={styles.spoilerNotice}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <p>
                    Tu post es sobre un{" "}
                    <strong>
                      estreno {motivoSpoiler(pSelected.fechaEstreno) === "futuro" ? "futuro" : "reciente"}
                    </strong>{" "}
                    y podrá ser susceptible a <strong>SPOILERS.</strong> Estará
                    oculto para los demás a menos que decidan verlo.
                  </p>
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
        )}

        {/* FEED — shared PostCard module (same as Home / Trending) */}
        <section className={styles.profileFeed} aria-label="Posts del usuario">
          {posts.length === 0 ? (
            <p className={styles.emptyFeed}>Aún no has publicado nada.</p>
          ) : (
            posts.map((c) => (
              <PostCard key={c.idCalificacion} calificacion={c} currentUser={usuario} />
            ))
          )}
        </section>
      </main>

      {/* ---------- TOP 5 MODAL ---------- */}
      {esMiPerfil && (
        <Top5Modal
          open={top5Open}
          onClose={() => setTop5Open(false)}
          idUsuario={idUsuario}
          top5={top5}
          onSaved={cargarTop5}
        />
      )}

      {/* ---------- ACHIEVEMENTS MODAL ---------- */}
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
            .catch(() => { });

          cargarPerfilResumen();
        }}
      />

      {/* ---------- EDIT PROFILE MODAL ---------- */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} labelledBy="editModalLabel">
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
                const selected = !editAvatarPerfil && Number(editIcono) === n;

                return (
                  <button
                    key={`legacy-${n}`}
                    type="button"
                    className={`${styles.iconOption} ${
                      selected ? styles.iconOptionSelected : ""
                    }`}
                    aria-pressed={selected}
                    aria-label={`Icono base ${n}`}
                    onClick={() => {
                      setEditAvatarPerfil("");
                      setEditIcono(n);
                    }}
                  >
                    <img src={src} alt={`Icono base ${n}`} />
                  </button>
                );
              })}

              <div className={styles.avatarRewardDivider}>
                Avatares ganados por logros
              </div>

              {unlockedAvatarRewards.length === 0 ? (
                <p className={styles.avatarRewardHint}>
                  Aún no tienes avatares de logros desbloqueados. Se irán activando al ganar logros.
                </p>
              ) : (
                unlockedAvatarRewards.map((reward) => {
                  const selected = editAvatarPerfil === reward.avatarPerfil;

                  return (
                    <button
                      key={reward.avatarPerfil}
                      type="button"
                      className={`${styles.iconOption} ${styles.iconOptionReward} ${
                        selected ? styles.iconOptionSelected : ""
                      }`}
                      aria-pressed={selected}
                      aria-label={`${reward.label}, desbloqueado por ${reward.nombreLogro}`}
                      title={`${reward.label} · ${reward.nombreLogro}`}
                      onClick={() => setEditAvatarPerfil(reward.avatarPerfil)}
                    >
                      <img src={reward.src} alt={reward.label} />
                      <span className={styles.avatarRewardBadge}>★</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
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
    </div>
  );
}
