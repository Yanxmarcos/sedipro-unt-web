import { test } from "node:test";
import assert from "node:assert/strict";
import { getHitoFrame } from "../../src/components/mascot/hito-renderer.js";
import { readFileSync } from "node:fs";
import { getHitoStep, getHitoArmSwing, solveHitoLeg, boundHito } from "../../src/components/mascot/hito-motion.js";

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
    assert.equal(step.angle, 0);
  }
});

test("las dos patas alternan, levantan el pie y siempre mantienen un apoyo", () => {
  let nearLift = 0, farLift = 0;
  for (let frame = 0; frame < 120; frame++) {
    const phase = frame / 120;
    const near = getHitoStep(phase);
    const far = getHitoStep(phase + 0.5);
    assert.ok(near.planted || far.planted);
    nearLift = Math.max(nearLift, near.lift);
    farLift = Math.max(farLift, far.lift);
  }
  assert.ok(nearLift >= 9.9 && farLift >= 9.9);
  assert.ok(getHitoStep(0.8).lift > 9.9);
  assert.equal(getHitoStep(0.3).lift, 0);
  assert.ok(getHitoStep(0.999999).lift < 0.001);
  assert.ok(Math.abs(getHitoStep(0.999999).x - getHitoStep(0).x) < 0.001);
});

test("los muslos y tobillos conservan su longitud durante todo el paso, sin estirar el pie", () => {
  const gait = manifest.gait;
  for (const leg of gait.legs) for (let frame = 0; frame <= 200; frame++) {
    const phase = frame / 200;
    const step = getHitoStep(phase, gait.stride, gait.lift, gait.support);
    const bob = -gait.bob * (1 - Math.cos(phase * Math.PI * 4));
    const hip = [leg.hip[0], leg.hip[1] + bob];
    const ankle = [hip[0] + step.x, gait.ground - leg.foot.ground - step.lift];
    const { knee } = solveHitoLeg(hip, ankle, leg.thigh.length, leg.shin.length);
    assert.ok(Math.abs(Math.hypot(knee[0] - hip[0], knee[1] - hip[1]) - leg.thigh.length) < 1e-6);
    assert.ok(Math.abs(Math.hypot(ankle[0] - knee[0], ankle[1] - knee[1]) - leg.shin.length) < 1e-6);
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
