// src/components/projects/projects.jsx

import {
    ArrowRight,
    ArrowUpRight,
    Bot,
    Compass,
    Layers,
    LineChart,
    Sparkles,
    Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/ui/motion-primitives";

/**
 * Project imagery below is mockup-only. All visuals are sourced from
 * Dribbble and credit belongs to the original creators on dribbble.com.
 * Replace these with your own work before shipping.
 */

const PROJECTS = [
    // {
    //     id: "360pm",
    //     icon: Sparkles,
    //     iconLabel: "360° PROJECT MASTERY",
    //     title:
    //         "360° PROJECT MASTERY",
    //     description:
    //         "Es un programa experiencial holístico diseñado para estudiantes y profesionales apasionados por la gestión de proyectos que desean potenciar sus competencias y convertirse en los próximos referentes del ecosistema de Project Management en el Perú.",
    //     meta: "Virtual: Miércoles 7 y Sábado 17 de octubre, 2026 | Presencial: Sábado 24 de octubre, 2026.",
    //     href: "/360pm",
    //     imageRatio: 1080 / 1350,
    //     image: "/360pm/360pm-logo.webp",
    //     imageAlt: "Publicidad 360° PROJECT MASTERY",
    // },
    {
        id: "sedichampions",
        icon: Sparkles,
        iconLabel: "SEDICHAMPIONS LEAGUE",
        title:
            "SEDICHAMPIONS LEAGUE 2026",
        description:
            "Es el campeonato deportivo que busca fortalecer la integración, el trabajo en equipo y el compañerismo entre estudiantes a través de actividades recreativas y competitivas.",
        meta: "Sábado 8 de agosto, 2026.",
        href: "/sedichampions",
        imageRatio: 2482 / 3510,
        image: "/proyectos/sedichampions.webp",
        imageAlt: "Imagen de SEDICHAMPIONS",
    },
    {
        id: "crown-night",
        icon: Sparkles,
        iconLabel: "CROWN NIGHT",
        title:
            "CROWN NIGHT 2026",
        description:
            "Crown Night es el certamen oficial que reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT en una noche inolvidable.",
        meta: "Sábado 29 de agosto, 2026.",
        href: "/crown-night",
        imageRatio: 3375 / 4219,
        image: "/proyectos/crown-night.webp",
        imageAlt: "Imagen de CROWN NIGHT",
    },
    {
        id: "sedinvita",
        icon: Sparkles,
        iconLabel: "SEDINVITA",
        title:
            "SEDINVITA 2026",
        description:
            "Únete a la comunidad de líderes más influyente de la UNT. SEDInvita es el punto de partida para tu crecimiento profesional y personal.",
        meta: "Del 1 de junio al 18 de julio, 2026",
        href: "/sedinvita",
        imageRatio: 912 / 1136,
        image: "/proyectos/sedinvita1.webp",
        imageAlt: "Imagen de Sedinvita",
    },
    {
        id: "proyectando3",
        icon: Compass,
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 3.0",
        description:
            "Proyectando Vocaciones 3.0 fue un espacio que orientó, inspiró y acompañó a los jóvenes a descubrir su verdadera vocación y elegir su futuro con confianza.",
        meta: "Sábado 28 de febrero, 2026",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv3/",
        imageRatio: 912 / 1136,
        image: "/proyectos/proyectando_v.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 3.0",
    },
    {
        id: "proyectando2",
        icon: Compass,
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 2.0",
        description:
            "Proyectando Vocaciones 2.0 consolidó el proyecto como un espacio de orientación universitaria, fortaleciendo su impacto en la comunidad estudiantil.",
        meta: "Sábado 22 de febrero, 2025",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv2/",
        imageRatio: 1024 / 1024,
        image: "/proyectos/proyectando2.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 2.0",
    },
    {
        id: "proyectando1",
        icon: Compass,
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 1.0",
        description:
            "Proyectando Vocaciones 1.0 fue el inicio de una idea que nació para conectar a los estudiantes con su vocación universitaria, brindándoles orientación e inspiración para dar sus primeros pasos hacia la elección de su futuro profesional.",
        meta: "Viernes 16 de diciembre, 2022",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv1/",
        imageRatio: 1024 / 1024,
        image: "/proyectos/proyectando.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 1.0",
    },
    
];

export function Projects({
    withHeadline = false,
    viewMoreVisible = false,
}) {
    const items = viewMoreVisible ? PROJECTS.slice(0, 4) : PROJECTS;

    return (
        <section className="relative w-full">
            <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
                {withHeadline ? (
                    <FadeIn className="flex flex-col items-center gap-5 pt-12 pb-10 text-center sm:pt-20 sm:pb-14">
                        <h2 className="text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
                            Proyectos
                        </h2>
                        <p className="max-w-[33ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
                            Descubre nuestras experiencias más destacadas.
                        </p>
                    </FadeIn>
                ) : null}

                <div className="columns-1 gap-6 md:columns-2 md:gap-7">
                    {items.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>

                {viewMoreVisible ? (
                    <div className="mt-12 flex justify-center sm:mt-16">
                        <Link
                            href="/proyectos"
                            className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                        >
                            Ver más proyectos
                            <ArrowRight
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function ProjectCard({ project, index }) {
    const Icon = project.icon;
    return (
        <FadeIn
            delay={Math.min(index * 0.06, 0.3)}
            className="mb-6 break-inside-avoid md:mb-7"
        >
            <Link
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group focus-ring flex flex-col gap-4 rounded-3xl border border-foreground/10 bg-foreground/2 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background hover:shadow-[0_20px_45px_-18px_rgba(103,37,119,0.35)] dark:bg-foreground/3 sm:p-3.5"
            >
                <header className="flex items-center justify-between gap-2.5 px-1 pt-2">
                    <div className="flex items-center gap-2.5">
                        {/* <span className="border-foreground/10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                            <Icon
                                className="h-3.5 w-3.5 text-foreground transition-colors duration-300 group-hover:text-primary"
                                aria-hidden="true"
                            />
                        </span> */}
                        <span className="text-sm font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                            {project.iconLabel}
                        </span>
                    </div>

                    <ArrowUpRight
                        className="h-4 w-4 -translate-y-0.5 translate-x-0.5 text-foreground/30 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary group-hover:opacity-100"
                        aria-hidden="true"
                    />
                </header>

                <div
                    className="ring-foreground/5 relative w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1"
                    style={{ aspectRatio: project.imageRatio }}
                >
                    <Image
                        src={project.image}
                        alt={project.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.1]"
                        priority={index < 2}
                    />
                </div>

                <div className="flex flex-col gap-2.5 px-1 pb-1">
                    <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-[22px]">
                        {project.title}
                    </h3>
                    <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
                        {project.description}
                    </p>
                </div>

                <p className="px-1 pb-2 text-[12px] tracking-tight text-foreground/50">
                    {project.meta}
                </p>
            </Link>
        </FadeIn>
    );
}