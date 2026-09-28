import { test, expect } from "@playwright/test";

test("muestra el acceso con la nueva interfaz y conserva el contrato de autenticación", async ({
  page,
}) => {
  let requestBody;

  await page.route("**/api/auth/login", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 401,
      json: { message: "Credenciales incorrectas" },
    });
  });

  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();
  await expect(page.getByLabel("Usuario", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Usuario o DNI", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByAltText("Hito, mascota de SEDIPRO UNT, dando la bienvenida"),
  ).toBeVisible();
  await expect(page.getByText("/ acceso")).toBeVisible();

  await page.getByLabel("Usuario", { exact: true }).fill("75092022");
  await page.getByLabel("Contraseña", { exact: true }).fill("clave-local");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByText("Credenciales incorrectas", { exact: true })).toBeVisible();
  expect(requestBody).toEqual({
    username: "75092022",
    password: "clave-local",
  });

  const layout = await page.locator("main").evaluate((element) => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    cardRadius: getComputedStyle(element.querySelector("[data-slot='card']"))
      .borderRadius,
  }));

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.cardRadius).toBe("0px");
});

test("mantiene el login legible en una pantalla móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  await expect(page.getByLabel("Usuario", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  await expect(
    page.getByAltText("Hito, mascota de SEDIPRO UNT, dando la bienvenida"),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
});
