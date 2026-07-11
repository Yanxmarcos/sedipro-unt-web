// src/app/page.jsx

import { ContactCard } from "@/components/contact/contact-card";
import { Hero } from "@/components/hero/hero";
import { Projects } from "@/components/projects/projects";
import { Mail, Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Inicio | SEDIPRO UNT",
    description: "Bienvenido a la Sección Estudiantil de Dirección de Proyectos de la UNT",
};

export default function HomePage() {
    return (
        <main id="main-content" className="flex flex-1 flex-col gap-20 sm:gap-10">
            <Hero />
            <Projects withHeadline viewMoreVisible />

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