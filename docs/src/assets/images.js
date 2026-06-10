// Central image registry so components import assets by name. Vite fingerprints
// each import and rewrites the URL with the configured base path.
import hamstersolo from "./img/hamstersolo.webp";
import hamstericon from "./img/hamstericon.webp";
import hamstercomment from "./img/hamstercomment.webp";
import homelogo from "./img/homelogo.webp";
import homelogoNoglow from "./img/homelogo(noglow).webp";
import myhomies from "./img/myhomies.webp";
import trending from "./img/trending.webp";
import clapperboard from "./img/clapperboard.webp";
import homeProfileicon from "./img/home_profileicon(noglow).webp";
import top5list from "./img/TOP5LIST(noglow).webp";
import watchlist from "./img/WATCHLIST(noglow).webp";
import pendinglist from "./img/PENDINGLIST(noglow).webp";
import recommend from "./img/recommend(noglow).webp";
import postlike from "./img/postlike.webp";
import postdislike from "./img/postdislike.webp";
import imglogin from "./img/imglogin.webp";
import avatar1 from "./img/avatar1.webp";
import avatar2 from "./img/avatar2.webp";
import avatar3 from "./img/avatar3.webp";


// Selectable profile icons, indexed by the backend's iconoPerfil (1-based).
export const avatars = [avatar1, avatar2, avatar3];

// Map a stored iconoPerfil to its image, falling back to the first icon.
export function avatarPorIcono(icono) {
  const n = Number(icono) || 1;
  return avatars[n - 1] || avatars[0];
}

export const img = {
  hamstersolo,
  hamstericon,
  hamstercomment,
  homelogo,
  homelogoNoglow,
  myhomies,
  trending,
  clapperboard,
  homeProfileicon,
  top5list,
  watchlist,
  pendinglist,
  recommend,
  postlike,
  postdislike,
  imglogin,
};

export default img;
