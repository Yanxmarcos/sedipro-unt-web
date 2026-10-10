import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const motionSource = readFileSync(new URL("../../src/components/mascot/hito-motion.js", import.meta.url), "utf8");
const rendererSource = readFileSync(new URL("../../src/components/mascot/hito-renderer.js", import.meta.url), "utf8")
  .replace('"./hito-motion.js"', JSON.stringify(`data:text/javascript;base64,${Buffer.from(motionSource).toString("base64")}`));

test("caminar mantiene la altura de reposo y mueve brazos y muslos, con pies compactos", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("landing_loaded", "true");
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 1 });
  });
  await page.goto("/proyectos");
  const result = await page.evaluate(async (source) => {
    const { drawHito } = await import(`data:text/javascript;base64,${source}`);
    const manifest = await fetch("/img/hito-pet/hito.json").then((response) => response.json());
    const load = (src) => new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src;
    });
    const [atlas, rig] = await Promise.all([load(manifest.image), load(manifest.gait.image)]);
    const canvas = document.createElement("canvas");
    canvas.width = 160; canvas.height = 192;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const render = (state, phase = 0, direction = 1) => {
      drawHito(context, atlas, manifest, state, 0, direction, { x: 0, y: 0 }, false,
        { image: rig, distance: phase * manifest.gait.stride / 2 / manifest.gait.support });
      return context.getImageData(0, 0, 160, 192).data.slice();
    };
    const bounds = (pixels) => {
      let top = 192, bottom = 0;
      for (let y = 0; y < 192; y++) for (let x = 0; x < 160; x++) {
        if (pixels[(y * 160 + x) * 4 + 3] < 128) continue;
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      return { top, bottom, height: bottom - top + 1 };
    };
    const isPurple = (pixels, offset) => pixels[offset + 3] > 128 && pixels[offset] > 50 && pixels[offset + 2] > pixels[offset] * 1.15 && pixels[offset + 1] < pixels[offset] * 0.85;
    const changedPurple = (a, b, y0, y1) => {
      let count = 0;
      for (let y = y0; y <= y1; y++) for (let x = 20; x < 140; x++) {
        const offset = (y * 160 + x) * 4;
        if (isPurple(a, offset) !== isPurple(b, offset)) count++;
      }
      return count;
    };
    const resting = bounds(render("idle"));
    const sizes = [];
    for (const state of ["walk", "run"]) for (const direction of [-1, 1]) for (let frame = 0; frame < 48; frame++) {
      sizes.push(bounds(render(state, frame / 48, direction)));
    }
    const a = render("walk", 0), b = render("walk", 0.5);
    return {
      resting, sizes, armChanges: changedPurple(a, b, 112, 149),
      thighChanges: changedPurple(a, b, 158, 175),
      feet: manifest.gait.legs.map((leg) => ({ width: leg.foot.rect[2], height: leg.foot.rect[3] })),
    };
  }, Buffer.from(rendererSource).toString("base64"));
  for (const size of result.sizes) {
    expect(Math.abs(size.height - result.resting.height)).toBeLessThanOrEqual(4);
    expect(Math.abs(size.top - result.resting.top)).toBeLessThanOrEqual(3);
    expect(Math.abs(size.bottom - result.resting.bottom)).toBeLessThanOrEqual(3);
  }
  expect(result.armChanges).toBeGreaterThan(80);
  expect(result.thighChanges).toBeGreaterThan(30);
  for (const foot of result.feet) {
    expect(foot.width).toBeLessThanOrEqual(32);
    expect(foot.height).toBeLessThanOrEqual(12);
  }
});
