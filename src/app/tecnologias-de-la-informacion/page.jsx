import { Cascadia_Code } from "next/font/google";
import { TITerminal } from "@/components/ti-terminal/terminal";
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

const cascadia = Cascadia_Code({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ti-code", display: "swap" });

export const metadata = pageMetadata("/tecnologias-de-la-informacion");

export default function InformationTechnologyPage() {
  return <div className={cascadia.variable}><StructuredData path="/tecnologias-de-la-informacion" /><TITerminal /></div>;
}
