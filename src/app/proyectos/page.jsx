// src/app/projects/page.jsx

import { ContactCard } from "@/components/contact/contact-card";
import { Projects } from "@/components/projects/projects";
import { FadeIn } from "@/components/ui/motion-primitives";
import { Mail, Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Proyectos | SEDIPRO UNT",
    description: "Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo",
};

export default function ProjectsPage() {
    return (
        <main id="main-content" className="flex flex-1 flex-col gap-20 sm:gap-10">
            <section className="mx-auto w-full max-w-275 px-6 pt-44 pb-16 sm:px-10 sm:pt-56 sm:pb-20">
                <FadeIn className="flex flex-col items-center gap-5 text-center pb-40 sm:pb-40">
                    <div className="flex items-center gap-5 text-center">
                        <Image
                            src="/logo_blanco.png"
                            alt="SEDIPRO UNT Logo"
                            width={100}
                            height={100}
                            className="h-full w-40 object-contain"
                        />
                        {/* <p className="select-none text-[20px] leading-tight tracking-tight font-medium text-foreground">
                            SEDIPRO UNT
                        </p> */}
                    </div>
                </FadeIn>
                <FadeIn className="flex flex-col items-center gap-5 text-center">
                    <h1 className="text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3.25rem] lg:text-[3.75rem]">
                        Proyectos
                    </h1>
                    <p className="max-w-[33ch] text-[20px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[22px]">
                        Una pequeña muestra de nuestro compromiso y trabajo.
                    </p>
                </FadeIn>
            </section>
            
            <Projects />
            <ContactCard />
            <div className="h-12 sm:h-16">
                <div className="flex items-center justify-center gap-1.5 text-xs text-foreground">
                    <span>Hecho con</span>
                    <Heart className="h-3 w-3 text-orange-500 fill-orange-500 animate-pulse" />
                    <span>por</span>
                    <span className="font-semibold text-orange-400">Área de TI</span>
                    <div className="relative h-5 w-5 overflow-hidden">
                        <Image
                            alt="Logo Área de TI SEDIPRO"
                            width={20}
                            height={20}
                            className="object-cover"
                            src="/img/area-ti.png"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}