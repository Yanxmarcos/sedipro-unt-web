"use client";
import { attendanceScopeLabel } from "@/lib/attendance-scope.mjs";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPersonName, capitalizePersonName } from "@/lib/person-name";
import { AREA_TEXT_CLASSES } from "@/lib/member-areas.mjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageError,
  PageLoading,
  EmptyState,
} from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";

export default function TomarAsistenciaPage() {
  const { asistenciaId } = useParams();
  const inputRef = useRef(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dni, setDni] = useState("");
  const [estado, setEstado] = useState("presente");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [preview, setPreview] = useState(null);
  const busyRef = useRef(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await panelApi("/api/asistencias/" + asistenciaId);
      setAttendance(result.asistencia);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [asistenciaId]);

  useEffect(() => {
    load();
  }, [load]);

  async function register(event) {
    event.preventDefault();
    if (
      !/^[0-9]{8}$/.test(dni) ||
      saving ||
      busyRef.current ||
      attendance?.estadoRegistro === "cerrada"
    )
      return;
    busyRef.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await panelApi("/api/asistencias/" + asistenciaId);
      setAttendance(result.asistencia);
      const entry = result.asistencia.registro.find(
        (item) => item.sediprano?.dni === dni,
      );
      if (!entry?.sediprano) {
        toast.error(
          "Este DNI no pertenece a los convocados de esta asistencia.",
        );
        return;
      }
      setPreview({
        dni,
        estado,
        person: entry.sediprano,
        currentState: entry.estado,
      });
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  async function confirmRegistration() {
    if (
      !preview ||
      preview.currentState !== "ausente" ||
      saving ||
      busyRef.current
    )
      return;
    busyRef.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await panelApi("/api/registro/" + asistenciaId, {
        method: "POST",
        body: { dni: preview.dni, estado: preview.estado },
      });
      setFeedback(result);
      if (result.yaRegistrado) toast.info(result.message);
      else toast.success("Asistencia registrada.");
      setDni("");
      setPreview(null);
      await load();
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      busyRef.current = false;
      setSaving(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;
  const recent = [...(attendance?.registro || [])]
    .filter(
      (entry) => entry.hora && ["presente", "tardanza"].includes(entry.estado),
    )
    .sort((a, b) => new Date(b.hora) - new Date(a.hora))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            nativeButton={false}
            render={<Link href="/panel/asistencias/tomar" />}
          >
            <ArrowLeft /> Mis asignaciones
          </Button>
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            {attendance?.descripcion}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {attendanceScopeLabel(attendance)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(attendance.fecha).toLocaleDateString("es-PE", {
              timeZone: "America/Lima",
              dateStyle: "long",
            })}
          </p>
        </div>
        <Button variant="outline" disabled={saving} onClick={load}>
          <RefreshCw /> Actualizar
        </Button>
      </div>
      {attendance?.estadoRegistro === "cerrada" && (
        <p
          role="status"
          className="rounded-lg border bg-muted/30 px-4 py-3 text-sm"
        >
          Registro cerrado. Solicita a la directiva que lo reabra para realizar
          nuevas marcaciones.
        </p>
      )}
      <div
        role="group"
        aria-label="Resumen de asistencia"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {[
          ["Total", attendance.registro?.length],
          ["Presentes", attendance.resumen?.presentes],
          ["Tardanzas", attendance.resumen?.tardanzas],
          ["Justificados", attendance.resumen?.justificados],
          ["Ausentes", attendance.resumen?.ausentes],
        ].map(([label, total]) => (
          <Badge
            key={label}
            variant="outline"
            className="h-auto w-full justify-center gap-2 bg-card px-3 py-1 text-sm"
          >
            <span>{label}</span>
            <span className="font-semibold tabular-nums">{total || 0}</span>
          </Badge>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Registrar asistencia</CardTitle>
            <CardDescription>
              Ingresa el DNI de la persona que está asistiendo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={register} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="attendance-dni">DNI</Label>
                <Input
                  ref={inputRef}
                  id="attendance-dni"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  required
                  disabled={saving || attendance?.estadoRegistro === "cerrada"}
                  value={dni}
                  onChange={(event) =>
                    setDni(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="8 dígitos"
                />
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">
                  Estado de asistencia
                </legend>
                <RadioGroup
                  value={estado}
                  onValueChange={setEstado}
                  disabled={saving || attendance?.estadoRegistro === "cerrada"}
                  className="grid grid-cols-2"
                >
                  {["presente", "tardanza"].map((value) => (
                    <Label
                      key={value}
                      htmlFor={"mark-" + value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-3"
                    >
                      <RadioGroupItem id={"mark-" + value} value={value} />
                      {value === "presente" ? "Presente" : "Tardanza"}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  saving ||
                  dni.length !== 8 ||
                  attendance?.estadoRegistro === "cerrada"
                }
              >
                {saving ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <ClipboardCheck />
                )}
                {saving ? "Consultando…" : "Registrar"}
              </Button>
            </form>
            {feedback && (
              <div
                role="status"
                className="space-y-2 rounded-lg border bg-muted/30 p-4"
              >
                <CheckCircle2 className="size-5" />
                <p className="font-medium">
                  {formatPersonName(
                    feedback.sediprano?.nombres,
                    feedback.sediprano?.apellidos,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {feedback.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="gap-0 overflow-hidden py-0 xl:col-span-2">
          <CardHeader className="border-b py-5">
            <CardTitle>Últimos registros</CardTitle>
            <CardDescription>
              Los 10 registros más recientes de esta asistencia.
            </CardDescription>
          </CardHeader>
          {recent.length === 0 ? (
            <EmptyState
              title="Todavía no hay registros"
              description="Los registros aparecerán aquí al tomar asistencia."
            />
          ) : (
            <Table className="min-w-[550px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Sediprano</TableHead>
                  <TableHead className="w-28">DNI</TableHead>
                  <TableHead className="w-28">Estado</TableHead>
                  <TableHead className="w-28">Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((entry) => (
                  <TableRow key={entry.sedipranoId}>
                    <TableCell className="pl-4">
                      {formatPersonName(
                        entry.sediprano?.nombres,
                        entry.sediprano?.apellidos,
                      )}
                    </TableCell>
                    <TableCell>{entry.sediprano?.dni}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {entry.estado === "tardanza" ? "Tardanza" : "Presente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.hora).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPreview(null);
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
          showCloseButton={!saving}
        >
          <DialogHeader>
            <DialogTitle>Confirmar asistencia</DialogTitle>
            <DialogDescription>
              Verifica la identidad antes de guardar el registro.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="space-y-4 py-2 text-center">
              <Avatar className="mx-auto size-40 sm:size-44">
                <AvatarImage
                  src={preview.person.fotoPerfil?.url || undefined}
                  alt={`Foto de ${capitalizePersonName(preview.person.nombres, preview.person.apellidos)}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl">
                  {`${preview.person.nombres?.[0] || ""}${preview.person.apellidos?.[0] || ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!preview.person.fotoPerfil?.url && (
                <p className="text-xs text-muted-foreground">
                  Sin foto de perfil
                </p>
              )}
              <div>
                <p className="break-words text-xl font-semibold">
                  {capitalizePersonName(
                    preview.person.nombres,
                    preview.person.apellidos,
                  )}
                </p>
                <p
                  className={`mt-1 text-base font-medium ${AREA_TEXT_CLASSES[preview.person.area] || ""}`}
                >
                  {preview.person.area}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  DNI: {preview.dni}
                </p>
              </div>
              <Badge variant="secondary">
                {preview.currentState !== "ausente"
                  ? `Ya figura como ${preview.currentState}`
                  : preview.estado === "tardanza"
                    ? "Registrar como tardanza"
                    : "Registrar como presente"}
              </Badge>
              {preview.currentState !== "ausente" && (
                <p className="text-sm text-muted-foreground">
                  Esta persona ya tiene un estado registrado. No se realizará
                  otra marcación.
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => {
                setPreview(null);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              Atrás
            </Button>
            <Button
              disabled={saving || preview?.currentState !== "ausente"}
              onClick={confirmRegistration}
            >
              {saving && <LoaderCircle className="animate-spin" />}
              {saving ? "Registrando…" : "Confirmar registro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
