import { createContext, useContext } from "react";

// Shared chrome state: lets the Navbar's mobile toggle open the recommendations
// drawer that pages (Home/Trending) render via the Sidebar component.
export const LayoutContext = createContext(null);

export function useLayout() {
  return useContext(LayoutContext) || {};
}
