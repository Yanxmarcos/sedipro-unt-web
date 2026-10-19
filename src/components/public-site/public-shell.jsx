"use client";

import { useEffect, useState } from "react";
import { Manrope, Instrument_Serif, Inter_Tight } from "next/font/google";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/motion";
import { PUBLIC_SHADERS_ENABLED } from "@/lib/public-effects";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { PublicNavigation } from "./navigation";
import styles from "./public-site.module.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-public-sans", display: "swap" });
const editorial = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-public-serif", display: "swap" });
const storyType = Inter_Tight({ subsets: ["latin"], variable: "--font-story-sans", display: "swap" });
const LiquidEther = dynamic(() => import("@/components/shaders/LiquidEther"), { ssr: false });
const HitoPet = dynamic(() => import("@/components/mascot/hito-pet").then((module) => module.HitoPet), { ssr: false });

export function PublicShell({ pathname, children }) {
  const reduced = useReducedMotion();
  const showShader = PUBLIC_SHADERS_ENABLED && pathname !== "/" && pathname !== "/proyectos";
  const [capable, setCapable] = useState(false);
  useEffect(() => {
    const check = () => setCapable(window.innerWidth >= 768 && !("ontouchstart" in window) && navigator.maxTouchPoints === 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className={`${styles.shell} ${manrope.variable} ${editorial.variable} ${storyType.variable}`} data-public-site data-home-cover={pathname === "/" || undefined} data-solid-projects={pathname === "/proyectos" || undefined}>
      <div className={styles.backdrop} aria-hidden="true">
        {showShader && !reduced && <PageBackdrop />}
        {showShader && !reduced && capable && <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B497CF"]}
          mouseForce={20} cursorSize={100} isViscous viscous={10}
          iterationsViscous={32} iterationsPoisson={32} resolution={0.5}
          isBounce={false} autoDemo autoSpeed={0.5} autoIntensity={2.2}
          takeoverDuration={0.25} autoResumeDelay={3000} autoRampDuration={0.6}
          color0="#5227FF" color1="#FF9FFC" color2="#B497CF"
        />}
        {showShader && <div className={styles.smokeScrim} />}
      </div>
      <PublicNavigation />
      <div className={styles.page} key={`page-${pathname}`}>{children}</div>
      <HitoPet key={`hito-${pathname}`} pathname={pathname} greetOnMount={false} />
    </div>
  );
}
