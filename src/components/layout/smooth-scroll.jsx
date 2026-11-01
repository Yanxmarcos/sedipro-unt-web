// src/components/layout/smooth-scroll.jsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { isLandingPath } from "@/lib/landing-paths";
import { useReducedMotion } from "@/lib/motion";

const SmoothScrollPageContext = createContext(null);

// Error pages are selected by Next.js at runtime, not by their visible URL.
export function useSmoothScrollPage() {
  const register = useContext(SmoothScrollPageContext);
  useEffect(() => register?.(), [register]);
}

export function SmoothScroll({ children }) {
  const pathname = usePathname();
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [registeredPages, setRegisteredPages] = useState(0);
  const registerPage = useCallback(() => {
    setRegisteredPages((count) => count + 1);
    return () => setRegisteredPages((count) => count - 1);
  }, []);

  // Reutilizar el desplazamiento público en landing e inscripciones por evento.
  const isLanding =
    (isLandingPath(pathname) || /^\/eventos\/[^/]+\/?$/.test(pathname)) &&
    pathname !== "/tecnologias-de-la-informacion";
  const enabled = isLanding || registeredPages > 0;

  useEffect(() => {
    // Activar solo en rutas públicas habilitadas o páginas que lo soliciten.
    if (!enabled) {
      // Limpiar cualquier resto de Lenis
      if (lenisRef.current) {
        // Reset pending motion before destroy; delayed scroll callbacks must not
        // restore Lenis classes after this page has released smooth scrolling.
        lenisRef.current.stop();
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Limpiar clases del HTML
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      document.documentElement.style.removeProperty("height");
      document.documentElement.style.removeProperty("scroll-behavior");
      document.body.style.overflow = "";
      document.body.style.height = "";
      return;
    }

    // Reutilizar la misma configuración de la landing, respetando accesibilidad.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || reducedMotion) return;

    // Destruir instancia anterior si existe
    if (lenisRef.current) {
      lenisRef.current.stop();
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    const lenis = new Lenis({
      // The html box is fixed to h-full. Observe the body's growing content
      // so async event forms update the scroll limit without a window resize.
      content: document.body,
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // Manejar clicks en anclas
    function handleAnchorClick(e) {
      if (!(e.target instanceof Element) || e.defaultPrevented) return;
      const target = e.target;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const element = document.querySelector(href);
      if (!element) return;

      e.preventDefault();
      lenis.scrollTo(element, { offset: -100 });
    }

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (lenisRef.current) {
        lenisRef.current.stop();
        lenisRef.current.destroy();
        lenisRef.current = null;
      }

      // Limpiar clases y estilos
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      document.documentElement.style.removeProperty("height");
      document.documentElement.style.removeProperty("scroll-behavior");
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [enabled, pathname, reducedMotion]);

  return (
    <SmoothScrollPageContext.Provider value={registerPage}>
      {children}
    </SmoothScrollPageContext.Provider>
  );
}
