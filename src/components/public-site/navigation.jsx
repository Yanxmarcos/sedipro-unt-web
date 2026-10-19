"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { useReducedMotion } from "@/lib/motion";
import { EMAIL, SOCIALS } from "./content";
import { CopyEmail } from "./copy-email";
import connectionStyles from "./hero-connections.module.css";
import styles from "./public-site.module.css";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Acceso sediprano", href: "/login" },
];

const socialIcons = {
  Instagram: { Icon: FaInstagram, color: "#e4405f" },
  LinkedIn: { Icon: FaLinkedin, color: "#0a66c2" },
  Facebook: { Icon: FaFacebook, color: "#1877f2" },
  YouTube: { Icon: FaYoutube, color: "#ff0033" },
  TikTok: { Icon: FaTiktok, color: "#25f4ee" },
};

function menuSweep(progress) {
  const closing = progress > 1;
  const travel = closing ? progress - 1 : progress;
  const x = 1.2 - 1.4 * travel;
  const bend = Math.sin(Math.PI * travel) * .22;
  const edge = `M${x} 0 C${x - bend} .18 ${x + bend} .32 ${x} .5 C${x - bend} .68 ${x + bend} .82 ${x} 1`;
  return `${edge} L${closing ? -.3 : 1.3} 1 L${closing ? -.3 : 1.3} 0 Z`;
}

const ribbonGeometry = new WeakMap();
let strokeHitContext;

function isPaintedStroke(path, point) {
  if (getComputedStyle(path).opacity === "0") return false;
  const drawn = Number.parseFloat(path.getAttribute("stroke-dasharray") ?? "1");
  if (drawn >= 1) return path.isPointInStroke(point);
  if (drawn <= 0) return false;
  // SVG geometry hit tests may include the as-yet-undrawn continuation.
  // Canvas uses the same curve and actual dash length without rendering it.
  strokeHitContext ??= document.createElement("canvas").getContext("2d");
  if (!strokeHitContext) return path.isPointInStroke(point);
  let geometry = ribbonGeometry.get(path);
  if (!geometry) {
    geometry = { curve: new Path2D(path.getAttribute("d")), length: path.getTotalLength() };
    ribbonGeometry.set(path, geometry);
  }
  strokeHitContext.lineWidth = Number.parseFloat(getComputedStyle(path).strokeWidth);
  strokeHitContext.lineCap = "round";
  strokeHitContext.lineJoin = "round";
  strokeHitContext.setLineDash([drawn * geometry.length, geometry.length]);
  return strokeHitContext.isPointInStroke(geometry.curve, point.x, point.y);
}

// Transparent navigation needs a separate sample for each end over a curved surface.
function isOverRibbon(surface, element, y) {
  const bounds = element.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const overPanel = [...surface.querySelectorAll('[data-nav-surface="paper"]')].some(panel => {
    const rect = panel.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
  if (overPanel) return false;
  return [...surface.querySelectorAll('[data-nav-ribbon]')].some(svg => {
    if (getComputedStyle(svg).display === "none") return false;
    const matrix = svg.getScreenCTM();
    if (!matrix) return false;
    const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    return [...svg.querySelectorAll("path")].some(path => isPaintedStroke(path, point));
  });
}

export function PublicNavigation() {
  const pathname = usePathname();
  const [phase, setPhase] = useState("closed");
  const open = phase !== "closed";
  const reduced = useReducedMotion();
  const clipId = `menu-sweep-${useId().replace(/:/g, "")}`;
  const sweep = useMotionValue(1);
  const sweepPath = useTransform(sweep, menuSweep);
  const queuedClose = useRef(false);
  const requestClose = () => {
    if (phase === "opening") queuedClose.current = true;
    else if (phase === "open") setPhase("closing");
  };
  const dialog = useRef(null);
  const trigger = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    const bar = header.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const cover = document.getElementById("cover-heading")?.closest("section");
      const image = cover?.querySelector("[data-cover-artwork]")?.getBoundingClientRect();
      const sampleY = bar.getBoundingClientRect().height / 2;
      const onCover = image && image.top <= sampleY && image.bottom > sampleY;
      const onContact = image && image.bottom <= sampleY && cover.getBoundingClientRect().bottom > sampleY;
      const onPaperSection = [...document.querySelectorAll('[data-nav-surface="paper"]')].some(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= sampleY && bounds.bottom > sampleY;
      });
      bar.dataset.onPaper = String(Boolean(onPaperSection || onContact || (onCover && window.innerWidth < 768)));
      const mixed = [...document.querySelectorAll('[data-nav-surface="mixed"]')].find(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= sampleY && bounds.bottom > sampleY;
      });
      const brand = bar.querySelector("img");
      const brandControl = brand.closest("a");
      let brandOnLight = bar.dataset.onPaper === "true";
      let menuOnLight = brandOnLight;
      if (mixed) {
        brandOnLight = !isOverRibbon(mixed, brand, sampleY);
        menuOnLight = !isOverRibbon(mixed, trigger.current, sampleY);
      } else if ([...document.querySelectorAll('[data-nav-surface="ink"]')].some(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= sampleY && bounds.bottom > sampleY;
      })) {
        brandOnLight = false;
        menuOnLight = false;
      }
      // A photograph may cover only the edge of a control. Protect its full
      // area rather than choosing a foreground from one sample on the image.
      const mediaBounds = [...document.querySelectorAll("[data-nav-media]")].map(media => media.getBoundingClientRect());
      const touchesMedia = control => {
        const rect = control.getBoundingClientRect();
        return mediaBounds.some(media => media.left < rect.right && media.right > rect.left && media.top < rect.bottom && media.bottom > rect.top);
      };
      const brandOnMedia = touchesMedia(brandControl);
      const menuOnMedia = touchesMedia(trigger.current);
      brandControl.dataset.overMedia = String(brandOnMedia);
      trigger.current.dataset.overMedia = String(menuOnMedia);
      brandControl.dataset.tone = brandOnLight || brandOnMedia ? "light" : "dark";
      trigger.current.dataset.tone = menuOnLight || menuOnMedia ? "light" : "dark";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const menu = dialog.current;
    const opener = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.showModal();
    return () => {
      menu.close();
      document.body.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const closing = phase === "closing";
    sweep.set(closing ? 1.00001 : 0);
    const animation = animate(sweep, closing ? 2 : 1, {
      duration: reduced ? 0 : closing ? .9 : 1.1,
      ease: [.65, 0, .25, 1],
      onComplete: () => {
        if (closing) setPhase("closed");
        else {
          setPhase(queuedClose.current ? "closing" : "open");
          queuedClose.current = false;
        }
      },
    });
    return () => animation.stop();
  }, [phase, reduced, sweep]);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>Saltar al contenido</a>
      <header ref={header} className={styles.header}>
        <Link href="/" aria-label="SEDIPRO UNT, inicio" className={styles.brand}>
          <Image src="/logos/sedi-logo.svg" alt="SEDIPRO UNT" width={1563} height={555} priority />
        </Link>
        <div className={styles.headerActions}>
          <button ref={trigger} type="button" aria-expanded={open} aria-controls="public-menu" onClick={() => { queuedClose.current = false; setPhase("opening"); }} className={styles.menuTrigger}>
            Menú <span className={styles.menuBars} aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </header>
      <dialog ref={dialog} id="public-menu" className={styles.menu} aria-label="Menú principal" onCancel={event => { event.preventDefault(); requestClose(); }} onClose={() => setPhase("closed")} style={{ clipPath: reduced ? undefined : `url(#${clipId})` }} data-phase={phase} data-lenis-prevent>
        <svg width="0" height="0" aria-hidden="true" focusable="false" className={styles.menuClip}><defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><motion.path d={sweepPath} /></clipPath></defs></svg>
        <div className={styles.menuTop}>
          <Image src="/logo_blanco.png" alt="SEDIPRO UNT" width={156} height={55} />
          <button type="button" autoFocus onClick={requestClose} className={styles.menuTrigger}>Cerrar <X size={24} aria-hidden="true" /></button>
        </div>
        <nav aria-label="Principal" className={styles.menuLinks}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={requestClose}>
              <span>{link.label}</span><ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className={styles.menuBottom}>
          <div className={styles.menuEmail}><CopyEmail /><a href={`mailto:${EMAIL}`}>{EMAIL} <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          <nav className={styles.menuSocials} aria-label="Redes sociales en el menú">{SOCIALS.map(social => {
            const { Icon, color } = socialIcons[social.label];
            return <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"><Icon className={`${connectionStyles.brandIcon} ${social.label === "TikTok" ? connectionStyles.tiktok : ""}`} style={{ color }} aria-hidden="true" />{social.label}<ArrowUpRight size={14} aria-hidden="true" /></a>;
          })}</nav>
        </div>
      </dialog>
    </>
  );
}
