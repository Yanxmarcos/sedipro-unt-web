import { panelApi } from "./panel-api.js";
import { saveResourceFile } from "./resource-export.mjs";

export const RESOURCE_ACTION_LABELS = {
  abrir_modulo: "Abrir módulo",
  ver_recurso: "Ver recurso",
  descargar_recurso: "Descargar recurso",
  descargar_kit: "Descargar kit de variantes",
  descargar_fuente: "Descargar fuente Illustrator",
  copiar_recurso: "Copiar imagen para Canva",
};
export const RESOURCE_RESULT_LABELS = {
  registrada: "Registrada",
  iniciada: "En curso",
  descarga_iniciada: "Descarga iniciada",
  copiada: "Copiada al portapapeles",
  fallida: "Fallida",
  cancelada: "Cancelada",
};
async function send(path, method, body) {
  // The same ID is reused after a lost response; retries never create extra rows.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await panelApi(path, { method, body });
    } catch (error) {
      if (attempt || (error.status && error.status < 500)) throw error;
    }
  }
}
export function startResourceActivity(accion, details = {}) {
  return send("/api/recursos/actividad", "POST", {
    operacionId: crypto.randomUUID(),
    accion,
    ...details,
  });
}
export function finishResourceActivity(id, resultado) {
  return send(`/api/recursos/actividad/${id}`, "PATCH", { resultado });
}
export async function downloadAuditedResource(
  accion,
  details,
  prepare,
  signal,
) {
  const entry = await startResourceActivity(accion, details);
  let saved = false;
  try {
    signal?.throwIfAborted();
    const file = await prepare();
    signal?.throwIfAborted();
    saveResourceFile(file);
    saved = true;
  } catch (error) {
    await finishResourceActivity(
      entry.id,
      error.name === "AbortError" ? "cancelada" : "fallida",
    ).catch(() => {});
    throw error;
  }
  // The browser can report the start, never whether the user saved the file.
  let auditPending = false;
  if (saved)
    await finishResourceActivity(entry.id, "descarga_iniciada").catch(() => {
      auditPending = true;
    });
  return { auditPending };
}
