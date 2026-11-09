// Authoring only: copy supplied originals and encode lightweight gallery previews.
// No AI reconstruction, background removal or sharpening is performed here.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const external = process.argv[2];
if (!external) throw new Error("Provide the SEDIPRO source folder.");
const output = path.join(root, "public/recursos");
await fs.mkdir(path.join(output, "originales"), { recursive: true });
await fs.mkdir(path.join(output, "vistas"), { recursive: true });
const vectors = JSON.parse(
  await fs.readFile(
    path.join(root, ".impeccable/review/recursos/vectores.json"),
    "utf8",
  ),
);
const assets = [];
const origins = [];
const categories = [
  { id: "marca", name: "SEDIPRO UNT" },
  { id: "isotipos", name: "Isotipos" },
  { id: "areas", name: "Áreas" },
  { id: "hito", name: "Hito" },
];
const areas = {
  unt: "UNT",
  ti: "TI",
  pmo: "PMO",
  gth: "GTH",
  mkt: "MKT",
  "ltk-fnz": "LTK y FNZ",
};

async function preview(src, id) {
  const buffer = await fs.readFile(src);
  await sharp(buffer)
    .resize(480, 400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(output, "vistas", `${id}.webp`));
  origins.push({
    path: `public/recursos/vistas/${id}.webp`,
    source: path.relative(root, src).replaceAll("\\", "/"),
    operation: "gallery preview encoding; no retouching",
  });
  return `/recursos/vistas/${id}.webp`;
}

async function vectorVariant(slug, id, name) {
  const row = vectors.find((v) => v.slug === slug);
  if (!row) throw new Error(`Missing extracted vector: ${slug}`);
  const src = path.join(output, "marca", `${slug}.svg`);
  origins.push({
    path: `public/recursos/marca/${slug}.svg`,
    source: `User-supplied SEDIPRO LOGO.ai, artboard ${row.artboard}`,
    operation: "original vector paths and colors extracted",
  });
  origins.push({
    path: `public/recursos/marca/${slug}.pdf`,
    source: `User-supplied SEDIPRO LOGO.ai, artboard ${row.artboard}`,
    operation: "original vector PDF page, cropped to artwork",
  });
  return {
    id,
    name,
    src: `/recursos/marca/${slug}.svg`,
    pdf: `/recursos/marca/${slug}.pdf`,
    preview: await preview(src, slug),
    width: row.width,
    height: row.height,
    kind: "vector",
    transparent: true,
    light: id === "claro",
    formats: ["png", "svg", "pdf", "webp", "jpg"],
    quality: "Vectorial",
  };
}

for (const [area, label] of Object.entries(areas)) {
  const variants = [
    await vectorVariant(`logo-${area}-color`, "color", "Color institucional"),
  ];
  if (area !== "unt")
    variants.push(
      await vectorVariant(`logo-${area}-claro`, "claro", "Para fondos oscuros"),
    );
  // Monochrome logo variants retain the source geometry exactly.
  for (const [id, name, color] of [
    ["blanco", "Blanco", "#ffffff"],
    ["negro", "Negro", "#111111"],
  ]) {
    const base = variants[0];
    const slug = `logo-${area}-${id}`;
    const svg = (
      await fs.readFile(
        path.join(output, `marca/logo-${area}-color.svg`),
        "utf8",
      )
    ).replace(/fill="#[a-f\d]{6}"/gi, `fill="${color}"`);
    const src = path.join(output, "marca", `${slug}.svg`);
    await fs.writeFile(src, svg);
    origins.push({
      path: `public/recursos/marca/${slug}.svg`,
      source: `SEDIPRO LOGO.ai, original logo-${area}-color paths`,
      operation: `approved monochrome variant ${color}; geometry unchanged`,
    });
    variants.push({
      ...base,
      id,
      name,
      src: `/recursos/marca/${slug}.svg`,
      pdf: null,
      preview: await preview(src, slug),
      light: id === "blanco",
      formats: ["png", "svg", "webp", "jpg"],
    });
  }
  assets.push({
    id: `logo-${area}`,
    name: area === "unt" ? "SEDIPRO UNT · Horizontal" : `SEDIPRO ${label}`,
    category: area === "unt" ? "marca" : "areas",
    tags: ["logo", "marca", "horizontal", label],
    variants,
  });
  assets.push({
    id: `isotipo-${area}`,
    name: `Isotipo ${area === "unt" ? "SEDIPRO UNT" : label}`,
    category: "isotipos",
    tags: ["símbolo", "isotipo", label],
    variants: [
      await vectorVariant(
        `isotipo-${area}-color`,
        "color",
        "Color institucional",
      ),
      await vectorVariant(
        `isotipo-${area}-claro`,
        "claro",
        "Para fondos oscuros",
      ),
    ],
  });
}
assets.splice(1, 0, {
  id: "logo-unt-vertical",
  name: "SEDIPRO UNT · Vertical",
  category: "marca",
  tags: ["logo", "vertical"],
  variants: [
    await vectorVariant(
      "logo-unt-vertical-color",
      "color",
      "Color institucional",
    ),
    await vectorVariant(
      "logo-unt-vertical-claro",
      "claro",
      "Para fondos oscuros",
    ),
  ],
});

async function raster(
  id,
  name,
  category,
  source,
  tags = [],
  transparent = true,
) {
  const metadata = await sharp(source).metadata();
  const extension = path.extname(source).toLowerCase();
  const dest = path.join(output, "originales", `${id}${extension}`);
  await fs.copyFile(source, dest);
  origins.push({
    path: `public/recursos/originales/${id}${extension}`,
    source: path.relative(external, source).replaceAll("\\", "/"),
    operation: "original file copied without modification",
  });
  assets.push({
    id,
    name,
    category,
    tags,
    variants: [
      {
        id: "original",
        name: "Original",
        src: `/recursos/originales/${id}${extension}`,
        preview: await preview(dest, id),
        width: metadata.width,
        height: metadata.height,
        kind: "raster",
        transparent,
        formats: ["png", "webp", "jpg", "original"],
        quality: "Original",
      },
    ],
  });
}
const poses = [
  ["Ejecutivo", "Ejecutivo"],
  ["Ejecutivo 2", "Ejecutivo · Variante"],
  ["lapiz", "Con lápiz"],
  ["Lateral", "De perfil"],
  ["MUCHA DUDA", "Con dudas"],
  ["NEUTRO_1", "Brazos abiertos"],
  ["NEUTRO_2", "Presentando"],
  ["Organización", "Organizando"],
  ["pensando 1", "Pensando"],
  ["pensando 2", "Pensando · Variante"],
  ["Pensativo", "Pensativo"],
  ["Plantilla", "Brazos extendidos"],
  ["Regalo", "Con regalo"],
  ["Saludando 2", "Saludando · Variante"],
  ["Saludando", "Saludando"],
  ["celebracion", "Celebrando"],
  ["Disculpa", "Pidiendo disculpas"],
  ["Disculpa2", "Pidiendo disculpas · Variante"],
];
for (const [file, name] of poses) {
  const id = `hito-${file
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  await raster(
    id,
    `Hito · ${name}`,
    "hito",
    path.join(external, "HITO EL BUHO", `HITO - ${file}.png`),
    ["mascota", name],
  );
}
// Preserve the supplied opaque source, but serve the transparent cutout in the
// catalogue and every download option. Versioned preview avoids stale black tiles.
const runningOriginal = path.join(output, "originales/hito-corriendo.png");
await fs.copyFile(
  path.join(external, "HITO EL BUHO/Hito-corriendo.png"),
  runningOriginal,
);
origins.push({
  path: "public/recursos/originales/hito-corriendo.png",
  source: "User-supplied Hito-corriendo.png",
  operation:
    "Opaque original preserved unchanged as source archive; not displayed in catalogue",
});
const runningCutout = path.join(
  output,
  "mejorados/hito-corriendo-sin-fondo-v1.png",
);
const runningMetadata = await sharp(runningCutout).metadata();
origins.push({
  path: "public/recursos/mejorados/hito-corriendo-sin-fondo-v1.png",
  source: "User-supplied Hito-corriendo.png; built-in image edit",
  operation:
    "Black background removed with real alpha; identity/pose/color constraints and exact prompt in scripts/resources/hito-corriendo-recorte.json",
});
assets.push({
  id: "hito-corriendo",
  name: "Hito · Corriendo",
  category: "hito",
  tags: ["mascota", "correr", "sin fondo"],
  variants: [
    {
      id: "sin-fondo",
      name: "Sin fondo",
      src: "/recursos/mejorados/hito-corriendo-sin-fondo-v1.png",
      preview: await preview(runningCutout, "hito-corriendo-sin-fondo-v1"),
      width: runningMetadata.width,
      height: runningMetadata.height,
      kind: "raster",
      transparent: true,
      formats: ["png", "webp", "jpg", "original"],
      quality: "Recorte sin fondo",
    },
  ],
});
await raster(
  "hito-bienvenida",
  "Hito · Bienvenida",
  "hito",
  path.join(root, "public/img/buho.webp"),
  ["mascota", "saludar"],
);
const aiPath = path.join(external, "LOGOS/SEDIPRO/SEDIPRO LOGO.ai");
// Restore the artwork once; compose the exact official white vector mark at
// delivery resolution. Typography is never regenerated by the image model.
const insigniaSources = JSON.parse(
  await fs.readFile(
    path.join(root, "scripts/resources/insignias/procedencia.json"),
    "utf8",
  ),
);
const officialWhiteLogo = path.join(output, "marca/logo-unt-blanco.svg");
const footer = await sharp(officialWhiteLogo, { density: 300 })
  .resize({ width: 620 })
  .png()
  .toBuffer();
const footerMetadata = await sharp(footer).metadata();
for (const source of insigniaSources) {
  const id = `insignia-${source.id}`;
  const plate = path.join(
    root,
    "scripts/resources/insignias/plates",
    `${source.id}.png`,
  );
  const native = await sharp(plate).metadata();
  const destination = path.join(output, "originales", `${id}.webp`);
  await sharp(plate)
    .resize(4096, 4096, { fit: "contain", background: "#00000000" })
    .composite([
      {
        input: footer,
        left: Math.round((4096 - footerMetadata.width) / 2),
        top: Math.round(4096 * 0.895),
      },
    ])
    .webp({ lossless: true, effort: 5 })
    .toFile(destination);
  const detailPreview = `/recursos/vistas/${id}-detalle.webp`;
  await sharp(destination)
    .resize(1024)
    .webp({ quality: 95 })
    .toFile(path.join(root, "public", detailPreview));
  origins.push({
    path: `public/recursos/originales/${id}.webp`,
    source: `${source.reference}; restoration prompts in scripts/resources/insignias/procedencia.json; official logo-unt-blanco.svg`,
    operation: `Restored raster ${native.width}x${native.height}, transparent plate; prepared at4096x4096 with official white SEDIPRO UNT vector footer, unchanged vector geometry. Not native4K photography.`,
  });
  origins.push({
    path: `public${detailPreview}`,
    source: `public/recursos/originales/${id}.webp`,
    operation:
      "1024px detail preview encoding; full4K source used for downloads",
  });
  assets.push({
    id,
    name: `Insignia circular ${source.area}`,
    category: "areas",
    tags: [source.area, "insignia", "circular", "redonda"],
    variants: [
      {
        id: "restaurada",
        name: "Restaurada · 4K",
        src: `/recursos/originales/${id}.webp`,
        preview: await preview(destination, id),
        detailPreview,
        width: 4096,
        height: 4096,
        sourceWidth: native.width,
        sourceHeight: native.height,
        kind: "raster",
        transparent: true,
        formats: ["png", "webp", "jpg", "original"],
        quality: "Versión restaurada",
        prepared4k: true,
      },
    ],
  });
}
const enhanced = path.join(output, "mejorados/hito-ejecutivo-v1.png");
// Area insignias lead the area collection so they are immediately findable.
const areaInsignias = assets.filter((asset) =>
  asset.id.startsWith("insignia-"),
);
const rest = assets.filter((asset) => !asset.id.startsWith("insignia-"));
const firstArea = rest.findIndex((asset) => asset.category === "areas");
assets.splice(
  0,
  assets.length,
  ...rest.slice(0, firstArea),
  ...areaInsignias,
  ...rest.slice(firstArea),
);
try {
  const metadata = await sharp(enhanced).metadata();
  const executive = assets.find((asset) => asset.id === "hito-ejecutivo");
  executive.variants.push({
    ...executive.variants[0],
    id: "mejorado",
    name: "Nitidez mejorada",
    quality: "Versión mejorada",
    src: "/recursos/mejorados/hito-ejecutivo-v1.png",
    preview: await preview(enhanced, "hito-ejecutivo-mejorado"),
    width: metadata.width,
    height: metadata.height,
  });
  origins.push({
    path: "public/recursos/mejorados/hito-ejecutivo-v1.png",
    source:
      "User-supplied HITO - Ejecutivo.png; built-in image editing; accepted sample 2026-11-08",
    operation:
      "Faithful restoration derivative; original retained. Prompt and identity rules: scripts/resources/HITO-CURACION.md",
  });
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await fs.mkdir(path.join(output, "fuentes"), { recursive: true });
await fs.copyFile(aiPath, path.join(output, "fuentes/sedipro-identidad.ai"));
origins.push({
  path: "public/recursos/fuentes/sedipro-identidad.ai",
  source: "User-supplied SEDIPRO LOGO.ai",
  operation: "original Illustrator source copied unchanged",
});
await fs.writeFile(
  path.join(root, "src/lib/resource-catalog.json"),
  JSON.stringify(
    {
      categories,
      assets,
      sourceFile: "/recursos/fuentes/sedipro-identidad.ai",
    },
    null,
    2,
  ) + "\n",
);
await fs.writeFile(
  path.join(output, "procedencia.json"),
  JSON.stringify({ updated: "2026-11-08", assets: origins }, null, 2) + "\n",
);
console.log(
  `${assets.length} recursos preparados; ${assets.reduce((sum, a) => sum + a.variants.length, 0)} variantes. Fuentes conservadas.`,
);
