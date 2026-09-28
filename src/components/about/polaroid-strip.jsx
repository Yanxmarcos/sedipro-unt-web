// src/components/about/polaroid-strip.jsx
"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";

import { DottedPattern } from "@/components/ui/dotted-pattern";

const PHOTOS = [
    { id: "A", rotate: -8, src: "/img/hito2.webp", alt: "Evento SEDIPRO 1" },
    { id: "B", rotate: 6, src: "/img/hito3.webp", alt: "Evento SEDIPRO 2" },
    { id: "C", rotate: -4, src: "/img/hito4.webp", alt: "Evento SEDIPRO 3" },
    { id: "D", rotate: 7, src: "/img/hito5.webp", alt: "Evento SEDIPRO 4" },
    { id: "E", rotate: -6, src: "/img/hito6.webp", alt: "Evento SEDIPRO 5" },
    { id: "F", rotate: 5, src: "/img/hito1.webp", alt: "Evento SEDIPRO 6" },
];

const EASE = [0.22, 1, 0.36, 1];

function PolaroidCard({ photo, index }) {
    const ref = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });
    const tx = useTransform(sx, (v) => `${v}px`);
    const ty = useTransform(sy, (v) => `${v}px`);

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const max = 18;
        const k = 0.25;
        mx.set(Math.max(-max, Math.min(max, dx * k)));
        my.set(Math.max(-max, Math.min(max, dy * k)));
    };

    const handleLeave = () => {
        mx.set(0);
        my.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            initial={{ opacity: 0, y: -120, filter: "blur(18px)", rotate: photo.rotate }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: photo.rotate }}
            transition={{
                duration: 0.9,
                delay: 0.05 + index * 0.08,
                ease: EASE,
            }}
            className="relative aspect-[3/4] w-[clamp(6rem,11vw,9rem)] shrink-0 overflow-hidden rounded-2xl p-1.5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/20"
            style={{
                // Estilos de movimiento (x, y, rotate)
                x: tx,
                y: ty,
                rotate: photo.rotate,
                // Estilos de diseño
                backgroundColor: '#0b1326',
                border: '4px solid rgba(214, 182, 223, 0.3)',
                boxShadow: '0 4px 20px rgba(103, 37, 119, 0.15)',
            }}
        >
            <div className="relative h-full w-full overflow-hidden rounded-xl">
                {photo.src ? (
                    <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 6rem, 9rem"
                    />
                ) : (
                    <div className="h-full w-full bg-foreground/5" />
                )}
            </div>
            {/* Efecto de brillo en hover */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(103, 37, 119, 0.1), rgba(52, 84, 161, 0.05))',
                }}
            />
        </motion.div>
    );
}

export function PolaroidStrip() {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    if (!mounted) {
        return <div aria-hidden="true" className="h-[clamp(8rem,15vw,12rem)] w-full" />;
    }

    return (
        <div className="flex flex-wrap w-full items-start justify-center gap-3 px-4 sm:gap-4 sm:px-8 mt-26 sm:mt-26">
            {PHOTOS.map((photo, i) => (
                <PolaroidCard key={photo.id} photo={photo} index={i} />
            ))}
        </div>
    );
}
