export const DEFAULT_PROFILE_PREFS = {
  coverMode: "top1",
  colorTheme: "yellow",
};

export const PROFILE_COLOR_THEMES = [
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

export function normalizarProfilePrefs(value) {
  const coverMode = typeof value?.coverMode === "string" ? value.coverMode : value?.portadaPerfil;
  const colorTheme = typeof value?.colorTheme === "string" ? value.colorTheme : value?.temaPerfil;
  const coverModeValido = coverMode === "none" || /^top[1-5]$/.test(coverMode || "");

  return {
    coverMode: coverModeValido ? coverMode : DEFAULT_PROFILE_PREFS.coverMode,
    colorTheme: PROFILE_COLOR_THEMES.some((theme) => theme.id === colorTheme)
      ? colorTheme
      : DEFAULT_PROFILE_PREFS.colorTheme,
  };
}

export function obtenerIndicePortada(coverMode) {
  if (typeof coverMode !== "string") return 0;
  const match = coverMode.match(/^top([1-5])$/);
  return match ? Number(match[1]) - 1 : -1;
}

export function crearGradientPaleta(colors = []) {
  const validColors = colors.filter(Boolean);
  if (!validColors.length) return "transparent";

  const step = 100 / validColors.length;
  return `linear-gradient(90deg, ${validColors
    .map((color, index) => `${color} ${index * step}% ${(index + 1) * step}%`)
    .join(", ")})`;
}

export function obtenerProfileTheme(id, appearanceMode = "dark") {
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

export function prefsDesdeUsuario(usuario) {
  return normalizarProfilePrefs({
    colorTheme: usuario?.temaPerfil || usuario?.colorTheme,
    coverMode: usuario?.portadaPerfil || usuario?.coverMode,
  });
}
