// Shared by the editor, Excel import and downloads. No participant data is sent
// to the server; this module only normalizes data and draws on a local canvas.
export const TEMPLATE_URL = "/certificados/plantilla-sedichampions.png";
export const WIDTH = 1138;
export const HEIGHT = 802;
export const MAX_BATCH = 500;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const EMPTY_CERTIFICATE = { name: "", role: "", area: "", date: "" };
export const FIELDS = [
  { key: "name", label: "Nombre completo", limit: 120 },
  { key: "role", label: "Rol dentro del área", limit: 80 },
  { key: "area", label: "Área", limit: 120 },
  { key: "date", label: "Lugar y fecha", limit: 100 },
];

const clean = (value) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();
const normalizeHeader = (value) =>
  clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const HEADER_NAMES = {
  name: [
    "nombre",
    "nombres",
    "nombrecompleto",
    "nombreyapellido",
    "nombreyapellidos",
    "nombresyapellidos",
    "participante",
  ],
  role: ["rol", "cargo", "roldentrodelarea"],
  area: ["area", "areadeparticipacion"],
  date: ["fecha", "lugaryfecha"],
};

export function todayInTrujillo() {
  return `Trujillo, ${new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())}`;
}

export function validateCertificate(data) {
  return Object.fromEntries(
    FIELDS.flatMap(({ key, label, limit }) => {
      const value = clean(data[key]);
      if (!value) return [[key, `Completa ${label.toLowerCase()}.`]];
      if (value.length > limit)
        return [[key, `Usa un máximo de ${limit} caracteres.`]];
      return [];
    }),
  );
}

export function parseCertificateRows(rows) {
  const headerIndex = rows.findIndex((row) => row.some((cell) => clean(cell)));
  if (headerIndex === -1)
    throw new Error(
      "El archivo está vacío. Usa la plantilla de Excel como referencia.",
    );
  const headers = rows[headerIndex].map(normalizeHeader);
  const columns = {};
  for (const { key, label } of FIELDS) {
    const matches = headers.flatMap((header, index) =>
      HEADER_NAMES[key].includes(header) ? [index] : [],
    );
    if (!matches.length)
      throw new Error(
        `No se encontró la columna «${label}». Usa los encabezados Nombre, Rol, Área y Fecha.`,
      );
    if (matches.length > 1)
      throw new Error(
        `La columna «${label}» está repetida. Conserva una sola columna para ese dato.`,
      );
    columns[key] = matches[0];
  }
  const records = [];
  for (let index = headerIndex + 1; index < rows.length; index++) {
    const row = rows[index];
    if (!Object.values(columns).some((column) => clean(row[column]))) continue;
    const data = {};
    for (const { key } of FIELDS) {
      const value = row[columns[key]];
      data[key] =
        key === "date" &&
        value instanceof Date &&
        !Number.isNaN(value.getTime())
          ? `Trujillo, ${new Intl.DateTimeFormat("es-PE", {
              timeZone: "UTC",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(value)}`
          : clean(value);
    }
    records.push({
      ...data,
      row: index + 1,
      errors: validateCertificate(data),
    });
  }
  if (!records.length)
    throw new Error(
      "El Excel solo contiene encabezados. Agrega al menos un participante.",
    );
  if (records.length > MAX_BATCH)
    throw new Error(
      `El archivo tiene ${records.length} participantes. Divídelo en lotes de hasta ${MAX_BATCH}.`,
    );
  return records;
}

export function safeFilename(value) {
  return (
    clean(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100) || "participante"
  );
}

export function loadTemplate() {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          "No se pudo cargar la plantilla del certificado. Vuelve a intentarlo.",
        ),
      );
    image.src = TEMPLATE_URL;
  });
}

function setFont(context, size, bold = false) {
  context.font = `${bold ? "bold " : ""}${size}px Arial, sans-serif`;
}

// Split even an unusually long unbroken word, keeping the text in its box.
function wrapSegments(context, segments, size, maxWidth) {
  const lines = [];
  let line = [];
  let width = 0;
  function pushLine() {
    if (!line.length) return;
    const last = line.at(-1);
    setFont(context, size, last.bold);
    last.text = last.text.trimEnd();
    last.width = context.measureText(last.text).width;
    lines.push({
      tokens: line,
      width: line.reduce((sum, token) => sum + token.width, 0),
    });
    line = [];
    width = 0;
  }
  for (const segment of segments) {
    setFont(context, size, segment.bold);
    for (const word of segment.text.match(/\S+\s*/gu) || []) {
      let remaining = word;
      while (remaining) {
        setFont(context, size, segment.bold);
        if (
          width + context.measureText(remaining).width > maxWidth &&
          line.length
        )
          pushLine();
        setFont(context, size, segment.bold);
        let piece = remaining;
        while (context.measureText(piece).width > maxWidth && piece.length > 1)
          piece = piece.slice(0, -1);
        const tokenWidth = context.measureText(piece).width;
        line.push({ text: piece, bold: segment.bold, width: tokenWidth });
        width += tokenWidth;
        remaining = remaining.slice(piece.length);
        if (remaining) pushLine();
      }
    }
  }
  pushLine();
  return lines;
}

export function drawCertificate(canvas, template, data, scale = 2) {
  canvas.width = WIDTH * scale;
  canvas.height = HEIGHT * scale;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Tu navegador no permite dibujar el certificado.");
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.drawImage(template, 0, 0, WIDTH, HEIGHT);
  context.fillStyle = "#171717";
  context.textBaseline = "middle";
  context.textAlign = "center";

  const name = clean(data.name) || "Nombre del participante";
  let nameSize = 30;
  setFont(context, nameSize, true);
  while (context.measureText(name).width > 690 && nameSize > 14)
    setFont(context, --nameSize, true);
  context.fillText(name, WIDTH / 2, 380, 690);

  const segments = [
    { text: "Por su destacada participación como ", bold: false },
    {
      text: `${(clean(data.role) || "ROL").toLocaleUpperCase("es-PE")} `,
      bold: true,
    },
    { text: "del área de ", bold: false },
    {
      text: `${(clean(data.area) || "ÁREA").toLocaleUpperCase("es-PE")} `,
      bold: true,
    },
    {
      text: 'del proyecto "SEDICHAMPIONS" organizado por la Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo.',
      bold: false,
    },
  ];
  let size = 22;
  let lines = wrapSegments(context, segments, size, 860);
  while (lines.length * size * 1.35 > 94 && size > 12)
    lines = wrapSegments(context, segments, --size, 860);
  context.textAlign = "left";
  const lineHeight = size * 1.35;
  const top = 470 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    let x = (WIDTH - line.width) / 2;
    for (const token of line.tokens) {
      setFont(context, size, token.bold);
      context.fillText(token.text, x, top + index * lineHeight);
      x += token.width;
    }
  });
  const date = clean(data.date) || "Trujillo, día de mes de año";
  context.textAlign = "right";
  let dateSize = 18;
  setFont(context, dateSize, true);
  while (context.measureText(date).width > 860 && dateSize > 12)
    setFont(context, --dateSize, true);
  context.fillText(date, 998, 542, 860);
  return canvas;
}

export async function createCertificatePdf(canvas) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  // Preserve the template's aspect ratio instead of stretching it to A4.
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const height = (pageWidth * HEIGHT) / WIDTH;
  pdf.addImage(
    // High-quality JPEG keeps batches practical without reducing resolution.
    // The separate PNG download remains lossless.
    canvas.toDataURL("image/jpeg", 0.95),
    "JPEG",
    0,
    (pageHeight - height) / 2,
    pageWidth,
    height,
    undefined,
    "FAST",
  );
  pdf.setProperties({
    title: "Certificado SEDICHAMPIONS",
    author: "SEDIPRO UNT",
  });
  return pdf.output("blob");
}

export function canvasToPng(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo exportar la imagen.")),
      "image/png",
    ),
  );
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
