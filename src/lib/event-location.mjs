export const MODALITIES = [
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "hibrido", label: "Híbrido" },
];
export const VIRTUAL_PLATFORMS = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "discord", label: "Discord" },
];
export const hasPhysicalVenue = (mode) => mode !== "virtual";
export const hasVirtualVenue = (mode) => ["virtual", "hibrido"].includes(mode);
export function validPoint(point) {
  return Boolean(
    point &&
    typeof point === "object" &&
    Number.isFinite(point.latitud) &&
    Number.isFinite(point.longitud) &&
    Math.abs(point.latitud) <= 90 &&
    Math.abs(point.longitud) <= 180,
  );
}
export function googleMapsLink(point) {
  return validPoint(point)
    ? `https://www.google.com/maps/search/?api=1&query=${point.latitud},${point.longitud}`
    : null;
}
export function venueSummary(event) {
  const mode = event.modalidad || "presencial";
  return [
    MODALITIES.find((m) => m.value === mode)?.label,
    hasPhysicalVenue(mode) && event.lugar,
    hasVirtualVenue(mode) &&
      VIRTUAL_PLATFORMS.find((p) => p.value === event.plataformaVirtual)?.label,
  ]
    .filter(Boolean)
    .join(" · ");
}
export function normalizeEventLocation(body, prior = null) {
  const keys = [
    "modalidad",
    "lugar",
    "ubicacion",
    "referencia",
    "plataformaVirtual",
  ];
  if (!keys.some((k) => Object.hasOwn(body, k))) return {};
  const merged = {
    modalidad: "presencial",
    lugar: "",
    ubicacion: null,
    referencia: "",
    plataformaVirtual: "",
    ...prior,
    ...body,
  };
  if (!MODALITIES.some((m) => m.value === merged.modalidad))
    throw new Error("Selecciona una modalidad válida.");
  for (const [key, max] of [
    ["lugar", 250],
    ["referencia", 500],
    ["plataformaVirtual", 40],
  ]) {
    if (typeof merged[key] !== "string" || merged[key].length > max)
      throw new Error("Revisa los datos del lugar y la plataforma.");
    merged[key] = merged[key].trim();
  }
  if (merged.ubicacion !== null && !validPoint(merged.ubicacion))
    throw new Error("Selecciona una ubicación válida en el mapa.");
  if (
    merged.plataformaVirtual &&
    !VIRTUAL_PLATFORMS.some((p) => p.value === merged.plataformaVirtual)
  )
    throw new Error("Selecciona una plataforma virtual válida.");
  if (!hasPhysicalVenue(merged.modalidad)) {
    merged.lugar = "";
    merged.ubicacion = null;
    merged.referencia = "";
  }
  if (!hasVirtualVenue(merged.modalidad)) merged.plataformaVirtual = "";
  // Older clients may save plain-text venues. Explicit modality settings must
  // provide the complete new venue; unrelated PATCH requests remain compatible.
  if (Object.hasOwn(body, "modalidad")) {
    if (
      hasPhysicalVenue(merged.modalidad) &&
      (!merged.lugar || !merged.ubicacion)
    )
      throw new Error("Indica el lugar y selecciona su punto en el mapa.");
    if (hasVirtualVenue(merged.modalidad) && !merged.plataformaVirtual)
      throw new Error("Selecciona la plataforma virtual.");
  }
  return Object.fromEntries(
    keys.map((k) => [
      k,
      k === "ubicacion" && merged[k]
        ? { latitud: merged[k].latitud, longitud: merged[k].longitud }
        : merged[k],
    ]),
  );
}
