export const PET_WIDTH = 80;
export const PET_HEIGHT = 96;
export const EDGE = 12;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(Math.max(min, max), value));
}

export function boundHito(x, y, width, height, bottom = 8) {
  return {
    x: clamp(x, EDGE, width - PET_WIDTH - EDGE),
    y: clamp(y, 0, height - bottom - PET_HEIGHT - EDGE),
  };
}

// The planted foot travels backwards at the same speed as the body moves
// forwards. Only the returning foot rises, with the other leg half a cycle away.
export function getHitoStep(phase, stride = 26, lift = 10, support = 0.6) {
  const cycle = ((phase % 1) + 1) % 1;
  if (cycle < support) {
    return { x: stride * (0.5 - cycle / support), lift: 0, angle: 0, planted: true };
  }
  const progress = (cycle - support) / (1 - support);
  const ease = progress * progress * (3 - 2 * progress);
  return {
    x: stride * (ease - 0.5),
    lift: lift * Math.sin(Math.PI * progress),
    angle: -0.26 * Math.sin(Math.PI * progress),
    planted: false,
  };
}

// Two rigid bones bend at the knee. Their lengths never change with the step;
// the purple thigh moves with the foot instead of stretching a yellow ankle.
export function solveHitoLeg(hip, ankle, upperLength, lowerLength) {
  const dx = ankle[0] - hip[0];
  const dy = ankle[1] - hip[1];
  const distance = clamp(Math.hypot(dx, dy), Math.abs(upperLength - lowerLength) + 0.001, upperLength + lowerLength - 0.001);
  const base = Math.atan2(dy, dx);
  const bend = Math.acos(clamp((upperLength ** 2 + distance ** 2 - lowerLength ** 2) / (2 * upperLength * distance), -1, 1));
  const angle = base - bend;
  const knee = [hip[0] + Math.cos(angle) * upperLength, hip[1] + Math.sin(angle) * upperLength];
  return { knee, upperAngle: angle - Math.PI / 2, lowerAngle: Math.atan2(ankle[1] - knee[1], ankle[0] - knee[0]) - Math.PI / 2 };
}

export function getHitoArmSwing(phase, amplitude = 0.48) {
  return Math.cos(phase * Math.PI * 2) * amplitude;
}
