import { panelApi } from "./panel-api.js";

export const CERTIFICATE_ACTION_LABELS = {
  abrir_modulo: "Abrir módulo",
  seleccionar_tipo: "Seleccionar tipo",
  preparar_participantes: "Preparar participantes",
  cargar_plantilla: "Cargar plantilla",
  abrir_editor: "Abrir editor",
  descargar_certificado: "Descarga individual",
  descargar_lote: "Descarga de lote ZIP",
  descargar_plantilla: "Descargar plantilla",
  reiniciar_sesion: "Nueva sesión",
};
export const CERTIFICATE_RESULT_LABELS = {
  registrada: "Registrada",
  iniciada: "En curso",
  descarga_iniciada: "Descarga iniciada",
  fallida: "Fallida",
  cancelada: "Cancelada",
};
async function send(path, method, body) {
  // A retry keeps the operation ID: a lost response must not duplicate a usage row.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await panelApi(path, { method, body });
    } catch (error) {
      if (attempt || (error.status && error.status < 500)) throw error;
    }
  }
}
export function startCertificateActivity(accion, details = {}) {
  return send("/api/certificados/actividad", "POST", {
    operacionId: crypto.randomUUID(),
    accion,
    ...details,
  });
}
export function finishCertificateActivity(id, resultado, generados) {
  return send(`/api/certificados/actividad/${id}`, "PATCH", {
    resultado,
    generados,
  });
}
