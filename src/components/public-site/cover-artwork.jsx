"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import Image from "next/image";
import styles from "./public-site.module.css";

const cover = "/img/institutional/portada-hd.png";
// Match the full image width used by the height-driven crop, especially on phones.
const coverSizes = "(max-width: 767px) max(100vw, calc(clamp(350px, 66svh, 560px) * 1.807074)), max(100vw, calc(clamp(420px, calc(100svh - 165px), 820px) * 1.807074))";
function coverLoader({ width }) {
  const size = width <= 1280 ? 1280 : width <= 2048 ? 2048 : 3372;
  return `/img/institutional/portada-hd-${size}.webp`;
}

export function CoverArtwork() {
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const artwork = useRef(null);
  const inView = useInView(artwork);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return (
    <div ref={artwork} className={styles.coverArtwork} data-cover-artwork data-cover-ready={ready || undefined} data-cover-active={inView && pageVisible || undefined}>
      <div className={styles.coverScene}>
        <Image loader={coverLoader} src={cover} alt="SEDIPRO UNT, Proyectando Vidas. Portada institucional con fotografías del equipo y papel rasgado." width={3372} height={1866} sizes={coverSizes} priority className={styles.coverImage} onLoad={() => setReady(true)} />
        <div className={`${styles.coverCurtain} ${styles.coverLeft}`} aria-hidden="true"><Image loader={coverLoader} src={cover} alt="" fill sizes={coverSizes} /></div>
        <div className={`${styles.coverCurtain} ${styles.coverRight}`} aria-hidden="true"><Image loader={coverLoader} src={cover} alt="" fill sizes={coverSizes} /></div>
      </div>
    </div>
  );
}
