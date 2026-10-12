// Assemble Hito's generated artwork, preserving its original alpha and colors.
// Source images and prompts live in scripts/hito-source; no API is used here.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const W = 160;
const H = 192;
const COLUMNS = 8;
const BASELINE = 184;
const source = fileURLToPath(new URL("./hito-source/", import.meta.url));
const output = fileURLToPath(new URL("../public/img/hito-pet/", import.meta.url));
// Fireball's installed walk sequence: seven 120ms frames and a 220ms settle.
const WALK_TIMING = [120, 120, 120, 120, 120, 120, 120, 220];
const animations = {
  idle: { frames: 4, fps: 3, duration: 4000, pose: 0 },
  walk: { frames: 8, fps: 8, frameDurations: WALK_TIMING, duration: 9000, speed: 23 },
  run: { frames: 8, fps: 13, duration: 4500, speed: 48 },
  wave: { frames: 6, fps: 6, duration: 3000, pose: 1 },
  hop: { frames: 8, fps: 9, duration: 1800, pose: 0 },
  think: { frames: 4, fps: 3, duration: 4200, pose: 2 },
  sleep: { frames: 4, fps: 2, duration: 6000, pose: 3 },
  celebrate: { frames: 8, fps: 8, duration: 3000, pose: 5 },
  work: { frames: 6, fps: 5, duration: 4800, pose: 4 },
  flutter: { frames: 6, fps: 7, duration: 2400, pose: 6 },
  love: { frames: 6, fps: 5, duration: 3000, pose: 7 },
};

function components(width, height, accepts) {
  const labels = new Int32Array(width * height);
  const queue = new Int32Array(width * height);
  const groups = [];
  let id = 0;
  for (let pixel = 0; pixel < labels.length; pixel++) {
    if (labels[pixel] || !accepts(pixel)) continue;
    id++;
    let head = 0;
    let tail = 1;
    queue[0] = pixel;
    labels[pixel] = id;
    let x0 = width, y0 = height, x1 = 0, y1 = 0;
    while (head < tail) {
      const current = queue[head++];
      const x = current % width;
      const y = Math.floor(current / width);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const neighbor of [x > 0 ? current - 1 : -1, x + 1 < width ? current + 1 : -1, y > 0 ? current - width : -1, y + 1 < height ? current + width : -1]) {
        if (neighbor < 0 || labels[neighbor] || !accepts(neighbor)) continue;
        labels[neighbor] = id;
        queue[tail++] = neighbor;
      }
    }
    groups.push({ id, size: tail, x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 });
  }
  return { labels, groups };
}

async function extractPoses(path, count = 8) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { labels, groups } = components(info.width, info.height, (pixel) => data[pixel * 4 + 3] > 96);
  const bodies = groups.filter((group) => group.size > 4000).sort((a, b) => b.size - a.size).slice(0, count);
  if (bodies.length !== count) throw new Error(`${path}: expected ${count} separated silhouettes.`);
  // Extract connected silhouettes rather than rigid grid cells: an open wing
  // can extend into a gutter while still belonging to the correct character.
  bodies.sort((a, b) => (count === 8 ? Math.floor((a.y + a.height / 2) / (info.height / 2)) - Math.floor((b.y + b.height / 2) / (info.height / 2)) : 0) || a.x + a.width / 2 - b.x - b.width / 2);
  return bodies.map((body) => {
    const x0 = Math.max(0, body.x - 2);
    const y0 = Math.max(0, body.y - 2);
    const width = Math.min(info.width - x0, body.width + 4);
    const height = Math.min(info.height - y0, body.height + 4);
    const pixels = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const pixel = (y + y0) * info.width + x + x0;
      if (!data[pixel * 4 + 3]) continue;
      let belongs = labels[pixel] === body.id;
      // Retain antialiased edge pixels connected to this exact alpha matte.
      if (!belongs && !labels[pixel]) {
        for (let dy = -2; dy <= 2 && !belongs; dy++) for (let dx = -2; dx <= 2 && !belongs; dx++) {
          const px = x + x0 + dx, py = y + y0 + dy;
          if (px >= 0 && py >= 0 && px < info.width && py < info.height) belongs = labels[py * info.width + px] === body.id;
        }
      }
      if (belongs) data.copy(pixels, (y * width + x) * 4, pixel * 4, pixel * 4 + 4);
    }
    // The pelvis anchors the sprite; bounding-box centering would make Hito
    // slide sideways whenever it raises one hand or extends a foot.
    let sum = 0, count = 0;
    for (let y = Math.floor(height * 0.73); y < Math.floor(height * 0.79); y++) {
      for (let x = 0; x < width; x++) if (pixels[(y * width + x) * 4 + 3] > 128) { sum += x; count++; }
    }
    return { pixels, width, height, anchor: count ? sum / count : width / 2 };
  });
}

function detectEyes(data, width, height, band) {
  const whites = components(width, height, (pixel) => {
    if (Math.floor(pixel / width) > height * 0.52 || data[pixel * 4 + 3] < 200) return false;
    const [r, g, b] = data.subarray(pixel * 4, pixel * 4 + 3);
    return Math.min(r, g, b) > 172 && Math.max(r, g, b) - Math.min(r, g, b) < 46;
  }).groups.filter((group) => group.width > 8 && group.height > 12 && group.size > 70).sort((a, b) => b.size - a.size);
  const masks = [];
  for (const white of whites) {
    if (masks.some((mask) => Math.abs(mask.x + mask.width / 2 - white.x - white.width / 2) < 12)) continue;
    masks.push(white);
    if (masks.length === 2) break;
  }
  const eyes = [];
  for (const mask of masks) {
    const darkGroups = components(mask.width, mask.height, (pixel) => {
      const x = mask.x + pixel % mask.width, y = mask.y + Math.floor(pixel / mask.width);
      const index = (y * width + x) * 4;
      return data[index + 3] > 200 && data[index] < (band ? 55 : 95) && data[index + 1] < (band ? 55 : 90) && data[index + 2] < (band ? 80 : 125);
    }).groups;
    const dark = darkGroups.filter((group) => {
      const centerY = mask.y + group.y + group.height / 2;
      return group.width > 3 && group.height > 5 && group.size / (group.width * group.height) > 0.42 && (!band || centerY >= band[0] && centerY <= band[1]);
    }).sort((a, b) => b.size - a.size)[0];
    if (!dark) continue;
    eyes.push({
      x: mask.x + dark.x + dark.width / 2,
      y: mask.y + dark.y + dark.height / 2,
      rx: dark.width / 2 + 1,
      ry: dark.height / 2 + 1,
    });
  }
  return eyes.sort((a, b) => a.x - b.x);
}

const poses = await extractPoses(`${source}/poses-v2.png`);
const walking = await extractPoses(`${source}/walk-v2.png`);
const all = [...poses, ...walking];
const scale = Math.min((H - 20) / Math.max(...all.map((pose) => pose.height)), ...all.map((pose) => (W / 2 - 5) / Math.max(pose.anchor, pose.width - pose.anchor)));
const composites = [];
let row = 0;
for (const [state, animation] of Object.entries(animations)) {
  animation.row = row++;
  animation.eyes = [];
  delete animation.pose;
  const poseIndex = { idle: 0, wave: 1, think: 2, sleep: 3, work: 4, celebrate: 5, flutter: 6, love: 7, hop: 0 }[state];
  for (let frame = 0; frame < animation.frames; frame++) {
    const pose = state === "walk" || state === "run" ? walking[frame] : poses[poseIndex];
    const width = Math.round(pose.width * scale), height = Math.round(pose.height * scale);
    const jumping = state === "hop" || state === "celebrate";
    const lift = jumping ? [0, 3, 10, 18, 18, 10, 3, 0][frame % 8] : 0;
    const breathe = !jumping && state !== "walk" && state !== "run" && frame % 4 === 2 ? 1 : 0;
    const buffer = await sharp(pose.pixels, { raw: { width: pose.width, height: pose.height, channels: 4 } }).resize(width, height, { kernel: "lanczos3" }).png().toBuffer();
    const cell = await sharp({ create: { width: W, height: H, channels: 4, background: "#00000000" } }).composite([{ input: buffer, left: Math.round(W / 2 - pose.anchor * scale), top: BASELINE - height - lift - breathe }]).png().toBuffer();
    const raw = await sharp(cell).raw().toBuffer();
    const eyes = state === "sleep" || state === "celebrate" ? [] : detectEyes(raw, W, H);
    if (state === "idle" && eyes.length !== 2) throw new Error("Hito's two round eyes could not be registered.");
    if ((state === "walk" || state === "run") && !eyes.length) throw new Error(`Missing visible profile eye in ${state} frame ${frame}.`);
    animation.eyes.push(eyes);
    composites.push({ input: cell, left: frame * W, top: animation.row * H });
  }
}
await mkdir(output, { recursive: true });
await sharp({ create: { width: W * COLUMNS, height: H * row, channels: 4, background: "#00000000" } }).composite(composites).webp({ lossless: true, effort: 6 }).toFile(`${output}/hito-sprites-v2.webp`);

// Match the actual resting silhouette, not the nominal canvas dimensions.
const resting = await sharp(composites[0].input).ensureAlpha().raw().toBuffer();
let restTop = H, restBottom = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (resting[(y * W + x) * 4 + 3] < 128) continue;
  restTop = Math.min(restTop, y); restBottom = Math.max(restBottom, y);
}
const restHeight = restBottom - restTop + 1;

// Body and arms retain their three-quarter artwork. Legs are cut from the
// actual idle silhouette, at its native size: the old isolated leg artwork
// had much deeper, rounder thighs than the resting character.
const parts = await extractPoses(`${source}/rig-v4.png`, 5);
const rigCells = [];
const legs = [];
const arms = [];
let bodyEyes;
const bodyHeight = restHeight - 25;
for (let index = 0; index < parts.length; index++) {
  const part = parts[index];
  const height = index === 0 ? bodyHeight : index < 3 ? (index === 1 ? 46 : 44) : restBottom - 146 + 1;
  const width = index >= 3 ? 36 : Math.round(part.width * height / part.height);
  const left = index === 0 ? Math.round(W / 2 - part.anchor * height / part.height) : Math.round(W / 2 - width / 2);
  const top = index === 0 ? restTop : 0;
  let buffer;
  const reference = index === 3 ? { x: 45, y: 146, center: 67 } : { x: 81, y: 146, center: 92 };
  if (index >= 3) {
    const pixels = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      // The first two rows belong to the belly, not to an exposed leg.
      // Their attachment remains hidden behind the body's natural contour.
      if (reference.y + y < 148) continue;
      if (reference.y + y >= 163) {
        // Below the pant cuff, preserve every toe and claw. Their tips form
        // separate spans; selecting just the ankle's span would cut them off.
        const offset = ((reference.y + y) * W + reference.x) * 4;
        resting.copy(pixels, y * width * 4, offset, offset + width * 4);
        continue;
      }
      // Select the ankle's connected row span. This excludes the other leg,
      // hand and separate tail pixels without replacing the natural matte.
      const spans = [];
      let start = -1;
      for (let x = 0; x <= width; x++) {
        const opaque = x < width && resting[((reference.y + y) * W + reference.x + x) * 4 + 3] > 96;
        if (opaque && start < 0) start = x;
        if (!opaque && start >= 0) { spans.push([start, x - 1]); start = -1; }
      }
      const distance = ([a, b]) => Math.max(reference.x + a - reference.center, reference.center - reference.x - b, 0);
      spans.sort((a, b) => distance(a) - distance(b));
      if (!spans.length) continue;
      const [a, b] = spans[0];
      for (let x = Math.max(0, a - 1); x <= Math.min(width - 1, b + 1); x++) {
        const offset = ((reference.y + y) * W + reference.x + x) * 4;
        resting.copy(pixels, (y * width + x) * 4, offset, offset + 4);
        {
          // Row 158 is the first exposed, separate leg contour below the
          // belly. Carry that real alpha upwards through the hidden root:
          // neither the belly bridge nor the joined tail is part of a leg.
          const sourceX = index === 3 ? reference.x + x : 67.5 - (reference.x + x - 92);
          const x0 = Math.floor(sourceX), blend = sourceX - x0;
          const row = Math.max(reference.y + y, 158) * W;
          const alpha = resting[(row + x0) * 4 + 3] * (1 - blend) + resting[(row + x0 + 1) * 4 + 3] * blend;
          pixels[(y * width + x) * 4 + 3] = Math.min(pixels[(y * width + x) * 4 + 3], Math.round(alpha));
        }
        // This attachment is covered by the waist. Fade the short hidden
        // root rather than leaving a rectangular edge that becomes a point
        // when the whole rounded leg rotates.
        const root = Math.min(1, y / 6);
        const coverage = root * root * (3 - 2 * root);
        pixels[(y * width + x) * 4 + 3] = Math.round(pixels[(y * width + x) * 4 + 3] * coverage);
      }
    }
    // Idle feet point outwards. Normalize the left-facing cutout once so
    // both toes face right; the renderer mirrors the entire rig for leftward
    // travel. Register ankle/knee pivots from this oriented texture below.
    const texture = sharp(pixels, { raw: { width, height, channels: 4 } });
    if (index === 3) texture.flop();
    buffer = await texture.png().toBuffer();
  } else {
    buffer = await sharp(part.pixels, { raw: { width: part.width, height: part.height, channels: 4 } }).resize(width, height).png().toBuffer();
  }
  const cell = await sharp({ create: { width: W, height: H, channels: 4, background: "#00000000" } }).composite([{ input: buffer, left, top }]).png().toBuffer();
  const raw = await sharp(cell).ensureAlpha().raw().toBuffer();
  if (index === 0) {
    bodyEyes = detectEyes(raw, W, H, [restTop + 27, restTop + 53]);
    if (bodyEyes.length !== 2) throw new Error("Missing visible eyes in three-quarter articulated body.");
  } else if (index < 3) {
    arms.push({
      shoulder: index === 1 ? [58, 108] : [104, 108],
      rect: [index * W + left, top, width, height],
      pivot: [width * 0.57, 6],
      amplitude: index === 1 ? 0.53 : 0.49,
    });
  } else {
    let yellowTop = height;
    const rows = [];
    for (let y = 0; y < height; y++) {
      const yellow = [];
      for (let x = left; x < left + width; x++) {
        const offset = (y * W + x) * 4;
        const [r, g, b, a] = raw.subarray(offset, offset + 4);
        if (a > 128 && r > 125 && g > 85 && b < 130 && r > b * 1.4) yellow.push(x);
      }
      rows.push(yellow);
      if (yellow.length > 2) yellowTop = Math.min(yellowTop, y);
    }
    if (yellowTop > height * 0.8) throw new Error("Short yellow ankle could not be registered.");
    const stem = rows[yellowTop + 2];
    const ankleX = stem.reduce((sum, x) => sum + x, 0) / stem.length;
    const footTop = rows.findIndex((row, y) => y > yellowTop + 2 && row.length >= stem.length * 1.45);
    if (footTop < 0) throw new Error("Small bird foot could not be registered.");
    const ankleY = footTop + 2;
    // Keep the whole rounded purple leg on one rigid piece. The hinge is at
    // the yellow ankle, so no second pant fragment can rotate into a spike.
    const kneeY = yellowTop;
    const upperLength = kneeY;
    const lowerLength = ankleY - kneeY;
    const thighPivotX = ankleX - left;
    const stemLeft = Math.floor(ankleX - stem.length / 2 - 1);
    const stemRight = Math.ceil(ankleX + stem.length / 2 + 1);
    legs.push({
      hip: [index === 3 ? 89 : 70, reference.y + 2.5],
      reference: { rect: [reference.x, reference.y, width, height], mirrored: index === 3 },
      thigh: { rect: [index * W + left, 0, width, kneeY + 1], pivot: [thighPivotX, 0], length: upperLength },
      shin: {
        rect: [index * W + stemLeft, kneeY, stemRight - stemLeft + 1, lowerLength + 2], pivot: [ankleX - stemLeft, 0], length: lowerLength,
      },
      foot: { rect: [index * W + left, footTop, width, height - footTop], pivot: [ankleX - left, ankleY - footTop], ground: height - ankleY, roll: 0.5 },
    });
  }
  rigCells.push({ input: cell, left: index * W, top: 0 });
}
const stride = 14;
const lift = 2;
for (const leg of legs) {
  const upper = leg.thigh.length, lower = leg.shin.length;
  const vertical = BASELINE - leg.foot.ground - leg.hip[1];
  if (Math.hypot(vertical, stride / 2) >= upper + lower) throw new Error("Owl leg proportions do not support the gait without stretching.");
}
await sharp({ create: { width: W * 5, height: H, channels: 4, background: "#00000000" } }).composite(rigCells).webp({ lossless: true, effort: 6 }).toFile(`${output}/hito-rig-v9.webp`);
const gait = {
  image: "/img/hito-pet/hito-rig-v9.webp", stride, lift, support: 0.6, ground: BASELINE,
  weight: { sway: 0.6, drop: 0.3, roll: 0.025, yaw: 0.4 },
  reference: { top: restTop, height: restHeight, bodyHeight },
  body: {
    rect: [0, 0, W, H], pivot: [80, 150], eyes: bodyEyes,
    waist: [80, 143], neck: [82, 101],
    // Preserve the original rounded waist contour. It occludes each leg's
    // upper cut instead of exposing a straight horizontal crop across Hito.
    regions: { head: [0, 0, W, 105], torso: [0, 99, W, 48], pelvis: [0, 141, W, H - 141] },
  },
  legs: [legs[1], legs[0]], arms: [arms[1], arms[0]],
};
await writeFile(`${output}/hito.json`, JSON.stringify({ name: "Hito", version: 9, image: "/img/hito-pet/hito-sprites-v2.webp", frame: { width: W, height: H }, palette: { purple: "#8b65ad", shade: "#563c75", white: "#f2eff5" }, animations, gait }, null, 2) + "\n");
console.log(`Hito v9: resting height ${restHeight}px; native exposed-leg alpha excludes belly/tail, intact rounded cuffs and upright stance. Lift ${lift.toFixed(1)}px.`);
