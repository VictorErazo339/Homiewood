// Spoiler-sensitivity rule, shared by PostCard (display) and the composers
// (the "this will be hidden" disclaimer).
//
// A title is spoiler-sensitive when its release date is:
//   · in the future (not yet released), OR
//   · within the last 21 days (a recent release).
//
// Both cases reduce to: release date is more recent than (now - 21 days).

export const DIAS_SPOILER = 21;

function aFecha(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function esEstrenoSensible(fechaEstreno, ahora = new Date()) {
  const estreno = aFecha(fechaEstreno);
  if (!estreno) return false;

  const limite = new Date(ahora);
  limite.setDate(limite.getDate() - DIAS_SPOILER);

  return estreno > limite;
}

// "futuro" | "reciente" | null — used to tailor the wording shown to the user.
export function motivoSpoiler(fechaEstreno, ahora = new Date()) {
  if (!esEstrenoSensible(fechaEstreno, ahora)) return null;
  const estreno = aFecha(fechaEstreno);
  return estreno > ahora ? "futuro" : "reciente";
}
