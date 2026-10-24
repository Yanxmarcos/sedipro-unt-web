"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminConfirm } from "@/components/admin/form-controls";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { venueSummary } from "@/lib/event-location.mjs";
import {
  EventSettings,
  formatEventDate,
  EVENT_STATES,
} from "@/components/event-forms-admin/event-settings";

export default function EventosPage() {
  const router = useRouter();
  const { permissions } = usePanelSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    try {
      const result = await panelApi("/api/eventos?incluirArchivados=true");
      setEvents(result.data || []);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = useMemo(
    () =>
      events.filter((event) =>
        `${event.titulo} ${event.lugar || ""}`
          .toLocaleLowerCase("es")
          .includes(query.toLocaleLowerCase("es")),
      ),
    [events, query],
  );

  async function createEvent(values) {
    setSaving(true);
    setError("");
    try {
      const result = await panelApi("/api/eventos", {
        method: "POST",
        body: values,
      });
      setOpen(false);
      router.push(`/panel/eventos/${result.data._id}`);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Eventos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Crea una inscripción a la medida de tu próximo encuentro.
          </p>
        </div>
        {permissions.canManageEvents && <div className="flex flex-wrap gap-2">{permissions.canViewEventAudit && <Link href="/panel/eventos/auditoria" className={buttonVariants({ variant: "outline" })}>Auditoría</Link>}<Link href="/panel/eventos/comunicaciones" className={buttonVariants({ variant: "outline" })}>Suscripciones</Link><Button
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          <Plus />
          Crear evento
        </Button></div>}
      </header>
      {error && !open && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error}
          <Button variant="link" onClick={load} className="ml-2 text-inherit">
            Reintentar
          </Button>
        </div>
      )}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
          <h2 className="text-sm font-semibold">
            Eventos{" "}
            <span className="ml-1 font-normal tabular-nums text-muted-foreground">
              ({events.length})
            </span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Buscar eventos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o lugar"
              className="pl-9"
            />
          </div>
        </div>
        {loading ? (
          <div role="status" className="space-y-5 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
            <span className="sr-only">Cargando eventos</span>
          </div>
        ) : filtered.length ? (
          <div className="divide-y">
            {filtered.map((event) => (
              <article
                key={event._id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"
              >
                <div className="min-w-0 flex-1 basis-64">
                  <div className="flex flex-wrap items-center gap-2">
                    {event.archivadoAt ? (
                      <span className="break-words font-semibold text-foreground">
                        {event.titulo}
                      </span>
                    ) : (
                      <Link
                        href={`/panel/eventos/${event._id}`}
                        className="break-words font-semibold text-foreground underline-offset-4 hover:underline"
                      >
                        {event.titulo}
                      </Link>
                    )}
                    <Badge
                      variant={
                        event.estado === "publicado" && event.inscripcionAbierta
                          ? "default"
                          : "secondary"
                      }
                    >
                      {event.archivadoAt
                        ? "Archivado"
                        : EVENT_STATES[event.estado] || event.estado}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatEventDate(event.fechaInicio)}
                    </span>
                    <span>{venueSummary(event)}</span>
                    <span className="tabular-nums">
                      {event.totalInscripciones || 0} inscripciones
                      {event.cupo ? ` / ${event.cupo} cupos` : ""}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Creado por {event.creador?.nombre || "Cuenta no disponible"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {event.puedeTomarAsistencia && <Link href={`/panel/eventos/${event._id}/checkin`} className={buttonVariants({ size: "sm" })}>Tomar asistencia</Link>}
                  {!event.archivadoAt && (
                    <Link
                      href={`/panel/eventos/${event._id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Gestionar
                      <ArrowRight />
                    </Link>
                  )}
                  {permissions.canDeleteEvents && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${event.titulo}`}
                      title="Eliminar evento"
                      onClick={() => setDeleteTarget(event)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
            <FileText
              className="mb-4 size-9 text-muted-foreground"
              strokeWidth={1.5}
            />
            <h3 className="text-base font-semibold">
              {query
                ? "No encontramos ese evento"
                : "Tu próximo evento empieza aquí"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {query
                ? "Prueba otro nombre o elimina la búsqueda."
                : "Crea el evento, prepara sus preguntas y comparte un único enlace de inscripción."}
            </p>
            {(query || permissions.canManageEvents) && <Button
              variant="outline"
              className="mt-5"
              onClick={() => (query ? setQuery("") : setOpen(true))}
            >
              {query ? "Limpiar búsqueda" : "Crear mi primer evento"}
            </Button>}
          </div>
        )}
      </section>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!saving) setOpen(next);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear evento</DialogTitle>
            <DialogDescription>
              Empieza con los datos del encuentro. Después podrás construir y
              publicar su formulario.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <EventSettings
            onSave={createEvent}
            saving={saving}
            create
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <AdminConfirm
        show={Boolean(deleteTarget)}
        title="Eliminar evento definitivamente"
        message="Se borrarán el evento, su formulario, inscripciones y QR. Solo se conservarán las fichas de participantes vinculados a otros eventos. Esta acción no se puede deshacer. Si existe una hoja de Google, se conserva por separado."
        confirmText={deleting ? "Eliminando…" : "Eliminar definitivamente"}
        type="error"
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await panelApi(`/api/eventos/${deleteTarget._id}`, {
              method: "DELETE",
              body: { confirmacion: deleteTarget._id },
            });
            setDeleteTarget(null);
            await load();
          } catch (failure) {
            setError(failure.message);
            setDeleteTarget(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
