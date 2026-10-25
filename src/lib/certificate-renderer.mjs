// Browser-only drawing and downloads. Images and participant data stay in memory.
const DESIGN_WIDTH = 1200;
const MAX_DIMENSION = 4096;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const clean = (value) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();

export const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Garamond",
  "Courier New",
  "Tahoma",
].map((value) => ({ value, label: value }));

export const DEFAULT_LAYOUT = Object.freeze({
  name: Object.freeze({
    x: 50,
    y: 44,
    width: 76,
    size: 36,
    fontFamily: "Arial",
  }),
  body: Object.freeze({
    x: 50,
    y: 56,
    width: 80,
    height: 19,
    size: 23,
    fontFamily: "Arial",
    lineHeight: 1.35,
  }),
  date: Object.freeze({
    x: 82,
    y: 66,
    width: 70,
    size: 18,
    fontFamily: "Arial",
  }),
  signatures: Object.freeze({
    x: 50,
    y: 79,
    width: 80,
    size: 16,
    fontFamily: "Arial",
    imageHeight: 9,
  }),
});

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));
function number(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  return clamp(Number.isFinite(parsed) ? parsed : fallback, minimum, maximum);
}

function normalizedBlock(key, layout) {
  const defaults = DEFAULT_LAYOUT[key];
  const input = { ...defaults, ...layout?.[key] };
  return {
    ...input,
    x: number(input.x, defaults.x, 1, 99),
    y: number(input.y, defaults.y, 1, 99),
    width: number(input.width, defaults.width, 1, 100),
    size: number(input.size, defaults.size, 1, 200),
    fontFamily: FONT_OPTIONS.some((option) => option.value === input.fontFamily)
      ? input.fontFamily
      : defaults.fontFamily,
  };
}

function setFont(context, size, family, bold = false) {
  context.font = `${bold ? "700" : "400"} ${size}px "${family}"`;
}

function boxWidth(block) {
  // A centered box must fit on both sides of its anchor.
  return (
    (DESIGN_WIDTH * Math.min(block.width, block.x * 2, (100 - block.x) * 2)) /
    100
  );
}

function widthOf(context, text, size, family, bold) {
  setFont(context, size, family, bold);
  return context.measureText(text).width;
}

function fitSingleLine(context, text, size, family, bold, width) {
  const measured = widthOf(context, text, size, family, bold);
  const fitted = measured > width ? (size * width) / measured : size;
  setFont(context, fitted, family, bold);
  return fitted;
}

// Keep each word's style runs together. Segment boundaries must not silently
// swallow spaces (e.g. a bold role followed by a regular "del proyecto").
function wordsFromSegments(segments) {
  const words = [];
  let current = [];
  let whitespace = false;
  function flush() {
    if (!current.length) return;
    words.push({ runs: current, spaceBefore: whitespace && words.length > 0 });
    current = [];
    whitespace = false;
  }
  for (const segment of segments) {
    for (const part of String(segment.text ?? "").split(/(\s+)/u)) {
      if (!part) continue;
      if (/^\s+$/u.test(part)) {
        flush();
        whitespace = true;
      } else {
        current.push({ text: part, bold: Boolean(segment.bold) });
      }
    }
  }
  flush();
  return words;
}

function wrapRichText(context, words, size, family, width) {
  const lines = [];
  let line = { runs: [], width: 0 };
  function pushLine() {
    if (line.runs.length) lines.push(line);
    line = { runs: [], width: 0 };
  }
  function append(run) {
    const measured = widthOf(context, run.text, size, family, run.bold);
    line.runs.push({ ...run, width: measured });
    line.width += measured;
  }
  for (const word of words) {
    const measured = word.runs.reduce(
      (sum, run) => sum + widthOf(context, run.text, size, family, run.bold),
      0,
    );
    const space =
      word.spaceBefore && line.runs.length
        ? widthOf(context, " ", size, family, false)
        : 0;
    if (line.runs.length && line.width + space + measured > width) pushLine();
    if (word.spaceBefore && line.runs.length)
      append({ text: " ", bold: false });
    if (measured <= width) {
      word.runs.forEach(append);
      continue;
    }
    // Only split a word if it cannot fit on a complete line. Unicode code
    // points are retained, rather than slicing UTF-16 surrogate pairs.
    for (const run of word.runs) {
      for (const character of Array.from(run.text)) {
        const characterWidth = widthOf(
          context,
          character,
          size,
          family,
          run.bold,
        );
        if (line.runs.length && line.width + characterWidth > width) pushLine();
        append({ text: character, bold: run.bold });
      }
    }
  }
  pushLine();
  return lines;
}

function drawLines(context, lines, size, family, x, centerY, lineHeight) {
  context.textAlign = "left";
  const top = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    let cursor = x - line.width / 2;
    for (const run of line.runs) {
      setFont(context, size, family, run.bold);
      context.fillText(run.text, cursor, top + index * lineHeight);
      cursor += run.width;
    }
  });
}

function fitParagraph(context, segments, block, maximumHeight) {
  const words = wordsFromSegments(segments);
  const width = boxWidth(block);
  const lineHeight = number(block.lineHeight, 1.35, 1, 2.5);
  let size = block.size;
  let lines = wrapRichText(context, words, size, block.fontFamily, width);
  // Fractional steps avoid jumping a complete line at large font sizes.
  while (lines.length * size * lineHeight > maximumHeight && size > 1) {
    size = Math.max(1, size - 0.5);
    lines = wrapRichText(context, words, size, block.fontFamily, width);
  }
  return {
    size,
    lines,
    lineHeight: size * lineHeight,
    overflows:
      lines.length * size * lineHeight > maximumHeight ||
      lines.some((line) => line.width > width + 0.01),
  };
}

function imageDimensions(image) {
  return {
    width: image?.naturalWidth || image?.width || 0,
    height: image?.naturalHeight || image?.height || 0,
  };
}

function drawSignatures(context, signers, block, height, warnings) {
  if (!signers.length) return [];
  if (signers.length > 8)
    throw new Error("El certificado admite hasta ocho firmantes.");
  const columns = Math.min(4, signers.length);
  const rows = Math.ceil(signers.length / columns);
  const totalWidth = boxWidth(block);
  const centerX = (DESIGN_WIDTH * block.x) / 100;
  const requestedImageHeight =
    (height * number(block.imageHeight, 9, 1, 30)) / 100;
  const rowHeight = Math.max(
    requestedImageHeight + block.size * 5.8,
    height * 0.17,
  );
  // With two rows, move the group up just enough to keep every title visible.
  const requestedY = (height * block.y) / 100;
  const lineY = Math.min(
    requestedY,
    height - (rows - 1) * rowHeight - block.size * 5,
  );
  if (lineY < requestedY - 0.1)
    warnings.push(
      "Las firmas se desplazaron hacia arriba para mantener todos los cargos dentro del certificado.",
    );
  if (lineY - requestedImageHeight < 0)
    warnings.push(
      "El bloque de firmas no cabe en la página. Reduce su tamaño o mueve su posición.",
    );
  const occupied = [];
  signers.forEach((signer, index) => {
    const row = Math.floor(index / columns);
    const rowCount = Math.min(columns, signers.length - row * columns);
    const slotWidth = totalWidth / rowCount;
    const width = slotWidth * 0.9;
    const x = centerX - totalWidth / 2 + slotWidth * ((index % columns) + 0.5);
    const y = lineY + row * rowHeight;
    const dimensions = imageDimensions(signer.image);
    let occupiedTop = y;
    if (dimensions.width && dimensions.height) {
      const scale = Math.min(
        width / dimensions.width,
        requestedImageHeight / dimensions.height,
      );
      const drawnWidth = dimensions.width * scale;
      const drawnHeight = dimensions.height * scale;
      occupiedTop = y - drawnHeight - 3;
      context.drawImage(
        signer.image,
        x - drawnWidth / 2,
        y - drawnHeight - 3,
        drawnWidth,
        drawnHeight,
      );
    }
    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x - width / 2, y);
    context.lineTo(x + width / 2, y);
    context.stroke();
    const name = clean(signer.name);
    const fitted = fitSingleLine(
      context,
      name,
      block.size,
      block.fontFamily,
      false,
      width,
    );
    context.textAlign = "center";
    context.fillText(name, x, y + block.size * 1.3);
    const titleBlock = {
      ...block,
      x: 50,
      width: (width / DESIGN_WIDTH) * 100,
      size: block.size * 0.9,
      lineHeight: 1.2,
    };
    const title = fitParagraph(
      context,
      [{ text: clean(signer.title), bold: true }],
      titleBlock,
      block.size * 3,
    );
    drawLines(
      context,
      title.lines,
      title.size,
      block.fontFamily,
      x,
      y + block.size * 2.7 + ((title.lines.length - 1) * title.lineHeight) / 2,
      title.lineHeight,
    );
    occupied.push({
      left: x - width / 2,
      right: x + width / 2,
      top: occupiedTop,
      bottom:
        y +
        block.size * 2.7 +
        Math.max(0, title.lines.length - 1) * title.lineHeight +
        title.size / 2,
    });
    if (fitted < 8 || title.size < 8 || title.overflows)
      warnings.push(
        `La firma de ${name || "un firmante"} tiene texto muy pequeño. Reduce los firmantes por certificado o amplía su espacio.`,
      );
  });
  return occupied;
}

/** Draw at export resolution, preserving the template's native aspect ratio.
 * All positions are percentages; type sizes use a 1200px reference width.
 * The returned sizes use that same reference, independently of export pixels.
 */
export function drawCertificate(
  canvas,
  template,
  data,
  layout = DEFAULT_LAYOUT,
) {
  const natural = imageDimensions(template);
  if (!natural.width || !natural.height)
    throw new Error("Primero carga una plantilla válida.");
  const desiredWidth = clamp(
    Math.max(2400, natural.width),
    2400,
    MAX_DIMENSION,
  );
  const outputScale = Math.min(
    desiredWidth / natural.width,
    MAX_DIMENSION / natural.height,
  );
  canvas.width = Math.round(natural.width * outputScale);
  canvas.height = Math.round(natural.height * outputScale);
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Tu navegador no permite dibujar el certificado.");
  const scale = canvas.width / DESIGN_WIDTH;
  const height = canvas.height / scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, DESIGN_WIDTH, height);
  context.drawImage(template, 0, 0, DESIGN_WIDTH, height);
  context.fillStyle = "#171717";
  context.textBaseline = "middle";
  context.textAlign = "center";
  const warnings = [];
  const name = normalizedBlock("name", layout);
  const body = normalizedBlock("body", layout);
  const date = normalizedBlock("date", layout);
  const signatures = normalizedBlock("signatures", layout);
  const text = clean(data.name) || "Nombre del participante";
  const nameSize = fitSingleLine(
    context,
    text,
    name.size,
    name.fontFamily,
    true,
    boxWidth(name),
  );
  context.fillText(
    text,
    (DESIGN_WIDTH * name.x) / 100,
    (height * name.y) / 100,
  );
  if (nameSize < name.size - 0.01)
    warnings.push(
      "Se redujo el tamaño del nombre para mantenerlo en una sola línea.",
    );
  if (nameSize < 8)
    warnings.push(
      "El nombre queda muy pequeño. Amplía su espacio o revisa el nombre completo.",
    );
  const maximumHeight =
    (height *
      Math.min(
        number(body.height, 19, 1, 100),
        body.y * 2,
        (100 - body.y) * 2,
      )) /
    100;
  const paragraph = fitParagraph(
    context,
    data.bodySegments || [],
    body,
    maximumHeight,
  );
  drawLines(
    context,
    paragraph.lines,
    paragraph.size,
    body.fontFamily,
    (DESIGN_WIDTH * body.x) / 100,
    (height * body.y) / 100,
    paragraph.lineHeight,
  );
  if (paragraph.size < body.size - 0.01)
    warnings.push(
      "Se redujo el texto de reconocimiento para ajustarlo al espacio disponible.",
    );
  if (paragraph.overflows)
    warnings.push(
      "El texto de reconocimiento excede el espacio disponible. Amplía el bloque o acorta el texto.",
    );
  if (paragraph.size < 8)
    warnings.push(
      "El texto de reconocimiento queda muy pequeño. Amplía el espacio o acorta el texto.",
    );
  const dateText = clean(data.date);
  if (dateText) {
    const dateSize = fitSingleLine(
      context,
      dateText,
      date.size,
      date.fontFamily,
      false,
      boxWidth(date),
    );
    context.textAlign = "center";
    context.fillText(
      dateText,
      (DESIGN_WIDTH * date.x) / 100,
      (height * date.y) / 100,
    );
    if (dateSize < date.size - 0.01)
      warnings.push("Se redujo la fecha para ajustarla al espacio disponible.");
  }
  const signatureBounds = drawSignatures(
    context,
    data.signers || [],
    signatures,
    height,
    warnings,
  );
  if (paragraph.lines.length && signatureBounds.length) {
    const paragraphWidth = Math.max(
      ...paragraph.lines.map((line) => line.width),
    );
    const paragraphHeight =
      (paragraph.lines.length - 1) * paragraph.lineHeight + paragraph.size;
    const paragraphX = (DESIGN_WIDTH * body.x) / 100;
    const paragraphY = (height * body.y) / 100;
    if (
      signatureBounds.some(
        (bounds) =>
          bounds.left < paragraphX + paragraphWidth / 2 &&
          bounds.right > paragraphX - paragraphWidth / 2 &&
          bounds.top < paragraphY + paragraphHeight / 2 &&
          bounds.bottom > paragraphY - paragraphHeight / 2,
      )
    ) {
      warnings.push(
        "Las firmas se superponen con el texto de reconocimiento. Ajusta la posición, el tamaño o la altura de las firmas antes de descargar.",
      );
    }
  }
  return { nameSize, bodySize: paragraph.size, warnings };
}

export function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      image.onload = null;
      image.onerror = null;
      if (!image.naturalWidth || !image.naturalHeight)
        reject(new Error("La imagen no tiene dimensiones válidas."));
      else resolve(image);
    };
    image.onerror = () => {
      image.onload = null;
      image.onerror = null;
      reject(
        new Error(
          "No se pudo leer la imagen. Usa un archivo PNG, JPG o WebP válido.",
        ),
      );
    };
    image.src = url;
  });
}

export async function loadImageFile(file, { maxBytes = MAX_IMAGE_BYTES } = {}) {
  if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Elige una imagen PNG, JPG, JPEG o WebP.");
  if (!file.size || file.size > maxBytes)
    throw new Error(
      `La imagen debe pesar menos de ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    );
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageUrl(url);
    if (image.naturalWidth < 2 || image.naturalHeight < 2)
      throw new Error(
        "La imagen es demasiado pequeña. Elige una imagen de al menos 2 × 2 píxeles.",
      );
    if (image.naturalWidth * image.naturalHeight > 80_000_000)
      throw new Error(
        "La imagen es demasiado grande. Reduce sus dimensiones a menos de 80 megapíxeles.",
      );
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createCertificatePdf(canvas, { project, name } = {}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const width = canvas.width * scale;
  const height = canvas.height * scale;
  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.95),
    "JPEG",
    (pageWidth - width) / 2,
    (pageHeight - height) / 2,
    width,
    height,
    undefined,
    "FAST",
  );
  pdf.setProperties({
    title: ["Certificado", clean(project), clean(name)]
      .filter(Boolean)
      .join(" · "),
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
  try {
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    // Leave the download stream enough time to consume its object URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
