import { getHitoStep, getHitoArmSwing, solveHitoLeg, getHitoBodyPose, getHitoFootPose } from "./hito-motion.js";

// Gesture/fallback sprites support unequal frame durations.
export function getHitoFrame(animation, age) {
  if (!animation.frameDurations) return Math.floor(age * animation.fps / 1000) % animation.frames;
  const cycle = animation.frameDurations.reduce((sum, duration) => sum + duration, 0);
  let time = age % cycle;
  for (let frame = 0; frame < animation.frameDurations.length; frame++) {
    if (time < animation.frameDurations[frame]) return frame;
    time -= animation.frameDurations[frame];
  }
  return 0;
}

// Preserve the source eye texture and highlights instead of drawing block eyes.
export function drawHito(context, image, manifest, state, frame, direction, look, blink, motion) {
  const { width, height } = manifest.frame;
  const animation = manifest.animations[state];
  const index = frame % animation.frames;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.save();
  const sideways = state === "walk" || state === "run";
  if (sideways && direction < 0) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  const gait = manifest.gait;
  if (sideways && gait && motion?.image?.complete && motion.image.naturalWidth) {
    drawWalk(context, motion.image, gait, manifest, state, direction, look, blink, motion.distance);
  } else {
    context.drawImage(image, index * width, animation.row * height, width, height, 0, 0, width, height);
    drawEyes(context, image, animation.eyes[index], index * width, animation.row * height, manifest.palette, look, blink, sideways ? direction : 1);
  }
  context.restore();
}

function drawWalk(context, image, gait, manifest, state, direction, look, blink, distance) {
  // CSS pixels -> texture pixels. Synchronizing phase to distance prevents
  // skating, and also stops the feet as soon as a dragged Hito stops moving.
  const phase = distance / (gait.stride / 2 / gait.support);
  const body = getHitoBodyPose(phase, gait, state === "run");
  function applyPose(pose) {
    context.translate(...pose.position);
    context.rotate(pose.angle);
    context.translate(-pose.bind[0], -pose.bind[1]);
  }
  function drawRegion(region, pose) {
    context.save();
    applyPose(pose);
    const [x, y, w, h] = gait.body.regions[region];
    context.drawImage(image, x, y, w, h, x, y, w, h);
    if (region === "head") drawEyes(context, image, gait.body.eyes, 0, 0, manifest.palette, look, blink, direction);
    context.restore();
  }
  function drawArm(index) {
    const arm = gait.arms[index];
    const phaseOffset = index === 0 ? 0.5 : 0;
    context.save();
    applyPose(body.torso);
    context.translate(...arm.shoulder);
    context.rotate(getHitoArmSwing(phase + phaseOffset, arm.amplitude));
    const [x, y, w, h] = arm.rect;
    context.drawImage(image, x, y, w, h, -arm.pivot[0], -arm.pivot[1], w, h);
    context.restore();
  }
  // The far arm passes behind the torso; the near hand crosses its front.
  drawArm(0);
  const legs = gait.legs.map((leg, index) => {
    const step = getHitoStep(phase + (index === 0 ? 0.5 : 0), gait.stride, gait.lift, gait.support);
    return { leg, index, step };
  });
  // Draw the leading leg last, with its ankle and foot as one layer group.
  // Compare travel from each bind hip, not their different screen positions.
  // Leftward motion already mirrors the whole character, including this order.
  legs.sort((a, b) => a.step.x - b.step.x || a.index - b.index);
  for (const { leg, index, step } of legs) {
    const hip = body.hips[index];
    const foot = getHitoFootPose(step, leg, gait.ground);
    const ankle = foot.ankle;
    const pose = solveHitoLeg(hip, ankle, leg.thigh.length, leg.shin.length);
    context.save();
    context.translate(...hip);
    context.rotate(pose.upperAngle);
    const [tx, ty, tw, th] = leg.thigh.rect;
    context.drawImage(image, tx, ty, tw, th, -leg.thigh.pivot[0], -leg.thigh.pivot[1], tw, th);
    context.restore();
    context.save();
    context.translate(...pose.knee);
    context.rotate(pose.lowerAngle);
    const [sx, sy, sw, sh] = leg.shin.rect;
    // The lower texture contains only the yellow ankle. The entire rounded
    // purple cuff stays on the upper piece, preserving its continuous edge.
    context.drawImage(image, sx, sy, sw, sh, -leg.shin.pivot[0], -leg.shin.pivot[1], sw, sh);
    context.restore();
    context.save();
    context.translate(...foot.origin);
    context.translate(...foot.pivot);
    context.rotate(foot.angle);
    context.translate(-foot.pivot[0], -foot.pivot[1]);
    const [fx, fy, fw, fh] = leg.foot.rect;
    context.drawImage(image, fx, fy, fw, fh, -leg.foot.pivot[0], -leg.foot.pivot[1], fw, fh);
    context.restore();
  }
  // Reuse the exact same artwork at unit scale. Overlapping neck/waist bands
  // join pelvis, counter-rotating chest and stable head without visible cuts.
  drawRegion("pelvis", body.pelvis);
  drawRegion("torso", body.torso);
  drawRegion("head", body.head);
  drawArm(1);
}

function drawEyes(context, image, eyes, sourceX, sourceY, palette, look, blink, direction) {
  for (const eye of eyes) {
    const { x, y, rx, ry } = eye;
    const dx = Math.max(-1.5, Math.min(1.5, look.x * direction));
    const dy = Math.max(-1.5, Math.min(1.5, look.y));
    // Neutral gaze uses the original artwork verbatim. Moving the iris is
    // clipped inside the existing eye, keeping feather discs and lids intact.
    if (!blink && Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) continue;
    context.save();
    context.beginPath();
    context.ellipse(x, y, rx + 2, ry + 2, 0, 0, Math.PI * 2);
    context.clip();
    if (blink) {
      context.fillStyle = palette.purple;
      context.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 2 + 4);
      context.fillStyle = palette.shade;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x - rx - 2, y + 1);
      context.quadraticCurveTo(x, y + ry * 0.6, x + rx + 2, y + 1);
      context.strokeStyle = palette.shade;
      context.stroke();
    } else {
      context.fillStyle = palette.white;
      context.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 2 + 4);
      const sx = sourceX + x - rx;
      const sy = sourceY + y - ry;
      context.drawImage(image, sx, sy, rx * 2, ry * 2, x - rx + dx, y - ry + dy, rx * 2, ry * 2);
    }
    context.restore();
  }
}
