import { expect, test } from "@playwright/test";

test("restaura la jerarquía visual y el espaciado de SEDInvita", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/sedinvita");

  await expect(
    page.getByRole("heading", {
      name: /Conecta, lidera y transforma tu futuro académico/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fases de SEDInvita" }),
  ).toBeAttached();

  const visualMetrics = await page.evaluate(() => {
    const heroContent = document.querySelector("#inicio > div:last-child");
    const heading = document.querySelector("h1");
    const phases = document.querySelector("#fases");
    const root = document.querySelector(".min-h-screen");

    return {
      headingSize: getComputedStyle(heading).fontSize,
      heroPadding: getComputedStyle(heroContent).paddingLeft,
      phasePadding: getComputedStyle(phases).paddingTop,
      primary: getComputedStyle(root)
        .getPropertyValue("--color-primary")
        .trim(),
      hasHorizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });

  expect(visualMetrics).toEqual({
    headingSize: "48px",
    heroPadding: "40px",
    phasePadding: "48px",
    primary: "#b497ff",
    hasHorizontalOverflow: false,
  });
  expect(pageErrors).toEqual([]);
});

test("mantiene el contenido ordenado en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sedinvita");

  await expect(page.getByRole("button", { name: /menú|menu/i })).toBeVisible();

  const mobileMetrics = await page.evaluate(() => {
    const heroContent = document.querySelector("#inicio > div:last-child");

    return {
      heroPadding: getComputedStyle(heroContent).paddingLeft,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });

  expect(mobileMetrics).toEqual({
    heroPadding: "16px",
    hasHorizontalOverflow: false,
  });
});
