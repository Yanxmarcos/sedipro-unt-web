import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("landing_loaded", "true");
  });
});

test("presenta los 16 integrantes en el orden establecido", async ({
  page,
}) => {
  await page.goto("/tecnologias-de-la-informacion");

  await expect(
    page.getByRole("heading", { name: "Tecnologías de la Información" }),
  ).toBeVisible();

  const cards = page.locator("article");
  await expect(cards).toHaveCount(16);
  await expect(cards.nth(0)).toContainText("De La Cruz Calderón, Elder Eli");
  await expect(cards.nth(0)).toContainText("Director");
  await expect(cards.nth(0)).toContainText("Informática");
  await expect(cards.nth(1)).toContainText("Chan Vasquez, Yanxmarcos");
  await expect(cards.nth(2)).toContainText("Avila Zamudio, Eliaser Isai");
  await expect(cards.nth(3)).toContainText("Sanchez Cabrera, Pablo Cesar");
  await expect(cards.nth(4)).toContainText("Agreda Cruz, Jesus Alberto");
  await expect(cards.nth(3)).toContainText("Ingeniería Industrial");
  await expect(cards.nth(8)).toContainText("Estadística");
  await expect(cards.nth(11)).toContainText("Ingeniería de Sistemas");
  await expect(page.getByText("Redes próximamente")).toHaveCount(0);

  await expect(page.getByAltText("SEDIPRO UNT Logo")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await expect(
    page.getByRole("heading", { name: "Conecta con nosotros" }),
  ).toBeVisible();

  await expect(
    cards.nth(1).getByRole("link", { name: /LinkedIn/ }),
  ).toHaveAttribute("target", "_blank");
  await expect(
    cards.nth(1).getByRole("link", { name: /GitHub/ }),
  ).toHaveAttribute("href", "https://github.com/Yanxmarcos");
  await expect(
    cards.nth(1).getByRole("link", { name: /Instagram/ }),
  ).toHaveAttribute("rel", "noopener noreferrer");

  await expect(page.getByRole("link", { name: "Ingresar" })).toHaveAttribute(
    "href",
    "/login",
  );
});

test("mantiene la página sin desplazamiento horizontal en móvil", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tecnologias-de-la-informacion");

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.locator("article")).toHaveCount(16);
});

test("enlaza el crédito del Área de TI desde la portada", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Área de TI/ })).toHaveAttribute(
    "href",
    "/tecnologias-de-la-informacion",
  );
});
