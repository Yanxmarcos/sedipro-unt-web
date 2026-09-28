import * as XLSX from "xlsx";

const ESTADO_LABELS = {
  presente: "Presente",
  tardanza: "Tardanza",
  justificado: "Justificado",
  ausente: "Ausente",
};

function formatDate(iso) {
  if (!iso) return "—";

  const [year, month, day] = iso.split("T")[0].split("-");
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  return `${day} de ${months[Number(month) - 1]} de ${year}`;
}

function formatTime(iso) {
  if (!iso) return "—";

  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function exportAttendanceToExcel(attendance, records = []) {
  const groupedByArea = records.reduce((groups, record) => {
    const area = record.sediprano?.area || "Sin área";
    if (!groups[area]) groups[area] = [];
    groups[area].push(record);
    return groups;
  }, {});

  const totalPresentes = records.filter(
    (record) => record.estado === "presente",
  ).length;
  const totalTardanzas = records.filter(
    (record) => record.estado === "tardanza",
  ).length;
  const totalJustificados = records.filter(
    (record) => record.estado === "justificado",
  ).length;
  const totalAusentes = records.filter(
    (record) => record.estado === "ausente",
  ).length;
  const attendancePercentage = records.length
    ? Math.round((totalPresentes / records.length) * 100)
    : 0;

  const rows = [
    [
      `ASISTENCIA: ${attendance.descripcion?.toUpperCase() || "SIN DESCRIPCIÓN"}`,
    ],
    [`FECHA: ${formatDate(attendance.fecha).toUpperCase()}`],
    [],
    ["RESUMEN GENERAL"],
    [
      `TOTAL: ${records.length}`,
      `PRESENTES: ${totalPresentes}`,
      `TARDANZAS: ${totalTardanzas}`,
      `JUSTIFICADOS: ${totalJustificados}`,
      `AUSENTES: ${totalAusentes}`,
      `% ASISTENCIA: ${attendancePercentage}%`,
    ],
    [],
    ["DETALLE POR ÁREA DE SEDIPRO UNT"],
    [],
    [
      "N°",
      "NOMBRES",
      "APELLIDOS",
      "ÁREA",
      "ESTADO",
      "HORA REGISTRO",
      "REGISTRÓ",
    ],
    [],
  ];

  let recordNumber = 0;
  const areas = Object.keys(groupedByArea).sort();

  areas.forEach((area, areaIndex) => {
    const areaRecords = groupedByArea[area];
    const count = (status) =>
      areaRecords.filter((record) => record.estado === status).length;

    rows.push([
      area.toUpperCase(),
      `TOTAL: ${areaRecords.length}`,
      `Presentes: ${count("presente")}`,
      `Tardanza: ${count("tardanza")}`,
      `Justificados: ${count("justificado")}`,
      `Ausentes: ${count("ausente")}`,
    ]);

    areaRecords.forEach((record) => {
      recordNumber += 1;
      rows.push([
        recordNumber,
        record.sediprano?.nombres?.toUpperCase() || "—",
        record.sediprano?.apellidos?.toUpperCase() || "—",
        record.sediprano?.area?.toUpperCase() || "—",
        ESTADO_LABELS[record.estado]?.toUpperCase() ||
          record.estado?.toUpperCase() ||
          "—",
        record.hora ? formatTime(record.hora) : "—",
        record.registradoPor || "—",
      ]);
    });

    if (areaIndex < areas.length - 1) rows.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [15, 30, 30, 25, 18, 20, 20].map((wch) => ({ wch }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

  const safeDescription =
    attendance.descripcion?.replace(/\s+/g, "_") || "sin_descripcion";
  const date = new Date(attendance.fecha).toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `asistencia_${safeDescription}_${date}.xlsx`);
}
