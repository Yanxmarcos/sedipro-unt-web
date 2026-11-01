"use client";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { STATES } from "./link-utils.mjs";

export function StateBadge({ state }) {
  return (
    <Badge variant={state === "activo" ? "default" : "secondary"}>
      {STATES[state] || state}
    </Badge>
  );
}
export function CopyLink({ url, title, text = false }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={text ? "default" : "icon-sm"}
      aria-label={`Copiar enlace de ${title}`}
      onClick={async () => {
        try {
          if (await copyToClipboard(url)) toast.success("Enlace copiado.");
          else
            toast.error(
              "No se pudo copiar. Selecciona el enlace y cópialo manualmente.",
            );
        } catch {
          toast.error(
            "No se pudo copiar. Selecciona el enlace y cópialo manualmente.",
          );
        }
      }}
    >
      <Copy />
      {text && "Copiar enlace"}
    </Button>
  );
}
export function LinkPagination({ pagination, onPage, disabled }) {
  const { page, pages, total } = pagination;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "registro" : "registros"} · Página {page} de{" "}
        {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Página anterior"
        >
          <ArrowLeft />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
