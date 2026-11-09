export function exportDimensions(variant, size) {
  if (size === "original")
    return { width: variant.width, height: variant.height };
  const edge = Number(size);
  if (![1024, 2048, 4096].includes(edge))
    throw new Error("Selecciona un tamaño disponible.");
  const ratio = edge / Math.max(variant.width, variant.height);
  return {
    width: Math.max(1, Math.round(variant.width * ratio)),
    height: Math.max(1, Math.round(variant.height * ratio)),
  };
}

export function resolveBackground(background, hex, format, transparent) {
  if (background === "personalizado" && !/^#[a-f\d]{6}$/i.test(hex))
    throw new Error("Escribe un color válido, por ejemplo #29295D.");
  if (background === "transparente")
    return format === "jpg" || !transparent ? "#ffffff" : null;
  return (
    { blanco: "#ffffff", negro: "#000000", personalizado: hex }[background] ||
    "#ffffff"
  );
}

export function resourceFilename(
  asset,
  variant,
  format,
  dimensions,
  background,
) {
  const extension =
    format === "original" ? variant.src.split(".").at(-1) : format;
  const name = `${asset.id}-${variant.id}`;
  if (format === "original" || format === "pdf") return `${name}.${extension}`;
  const suffix = background
    ? `fondo-${background.slice(1).toLowerCase()}`
    : "transparente";
  return `${name}-${dimensions.width}x${dimensions.height}-${suffix}.${extension}`;
}

async function readFile(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error("No se pudo cargar el archivo. Vuelve a intentarlo.");
  return response.blob();
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob),
      image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo preparar la imagen. Inténtalo otra vez."));
    };
    image.src = url;
  });
}

export async function createResourceFile(
  asset,
  variant,
  {
    format = "png",
    size = "4096",
    background = "transparente",
    hex = "#29295D",
    signal,
  } = {},
) {
  if (!variant.formats.includes(format))
    throw new Error("Este formato no está disponible para el recurso.");
  if (format === "original" || format === "pdf") {
    return {
      blob: await readFile(
        format === "pdf" ? variant.pdf : variant.src,
        signal,
      ),
      filename: resourceFilename(asset, variant, format, null, null),
    };
  }
  const dimensions = exportDimensions(variant, size);
  const color = resolveBackground(background, hex, format, variant.transparent);
  const filename = resourceFilename(asset, variant, format, dimensions, color);
  const original = await readFile(variant.src, signal);
  signal?.throwIfAborted();
  if (format === "svg") {
    const doc = new DOMParser().parseFromString(
      await original.text(),
      "image/svg+xml",
    );
    if (
      doc.querySelector("parsererror") ||
      doc.documentElement.localName !== "svg"
    )
      throw new Error("El archivo vectorial no se pudo leer.");
    const svg = doc.documentElement;
    svg.setAttribute("width", String(dimensions.width));
    svg.setAttribute("height", String(dimensions.height));
    if (color) {
      const [x, y, w, h] = svg
        .getAttribute("viewBox")
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      Object.entries({ x, y, width: w, height: h, fill: color }).forEach(
        ([key, value]) => rect.setAttribute(key, String(value)),
      );
      svg.insertBefore(rect, svg.firstChild);
    }
    return {
      blob: new Blob([new XMLSerializer().serializeToString(svg)], {
        type: "image/svg+xml",
      }),
      filename,
    };
  }
  const image = await loadImage(original);
  signal?.throwIfAborted();
  const canvas = document.createElement("canvas");
  Object.assign(canvas, dimensions);
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error(
      "Tu navegador no pudo preparar la descarga. Prueba otro formato.",
    );
  try {
    if (color) {
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const mime = { png: "image/png", webp: "image/webp", jpg: "image/jpeg" }[
      format
    ];
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, mime, 0.97),
    );
    if (!blob || blob.type !== mime)
      throw new Error("Tu navegador no admite este formato. Selecciona PNG.");
    signal?.throwIfAborted();
    return { blob, filename };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function saveResourceFile({ blob, filename }) {
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Give mobile browsers time to start reading the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function createResourceKit(asset, signal, onProgress = () => {}) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (let i = 0; i < asset.variants.length; i++) {
    const variant = asset.variants[i];
    for (const format of variant.kind === "vector"
      ? ["svg", ...(variant.pdf ? ["pdf"] : []), "png"]
      : ["original"]) {
      const file = await createResourceFile(asset, variant, {
        format,
        size: "4096",
        signal,
      });
      zip.file(file.filename, await file.blob.arrayBuffer());
    }
    onProgress(i + 1, asset.variants.length);
  }
  zip.file(
    "LEEME.txt",
    `SEDIPRO UNT — ${asset.name}\n\nVariantes institucionales. Conserva las proporciones y los colores de marca.\nPNG con lado mayor de 4096 px; SVG y PDF vectoriales cuando están disponibles.\nLos originales de imágenes conservan su resolución y fondo. Ampliar una imagen no recupera por sí solo detalle perdido.\n`,
  );
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  });
  signal?.throwIfAborted();
  return { blob, filename: `${asset.id}-kit.zip` };
}
