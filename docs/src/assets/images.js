// Central image registry so components import assets by name. Vite fingerprints
// each import and rewrites the URL with the configured base path.
//
// IMPORTANTE:
// Estas imágenes deben existir en docs/src/assets/img/.
// No uses rutas tipo "/cyberhamster.webp" para estos assets, porque en Vite
// eso busca en docs/public/ y provoca el icono roto.

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

// Imágenes nuevas de logros / recompensas.
import cienResenas from "./img/100resenas.webp";
import adrenalinapura from "./img/adrenalinapura.webp";
import centrodeconversacion from "./img/centrodeconversacion.webp";
import cinefilocasual from "./img/cinefilocasual.webp";
import cinefiloelite from "./img/cinefiloelite.webp";
import comunidad from "./img/comunidad.webp";
import corazonromance from "./img/corazonromance.webp";
import cyberhamster from "./img/cyberhamster.webp";
import exploradordegeneros from "./img/exploradordegeneros.webp";
import gengar from "./img/gengar.webp";
import gokuotakuinicial from "./img/gokuotakuinicial.webp";
import leyendahomiewood from "./img/leyendahomiewood.webp";
import logros from "./img/logros.webp";
import maratonistadeseries from "./img/maratonistadeseries.webp";
import mikuhamster from "./img/mikuhamster.webp";
import nochedecine from "./img/nochedecine.webp";
import opinioncompartida from "./img/opinioncompartida.webp";
import primeraresena from "./img/primeraresena.webp";
import racha30dias from "./img/racha30dias.webp";
import risaasegurada from "./img/risaasegurada.webp";
import slaanesh from "./img/slaanesh.webp";
import sociable from "./img/sociable.webp";
import topcritico from "./img/topcritico.webp";
import yaempece from "./img/yaempece.webp";

// Selectable profile icons, indexed by the backend's iconoPerfil (1-based).
export const avatars = [avatar1, avatar2, avatar3];

const ASSET_BY_FILENAME = Object.freeze({
  "hamstersolo.webp": hamstersolo,
  "hamstericon.webp": hamstericon,
  "hamstercomment.webp": hamstercomment,
  "homelogo.webp": homelogo,
  "homelogo(noglow).webp": homelogoNoglow,
  "myhomies.webp": myhomies,
  "trending.webp": trending,
  "clapperboard.webp": clapperboard,
  "home_profileicon(noglow).webp": homeProfileicon,
  "TOP5LIST(noglow).webp": top5list,
  "WATCHLIST(noglow).webp": watchlist,
  "PENDINGLIST(noglow).webp": pendinglist,
  "recommend(noglow).webp": recommend,
  "postlike.webp": postlike,
  "postdislike.webp": postdislike,
  "imglogin.webp": imglogin,
  "avatar1.webp": avatar1,
  "avatar2.webp": avatar2,
  "avatar3.webp": avatar3,

  "100resenas.webp": cienResenas,
  "adrenalinapura.webp": adrenalinapura,
  "centrodeconversacion.webp": centrodeconversacion,
  "cinefilocasual.webp": cinefilocasual,
  "cinefiloelite.webp": cinefiloelite,
  "comunidad.webp": comunidad,
  "corazonromance.webp": corazonromance,
  "cyberhamster.webp": cyberhamster,
  "exploradordegeneros.webp": exploradordegeneros,
  "gengar.webp": gengar,
  "gokuotakuinicial.webp": gokuotakuinicial,
  "leyendahomiewood.webp": leyendahomiewood,
  "logros.webp": logros,
  "maratonistadeseries.webp": maratonistadeseries,
  "mikuhamster.webp": mikuhamster,
  "nochedecine.webp": nochedecine,
  "opinioncompartida.webp": opinioncompartida,
  "primeraresena.webp": primeraresena,
  "racha30dias.webp": racha30dias,
  "risaasegurada.webp": risaasegurada,
  "slaanesh.webp": slaanesh,
  "sociable.webp": sociable,
  "topcritico.webp": topcritico,
  "yaempece.webp": yaempece,
});

function normalizarNombreArchivo(valor) {
  if (!valor) return "";

  return String(valor)
    .trim()
    .replace(/^\/+/, "")
    .replace(/^\.\/img\//, "")
    .replace(/^img\//, "")
    .replace(/^assets\/img\//, "")
    .replace(/^src\/assets\/img\//, "");
}

export function imagenPorArchivo(nombreArchivo) {
  if (!nombreArchivo) return null;

  const valor = String(nombreArchivo).trim();
  if (/^(https?:)?\/\//i.test(valor) || valor.startsWith("data:")) {
    return valor;
  }

  const limpio = normalizarNombreArchivo(valor);
  return ASSET_BY_FILENAME[limpio] || null;
}

// Map a stored iconoPerfil to its image, falling back to the first icon.
export function avatarPorIcono(icono) {
  const n = Number(icono) || 1;
  return avatars[n - 1] || avatars[0];
}

// Map a full user object to the avatar image shown in navbar, search, bottom nav
// and any small profile shortcut. avatarPerfil is the new backend field unlocked
// by achievements; iconoPerfil remains the numeric fallback for older users.
export function avatarPorUsuario(usuario) {
  const avatarGanado = imagenPorArchivo(usuario?.avatarPerfil);
  if (avatarGanado) return avatarGanado;

  return avatarPorIcono(usuario?.iconoPerfil ?? usuario);
}

export function avatarPublico(nombreArchivo) {
  return imagenPorArchivo(nombreArchivo);
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
  cienResenas,
  adrenalinapura,
  centrodeconversacion,
  cinefilocasual,
  cinefiloelite,
  comunidad,
  corazonromance,
  cyberhamster,
  exploradordegeneros,
  gengar,
  gokuotakuinicial,
  leyendahomiewood,
  logros,
  maratonistadeseries,
  mikuhamster,
  nochedecine,
  opinioncompartida,
  primeraresena,
  racha30dias,
  risaasegurada,
  slaanesh,
  sociable,
  topcritico,
  yaempece,
};

export default img;
