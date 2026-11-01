import CertificateAudit from "@/components/admin/certificates/certificate-audit";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Auditoría de certificados");
export default function CertificateAuditPage() {
  return <CertificateAudit />;
}
