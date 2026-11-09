import ResourceLibrary from "@/components/admin/recursos/resource-library";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Recursos institucionales");

export default function ResourcesPage() {
  return <ResourceLibrary />;
}
