// src/components/hero/hero-ctas.jsx
"use client";

import { ArrowRight } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";

import { ContactButton } from "@/components/contact/contact-button";

const EASE = [0.22, 1, 0.36, 1];

export function HeroCtas() {
    return (
        <LayoutGroup>
            <motion.div
                layout
                transition={{ layout: { duration: 0.55, ease: EASE } }}
                className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start"
            >
                <ContactButton />

                <motion.div
                    layout
                    transition={{ layout: { duration: 0.55, ease: EASE } }}
                >
                    <Link
                        href="/proyectos"
                        className="focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            border: '1px solid var(--color-accent)',
                        }}
                    >
                        Proyectos
                        <ArrowRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </Link>
                </motion.div>
            </motion.div>
        </LayoutGroup>
    );
}
