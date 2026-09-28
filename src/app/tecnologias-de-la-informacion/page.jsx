import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { ContactCard } from "@/components/contact/contact-card";
import { FadeIn } from "@/components/ui/motion-primitives";

export const metadata = {
  title: "Área de Tecnologías de la Información | SEDIPRO UNT",
  description:
    "Conoce a los integrantes del Área de Tecnologías de la Información de SEDIPRO UNT.",
  alternates: {
    canonical: "https://sediprount.org/tecnologias-de-la-informacion",
  },
};

const SOCIAL_NETWORKS = {
  linkedin: {
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  github: {
    label: "GitHub",
    icon: FaGithub,
  },
  instagram: {
    label: "Instagram",
    icon: FaInstagram,
  },
};

const MEMBERS = [
  {
    name: "De La Cruz Calderón, Elder Eli",
    image: "/img/area-ti/DE-LA-CRUZ-CALDERON-ELDER-ELI.webp",
    career: "Informática",
    role: "Director",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/elder-de-la-cruz-calderon-b4200833a/",
      github: "https://github.com/Elder9DC",
      instagram: "https://www.instagram.com/elder.20100525/",
    },
  },
  {
    name: "Chan Vasquez, Yanxmarcos",
    image: "/img/area-ti/CHAN-VASQUEZ-YANXMARCOS.webp",
    career: "Informática",
    socials: {
      linkedin: "https://www.linkedin.com/in/yanxmarcos-chan-vasquez/",
      github: "https://github.com/Yanxmarcos",
      instagram: "https://www.instagram.com/yanxmarcoschan/",
    },
  },
  {
    name: "Avila Zamudio, Eliaser Isai",
    image: "/img/area-ti/AVILA-ZAMUDIO-ELIASER-ISAI.webp",
    career: "Informática",
    socials: {
      linkedin: "https://www.linkedin.com/in/eliaser-avila-zamudio/",
      github: "https://github.com/Desconocido-0",
      instagram: "https://www.instagram.com/eliaser_avila_/",
    },
  },
  {
    name: "Morales Esquivel, Christian Anthony",
    image: "/img/area-ti/MORALES-ESQUIVEL-CHRISTIAN-ANTHONY.webp",
    career: "Informática",
    socials: {
      linkedin: "https://www.linkedin.com/in/cristian-morales-esquivel/",
      github: "https://github.com/Anthony190801",
      instagram: "https://www.instagram.com/cristiananthony4686/",
    },
  },
  {
    name: "Sanchez Cabrera, Pablo Cesar",
    image: "/img/area-ti/SANCHEZ-CABRERA-PABLO-CESAR.webp",
    career: "Ingeniería Industrial",
  },
  {
    name: "Agreda Cruz, Jesus Alberto",
    image: "/img/area-ti/AGREDA-CRUZ-JESUS-ALBERTO.webp",
    career: "Informática",
  },
  {
    name: "Cipiran Mercedes, Omar Eduardo",
    image: "/img/area-ti/CIPIRAN-MERCEDES-OMAR-EDUARDO.webp",
    career: "Informática",
  },
  {
    name: "Figueroa Campos, Cristhofer Leonardo",
    image: "/img/area-ti/FIGUEROA-CAMPOS-CRISTHOFER-LEONARDO.webp",
    career: "Informática",
  },
  {
    name: "Julca Davila, Ricky Gilbert",
    image: "/img/area-ti/JULCA-DAVILA-RICKY-GILBERT.webp",
    career: "Informática",
  },
  {
    name: "Llontop Lobaton, David Alejandro",
    image: "/img/area-ti/LLONTOP-LOBATON-DAVID-ALEJANDRO.webp",
    career: "Estadística",
  },
  {
    name: "Mattus Orbegoso, Gabriel Valentino",
    image: "/img/area-ti/MATTUS-ORBEGOSO-GABRIEL-VALENTINO.webp",
    career: "Informática",
  },
  {
    name: "Paredes Gil, Diego Anderzon",
    image: "/img/area-ti/PAREDES-GIL-DIEGO-ANDERZON.webp",
    career: "Ingeniería de Sistemas",
  },
  {
    name: "Reymundo Vilca, Diego Stefano",
    image: "/img/area-ti/REYMUNDO-VILCA-DIEGO-STEFANO.webp",
    career: "Ingeniería de Sistemas",
  },
  {
    name: "Silvestre Ferrer, Jeffran Alberto",
    image: "/img/area-ti/SILVESTRE-FERRER-JEFFRAN-ALBERTO.webp",
    career: "Ingeniería de Sistemas",
  },
  {
    name: "Vargas Ramos, Jhoanny Jheimilyn Xiomara",
    image: "/img/area-ti/VARGAS-RAMOS-JHOANNY-JHEIMILYN-XIOMARA.webp",
    career: "Informática"
  },
  {
    name: "Velasquez Garcia, Ricardo Bernardo",
    image: "/img/area-ti/VELASQUEZ-GARCIA-RICARDO-BERNARDO.webp",
    career: "Ingeniería de Sistemas",
  },
];

export default function InformationTechnologyPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(102,32,101,0.28),transparent_68%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:px-10">
        <FadeIn className="mx-auto flex max-w-3xl flex-col items-center pb-40 text-center sm:pb-40">
          <Image
            src="/logo_blanco.png"
            alt="SEDIPRO UNT Logo"
            width={160}
            height={160}
            priority
            className="h-auto w-40 object-contain"
          />
        </FadeIn>

        <FadeIn className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tecnologías de la Información
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-foreground/65 sm:text-lg">
            El equipo que diseña, desarrolla y mantiene las soluciones digitales
            que impulsan los proyectos de SEDIPRO UNT.
          </p>
        </FadeIn>

        <section aria-labelledby="integrantes-ti" className="mt-16 sm:mt-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Nuestro equipo
              </p>
              <h2
                id="integrantes-ti"
                className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                16 integrantes
              </h2>
            </div>

            <p className="hidden text-sm text-foreground/45 sm:block">
              Periodo 2026
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MEMBERS.map((member, index) => (
              <FadeIn
                key={member.image}
                delay={Math.min(index * 0.04, 0.36)}
                duration={0.65}
                className="h-full"
              >
                <MemberCard member={member} />
              </FadeIn>
            ))}
          </div>
        </section>
      </div>

      <ContactCard />

      <div className="h-12 sm:h-16">
        <div className="flex items-center justify-center gap-1.5 text-xs text-foreground">
          <span>Hecho con</span>
          <Heart className="h-3 w-3 fill-orange-500 text-orange-500 animate-pulse" />
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

function MemberCard({ member }) {
  const socialEntries = Object.entries(member.socials ?? {});

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-[#0b1326]/55 p-2.5 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#0b1326]/70 hover:shadow-[0_24px_70px_-28px_rgba(102,32,101,0.75)] ${
        member.role
          ? "border-orange-300/45"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] bg-white/5">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
        />

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1326]/75 to-transparent" />

        {member.role && (
          <span className="absolute left-3 top-3 rounded-full border border-orange-200/35 bg-orange-400/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b1326] shadow-lg backdrop-blur-md">
            {member.role}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="min-h-14 text-lg font-semibold leading-7 tracking-tight text-foreground">
          {member.name}
        </h3>

        {member.career && (
          <p className="mb-3 text-sm leading-5 text-foreground/55">
            {member.career}
          </p>
        )}

        <div className="mt-auto flex min-h-10 items-center border-t border-white/10 pt-3">
          {socialEntries.length > 0 ? (
            <div className="flex items-center gap-2">
              {socialEntries.map(([network, href]) => {
                const social = SOCIAL_NETWORKS[network];
                const Icon = social.icon;

                return (
                  <Link
                    key={network}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} de ${member.name}`}
                    title={social.label}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-foreground/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/12 hover:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
