import ResourceAudit from "@/components/admin/recursos/resource-audit";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata(
  "Auditoría de recursos institucionales",
);
export default function ResourceAuditPage() {
  return <ResourceAudit />;
}
