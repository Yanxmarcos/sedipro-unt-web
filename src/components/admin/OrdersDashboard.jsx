"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  UsersRound,
  Vote,
  ShieldUser,
  ChartNoAxesCombined,
  CirclePercent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const metrics = [
  {
    key: "sedipranos",
    label: "Sedipranos",
    detail: "Miembros registrados",
    icon: UsersRound,
  },
  {
    key: "asistencias",
    label: "Asistencias",
    detail: "Sesiones registradas",
    icon: CalendarCheck,
  },
  {
    key: "votaciones",
    label: "Votaciones",
    detail: "Procesos creados",
    icon: Vote,
  },
  {
    key: "usuarios",
    label: "Usuarios",
    detail: "Accesos al sistema",
    icon: ShieldUser,
  },
];

export default function OrdersDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error || data.message || "No se pudieron cargar los datos",
          );
        setStats(data);
      })
      .catch((failure) => {
        if (failure.name !== "AbortError") setError(failure.message);
      });
    return () => controller.abort();
  }, []);

  function value(key) {
    if (error) return "—";
    return stats ? (
      new Intl.NumberFormat("es-PE").format(stats[key] ?? 0)
    ) : (
      <Skeleton className="h-7 w-16" />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
      {error && (
        <p role="alert" className="text-destructive col-span-full text-sm">
          {error}
        </p>
      )}
      <div className="col-span-full grid gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1">
        {metrics.slice(0, 3).map(({ key, label, detail, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm">
                <Icon className="size-4" />
              </div>
              <span className="text-2xl">{value(key)}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="text-base font-semibold">{label}</span>
              <p className="text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2">
        <Card className="justify-between gap-3 *:data-[slot=card-content]:space-y-5">
          <CardHeader className="flex justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold">Comunidad SEDIPRO</span>
              <span className="text-muted-foreground text-sm">
                Miembros y accesos
              </span>
            </div>
            <Avatar className="size-14 rounded-md">
              <AvatarFallback className="bg-primary/10 text-primary rounded-md">
                <UsersRound />
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <Separator />
          </CardContent>
          <CardContent className="space-y-4">
            {metrics
              .filter(({ key }) => ["sedipranos", "usuarios"].includes(key))
              .map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-1"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">{label}</span>
                    <span className="text-2xl font-semibold">{value(key)}</span>
                  </div>
                  <Icon className="text-muted-foreground size-8" />
                </div>
              ))}
          </CardContent>
        </Card>
        <Card className="justify-between gap-5 sm:min-w-0">
          <CardContent className="flex flex-col gap-6">
            <span className="text-lg font-semibold">Participación</span>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-semibold">—</span>
              <span className="text-muted-foreground text-sm">
                Resumen pendiente
              </span>
            </div>
          </CardContent>
          <CardContent className="flex min-h-32 flex-1 items-center justify-center">
            <span className="text-muted-foreground text-sm">
              Sin datos para este módulo
            </span>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-full *:data-[slot=card-content]:space-y-6 xl:col-span-2">
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="flex flex-col justify-between gap-7 lg:col-span-3">
              <span className="text-lg font-semibold">Métricas generales</span>
              <div className="flex items-center gap-3">
                <img
                  src="/logos/isotipo.webp"
                  alt="SEDIPRO UNT"
                  className="size-10.5 rounded-lg object-contain"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-medium">SEDIPRO UNT</span>
                  <span className="text-muted-foreground text-sm">
                    Panel administrativo
                  </span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {metrics.map(({ key, label, icon: Icon }) => (
                  <Card
                    key={key}
                    className="ring-foreground/10 py-2 shadow-none ring-1"
                  >
                    <CardContent className="flex items-center gap-3 px-4">
                      <Avatar className="rounded-sm after:border-0">
                        <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-sm">
                          <Icon className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-sm font-medium">
                          {label}
                        </span>
                        <span className="text-lg font-medium">
                          {value(key)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="ring-foreground/10 justify-between gap-4 shadow-none ring-1 lg:col-span-2">
              <CardHeader className="gap-1">
                <CardTitle className="text-lg font-semibold">
                  Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-38.5 items-center justify-center">
                  <div className="border-muted flex size-36 flex-col items-center justify-center rounded-full border-16">
                    <span className="text-lg font-medium">—</span>
                    <span className="text-muted-foreground text-sm">
                      Sin datos
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">Avance</span>
                  <span className="text-2xl font-medium">—</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardContent>
          <Card className="ring-foreground/10 shadow-none ring-1">
            <CardContent className="grid gap-4 lg:grid-cols-5">
              <div className="flex flex-col justify-center gap-6">
                <span className="text-lg font-semibold">Plan de trabajo</span>
                <span className="text-6xl">—</span>
                <span className="text-muted-foreground text-sm">
                  Seguimiento pendiente
                </span>
              </div>
              <div className="flex flex-col gap-6 text-lg md:col-span-4">
                <span className="font-medium">
                  Indicadores de participación
                </span>
                <span className="text-muted-foreground text-wrap">
                  Este espacio mostrará la evolución de la participación y el
                  cumplimiento de objetivos.
                </span>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <ChartNoAxesCombined className="size-6" />
                    <span className="text-lg font-medium">Estadísticas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CirclePercent className="size-6" />
                    <span className="text-lg font-medium">Variación</span>
                  </div>
                </div>
                <div
                  className="flex h-7.75 gap-2"
                  aria-label="Gráfico pendiente"
                >
                  {Array.from({ length: 24 }, (_, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 h-full flex-1 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Card className="col-span-full w-full gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <span className="text-lg font-semibold">Actividad reciente</span>
          <Input
            placeholder="Buscar actividad…"
            aria-label="Buscar actividad"
            disabled
            className="sm:max-w-64"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["Actividad", "Responsable", "Fecha", "Estado"].map((label) => (
                <TableHead key={label} className="px-6">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground h-32 text-center"
              >
                La actividad reciente se mostrará aquí.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-4 border-t px-6 py-4">
          <span className="text-muted-foreground text-sm">0 registros</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled
              aria-label="Página siguiente"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
