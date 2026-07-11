// src/components/layout/nav.jsx
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

const NAV_ITEMS = [
    { label: "Inicio", href: "/" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Nosotros", href: "/nosotros" },
];

export function Nav() {
    const pathname = usePathname();
    const listRef = useRef(null);
    const itemRefs = useRef([]);
    const [pillRect, setPillRect] = useState(null);
    const [hasMeasured, setHasMeasured] = useState(false);

    const activeIndex = NAV_ITEMS.findIndex((item) =>
        item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
    );

    useLayoutEffect(() => {
        const list = listRef.current;
        const activeEl =
            activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
        if (!list || !activeEl) {
            setPillRect(null);
            return;
        }
        const listRect = list.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();
        setPillRect({
            x: itemRect.left - listRect.left,
            width: itemRect.width,
        });
    }, [activeIndex, pathname]);

    useEffect(() => {
        if (!pillRect) return;
        const id = requestAnimationFrame(() => setHasMeasured(true));
        return () => cancelAnimationFrame(id);
    }, [pillRect]);

    return (
        <nav
            aria-label="Primary"
            className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
        >
            {/* Filtro SVG de refracción tipo "liquid glass".
                Solo lo respetan Chrome/Edge dentro de backdrop-filter;
                el resto de navegadores lo ignora sin romper nada. */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <filter
                    id="liquid-glass-nav"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.02"
                        numOctaves="2"
                        seed="9"
                        result="noise"
                    />
                    <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="softNoise"
                        scale="22"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            <div
                className="liquid-glass-nav relative flex items-center gap-1 rounded-full p-1.5 border overflow-hidden"
                style={{
                    background: "rgba(11, 19, 38, 0.35)",
                    backdropFilter:
                        "url(#liquid-glass-nav) blur(14px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                    borderColor: "rgba(255, 255, 255, 0.18)",
                    boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.45),
                        0 1px 1px rgba(255, 255, 255, 0.4),
                        inset 0 1.5px 1px rgba(255, 255, 255, 0.5),
                        inset 0 -1.5px 2px rgba(0, 0, 0, 0.25),
                        inset 1px 0 1px rgba(255, 255, 255, 0.15),
                        inset -1px 0 1px rgba(255, 255, 255, 0.1)
                    `,
                }}
            >             

                <ul ref={listRef} className="relative z-10 flex items-center gap-1">
                    {pillRect && (
                        <motion.span
                            aria-hidden="true"
                            initial={false}
                            animate={{ x: pillRect.x, width: pillRect.width }}
                            transition={
                                hasMeasured
                                    ? { type: "spring", stiffness: 380, damping: 32 }
                                    : { duration: 0 }
                            }
                            className="absolute rounded-full"
                            style={{
                                left: 0,
                                top: 0,
                                bottom: 0,
                                background: "rgba(255, 255, 255, 0.18)",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                boxShadow: `
                                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                                    inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                                    0 2px 6px rgba(0, 0, 0, 0.25)
                                `,
                                backdropFilter: "blur(6px)",
                                WebkitBackdropFilter: "blur(6px)",
                            }}
                        />
                    )}
                    {NAV_ITEMS.map((item, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <li
                                key={item.href}
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                                className="relative"
                            >
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className="focus-ring relative inline-flex cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300"
                                >
                                    <span
                                        className={
                                            isActive
                                                ? "relative z-10"
                                                : "relative z-10 opacity-60 hover:opacity-100"
                                        }
                                        style={{
                                            color: "#f4f7ff",
                                            textShadow: isActive
                                                ? "0 1px 2px rgba(0,0,0,0.3)"
                                                : "none",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}