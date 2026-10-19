import './styles.css';
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/360pm");

export default function ProjectLayout({ children }) {
  return <><StructuredData path="/360pm" />{children}</>;
}
