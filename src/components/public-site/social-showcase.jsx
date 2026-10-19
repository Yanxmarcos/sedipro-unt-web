"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight, BatteryFull, Signal, Wifi } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { useReducedMotion } from "@/lib/motion";
import { SOCIALS } from "./content";
import styles from "./social-showcase.module.css";

const NETWORKS = [
  { name: "Facebook", Icon: FaFacebookF, color: "#1877f2", capture: "facebook", height: 1927, surface: "#ffffff", dark: false },
  { name: "Instagram", Icon: FaInstagram, color: "#e4405f", capture: "instagram", height: 2800, surface: "#0b1014", dark: true },
  { name: "LinkedIn", Icon: FaLinkedinIn, color: "#0a66c2", capture: "linkedin", height: 1833, surface: "#1b2024", dark: true },
  { name: "TikTok", Icon: FaTiktok, color: "#000000", capture: "tiktok", height: 1704, surface: "#ffffff", dark: false },
  { name: "YouTube", Icon: FaYoutube, color: "#ff0033", capture: "youtube", height: 1967, surface: "#0f0f0f", dark: true },
].map(network => ({ ...network, href: SOCIALS.find(social => social.label === network.name).href }));

const CYCLE_MS = 8200;
const BODY_SLICES = Array.from({ length: 19 }, (_, index) => 1 - index / 9);
const smooth = value => value * value * (3 - 2 * value);
function scrollProgress(elapsed) {
  if (elapsed < 900) return 0;
  if (elapsed < 3900) return smooth((elapsed - 900) / 3000);
  if (elapsed < 4700) return 1;
  if (elapsed < 6900) return 1 - smooth((elapsed - 4700) / 2200);
  return 0;
}

export function SocialShowcase() {
  const section = useRef(null);
  const linksSide = useRef(null);
  const deviceSide = useRef(null);
  const handset = useRef(null);
  const visible = useInView(section, { amount: .2 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const id = useId();
  const viewport = useRef(null);
  const distance = useRef(0);
  const clock = useRef({ elapsed: 0, pose: 0 });
  const captureY = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(-15);
  const tiltZ = useMotionValue(6);
  const floatY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 85, damping: 20 });
  const rotateY = useSpring(tiltY, { stiffness: 85, damping: 20 });
  const rotateZ = useSpring(tiltZ, { stiffness: 70, damping: 22 });
  const driftY = useSpring(floatY, { stiffness: 70, damping: 22 });
  const network = NETWORKS[active];
  const running = desktop && visible && !reduced && !hovered && !focused && !hidden;
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const fitPhone = () => {
      if (!section.current || !linksSide.current || !deviceSide.current || !handset.current) return;
      const height = linksSide.current.getBoundingClientRect().height;
      const width = deviceSide.current.clientWidth;
      const phoneHeight = handset.current.offsetHeight;
      const phoneWidth = handset.current.offsetWidth;
      if (!height || !width || !phoneHeight || !phoneWidth) return;
      // Fit the complete model, keeping room for its existing tilt and drift.
      // The links determine the row height; the phone never stretches them.
      const scale = Math.min((height - 24) / (phoneHeight * 1.04), (width - 32) / (phoneWidth + phoneHeight * .12));
      section.current.style.setProperty("--social-content-height", `${height}px`);
      section.current.style.setProperty("--phone-fit-scale", `${Math.max(.1, scale)}`);
    };
    const observer = new ResizeObserver(fitPhone);
    [linksSide.current, deviceSide.current, handset.current].forEach(element => observer.observe(element));
    fitPhone();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const element = viewport.current;
    const measure = () => {
      distance.current = Math.max(0, Math.min(90, element.clientWidth * network.height / 786 - element.clientHeight));
      captureY.set(-distance.current * scrollProgress(clock.current.elapsed));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element); measure();
    return () => observer.disconnect();
  }, [network.height, captureY]);
  useEffect(() => {
    if (!running) return;
    let frame;
    let previous;
    const tick = now => {
      const delta = previous === undefined ? 0 : now - previous;
      previous = now;
      clock.current.elapsed += delta;
      clock.current.pose += delta;
      if (clock.current.elapsed >= CYCLE_MS) {
        const completed = Math.floor(clock.current.elapsed / CYCLE_MS);
        clock.current.elapsed %= CYCLE_MS;
        captureY.set(0);
        setActive(index => (index + completed) % NETWORKS.length);
      } else {
        captureY.set(-distance.current * scrollProgress(clock.current.elapsed));
      }
      const angle = clock.current.pose / 14000 * Math.PI * 2;
      tiltX.set(Math.sin(angle) * 5);
      tiltY.set(-22 * Math.cos(angle));
      tiltZ.set(1 + Math.cos(angle) * 5);
      floatY.set(Math.sin(angle) * -12);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, captureY, tiltX, tiltY, tiltZ, floatY]);
  const previewNetwork = index => {
    clock.current.elapsed = 0;
    captureY.set(0);
    setActive(index);
  };
  const followPointer = event => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)));
    tiltX.set(-y * 10);
    tiltY.set(x * 24);
    tiltZ.set(x * 3);
    floatY.set(0);
  };
  return <section ref={section} className={styles.showcase} aria-labelledby={`${id}-heading`}>
    <div className={styles.layout}>
      <div ref={linksSide} className={styles.linksSide}>
        <h2 id={`${id}-heading`}>Síguenos en<br /><span>nuestras redes.</span></h2>
        <nav className={styles.networkLinks} aria-label="Perfiles oficiales de SEDIPRO UNT">
          {NETWORKS.map(({ name, Icon, href, color }, index) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={active === index ? styles.activeLink : ""} onMouseEnter={() => { setHovered(true); previewNetwork(index); }} onMouseLeave={() => setHovered(false)} onFocus={() => { setFocused(true); previewNetwork(index); }} onBlur={() => setFocused(false)}>
            <Icon className={`${styles.networkIcon} ${name === "TikTok" ? styles.tiktok : ""}`} style={{ color }} aria-hidden="true" /><span>{name}</span><ArrowUpRight className={styles.externalArrow} size={20} aria-hidden="true" />
          </a>)}
        </nav>
      </div>
      <div ref={deviceSide} className={styles.deviceSide} onPointerMove={followPointer} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className={styles.deviceScale}>
        <motion.div className={styles.phoneFloat} style={reduced ? undefined : { rotateZ, y: driftY }}>
        <motion.div ref={handset} className={styles.phone} data-social-phone style={reduced ? { rotateX: 0, rotateY: 0 } : { rotateX, rotateY }}>
          {/* Every shell layer and the display share this single 3D transform.
              Thickness is geometry, so it disappears behind the front at zero yaw. */}
          <span className={styles.phoneShadow} aria-hidden="true" />
          {BODY_SLICES.map((depth, index) => <span key={index} className={styles.bodySlice} style={{ "--slice-depth": depth }} aria-hidden="true" />)}
          <span className={`${styles.sideKey} ${styles.powerKey}`} aria-hidden="true" />
          <span className={`${styles.sideKey} ${styles.cameraKey}`} aria-hidden="true" />
          <span className={`${styles.sideKey} ${styles.actionKey}`} aria-hidden="true" />
          <span className={`${styles.sideKey} ${styles.volumeUp}`} aria-hidden="true" />
          <span className={`${styles.sideKey} ${styles.volumeDown}`} aria-hidden="true" />
          <span className={styles.bottomPort} aria-hidden="true" />
          <div className={styles.phoneFront}>
          <div className={styles.screen} data-dark={network.dark} style={{ background: network.surface }}>
            <div className={styles.status} aria-hidden="true"><span>9:41</span><i /><span><Signal /><Wifi /><BatteryFull /></span></div>
            <div ref={viewport} className={styles.captureViewport} tabIndex={0} role="img" aria-label={`Vista del perfil público de SEDIPRO UNT en ${network.name}`}>
              <motion.div className={styles.captureContent} style={{ y: reduced ? 0 : captureY }}>
                {/* Assets contain only reviewed public excerpts; raw session screenshots never enter public/. */}
                <Image className={styles.capture} src={`/img/institutional/social/${network.capture}.webp`} alt="" width={786} height={network.height} draggable={false} unoptimized />
              </motion.div>
            </div>
            <span className={styles.homeIndicator} aria-hidden="true" />
          </div>
          </div>
        </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
    {visible && desktop && <div className={styles.assetCache} aria-hidden="true">{NETWORKS.map(item => <Image key={item.name} src={`/img/institutional/social/${item.capture}.webp`} alt="" width={786} height={item.height} unoptimized loading="eager" />)}</div>}
  </section>;
}
