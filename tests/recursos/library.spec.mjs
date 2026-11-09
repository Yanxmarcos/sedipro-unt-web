import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import JSZip from "jszip";

const evidence = ".impeccable/review/recursos";
async function setup(page, role = "SEDIPRANO", theme = "dark") {
  await page.context().addCookies([
    {
      name: "auth_token",
      value: "resource-qa",
      url: "http://127.0.0.1:7012",
    },
  ]);
  await page.addInitScript(
    (theme) => localStorage.setItem("theme", theme),
    theme,
  );
  await page.route("**/api/**", (route) => {
    const pathname = new URL(route.request().url()).pathname;
    let json = { data: [] };
    if (pathname === "/api/recursos/actividad")
      json = { id: "1234567890abcdef12345679", resultado: "iniciada" };
    if (pathname === "/api/auth/verify")
      json = {
        authenticated: true,
        user: {
          id: "1234567890abcdef12345678",
          nombres: "ANA",
          apellidos: "PRUEBA",
          rol: role,
          sedipranoId: "1234567890abcdef12345678",
        },
        session: {
          serverNow: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    return route.fulfill({ json });
  });
  await page.goto("/panel/recursos");
  await expect(
    page.getByRole("heading", {
      name: "Recursos institucionales",
      exact: true,
    }),
  ).toBeVisible();
}
async function choose(page, label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
async function download(page, button) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: button, exact: true }).click();
  const file = await pending;
  expect(await file.failure()).toBeNull();
  return {
    bytes: await readFile(await file.path()),
    name: file.suggestedFilename(),
  };
}
async function capture(page, name) {
  await mkdir(evidence, { recursive: true });
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = "eager";
    }
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
  });
  await page.screenshot({
    path: `${evidence}/${name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  if (name.startsWith("galeria")) {
    await page.screenshot({
      path: `${evidence}/${name}-completa.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
}

test("every role can open the library and find it in the tools navigation", async ({
  page,
}) => {
  for (const role of [
    "SEDIPRANO",
    "DIRECTIVA",
    "ADMINISTRADOR",
    "SUPERADMINISTRADOR",
  ]) {
    await setup(page, role);
    await expect(
      page.getByRole("link", { name: "Recursos institucionales", exact: true }),
    ).toBeVisible();
    await expect(page.locator("article")).toHaveCount(63);
    await expect(
      page.getByRole("link", { name: "Auditoría", exact: true }),
    ).toHaveCount(role === "SUPERADMINISTRADOR" ? 1 : 0);
  }
});

test("resource visits and downloads report exact asset, variant, settings and result", async ({
  page,
}) => {
  const events = [];
  await setup(page);
  await page.route("**/api/recursos/actividad**", async (route) => {
    events.push({
      method: route.request().method(),
      body: route.request().postDataJSON(),
    });
    await route.fulfill({
      json: { id: "1234567890abcdef12345679", resultado: "iniciada" },
    });
  });
  await page.reload();
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  await choose(page, "Formato", "SVG vectorial");
  await download(page, "Descargar SVG");
  await expect
    .poll(() => events.filter((e) => e.method === "PATCH").length)
    .toBe(1);
  expect(events.filter((e) => e.body.accion === "abrir_modulo")).toHaveLength(
    1,
  );
  expect(
    events.find((e) => e.body.accion === "ver_recurso").body,
  ).toMatchObject({ recursoId: "logo-unt", varianteId: "color" });
  expect(
    events.find((e) => e.body.accion === "descargar_recurso").body,
  ).toMatchObject({
    recursoId: "logo-unt",
    varianteId: "color",
    formato: "svg",
    tamano: "4096",
    fondo: "transparente",
  });
  expect(events.find((e) => e.method === "PATCH").body.resultado).toBe(
    "descarga_iniciada",
  );
  await download(page, "Descargar kit de variantes");
  await expect
    .poll(() => events.filter((e) => e.method === "PATCH").length)
    .toBe(2);
  expect(
    events.find((e) => e.body.accion === "descargar_kit").body,
  ).toMatchObject({ recursoId: "logo-unt", formato: "zip" });
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /Fuente Illustrator/ }).click();
  await pending;
  await expect
    .poll(() => events.filter((e) => e.method === "PATCH").length)
    .toBe(3);
  expect(
    events.find((e) => e.body.accion === "descargar_fuente").body.formato,
  ).toBe("ai");
});

test("download does not silently bypass a failed audit and failed image is recorded", async ({
  page,
}) => {
  await setup(page);
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.route("**/api/recursos/actividad", (route) =>
    route.fulfill({
      status: 503,
      json: { message: "Auditoría temporalmente no disponible" },
    }),
  );
  await page
    .getByRole("button", { name: "Descargar PNG", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Auditoría temporalmente no disponible" }),
  ).toBeVisible();
  expect(downloads).toBe(0);
  const results = [];
  await page.route("**/api/recursos/actividad**", (route) => {
    if (route.request().method() === "PATCH")
      results.push(route.request().postDataJSON().resultado);
    return route.fulfill({ json: { id: "1234567890abcdef12345679" } });
  });
  await page.route("**/recursos/marca/logo-unt-color.svg", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page
    .getByRole("button", { name: "Descargar PNG", exact: true })
    .click();
  await expect.poll(() => results).toEqual(["fallida"]);
  expect(downloads).toBe(0);
});

test("only superadmin opens audit, filters and confirms individual and full cleanup", async ({
  page,
}) => {
  await setup(page, "SUPERADMINISTRADOR", "light");
  const deletions = [];
  let rows = [
    {
      _id: "1234567890abcdef12345679",
      actor: { nombre: "ANA RAMOS", rol: "DIRECTIVA" },
      accion: "descargar_recurso",
      recursoNombre: "SEDIPRO UNT · Horizontal",
      varianteNombre: "Color institucional",
      formato: "png",
      tamano: "4096",
      fondo: "transparente",
      resultado: "descarga_iniciada",
      createdAt: "2026-11-08T17:00:00Z",
      puedeEliminar: true,
    },
  ];
  await page.route("**/api/recursos/auditoria**", (route) => {
    if (route.request().method() === "DELETE") {
      deletions.push(route.request().postDataJSON());
      rows = [];
      return route.fulfill({ json: { eliminados: 1 } });
    }
    return route.fulfill({
      json: {
        data: rows,
        pagination: { page: 1, pages: 1, total: rows.length },
        totalRegistros: rows.length,
        limpiarHasta: "2026-11-08T18:00:00.000Z",
      },
    });
  });
  await page.getByRole("link", { name: "Auditoría", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Auditoría de recursos", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Ana Ramos", { exact: true })).toBeVisible();
  for (const [width, theme] of [
    [1440, "light"],
    [390, "light"],
    [1440, "dark"],
    [390, "dark"],
  ]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.addInitScript(
      (theme) => localStorage.setItem("theme", theme),
      theme,
    );
    await page.reload();
    await expect(page.getByText("Ana Ramos", { exact: true })).toBeVisible();
    await capture(page, `auditoria-${width}-${theme}`);
  }
  await page
    .getByRole("textbox", { name: "Buscar en auditoría" })
    .fill("Horizontal");
  const filtered = page.waitForRequest(
    (request) =>
      request.url().includes("/api/recursos/auditoria?") &&
      new URL(request.url()).searchParams.get("q") === "Horizontal",
  );
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await filtered;
  await expect(page.getByText("Ana Ramos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Eliminar registro:/ }).click();
  await expect(
    page.getByText(/Se eliminará definitivamente la actividad/),
  ).toBeVisible();
  await capture(page, "auditoria-confirmacion-390-dark");
  await page
    .getByRole("button", { name: "Eliminar registro", exact: true })
    .click();
  await expect(page.getByText("No hay actividades para mostrar")).toBeVisible();
  expect(deletions[0]).toEqual({ confirmacion: "1234567890abcdef12345679" });
  rows = [
    {
      _id: "1234567890abcdef12345678",
      actor: { nombre: "ANA RAMOS", rol: "SEDIPRANO" },
      accion: "abrir_modulo",
      resultado: "registrada",
      createdAt: "2026-11-08T17:00:00Z",
      puedeEliminar: true,
    },
  ];
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await page
    .getByRole("button", { name: "Limpiar toda la auditoría", exact: true })
    .click();
  await expect(page.getByText(/aunque hayas aplicado filtros/)).toBeVisible();
  await page
    .getByRole("button", { name: "Eliminar definitivamente", exact: true })
    .click();
  await expect.poll(() => deletions.length).toBe(2);
  expect(deletions[1]).toMatchObject({
    modo: "limpiar",
    confirmacion: "LIMPIAR AUDITORIA",
  });
  await setup(page, "DIRECTIVA");
  await page.goto("/panel/recursos/auditoria");
  await expect(
    page.getByRole("heading", { name: "Auditoría de recursos", exact: true }),
  ).toHaveCount(0);
});

test("search, accent normalization, categories and empty state combine correctly", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: /^Hito 21$/ }).click();
  await page.getByRole("textbox", { name: "Buscar recursos" }).fill("lapiz");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Hito · Con lápiz" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Áreas 25$/ }).click();
  await expect(page.getByText("No encontramos recursos")).toBeVisible();
  await page
    .getByRole("button", { name: "Limpiar filtros", exact: true })
    .click();
  await expect(page.locator("article")).toHaveCount(63);
});

test("visible white variant opens selected and insignias download in real transparent 4K", async ({
  page,
}) => {
  await setup(page, "DIRECTIVA", "light");
  await page.getByRole("textbox", { name: "Buscar recursos" }).fill("blanco");
  await expect(page.locator("article")).toHaveCount(6);
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Blanco",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("combobox", { name: "Variante", exact: true })
      .locator('[data-slot="select-value"]'),
  ).toHaveText("Blanco");
  await expect(
    page.getByRole("button", { name: "Oscuro", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar recursos" }).fill("insignia");
  await page.getByRole("button", { name: /^Áreas 25$/ }).click();
  await expect(page.locator("article")).toHaveCount(5);
  await capture(page, "insignias-1440-light");
  await page
    .getByRole("button", {
      name: "Ver Insignia circular GTH · Restaurada · 4K",
      exact: true,
    })
    .click();
  const png = await download(page, "Descargar PNG");
  const m = await sharp(png.bytes).metadata();
  expect(m.width).toBe(4096);
  expect(m.height).toBe(4096);
  expect(m.hasAlpha).toBe(true);
  await capture(page, "insignia-detalle-1440-light");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  const ai = page.waitForEvent("download");
  await page.getByRole("button", { name: /Fuente Illustrator/ }).click();
  expect(
    (await readFile(await (await ai).path())).equals(
      await readFile("public/recursos/fuentes/sedipro-identidad.ai"),
    ),
  ).toBe(true);
});

test("running Hito has no black tile and PNG/original downloads keep transparency", async ({
  page,
}) => {
  for (const [width, height, theme] of [
    [1440, 1000, "light"],
    [390, 844, "dark"],
  ]) {
    await page.setViewportSize({ width, height });
    await setup(page, "SEDIPRANO", theme);
    await page
      .getByRole("textbox", { name: "Buscar recursos" })
      .fill("corriendo");
    await expect(page.locator("article")).toHaveCount(1);
    await expect(page.locator("article")).not.toContainText(
      "Con fondo original",
    );
    await expect(
      page.getByRole("img", { name: "Hito · Corriendo", exact: true }),
    ).toHaveAttribute("src", /hito-corriendo-sin-fondo-v1/);
    await capture(page, `corriendo-galeria-${width}-${theme}`);
    await page
      .getByRole("button", {
        name: "Ver Hito · Corriendo · Sin fondo",
        exact: true,
      })
      .click();
    await capture(page, `corriendo-detalle-${width}-${theme}`);
    if (width === 1440) {
      const png = await download(page, "Descargar PNG");
      const metadata = await sharp(png.bytes).metadata();
      expect(Math.max(metadata.width, metadata.height)).toBe(4096);
      expect(metadata.hasAlpha).toBe(true);
      const pixel = await sharp(png.bytes)
        .extract({ left: 0, top: 0, width: 1, height: 1 })
        .ensureAlpha()
        .raw()
        .toBuffer();
      expect(pixel[3]).toBe(0);
      await choose(page, "Formato", "Archivo original");
      const raw = await download(page, "Descargar original");
      const stats = await sharp(raw.bytes).stats();
      expect(stats.isOpaque).toBe(false);
      expect(
        raw.bytes.equals(
          await readFile(
            "public/recursos/mejorados/hito-corriendo-sin-fondo-v1.png",
          ),
        ),
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  }
});

test("real vector exports preserve transparency, dimensions, custom background and PDF", async ({
  page,
}) => {
  await setup(page, "DIRECTIVA");
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const transparent = await download(page, "Descargar PNG");
  const meta = await sharp(transparent.bytes).metadata();
  expect(Math.max(meta.width, meta.height)).toBe(4096);
  const { data, info } = await sharp(transparent.bytes)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(data[3]).toBe(0);
  expect(info.channels).toBe(4);
  await choose(page, "Fondo de descarga", "Color personalizado");
  await page.getByRole("textbox", { name: "Código de color" }).fill("#ff0000");
  const red = await download(page, "Descargar PNG");
  const pixel = await sharp(red.bytes)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer();
  expect([...pixel]).toEqual([255, 0, 0, 255]);
  await choose(page, "Tamaño", "4K · 4096 px");
  await choose(page, "Formato", "SVG vectorial");
  const svg = await download(page, "Descargar SVG");
  const text = svg.bytes.toString();
  expect(text).toContain('width="4096"');
  expect(text).toContain('fill="#ff0000"');
  expect(text).not.toContain("<image");
  await page.getByRole("textbox", { name: "Código de color" }).fill("#invalid");
  await choose(page, "Formato", "PDF vectorial");
  await expect(
    page.getByRole("combobox", { name: "Tamaño", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: "Fondo de descarga", exact: true }),
  ).toBeDisabled();
  const pdf = await download(page, "Descargar PDF");
  expect(pdf.bytes.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.bytes.length).toBeLessThan(1024 * 1024);
});

test("raster originals, JPG, WebP, validation and kit download work", async ({
  page,
}) => {
  await setup(page, "SUPERADMINISTRADOR", "light");
  await page
    .getByRole("button", {
      name: "Ver Hito · Ejecutivo · Original",
      exact: true,
    })
    .click();
  await choose(page, "Formato", "Archivo original");
  const original = await download(page, "Descargar original");
  expect(
    original.bytes.equals(
      await readFile("public/recursos/originales/hito-ejecutivo.png"),
    ),
  ).toBe(true);
  await choose(page, "Formato", "JPG");
  const jpg = await download(page, "Descargar JPG");
  expect((await sharp(jpg.bytes).metadata()).format).toBe("jpeg");
  expect((await sharp(jpg.bytes).metadata()).hasAlpha).toBe(false);
  await choose(page, "Formato", "WebP");
  const webp = await download(page, "Descargar WEBP");
  expect((await sharp(webp.bytes).metadata()).format).toBe("webp");
  await choose(page, "Fondo de descarga", "Color personalizado");
  await page.getByRole("textbox", { name: "Código de color" }).fill("#oops");
  await expect(
    page.getByRole("button", { name: "Descargar WEBP", exact: true }),
  ).toBeDisabled();
  await choose(page, "Formato", "Archivo original");
  const unchanged = await download(page, "Descargar original");
  expect(unchanged.bytes.equals(original.bytes)).toBe(true);
  await choose(page, "Formato", "WebP");
  await page.getByRole("textbox", { name: "Código de color" }).fill("#29295D");
  await expect(
    page.getByRole("button", { name: "Descargar WEBP", exact: true }),
  ).toBeEnabled();
  await choose(page, "Variante", "Nitidez mejorada");
  await expect(page.getByText(/Versión mejorada de 1254/)).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  const kit = await download(page, "Descargar kit de variantes");
  const zip = await JSZip.loadAsync(kit.bytes);
  expect(Object.keys(zip.files).some((name) => name.endsWith(".svg"))).toBe(
    true,
  );
  expect(Object.keys(zip.files).some((name) => name.endsWith(".pdf"))).toBe(
    true,
  );
  expect(Object.keys(zip.files).some((name) => name.endsWith(".png"))).toBe(
    true,
  );
});

test("gallery and detail fit desktop/mobile in both themes with keyboard dialog access", async ({
  page,
}) => {
  for (const [width, height, theme] of [
    [1440, 1000, "dark"],
    [1440, 1000, "light"],
    [390, 844, "dark"],
    [320, 740, "light"],
  ]) {
    await page.setViewportSize({ width, height });
    await setup(page, "SEDIPRANO", theme);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await capture(page, `galeria-${width}-${theme}`);
    const trigger = page.getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByRole("dialog")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      )
      .toBe(true);
    await capture(page, `detalle-${width}-${theme}`);
    if (width < 500) {
      await page
        .getByRole("button", { name: "Descargar PNG", exact: true })
        .scrollIntoViewIfNeeded();
      await expect(
        page.getByRole("button", { name: "Descargar PNG", exact: true }),
      ).toBeInViewport();
      await capture(page, `detalle-acciones-${width}-${theme}`);
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("missing export source fails clearly and can be retried", async ({
  page,
}) => {
  await setup(page);
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  await page.route("**/recursos/marca/logo-unt-color.svg", (route) =>
    route.fulfill({ status: 503, body: "Not available" }),
  );
  await page
    .getByRole("button", { name: "Descargar PNG", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "No se pudo cargar el archivo",
  );
  await page.unroute("**/recursos/marca/logo-unt-color.svg");
  const retry = await download(page, "Descargar PNG");
  expect((await sharp(retry.bytes).metadata()).format).toBe("png");
});
