import { createContext, useContext } from "react";

// Lets the page-specific library section trigger a refresh of the shared chrome
// (bio tags / post count) after it mutates the user's lists.
export const ProfileChromeContext = createContext({
  idUsuario: null,
  recargar: () => {},
});

export function useProfileChrome() {
  return useContext(ProfileChromeContext);
}
