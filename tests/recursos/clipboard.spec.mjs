import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

async function setup(page) {
  const events = [];
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.context().addCookies([
    {
      name: "auth_token",
      value: "resource-clipboard-qa",
      url: "http://127.0.0.1:7012",
    },
  ]);
  await page.route("**/api/**", (route) => {
    const pathname = new URL(route.request().url()).pathname;
    let json = { data: [] };
    if (pathname === "/api/auth/verify")
      json = {
        authenticated: true,
        user: {
          id: "1234567890abcdef12345678",
          nombres: "ANA",
          apellidos: "PRUEBA",
          rol: "SEDIPRANO",
          sedipranoId: "1234567890abcdef12345678",
        },
        session: {
          serverNow: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    if (pathname.startsWith("/api/recursos/actividad")) {
      events.push({
        method: route.request().method(),
        body: route.request().postDataJSON(),
      });
      json = { id: "1234567890abcdef12345679", resultado: "iniciada" };
    }
    return route.fulfill({ json });
  });
  await page.goto("/panel/recursos");
  await expect(
    page.getByRole("heading", {
      name: "Recursos institucionales",
      exact: true,
    }),
  ).toBeVisible();
  await expect
    .poll(() => events.some((event) => event.body.accion === "abrir_modulo"))
    .toBe(true);
  return events;
}
async function clipboardBytes(page) {
  const bytes = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const blob = await items
      .find((item) => item.types.includes("image/png"))
      .getType("image/png");
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  return Buffer.from(bytes);
}
async function capture(page, name) {
  await mkdir(".impeccable/review/recursos", { recursive: true });
  await page.evaluate(async () => {
    const visible = [...document.images].filter((image) => {
      const box = image.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.bottom > 0 &&
        box.top < innerHeight
      );
    });
    await Promise.all(
      visible.map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }),
    );
  });
  await page.screenshot({
    path: `.impeccable/review/recursos/${name}.png`,
    animations: "disabled",
  });
}

test("card copies real transparent PNG in 4K, equal pixels to download, and pastes as image in another tab", async ({
  page,
  context,
}) => {
  const events = await setup(page);
  const copy = page.getByRole("button", {
    name: "Copiar PNG para Canva: SEDIPRO UNT · Horizontal · Color institucional",
    exact: true,
  });
  await copy.hover();
  await expect(page.getByRole("tooltip")).toContainText("4096 px");
  await capture(page, "canva-tarjeta-1440-dark");
  await copy.click();
  await expect(
    page.getByText("Imagen copiada. Ya puedes pegarla en Canva.", {
      exact: true,
    }),
  ).toBeVisible();
  const clipboard = await clipboardBytes(page);
  const metadata = await sharp(clipboard).metadata();
  expect(metadata.width).toBe(4096);
  expect(metadata.height).toBe(1589);
  expect(metadata.hasAlpha).toBe(true);
  const pixels = await sharp(clipboard).ensureAlpha().raw().toBuffer();
  expect(pixels[3]).toBe(0);
  expect(
    events.find((e) => e.body.accion === "copiar_recurso").body,
  ).toMatchObject({
    recursoId: "logo-unt",
    varianteId: "color",
    formato: "png",
    tamano: "4096",
    fondo: "transparente",
  });
  await expect
    .poll(() => events.some((e) => e.body.resultado === "copiada"))
    .toBe(true);

  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar PNG", exact: true })
    .click();
  const manual = await readFile(await (await downloading).path());
  expect(
    (await sharp(manual).ensureAlpha().raw().toBuffer()).equals(pixels),
  ).toBe(true);

  const receiver = await context.newPage();
  await receiver.route("https://clipboard-receiver.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<div contenteditable="true" aria-label="Destino de prueba" style="width:100vw;height:100vh"></div><script>document.addEventListener('paste', async event=>{event.preventDefault();const file=event.clipboardData.files[0];if(!file)return;const image=new Image();image.onload=()=>{image.alt='PNG pegado';document.body.append(image)};image.src=URL.createObjectURL(file);});</script>`,
    }),
  );
  await receiver.goto("https://clipboard-receiver.test/");
  await receiver.locator("[contenteditable]").click();
  await receiver.keyboard.press("Control+V");
  await expect(receiver.getByAltText("PNG pegado")).toBeVisible();
  expect(
    await receiver
      .getByAltText("PNG pegado")
      .evaluate((img) => [img.naturalWidth, img.naturalHeight]),
  ).toEqual([4096, 1589]);
  await receiver.close();
});

test("detail copies selected size and background, leaves SVG download available, resets confirmation", async ({
  page,
}) => {
  const events = await setup(page);
  await page
    .getByRole("button", {
      name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
      exact: true,
    })
    .click();
  async function choose(label, name) {
    await page.getByRole("combobox", { name: label, exact: true }).click();
    await page.getByRole("option", { name, exact: true }).click();
  }
  await choose("Tamaño", "2048 px");
  await choose("Fondo de descarga", "Negro");
  await page
    .getByRole("button", { name: "Copiar PNG para Canva", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Copiado para Canva", exact: true }),
  ).toBeVisible();
  const bytes = await clipboardBytes(page),
    metadata = await sharp(bytes).metadata();
  expect(metadata.width).toBe(2048);
  expect(metadata.height).toBe(795);
  const pixels = await sharp(bytes).ensureAlpha().raw().toBuffer();
  expect([...pixels.subarray(0, 4)]).toEqual([0, 0, 0, 255]);
  expect(
    events.find((e) => e.body.accion === "copiar_recurso").body,
  ).toMatchObject({ tamano: "2048", fondo: "#000000" });
  await capture(page, "canva-copiado-1440-dark");
  await choose("Formato", "SVG vectorial");
  await expect(
    page.getByRole("button", { name: "Descargar SVG", exact: true }),
  ).toBeEnabled();
  await choose("Tamaño", "1024 px");
  await expect(
    page.getByRole("button", { name: "Copiar PNG para Canva", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByText("Imagen copiada. Ya puedes pegarla en Canva.", {
      exact: true,
    }),
  ).toHaveCount(0, { timeout: 10000 });
  let activeTheme = "dark";
  for (const [width, theme] of [
    [1440, "dark"],
    [390, "dark"],
    [1440, "light"],
    [390, "light"],
  ]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    if (theme !== activeTheme) {
      await page.getByRole("button", { name: "Cerrar", exact: true }).click();
      await page
        .getByRole("button", { name: "Cambiar tema", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Ver SEDIPRO UNT · Horizontal · Color institucional",
          exact: true,
        })
        .click();
      activeTheme = theme;
    }
    await page
      .getByRole("button", { name: "Copiar PNG para Canva", exact: true })
      .scrollIntoViewIfNeeded();
    await capture(page, `canva-detalle-${width}-${theme}`);
  }
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  for (const [width, theme] of [
    [390, "dark"],
    [400, "light"],
  ]) {
    await page.setViewportSize({ width, height: 844 });
    if (theme !== activeTheme) {
      await page
        .getByRole("button", { name: "Cambiar tema", exact: true })
        .click();
      activeTheme = theme;
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .locator("article")
      .first()
      .getByRole("button", { name: /^Copiar PNG para Canva:/ })
      .scrollIntoViewIfNeeded();
    await capture(page, `canva-galeria-${width}-${theme}`);
  }
});

test("permission denial and unsupported clipboard show fallback without false success", async ({
  page,
}) => {
  const events = await setup(page);
  const copy = page.getByRole("button", {
    name: "Copiar PNG para Canva: SEDIPRO UNT · Horizontal · Color institucional",
    exact: true,
  });
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "write", {
      configurable: true,
      value: () =>
        Promise.reject(new DOMException("Denied", "NotAllowedError")),
    }),
  );
  await copy.click();
  await expect(
    page.getByText(/No se pudo acceder al portapapeles/),
  ).toBeVisible();
  expect(events.some((e) => e.body.resultado === "copiada")).toBe(false);
  expect(events.some((e) => e.body.resultado === "fallida")).toBe(true);
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "write", {
      configurable: true,
      value: undefined,
    }),
  );
  await copy.click();
  await expect(
    page.getByText(/Este navegador no permite copiar imágenes/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /^Ver SEDIPRO UNT · Horizontal · Color institucional$/,
    }),
  ).toBeVisible();
});
