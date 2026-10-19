import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/sedichampions");

export default function SedichampionsLayout({ children }) {
  return <><StructuredData path="/sedichampions" />{children}</>;
}
