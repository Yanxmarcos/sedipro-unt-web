"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck,
  UsersRound,
  Vote,
  RefreshCw,
  ArrowUpRight,
  CirclePercent,
  ChartNoAxesCombined,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "@/components/admin/form-controls";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { AREA_TEXT_CLASSES } from "@/lib/member-areas.mjs";
import { panelApi } from "@/lib/panel-api";
import ManagementActivity from "@/components/admin/management-activity";
const AREAS = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT", "DIRECTIVA"];
const number = (value) => new Intl.NumberFormat("es-PE").format(value || 0);
const percentage = (value) =>
  value == null
    ? "—"
    : `${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(value)} %`;
function initialFilters() {
  const date = new Date();
  return {
    periodo: "year",
    year: String(
      Math.min(
        2027,
        Math.max(
          2026,
          Number(
            new Intl.DateTimeFormat("en", {
              year: "numeric",
              timeZone: "America/Lima",
            }).format(date),
          ),
        ),
      ),
    ),
    month: new Intl.DateTimeFormat("en", {
      month: "2-digit",
      timeZone: "America/Lima",
    }).format(date),
    area: "",
  };
}
function MetricLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
    >
      {children}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
export default function OrdersDashboard() {
  const [filters, setFilters] = useState(initialFilters),
    [stats, setStats] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const version = useRef(0);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    try {
      const result = await panelApi(
        `/api/dashboard?${new URLSearchParams(filters)}`,
      );
      if (current === version.current) {
        setStats(result);
        setError("");
      }
    } catch (failure) {
      if (current === version.current) {
        setStats(null);
        setError(failure.message);
      }
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    const counter = version;
    load();
    return () => {
      ++counter.current;
    };
  }, [load]);
  const change = (key, value) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const attendance = stats?.asistencia,
    voting = stats?.votaciones;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Resumen de gestión
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comunidad, participación interna y operación de SEDIPRO UNT.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} /> Actualizar
        </Button>
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Filtros del resumen"
      >
        <div className="space-y-1.5">
          <Label htmlFor="summary-period">Período</Label>
          <AdminSelect
            id="summary-period"
            value={filters.periodo}
            onChange={(event) => change("periodo", event.target.value)}
          >
            <option value="year">Gestión anual</option>
            <option value="month">Mes</option>
            <option value="all">Histórico</option>
          </AdminSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="summary-year">Año</Label>
          <AdminSelect
            id="summary-year"
            value={filters.year}
            disabled={filters.periodo === "all"}
            onChange={(event) => change("year", event.target.value)}
          >
            {[2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </AdminSelect>
        </div>
        {filters.periodo === "month" && (
          <div className="space-y-1.5">
            <Label htmlFor="summary-month">Mes</Label>
            <AdminSelect
              id="summary-month"
              value={filters.month}
              onChange={(event) => change("month", event.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {new Date(2026, i, 1).toLocaleDateString("es-PE", {
                    month: "long",
                  })}
                </option>
              ))}
            </AdminSelect>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="summary-area">Área · participación interna</Label>
          <AdminSelect
            id="summary-area"
            value={filters.area}
            onChange={(event) => change("area", event.target.value)}
          >
            <option value="">Todo SEDIPRO</option>
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>
      {error && <PageError message={error} onRetry={load} />}
      {loading ? (
        <PageLoading label="Calculando indicadores…" />
      ) : (
        stats && (
          <>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  label: "Sedipranos activos",
                  value: number(stats.comunidad.total),
                  detail: "Comunidad actual · todas las áreas",
                  icon: UsersRound,
                  href: "/panel/sedipranos",
                },
                {
                  label: "Asistencia del período",
                  value: percentage(attendance.porcentaje),
                  detail: `${number(attendance.sesiones)} sesiones consideradas`,
                  icon: CalendarCheck,
                  href: "/panel/asistencias",
                },
                {
                  label: "Votaciones activas",
                  value: number(voting.activas),
                  detail: `${number(voting.votos)} votos válidos en el período`,
                  icon: Vote,
                  href: "/panel/votaciones",
                },
              ].map(({ label, value, detail, icon: Icon, href }) => (
                <Card key={label}>
                  <CardHeader className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-2xl font-medium tabular-nums">
                      {value}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h2 className="font-semibold">{label}</h2>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                    <MetricLink href={href}>Ver detalle</MetricLink>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Comunidad SEDIPRO</h2>
                    <p className="text-sm text-muted-foreground">
                      Integrantes activos por área · estado actual
                    </p>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    {stats.comunidad.areas.map((row) => (
                      <button
                        key={row.area}
                        onClick={() =>
                          change(
                            "area",
                            filters.area === row.area ? "" : row.area,
                          )
                        }
                        aria-pressed={filters.area === row.area}
                        className={`flex min-h-10 items-center justify-between gap-2 rounded-full border px-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring ${AREA_TEXT_CLASSES[row.area] || ""} ${filters.area === row.area ? "bg-muted" : ""}`}
                      >
                        <span>{row.area}</span>
                        <span className="tabular-nums">{row.total}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
                <Card className="justify-between">
                  <CardHeader>
                    <h2 className="text-lg font-semibold">
                      Participación en votaciones
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Votos emitidos por personas habilitadas
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-semibold tabular-nums">
                      {percentage(voting.porcentaje)}
                    </p>
                    <Progress
                      className="w-full"
                      value={voting.porcentaje || 0}
                      max="100"
                      aria-label="Participación electoral"
                    />
                    <p className="text-sm text-muted-foreground">
                      {voting.votos} votos de {voting.habilitados} oportunidades
                      de voto.
                    </p>
                    <MetricLink href="/panel/votaciones">
                      Revisar votaciones
                    </MetricLink>
                  </CardContent>
                </Card>
              </div>
              <Card className="xl:col-span-2">
                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-5">
                    <div className="space-y-6 lg:col-span-3">
                      <h2 className="text-lg font-semibold">
                        Métricas de asistencia
                      </h2>
                      <div className="flex items-center gap-3">
                        <Image
                          src="/logos/isotipo.webp"
                          alt="SEDIPRO UNT"
                          width={40}
                          height={40}
                          className="size-10 object-contain"
                        />
                        <div>
                          <p className="text-xl font-medium">
                            Participación interna
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {attendance.convocatorias} convocatorias ·{" "}
                            {attendance.sesiones} sesiones
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ["Presentes", attendance.presente],
                          ["Tardanzas", attendance.tardanza],
                          ["Justificados", attendance.justificado],
                          ["Ausentes", attendance.ausente],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border px-4 py-3"
                          >
                            <p className="text-sm text-muted-foreground">
                              {label}
                            </p>
                            <p className="mt-1 text-xl font-semibold tabular-nums">
                              {number(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {attendance.enRegistro} en registro · fuera del
                          cálculo
                        </Badge>
                        <Badge variant="outline">
                          Puntualidad {percentage(attendance.puntualidad)}
                        </Badge>
                        {attendance.historicas > 0 && (
                          <Badge variant="outline">
                            {attendance.historicas} históricas incluidas
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border p-5 lg:col-span-2">
                      <h3 className="self-start text-lg font-semibold">
                        Asistencia efectiva
                      </h3>
                      <div className="relative size-40">
                        <svg
                          viewBox="0 0 160 160"
                          className="size-full -rotate-90"
                          aria-hidden="true"
                        >
                          <circle
                            cx="80"
                            cy="80"
                            r="65"
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="16"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="65"
                            fill="none"
                            stroke="var(--foreground)"
                            strokeWidth="16"
                            pathLength="100"
                            strokeDasharray={`${attendance.porcentaje || 0} 100`}
                          />
                        </svg>
                        <p className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tabular-nums">
                          {percentage(attendance.porcentaje)}
                        </p>
                      </div>
                      <p className="text-center text-xs leading-5 text-muted-foreground">
                        Presentes + tardanzas sobre las convocatorias de las
                        sesiones consideradas.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          Evolución de asistencia
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Porcentaje mensual ponderado por convocatorias
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm">
                        <ChartNoAxesCombined className="size-4" />
                        {attendance.variacion == null
                          ? "Sin período comparable"
                          : `${attendance.variacion > 0 ? "+" : ""}${attendance.variacion} puntos porcentuales frente al período anterior`}
                      </span>
                    </div>
                    {stats.evolucion.length ? (
                      <div className="overflow-x-auto">
                        <div
                          className="mt-5 flex h-32 items-end gap-3"
                          style={{ minWidth: stats.evolucion.length * 36 }}
                          role="img"
                          aria-label="Evolución mensual de asistencia"
                        >
                          {stats.evolucion.map((row) => (
                            <div
                              key={row.month}
                              className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center"
                              title={`${row.month}: ${percentage(row.porcentaje)} · ${row.asistentes}/${row.convocatorias}`}
                            >
                              <span className="text-xs tabular-nums">
                                {Math.round(row.porcentaje || 0)}%
                              </span>
                              <div
                                className="mx-auto w-full max-w-12 rounded-sm bg-primary/60"
                                style={{
                                  height: `${(row.porcentaje || 0) * 0.8}px`,
                                }}
                              />
                              <span className="truncate text-xs text-muted-foreground">
                                <span className="sm:hidden">
                                  {row.month.slice(5)}
                                </span>
                                <span className="hidden sm:inline">
                                  {row.month.slice(5)}/{row.month.slice(2, 4)}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No hay sesiones finalizadas en este período.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {attendance.areas
                      .filter(
                        (row) => !filters.area || row.area === filters.area,
                      )
                      .map((row) => (
                        <Badge
                          key={row.area}
                          variant="outline"
                          className={`h-auto justify-between gap-3 px-3 py-2 ${AREA_TEXT_CLASSES[row.area] || ""}`}
                        >
                          <span>{row.area}</span>
                          <span>
                            {percentage(row.porcentaje)} · {row.asistentes}/
                            {row.convocatorias}
                          </span>
                        </Badge>
                      ))}
                  </div>
                  {attendance.areasActualesEnHistoricos > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Las sesiones antiguas sin área guardada usan el área
                      actual del padrón. No se reconstruye su área histórica.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">
                    Eventos · participantes externos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Período seleccionado · independiente de la participación
                    interna
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {stats.externos.eventos} eventos
                    </Badge>
                    <Badge variant="outline">
                      {stats.externos.inscritos} inscripciones vigentes
                    </Badge>
                    <Badge variant="outline">
                      {stats.externos.asistentes} asistencias
                    </Badge>
                  </div>
                  {stats.externos.proximos.map((event) => (
                    <Link
                      key={event.id}
                      href={`/panel/eventos/${event.id}`}
                      className="block truncate text-sm hover:underline"
                    >
                      {event.titulo}
                    </Link>
                  ))}
                  <MetricLink href="/panel/eventos">
                    Gestionar eventos
                  </MetricLink>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">
                    Herramientas y seguimiento
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {stats.herramientas.enlacesActivos} enlaces activos ·
                      actual
                    </Badge>
                    <Badge variant="outline">
                      {stats.herramientas.descargasCertificados} descargas
                      iniciadas · período
                    </Badge>
                    <Badge variant="outline">
                      {stats.herramientas.certificadosGenerados} certificados
                      generados · período
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <MetricLink href="/panel/enlaces">Enlaces</MetricLink>
                    <MetricLink href="/panel/certificados">
                      Certificados
                    </MetricLink>
                  </div>
                  {stats.pendientes.asistenciasSinEncargado > 0 && (
                    <Link
                      href="/panel/asistencias"
                      className="inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <CirclePercent className="size-4" />
                      {stats.pendientes.asistenciasSinEncargado} asistencias en
                      registro sin encargado
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
      <ManagementActivity />
    </div>
  );
}
