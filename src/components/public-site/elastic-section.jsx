"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import styles from "./public-site.module.css";

function dividerPath(bend, revealBackground = false) {
  const middle = 80 + bend;
  if (revealBackground) {
    return `M0 -4 L1000 -4 L1000 80 L860 80 C700 80 650 ${middle} 500 ${middle} C350 ${middle} 300 80 140 80 L0 80 Z`;
  }
  return `M0 80 L140 80 C300 80 350 ${middle} 500 ${middle} C650 ${middle} 700 80 860 80 L1000 80 L1000 164 L0 164 Z`;
}

export function ElasticSection({ children, surface, previous, paper = false, revealBackground = false, joined = false, pronounced = false, clearPrevious = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const visible = useInView(ref, { margin: "120px" });
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const target = useMotionValue(0);
  const bend = useSpring(target, { stiffness: 180, damping: 20, mass: 0.5 });
  const path = useTransform(bend, value => dividerPath(value, revealBackground));
  useMotionValueEvent(velocity, "change", value => {
    target.set(visible && !reduced ? -72 * Math.tanh(value / 1800) : 0);
  });

  return (
    <div ref={ref} data-nav-surface={paper ? "paper" : undefined} className={`${styles.elasticSection} ${paper ? styles.paperSection : ""} ${joined ? styles.joinedSection : ""} ${joined && revealBackground ? styles.joinedCurve : ""} ${pronounced ? styles.pronouncedCurve : ""} ${clearPrevious ? styles.clearedCurve : ""}`} style={{ "--section-surface": surface, "--previous-surface": previous }}>
      {(!joined || revealBackground) && <svg className={styles.elasticDivider} viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {pronounced && revealBackground && <rect x="0" y="0" width="1000" height="164" fill={surface} />}
        <motion.path d={reduced ? dividerPath(0, revealBackground) : path} fill={revealBackground ? previous : surface} />
      </svg>}
      <div className={styles.elasticContent}>{children}</div>
    </div>
  );
}
