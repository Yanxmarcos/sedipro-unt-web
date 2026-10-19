import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const motionSource = readFileSync(new URL("../../src/components/mascot/hito-motion.js", import.meta.url), "utf8");
const rendererSource = readFileSync(new URL("../../src/components/mascot/hito-renderer.js", import.meta.url), "utf8")
  .replace('"./hito-motion.js"', JSON.stringify(`data:text/javascript;base64,${Buffer.from(motionSource).toString("base64")}`));

test("caminar mantiene la altura y las texturas de las piernas de reposo, con brazos y muslos articulados", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("landing_loaded", "true");
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 1 });
  });
  await page.goto("/proyectos");
  const result = await page.evaluate(async ({ source, motion }) => {
    const { drawHito } = await import(`data:text/javascript;base64,${source}`);
    const { getHitoStep, getHitoFootPose } = await import(`data:text/javascript;base64,${motion}`);
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
    let visibleThigh = 0;
    for (let y = 158; y <= 175; y++) for (let x = 20; x < 140; x++) {
      const offset = (y * 160 + x) * 4;
      if (isPurple(a, offset) || isPurple(b, offset)) visibleThigh++;
    }
    const thighChanges = changedPurple(a, b, 158, 175);
    // Compare against the approved idle artwork, not an arbitrary width cap.
    // Every opaque pixel in each leg must come from that native-size crop.
    const cutouts = manifest.gait.legs.map((leg) => {
      const [rx, ry, width, height] = leg.reference.rect;
      context.clearRect(0, 0, 160, 192);
      context.save();
      if (leg.reference.mirrored) { context.translate(width, 0); context.scale(-1, 1); }
      context.drawImage(atlas, rx, ry, width, height, 0, 0, width, height);
      context.restore();
      const idle = context.getImageData(0, 0, width, height).data;
      context.clearRect(0, 0, 160, 192);
      context.drawImage(rig, leg.thigh.rect[0], 0, width, height, 0, 0, width, height);
      const moving = context.getImageData(0, 0, width, height).data;
      let opaque = 0, differences = 0, footDifferences = 0, purpleWidth = 0;
      for (let y = 0; y < height; y++) {
        let first = width, last = -1;
        for (let x = 0; x < width; x++) if (isPurple(moving, (y * width + x) * 4)) {
          first = Math.min(first, x); last = Math.max(last, x);
        }
        purpleWidth = Math.max(purpleWidth, last - first + 1);
      }
      for (let offset = 0; offset < moving.length; offset += 4) {
        if (Math.floor(offset / 4 / width) >= leg.foot.rect[1] && (moving[offset + 3] >= 200 || idle[offset + 3] >= 200)) {
          if ([0, 1, 2, 3].some((channel) => Math.abs(moving[offset + channel] - idle[offset + channel]) > 1)) footDifferences++;
        }
        if (moving[offset + 3] < 200) continue;
        opaque++;
        // Canvas unpremultiplies RGB after the segmentation alpha changes;
        // partially transparent edges can round by two levels, opaque pixels
        // by one. The native foot matte above still uses the stricter check.
        const rounding = moving[offset + 3] === 255 ? 1 : 2;
        if (idle[offset + 3] < 200 || [0, 1, 2].some((channel) => Math.abs(moving[offset + channel] - idle[offset + channel]) > rounding)) differences++;
      }
      return { opaque, differences, footDifferences, purpleWidth };
    });
    const purpleOnLowerPiece = manifest.gait.legs.map((leg) => {
      context.clearRect(0, 0, 160, 192);
      const [x, y, width, height] = leg.shin.rect;
      context.drawImage(rig, x, y, width, height, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      let purple = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) if (isPurple(pixels, offset)) purple++;
      return purple;
    });
    const toeDirections = [];
    // Paint each foot through the actual renderer in isolation. Its toe mass
    // must stay ahead of its ankle in both travel directions, through support
    // and swing; opposite-facing idle cutouts fail this check.
    for (const [index, leg] of manifest.gait.legs.entries()) {
      const isolated = new Proxy(context, {
        get(target, key) {
          if (key === "drawImage") return (...args) => {
            if (args[1] === leg.foot.rect[0] && args[2] === leg.foot.rect[1]) target.drawImage(...args);
          };
          const value = Reflect.get(target, key, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
        set(target, key, value) { return Reflect.set(target, key, value, target); },
      });
      for (const state of ["walk", "run"]) for (const direction of [-1, 1]) for (const phase of [0, 0.25, 0.5, 0.8]) {
        drawHito(isolated, atlas, manifest, state, 0, direction, { x: 0, y: 0 }, false,
          { image: rig, distance: phase * manifest.gait.stride / 2 / manifest.gait.support });
        const pixels = context.getImageData(0, 0, 160, 192).data;
        let sum = 0, weight = 0;
        for (let offset = 0; offset < pixels.length; offset += 4) {
          const alpha = pixels[offset + 3];
          sum += ((offset / 4) % 160 + 0.5) * alpha;
          weight += alpha;
        }
        const step = getHitoStep(phase + (index === 0 ? 0.5 : 0), manifest.gait.stride, manifest.gait.lift, manifest.gait.support);
        const ankle = getHitoFootPose(step, leg, manifest.gait.ground).ankle[0];
        toeDirections.push(direction * (sum / weight - (direction < 0 ? 160 - ankle : ankle)));
      }
    }
    return {
      resting, sizes, armChanges: changedPurple(a, b, 112, 149),
      thighChanges, thighMotionRatio: thighChanges / Math.max(1, visibleThigh),
      cutouts, toeDirections, purpleOnLowerPiece,
    };
  }, { source: Buffer.from(rendererSource).toString("base64"), motion: Buffer.from(motionSource).toString("base64") });
  for (const size of result.sizes) {
    expect(Math.abs(size.height - result.resting.height)).toBeLessThanOrEqual(4);
    expect(Math.abs(size.top - result.resting.top)).toBeLessThanOrEqual(3);
    expect(Math.abs(size.bottom - result.resting.bottom)).toBeLessThanOrEqual(3);
  }
  expect(result.armChanges).toBeGreaterThan(80);
  // Narrower reference legs expose less area below the belly. Verify a
  // meaningful fraction of that visible area moves, rather than requiring
  // the former bulky thighs' absolute number of changed pixels.
  expect(result.thighChanges).toBeGreaterThan(10);
  expect(result.thighMotionRatio).toBeGreaterThan(0.15);
  for (const cutout of result.cutouts) {
    expect(cutout.opaque).toBeGreaterThan(300);
    expect(cutout.differences).toBe(0);
    expect(cutout.footDifferences).toBe(0);
    // The visible reference leg is 16 px wide; allow two edge pixels for
    // mirroring/alpha registration, but never the 25 px belly bridge.
    expect(cutout.purpleWidth).toBeLessThanOrEqual(18);
  }
  for (const forward of result.toeDirections) expect(forward).toBeGreaterThan(2);
  for (const purple of result.purpleOnLowerPiece) expect(purple).toBe(0);
});
