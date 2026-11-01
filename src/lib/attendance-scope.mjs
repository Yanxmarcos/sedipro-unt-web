export const ATTENDANCE_AREAS = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT"];
export function attendanceScopeLabel(attendance) {
  const scope = attendance?.alcance;
  if (!scope || scope.tipo === "general") return "Todo SEDIPRO";
  const extra = [
    scope.incluirPresidencia && "Presidencia",
    scope.incluirVicepresidencia && "Vicepresidencia",
  ].filter(Boolean);
  return `${scope.areas.length === 1 ? "Área" : `${scope.areas.length} áreas`}: ${scope.areas.join(", ")}${extra.length ? ` · Incluye ${extra.join(" y ")}` : ""}`;
}
