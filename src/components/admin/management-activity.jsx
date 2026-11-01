"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { AdminSelect, AdminConfirm } from "@/components/admin/form-controls";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { capitalizePersonName } from "@/lib/person-name";
import { CERTIFICATE_ACTION_LABELS } from "@/lib/certificate-audit.mjs";
const MODULES = {
  asistencias: "Asistencias",
  eventos: "Eventos",
  enlaces: "Enlaces",
  certificados: "Certificados",
  padron: "Padrón",
  cuentas: "Accesos",
  votaciones: "Votaciones",
  toma: "Toma de asistencia",
  perfil: "Perfil",
};
const ACTIONS = {
  crear: "Creación",
  editar: "Edición",
  eliminar: "Eliminación",
  archivar: "Archivo",
  restaurar: "Restauración",
  asignar_encargado: "Asignación de encargado",
  retirar_encargado: "Retiro de encargado",
  actualizar: "Actualización",
  registrar: "Registro",
  publicar: "Publicación",
  checkin: "Asistencia",
  formulario: "Formulario",
  asistencia: "Configuración de asistencia",
  google_sheet: "Google Sheets",
  reintentar: "Reintento de integración",
  sheets_access: "Accesos a Google Sheets",
  cancelar_inscripcion: "Cancelación de inscripción",
  eliminar_definitivamente: "Eliminación definitiva",
  ...CERTIFICATE_ACTION_LABELS,
};
const RESULTS = {
  iniciada: "En curso",
  completada: "Completada",
  rechazada: "No aplicada",
  por_verificar: "Por verificar",
  registrada: "Registrada",
  descarga_iniciada: "Descarga iniciada",
  fallida: "Fallida",
  cancelada: "Cancelada",
};
export default function ManagementActivity() {
  const { permissions } = usePanelSession(),
    [filters, setFilters] = useState({ q: "", modulo: "" }),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [rows, setRows] = useState([]),
    [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [target, setTarget] = useState(null),
    [deleting, setDeleting] = useState(false);
  const version = useRef(0),
    busy = useRef(false);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    setError("");
    try {
      const result = await panelApi(
        `/api/dashboard/actividad?${new URLSearchParams({ ...filters, page: String(page) })}`,
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
      if (current === version.current) {
        setRows([]);
        setPagination({ page: 1, pages: 1, total: 0 });
        setError(failure.message);
      }
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [filters, page]);
  useEffect(() => {
    const counter = version;
    load();
    return () => {
      ++counter.current;
    };
  }, [load]);
  const filter = (key, value) => {
    setPage(1);
    setFilters((previous) => ({ ...previous, [key]: value }));
  };
  async function remove() {
    if (!target || busy.current) return;
    busy.current = true;
    setDeleting(true);
    try {
      await panelApi(`/api/dashboard/actividad/${target._id}`, {
        method: "DELETE",
        body: { origen: target.origen, confirmacion: target._id },
      });
      setTarget(null);
      toast.success("Registro de actividad eliminado.");
      await load();
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Actividad reciente</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Movimientos registrados de los módulos según tus permisos
            </p>
          </div>
          <Button variant="ghost" size="sm" disabled={loading} onClick={load}>
            <RefreshCw />
            <span className="sr-only sm:not-sr-only">Actualizar actividad</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              filter("q", search.trim());
            }}
          >
            <Input
              aria-label="Buscar actividad"
              placeholder="Buscar actividad o responsable…"
              value={search}
              maxLength={160}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="w-full sm:w-56">
            <Label className="sr-only" htmlFor="activity-module">
              Módulo
            </Label>
            <AdminSelect
              id="activity-module"
              value={filters.modulo}
              onChange={(event) => filter("modulo", event.target.value)}
            >
              <option value="">Todos los módulos</option>
              {Object.entries(MODULES)
                .filter(([key]) => key !== "cuentas" || permissions.isAdmin)
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </AdminSelect>
          </div>
        </div>
      </div>
      {error && <PageError message={error} onRetry={load} />}
      {loading ? (
        <PageLoading label="Cargando actividad…" />
      ) : error ? null : !rows.length ? (
        <EmptyState
          title="Sin movimientos para mostrar"
          description="Los nuevos movimientos aparecerán aquí. Prueba con otros filtros."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Actividad",
                "Responsable",
                "Fecha",
                "Estado",
                ...(permissions.isSuperadmin ? ["Acciones"] : []),
              ].map((label) => (
                <TableHead key={label} className="px-5">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.origen}:${row._id}`}>
                <TableCell className="min-w-60 max-w-md whitespace-normal px-5">
                  <Badge variant="outline">
                    {MODULES[row.modulo] || row.modulo}
                  </Badge>
                  <p className="mt-2 font-medium">
                    {ACTIONS[row.accion] || row.accion}
                  </p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {row.titulo || "Actividad del módulo"}
                  </p>
                </TableCell>
                <TableCell className="min-w-40 whitespace-normal px-5">
                  {capitalizePersonName(row.responsable) ||
                    "Mantenimiento autorizado"}
                </TableCell>
                <TableCell className="min-w-40 px-5 text-xs tabular-nums">
                  {new Date(row.createdAt).toLocaleString("es-PE", {
                    timeZone: "America/Lima",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell className="px-5">
                  <Badge
                    variant={
                      row.resultado === "rechazada" ||
                      row.resultado === "fallida"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {RESULTS[row.resultado] || row.resultado}
                  </Badge>
                </TableCell>
                {permissions.isSuperadmin && (
                  <TableCell className="px-5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Eliminar actividad: ${row.titulo || ACTIONS[row.accion]}`}
                      title={
                        row.puedeEliminar
                          ? "Eliminar este registro de actividad"
                          : "Operación en curso o por verificar"
                      }
                      disabled={deleting || !row.puedeEliminar}
                      onClick={() => setTarget(row)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm">
          <span className="text-muted-foreground">
            {pagination.total} registros · Página {pagination.page} de{" "}
            {pagination.pages}
          </span>
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
      )}
      <AdminConfirm
        show={Boolean(target)}
        title="Eliminar registro de actividad"
        message="Se eliminará definitivamente este registro de su historial de origen. No se modifica la asistencia, evento, enlace ni ninguna otra información del módulo. No se puede deshacer."
        type="error"
        confirmText={deleting ? "Eliminando…" : "Eliminar registro"}
        onConfirm={remove}
        onCancel={() => {
          if (!deleting) setTarget(null);
        }}
      />
    </Card>
  );
}
