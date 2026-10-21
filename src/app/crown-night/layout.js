import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/crown-night");

export default function ProjectLayout({ children }) {
  return <><StructuredData path="/crown-night" />{children}</>;
}
