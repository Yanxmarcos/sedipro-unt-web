"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AdminSelect, AdminConfirm } from "@/components/admin/form-controls";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";
import { usePanelSession } from "@/components/admin/panel-session";
import { ROLE_LABELS } from "@/lib/panel-permissions.mjs";
import { panelApi } from "@/lib/panel-api";
import { capitalizePersonName } from "@/lib/person-name";

const ACTIONS = {
  crear: "Crear asistencia",
  editar: "Editar asistencia",
  archivar: "Archivar asistencia",
  eliminar: "Eliminar asistencia definitivamente",
  asignar_encargado: "Asignar encargado",
  retirar_encargado: "Retirar encargado",
};
const RESULTS = {
  iniciada: "En curso",
  completada: "Completada",
  rechazada: "No aplicada",
  por_verificar: "Por verificar",
};
const date = (value) =>
  value
    ? new Date(value).toLocaleString("es-PE", {
        timeZone: "America/Lima",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export default function AttendanceAudit() {
  const { permissions } = usePanelSession();
  const allowed = permissions.canViewAttendanceAudit;
  const [filters, setFilters] = useState({ q: "", accion: "", resultado: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const version = useRef(0);
  const deletingRef = useRef(false);
  const load = useCallback(async () => {
    if (!allowed) return;
    const current = ++version.current;
    setLoading(true);
    try {
      const result = await panelApi(
        `/api/asistencias/auditoria?${new URLSearchParams({ ...filters, page: String(page) })}`,
      );
      if (current !== version.current) return;
      if (result.pagination.page !== page) {
        setPage(result.pagination.page);
        return;
      }
      setRows(result.data);
      setPagination(result.pagination);
      setError("");
    } catch (failure) {
      if (current === version.current) setError(failure.message);
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [allowed, filters, page]);
  useEffect(() => {
    const counter = version;
    load();
    return () => {
      ++counter.current;
    };
  }, [load]);
  function filter(key, value) {
    setPage(1);
    setFilters((previous) => ({ ...previous, [key]: value }));
  }
  async function remove() {
    if (!target || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await panelApi(`/api/asistencias/auditoria/${target._id}`, {
        method: "DELETE",
        body: { confirmacion: target._id },
      });
      toast.success("Registro de auditoría eliminado.");
      setTarget(null);
      await load();
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }
  if (!allowed)
    return (
      <PageError message="Solo el superadministrador puede consultar la auditoría de asistencias." />
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Auditoría de asistencias
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cambios de configuración, estados editados y encargados asignados
            desde la administración de asistencias.
          </p>
        </div>
        <Link
          href="/panel/asistencias"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft /> Asistencias
        </Link>
      </div>
      {error && <PageError message={error} onRetry={load} />}
      <section
        className="overflow-hidden rounded-xl border bg-card"
        aria-label="Historial de asistencias"
      >
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Historial de acciones</h2>
            <Button
              variant="ghost"
              size="sm"
              disabled={loading || deleting}
              onClick={load}
            >
              <RefreshCw /> Actualizar
            </Button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              filter("q", search.trim());
            }}
          >
            <Input
              aria-label="Buscar en auditoría"
              placeholder="Nombre de asistencia o persona"
              value={search}
              maxLength={160}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="attendance-audit-action">Acción</Label>
              <AdminSelect
                id="attendance-audit-action"
                value={filters.accion}
                onChange={(event) => filter("accion", event.target.value)}
              >
                <option value="">Todas las acciones</option>
                {Object.entries(ACTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attendance-audit-result">Resultado</Label>
              <AdminSelect
                id="attendance-audit-result"
                value={filters.resultado}
                onChange={(event) => filter("resultado", event.target.value)}
              >
                <option value="">Todos los resultados</option>
                {Object.entries(RESULTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          {Object.values(filters).some(Boolean) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ q: "", accion: "", resultado: "" });
                setSearch("");
                setPage(1);
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        {loading ? (
          <PageLoading label="Cargando auditoría…" />
        ) : !rows.length ? (
          <EmptyState
            icon={History}
            title="No hay acciones para mostrar"
            description="Aquí aparecerán los movimientos administrativos realizados desde esta actualización. Prueba con otros filtros."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y persona</TableHead>
                <TableHead>Asistencia</TableHead>
                <TableHead>Acción y cambios</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>
                  <span className="sr-only">Eliminar registro</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="min-w-48 max-w-60 whitespace-normal">
                    <p className="text-xs tabular-nums">
                      {date(row.createdAt)}
                    </p>
                    <p className="mt-2 font-medium">
                      {capitalizePersonName(row.actor.nombre)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ROLE_LABELS[row.actor.rol] || row.actor.rol}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-48 max-w-72 whitespace-normal break-words">
                    {row.asistenciaTitulo}
                  </TableCell>
                  <TableCell className="min-w-60 max-w-md whitespace-normal">
                    <p>{ACTIONS[row.accion] || row.accion}</p>
                    {row.cambios?.length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer rounded-sm py-1 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                          Ver cambios ({row.cambios.length})
                        </summary>
                        <dl className="mt-3 space-y-3">
                          {row.cambios.map((change, index) => (
                            <div key={index}>
                              <dt className="font-medium">{change.campo}</dt>
                              <dd className="mt-1 break-words leading-5 text-muted-foreground">
                                <span className="font-medium">Antes: </span>
                                {change.antes ?? "Sin valor"}
                                <br />
                                <span className="font-medium">Después: </span>
                                {change.despues ?? "Sin valor"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.resultado === "completada" ? "default" : "secondary"
                      }
                    >
                      {RESULTS[row.resultado] || row.resultado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Eliminar registro: ${row.asistenciaTitulo}, ${ACTIONS[row.accion]}, ${date(row.createdAt)}`}
                      title={
                        row.puedeEliminar
                          ? "Eliminar registro de auditoría"
                          : "Operación en curso o por verificar"
                      }
                      disabled={deleting || !row.puedeEliminar}
                      onClick={() => setTarget(row)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm">
          <p className="text-muted-foreground">
            {pagination.total} registros · Página {pagination.page} de{" "}
            {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || deleting || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || deleting || page >= pagination.pages}
              onClick={() => setPage((value) => value + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </section>
      <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
        El superadministrador puede eliminar cada registro definitivamente sin
        modificar la asistencia. Las operaciones en curso o por verificar se
        conservan para su revisión.
      </p>
      <AdminConfirm
        show={Boolean(target)}
        title="Eliminar registro de auditoría"
        message={
          target
            ? `Se eliminará definitivamente este movimiento de «${target.asistenciaTitulo}». La asistencia no se modificará. Esta acción no se puede deshacer.`
            : ""
        }
        confirmText={deleting ? "Eliminando…" : "Eliminar registro"}
        type="error"
        onConfirm={remove}
        onCancel={() => {
          if (!deleting) setTarget(null);
        }}
      />
    </div>
  );
}
