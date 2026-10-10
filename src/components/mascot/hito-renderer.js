import { getHitoStep, getHitoArmSwing, solveHitoLeg } from "./hito-motion.js";

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
  const cycle = phase % 1;
  const bob = -gait.bob * (1 - Math.cos(cycle * Math.PI * 4));
  const bodyPivot = gait.body.pivot;
  const tilt = (state === "run" ? 0.018 : 0.006) + Math.sin(cycle * Math.PI * 2) * 0.006;
  function bodyTransform() {
    context.translate(bodyPivot[0], bodyPivot[1] + bob);
    context.rotate(tilt);
    context.translate(-bodyPivot[0], -bodyPivot[1]);
  }
  function drawArm(index) {
    const arm = gait.arms[index];
    const phaseOffset = index === 0 ? 0.5 : 0;
    context.save();
    bodyTransform();
    context.translate(...arm.shoulder);
    context.rotate(getHitoArmSwing(phase + phaseOffset, arm.amplitude));
    const [x, y, w, h] = arm.rect;
    context.drawImage(image, x, y, w, h, -arm.pivot[0], -arm.pivot[1], w, h);
    context.restore();
  }
  // The far arm passes behind the torso; the near hand crosses its front.
  drawArm(0);
  for (const [index, leg] of gait.legs.entries()) {
    const step = getHitoStep(phase + (index === 0 ? 0.5 : 0), gait.stride, gait.lift, gait.support);
    const [hipX, hipY] = leg.hip;
    const ankleX = hipX + step.x;
    const ankleY = gait.ground - leg.foot.ground - step.lift;
    const hip = [hipX, hipY + bob];
    const ankle = [ankleX, ankleY];
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
    // Keep the pant cuff's width but exclude the original sideways toes from
    // the ankle texture. The foot is a separate, flat contact surface.
    context.beginPath();
    for (const [point, [x, y]] of leg.shin.mask.entries()) {
      const px = x - leg.shin.pivot[0], py = y - leg.shin.pivot[1];
      if (point === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.closePath();
    context.clip();
    context.drawImage(image, sx, sy, sw, sh, -leg.shin.pivot[0], -leg.shin.pivot[1], sw, sh);
    context.restore();
    context.save();
    context.translate(ankleX, ankleY);
    context.rotate(step.angle);
    const [fx, fy, fw, fh] = leg.foot.rect;
    context.drawImage(image, fx, fy, fw, fh, -leg.foot.pivot[0], -leg.foot.pivot[1], fw, fh);
    context.restore();
  }
  // The body overlaps the leg attachment, preserving the purple thigh shape.
  context.save();
  bodyTransform();
  const [sx, sy, sw, sh] = gait.body.rect;
  context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  drawEyes(context, image, gait.body.eyes, sx, sy, manifest.palette, look, blink, direction);
  context.restore();
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
