import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/sedinvita");

export default function SedinvitaLayout({ children }) {
  return <><StructuredData path="/sedinvita" />{children}</>;
}
