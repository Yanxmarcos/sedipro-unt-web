import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  exportDimensions,
  resolveBackground,
} from "../../src/lib/resource-export.mjs";
import { canOpenPanelPage } from "../../src/lib/panel-permissions.mjs";
import {
  resourceGalleryEntries,
  filterResourceEntries,
} from "../../src/lib/resource-gallery.mjs";
import sharp from "sharp";
import { CURRENT_VERSION, RELEASES } from "../../src/lib/releases.mjs";

test("resource audit stays superadmin-only and release history describes the catalogue", () => {
  for (const rol of [
    "SEDIPRANO",
    "DIRECTIVA",
    "ADMINISTRADOR",
    "SUPERADMINISTRADOR",
  ]) {
    for (const pathname of [
      "/panel/recursos/auditoria",
      "/panel/recursos/auditoria/entry",
    ])
      assert.equal(
        canOpenPanelPage(pathname, { rol }),
        rol === "SUPERADMINISTRADOR",
      );
  }
  assert.equal(RELEASES[0].version, CURRENT_VERSION);
  assert.equal(new Set(RELEASES.map((r) => r.version)).size, RELEASES.length);
  assert.ok(
    RELEASES[0].changes.some(
      (text) => text.includes("Recursos institucionales"),
    ),
  );
});

const root = fileURLToPath(new URL("../../", import.meta.url));
const catalog = JSON.parse(
  await readFile(path.join(root, "src/lib/resource-catalog.json"), "utf8"),
);

test("catalogue contains only enduring institutional resources, without projects", () => {
  assert(!catalog.categories.some((category) => category.id === "proyectos"));
  assert(!catalog.assets.some((asset) => asset.category === "proyectos"));
  assert.equal(catalog.assets.length, 38);
});

test("each visible variant has a unique card and searches match that variant", () => {
  const entries = resourceGalleryEntries(catalog);
  assert.equal(entries.length, 63);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 63);
  assert.equal(filterResourceEntries(entries, "areas", "insignia").length, 5);
  assert(
    filterResourceEntries(entries, "areas", "")
      .slice(0, 5)
      .every((entry) => entry.asset.id.startsWith("insignia-")),
  );
  const white = filterResourceEntries(entries, "todos", "blanco");
  assert.equal(white.length, 6);
  assert(white.every((entry) => entry.variant.id === "blanco"));
  assert.equal(filterResourceEntries(entries, "hito", "lapiz").length, 1);
});

test("running Hito serves a transparent cutout and keeps opaque source archived", async () => {
  const variant = catalog.assets.find((asset) => asset.id === "hito-corriendo")
    .variants[0];
  assert(variant.transparent);
  assert.equal(variant.name, "Sin fondo");
  assert(variant.src.includes("sin-fondo-v1"));
  assert(variant.preview.includes("sin-fondo-v1"));
  const file = path.join(root, "public", variant.src);
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0);
  const last = (info.width * info.height - 1) * 4;
  assert.equal(data[last + 3], 0);
  let blackDetails = 0,
    transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) transparent++;
    if (
      data[i + 3] > 250 &&
      data[i] < 40 &&
      data[i + 1] < 40 &&
      data[i + 2] < 40
    )
      blackDetails++;
  }
  assert(transparent > info.width * info.height * 0.4);
  assert(blackDetails > 100, "Dark pupils and claws must not be erased");
  const source = await sharp(
    path.join(root, "public/recursos/originales/hito-corriendo.png"),
  ).stats();
  assert(source.isOpaque);
});

test("all five area insignias are transparent 4K with the complete official white footer", async () => {
  const stamp = await sharp(
    path.join(root, "public/recursos/marca/logo-unt-blanco.svg"),
    { density: 300 },
  )
    .resize({ width: 620 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let untPixels = 0;
  for (const area of ["gth", "pmo", "ti", "mkt", "ltk-fnz"]) {
    const variant = catalog.assets.find((a) => a.id === `insignia-${area}`)
      .variants[0];
    const file = path.join(root, "public", variant.src);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, 4096);
    assert.equal(metadata.height, 4096);
    assert(metadata.hasAlpha);
    const corner = await sharp(file)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .ensureAlpha()
      .raw()
      .toBuffer();
    assert.equal(corner[3], 0);
    const patch = await sharp(file)
      .extract({
        left: Math.round((4096 - 620) / 2),
        top: Math.round(4096 * 0.895),
        width: 620,
        height: stamp.info.height,
      })
      .ensureAlpha()
      .raw()
      .toBuffer();
    let expected = 0,
      white = 0;
    for (let y = 0; y < stamp.info.height; y++)
      for (let x = 0; x < 620; x++) {
        const i = (y * 620 + x) * 4;
        if (stamp.data[i + 3] > 250) {
          expected++;
          if (
            patch[i] > 250 &&
            patch[i + 1] > 250 &&
            patch[i + 2] > 250 &&
            patch[i + 3] > 250
          )
            white++;
          if (x > 620 * 0.75 && y > stamp.info.height * 0.6) untPixels++;
        }
      }
    assert(white / expected > 0.999, `Official white mark missing in ${area}`);
  }
  assert(untPixels > 100, "Footer must include the smaller UNT lettering");
});

test("catalog files exist, vector downloads retain paths and original Hito is retained", async () => {
  assert.equal(
    new Set(catalog.assets.map((a) => a.id)).size,
    catalog.assets.length,
  );
  for (const asset of catalog.assets) {
    assert(catalog.categories.some((c) => c.id === asset.category));
    assert.equal(
      new Set(asset.variants.map((v) => v.id)).size,
      asset.variants.length,
    );
    for (const variant of asset.variants) {
      assert(variant.width > 0 && variant.height > 0);
      for (const url of [
        variant.src,
        variant.preview,
        ...(variant.pdf ? [variant.pdf] : []),
      ]) {
        assert(url.startsWith("/recursos/"));
        const bytes = await readFile(path.join(root, "public", url));
        assert(bytes.length > 0);
        if (url.endsWith(".svg")) {
          const text = bytes.toString();
          assert(text.includes("<path"));
          assert(
            !/<image\b|<script\b|foreignObject|https?:\/\/(?!www.w3.org)/i.test(
              text,
            ),
          );
        }
        if (url.endsWith(".pdf")) {
          assert(
            bytes.length < 1024 * 1024,
            "Delivery PDF must not carry Illustrator private editing data",
          );
          assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
        }
      }
    }
  }
  const hito = catalog.assets.find((a) => a.id === "hito-ejecutivo");
  assert.equal(hito.variants[0].id, "original");
  assert(hito.variants.some((v) => v.id === "mejorado" && v.width === 1254));
});

test("export dimensions preserve proportions and restrict large canvas allocations", () => {
  const variant = { width: 1200, height: 600 };
  assert.deepEqual(exportDimensions(variant, "4096"), {
    width: 4096,
    height: 2048,
  });
  assert.deepEqual(exportDimensions(variant, "original"), {
    width: 1200,
    height: 600,
  });
  assert.throws(() => exportDimensions(variant, "99999999"));
  assert.throws(() => exportDimensions(variant, "NaN"));
  assert.equal(resolveBackground("transparente", "#112233", "png", true), null);
  assert.equal(
    resolveBackground("transparente", "#112233", "jpg", true),
    "#ffffff",
  );
  assert.equal(
    resolveBackground("transparente", "#112233", "png", false),
    "#ffffff",
  );
  assert.throws(() =>
    resolveBackground("personalizado", "javascript:alert(1)", "png", true),
  );
});

test("all institutional roles can access the resource library", () => {
  for (const rol of [
    "SEDIPRANO",
    "DIRECTIVA",
    "ADMINISTRADOR",
    "SUPERADMINISTRADOR",
    "USER",
    "ADMIN",
  ])
    assert(canOpenPanelPage("/panel/recursos", { rol }));
  assert.equal(canOpenPanelPage("/panel/recursos", { rol: "EXTERNO" }), false);
});
