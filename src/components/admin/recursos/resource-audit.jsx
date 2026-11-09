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
import {
  RESOURCE_ACTION_LABELS as ACTIONS,
  RESOURCE_RESULT_LABELS as RESULTS,
} from "@/lib/resource-audit.mjs";

const date = (value) =>
  new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  });

const empty = { q: "", accion: "", resultado: "" };

export default function ResourceAudit() {
  const { permissions } = usePanelSession();
  const allowed = permissions.canViewResourceAudit;
  const [filters, setFilters] = useState(empty);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [cutoff, setCutoff] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
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
        `/api/recursos/auditoria?${new URLSearchParams({ ...filters, page: String(page) })}`,
      );
      if (current !== version.current) return;
      if (result.pagination.page !== page) {
        setPage(result.pagination.page);
        return;
      }
      setData(result.data);
      setPagination(result.pagination);
      setCutoff(result.limpiarHasta || "");
      setTotalRecords(result.totalRegistros ?? result.pagination.total);
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
      const result = await panelApi(
        target.all
          ? "/api/recursos/auditoria"
          : `/api/recursos/auditoria/${target._id}`,
        {
          method: "DELETE",
          body: target.all
            ? {
                modo: "limpiar",
                hasta: target.cutoff,
                confirmacion: "LIMPIAR AUDITORIA",
              }
            : { confirmacion: target._id },
        },
      );
      toast.success(
        target.all
          ? `${result.eliminados} registros de auditoría eliminados.`
          : "Registro de auditoría eliminado.",
      );
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
      <PageError message="Solo el superadministrador puede consultar la auditoría de recursos." />
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Auditoría de recursos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Quién entra, qué recursos consulta y qué descargas inicia. Los
            archivos se preparan en el navegador.
          </p>
        </div>
        <Link
          href="/panel/recursos"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft /> Recursos
        </Link>
      </div>
      {error && <PageError message={error} onRetry={load} />}
      <section
        className="overflow-hidden rounded-xl border bg-card"
        aria-label="Actividad de recursos"
      >
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Historial de uso</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || deleting}
                onClick={load}
              >
                <RefreshCw /> Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={
                  loading ||
                  deleting ||
                  Boolean(error) ||
                  !cutoff ||
                  !totalRecords
                }
                onClick={() => setTarget({ all: true, cutoff })}
              >
                <Trash2 /> Limpiar toda la auditoría
              </Button>
            </div>
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
              placeholder="Recurso, variante o persona"
              value={search}
              maxLength={160}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["accion", "Acción", ACTIONS, "Todas las acciones"],

              ["resultado", "Resultado", RESULTS, "Todos los resultados"],
            ].map(([key, label, options, all]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`resource-audit-${key}`}>{label}</Label>
                <AdminSelect
                  id={`resource-audit-${key}`}
                  value={filters[key]}
                  onChange={(event) => filter(key, event.target.value)}
                >
                  <option value="">{all}</option>
                  {Object.entries(options).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            ))}
          </div>
          {Object.values(filters).some(Boolean) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters(empty);
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
        ) : !data.length ? (
          <EmptyState
            icon={History}
            title="No hay actividades para mostrar"
            description="Los movimientos realizados desde esta actualización aparecerán aquí. Prueba con otros filtros."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y persona</TableHead>
                <TableHead>Recurso y variante</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>
                  <span className="sr-only">Eliminar registro</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
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
                  <TableCell className="min-w-44 max-w-72 whitespace-normal break-words">
                    <p>{row.recursoNombre || "Recursos institucionales"}</p>
                    {row.varianteNombre && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.varianteNombre}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-48 whitespace-normal">
                    <p>{ACTIONS[row.accion] || row.accion}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.formato ? row.formato.toUpperCase() : ""}
                      {row.tamano
                        ? ` · ${row.tamano === "original" ? "Tamaño original" : `${row.tamano} px`}`
                        : ""}
                      {row.fondo ? ` · Fondo ${row.fondo}` : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.resultado === "fallida"
                          ? "destructive"
                          : "secondary"
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
                      aria-label={`Eliminar registro: ${ACTIONS[row.accion]}, ${row.actor.nombre}, ${date(row.createdAt)}`}
                      disabled={deleting || !row.puedeEliminar}
                      title={
                        row.puedeEliminar
                          ? "Eliminar registro de auditoría"
                          : "Operación en curso. Actualiza el historial más tarde."
                      }
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
        Actividad reportada por el navegador: «Descarga iniciada» indica que se
        solicitó descargar el archivo; no confirma que se haya guardado en el
        equipo. «Copiada al portapapeles» confirma la copia de la imagen; no
        confirma que se haya pegado en Canva.
      </p>
      <AdminConfirm
        show={Boolean(target)}
        title={
          target?.all
            ? "Limpiar toda la auditoría"
            : "Eliminar registro de auditoría"
        }
        message={
          target?.all
            ? "Se eliminarán definitivamente todos los registros de recursos anteriores a la última carga del historial, aunque hayas aplicado filtros. Las operaciones en curso y los registros nuevos o modificados después de esa carga se conservan. Los recursos del catálogo y los archivos descargados no se modifican. Esta acción no se puede deshacer."
            : target
              ? `Se eliminará definitivamente la actividad «${ACTIONS[target.accion]}» de ${capitalizePersonName(target.actor.nombre)}. Los archivos descargados no se modifican. Esta acción no se puede deshacer.`
              : ""
        }
        confirmText={
          deleting
            ? "Eliminando…"
            : target?.all
              ? "Eliminar definitivamente"
              : "Eliminar registro"
        }
        type="error"
        onConfirm={remove}
        onCancel={() => {
          if (!deleting) setTarget(null);
        }}
      />
    </div>
  );
}
