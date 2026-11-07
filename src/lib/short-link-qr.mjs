const INK = "#29295d";
const PURPLE = "#762477";
let symbolPromise;
const sources = new Map();
export const QR_DOWNLOAD_STYLES = [
  { id: "institutional", label: "Institucional", suffix: "" },
  { id: "black-white", label: "Negro sobre blanco", suffix: "-negro-blanco" },
  { id: "white-black", label: "Blanco sobre negro", suffix: "-blanco-negro" },
];
function palette(style) {
  const monochrome = style === "black-white" || style === "white-black";
  const inverted = style === "white-black";
  return {
    ink: monochrome ? (inverted ? "#ffffff" : "#000000") : INK,
    paper: inverted ? "#000000" : "#ffffff",
    modules: monochrome ? (inverted ? "#ffffff" : "#000000") : "url(#flow)",
    monochrome,
  };
}

async function loadSymbol() {
  if (!symbolPromise) {
    symbolPromise = (async () => {
      const response = await fetch("/logos/sedi-simbolo.svg", {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Logo no disponible");
      const document = new DOMParser().parseFromString(
        await response.text(),
        "image/svg+xml",
      );
      if (document.querySelector("parsererror"))
        throw new Error("Logo inválido");
      const paths = [...document.querySelectorAll("path")].map((path) => ({
        d: path.getAttribute("d"),
        fill: path.getAttribute("fill"),
      }));
      if (paths.length !== 3) throw new Error("Logo inválido");
      return paths;
    })().catch(() => {
      symbolPromise = undefined;
      throw new Error(
        "No se pudo cargar el símbolo de SEDIPRO UNT. Vuelve a intentarlo.",
      );
    });
  }
  return symbolPromise;
}

function validateUrl(shortUrl) {
  const url = new URL(shortUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !/^\/(fb|ig|lk|tk|wa|fm|yt|gd|go)\/[a-z0-9]{3}$/.test(url.pathname) ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("No se pudo generar el QR de este enlace institucional.");
  return url.href;
}

// Round exposed corners while connected modules remain joined at full width.
function modulePath(x, y, matrix) {
  const dark = (row, col) =>
    row >= 0 &&
    col >= 0 &&
    row < matrix.size &&
    col < matrix.size &&
    matrix.get(row, col);
  const n = dark(y - 1, x),
    e = dark(y, x + 1),
    s = dark(y + 1, x),
    w = dark(y, x - 1);
  const tl = !n && !w ? 0.48 : 0,
    tr = !n && !e ? 0.48 : 0;
  const br = !s && !e ? 0.48 : 0,
    bl = !s && !w ? 0.48 : 0;
  return `M${x + tl},${y}H${x + 1 - tr}Q${x + 1},${y} ${x + 1},${y + tr}V${y + 1 - br}Q${x + 1},${y + 1} ${x + 1 - br},${y + 1}H${x + bl}Q${x},${y + 1} ${x},${y + 1 - bl}V${y + tl}Q${x},${y} ${x + tl},${y}Z`;
}

const finderCell = (x, y, size) =>
  (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);

function finder(x, y, colors) {
  return `<g transform="translate(${x} ${y})"><circle cx="3.5" cy="3.5" r="3.5" fill="${colors.ink}"/><circle cx="3.5" cy="3.5" r="2.5" fill="${colors.paper}"/><circle cx="3.5" cy="3.5" r="1.5" fill="${colors.modules}"/></g>`;
}

function qrSvg(matrix, paths, style = "institutional") {
  const colors = palette(style);
  const size = matrix.size,
    edge = size + 8;
  const cells = [],
    reserved = [],
    reservedLight = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (finderCell(x, y, size)) continue;
      if (matrix.isReserved(y, x)) {
        (matrix.get(y, x) ? reserved : reservedLight).push(
          `M${x},${y}h1v1h-1Z`,
        );
      } else if (matrix.get(y, x)) cells.push(modulePath(x, y, matrix));
    }
  // The white clearance follows the original symbol, not a rectangular plate.
  // Enlarging the emblem to 34% keeps it prominent without covering the finders.
  const width = size * 0.34,
    height = (width * 555) / 580;
  const x = (size - width) / 2,
    y = (size - height) / 2;
  const halo = paths.map(({ d }) => `<path d="${d}"/>`).join("");
  const symbol = paths
    .map(
      ({ d, fill }) =>
        `<path d="${d}" fill="${colors.monochrome ? colors.ink : fill}"/>`,
    )
    .join("");
  const art = `<path d="${cells.join("")}" fill="${colors.modules}"/><g transform="translate(${x} ${y}) scale(${width / 580})"><g fill="${colors.paper}" stroke="${colors.paper}" stroke-width="${(2.6 * 580) / width}" stroke-linejoin="round">${halo}</g>${symbol}</g>`;
  // Functional timing/alignment/format patterns remain intact above the artwork.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 ${edge} ${edge}"><defs><linearGradient id="flow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${INK}"/><stop offset=".45" stop-color="#304d90"/><stop offset="1" stop-color="${PURPLE}"/></linearGradient></defs><rect width="${edge}" height="${edge}" fill="${colors.paper}"/><g transform="translate(4 4)">${art}<path d="${reservedLight.join("")}" fill="${colors.paper}"/><path d="${reserved.join("")}" fill="${colors.ink}"/>${finder(0, 0, colors)}${finder(size - 7, 0, colors)}${finder(0, size - 7, colors)}</g></svg>`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("No se pudo dibujar el QR. Vuelve a intentarlo."));
    image.src = url;
  });
}

async function verifiedImage(
  svg,
  url,
  decoder,
  compatibility,
  inverted = false,
) {
  const imageUrl = URL.createObjectURL(svg);
  try {
    const image = await loadImage(imageUrl);
    return readable(image, url, decoder, inverted) &&
      readableCompatible(image, url, compatibility, inverted)
      ? image
      : null;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function createSource(url) {
  const [{ default: QRCode }, paths, decoder, importedCompatibility] =
    await Promise.all([
      import("qrcode"),
      loadSymbol(),
      import("@zxing/library"),
      import("html5-qrcode/third_party/zxing-js.umd.js"),
    ]);
  const compatibility = importedCompatibility.default || importedCompatibility;
  // Keep the literal lowercase URL; all export styles share one verified matrix.
  const preferred = QRCode.create(url, {
    errorCorrectionLevel: "H",
  }).maskPattern;
  const masks = [
    preferred,
    ...Array.from({ length: 8 }, (_, mask) => mask).filter(
      (mask) => mask !== preferred,
    ),
  ];
  for (const maskPattern of masks) {
    const matrix = QRCode.create(url, {
      errorCorrectionLevel: "H",
      maskPattern,
    }).modules;
    let valid = true;
    // Validate both contrast families before choosing their shared mask.
    // Inverted readers normalize to the monochrome family.
    for (const style of ["institutional", "black-white"]) {
      const svg = new Blob([qrSvg(matrix, paths, style)], {
        type: "image/svg+xml",
      });
      if (!(await verifiedImage(svg, url, decoder, compatibility))) {
        valid = false;
        break;
      }
    }
    if (valid) return { matrix, paths, decoder, compatibility };
  }
  throw new Error(
    "No se pudo verificar la lectura del QR. Vuelve a intentarlo.",
  );
}

function getSource(url) {
  if (!sources.has(url)) {
    const pending = createSource(url).catch((error) => {
      if (sources.get(url) === pending) sources.delete(url);
      throw error;
    });
    sources.set(url, pending);
    // Keep only tiny matrix/decoder references, never preview/export images.
    if (sources.size > 8) sources.delete(sources.keys().next().value);
  }
  return sources.get(url);
}

export async function renderShortLinkQrFiles(
  shortUrl,
  style = "institutional",
) {
  if (!QR_DOWNLOAD_STYLES.some((option) => option.id === style))
    throw new Error("Selecciona un estilo de descarga válido.");
  const url = validateUrl(shortUrl);
  const { matrix, paths, decoder, compatibility } = await getSource(url);
  const svg = new Blob([qrSvg(matrix, paths, style)], {
    type: "image/svg+xml",
  });
  const image = await verifiedImage(
    svg,
    url,
    decoder,
    compatibility,
    style === "white-black",
  );
  if (!image)
    throw new Error(
      "No se pudo verificar la lectura de este estilo. Prueba otra opción.",
    );
  return { png: await imageToPng(image, 1024), svg };
}

function readableCompatible(image, expected, decoder, inverted = false) {
  const canvas = document.createElement("canvas");
  const hints = new Map([
    [decoder.DecodeHintType.POSSIBLE_FORMATS, [decoder.BarcodeFormat.QR_CODE]],
    [decoder.DecodeHintType.TRY_HARDER, false],
  ]);
  try {
    // Use the file-scanner's exported decoder directly: no camera, hidden DOM
    // scanner or additional Blob URLs. The package version is pinned.
    for (const size of [192, 256, 288, 320, 512, 1024]) {
      canvas.width = canvas.height = size + 200;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.fillStyle = inverted ? "black" : "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 100, 100, size, size);
      if (inverted) {
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pixels.data.length; i += 4) {
          pixels.data[i] = 255 - pixels.data[i];
          pixels.data[i + 1] = 255 - pixels.data[i + 1];
          pixels.data[i + 2] = 255 - pixels.data[i + 2];
        }
        context.putImageData(pixels, 0, 0);
      }
      const bitmap = new decoder.BinaryBitmap(
        new decoder.HybridBinarizer(
          new decoder.HTMLCanvasElementLuminanceSource(canvas),
        ),
      );
      const result = new decoder.MultiFormatReader(false, hints).decode(bitmap);
      if (result.text !== expected) return false;
    }
    return true;
  } catch {
    return false;
  } finally {
    canvas.width = canvas.height = 1;
  }
}

function readable(
  image,
  expected,
  { QRCodeReader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource },
  inverted = false,
) {
  const canvas = document.createElement("canvas");
  try {
    // Validate both the raw file and a surrounding white surface. Their
    // different pixel alignment changes adaptive threshold blocks in scanners.
    for (const margin of [0, 100])
      for (const size of [192, 256, 288, 320, 512, 1024]) {
        canvas.width = canvas.height = size + margin * 2;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.fillStyle = inverted ? "black" : "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, margin, margin, size, size);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        for (const mode of ["weighted", "native"]) {
          const luminance = new Uint8ClampedArray(canvas.width * canvas.height);
          for (let index = 0; index < luminance.length; index++) {
            const offset = index * 4;
            luminance[index] =
              mode === "weighted"
                ? (306 * pixels[offset] +
                    601 * pixels[offset + 1] +
                    117 * pixels[offset + 2] +
                    512) >>
                  10
                : (pixels[offset] +
                    2 * pixels[offset + 1] +
                    pixels[offset + 2]) >>
                  2;
          }
          if (inverted)
            for (let i = 0; i < luminance.length; i++)
              luminance[i] = 255 - luminance[i];
          const source = new RGBLuminanceSource(
            luminance,
            canvas.width,
            canvas.height,
          );
          const result = new QRCodeReader().decode(
            new BinaryBitmap(new HybridBinarizer(source)),
          );
          if (result.getText() !== expected) return false;
        }
      }
    return true;
  } catch {
    return false;
  } finally {
    canvas.width = canvas.height = 1;
  }
}

async function imageToPng(image, size) {
  const canvas = document.createElement("canvas");
  try {
    canvas.width = canvas.height = size;
    canvas.getContext("2d").drawImage(image, 0, 0, size, size);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("No se pudo preparar la descarga del QR.")),
        "image/png",
      ),
    );
  } finally {
    // Release the large export canvas immediately, particularly on mobile.
    canvas.width = canvas.height = 1;
  }
}

export async function exportShortLinkQrPng(svg) {
  const url = URL.createObjectURL(svg);
  try {
    return await imageToPng(await loadImage(url), 4096);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderShortLinkQr(shortUrl, style = "institutional") {
  return (await renderShortLinkQrFiles(shortUrl, style)).png;
}
