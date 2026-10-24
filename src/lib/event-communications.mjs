// Shared consent copy. Keep the frontend copy identical.
export const COMMUNICATIONS_CONSENT_VERSION = "2026-10-23.v1";
export const COMMUNICATIONS_CONSENT_TEXT =
  "Deseo recibir por correo electrónico invitaciones a futuros eventos y otras informaciones relacionadas organizadas por SEDIPRO UNT.";
export function communicationsChoice(value) {
  if (value === undefined) return false;
  if (typeof value !== "boolean")
    throw new TypeError(
      "La autorización de invitaciones debe ser una casilla válida.",
    );
  return value;
}
