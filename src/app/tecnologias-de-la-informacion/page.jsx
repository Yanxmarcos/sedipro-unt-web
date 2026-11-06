import localFont from "next/font/local";
import { TITerminal } from "@/components/ti-terminal/terminal";
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

// Keep this font in the repository: Google Fonts can return URLs that the
// current Next.js font loader cannot parse during a production build.
const cascadia = localFont({
  src: "./fonts/CascadiaCode-Latin-Variable.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-ti-code",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata = pageMetadata("/tecnologias-de-la-informacion");

export default function InformationTechnologyPage() {
  return (
    <div className={cascadia.variable}>
      <StructuredData path="/tecnologias-de-la-informacion" />
      <TITerminal />
    </div>
  );
}
