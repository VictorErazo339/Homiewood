import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "homiewood-theme";
const ThemeContext = createContext(null);

// Mirror the inline boot script in index.html: a stored choice wins, otherwise
// fall back to the OS preference, otherwise dark (the brand default).
function obtenerTemaInicial() {
  if (typeof window === "undefined") return "dark";

  const guardado = window.localStorage.getItem(STORAGE_KEY);
  if (guardado === "light" || guardado === "dark") return guardado;

  const prefiereClaro = window.matchMedia?.(
    "(prefers-color-scheme: light)"
  ).matches;
  return prefiereClaro ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(obtenerTemaInicial);

  // Reflect the active theme onto <html> so the CSS tokens swap, and remember
  // the choice for next visit.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = { theme, toggleTheme, setTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
