import LinkLibrary from "@/components/admin/enlaces/link-library";
import { privateMetadata } from "@/lib/seo.mjs";
export const metadata = privateMetadata("Acortador de enlaces");
export default function EnlacesPage() {
  return <LinkLibrary />;
}
