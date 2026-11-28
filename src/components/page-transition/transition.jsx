"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isInternalCampaignNavigation, loadingPath, navigationDestination, nextPaint, pause, waitForView } from "./readiness.mjs";
import { TOP_TEAR, BOTTOM_TEAR, TEAR_EDGE } from "./tear-geometry.mjs";
import styles from "./transition.module.css";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const LOADING_MESSAGE = "Espera un momento, estamos preparando todo para ti.";
const LOGO_REVEAL_MS = 1580;
const BOOT_LOGO_FADE_MS = 180;
const usesBootLogo = path => path === "/" || path === "/navisedipro";

export function PageTransition({ children, logo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState(() => {
    const destination = loadingPath(pathname);
    if (!destination) return "idle";
    return destination.startsWith("/eventos/") ? "loading" : "boot";
  });
  const [controlled, setControlled] = useState(false);
  const screen = useRef(null);
  const content = useRef(null), phaseRef = useRef(phase), active = useRef(null), pending = useRef(null);
  const openTimer = useRef(null), navigationTimer = useRef(null), moveFocus = useRef(false);
  const loadingStarted = useRef(null);
  const previousPath = useRef(null);
  const changePhase = useCallback(next => {
    if (next === "loading" && (phaseRef.current !== next || loadingStarted.current === null)) {
      loadingStarted.current = performance.now();
    }
    phaseRef.current = next;
    setPhase(next);
  }, []);
  const finish = useCallback(() => {
    if (phaseRef.current !== "opening") return;
    clearTimeout(openTimer.current);
    changePhase("idle");
    if (moveFocus.current) {
      moveFocus.current = false;
      requestAnimationFrame(() => {
        const heading = content.current?.querySelector("h1");
        if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
      });
    }
  }, [changePhase]);
  const open = useCallback(() => {
    changePhase("opening");
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(finish, reducedMotion() ? 180 : 950);
  }, [changePhase, finish]);
  const prepare = useCallback(async (controller, maximumWait = 10000, animateLogo = false) => {
    try {
      await waitForView(content.current, () => {}, controller.signal, maximumWait);
    } catch {
      // A readiness failure must still release the curtain.
    }
    if (controller.signal.aborted) return;
    // Let the prepared view paint before the paper parts.
    await nextPaint(controller.signal);
    await nextPaint(controller.signal);
    if (controller.signal.aborted) return;
    if (phaseRef.current === "boot") {
      if (reducedMotion()) {
        open();
        return;
      }
      changePhase("boot-fade");
      await nextPaint(controller.signal);
      if (!await pause(BOOT_LOGO_FADE_MS, controller.signal)) return;
      changePhase("loading");
      // Let the tracing layer commit and paint before measuring its clock.
      await nextPaint(controller.signal);
      await nextPaint(controller.signal);
      if (controller.signal.aborted) return;
    }
    if (animateLogo && !reducedMotion() && loadingStarted.current !== null) {
      // Navigation may have started the animation before the new route arrived.
      const trace = screen.current?.querySelector(`.${styles.traceLayer} path[pathLength]`)?.getAnimations?.()[0];
      const timelineTime = trace?.timeline?.currentTime;
      const elapsed = typeof timelineTime === "number" && typeof trace.startTime === "number"
        ? timelineTime - trace.startTime
        : performance.now() - loadingStarted.current;
      const remaining = LOGO_REVEAL_MS - elapsed;
      if (remaining > 0 && !await pause(remaining, controller.signal)) return;
    }
    if (!controller.signal.aborted) open();
  }, [changePhase, open]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setControlled(true);
      const destination = loadingPath(pathname);
      const internalCampaign = isInternalCampaignNavigation(previousPath.current, pathname);
      previousPath.current = pathname;
      if (!destination || internalCampaign) {
        active.current?.abort(); pending.current = null;
        clearTimeout(navigationTimer.current); clearTimeout(openTimer.current);
        changePhase("idle");
        return;
      }
      const arriving = pending.current?.path === destination ? pending.current : null;
      if (!arriving) active.current?.abort();
      const controller = arriving?.controller ?? new AbortController();
      active.current = controller; pending.current = null;
      clearTimeout(navigationTimer.current); clearTimeout(openTimer.current);
      if (usesBootLogo(destination) && phaseRef.current !== "boot") {
        changePhase("boot");
      } else if (phaseRef.current !== "boot") {
        changePhase("loading");
      }
      const eventPage = destination.startsWith("/eventos/");
      void prepare(controller, eventPage ? 20000 : 10000, !eventPage);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, prepare, changePhase]);

  useEffect(() => {
    if (!pathname.startsWith("/eventos/")) return;
    const root = content.current;
    const observer = new MutationObserver(() => {
      if (phaseRef.current !== "idle" || !root.querySelector('[data-page-ready="false"]')) return;
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      changePhase("loading");
      void prepare(controller, 20000);
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-page-ready"] });
    return () => observer.disconnect();
  }, [pathname, prepare, changePhase]);

  useEffect(() => {
    const click = async event => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const destination = navigationDestination(anchor, event, window.location);
      if (!destination) return;
      event.preventDefault();
      if (phaseRef.current !== "idle") return;
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const navigation = { path: loadingPath(destination.pathname), controller, kind: "push" };
      pending.current = navigation; moveFocus.current = true;
      changePhase("closing");
      try { router.prefetch(destination.pathname + destination.search); } catch { /* Navigation can proceed without prefetch. */ }
      if (!await pause(reducedMotion() ? 0 : 340, controller.signal)) return;
      changePhase(usesBootLogo(navigation.path) ? "boot" : "loading");
      // A route/server failure must never leave an opaque, unusable screen.
      navigationTimer.current = setTimeout(() => {
        if (pending.current !== navigation) return;
        pending.current = null; controller.abort(); open();
      }, 15000);
      try {
        router.push(destination.pathname + destination.search + destination.hash);
      } catch {
        clearTimeout(navigationTimer.current); pending.current = null; controller.abort(); open();
      }
    };
    const pop = () => {
      const destination = loadingPath(window.location.pathname);
      if (!destination || destination === loadingPath(pathname)) return;
      if (isInternalCampaignNavigation(pathname, window.location.pathname)) return;
      active.current?.abort(); clearTimeout(openTimer.current);
      const controller = new AbortController(); active.current = controller;
      const navigation = { path: destination, controller, kind: "pop" };
      pending.current = navigation;
      clearTimeout(navigationTimer.current);
      navigationTimer.current = setTimeout(() => {
        if (pending.current !== navigation) return;
        pending.current = null; controller.abort(); open();
      }, 15000);
      moveFocus.current = true;
      changePhase(usesBootLogo(destination) ? "boot" : "loading");
    };
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop);
    return () => { document.removeEventListener("click", click, true); window.removeEventListener("popstate", pop); };
  }, [router, pathname, changePhase, open]);

  useEffect(() => () => {
    active.current?.abort(); clearTimeout(openTimer.current); clearTimeout(navigationTimer.current);
  }, []);

  const busy = phase !== "idle";
  const destination = loadingPath(pathname);
  const drawLogo = Boolean(destination && !destination.startsWith("/eventos/"));
  useEffect(() => {
    if (!busy) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = previousOverflow; };
  }, [busy]);
  return <>
    <div ref={screen} className={styles.screen} data-public-loader data-phase={phase} data-controlled={controlled || undefined} data-draw-logo={drawLogo || undefined} aria-hidden={!busy}>
      {(phase === "boot" || phase === "boot-fade" || (drawLogo && phase === "loading")) && (
        <div className={styles.traceLayer} aria-hidden="true">
          <div className={styles.logo}>{logo}</div>
          <p className={styles.message}>{LOADING_MESSAGE}</p>
        </div>
      )}
      <div className={`${styles.sheet} ${styles.upper}`} style={{ clipPath: TOP_TEAR }} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === "transform") finish(); }} aria-hidden="true">
        <div className={styles.logo}>{logo}</div><svg className={styles.edge} viewBox="0 0 100 100" preserveAspectRatio="none"><path d={TEAR_EDGE} /></svg>
      </div>
      <div className={`${styles.sheet} ${styles.lower}`} style={{ clipPath: BOTTOM_TEAR }} aria-hidden="true">
        <div className={styles.logo}>{logo}</div><svg className={styles.edge} viewBox="0 0 100 100" preserveAspectRatio="none"><path d={TEAR_EDGE} /></svg>
        <p className={styles.message}>{LOADING_MESSAGE}</p>
      </div>
    </div>
    <span className={styles.srOnly} role="status" aria-live="polite">{busy ? LOADING_MESSAGE : ""}</span>
    <noscript><style>{"[data-public-loader]{display:none!important}"}</style></noscript>
    <div ref={content} className={styles.content} data-route-content inert={controlled && busy ? true : undefined} aria-busy={controlled && busy || undefined}>{children}</div>
  </>;
}
