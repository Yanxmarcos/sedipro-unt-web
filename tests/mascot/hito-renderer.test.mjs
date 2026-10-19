import { test } from "node:test";
import assert from "node:assert/strict";
import { drawHito, getHitoFrame } from "../../src/components/mascot/hito-renderer.js";
import { readFileSync } from "node:fs";
import { getHitoStep, getHitoArmSwing, solveHitoLeg, boundHito, getHitoBodyPose, getHitoFootPose, transformHitoPoint } from "../../src/components/mascot/hito-motion.js";

const manifest = JSON.parse(readFileSync(new URL("../../public/img/hito-pet/hito.json", import.meta.url)));

test("la caminata conserva la cadencia de ocho fases de Fireball, incluido el último apoyo", () => {
  const animation = manifest.animations.walk;
  assert.equal(animation.frames, 8);
  assert.deepEqual(animation.frameDurations, [120, 120, 120, 120, 120, 120, 120, 220]);
  for (const [time, frame] of [[0, 0], [119, 0], [120, 1], [719, 5], [720, 6], [839, 6], [840, 7], [1059, 7], [1060, 0], [1180, 1]]) {
    assert.equal(getHitoFrame(animation, time), frame);
  }
});

test("el apoyo no patina: el pie queda inmóvil en el mundo mientras avanza el cuerpo", () => {
  const { stride, support } = manifest.gait;
  const origin = getHitoStep(0, stride).x;
  for (const phase of [0.1, 0.2, 0.4, 0.59]) {
    const bodyTravel = phase * stride / support;
    const step = getHitoStep(phase, stride);
    assert.ok(Math.abs(bodyTravel + step.x - origin) < 1e-9);
    assert.equal(step.lift, 0);
  }
  assert.ok(getHitoStep(0).angle < 0);
  assert.equal(getHitoStep(0.2).angle, 0);
  assert.ok(getHitoStep(0.59).angle > 0);
});

test("las dos patas alternan, levantan el pie y siempre mantienen un apoyo", () => {
  const { stride, lift, support } = manifest.gait;
  const stepAt = (phase) => getHitoStep(phase, stride, lift, support);
  let nearLift = 0, farLift = 0;
  for (let frame = 0; frame < 120; frame++) {
    const phase = frame / 120;
    const near = stepAt(phase);
    const far = stepAt(phase + 0.5);
    assert.ok(near.planted || far.planted);
    nearLift = Math.max(nearLift, near.lift);
    farLift = Math.max(farLift, far.lift);
  }
  assert.ok(nearLift >= lift * 0.99 && farLift >= lift * 0.99);
  assert.ok(stepAt(0.8).lift > lift * 0.99);
  assert.equal(stepAt(0.3).lift, 0);
  assert.ok(stepAt(0.999999).lift < 0.001);
  assert.ok(Math.abs(stepAt(0.999999).x - stepAt(0).x) < 0.001);
});

test("caminar y correr no cambian la escala de ninguna pieza ni cortan el contorno redondeado de la pelvis", () => {
  const noop = () => {};
  const scales = [], images = [];
  const context = Object.fromEntries(["save", "restore", "translate", "rotate", "clearRect", "beginPath", "moveTo", "lineTo", "closePath", "clip"].map((method) => [method, noop]));
  context.scale = (...values) => scales.push(values);
  context.drawImage = (...values) => images.push(values);
  const image = { complete: true, naturalWidth: 800 };
  for (const state of ["walk", "run"]) for (const direction of [-1, 1]) for (let phase = 0; phase < 120; phase++) {
    drawHito(context, image, manifest, state, 0, direction, { x: 0, y: 0 }, false,
      { image, distance: phase / 120 * manifest.gait.stride / 2 / manifest.gait.support });
  }
  for (const [, , , sourceWidth, sourceHeight, , , targetWidth, targetHeight] of images) {
    assert.equal(targetWidth, sourceWidth);
    assert.equal(targetHeight, sourceHeight);
  }
  for (const scale of scales) assert.deepEqual(scale, [-1, 1]);
  const pelvis = images.filter(([, x, y]) => x === 0 && y === 141);
  assert.ok(pelvis.length > 0);
  for (const [, , y, , height] of pelvis) assert.equal(y + height, manifest.frame.height);
});

test("la pierna adelantada se dibuja encima con su tobillo y pie, en ambos sentidos", () => {
  const noop = () => {};
  const context = Object.fromEntries(["save", "restore", "translate", "rotate", "scale", "clearRect"].map((method) => [method, noop]));
  const image = { complete: true, naturalWidth: 800 };
  const parts = manifest.gait.legs.map((leg) => [leg.thigh.rect, leg.shin.rect, leg.foot.rect]);
  const isLegPart = (rect) => parts.flat().some((part) => part.every((value, index) => value === rect[index]));
  // At each half-cycle the other original leg takes the front layer. Phases
  // away from contact also verify that the swap follows travel, not a timer.
  const phases = [[0, [0, 1]], [0.2, [0, 1]], [0.4, [1, 0]], [0.5, [1, 0]], [0.7, [1, 0]], [0.9, [0, 1]]];
  for (const state of ["walk", "run"]) for (const direction of [-1, 1]) for (const [phase, order] of phases) {
    const drawn = [];
    context.drawImage = (_image, ...values) => {
      const rect = values.slice(0, 4);
      if (isLegPart(rect)) drawn.push(rect);
    };
    drawHito(context, image, manifest, state, 0, direction, { x: 0, y: 0 }, false,
      { image, distance: phase * manifest.gait.stride / 2 / manifest.gait.support });
    assert.deepEqual(drawn, order.flatMap((index) => parts[index]), `${state}, direction ${direction}, phase ${phase}`);
  }
});

test("los muslos y tobillos conservan su longitud durante todo el paso, sin estirar el pie", () => {
  const gait = manifest.gait;
  for (const [index, leg] of gait.legs.entries()) for (let frame = 0; frame <= 400; frame++) {
    const phase = frame / 400;
    const step = getHitoStep(phase + (index === 0 ? 0.5 : 0), gait.stride, gait.lift, gait.support);
    const hip = getHitoBodyPose(phase, gait).hips[index];
    const ankle = getHitoFootPose(step, leg, gait.ground).ankle;
    const { knee, upperAngle } = solveHitoLeg(hip, ankle, leg.thigh.length, leg.shin.length);
    assert.ok(Math.abs(Math.hypot(knee[0] - hip[0], knee[1] - hip[1]) - leg.thigh.length) < 1e-6);
    assert.ok(Math.abs(Math.hypot(ankle[0] - knee[0], ankle[1] - knee[1]) - leg.shin.length) < 1e-6);
    assert.ok(Math.abs(upperAngle) < Math.PI / 6, "Purple leg must stay below 30 degrees, never fold sideways into a pointed cuff.");
  }
});

test("la cadera transfiere peso, el torso compensa y la cabeza conserva sus proporciones", () => {
  const gait = manifest.gait;
  const first = getHitoBodyPose(0, gait), opposite = getHitoBodyPose(0.5, gait);
  assert.ok(first.pelvis.angle * opposite.pelvis.angle < 0);
  assert.ok(first.torso.angle < opposite.torso.angle);
  assert.ok(first.hips[1][0] > opposite.hips[1][0]);
  const positions = [];
  for (let frame = 0; frame < 120; frame++) {
    const pose = getHitoBodyPose(frame / 120, gait);
    positions.push(pose.pelvis.position[1]);
    const a = transformHitoPoint(pose.head, [65, 75]);
    const b = transformHitoPoint(pose.head, [108, 75]);
    assert.ok(Math.abs(Math.hypot(b[0] - a[0], b[1] - a[1]) - 43) < 1e-9);
    assert.ok(Math.abs(pose.head.angle) < 0.01);
  }
  const range = Math.max(...positions) - Math.min(...positions);
  assert.ok(range >= gait.weight.drop * 1.99 && range <= gait.weight.drop * 2.01);
});

test("el talón y los dedos permanecen en el suelo durante el apoyo aunque se mueva la pelvis", () => {
  const gait = manifest.gait, leg = gait.legs[1];
  for (const phases of [[0.01, 0.04, 0.08], [0.2, 0.3, 0.4], [0.5, 0.54, 0.59]]) {
    let contactX;
    for (const phase of phases) {
      const step = getHitoStep(phase, gait.stride, gait.lift, gait.support);
      const foot = getHitoFootPose(step, leg, gait.ground);
      const contact = transformHitoPoint({ bind: [0, 0], position: foot.ankle, angle: foot.angle }, foot.pivot);
      assert.ok(Math.abs(contact[1] - gait.ground) < 1e-9);
      const worldX = phase * gait.stride / gait.support + contact[0];
      contactX ??= worldX;
      assert.ok(Math.abs(worldX - contactX) < 1e-9);
    }
  }
});

test("el pie no frena ni salta en las uniones entre apoyo y retorno", () => {
  const { stride, lift, support } = manifest.gait;
  const epsilon = 1e-6;
  for (const boundary of [support, 1]) {
    const a = getHitoStep(boundary - epsilon, stride, lift, support);
    const b = getHitoStep(boundary, stride, lift, support);
    const c = getHitoStep(boundary + epsilon, stride, lift, support);
    assert.ok(Math.abs((b.x - a.x) / epsilon - (c.x - b.x) / epsilon) < 0.01);
    assert.ok(Math.abs(a.angle - c.angle) < 1e-5);
    assert.ok(a.lift < 0.00001 && c.lift < 0.00001);
  }
});

test("los brazos alternan medio ciclo y contrarrestan la pierna que avanza", () => {
  for (const phase of [0, 0.1, 0.25, 0.4, 0.5, 0.7, 0.9, 1]) {
    const near = getHitoArmSwing(phase);
    const far = getHitoArmSwing(phase + 0.5);
    assert.ok(Math.abs(near + far) < 1e-9);
  }
  assert.ok(getHitoStep(0).x > 0);
  assert.ok(-Math.sin(getHitoArmSwing(0)) < 0);
  assert.ok(getHitoStep(0.5).x < 0);
  assert.ok(-Math.sin(getHitoArmSwing(0.5)) > 0);
});

test("el arrastre queda dentro de la pantalla incluso después de redimensionar", () => {
  assert.deepEqual(boundHito(-100, -100, 320, 844), { x: 12, y: 0 });
  assert.deepEqual(boundHito(10000, 10000, 320, 844), { x: 228, y: 728 });
  assert.deepEqual(boundHito(10000, 10000, 390, 600, 34), { x: 298, y: 458 });
});

test("una pausa larga mantiene el ciclo correcto al volver a dibujar", () => {
  const animation = manifest.animations.walk;
  assert.equal(getHitoFrame(animation, 1060 * 10000 + 850), 7);
  assert.equal(getHitoFrame(manifest.animations.wave, 1000), 0);
});
