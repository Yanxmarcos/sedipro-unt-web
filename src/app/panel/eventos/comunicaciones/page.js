"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminConfirm, AdminSelect } from "@/components/admin/form-controls";
import { usePanelSession } from "@/components/admin/panel-session";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";

const labels = {
  pendiente: "Por confirmar",
  suscrito: "Suscrito",
  baja: "Dado de baja",
};
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
export default function CommunicationsPage() {
  const { permissions } = usePanelSession();
  const canDelete = permissions.isSuperadmin;
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState("");
  const [status, setStatus] = useState(""),
    [loading, setLoading] = useState(true);
  const [error, setError] = useState(""),
    [exporting, setExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await panelApi(
        `/api/eventos/comunicaciones?${new URLSearchParams({ page: String(page), q: search, estado: status })}`,
      );
      setRows(result.data);
      setPagination(result.pagination);
      setPage(result.pagination.page);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);
  useEffect(() => {
    load();
  }, [load]);
  async function removeSubscription() {
    if (!canDelete || deleting || !deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await panelApi("/api/eventos/comunicaciones", {
        method: "DELETE",
        body: {
          suscripcionId: deleteTarget._id,
          confirmacion: deleteTarget._id,
          actualizadaAt: deleteTarget.updatedAt,
        },
      });
      setDeleteTarget(null);
      toast.success("Suscripción eliminada definitivamente.");
      await load();
    } catch (failure) {
      setDeleteError(failure.message);
    } finally {
      setDeleting(false);
    }
  }
  async function exportExcel() {
    setExporting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/eventos/comunicaciones?${new URLSearchParams({ exportar: "xlsx", q: search })}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(
          failure.error ||
            "No se pudo exportar la lista. Inténtalo nuevamente.",
        );
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "suscripciones-sedipro.xlsx";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="space-y-6">
      <Link
        href="/panel/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Todos los eventos
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Suscripciones a invitaciones
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Una lista por correo, con autorización, confirmación y bajas.
            Inscribirse a un evento no activa esta suscripción.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportExcel}
          disabled={loading || exporting || !pagination.total}
        >
          <Download />
          {exporting ? "Preparando…" : "Exportar Excel"}
        </Button>
      </header>
      <p className="text-sm text-muted-foreground">
        El archivo Excel incluye solo correos confirmados con autorización
        vigente al exportar. Antes de cada envío se debe consultar el estado
        actual; una exportación anterior puede contener bajas posteriores.
      </p>
      {error && <PageError message={error} onRetry={load} />}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <form
            className="flex min-w-0 flex-1 basis-64 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(query.trim());
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Buscar correo suscrito"
                placeholder="Buscar correo"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" type="submit">
              Buscar
            </Button>
          </form>
          <div className="w-full sm:w-44">
            <AdminSelect
              aria-label="Estado de suscripción"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="suscrito">Suscritos</option>
              <option value="pendiente">Por confirmar</option>
              <option value="baja">Dados de baja</option>
            </AdminSelect>
          </div>
        </div>
        {loading ? (
          <PageLoading label="Cargando suscripciones…" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Autorización</TableHead>
                  <TableHead>Confirmación / baja</TableHead>
                  {canDelete && (
                    <TableHead className="sticky right-0 bg-card text-right">
                      Acciones
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="min-w-56 max-w-sm whitespace-normal break-all font-medium">
                        {row.correo}
                        <p className="mt-1 text-xs font-normal text-muted-foreground">
                          {row.consentimiento?.eventoTitulo}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.estado === "suscrito" ? "default" : "secondary"
                          }
                        >
                          {labels[row.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-64 whitespace-normal text-sm">
                        <p>{date(row.consentimiento?.fecha)}</p>
                        <details className="mt-2 text-muted-foreground">
                          <summary className="cursor-pointer text-xs">
                            Ver evidencia
                          </summary>
                          <p className="mt-2 max-w-sm text-xs leading-5">
                            {row.consentimiento?.texto}
                          </p>
                          <p className="mt-1 text-xs">
                            Versión {row.consentimiento?.version}
                          </p>
                          <ul className="mt-2 space-y-1 text-xs">
                            {row.historial?.map((item, i) => (
                              <li key={i}>
                                {
                                  {
                                    solicitud: "Autorización solicitada",
                                    confirmacion: "Correo confirmado",
                                    baja: "Suscripción cancelada",
                                  }[item.accion]
                                }{" "}
                                · {date(item.fecha)}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </TableCell>
                      <TableCell className="min-w-48 text-sm">
                        <p>Confirmó: {date(row.confirmadoAt)}</p>
                        {row.bajaAt && (
                          <p className="mt-1 text-muted-foreground">
                            Última baja: {date(row.bajaAt)}
                          </p>
                        )}
                      </TableCell>
                      {canDelete && (
                        <TableCell className="sticky right-0 bg-card text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deleting}
                            aria-label={`Eliminar suscripción de ${row.correo}`}
                            title="Eliminar suscripción"
                            onClick={() => {
                              setDeleteError("");
                              setDeleteTarget(row);
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={canDelete ? 5 : 4}
                      className="h-40 text-center text-muted-foreground"
                    >
                      {search || status
                        ? "No hay suscripciones con estos filtros."
                        : "Las autorizaciones a futuras invitaciones aparecerán aquí."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
          <span>{pagination.total} correos</span>
          <div className="flex items-center gap-3">
            <span>
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={loading || pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página siguiente"
              disabled={loading || pagination.page >= pagination.pages}
              onClick={() => setPage(pagination.page + 1)}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
      {canDelete && (
        <AdminConfirm
          show={Boolean(deleteTarget)}
          title="Eliminar suscripción"
          message={
            <span className="block space-y-3">
              <span className="block break-all font-medium text-foreground">
                {deleteTarget?.correo}
              </span>
              <span className="block">
                Se eliminarán definitivamente esta suscripción y su historial de
                autorización. No se pueden recuperar. Sus inscripciones y QR se
                conservan.
              </span>
              {deleteError && (
                <span role="alert" className="block text-destructive">
                  {deleteError}
                </span>
              )}
            </span>
          }
          confirmText={deleting ? "Eliminando…" : "Eliminar definitivamente"}
          type="error"
          onCancel={() => {
            if (!deleting) {
              setDeleteTarget(null);
              setDeleteError("");
            }
          }}
          onConfirm={removeSubscription}
        />
      )}
    </div>
  );
}
