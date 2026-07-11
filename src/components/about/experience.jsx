// src/components/about/experience.jsx
"use client";

import { LuMedal } from "react-icons/lu";

const ENTRIES = [
    {
        company: "3er puesto en el International Project Management Championship (IPMC) Perú",
        role: "Competencia Internacional",
        period: "2025",
    },
    {
        company: "Reconocimiento de la Municipalidad Provincial de Trujillo como mejor voluntariado universitario",
        role: "Reconocimiento Institucional",
        period: "2025",
    },
    {
        company: "1er puesto en CONCEPMI",
        role: "Competencia Nacional",
        period: "2025",
    },
    {
        company: "Organizadores del Congreso Nacional de Conexiones Estudiantiles del Project Management Institute (PMI)",
        role: "Organización de Evento",
        period: "2024",
    },
    {
        company: "3er puesto a nivel nacional en IPMC",
        role: "Competencia Nacional",
        period: "2024",
    },
    {
        company: "Organizadores del International Project Management Perú",
        role: "Organización de Evento",
        period: "2024",
    },
    {
        company: "Reconocimiento de la Municipalidad Provincial de Trujillo como mejor voluntariado universitario",
        role: "Reconocimiento Institucional",
        period: "2024",
    },
    {
        company: "1er puesto en CONCEPMI",
        role: "Competencia Nacional",
        period: "2023",
    },
    {
        company: "3er puesto en Changemakers Students",
        role: "Competencia Nacional",
        period: "2022",
    },
    {
        company: "2do puesto en PM Championship",
        role: "Competencia Nacional",
        period: "2022",
    },
    {
        company: "1er puesto en International Project Management Championship (IPMC)",
        role: "Competencia Internacional",
        period: "2021",
    },
    {
        company: "1er puesto en Peruvian Project Management Championship (PMC)",
        role: "Competencia Nacional",
        period: "2021",
    },
    {
        company: "3er puesto en International Project Management Championship (IPMC)",
        role: "Competencia Internacional",
        period: "2020",
    },
    {
        company: "1er puesto en Peruvian Project Management Championship (PMC)",
        role: "Competencia Nacional",
        period: "2020",
    },
];

const ROW_HEIGHT = 64;

export function Experience() {
    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
                Reconocimientos
            </h3>
            <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 rounded-4xl border p-2 sm:p-4">
                <ul className="flex flex-col gap-2">
                    {ENTRIES.map((entry) => (
                        <li
                            key={`${entry.company}-${entry.period}`}
                            className="bg-background border-foreground/5 flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border p-2 sm:p-2.5"
                            style={{ minHeight: ROW_HEIGHT }}
                        >
                            <CompanyLogo entry={entry} />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="text-foreground text-sm sm:text-[17px] font-semibold leading-snug tracking-normal sm:tracking-tight line-clamp-2 sm:line-clamp-none">
                                    {entry.company}
                                </span>
                                <span className="text-foreground/65 mt-0.5 text-xs sm:text-[14px] tracking-normal sm:tracking-tight">
                                    {entry.role}
                                    <span className="text-foreground/30 mx-1.5 sm:mx-2">•</span>
                                    <span className="text-foreground/55">{entry.period}</span>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function CompanyLogo({ entry }) {
    const getColor = (company) => {
        if (company.includes("1er") || company.includes("1º")) return "#FFD700";
        if (company.includes("2do") || company.includes("2º")) return "#C0C0C0";
        if (company.includes("3er") || company.includes("3º")) return "#CD7F32";
        if (company.includes("Reconocimiento")) return "#8B5CF6";
        if (company.includes("Organizadores")) return "#6366F1";
        if (company.includes("Proyectando Vocaciones")) return "#10B981";
        return "#D6B6DF";
    };

    const bgColor = getColor(entry.company);
    const isGold = entry.company.includes("1er") || entry.company.includes("1º");

    return (
        <span
            className="inline-flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center ring-1 ring-white/10"
            aria-hidden="true"
            style={{
                borderRadius: 12,
                backgroundColor: bgColor,
            }}
        >
            <LuMedal 
                className={`h-5 w-5 sm:h-6 sm:w-6 ${isGold ? 'text-yellow-900/70' : 'text-white'}`}
            />
        </span>
    );
}