import CertificateGenerator from "@/components/admin/certificates/certificate-generator";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Generador de certificados");

export default function CertificatesPage() {
  return <CertificateGenerator />;
}
