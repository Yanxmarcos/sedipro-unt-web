// src/components/contact/contact-card.jsx
import { ContactCardCtas } from "./contact-card-ctas";
// src/components/contact/contact-card.jsx

import { Mail, Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { PolaroidStrip } from "@/components/about/polaroid-strip";

import { FadeIn } from "@/components/ui/motion-primitives";

export function ContactCard() {
  return (
    <>
      <PolaroidStrip />
      <section className="relative mx-auto my-6 w-full max-w-275 px-6 sm:mb-20 sm:px-10">
        {/* Glow ambiental */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10"
        >
          <div className="absolute left-1/4 top-0 h-56 w-56 rounded-full bg-primary/25 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-secondary/20 blur-[120px]" />
        </div>

        <FadeIn>
          <div className="group relative overflow-hidden rounded-3xl border border-white/45 bg-[#0B1225]/5 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.01] hover:border-white/65 hover:shadow-primary/20">
            {/* Borde gradiente con esquinas redondeadas */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-white/5 p-[1px]">
              <div className="h-full w-full rounded-3xl bg-background/70 backdrop-blur-xl" />
            </div>

            {/* Contenido */}
            <div className="relative grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:items-stretch md:gap-6">
              {/* Columna Izquierda */}
              <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
                <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                  Conecta con{" "}
                  <span className="bg-primary bg-clip-text text-transparent">
                    nosotros
                  </span>
                </h2>

                <p className="text-lg leading-relaxed text-foreground/70">
                  Contáctanos o síguenos en nuestras redes sociales para conocer
                  más sobre nuestras iniciativas.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <ContactCardCtas />
                </div>
              </div>

              {/* Columna Derecha - Redes Sociales */}
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <p className="text-[13px] leading-tight tracking-tight font-medium text-foreground">
                    Nuestras redes sociales
                  </p>
                </div>
                <div className="flex w-44 flex-wrap items-center justify-center gap-3 sm:w-auto sm:flex-nowrap">
                  {[
                    {
                      icon: FaFacebookF,
                      href: "https://www.facebook.com/SediproUNT",
                      label: "Facebook",
                      color: "hover:text-[#1877F2]",
                    },
                    {
                      icon: FaInstagram,
                      href: "https://www.instagram.com/sedipro.unt/",
                      label: "Instagram",
                      color: "hover:text-[#E4405F]",
                    },
                    {
                      icon: FaLinkedinIn,
                      href: "https://www.linkedin.com/company/sediprount/",
                      label: "LinkedIn",
                      color: "hover:text-[#0A66C2]",
                    },
                    {
                      icon: FaYoutube,
                      href: "https://www.youtube.com/c/SEDIPROUNT",
                      label: "YouTube",
                      color: "hover:text-[#FF0000]",
                    },
                    {
                      icon: FaTiktok,
                      href: "https://www.tiktok.com/@sediprount",
                      label: "TikTok",
                      color: "hover:text-[#000000]",
                    },
                  ].map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-primary/10 ${social.color}`}
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm tracking-tight text-foreground">
                    &copy; 2026 SEDIPRO UNT. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
