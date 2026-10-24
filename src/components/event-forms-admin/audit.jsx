"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { usePanelSession } from "@/components/admin/panel-session";
import { ROLE_LABELS, normalizeRole } from "@/lib/panel-permissions.mjs";
import { panelApi } from "@/lib/panel-api";
import { AdminConfirm } from "@/components/admin/form-controls";
import { toast } from "sonner";
const actions = {
  crear: "Creó el evento",
  editar: "Modificó datos o estado del evento",
  formulario: "Modificó el borrador del formulario",
  publicar: "Publicó el formulario",
  asistencia: "Configuró la asistencia y sus responsables",
  checkin: "Registró o consultó una asistencia",
  cancelar_inscripcion: "Canceló una inscripción",
  google_sheet: "Creó o sincronizó Google Sheets",
  sheets_access: "Configuró los editores de Google Sheets",
  reintentar: "Reintentó las integraciones",
  eliminar: "Eliminó el evento definitivamente",
};
const fields = {
  titulo: "Título",
  descripcion: "Descripción",
  lugar: "Lugar",
  modalidad: "Modalidad",
  plataformaVirtual: "Plataforma virtual",
  ubicacion: "Ubicación",
  referencia: "Referencia",
  fechaInicio: "Fecha de inicio",
  fechaFin: "Fecha de fin",
  aperturaInscripciones: "Apertura de inscripciones",
  cierreInscripciones: "Cierre de inscripciones",
  cupo: "Cupo",
  qrHabilitado: "QR",
  inscripcionAbierta: "Inscripciones abiertas",
  estado: "Estado",
  form: "Preguntas y configuración",
  habilitada: "Asistencia habilitada",
  responsables: "Responsables de asistencia",
  editores: "Editores de Google Sheets",
};
const date = (value) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
export function EventAudit({ eventId }) {
  const { permissions } = usePanelSession();
  const allowed = permissions.canViewEventAudit;
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [cutoff, setCutoff] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        q: search,
        ...(eventId ? { eventoId: eventId } : {}),
      });
      const result = await panelApi(`/api/eventos/auditoria?${params}`);
      setRows(result.data);
      setPagination(result.pagination);
      setCutoff(result.limpiarHasta);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [allowed, eventId, page, search]);
  useEffect(() => {
    load();
  }, [load]);
  async function removeHistory() {
    if (deleting || !deleteTarget) return;
    setDeleting(true);
    try {
      const result = await panelApi("/api/eventos/auditoria", {
        method: "DELETE",
        body: {
          ...(eventId ? { eventoId: eventId } : {}),
          ...(deleteTarget.row
            ? { modo: "registro", registroId: deleteTarget.row._id, confirmacion: deleteTarget.row._id }
            : { modo: "limpiar", hasta: deleteTarget.cutoff, confirmacion: "LIMPIAR AUDITORIA" }),
        },
      });
      toast.success(`${result.data.eliminados} registros de auditoría eliminados.`);
      setDeleteTarget(null);
      await load();
    } catch (failure) {
      setError(failure.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }
  if (!allowed)
    return (
      <PageError message="Solo el superadministrador puede consultar la auditoría de eventos." />
    );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Historial de acciones</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Quién realizó cada operación, cuándo y con qué resultado. Los
          registros se conservan al eliminar un evento. Puedes borrarlos aquí
          de forma definitiva. Las acciones anteriores a esta función no se reconstruyen.
        </p>
      </div>
      {error && <PageError message={error} onRetry={load} />}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap gap-3 border-b p-4">
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
                className="pl-9"
                aria-label="Buscar acciones por evento o persona"
                placeholder="Evento o persona"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" type="submit">
              Buscar
            </Button>
          </form>
          <Button variant="outline" onClick={load} disabled={loading || deleting}>
            <RefreshCw />
            Actualizar
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={loading || deleting || !pagination.total || !cutoff || Boolean(error)}
            onClick={() => setDeleteTarget({ cutoff })}
          >
            <Trash2 />
            {eventId ? "Limpiar historial" : "Limpiar toda la auditoría"}
          </Button>
        </div>
        {loading ? (
          <PageLoading label="Cargando historial…" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Persona</TableHead>
                {!eventId && <TableHead>Evento</TableHead>}
                <TableHead>Acción</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead><span className="sr-only">Eliminar registro</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="min-w-44 text-xs tabular-nums">
                      {date(row.createdAt)}
                    </TableCell>
                    <TableCell className="min-w-48 max-w-64 whitespace-normal">
                      <p className="font-medium">{row.actor.nombre}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ROLE_LABELS[normalizeRole(row.actor.rol)] ||
                          row.actor.rol}
                      </p>
                    </TableCell>
                    {!eventId && (
                      <TableCell className="min-w-48 max-w-72 whitespace-normal break-words">
                        {row.eventoTitulo}
                      </TableCell>
                    )}
                    <TableCell className="min-w-56 max-w-80 whitespace-normal">
                      <p>{actions[row.accion] || "Operación de evento"}</p>
                      {Boolean(row.campos?.length) && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {row.campos
                            .map((field) => fields[field] || field)
                            .join(" · ")}
                        </p>
                      )}
                      {row.revision != null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Desde revisión {row.revision}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.resultado === "completada"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {{
                          completada: "Completada",
                          rechazada: "No aplicada",
                          iniciada: "Por verificar",
                          por_verificar: "Por verificar",
                        }[row.resultado] || "Por verificar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Eliminar registro: ${actions[row.accion] || "Operación de evento"}, ${row.actor.nombre}, ${date(row.createdAt)}`}
                        title="Eliminar registro"
                        disabled={deleting}
                        onClick={() => setDeleteTarget({ row })}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={eventId ? 5 : 6}
                    className="h-36 text-center text-muted-foreground"
                  >
                    {search
                      ? "No hay acciones con esta búsqueda."
                      : "Las próximas acciones realizadas en Eventos aparecerán aquí."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
          <span>{pagination.total} acciones</span>
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
      <AdminConfirm
        show={Boolean(deleteTarget)}
        title={deleteTarget?.row ? "Eliminar registro de auditoría" : eventId ? "Limpiar historial del evento" : "Limpiar toda la auditoría"}
        message={deleteTarget?.row
          ? `Se eliminará definitivamente el registro de ${deleteTarget.row.actor.nombre}: ${actions[deleteTarget.row.accion] || "Operación de evento"}, del ${date(deleteTarget.row.createdAt)}. No se puede recuperar. El evento y sus inscripciones se conservan.`
          : `Se eliminarán definitivamente todos los registros ${eventId ? "de este evento" : "de todos los eventos"} anteriores a la última carga del historial, aunque hayas aplicado una búsqueda. No se pueden recuperar. Los eventos, inscripciones y suscripciones se conservan.`}
        confirmText={deleting ? "Eliminando…" : "Eliminar definitivamente"}
        type="error"
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={removeHistory}
      />
    </div>
  );
}
