// src/app/about/page.jsx

import { Education } from "@/components/about/education";
import { Experience } from "@/components/about/experience";
import { Skills } from "@/components/about/skills";
import { Stack } from "@/components/about/stack";
import { ContactCard } from "@/components/contact/contact-card";
import { FadeIn } from "@/components/ui/motion-primitives";
import { VideoSection } from "@/components/about/video-section"; 
import { Mail, Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "Nosotros | SEDIPRO UNT",
    description: "Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo",
};

export default function AboutPage() {
    return (
        <main id="main-content" className="flex flex-1 flex-col">
            <section className="mx-auto w-full max-w-275 px-6 pt-44 pb-35 sm:px-10 sm:pt-56 sm:pb-20">
                <FadeIn className="flex flex-col items-center gap-5 text-center pb-40 sm:pb-40">
                    <div className="flex items-center gap-5 text-center">
                        <Image
                            src="/logo_blanco.png"
                            alt="SEDIPRO UNT Logo"
                            width={100}
                            height={100}
                            className="h-full w-40 object-contain"
                        />
                    </div>
                </FadeIn>
                <FadeIn className="flex flex-col items-center gap-5 text-center">
                    <h1 className="text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3.25rem] lg:text-[3.75rem]">
                        Nosotros
                    </h1>
                    <p className="max-w-[33ch] text-[20px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[22px]">
                        Impulsando el liderazgo en dirección de proyectos.
                    </p>
                </FadeIn>
            </section>

            <section className="mx-auto w-full max-w-160 px-6 pt-0 pb-0 sm:px-10 sm:pt-0 sm:pb-5">
                <FadeIn delay={0.5}>
                    <div className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
                        <h1 className="text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2.5rem]">
                            Quiénes <span className="border-primary border-b-2 text-primary">somos</span>
                        </h1>

                        <div className="mt-8 space-y-6 text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">
                            <p>
                                Somos la <strong className="font-semibold text-foreground">Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo</strong>, un equipo multidisciplinario comprometido con la formación de estudiantes mediante la difusión de las <strong className="font-semibold text-foreground">buenas prácticas en gestión de proyectos</strong>, utilizando la metodología PMI y herramientas ágiles bajo un enfoque <strong className="font-semibold text-foreground">académico, social y ambiental</strong>.
                            </p>

                            <p>
                                Nuestra misión es <strong className="font-semibold text-foreground">formar a los futuros líderes en las buenas prácticas de dirección de proyectos</strong> mediante un enfoque integral e innovador. Nuestra visión es <strong className="font-semibold text-foreground">ser la mejor SEDIPRO a nivel nacional</strong>, impulsando el desarrollo de gestores comprometidos con la excelencia y el impacto positivo.
                            </p>
                        </div>
                    </div>
                </FadeIn>
            </section>

            <section className="mx-auto w-full max-w-[40rem] px-6 pb-20 sm:px-10 sm:pb-10 overflow-visible">
                <FadeIn delay={0.1}>
                    <div className="flex flex-col gap-10 overflow-visible">
                        <Education />
                        <Stack />
                        <Skills />
                        <VideoSection />
                        {/* Experience SOLO en desktop (md:block) */}
                        <div className="hidden md:block">
                            <Experience />
                        </div>
                    </div>
                </FadeIn>
            </section>

            <ContactCard />
            <div className="h-12 sm:h-16">
                <div className="flex items-center justify-center gap-1.5 text-xs text-foreground">
                    <span>Hecho con</span>
                    <Heart className="h-3 w-3 text-orange-500 fill-orange-500 animate-pulse" />
                    <span>por</span>
                    <Link
                        href="/tecnologias-de-la-informacion"
                        className="focus-ring group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-foreground/5"
                    >
                        <span className="font-semibold text-orange-400 transition-colors group-hover:text-orange-300">
                        Área de TI
                        </span>
                        <span className="relative h-5 w-5 overflow-hidden">
                        <Image
                            alt="Logo Área de TI SEDIPRO"
                            width={20}
                            height={20}
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            src="/img/area-ti.png"
                        />
                        </span>
                    </Link>
                </div>
            </div>
        </main>
    );
}