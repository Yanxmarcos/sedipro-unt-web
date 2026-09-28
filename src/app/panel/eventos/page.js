"use client";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AdminCheckbox } from "@/components/admin/form-controls";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AdminConfirm } from "@/components/admin/form-controls";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
const input = "mt-1 w-full outline-none";
const initial = {
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  lugar: "",
  cupo: "",
  estado: "borrador",
  inscripcionAbierta: false,
};
export default function EventosPage() {
  const { permissions } = usePanelSession();
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(
    () =>
      fetch("/api/eventos")
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setEvents(d.data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  const set = (key, value) =>
    setForm((x) => ({
      ...x,
      [key]: value,
    }));
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setForm(initial);
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            Inscripciones externas, QR y control presencial.
          </p>
        </div>
        <Button
          onClick={() => setOpen((x) => !x)}
          type="button"
          variant="default"
        >
          {open ? "Cancelar" : "+ Crear evento"}
        </Button>
      </div>
      {error && (
        <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {open && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border bg-card p-6 shadow-xs space-y-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Nuevo evento</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Label className="text-sm font-medium grid gap-2">
              Título
              <Input
                required
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                className={cn(input, "")}
              />
            </Label>
            <Label className="text-sm font-medium grid gap-2">
              Lugar
              <Input
                value={form.lugar}
                onChange={(e) => set("lugar", e.target.value)}
                className={cn(input, "")}
              />
            </Label>
            <Label className="text-sm font-medium grid gap-2">
              Inicio
              <Input
                required
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) => set("fechaInicio", e.target.value)}
                className={cn(input, "")}
              />
            </Label>
            <Label className="text-sm font-medium grid gap-2">
              Fin
              <Input
                type="datetime-local"
                value={form.fechaFin}
                onChange={(e) => set("fechaFin", e.target.value)}
                className={cn(input, "")}
              />
            </Label>
            <Label className="text-sm font-medium grid gap-2">
              Cupo{" "}
              <span className="font-normal text-muted-foreground">
                vacío = ilimitado
              </span>
              <Input
                min="1"
                type="number"
                value={form.cupo}
                onChange={(e) => set("cupo", e.target.value)}
                className={cn(input, "")}
              />
            </Label>
            <Label className="flex items-center gap-2 pt-6 text-sm">
              <AdminCheckbox
                checked={form.inscripcionAbierta}
                onChange={(e) => set("inscripcionAbierta", e.target.checked)}
              />
              Abrir inscripción al publicarlo
            </Label>
          </div>
          <Label className="mt-4 text-sm font-medium grid gap-2">
            Descripción
            <Textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              className={cn(input, "")}
            />
          </Label>
          <Button
            disabled={saving}
            type="submit"
            variant="default"
            className="mt-4 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear borrador"}
          </Button>
        </form>
      )}
      <div className="overflow-hidden rounded-xl border bg-muted shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground">
            Cargando eventos…
          </p>
        ) : events.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">
            Aún no hay eventos.
          </p>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <article
                key={event._id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-foreground text-lg font-semibold">
                      {event.titulo}
                    </h2>
                    <Badge variant="secondary" className="">
                      {event.estado}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(event.fechaInicio).toLocaleString("es-PE")} ·{" "}
                    {event.lugar || "Sin lugar"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.totalInscripciones} inscritos ·{" "}
                    {event.totalAsistencias} presentes
                    {event.cupo ? ` · cupo ${event.cupo}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/panel/eventos/${event._id}`}
                    className={buttonVariants({
                      variant: "outline",
                    })}
                  >
                    Gestionar
                  </Link>
                  {permissions.canDelete && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      title="Eliminar"
                      aria-label={"Eliminar " + event.titulo}
                      onClick={() => setArchiveTarget(event)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <AdminConfirm
        show={Boolean(archiveTarget)}
        title="Eliminar evento"
        message="El evento dejará de estar disponible. Sus inscripciones y asistencias se conservan en el historial."
        confirmText={archiving ? "Eliminando…" : "Eliminar"}
        type="error"
        onCancel={() => {
          if (!archiving) setArchiveTarget(null);
        }}
        onConfirm={async () => {
          if (archiving) return;
          setArchiving(true);
          setError("");
          try {
            await panelApi("/api/eventos/" + archiveTarget._id, {
              method: "DELETE",
            });
            setArchiveTarget(null);
            await load();
          } catch (failure) {
            setError(failure.message);
            setArchiveTarget(null);
          } finally {
            setArchiving(false);
          }
        }}
      />
    </div>
  );
}
