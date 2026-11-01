import LinkAudit from "@/components/admin/enlaces/link-audit";
import { privateMetadata } from "@/lib/seo.mjs";
export const metadata = privateMetadata("Auditoría de enlaces");
export default async function AuditoriaPage({ searchParams }) {
  const params = await searchParams;
  return (
    <LinkAudit
      enlaceId={typeof params.enlaceId === "string" ? params.enlaceId : ""}
    />
  );
}
