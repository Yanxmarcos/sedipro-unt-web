// src/app/page.jsx

import { ContactCard } from "@/components/contact/contact-card";
import { Hero } from "@/components/hero/hero";
import { Projects } from "@/components/projects/projects";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title:
    "SEDIPRO UNT | Sección Estudiantil de Dirección de Proyectos de la UNT",
  description:
    "Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo",
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
