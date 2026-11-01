export const PLATFORMS = {
  fb: "Facebook",
  ig: "Instagram",
  lk: "LinkedIn",
  tk: "TikTok",
  wa: "WhatsApp",
  fm: "Google Forms",
  yt: "YouTube",
  go: "Sitio web",
};
export const TYPES = {
  grupo_whatsapp: "Grupo de WhatsApp",
  contacto_whatsapp: "Contacto de WhatsApp",
  canal_whatsapp: "Canal de WhatsApp",
  whatsapp: "WhatsApp",
  formulario: "Formulario",
  sitio_web: "Sitio web",
  publicacion: "Publicación",
  video: "Video",
  short: "Short",
  transmision: "Transmisión en vivo",
  lista_reproduccion: "Lista de reproducción",
  canal_youtube: "Canal de YouTube",
};
export const STATES = {
  activo: "Activo",
  pausado: "Pausado",
  vencido: "Vencido",
  eliminado: "En papelera",
};
export const ACTIONS = {
  crear: "Creó el enlace",
  editar: "Modificó el enlace",
  eliminar: "Movió a papelera",
  restaurar: "Restauró el enlace",
  eliminar_definitivamente: "Eliminó definitivamente",
};
export const RESULTS = {
  iniciada: "Por verificar",
  completada: "Completada",
  rechazada: "No aplicada",
  por_verificar: "Por verificar",
};
export const FIELD_LABELS = {
  titulo: "Título",
  urlDestino: "Destino",
  dominioDestino: "Dominio",
  plataforma: "Plataforma",
  tipoDestino: "Tipo de destino",
  campana: "Campaña",
  nota: "Nota",
  estado: "Estado",
  venceAt: "Vencimiento",
  eliminadoAt: "Papelera",
  eliminadoPor: "Responsable de eliminación",
  eliminadoDefinitivamente: "Eliminación definitiva",
};
export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Sin vencimiento";
}
export function limaInput(value) {
  if (!value) return "";
  return new Date(new Date(value).getTime() - 5 * 3600000)
    .toISOString()
    .slice(0, 16);
}
export function expiryFromInput(value) {
  if (!value) return null;
  const date = new Date(`${value}:00-05:00`);
  if (Number.isNaN(date.getTime()))
    throw new Error("Revisa la fecha de vencimiento.");
  return date.toISOString();
}
