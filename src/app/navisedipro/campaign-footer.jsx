"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa";
import styles from "./campaign-footer.module.css";
import campaignStyles from "./campaign.module.css";

const messages = [
  "La magia de compartir",
  "Regalemos sonrisas esta Navidad",
  "Pequeños gestos, grandes alegrías",
  "Un juguete para soñar",
  "Una chocolatada para compartir",
  "Hagamos brillar su Navidad",
];
const socials = [
  [FaFacebookF, "Facebook", "https://www.facebook.com/SediproUNT"],
  [FaInstagram, "Instagram", "https://www.instagram.com/sedipro.unt/"],
  [FaTiktok, "TikTok", "https://www.tiktok.com/@sediprount"],
  [FaLinkedinIn, "LinkedIn", "https://www.linkedin.com/company/sediprount/"],
  [FaYoutube, "YouTube", "https://www.youtube.com/c/SEDIPROUNT"],
];
const curve = "M-900 440 C-300 20 100 720 700 400 S1400 10 2100 380 S2900 650 3500 220";
const blank = "\u00a0".repeat(6);
const repetitions = 14;
const ribbonSpeed = 42;

function CurvedTicker({ phrases, path = curve, band = "var(--paper)", ink = "var(--pine)", scene }) {
  const id = useId();
  const track = useRef(null);
  const lettering = useRef(null);
  const badges = useRef(null);
  const slots = [];
  let cycle = "";
  for (const phrase of phrases) {
    const start = cycle.length + phrase.length;
    slots.push(start);
    cycle += phrase + blank;
  }
  const slotIndices = slots.join(",");
  const cycleLength = cycle.length;

  useEffect(() => {
    let offset = 0;
    const line = track.current;
    const text = lettering.current;
    const markers = Array.from(badges.current.children);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const total = line.getTotalLength();
    let period = 0;
    let centers = [];
    let visible = false;
    let previousTime = 0;
    let frame = 0;
    let disposed = false;

    function draw() {
      if (!period) return;
      const start = -period - offset;
      text.setAttribute("startOffset", String(start));
      markers.forEach((marker, index) => {
        const at = start + Math.floor(index / centers.length) * period + centers[index % centers.length];
        const onPath = at >= 0 && at <= total;
        if (!onPath) {
          marker.setAttribute("visibility", "hidden");
          return;
        }
        const point = line.getPointAtLength(at);
        const before = line.getPointAtLength(Math.max(0, at - 8));
        const after = line.getPointAtLength(Math.min(total, at + 8));
        const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
        marker.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
        marker.setAttribute("visibility", "visible");
      });
    }

    function tick(now) {
      frame = 0;
      if (!visible || document.hidden || preference.matches) return;
      const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.1) : 0;
      previousTime = now;
      if (period) {
        offset = (offset + ribbonSpeed * dt) % period;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (visible && !document.hidden && !preference.matches) frame = requestAnimationFrame(tick);
    }

    const footer = scene.current;
    const artwork = Array.from(footer.querySelectorAll("img"));
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    });
    observer.observe(footer);
    const ready = artwork.map((img) => img.decode().catch(() => {}));
    Promise.all([document.fonts.ready, ...ready]).then(() => {
      if (disposed) return;
      period = text.getSubStringLength(0, cycleLength);
      centers = slotIndices.split(",").map(Number).map((index) =>
        text.getSubStringLength(0, index) + text.getSubStringLength(index, blank.length) / 2
      );
      draw();
    });
    document.addEventListener("visibilitychange", refresh);
    preference.addEventListener("change", refresh);
    refresh();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", refresh);
      preference.removeEventListener("change", refresh);
    };
  }, [cycleLength, slotIndices, path, scene]);

  return (
    <>
      <svg className={styles.ribbon} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><path id={id} ref={track} d={path} /></defs>
        <use href={`#${id}`} fill="none" stroke={band} strokeWidth="155" />
        <text fill={ink} dy="33" xmlSpace="preserve">
          <textPath href={`#${id}`} ref={lettering}>{cycle.repeat(repetitions)}</textPath>
        </text>
        <g ref={badges}>
          {Array.from({ length: slots.length * repetitions }, (_, index) => (
            <g key={index} visibility="hidden">
              <image href="/navisedipro/adorno-regalo.webp" x="-46" y="-46" width="92" height="92" />
            </g>
          ))}
        </g>
      </svg>
      <p className={styles.visuallyHidden}>{phrases.join(". ")}.</p>
    </>
  );
}

export default function CampaignFooter() {
  const scene = useRef(null);
  return (
    <>
      <div className={styles.footerDivider}>
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M0 140H940C1050 140 1080 40 1180 40S1310 140 1420 140H1440V144H0Z" />
        </svg>
        <a href="#navisedipro-inicio">
          Volver arriba
          <ArrowUp size={34} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>
      <footer ref={scene} className={styles.footer} aria-label="NAVISEDIPRO">
        <Link className={styles.logo} href="/navisedipro">
          <Image src="/navisedipro/logo-marketing-full-hd.png" alt="NAVISEDIPRO" width={1920} height={1080} sizes="(max-width: 760px) 48vw, 26vw" />
        </Link>
        <Image className={styles.house} src="/navisedipro/pesebre-footer.webp" alt="" width={1400} height={891} sizes="(max-width: 760px) 47vw, 43vw" />
        <CurvedTicker phrases={messages} scene={scene} />
        <div className={styles.footerBrand}>
          <Link href="/" aria-label="Inicio de SEDIPRO UNT">
            <Image className={campaignStyles.sediproLogo} src="/logos/sedi-logo.svg" alt="SEDIPRO UNT" width={122} height={44} />
          </Link>
          <nav className={styles.socials} aria-label="Redes sociales de SEDIPRO UNT">
            {socials.map(([Icon, label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
