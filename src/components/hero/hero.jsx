// src/components/hero/hero.jsx

import Image from "next/image";
import { HeroCtas } from "./hero-ctas";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { PortraitMorph } from "./portrait-morph";

const PORTRAIT_SRC = "/sediprount.jpg";
const PORTRAIT_HOVER_SRC = "/13years.webp";

export function Hero() {
    return (
        <section className="relative w-full">
            <div className="mx-auto w-full max-w-275 px-6 pt-44 pb-16 sm:px-10 sm:pt-56 sm:pb-32">
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                    <FadeIn className="flex min-w-0 flex-col items-center gap-4 text-center md:items-start md:text-left">
                        {/* Logo grande: SOLO mobile, mismo estilo que about/page.jsx. 
                            Desaparece justo cuando el PortraitMorph aparece (md:hidden) */}
                        <div className="flex items-center gap-5 text-center pb-30 md:hidden">
                            <Image
                                src="/logo_blanco.png"
                                alt="SEDIPRO UNT Logo"
                                width={100}
                                height={100}
                                className="h-full w-40 object-contain"
                            />
                        </div>

                        <h1 className="select-none text-[2rem] font-medium leading-[1.15] tracking-tight text-foreground sm:text-[2rem] sm:leading-[1.05] md:text-[2.5rem] lg:text-[3rem]">
                            <span className="block lg:whitespace-nowrap">
                                Sección Estudiantil de
                            </span>
                            <span className="block lg:whitespace-nowrap">
                                Dirección de Proyectos
                            </span>
                            <span className="block lg:whitespace-nowrap">
                                de la UNT
                            </span>
                        </h1>

                        <p className="select-none max-w-[34ch] text-[17px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[21px]">
                            Equipo multidisciplinario orientado a difundir las buenas prácticas en gestión de proyectos.
                        </p>

                        <HeroCtas />
                    </FadeIn>

                    <ScaleUnblur className="hidden min-w-0 md:flex md:justify-end">
                        <div className="relative aspect-square w-full max-w-88 overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
                            <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                                <PortraitMorph
                                    srcA={PORTRAIT_SRC}
                                    srcB={PORTRAIT_HOVER_SRC}
                                    alt="Josh portrait"
                                />
                            </div>
                        </div>
                    </ScaleUnblur>
                </div>
            </div>
        </section>
    );
}