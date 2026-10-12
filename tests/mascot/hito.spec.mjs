import { expect, test } from "@playwright/test";

const actor = (page) => page.locator('[data-testid="hito-pet"] > div');
const pet = (page) => page.getByRole("button", { name: "Hito, mascota" });
const canvasImage = (page) => page.locator('[data-testid="hito-pet"] canvas').evaluate((canvas) => canvas.toDataURL());

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("landing_loaded", "true");
    // Use the existing touch-device fallback when accelerating the clock;
    // desktop WebGL appearance is checked separately with real time.
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 1 });
  });
});

for (const [path, greeting] of [
  ["/", "Soy Hito"], ["/proyectos", "ideas se convierten"],
  ["/nosotros", "Te presento a mi equipo"], ["/tecnologias-de-la-informacion", "Bienvenido a TI"],
]) {
  test(`Hito aparece con su comentario en ${path}`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    await expect(pet(page)).toBeVisible();
    await expect(page.getByTestId("hito-pet")).toContainText(greeting);
    await expect(page.locator('[data-testid="hito-pet"] canvas')).toHaveCSS("image-rendering", "auto");
    expect(errors).toEqual([]);
  });
}

test("camina, cambia de dirección en el borde y mantiene su base al hacer scroll", async ({ page }) => {
  // Advance through the first boundary turn, including the page's shaders.
  test.setTimeout(90000);
  await page.clock.install();
  await page.goto("/");
  await expect(actor(page)).toHaveAttribute("data-state", "wave");
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const start = await actor(page).boundingBox();
  await page.clock.runFor(5000);
  await expect(actor(page)).toHaveAttribute("data-state", "walk");
  const walking = await actor(page).boundingBox();
  expect(walking.x).toBeLessThan(start.x - 20);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.clock.runFor(1000);
  await expect(actor(page)).toHaveAttribute("data-direction", "left");
  await page.clock.runFor(20000);
  await expect(actor(page)).toHaveAttribute("data-direction", "right");
  const bounded = await actor(page).boundingBox();
  expect(bounded.x).toBeGreaterThanOrEqual(12);
  expect(bounded.x + bounded.width).toBeLessThanOrEqual(308);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.clock.runFor(100);
  const scrolled = await actor(page).boundingBox();
  expect(scrolled.y + scrolled.height).toBe(792);
});

test("los gestos pintan fotogramas diferentes y los controles detienen la caminata", async ({ page }) => {
  await page.goto("/");
  await pet(page).click();
  const position = await actor(page).boundingBox();
  const images = new Set();
  for (const [label, state] of [["Saludar", "wave"], ["Saltar", "hop"], ["Celebrar", "celebrate"], ["Programar", "work"], ["Dar cariño", "love"]]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(actor(page)).toHaveAttribute("data-state", state);
    images.add(await canvasImage(page));
    expect((await actor(page).boundingBox()).x).toBe(position.x);
  }
  expect(images.size).toBe(5);
  await page.keyboard.press("Escape");
  await expect(pet(page)).toHaveAttribute("aria-expanded", "false");
  await expect(pet(page)).toBeFocused();
});

test("pausar conserva la posición y la preferencia al cambiar de página", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await pet(page).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(page.getByTestId("hito-pet")).toHaveAttribute("data-paused", "true");
  await expect(actor(page)).toHaveAttribute("data-state", "idle");
  const before = await actor(page).boundingBox();
  const image = await canvasImage(page);
  await page.clock.fastForward(15000);
  expect((await actor(page).boundingBox()).x).toBe(before.x);
  expect(await canvasImage(page)).toBe(image);
  await page.goto("/proyectos");
  await expect(page.getByTestId("hito-pet")).toHaveAttribute("data-paused", "true");
  await pet(page).click();
  await page.getByRole("button", { name: "Reanudar", exact: true }).click();
  await expect(page.getByTestId("hito-pet")).toHaveAttribute("data-paused", "false");
});

test("ocultar persiste en la navegación y permite volver a mostrar a Hito", async ({ page }) => {
  await page.goto("/");
  await pet(page).click();
  await page.getByRole("button", { name: "Ocultar", exact: true }).click();
  await expect(pet(page)).toHaveCount(0);
  await page.getByRole("link", { name: "Nosotros", exact: true }).click();
  await expect(page).toHaveURL(/\/nosotros$/);
  await expect(pet(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Mostrar a Hito" }).click();
  await expect(pet(page)).toBeVisible();
  await page.goto("/login");
  await expect(pet(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mostrar a Hito" })).toHaveCount(0);
});

test("ojos siguen el cursor y la pestaña oculta suspende el render", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await pet(page).click();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole("button", { name: "Saludar", exact: true }).click();
  await page.mouse.move(10, 800);
  await page.clock.runFor(70);
  const left = await canvasImage(page);
  await page.mouse.move(1270, 800);
  await page.clock.runFor(70);
  expect(await canvasImage(page)).not.toBe(left);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hiddenFrame = await canvasImage(page);
  await page.clock.fastForward(10000);
  expect(await canvasImage(page)).toBe(hiddenFrame);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.mouse.move(10, 800);
  await page.clock.runFor(70);
  expect(await canvasImage(page)).not.toBe(hiddenFrame);
});

test("movimiento reducido deja a Hito estático y conserva los controles", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await expect(actor(page)).toHaveAttribute("data-state", "idle");
  const before = await canvasImage(page);
  const position = await actor(page).boundingBox();
  await page.clock.fastForward(45000);
  expect(await canvasImage(page)).toBe(before);
  expect((await actor(page).boundingBox()).x).toBe(position.x);
  await pet(page).click();
  await expect(page.getByRole("button", { name: "Movimiento reducido" })).toBeDisabled();
  await page.getByRole("button", { name: "Programar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Modo TI");
});

test.describe("móvil", () => {
  test.use({ hasTouch: true });
  for (const width of [320, 390]) {
    test(`burbuja, controles y mascota caben en ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/tecnologias-de-la-informacion");
      await pet(page).tap();
      const bubble = await page.locator("#hito-controls").boundingBox();
      const bounds = await actor(page).boundingBox();
      expect(bubble.x).toBeGreaterThanOrEqual(12);
      expect(bubble.x + bubble.width).toBeLessThanOrEqual(width - 12);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 12);
      const button = await page.getByRole("button", { name: "Programar", exact: true }).boundingBox();
      expect(button.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    });
  }
});
