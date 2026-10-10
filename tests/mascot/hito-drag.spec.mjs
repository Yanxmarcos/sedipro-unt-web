import { expect, test } from "@playwright/test";

const actor = (page) => page.locator('[data-testid="hito-pet"] > div');
const pet = (page) => page.getByRole("button", { name: "Hito, mascota" });
const image = (page) => page.locator('[data-testid="hito-pet"] canvas').evaluate((canvas) => canvas.toDataURL());

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("landing_loaded", "true");
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 1 });
  });
});

test("arrastra libremente, alterna las patas y cambia de dirección incluso durante el mismo gesto", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await expect(actor(page)).toHaveAttribute("data-state", "wave");
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const start = await pet(page).boundingBox();
  const x = start.x + 40, y = start.y + 60;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 100, y - 180, { steps: 12 });
  await expect(actor(page)).toHaveAttribute("data-dragging", "true");
  await expect(actor(page)).toHaveAttribute("data-direction", "right");
  await expect(actor(page)).toHaveAttribute("data-state", "walk");
  const first = await image(page);
  const right = await actor(page).boundingBox();
  expect(right.x).toBeCloseTo(start.x + 100, 0);
  expect(right.y).toBeCloseTo(start.y - 180, 0);
  await page.mouse.move(x + 106, y - 180);
  expect((await image(page)) === first).toBe(false);
  const stopped = await image(page);
  await page.clock.runFor(200);
  expect((await image(page)) === stopped).toBe(true);
  await page.mouse.move(x - 130, y - 220, { steps: 12 });
  await expect(actor(page)).toHaveAttribute("data-direction", "left");
  await page.mouse.up();
  await expect(actor(page)).toHaveAttribute("data-dragging", "false");
  await expect(pet(page)).toHaveAttribute("aria-expanded", "false");
  const released = await actor(page).boundingBox();
  await page.mouse.move(10, 10);
  await page.clock.runFor(800);
  const walking = await actor(page).boundingBox();
  expect(walking.x).toBeLessThan(released.x - 10);
  expect(walking.y).toBe(released.y);
  await pet(page).click();
  await expect(pet(page)).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Volver a la base" }).click();
  expect((await actor(page).boundingBox()).y + 96).toBe(892);
});

test("un clic o un movimiento mínimo siguen abriendo controles; teclado mueve y devuelve a la base", async ({ page }) => {
  await page.goto("/");
  const start = await pet(page).boundingBox();
  await page.mouse.move(start.x + 40, start.y + 60);
  await page.mouse.down();
  await page.mouse.move(start.x + 42, start.y + 61);
  await page.mouse.up();
  await expect(pet(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  const before = await actor(page).boundingBox();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  const moved = await actor(page).boundingBox();
  expect(moved.x).toBe(before.x - 12);
  expect(moved.y).toBe(before.y - 12);
  await page.keyboard.press("Home");
  expect((await actor(page).boundingBox()).y).toBe(before.y);
  await page.keyboard.press("Enter");
  await expect(pet(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(pet(page)).toHaveAttribute("aria-expanded", "false");
});

test("cancelar el gesto libera la captura; pausa y movimiento reducido permiten recolocar sin animación automática", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(actor(page)).toHaveAttribute("data-state", "idle");
  const start = await pet(page).boundingBox();
  await page.mouse.move(start.x + 40, start.y + 50);
  await page.mouse.down();
  await page.mouse.move(start.x - 100, start.y - 200, { steps: 4 });
  await expect(actor(page)).toHaveAttribute("data-dragging", "true");
  await pet(page).dispatchEvent("pointercancel", { pointerId: 1, isPrimary: true, pointerType: "mouse" });
  await page.mouse.up();
  await expect(actor(page)).toHaveAttribute("data-dragging", "false");
  await expect(actor(page)).toHaveAttribute("data-state", "idle");
  const after = await actor(page).boundingBox();
  await page.mouse.move(10, 10);
  expect((await actor(page).boundingBox()).x).toBe(after.x);
  await pet(page).click();
  await expect(pet(page)).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Volver a la base" }).click();
  expect((await actor(page).boundingBox()).y + 96).toBe(892);
});

test.describe("táctil", () => {
test.use({ hasTouch: true, isMobile: true });
test("arrastre táctil mantiene mascota y controles visibles en los bordes y después de un giro de pantalla", async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/nosotros");
  await expect(pet(page)).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const client = await page.context().newCDPSession(page);
  const start = await pet(page).boundingBox();
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start.x + 40, y: start.y + 60 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 35, y: 25 }] });
  await expect(actor(page)).toHaveAttribute("data-direction", "left");
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(actor(page)).toHaveAttribute("data-dragging", "false");
  await expect(pet(page)).toHaveAttribute("aria-expanded", "false");
  const bounds = await actor(page).boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(12);
  expect(bounds.x).toBeLessThan(14);
  expect(bounds.y).toBe(12);
  await pet(page).tap();
  await expect(pet(page)).toHaveAttribute("aria-expanded", "true");
  await expect(actor(page)).toHaveAttribute("data-bubble-placement", "below");
  const bubble = await page.locator("#hito-controls").boundingBox();
  expect(bubble.y).toBeGreaterThan(108);
  expect(bubble.y + bubble.height).toBeLessThanOrEqual(832);
  await page.setViewportSize({ width: 320, height: 500 });
  const resized = await actor(page).boundingBox();
  const panel = await page.locator("#hito-controls").boundingBox();
  expect(resized.y).toBeGreaterThanOrEqual(12 - 0.0001);
  expect(resized.x + resized.width).toBeLessThanOrEqual(308);
  expect(panel.x).toBeGreaterThanOrEqual(12);
  expect(panel.y + panel.height).toBeLessThanOrEqual(488);
  // Some existing Nosotros content already overflows this short viewport.
  // Verify that adding/repositioning Hito does not increase that page width.
  const widths = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="hito-pet"]');
    const withPet = document.documentElement.scrollWidth;
    root.style.display = "none";
    const withoutPet = document.documentElement.scrollWidth;
    root.style.display = "";
    return { withPet, withoutPet };
  });
  expect(widths.withPet).toBe(widths.withoutPet);
  await client.detach();
});
});
