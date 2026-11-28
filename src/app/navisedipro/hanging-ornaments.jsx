"use client";

import { useEffect, useRef } from "react";
import styles from "./campaign.module.css";

const maxAngle = 0.85;
const clamp = (value, limit) => Math.max(-limit, Math.min(value, limit));

function Ornament() {
  const pivot = useRef(null);
  const cord = useRef(null);
  const motion = useRef({ angle: 0, speed: 0, bend: 0, bendSpeed: 0, frame: 0, time: 0, drag: null });

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  function paint() {
    const { angle, bend } = motion.current;
    pivot.current.style.rotate = `${angle}rad`;
    cord.current.setAttribute("d", `M 50 0 C ${50 + bend} 27, ${50 + bend} 72, 50 100`);
  }

  function swing() {
    const state = motion.current;
    if (state.frame || state.drag) return;
    state.time = performance.now();
    function step(now) {
      const dt = Math.min((now - state.time) / 1000, 0.025);
      const length = Math.max(pivot.current.offsetHeight / 100, 0.35);
      state.time = now;
      const acceleration = -9.81 / length * Math.sin(state.angle) - 2.8 * state.speed;
      state.speed += acceleration * dt;
      state.angle += state.speed * dt;
      // The cord bows against the ornament's acceleration and springs back under tension.
      state.bendSpeed += (-180 * state.bend - 9 * state.bendSpeed + 55 * acceleration) * dt;
      state.bend += state.bendSpeed * dt;
      if (Math.abs(state.angle) < 0.002 && Math.abs(state.speed) < 0.015 &&
          Math.abs(state.bend) < 0.1 && Math.abs(state.bendSpeed) < 0.3) {
        state.angle = state.speed = state.bend = state.bendSpeed = state.frame = 0;
      } else {
        state.frame = requestAnimationFrame(step);
      }
      paint();
    }
    state.frame = requestAnimationFrame(step);
  }

  function nudge(event) {
    if (event.pointerType !== "mouse" || motion.current.drag || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const direction = Math.sign(event.movementX) || (event.clientX < bounds.left + bounds.width / 2 ? 1 : -1);
    motion.current.speed = clamp(motion.current.speed - direction * 1.9, 4);
    swing();
  }

  function grab(event) {
    if (!event.isPrimary || event.button !== 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const state = motion.current;
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.speed = 0;
    state.bendSpeed = 0;
    state.drag = { pointer: event.pointerId, startX: event.clientX, angle: state.angle, time: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const state = motion.current;
    if (state.drag?.pointer !== event.pointerId) return;
    const nextAngle = clamp(state.drag.angle - (event.clientX - state.drag.startX) / pivot.current.offsetHeight, maxAngle);
    state.speed = clamp((nextAngle - state.angle) / Math.max((event.timeStamp - state.drag.time) / 1000, 0.016), 4);
    state.drag.time = event.timeStamp;
    state.angle = nextAngle;
    state.bend = clamp(state.speed * 5 + nextAngle * 8, 26);
    paint();
  }

  function release(event) {
    const state = motion.current;
    if (state.drag?.pointer !== event.pointerId) return;
    if (event.type !== "pointerup" || event.timeStamp - state.drag.time > 90) state.speed = 0;
    if (event.pointerType !== "mouse" && state.angle === 0 && state.speed === 0 && event.type === "pointerup") state.speed = 1.3;
    state.drag = null;
    swing();
  }

  return (
    <div ref={pivot} className={styles.ornament}>
      <svg className={styles.ornamentCord} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path ref={cord} d="M 50 0 C 50 27, 50 72, 50 100" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={styles.ornamentBall} onPointerEnter={nudge} onPointerDown={grab} onPointerMove={move}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} />
    </div>
  );
}

export function HangingOrnaments() {
  return <div className={styles.ornaments} aria-hidden="true"><Ornament /><Ornament /><Ornament /><Ornament /></div>;
}
