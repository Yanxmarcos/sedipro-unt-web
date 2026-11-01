import { test, expect } from "@playwright/test";

for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  test(`404 uses the landing wheel inertia at ${device} width`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/qa-pagina-inexistente", "/yt/codigo-invalido"]) {
      const response = await page.goto(path);
      expect(response.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
      await expect(page.locator("html")).toHaveClass(/\blenis\b/);
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      // Sample real rendered positions: native wheel scrolling would jump once.
      await page.evaluate(() => {
        window.__qaScrollFrames = [];
        const sample = () => {
          window.__qaScrollFrames.push(window.scrollY);
          if (window.__qaScrollFrames.length < 45) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await page.mouse.wheel(0, 450);
      await expect.poll(() => page.evaluate(() => window.__qaScrollFrames.length)).toBe(45);
      const frames = await page.evaluate(() => window.__qaScrollFrames);
      expect(Math.max(...frames)).toBeGreaterThan(30);
      expect(new Set(frames.map(Math.round)).size).toBeGreaterThan(4);
    }
    expect(errors).toEqual([]);
  });
}

test("404 respects reduced motion and releases inertia on navigation to login", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/qa-pagina-inexistente");
  await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await page.getByRole("link", { name: /Volver al inicio/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  // The public footer uses a Next Link, preserving the provider across navigation.
  const login = page.locator('a[href="/login"]').last();
  await login.click();
  await expect(page).toHaveURL("/login");
  await expect(page.locator("main input").first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
});
