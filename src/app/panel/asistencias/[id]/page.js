"use client";

import {
  ArrowLeft as AdminArrowLeftIcon,
  FileSpreadsheet as AdminFileSpreadsheetIcon,
  LoaderCircle as AdminLoaderCircleIcon,
  Save as AdminSaveIcon,
  Search as AdminSearchIcon,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminToast } from "@/components/admin/form-controls";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatPersonName } from "@/lib/person-name";
import { exportAttendanceToExcel } from "@/lib/export-attendance";
import { AdminConfirm } from "@/components/admin/form-controls";
import { attendanceScopeLabel } from "@/lib/attendance-scope.mjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
const ESTADOS = {
  presente: {
    label: "Presente",
  },
  tardanza: {
    label: "Tardanza",
  },
  justificado: {
    label: "Justificado",
  },
  ausente: {
    label: "Ausente",
  },
};
function initials(nombres, apellidos) {
  return `${nombres?.[0] ?? ""}${apellidos?.[0] ?? ""}`.toUpperCase();
}
function EstadoBtn({ estado, active, onClick, readOnly }) {
  const e = ESTADOS[estado];
  return (
    <Button
      onClick={readOnly ? undefined : onClick}
      type="button"
      variant={active ? "default" : "outline"}
    >
      {e.label}
    </Button>
  );
}
function formatDate(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("T")[0].split("-");
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${day} de ${meses[Number(month) - 1]} de ${year}`;
}
function formatTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function SkeletonRows({ dark, count = 8 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[1, 2, 3, 4, 5, 6].map((j) => (
        <TableCell key={j}>
          <div
            style={{
              height: "13px",
              width:
                j === 1
                  ? "40px"
                  : j === 2
                    ? "55%"
                    : j === 3
                      ? "70px"
                      : j === 4
                        ? "55px"
                        : j === 5
                          ? "80px"
                          : "160px",
            }}
            className="rounded-xl bg-muted animate-pulse"
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
export default function AsistenciaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "view";
  const requestedEdit = mode === "edit";
  const [asistencia, setAsistencia] = useState(null);
  const [registro, setRegistro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() =>
    Object.hasOwn(ESTADOS, searchParams.get("estado") || "")
      ? searchParams.get("estado")
      : "",
  );
  const [toast, setToast] = useState(null);
  const [lifecycleConfirm, setLifecycleConfirm] = useState(false);
  const isEdit = requestedEdit && asistencia?.estadoRegistro !== "cerrada";
  async function changeLifecycle() {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/asistencias/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estadoRegistro:
            asistencia.estadoRegistro === "cerrada" ? "en_registro" : "cerrada",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setAsistencia(result.asistencia);
      setLifecycleConfirm(false);
      showToast(
        result.asistencia.estadoRegistro === "cerrada"
          ? "Asistencia cerrada."
          : "Registro reabierto.",
      );
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }
  function showToast(msg, type = "success") {
    setToast({
      msg,
      type,
    });
    setTimeout(() => setToast(null), 3500);
  }
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/asistencias/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAsistencia(data.asistencia);
      setRegistro(data.asistencia.registro ?? []);
    } catch (err) {
      showToast(err.message || "Error al cargar", "error");
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const filteredRegistro = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registro.filter((r) => {
      if (statusFilter && r.estado !== statusFilter) return false;
      if (!q) return true;
      const s = r.sediprano;
      if (!s) return false;
      return (
        s.nombres?.toLowerCase().includes(q) ||
        s.apellidos?.toLowerCase().includes(q) ||
        s.dni?.toLowerCase().includes(q)
      );
    });
  }, [registro, search, statusFilter]);
  function setEstado(sedipranoId, estado) {
    if (!isEdit || saving || !Object.hasOwn(ESTADOS, estado)) return;
    setRegistro((prev) =>
      prev.map((r) =>
        r.sedipranoId?.toString() === sedipranoId?.toString()
          ? {
              ...r,
              estado,
            }
          : r,
      ),
    );
  }
  async function handleSave() {
    if (!asistencia || !isEdit || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asistencias/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registro: registro.map((r) => ({
            sedipranoId: r.sedipranoId,
            estado: r.estado,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Asistencia guardada correctamente");
      router.push("/panel/asistencias");
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }
  const summary = useMemo(() => {
    const presentes = registro.filter((r) => r.estado === "presente").length;
    const justificados = registro.filter(
      (r) => r.estado === "justificado",
    ).length;
    const ausentes = registro.filter((r) => r.estado === "ausente").length;
    const tardanzas = registro.filter((r) => r.estado === "tardanza").length;
    return {
      presentes,
      ausentes,
      justificados,
      tardanzas,
      total: registro.length,
    };
  }, [registro]);
  return (
    <div className="space-y-6">
      {toast && <AdminToast type={toast.type} message={toast.msg} />}
      <AdminConfirm
        show={lifecycleConfirm}
        title={
          asistencia?.estadoRegistro === "cerrada"
            ? "Reabrir asistencia"
            : "Cerrar asistencia"
        }
        message={
          asistencia?.estadoRegistro === "cerrada"
            ? "Se habilitarán las marcaciones y esta sesión quedará fuera de las métricas hasta volver a cerrarla."
            : "Confirma que terminaste de registrar la asistencia. Se bloquearán las marcaciones y la sesión se incluirá en las métricas."
        }
        confirmText={saving ? "Guardando…" : "Confirmar"}
        onConfirm={changeLifecycle}
        onCancel={() => {
          if (!saving) setLifecycleConfirm(false);
        }}
      />

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/panel/asistencias")}
            variant="outline"
            type="button"
            className="flex items-center justify-center shrink-0"
            size="icon-sm"
          >
            <AdminArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">
              {isEdit ? "Editar asistencia" : "Ver asistencia"}
            </h1>
            {asistencia && (
              <p className="text-sm text-muted-foreground mt-0.5 mb-0">
                {asistencia.descripcion} · {formatDate(asistencia.fecha)}
                <span className="mt-1 block">
                  {attendanceScopeLabel(asistencia)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {!loading && asistencia && (
            <>
              <Badge variant="outline">
                {asistencia.estadoRegistro === "cerrada"
                  ? "Cerrada"
                  : asistencia.estadoRegistro === "en_registro"
                    ? "En registro"
                    : "Histórica"}
              </Badge>
              {!isEdit && (
                <>
                  {asistencia.estadoRegistro !== "cerrada" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/panel/asistencias/${params.id}?mode=edit${statusFilter ? `&estado=${statusFilter}` : ""}`,
                        )
                      }
                    >
                      <Pencil /> Editar asistencia
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => setLifecycleConfirm(true)}
                  >
                    {asistencia.estadoRegistro === "cerrada"
                      ? "Reabrir registro"
                      : "Cerrar asistencia"}
                  </Button>
                </>
              )}
            </>
          )}
          {!loading && asistencia && (
            <Button
              onClick={() => exportAttendanceToExcel(asistencia, registro)}
              variant="outline"
              type="button"
              size="icon-sm"
              title="Exportar"
              aria-label="Exportar asistencia a Excel"
              className="flex items-center justify-center"
            >
              <AdminFileSpreadsheetIcon className="size-4" />
            </Button>
          )}

          {isEdit && (
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              type="button"
              style={{
                opacity: saving ? 0.7 : 1,
              }}
              variant="default"
              className="flex items-center"
            >
              {saving ? (
                <>
                  <AdminLoaderCircleIcon className="size-4 animate-spin" />{" "}
                  Guardando…
                </>
              ) : (
                <>
                  <AdminSaveIcon className="size-4" /> Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!loading && (
        <div className="space-y-2">
          <div
            role="group"
            aria-label="Filtrar asistencia por estado"
            className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
          >
            {[
              {
                label: "Todos",
                estado: "",
                value: summary.total,
              },
              {
                label: "Presentes",
                estado: "presente",
                value: summary.presentes,
              },
              {
                label: "Tardanzas",
                estado: "tardanza",
                value: summary.tardanzas,
              },
              {
                label: "Justificados",
                estado: "justificado",
                value: summary.justificados,
              },
              {
                label: "Ausentes",
                estado: "ausente",
                value: summary.ausentes,
              },
            ].map((c) => (
              <Badge
                key={c.label}
                render={<button type="button" />}
                variant={statusFilter === c.estado ? "default" : "outline"}
                aria-pressed={statusFilter === c.estado}
                disabled={saving}
                onClick={() => setStatusFilter(c.estado)}
                className="h-auto min-h-9 w-full cursor-pointer justify-center gap-2 px-3 py-1 text-sm hover:opacity-80 disabled:cursor-wait"
              >
                <span>{c.label}</span>
                <span className="font-semibold tabular-nums">{c.value}</span>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Pulsa un estado para filtrar la lista. Puedes combinarlo con la
            búsqueda.
            {isEdit
              ? " Al cambiar un estado, el integrante pasa al filtro correspondiente."
              : ""}
          </p>
        </div>
      )}

      <Card className="overflow-hidden gap-0 py-0">
        <div className="pt-3 pr-4 pb-3 pl-4 border-b">
          <div
            style={{
              maxWidth: "320px",
            }}
            className="relative"
          >
            <span
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
              className="absolute text-muted-foreground flex"
            >
              <AdminSearchIcon className="size-4" />
            </span>
            <Input
              type="text"
              placeholder="Buscar por nombre o DNI…"
              aria-label="Buscar integrante en la asistencia"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {[
                  "#",
                  "Nombre completo",
                  "DNI",
                  "Hora",
                  "Registrado por",
                  "Estado",
                ].map((h, i) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={8} />
              ) : filteredRegistro.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    {search.trim() || statusFilter
                      ? "No hay integrantes que coincidan con el estado y la búsqueda seleccionados."
                      : "Sin registros"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistro.map((r, i) => {
                  const isEven = i % 2 === 1;
                  const s = r.sediprano;
                  return (
                    <TableRow key={r.sedipranoId?.toString() ?? i}>
                      <TableCell>{i + 1}</TableCell>

                      <TableCell>
                        {s ? (
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-9 shrink-0 border">
                              <AvatarImage
                                src={s.fotoPerfil?.url || undefined}
                                alt={formatPersonName(s.nombres, s.apellidos)}
                              />
                              <AvatarFallback className="text-xs font-semibold">
                                {initials(s.nombres, s.apellidos)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="break-words font-medium">
                                {formatPersonName(s.nombres, s.apellidos)}
                              </p>
                              {s.area && (
                                <Badge variant="secondary" className="mt-1">
                                  {s.area}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="">
                          {s?.dni ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell>{r.hora ? formatTime(r.hora) : "—"}</TableCell>

                      <TableCell>{r.registradoPor || "—"}</TableCell>

                      <TableCell>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {Object.keys(ESTADOS).map((estado) => (
                            <EstadoBtn
                              key={estado}
                              estado={estado}
                              active={r.estado === estado}
                              readOnly={!isEdit || saving}
                              onClick={() => setEstado(r.sedipranoId, estado)}
                            />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && (
          <div className="pt-3 pr-4 pb-3 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0" aria-live="polite">
              {filteredRegistro.length} de {registro.length} miembro
              {registro.length !== 1 ? "s" : ""}
              {search.trim() || statusFilter ? " (filtrado)" : ""}
            </p>
          </div>
        )}
      </Card>

      {isEdit && !loading && (
        <div
          style={{
            bottom: "20px",
            right: "20px",
            zIndex: 100,
          }}
          className="fixed"
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            type="button"
            style={{
              opacity: saving ? 0.7 : 1,
            }}
            variant="default"
            className="flex items-center"
          >
            {saving ? (
              <>
                <AdminLoaderCircleIcon className="size-4 animate-spin" />{" "}
                Guardando…
              </>
            ) : (
              <>
                <AdminSaveIcon className="size-4" /> Guardar asistencia
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
