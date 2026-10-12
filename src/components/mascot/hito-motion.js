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
export function getHitoStep(phase, stride = 14, lift = 2, support = 0.6) {
  const cycle = ((phase % 1) + 1) % 1;
  const ease = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  if (cycle < support) {
    const contact = cycle / support;
    const heel = 1 - ease(contact / 0.16);
    const toe = ease((contact - 0.78) / 0.22);
    return {
      x: stride * (0.5 - contact), lift: 0,
      angle: -0.12 * heel + 0.18 * toe,
      roll: heel > 0 ? 0 : toe > 0 ? 1 : 0.5,
      planted: true,
    };
  }
  const progress = (cycle - support) / (1 - support);
  // A Hermite return keeps the same backwards velocity at toe-off and heel
  // strike. The old zero-velocity return made the feet stop and snap forward.
  const p2 = progress * progress, p3 = p2 * progress;
  const tangent = -stride * (1 - support) / support;
  const x = (2 * p3 - 3 * p2 + 1) * -stride / 2
    + (-2 * p3 + 3 * p2) * stride / 2
    + (p3 - 2 * p2 + progress + p3 - p2) * tangent;
  return {
    x,
    lift: lift * 16 * p2 * (1 - progress) ** 2,
    angle: 0.18 * (1 - ease(progress / 0.4)) - 0.12 * ease((progress - 0.7) / 0.3),
    roll: 1 - ease(progress),
    planted: false,
  };
}

export function transformHitoPoint(pose, point) {
  const x = point[0] - pose.bind[0], y = point[1] - pose.bind[1];
  const c = Math.cos(pose.angle), s = Math.sin(pose.angle);
  return [pose.position[0] + x * c - y * s, pose.position[1] + x * s + y * c];
}

export function getHitoBodyPose(phase, gait, running = false) {
  const wave = phase * Math.PI * 2;
  const weight = gait.weight;
  const pelvis = {
    bind: gait.body.pivot,
    position: [gait.body.pivot[0] + Math.sin(wave) * weight.sway,
      gait.body.pivot[1] + Math.cos(wave * 2 - Math.PI * 0.2) * weight.drop],
    angle: Math.cos(wave) * weight.roll,
  };
  const torso = {
    bind: gait.body.waist,
    position: transformHitoPoint(pelvis, gait.body.waist),
    angle: (running ? 0.027 : 0.012) - pelvis.angle * 0.45,
  };
  const head = {
    bind: gait.body.neck,
    position: transformHitoPoint(torso, gait.body.neck),
    angle: 0.003 + Math.sin(wave) * 0.003,
  };
  const hips = gait.legs.map((leg, index) => {
    const hip = transformHitoPoint(pelvis, leg.hip);
    hip[0] += (index === 0 ? -1 : 1) * Math.cos(wave) * weight.yaw;
    return hip;
  });
  return { pelvis, torso, head, hips };
}

// Roll around the contacting heel/toes, then return the ankle's actual world
// position for the leg solver. The planted contact never follows the pelvis.
export function getHitoFootPose(step, leg, ground) {
  const heel = -leg.foot.pivot[0] + 2;
  const toe = leg.foot.rect[2] - leg.foot.pivot[0] - 3;
  const pivot = [heel + (toe - heel) * step.roll, leg.foot.ground];
  const origin = [leg.hip[0] + step.x, ground - leg.foot.ground - step.lift];
  const angle = step.angle * (leg.foot.roll ?? 1);
  const c = Math.cos(angle), s = Math.sin(angle);
  const ankle = [origin[0] + pivot[0] * (1 - c) + pivot[1] * s,
    origin[1] + pivot[1] * (1 - c) - pivot[0] * s];
  return { origin, pivot, ankle, angle };
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
