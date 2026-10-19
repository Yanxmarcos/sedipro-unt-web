import { Cascadia_Code } from "next/font/google";
import { TITerminal } from "@/components/ti-terminal/terminal";

const cascadia = Cascadia_Code({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ti-code", display: "swap" });

export const metadata = {
  title: "Área de Tecnologías de la Información | SEDIPRO UNT",
  description: "Conoce al equipo de TI de SEDIPRO UNT: interfaces, sistemas y backend, y datos.",
  alternates: { canonical: "https://sediprount.org/tecnologias-de-la-informacion" },
};

export default function InformationTechnologyPage() {
  return <div className={cascadia.variable}><TITerminal /></div>;
}
