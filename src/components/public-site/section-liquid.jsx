"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/motion";
import { PUBLIC_SHADERS_ENABLED } from "@/lib/public-effects";
import styles from "./home-institutional.module.css";

const LiquidEther = dynamic(() => import("@/components/shaders/LiquidEther"), { ssr: false });
const pointerQuery = "(hover: hover) and (pointer: fine)";
function subscribePointer(callback) {
  const query = window.matchMedia(pointerQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const getPointer = () => window.matchMedia(pointerQuery).matches;
const getVisibility = () => !document.hidden;
const serverPointer = () => false;
const serverVisible = () => true;
const colors = ["#662065", "#304D90", "#B497CF"];

// One viewport-sized renderer per visible scene, including its curved boundary.
export function SectionLiquid({ surface = "#29295d", story = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "200px" });
  const reduced = useReducedMotion();
  const finePointer = useSyncExternalStore(subscribePointer, getPointer, serverPointer);
  const visible = useSyncExternalStore(subscribeVisibility, getVisibility, serverVisible);
  return <div ref={ref} className={styles.liquid} style={{ "--liquid-surface": surface }} aria-hidden="true" data-section-liquid data-story-liquid={story || undefined}>
    {PUBLIC_SHADERS_ENABLED && inView && visible && finePointer && !reduced && <LiquidEther colors={colors} mouseForce={20} cursorSize={100} isViscous viscous={10} iterationsViscous={32} iterationsPoisson={32} resolution={0.5} autoDemo={false} />}
  </div>;
}
