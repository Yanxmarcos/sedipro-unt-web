// src/components/layout/landing-only.jsx
"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Nav } from "./nav";
import { PageBackdrop } from "./page-backdrop";
import LiquidEther from '@/components/shaders/LiquidEther';
const LANDING_PATHS = ['/', '/nosotros', '/proyectos'];
const MOBILE_BREAKPOINT = 768;

export function LandingOnly({ children }) {
    const pathname = usePathname();
    
    const [isLoading, setIsLoading] = useState(true);
    const [minTimePassed, setMinTimePassed] = useState(false);
    const [resourcesLoaded, setResourcesLoaded] = useState(false);
    const [canRenderHeavyBg, setCanRenderHeavyBg] = useState(false);

    const isLanding = LANDING_PATHS.includes(pathname);

    // IMPORTANTE: el valor por defecto es "false" (no renderizar) y recién
    // se activa cuando confirmamos que el dispositivo es capaz. Es al revés
    // de "asumir desktop y corregir después": los efectos de los hijos (el
    // propio LiquidEther inicializando WebGL) corren ANTES que este efecto
    // del padre en el mismo commit, así que si el valor inicial fuera
    // "true", LiquidEther alcanza a montarse y crear el contexto WebGL
    // aunque lo desmontemos un instante después — y en dispositivos sin
    // soporte para texturas float lineales eso ya es suficiente para
    // corromper el frame. Con el default en "false", LiquidEther nunca
    // llega a existir en el árbol de React hasta que se confirma desktop.
    useEffect(() => {
        const checkCapability = () => {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
            setCanRenderHeavyBg(!isTouch && !isSmallScreen);
        };

        checkCapability();
        window.addEventListener('resize', checkCapability);
        return () => window.removeEventListener('resize', checkCapability);
    }, []);

    useEffect(() => {
        if (!isLanding) {
            setIsLoading(false);
            return;
        }

        // Verificar si ya se cargó en esta sesión
        const alreadyLoaded = sessionStorage.getItem('landing_loaded');
        if (alreadyLoaded) {
            setIsLoading(false);
            return;
        }

        // 1. Timer mínimo de 2s (para que el loader se vea bien)
        const minTimer = setTimeout(() => {
            setMinTimePassed(true);
        }, 2000);

        // 2. Esperar a que los recursos estén listos
        const handleResourcesReady = () => {
            // Pequeño delay extra para WebGL
            setTimeout(() => {
                setResourcesLoaded(true);
            }, 500);
        };

        // Si ya está completamente cargado, marcar inmediatamente
        if (document.readyState === 'complete') {
            handleResourcesReady();
        } else {
            // Si no, esperar al evento load
            window.addEventListener('load', handleResourcesReady, { once: true });
        }

        // 3. Timeout de seguridad (5 segundos total en el peor caso)
        const safetyTimer = setTimeout(() => {
            setMinTimePassed(true);
            setResourcesLoaded(true);
        }, 5000);

        // Cleanup
        return () => {
            clearTimeout(minTimer);
            clearTimeout(safetyTimer);
            window.removeEventListener('load', handleResourcesReady);
        };
    }, [isLanding]);

    // Cuando se cumplen AMBAS condiciones, ocultar loader
    useEffect(() => {
        if (minTimePassed && resourcesLoaded && isLanding) {
            setIsLoading(false);
            sessionStorage.setItem('landing_loaded', 'true');
        }
    }, [minTimePassed, resourcesLoaded, isLanding]);

    // Si no estamos en landing, renderizar normal
    if (!isLanding) {
        return <>{children}</>;
    }

    return (
        <>
            {/* ============================================
                PANTALLA DE CARGA
                ============================================ */}
            {isLoading && (
                <div 
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
                    style={{
                        backgroundColor: '#0b1326',
                        transition: 'opacity 0.8s ease-in-out',
                    }}
                >
                    {/* Logo animado */}
                    <div className="relative flex flex-col items-center gap-6">
                        <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                            <div
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{
                                    backgroundColor: "rgba(103, 37, 119, 0.3)",
                                }}
                            />

                            <Image
                                src="/favicon-96x96.png"
                                alt="SEDIPRO UNT"
                                width={80}
                                height={80}
                                priority
                                className="relative z-10 animate-pulse"
                            />
                        </div>

                        {/* Texto de carga */}
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-2xl font-semibold text-foreground">
                                SEDIPRO UNT
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                            </div>
                            <p className="text-sm text-foreground/50 mt-2">
                                {resourcesLoaded ? 'Preparando todo para ti 💜💙...' : 'Preparando todo para ti 💜💙...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
                CONTENIDO PRINCIPAL
                ============================================ */}
            <div 
                className={`transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            >
                {/* Fondo líquido (solo se activa tras confirmar que el dispositivo lo soporta: ver comentario arriba) */}
                {canRenderHeavyBg && (
                    <div 
                        className="fixed inset-0 h-screen w-full overflow-hidden"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        <LiquidEther
                            colors={['#5227FF', '#FF9FFC', '#B497CF']}
                            mouseForce={20}
                            cursorSize={100}
                            isViscous
                            viscous={10}
                            iterationsViscous={32}
                            iterationsPoisson={32}
                            resolution={0.5}
                            isBounce={false}
                            autoDemo
                            autoSpeed={0.5}
                            autoIntensity={2.2}
                            takeoverDuration={0.25}
                            autoResumeDelay={3000}
                            autoRampDuration={0.6}
                            color0="#5227FF"
                            color1="#FF9FFC"
                            color2="#B497CF"
                        />
                    </div>
                )}
                
                {/* Shader de luz */}
                <PageBackdrop />
                
                {/* Navegación */}
                <Nav />
            </div>

            {/* Contenido de la página */}
            <main id="main-content" className="relative flex-1" style={{ zIndex: 1 }}>
                {children}
            </main>
        </>
    );
}