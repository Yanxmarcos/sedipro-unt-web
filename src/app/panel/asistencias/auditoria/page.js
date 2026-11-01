import AttendanceAudit from "@/components/admin/attendance-audit";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Auditoría de asistencias");
export default function AttendanceAuditPage() {
  return <AttendanceAudit />;
}
