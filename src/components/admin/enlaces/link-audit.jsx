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
import {
  ACTIONS,
  RESULTS,
  FIELD_LABELS,
  STATES,
  formatDate,
} from "./link-utils.mjs";
import { LinkPagination } from "./link-shared";

const empty = {
  q: "",
  accion: "",
  resultado: "",
  actor: "",
  desde: "",
  hasta: "",
};
function changeValue(field, value) {
  if (value === null || value === "") return "Sin valor";
  if (field === "estado") return STATES[value] || value;
  if (field === "venceAt" || field === "eliminadoAt") return formatDate(value);
  return String(value);
}
export default function LinkAudit({ enlaceId = "" }) {
  const { permissions } = usePanelSession();
  const allowed = permissions.canViewLinkAudit;
  const [filters, setFilters] = useState(empty);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [actors, setActors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const version = useRef(0);
  const load = useCallback(async () => {
    if (!allowed) return;
    const current = ++version.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page: String(page),
        ...(enlaceId ? { enlaceId } : {}),
      });
      const result = await panelApi(`/api/enlaces/auditoria?${params}`);
      if (current !== version.current) return;
      if (page > result.pagination.pages) {
        setPage(result.pagination.pages);
        return;
      }
      setRows(result.data);
      setActors(result.actores || []);
      setPagination(result.pagination);
      setError("");
    } catch (failure) {
      if (current === version.current) setError(failure.message);
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [allowed, filters, page, enlaceId]);
  useEffect(() => {
    const counter = version;
    load();
    return () => {
      ++counter.current;
    };
  }, [load]);
  function filter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }
  async function removeEntry() {
    if (deleting || !deleteTarget) return;
    setDeleting(true);
    try {
      await panelApi(`/api/enlaces/auditoria/${deleteTarget._id}`, {
        method: "DELETE",
        body: { confirmacion: deleteTarget._id },
      });
      toast.success("Registro de auditoría eliminado.");
      setDeleteTarget(null);
      await load();
    } catch (failure) {
      toast.error(failure.message);
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }
  if (!allowed)
    return (
      <PageError message="Solo administración puede consultar la auditoría de enlaces." />
    );
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Auditoría de enlaces
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {enlaceId ? "Historial del enlace seleccionado. " : ""}Quién realizó
            cada cambio, cuándo y con qué resultado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {enlaceId && (
            <Link
              href="/panel/enlaces/auditoria"
              className={buttonVariants({ variant: "outline" })}
            >
              Toda la auditoría
            </Link>
          )}
          <Link
            href="/panel/enlaces"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft />
            Biblioteca
          </Link>
        </div>
      </header>
      {error && <PageError message={error} onRetry={load} />}
      <section
        className="overflow-hidden rounded-xl border bg-card"
        aria-label="Historial de acciones"
      >
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Historial de acciones</h2>
            <Button variant="ghost" size="sm" disabled={loading} onClick={load}>
              <RefreshCw />
              Actualizar
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
              placeholder="Título del enlace, código o persona"
              value={search}
              maxLength={160}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="audit-action">Acción</Label>
              <AdminSelect
                id="audit-action"
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
              <Label htmlFor="audit-result">Resultado</Label>
              <AdminSelect
                id="audit-result"
                value={filters.resultado}
                onChange={(event) => filter("resultado", event.target.value)}
              >
                <option value="">Todos los resultados</option>
                <option value="completada">Completada</option>
                <option value="rechazada">No aplicada</option>
                <option value="iniciada">Iniciada · Por verificar</option>
                <option value="por_verificar">Por verificar</option>
              </AdminSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-actor">Persona</Label>
              <AdminSelect
                id="audit-actor"
                value={filters.actor}
                onChange={(event) => filter("actor", event.target.value)}
              >
                <option value="">Todas las personas</option>
                {actors.map((actor) => (
                  <option key={actor._id} value={actor._id}>
                    {actor.nombre}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-from">Desde</Label>
              <Input
                id="audit-from"
                type="date"
                value={filters.desde}
                onChange={(event) => filter("desde", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-until">Hasta</Label>
              <Input
                id="audit-until"
                type="date"
                value={filters.hasta}
                onChange={(event) => filter("hasta", event.target.value)}
              />
            </div>
          </div>
          {Object.values(filters).some(Boolean) && (
            <Button
              size="sm"
              variant="ghost"
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
        ) : !rows.length ? (
          <EmptyState
            icon={History}
            title="No hay acciones para mostrar"
            description="Las acciones registradas desde la activación del módulo aparecerán aquí. Prueba con otros filtros."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y persona</TableHead>
                <TableHead>Enlace</TableHead>
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
                      {formatDate(row.createdAt)}
                    </p>
                    <p className="mt-2 font-medium">{row.actor.nombre}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ROLE_LABELS[row.actor.rol] || row.actor.rol}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-44 max-w-64 whitespace-normal">
                    <p className="break-words font-medium">
                      {row.enlaceTitulo}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      /{row.prefijo}/{row.codigo}
                    </p>
                    {row.revisionNueva != null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Revisión {row.revisionAnterior ?? "—"} →{" "}
                        {row.revisionNueva}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="min-w-64 max-w-md whitespace-normal">
                    <p>{ACTIONS[row.accion] || row.accion}</p>
                    {row.cambios?.length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer rounded-sm py-1 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                          Ver cambios ({row.cambios.length})
                        </summary>
                        <dl className="mt-3 space-y-3">
                          {row.cambios.map((change) => (
                            <div key={change.campo}>
                              <dt className="font-medium">
                                {FIELD_LABELS[change.campo] || change.campo}
                              </dt>
                              <dd className="mt-1 break-all leading-5 text-muted-foreground">
                                <span className="font-medium">Antes: </span>
                                {changeValue(change.campo, change.antes)}
                                <br />
                                <span className="font-medium">Después: </span>
                                {changeValue(change.campo, change.despues)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    )}
                  </TableCell>
                  <TableCell className="min-w-36">
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
                      aria-label={`Eliminar registro: ${row.enlaceTitulo}, ${ACTIONS[row.accion]}, ${formatDate(row.createdAt)}`}
                      title={
                        row.puedeEliminar
                          ? "Eliminar registro de auditoría"
                          : "Operación en curso. Actualiza el historial antes de eliminarla."
                      }
                      disabled={deleting || !row.puedeEliminar}
                      onClick={() => setDeleteTarget(row)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <LinkPagination
          pagination={pagination}
          onPage={setPage}
          disabled={loading || deleting}
        />
      </section>
      <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
        El historial se conserva al mover enlaces a papelera. Administración
        puede eliminar registros individualmente de forma definitiva. Las
        operaciones por verificar requieren revisión; no se consideran
        completadas automáticamente.
      </p>
      <AdminConfirm
        show={Boolean(deleteTarget)}
        title="Eliminar registro de auditoría"
        message={
          deleteTarget
            ? `Se eliminará definitivamente el registro de «${deleteTarget.enlaceTitulo}» del ${formatDate(deleteTarget.createdAt)}. Esta acción no modifica el enlace y no se puede deshacer.`
            : ""
        }
        confirmText={deleting ? "Eliminando…" : "Eliminar registro"}
        type="error"
        onConfirm={removeEntry}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
