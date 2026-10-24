"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  QrCode,
  Send,
  UsersRound,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminConfirm } from "@/components/admin/form-controls";
import { panelApi } from "@/lib/panel-api";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { createDefaultForm } from "@/lib/event-form.mjs";
import { venueSummary } from "@/lib/event-location.mjs";
import {
  EventSettings,
  EVENT_STATES,
  formatEventDate,
} from "@/components/event-forms-admin/event-settings";
import { FormBuilder } from "@/components/event-forms-admin/form-builder";
import { Registrations } from "@/components/event-forms-admin/registrations";
import { Integrations } from "@/components/event-forms-admin/integrations";
import { usePanelSession } from "@/components/admin/panel-session";
import { EventReadOnly } from "@/components/event-forms-admin/event-read-only";
import { EventAttendance } from "@/components/event-forms-admin/attendance";
import { EventAudit } from "@/components/event-forms-admin/audit";

export default function GestionEventoPage() {
  const { permissions } = usePanelSession();
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState("");
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState("formulario");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);
  const [origin, setOrigin] = useState("");
  const [settingsDirty, setSettingsDirty] = useState(false);
  const formDirty = Boolean(form && JSON.stringify(form) !== saved);
  const dirty = formDirty || settingsDirty;
  const dirtyRef = useRef(false);
  const allowLeave = useRef(false);
  dirtyRef.current = dirty;

  const load = useCallback(async () => {
    try {
      const result = await panelApi(`/api/eventos/${id}`);
      const data = result.data;
      const draft = data.formulario?.draft || createDefaultForm();
      setEvent(data);
      setForm(draft);
      setSaved(JSON.stringify(draft));
      setRevision(data.formulario?.revision || 0);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
    setOrigin(window.location.origin);
  }, [load]);
  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirtyRef.current && !allowLeave.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const leave = (e) => {
      if (
        !dirtyRef.current ||
        allowLeave.current ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = e.target.closest?.("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.href);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", leave, true);
    };
  }, []);

  async function saveDraft(definition) {
    setBusy("draft");
    setNotice("");
    setError("");
    try {
      const result = await panelApi(`/api/eventos/${id}/formulario`, {
        method: "PATCH",
        body: { form: definition, revision },
      });
      const data = result.data;
      setForm(data.draft);
      setSaved(JSON.stringify(data.draft));
      setRevision(data.revision);
      setEvent((current) => ({ ...current, formulario: data }));
      setNotice("Borrador guardado. La versión pública no cambió.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy("");
    }
  }
  async function patch(values) {
    setBusy("settings");
    setNotice("");
    setError("");
    try {
      const result = await panelApi(`/api/eventos/${id}`, {
        method: "PATCH",
        body: values,
      });
      setEvent((current) => ({
        ...current,
        ...result.data,
        formulario: current.formulario,
      }));
      setNotice("Configuración guardada.");
      setSettingsDirty(false);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy("");
    }
  }
  async function publish() {
    if (dirty || busy) return;
    setBusy("publish");
    setError("");
    setNotice("");
    try {
      const result = await panelApi(`/api/eventos/${id}/publicar`, {
        method: "POST",
        body: { revision },
      });
      setEvent((current) => ({ ...current, ...result.data }));
      if (result.data.formulario) {
        setRevision(result.data.formulario.revision);
        setSaved(JSON.stringify(result.data.formulario.draft));
        setForm(result.data.formulario.draft);
      } else {
        await load();
      }
      setNotice(
        "Formulario publicado. Ya puedes compartir el enlace de inscripción.",
      );
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy("");
      setPublishConfirm(false);
    }
  }
  async function updateCounts() {
    try {
      const result = await panelApi(`/api/eventos/${id}`);
      setEvent((current) => ({
        ...current,
        totalInscripciones: result.data.totalInscripciones,
        inscritos: result.data.inscritos,
      }));
    } catch (failure) {
      setError(failure.message);
    }
  }

  async function copyPublicLink() {
    setError("");
    setNotice("");
    const copied = await copyToClipboard(`${window.location.origin}/eventos/${event.slug}`);
    if (copied) setNotice("Enlace del formulario copiado. Ya puedes compartirlo.");
    else setError("No se pudo copiar. Abre el formulario y copia su dirección.");
  }

  if (loading)
    return (
      <div role="status" className="space-y-6">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
        <span className="sr-only">Cargando evento</span>
      </div>
    );
  if (!event || !form)
    return (
      <div className="space-y-4">
        <Link
          href="/panel/eventos"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft />
          Volver a eventos
        </Link>
        <p role="alert" className="text-sm text-destructive">
          {error || "No encontramos este evento."}
        </p>
        <Button variant="outline" onClick={load}>
          Reintentar
        </Button>
      </div>
    );
  if (!permissions.canManageEvents) return <EventReadOnly event={event} />;
  const publicUrl = `${origin}/eventos/${event.slug}`;
  const published = Boolean(event.formulario?.version);
  const publicVersion = event.formulario?.version || 0;

  return (
    <div className="space-y-6">
      <Link
        href="/panel/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        Todos los eventos
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-64">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">
              {event.titulo}
            </h1>
            <Badge
              variant={
                event.estado === "publicado" && event.inscripcionAbierta
                  ? "default"
                  : "secondary"
              }
            >
              {EVENT_STATES[event.estado] || event.estado}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatEventDate(event.fechaInicio)} · {venueSummary(event)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Creado por {event.creador?.nombre || "Cuenta no disponible"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {published && (
            <>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink />
              Ver formulario
            </a>
            <Button variant="outline" onClick={copyPublicLink}>
              <Copy />
              Copiar enlace
            </Button>
            </>
          )}
          <Button
            onClick={() => setPublishConfirm(true)}
            disabled={dirty || Boolean(busy)}
            title={
              dirty ? "Guarda primero los cambios del borrador" : undefined
            }
          >
            <Send />
            {busy === "publish"
              ? "Publicando…"
              : published
                ? "Publicar cambios"
                : "Publicar formulario"}
          </Button>
        </div>
      </header>
      {dirty && (
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Tienes cambios sin guardar. Guarda el borrador o la configuración
          antes de publicar.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg bg-muted px-4 py-3 text-sm"
        >
          <Check className="mt-0.5 size-4 shrink-0" />
          {notice}
        </p>
      )}
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          if (value === "inscripciones" || value === "resumen") updateCounts();
        }}
        className="min-w-0 flex-col gap-6 [&>[data-slot=tabs-content]]:min-w-0"
      >
        <div className="overflow-x-auto border-b">
          <TabsList variant="line" className="min-w-max pb-2">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="formulario">Formulario</TabsTrigger>
            <TabsTrigger value="inscripciones">
              Inscripciones
              <span className="ml-1 rounded bg-muted px-1.5 text-xs tabular-nums">
                {event.totalInscripciones || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
            {permissions.canViewEventAudit && <TabsTrigger value="historial">Historial</TabsTrigger>}
          </TabsList>
        </div>
        <TabsContent value="asistencia"><EventAttendance id={id} /></TabsContent>
        {permissions.canViewEventAudit && <TabsContent value="historial"><EventAudit eventId={id} /></TabsContent>}
        <TabsContent value="resumen" keepMounted className="space-y-8">
          <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div>
              <h2 className="text-base font-semibold">Datos del evento</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                La información que acompaña al formulario y ayuda a tus
                participantes a prepararse.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <EventSettings
                key={event._id}
                event={event}
                onSave={patch}
                saving={busy === "settings"}
                onEdit={() => setSettingsDirty(true)}
              />
            </div>
          </section>
          <section className="grid gap-6 border-t pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div>
              <h2 className="text-base font-semibold">
                Enlace e inscripciones
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Comparte la versión publicada y decide cuándo aceptar nuevas
                respuestas.
              </p>
            </div>
            <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <UsersRound className="size-4" />
                  {event.totalInscripciones || 0} inscripciones
                </span>
                <span className="text-muted-foreground">
                  {event.cupo
                    ? `${event.cupo} cupos en total`
                    : "Sin límite de cupos"}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <QrCode className="size-4" />
                  QR {event.qrHabilitado ? "activado" : "desactivado"}
                </span>
              </div>
              {published ? (
                <>
                  <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                    <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 flex-1 break-all text-sm">
                      {publicUrl}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Copiar enlace público"
                      onClick={copyPublicLink}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      patch({
                        inscripcionAbierta: !event.inscripcionAbierta,
                        estado: event.inscripcionAbierta
                          ? "cerrado"
                          : "publicado",
                      })
                    }
                  >
                    {event.inscripcionAbierta
                      ? "Cerrar inscripciones"
                      : "Abrir inscripciones"}
                  </Button>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Cerrar inscripciones conserva las respuestas y permite
                    recuperar las confirmaciones vigentes.
                  </p>
                </>
              ) : (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FileText className="mt-0.5 size-4 shrink-0" />
                  Primero publica el formulario para habilitar su enlace.
                </p>
              )}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="formulario" keepMounted>
          <FormBuilder
            form={form}
            onChange={(next) => {
              if (!busy) setForm(next);
            }}
            dirty={formDirty}
            saving={busy === "draft"}
            onSave={saveDraft}
            version={publicVersion}
            qrEnabled={event.qrHabilitado}
          />
        </TabsContent>
        <TabsContent value="inscripciones">
          <Registrations event={event} onCountChange={updateCounts} canCancel={permissions.canManage} />
        </TabsContent>
        <TabsContent value="integraciones">
          <Integrations eventId={id} />
        </TabsContent>
      </Tabs>
      <AdminConfirm
        show={publishConfirm}
        title={published ? "Publicar una nueva versión" : "Publicar formulario"}
        message={
          published
            ? "Se publicará el último borrador guardado y se abrirán las inscripciones. Las respuestas anteriores conservarán su versión original."
            : "El formulario estará disponible mediante un enlace público. Las fechas de apertura y cierre configuradas se respetarán."
        }
        confirmText={busy === "publish" ? "Publicando…" : "Publicar y abrir"}
        onConfirm={publish}
        onCancel={() => {
          if (!busy) setPublishConfirm(false);
        }}
      />
      <AdminConfirm
        show={Boolean(pendingHref)}
        title="Tienes cambios sin guardar"
        message="Si sales ahora, se perderán los cambios del borrador que todavía no guardaste."
        confirmText="Salir sin guardar"
        cancelText="Seguir editando"
        onCancel={() => setPendingHref(null)}
        onConfirm={() => {
          const href = pendingHref;
          allowLeave.current = true;
          dirtyRef.current = false;
          setPendingHref(null);
          router.push(href);
        }}
      />
    </div>
  );
}
