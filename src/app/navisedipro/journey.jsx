"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { BethlehemCamera } from "./bethlehem-camera";
import styles from "./campaign.module.css";

const points = [0, 0.24, 0.52, 0.76, 1];

export function Journey({ children }) {
  const journey = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journey, offset: ["start start", "end end"] });
  const hitoX = useTransform(scrollYProgress, points, ["0%", "23%", "-10%", "35%", "-14%"]);
  const hitoScale = useTransform(scrollYProgress, points, [1, .83, .95, .7, .66]);

  const hitoOpacity = useTransform(scrollYProgress, [0, .1, .27], [1, 1, 0]);

  return (
    <div ref={journey} className={styles.journey}>
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.landscape}>
          <Image src="/navisedipro/belen-panorama.webp" alt="" fill sizes="100vw" preload />
        </div>
        {reduced === false && <BethlehemCamera progress={scrollYProgress} />}
        <div className={styles.atmosphere} />
        <motion.div className={styles.guide} style={reduced ? undefined : { x: hitoX, scale: hitoScale, opacity: hitoOpacity }}>
          <Image src="/navisedipro/buho-pastor.webp" alt="" width={1221} height={1292} sizes="(max-width: 720px) 42vw, 32vw" />
        </motion.div>
      </div>
      <div className={styles.chapters}>{children}</div>
    </div>
  );
}
