"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion";
import styles from "./login-access.module.css";

// Preserve Hito's original face and textured irises; only the gaze/lids move.
export function LoginHito({ covered }) {
  const canvas = useRef(null);
  const cover = useRef(covered);
  const repaint = useRef(() => {});
  const reduced = useReducedMotion();
  useEffect(() => { cover.current = covered; repaint.current(); }, [covered]);
  useEffect(() => {
    const element = canvas.current;
    const context = element.getContext("2d");
    // Inner contours traced against the original eye rims, including their
    // opposite tilt and the narrower lower corners (not generic ellipses).
    const eyeContours = [
      new Path2D("M429 180C397 176 369 214 362 246C354 280 368 302 399 304C430 308 464 288 477 272C490 249 491 211 474 191C462 182 445 177 429 180Z"),
      new Path2D("M646 180C678 176 706 214 713 246C721 280 707 302 676 304C645 308 611 288 598 272C585 249 584 211 601 191C613 182 630 177 646 180Z"),
    ];
    const face = new window.Image();
    let ready = 0;
    let frame = 0;
    let stopped = false;
    let pose = cover.current ? 1 : 0;
    let gaze = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const mix = (a, b, t) => a + (b - a) * t;
    const eye = (x, y, irisX, contour) => {
      context.save();
      context.clip(contour);
      const white = context.createLinearGradient(x, y - 64, x, y + 64);
      white.addColorStop(0, "#f9faf5"); white.addColorStop(1, "#dce2de");
      context.fillStyle = white; context.fillRect(x - 64, y - 65, 128, 130);
      context.save();
      const dx = gaze.x * 24;
      const dy = gaze.y * 18;
      // Keep the source iris size and inward resting position of the original face.
      context.beginPath(); context.ellipse(irisX + dx, 242 + dy, 47, 53, 0, 0, Math.PI * 2); context.clip();
      context.drawImage(face, irisX - 47, 189, 94, 106, irisX - 47 + dx, 189 + dy, 94, 106);
      context.restore();
      if (pose > .001) {
        const lid = context.createLinearGradient(x, y - 64, x, y + 64);
        lid.addColorStop(0, "#a181bd"); lid.addColorStop(1, "#765298");
        context.fillStyle = lid;
        context.fillRect(x - 65, y - 66, 130, pose * 134);
        const seam = y - 64 + pose * 76;
        context.beginPath(); context.moveTo(x - 62, seam - 8); context.quadraticCurveTo(x, seam + 20, x + 62, seam - 8);
        context.lineWidth = 5; context.strokeStyle = "#493453"; context.stroke();
      }
      context.restore();
    };
    const draw = () => {
      frame = 0;
      if (stopped || !ready) return;
      const desired = cover.current ? 1 : 0;
      pose = reduced ? desired : mix(pose, desired, .18);
      gaze = reduced || cover.current ? { x: 0, y: 0 } : { x: mix(gaze.x, target.x, .22), y: mix(gaze.y, target.y, .22) };
      context.clearRect(0, 0, 1120, 520);
      context.save(); context.scale(2, 2);
      context.save(); context.translate(130, 0); context.scale(.625, .625); context.translate(-300, -20);
      context.drawImage(face, 300, 20, 480, 400, 300, 20, 480, 400);
      eye(425, 245, 440, eyeContours[0]); eye(649, 245, 637, eyeContours[1]);
      context.restore();
      context.restore();
      if (Math.abs(pose - desired) > .001 || Math.abs(gaze.x - target.x) + Math.abs(gaze.y - target.y) > .004 && !cover.current && !reduced) schedule();
    };
    const schedule = () => { if (!frame && !stopped && !document.hidden) frame = requestAnimationFrame(draw); };
    const loaded = () => { ready++; schedule(); };
    face.onload = loaded;
    face.src = "/img/hito3.webp";
    const point = event => {
      if (reduced || event.pointerType !== "mouse") return;
      const bounds = element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width * .5)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height * .5) / (bounds.height * .8)));
      schedule();
    };
    const reset = () => { target.x = 0; target.y = 0; schedule(); };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else schedule(); };
    repaint.current = schedule;
    window.addEventListener("pointermove", point, { passive: true });
    document.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true; cancelAnimationFrame(frame); repaint.current = () => {};
      window.removeEventListener("pointermove", point);
      document.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduced]);
  return <canvas ref={canvas} className={styles.mascot} width={1120} height={520} data-login-mascot data-covered={covered} aria-hidden="true" />;
}
