"use client";

import {
  ArrowLeft as AdminArrowLeftIcon,
  FileSpreadsheet as AdminFileSpreadsheetIcon,
  LoaderCircle as AdminLoaderCircleIcon,
  Save as AdminSaveIcon,
  Search as AdminSearchIcon,
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
import { exportAttendanceToExcel } from "@/lib/export-attendance";
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
  const isEdit = mode === "edit";
  const [asistencia, setAsistencia] = useState(null);
  const [registro, setRegistro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
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
    if (!search.trim()) return registro;
    const q = search.toLowerCase();
    return registro.filter((r) => {
      const s = r.sediprano;
      if (!s) return false;
      return (
        s.nombres?.toLowerCase().includes(q) ||
        s.apellidos?.toLowerCase().includes(q) ||
        s.dni?.toLowerCase().includes(q)
      );
    });
  }, [registro, search]);
  function setEstado(sedipranoId, estado) {
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
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
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
                  <AdminSaveIcon className="size-4" /> Guardar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {[
            {
              label: "Total",
              value: summary.total,
            },
            {
              label: "Presentes",
              value: summary.presentes,
            },
            {
              label: "Tardanzas",
              value: summary.tardanzas,
            },
            {
              label: "Justificados",
              value: summary.justificados,
            },
            {
              label: "Ausentes",
              value: summary.ausentes,
            },
          ].map((c) => (
            <Card key={c.label} className="text-center p-6">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                }}
                className="rounded-full bg-muted mx-auto flex items-center justify-center"
              >
                <span className="text-sm font-semibold text-foreground">
                  {c.value}
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground m-0">
                {c.label}
              </p>
            </Card>
          ))}
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
                    {search
                      ? "Sin resultados para la búsqueda"
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
                                alt={`${s.nombres || ""} ${s.apellidos || ""}`.trim()}
                              />
                              <AvatarFallback className="text-xs font-semibold">
                                {initials(s.nombres, s.apellidos)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="break-words font-medium">
                                {s.nombres} {s.apellidos}
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
                              readOnly={!isEdit}
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

        {!loading && filteredRegistro.length > 0 && (
          <div className="pt-3 pr-4 pb-3 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0">
              {filteredRegistro.length} de {registro.length} miembro
              {registro.length !== 1 ? "s" : ""}
              {search ? ` (filtrado)` : ""}
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
