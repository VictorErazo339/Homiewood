import { imagenPorArchivo } from "../assets/images.js";

/**
 * Mapa central de imágenes para logros y avatares desbloqueables.
 *
 * IMPORTANTE:
 * Las imágenes deben estar en docs/src/assets/img/ y registradas/importadas
 * en src/assets/images.js. No se usan rutas absolutas tipo /archivo.webp
 * porque esas rutas apuntan a docs/public/ y se rompen si el asset vive en src.
 */
export const ACHIEVEMENT_IMAGE_BY_CODE = Object.freeze({
  PRIMERA_RESENA: "primeraresena.webp",
  PRIMERA_VISTA: "yaempece.webp",
  PRIMER_POR_VER: "PENDINGLIST(noglow).webp",
  TOP5_INICIADO: "TOP5LIST(noglow).webp",
  TOP5_COMPLETO: "TOP5LIST(noglow).webp",

  PRIMER_COMENTARIO: "opinioncompartida.webp",
  PRIMER_HOMIE: "myhomies.webp",

  CRITICO_CAMINO: "primeraresena.webp",
  CIEN_RESENAS: "100resenas.webp",
  RACHA_30_DIAS: "racha30dias.webp",
  CINEFILO_CASUAL: "cinefilocasual.webp",
  CINEFILO_ELITE: "cinefiloelite.webp",
  SERIES_FAN: "maratonistadeseries.webp",
  ANIME_FAN: "gokuotakuinicial.webp",
  ROMANCE_FAN: "corazonromance.webp",
  DRAMA_FAN: "gengar.webp",
  COMEDIA_FAN: "risaasegurada.webp",
  ACCION_FAN: "adrenalinapura.webp",
  CONVERSADOR: "centrodeconversacion.webp",
  SOCIABLE: "sociable.webp",
  COMUNIDAD: "comunidad.webp",
  RESENA_POPULAR: "postlike.webp",
  TOP_CRITICO: "topcritico.webp",
  CRITICO_ORO: "topcritico.webp",
  EXPLORADOR_GENEROS: "exploradordegeneros.webp",
  MARATONISTA: "maratonistadeseries.webp",
  POPULAR_COMENTARIOS: "centrodeconversacion.webp",
  LEYENDA_HOMIEWOOD: "leyendahomiewood.webp",

  OCULTO_NOCHE_CINE: "nochedecine.webp",
  OCULTO_PULGAR_VELOZ: "postlike.webp",
});

/**
 * Avatares desbloqueables. La key debe coincidir con Logro.codigo.
 * avatarPerfil es el valor que se guarda en BD.
 */
export const AVATAR_REWARD_BY_CODE = Object.freeze({
  PRIMERA_RESENA: { avatarPerfil: "avatar1.webp", label: "Avatar reseñista" },
  PRIMERA_VISTA: { avatarPerfil: "avatar2.webp", label: "Avatar watchlist" },
  PRIMER_POR_VER: { avatarPerfil: "avatar3.webp", label: "Avatar pendiente" },
  TOP5_INICIADO: { avatarPerfil: "hamstericon.webp", label: "Hamster cinéfilo" },
  TOP5_COMPLETO: { avatarPerfil: "cyberhamster.webp", label: "Cyber Hamster" },

  PRIMER_COMENTARIO: { avatarPerfil: "hamstercomment.webp", label: "Hamster comentarista" },
  PRIMER_HOMIE: { avatarPerfil: "hamstersolo.webp", label: "Hamster homie" },
  CINEFILO_CASUAL: { avatarPerfil: "cinefilocasual.webp", label: "Cinéfilo casual" },
  SERIES_FAN: { avatarPerfil: "mikuhamster.webp", label: "Miku Hamster" },
  ANIME_FAN: { avatarPerfil: "gokuotakuinicial.webp", label: "Otaku inicial" },
  ROMANCE_FAN: { avatarPerfil: "corazonromance.webp", label: "Corazón romance" },
  COMEDIA_FAN: { avatarPerfil: "risaasegurada.webp", label: "Risa asegurada" },
  ACCION_FAN: { avatarPerfil: "adrenalinapura.webp", label: "Adrenalina pura" },
  EXPLORADOR_GENEROS: { avatarPerfil: "exploradordegeneros.webp", label: "Explorador" },
  LEYENDA_HOMIEWOOD: { avatarPerfil: "leyendahomiewood.webp", label: "Leyenda Homiewood" },
});

export function getAssetUrl(fileName) {
  return imagenPorArchivo(fileName);
}

export function getAchievementImageUrl(logro) {
  return imagenPorArchivo(ACHIEVEMENT_IMAGE_BY_CODE[logro?.codigo]);
}

export function getAvatarReward(logro) {
  const reward = AVATAR_REWARD_BY_CODE[logro?.codigo];
  if (!reward) return null;

  return {
    ...reward,
    codigoLogro: logro?.codigo,
    nombreLogro: logro?.nombre,
    src: imagenPorArchivo(reward.avatarPerfil),
  };
}

export function getAvatarProfileUrl(avatarPerfil) {
  return imagenPorArchivo(avatarPerfil);
}

export function getUnlockedAvatarRewards(logros = []) {
  const seen = new Set();

  return logros
    .filter((logro) => Boolean(logro?.desbloqueado))
    .map((logro) => getAvatarReward(logro))
    .filter(Boolean)
    .filter((reward) => {
      if (!reward.avatarPerfil || seen.has(reward.avatarPerfil)) return false;
      seen.add(reward.avatarPerfil);
      return true;
    });
}
