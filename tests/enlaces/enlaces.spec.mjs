import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const tokens = JSON.parse(process.env.ENLACES_QA_TOKENS || "{}");
const screenshots = path.resolve(".impeccable/review/enlaces");
test("public links redirect immediately and unavailable links use the existing 404", async ({
  page,
}) => {
  await login(page, "ADMINISTRADOR");
  const created = await page.request.post("/api/enlaces", {
    data: {
      titulo: "QA Instagram público",
      urlDestino: "https://www.instagram.com/p/qa-public-redirect/?test=1#info",
    },
  });
  expect(created.status()).toBe(200);
  let { data: link } = await created.json();
  const shortPath = new URL(link.urlCorta).pathname;
  await page.context().clearCookies();
  for (const method of ["GET", "HEAD"]) {
    const redirected = await page.request.fetch(
      `${shortPath}?url=https://evil.example`,
      { method, maxRedirects: 0 },
    );
    expect(redirected.status()).toBe(302);
    expect(redirected.headers().location).toBe(link.urlDestino);
    const body = await redirected.text();
    if (method === "HEAD") expect(body).toBe("");
    else expect(body).not.toContain("<html");
  }
  for (const prefix of ["fb", "ig", "lk", "tk", "wa", "fm", "yt", "gd", "go"]) {
    const missing = await page.request.get(`/${prefix}/no-existe`, {
      maxRedirects: 0,
    });
    expect(missing.status()).toBe(404);
    expect(missing.headers().location).toBeUndefined();
    expect(await missing.text()).toContain("Página no encontrada");
  }
  await login(page, "ADMINISTRADOR");
  const paused = await page.request.patch(`/api/enlaces/${link._id}`, {
    data: { estado: "pausado", revision: link.revision },
  });
  expect(paused.status()).toBe(200);
  link = (await paused.json()).data;
  await page.context().clearCookies();
  const unavailable = await page.request.get(shortPath, { maxRedirects: 0 });
  expect(unavailable.status()).toBe(404);
  expect(await unavailable.text()).toContain("Página no encontrada");
  await login(page, "ADMINISTRADOR");
  const resumed = await page.request.patch(`/api/enlaces/${link._id}`, {
    data: { estado: "activo", revision: link.revision },
  });
  expect(resumed.status()).toBe(200);
  await page.context().clearCookies();
  expect(
    (await page.request.get(shortPath, { maxRedirects: 0 })).status(),
  ).toBe(302);
  await mkdir(screenshots, { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    const missing = await page.goto("/ig/no-existe");
    expect(missing.status()).toBe(404);
    await expect(page).toHaveURL(/\/ig\/no-existe$/);
    await expect(
      page.getByRole("heading", { name: "404", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Página no encontrada", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Enlace no disponible", { exact: true }),
    ).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: path.join(screenshots, `public-404-${device}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});
async function login(page, role = "SEDIPRANO") {
  await page.context().addCookies([
    {
      name: "auth_token",
      value: tokens[role],
      url: process.env.ENLACES_QA_ORIGIN,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
test("shared library supports create, edit, pause, trash, restoration and all role navigation", async ({
  page,
}) => {
  await login(page);
  await page.goto("/panel/enlaces");
  await expect(
    page.getByRole("heading", { name: "Acortador de enlaces", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Acortador de enlaces", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Auditoría", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Crear enlace", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Título interno")
    .fill("Enlace creado desde el panel QA");
  await dialog
    .getByLabel("URL de destino")
    .fill("https://chat.whatsapp.com/QAGroupInvite?s=cl&p=a");
  await dialog.getByLabel("Campaña (opcional)").fill("Campaña del panel QA");
  await expect(dialog.getByText(/Grupo de WhatsApp/)).toBeVisible();
  await dialog
    .getByRole("button", { name: "Crear enlace", exact: true })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "Enlace listo para compartir" }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Enlace institucional")).toHaveValue(
    /\/wa\/(?=[a-z0-9]*[0-9])[a-z0-9]{3}$/,
  );
  await dialog
    .getByRole("button", { name: "Cerrar", exact: true })
    .last()
    .click();
  const row = page
    .getByRole("row")
    .filter({ hasText: "Enlace creado desde el panel QA" });
  await expect(row).toBeVisible();
  await row
    .getByRole("button", {
      name: "Acciones de Enlace creado desde el panel QA",
    })
    .click();
  await page.getByRole("menuitem", { name: "Editar enlace" }).click();
  await dialog
    .getByLabel("Título interno")
    .fill("Enlace editado desde el panel QA");
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  const edited = page
    .getByRole("row")
    .filter({ hasText: "Enlace editado desde el panel QA" });
  await expect(edited).toBeVisible();
  await edited.getByRole("button").last().click();
  await page.getByRole("menuitem", { name: "Pausar", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Pausar enlace", exact: true })
    .click();
  await expect(edited.getByText("Pausado", { exact: true })).toBeVisible();
  await edited.getByRole("button").last().click();
  await page.getByRole("menuitem", { name: "Mover a papelera" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Mover a papelera", exact: true })
    .click();
  await expect(edited).toHaveCount(0);
  await page.getByRole("link", { name: "Papelera", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Papelera de enlaces" }),
  ).toBeVisible();
  const trashed = page
    .getByRole("row")
    .filter({ hasText: "Enlace editado desde el panel QA" });
  await expect(trashed).toBeVisible();
  await trashed.getByRole("button").last().click();
  await page.getByRole("menuitem", { name: "Restaurar", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restaurar enlace", exact: true })
    .click();
  await expect(trashed).toHaveCount(0);
  await page.goto("/panel/enlaces/auditoria");
  await expect(
    page.getByText("Tu cuenta no tiene acceso a esta sección."),
  ).toBeVisible();
});

test("library, form, trash and audit fit desktop/mobile in both themes", async ({
  page,
}) => {
  await login(page, "ADMINISTRADOR");
  await mkdir(screenshots, { recursive: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("theme", "system"));
  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: theme });
    for (const [device, viewport] of [
      ["desktop", { width: 1440, height: 1000 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/panel/enlaces");
      await expect(
        page.getByRole("heading", {
          name: "Acortador de enlaces",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("status", { name: "Cargando enlaces…" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("row").filter({ hasText: "MKT Impulse" }).first(),
      ).toBeVisible();
      if (theme === "dark")
        await expect(page.locator("html")).toHaveClass(/dark/);
      else await expect(page.locator("html")).not.toHaveClass(/dark/);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: path.join(screenshots, `${device}-${theme}.png`),
        fullPage: true,
        animations: "disabled",
      });
      await page
        .getByRole("button", { name: "Crear enlace", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByLabel("Título interno")
        .fill("MKT Impulse 2026 · Grupo informativo");
      await page
        .getByRole("dialog")
        .getByLabel("URL de destino")
        .fill("https://chat.whatsapp.com/QAGroupInvite?s=cl&p=a");
      await expect(
        page.getByRole("dialog").getByText(/Grupo de WhatsApp/),
      ).toBeVisible();
      await page.screenshot({
        path: path.join(screenshots, `form-${device}-${theme}.png`),
        fullPage: true,
        animations: "disabled",
      });
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Cancelar" })
        .click();
      await page.goto("/panel/enlaces/auditoria");
      await expect(
        page.getByRole("heading", { name: "Auditoría de enlaces" }),
      ).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^Eliminar registro:/ }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Limpiar toda/ }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: path.join(screenshots, `audit-${device}-${theme}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.goto("/panel/enlaces/papelera");
  await expect(page.getByRole("table")).toBeVisible();
  await page.screenshot({
    path: path.join(screenshots, "trash-mobile-dark.png"),
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});

test("administration deletes one audit entry with confirmation and keeps the link", async ({
  page,
}) => {
  await login(page, "ADMINISTRADOR");
  await mkdir(screenshots, { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    const response = await page.request.post("/api/enlaces", {
      data: {
        titulo: `Auditoría QA borrado individual ${device}`,
        urlDestino: "https://forms.gle/qa-audit-cleanup",
      },
    });
    expect(response.status()).toBe(200);
    const { data: link } = await response.json();
    await page.goto(`/panel/enlaces/auditoria?enlaceId=${link._id}`);
    const removeButton = page.getByRole("button", {
      name: /^Eliminar registro:/,
    });
    await expect(removeButton).toHaveCount(1);
    await removeButton.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Eliminar registro de auditoría" }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(screenshots, `audit-delete-confirm-${device}.png`),
      fullPage: true,
      animations: "disabled",
    });
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(removeButton).toHaveCount(1);
    await removeButton.click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar registro", exact: true })
      .click();
    await expect(page.getByText("No hay acciones para mostrar")).toBeVisible();
    const unchanged = await page.request.get(`/api/enlaces/${link._id}`);
    expect(unchanged.status()).toBe(200);
    expect((await unchanged.json()).data.codigo).toBe(link.codigo);
  }
});

test("only Superadministrator permanently removes a trashed link with confirmation", async ({
  page,
}) => {
  await mkdir(screenshots, { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    await login(page, "SUPERADMINISTRADOR");
    const title = `QA eliminación definitiva ${device}`;
    const created = await page.request.post("/api/enlaces", {
      data: {
        titulo: title,
        urlDestino: "https://forms.gle/qa-permanent-delete",
      },
    });
    expect(created.status()).toBe(200);
    const { data: link } = await created.json();
    const trashed = await page.request.delete(`/api/enlaces/${link._id}`, {
      data: { revision: link.revision },
    });
    expect(trashed.status()).toBe(200);
    for (const role of [
      "SEDIPRANO",
      "DIRECTIVA",
      "ADMINISTRADOR",
      "ADMIN",
      "USER",
    ]) {
      await login(page, role);
      await page.goto("/panel/enlaces/papelera");
      await expect(page.getByText(title, { exact: true })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^Eliminar definitivamente / }),
      ).toHaveCount(0);
    }
    await login(page, "SUPERADMINISTRADOR");
    await page.goto("/panel/enlaces/papelera");
    const remove = page.getByRole("button", {
      name: `Eliminar definitivamente ${title}`,
      exact: true,
    });
    await expect(remove).toBeVisible();
    await remove.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Eliminar enlace definitivamente" }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(screenshots, `permanent-delete-${device}.png`),
      fullPage: true,
      animations: "disabled",
    });
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    expect((await page.request.get(`/api/enlaces/${link._id}`)).status()).toBe(
      200,
    );
    await remove.click();
    const completed = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/enlaces/${link._id}/definitivo`) &&
        response.request().method() === "DELETE",
    );
    await dialog
      .getByRole("button", { name: "Eliminar definitivamente", exact: true })
      .click();
    expect((await completed).status()).toBe(200);
    await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    expect((await page.request.get(`/api/enlaces/${link._id}`)).status()).toBe(
      404,
    );
    expect(
      (
        await page.request.get(new URL(link.urlCorta).pathname, {
          maxRedirects: 0,
        })
      ).status(),
    ).toBe(404);
  }
});

test("YouTube is detected in the form and creates a working institutional yt link", async ({
  page,
}) => {
  await login(page, "DIRECTIVA");
  await page.goto("/panel/enlaces");
  await page.getByRole("button", { name: "Crear enlace", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Título interno").fill("QA YouTube desde el panel");
  const destination = "https://youtu.be/qa-panel-video?t=42&si=qa";
  await dialog.getByLabel("URL de destino").fill(destination);
  await expect(
    dialog.getByText(/YouTube.*Video.*Prefijo \/yt\//),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Crear enlace", exact: true })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "Enlace listo para compartir" }),
  ).toBeVisible();
  const short = dialog.getByLabel("Enlace institucional");
  await expect(short).toHaveValue(/\/yt\/(?=[a-z0-9]*[0-9])[a-z0-9]{3}$/);
  const response = await page.request.get(
    new URL(await short.inputValue()).pathname,
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe(destination);
});

test("Google Drive is detected, filtered and generates a QR for its working gd link", async ({
  page,
}) => {
  await login(page, "DIRECTIVA");
  await mkdir(screenshots, { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.addInitScript(
      (theme) => localStorage.setItem("theme", theme),
      width === 390 ? "light" : "dark",
    );
    await page.goto("/panel/enlaces");
    await page
      .getByRole("button", { name: "Crear enlace", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    const title = `QA carpeta Drive ${width}`;
    const destination =
      "https://drive.google.com/drive/folders/QA_folder?usp=sharing&resourcekey=0-QA";
    await dialog.getByLabel("Título interno").fill(title);
    await dialog.getByLabel("URL de destino").fill(destination);
    await expect(
      dialog.getByText(/Google Drive.*Carpeta de Drive.*Prefijo \/gd\//),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(screenshots, `drive-form-${width}.png`),
      animations: "disabled",
    });
    await dialog
      .getByRole("button", { name: "Crear enlace", exact: true })
      .click();
    await expect(
      dialog.getByRole("heading", { name: "Enlace listo para compartir" }),
    ).toBeVisible();
    const shortUrl = await dialog
      .getByLabel("Enlace institucional")
      .inputValue();
    expect(new URL(shortUrl).pathname).toMatch(
      /^\/gd\/(?=[a-z0-9]*[0-9])[a-z0-9]{3}$/,
    );
    const redirect = await page.request.get(new URL(shortUrl).pathname, {
      maxRedirects: 0,
    });
    expect(redirect.status()).toBe(302);
    expect(redirect.headers().location).toBe(destination);
    await dialog.getByRole("button", { name: "Ver QR", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Código QR institucional" }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("img", { name: `Código QR de ${title}`, exact: true }),
    ).toBeVisible({ timeout: 60000 });
    await expect(dialog.getByText(shortUrl, { exact: true })).toBeVisible();
    await page.screenshot({
      path: path.join(screenshots, `drive-qr-${width}.png`),
      animations: "disabled",
    });
    await dialog
      .getByRole("button", { name: "Cerrar", exact: true })
      .last()
      .click();
    await page.getByLabel("Plataforma", { exact: true }).click();
    await page
      .getByRole("option", { name: "Google Drive", exact: true })
      .click();
    await expect(
      page.getByRole("row").filter({ hasText: title }),
    ).toBeVisible();
  }
});
