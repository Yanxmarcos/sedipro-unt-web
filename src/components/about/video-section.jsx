// src/components/about/video-section.jsx
"use client";

import { useEffect, useRef } from "react";

export function VideoSection() {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            // Reproducir automáticamente
            videoRef.current.play().catch(() => {
                // Si el navegador bloquea autoplay, no hacer nada
            });

            // Ajustar velocidad de reproducción (0.5 = mitad, 1 = normal, 1.5 = rápido, 2 = doble)
            videoRef.current.playbackRate = 1;
        }
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
                Un poco de nosotros
            </h3>
            <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative h-64 overflow-hidden rounded-4xl border sm:h-94">
                <video
                    ref={videoRef}
                    src="/video/video.mp4"
                    className="h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    autoPlay
                />
                {/* Overlay de gradiente para darle estilo */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                
                {/* Texto superpuesto (opcional) */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <p className="text-foreground/70 text-sm tracking-tight">
                        SEDIPRO UNT
                    </p>
                </div>
            </div>
        </div>
    );
}