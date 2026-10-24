import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventAudit } from "@/components/event-forms-admin/audit";
export default function EventAuditPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/panel/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todos los eventos
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">
        Auditoría de eventos
      </h1>
      <EventAudit />
    </div>
  );
}
