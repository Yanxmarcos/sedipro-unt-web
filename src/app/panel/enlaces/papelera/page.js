import LinkLibrary from "@/components/admin/enlaces/link-library";
import { privateMetadata } from "@/lib/seo.mjs";
export const metadata = privateMetadata("Papelera de enlaces");
export default function PapeleraPage() {
  return <LinkLibrary trash />;
}
