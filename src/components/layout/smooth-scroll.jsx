// src/components/layout/smooth-scroll.jsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Rutas que deben tener smooth scroll (SOLO el landing y sus subpáginas)
const LANDING_PATHS = ['/', '/nosotros', '/proyectos'];

export function SmoothScroll({ children }) {
    const pathname = usePathname();
    const lenisRef = useRef(null);
    const rafRef = useRef(null);

    // Verificar si estamos en el landing
    const isLanding = LANDING_PATHS.includes(pathname);

    useEffect(() => {
        // Si NO estamos en landing, NO activar Lenis
        if (!isLanding) {
            // Limpiar cualquier resto de Lenis
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            // Limpiar clases del HTML
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            document.documentElement.style.removeProperty('height');
            document.documentElement.style.removeProperty('scroll-behavior');
            document.body.style.overflow = '';
            document.body.style.height = '';
            return;
        }

        // Estamos en landing, activar Lenis
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        // Destruir instancia anterior si existe
        if (lenisRef.current) {
            lenisRef.current.destroy();
            lenisRef.current = null;
        }

        const lenis = new Lenis({
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
                lenisRef.current.destroy();
                lenisRef.current = null;
            }

            // Limpiar clases y estilos
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            document.documentElement.style.removeProperty('height');
            document.documentElement.style.removeProperty('scroll-behavior');
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, [isLanding, pathname]);

    // Si NO estamos en landing, renderizar sin wrapper
    if (!isLanding) {
        return <>{children}</>;
    }

    return <>{children}</>;
}