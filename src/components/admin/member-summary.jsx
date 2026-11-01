"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  ClipboardCheck,
  Link2,
  Mail,
  RefreshCw,
  UserRound,
  Vote,
} from "lucide-react";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { AREA_TEXT_CLASSES } from "@/lib/member-areas.mjs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { CopyLink, StateBadge } from "@/components/admin/enlaces/link-shared";
import { LinkForm } from "@/components/admin/enlaces/link-form";

const date = (value) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
const tools = [
  ["Crear enlace", "Comparte una URL institucional", "/panel/enlaces", Link2],
  [
    "Generar certificado",
    "Prepara un certificado",
    "/panel/certificados",
    Award,
  ],
  [
    "Gestionar eventos",
    "Organiza eventos y formularios",
    "/panel/eventos",
    CalendarDays,
  ],
  [
    "Suscripciones",
    "Consulta las comunicaciones",
    "/panel/eventos/comunicaciones",
    Mail,
  ],
];

export default function MemberSummary() {
  const {
    user,
    assignments,
    assignmentsError,
    refresh: refreshSession,
  } = usePanelSession();
  const [summary, setSummary] = useState(null);
  const [votes, setVotes] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);
  const [retry, setRetry] = useState(0);
  function refresh() {
    setLoading(true);
    setRetry((value) => value + 1);
  }
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    Promise.allSettled([
      panelApi("/api/mi/resumen", { signal }),
      panelApi("/api/mi/votaciones", { signal }),
    ]).then((results) => {
      if (signal.aborted) return;
      const failures = {};
      if (results[0].status === "fulfilled") setSummary(results[0].value.data);
      else failures.summary = results[0].reason.message;
      if (results[1].status === "fulfilled") setVotes(results[1].value.data);
      else failures.votes = results[1].reason.message;
      setErrors(failures);
      setLoading(false);
    });
    return () => controller.abort();
  }, [retry, user?.id]);
  const pending = (votes || []).filter((vote) => vote.eligible && !vote.yaVoto);
  const otherVotes = (votes || []).filter(
    (vote) => !vote.eligible || vote.yaVoto,
  );
  const firstName = (summary?.perfil.nombres || user?.nombres || "")
    .trim()
    .split(/\s+/)[0]
    .toLocaleLowerCase("es-PE");
  const name =
    firstName.charAt(0).toLocaleUpperCase("es-PE") + firstName.slice(1);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {name}
            {summary?.perfil.area && (
              <span>
                {", miembro del área de "}
                <span
                  className={
                    AREA_TEXT_CLASSES[
                      summary.perfil.area.trim().toUpperCase()
                    ] || ""
                  }
                >
                  {summary.perfil.area}
                </span>
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu espacio de trabajo en SEDIPRO UNT.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/panel/perfil"
            className={buttonVariants({ variant: "outline" })}
          >
            <UserRound /> Mi perfil
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar resumen"
            disabled={loading}
            onClick={() => refresh()}
          >
            <RefreshCw />
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Para atender</CardTitle>
              <CardDescription>
                Tu participación y las asistencias que tienes a cargo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && votes === null ? (
                <PageLoading label="Consultando votaciones…" />
              ) : errors.votes ? (
                <PageError message={errors.votes} onRetry={() => refresh()} />
              ) : (
                <>
                  {pending.map((vote) => (
                    <div
                      key={vote._id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <Vote className="size-4 shrink-0" /> Votación
                          pendiente
                        </p>
                        <p className="mt-1 break-words text-sm">
                          {vote.titulo}
                        </p>
                        {vote.fechaCierre && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cierra: {date(vote.fechaCierre)}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/panel/votaciones/votar"
                        className={buttonVariants({ size: "sm" })}
                      >
                        Participar <ArrowRight />
                      </Link>
                    </div>
                  ))}
                  {otherVotes.map((vote) => (
                    <div key={vote._id} className="space-y-1 text-sm">
                      <p className="break-words font-medium">{vote.titulo}</p>
                      <Badge variant="secondary">
                        {vote.yaVoto
                          ? "Voto registrado"
                          : "Participación no habilitada"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {vote.yaVoto
                          ? "Tu participación ya está registrada."
                          : vote.motivo}
                      </p>
                    </div>
                  ))}
                  {votes?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay votaciones abiertas en este momento.
                    </p>
                  )}
                </>
              )}
              {assignmentsError ? (
                <PageError
                  message={assignmentsError}
                  onRetry={refreshSession}
                />
              ) : assignments.length > 0 ? (
                <div className="space-y-3 border-t pt-4">
                  <h2 className="flex items-center gap-2 text-sm font-medium">
                    <ClipboardCheck className="size-4" /> Asistencias a tu cargo
                  </h2>
                  {assignments.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm">
                          {item.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date(item.fecha)}
                        </p>
                      </div>
                      <Link
                        href={`/panel/asistencias/tomar/${item._id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Tomar asistencia
                      </Link>
                    </div>
                  ))}
                  <Link
                    href="/panel/asistencias/tomar"
                    className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                  >
                    Ver mis asignaciones <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <p className="border-t pt-4 text-sm text-muted-foreground">
                  No tienes asistencias asignadas como encargado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos eventos</CardTitle>
              <CardDescription>
                Eventos publicados, ordenados por su fecha de inicio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !summary ? (
                <PageLoading />
              ) : errors.summary ? (
                <PageError message={errors.summary} onRetry={() => refresh()} />
              ) : summary?.eventos.length ? (
                <ul className="divide-y">
                  {summary.eventos.map((event) => (
                    <li
                      key={event._id}
                      className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          {date(event.fechaInicio)}
                        </p>
                        <h3 className="mt-1 break-words font-medium">
                          {event.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            {
                              presencial: "Presencial",
                              virtual: "Virtual",
                              hibrido: "Híbrido",
                            }[event.modalidad]
                          }
                          {event.lugar ? ` · ${event.lugar}` : ""}
                        </p>
                      </div>
                      <Link
                        href={`/panel/eventos/${event._id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Ver evento <ArrowRight />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay próximos eventos publicados.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Herramientas</CardTitle>
              <CardDescription>Accesos para tu trabajo diario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {tools.map(([label, detail, href, Icon]) => (
                <ToolAction
                  key={href}
                  href={href}
                  onCreate={() => setCreatingLink(true)}
                  className="flex min-h-16 w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0" />
                </ToolAction>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enlaces que creaste</CardTitle>
              <CardDescription>
                Tus tres enlaces más recientes. La biblioteca es compartida.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && !summary ? (
                <PageLoading />
              ) : errors.summary ? (
                <p className="text-sm text-muted-foreground">
                  No se pudieron consultar los enlaces recientes.
                </p>
              ) : summary?.enlaces.length ? (
                <ul className="divide-y">
                  {summary.enlaces.map((link) => (
                    <li key={link._id} className="space-y-2 py-3 first:pt-0">
                      <p className="break-words text-sm font-medium">
                        {link.titulo}
                      </p>
                      <p className="select-all break-all text-xs text-muted-foreground">
                        {link.urlCorta}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CopyLink
                          url={link.urlCorta}
                          title={link.titulo}
                          text
                        />
                        <StateBadge state={link.estadoEfectivo} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todavía no has creado enlaces.
                </p>
              )}
              <Link
                href="/panel/enlaces"
                className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
              >
                Abrir biblioteca <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      {creatingLink && (
        <LinkForm
          link={null}
          onClose={() => setCreatingLink(false)}
          onSaved={(_row, close) => {
            if (close) setCreatingLink(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ToolAction({ href, onCreate, ...props }) {
  return href === "/panel/enlaces" ? (
    <button type="button" onClick={onCreate} {...props} />
  ) : (
    <Link href={href} {...props} />
  );
}
