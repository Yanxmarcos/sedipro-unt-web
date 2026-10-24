import { normalizeRole, ROLE_LABELS } from "./panel-permissions.mjs";

export function sessionDeadline(session, startedAt, receivedAt) {
  if (!session?.expiresAt || !session?.serverNow) return null;
  const expiresAt = Date.parse(session.expiresAt);
  const serverNow = Date.parse(session.serverNow);
  if (![expiresAt, serverNow, startedAt, receivedAt].every(Number.isFinite)) return null;
  const offset = serverNow - (startedAt + receivedAt) / 2;
  return expiresAt - offset;
}

export function remainingSessionSeconds(deadline, now = Date.now()) {
  return Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
}

export function formatSessionTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60]
    .map(part => String(part).padStart(2, "0")).join(":");
}

export function loginDestination(user) {
  if (!user) return null;
  if (user.rol === "ENCARGADO" && /^[a-f0-9]{24}$/i.test(user.asistenciaId || ""))
    return `/registro/${user.asistenciaId}`;
  if (!Object.hasOwn(ROLE_LABELS, normalizeRole(user.rol))) return null;
  return user.mustChangePassword ? "/panel/cambiar-contrasena" : "/panel";
}
