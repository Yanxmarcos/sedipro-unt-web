"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  History,
  Search,
  UsersRound,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminConfirm, AdminSelect } from "@/components/admin/form-controls";
import { panelApi } from "@/lib/panel-api";
import { formatEventDate } from "./event-settings";

const statusLabel = (status) =>
  ({
    inscrito: "Confirmada",
    cancelado: "Cancelada",
    lista_espera: "Lista de espera",
  })[status] || status;
function displayAnswer(field, value) {
  const label = (item) =>
    field?.options?.find((option) => option.id === item)?.label ||
    { si: "Sí", no: "No" }[item] ||
    String(item);
  return Array.isArray(value)
    ? value.map(label).join(", ")
    : value == null || value === ""
      ? "Sin respuesta"
      : label(value);
}

export function Registrations({ event, onCountChange, readOnly = false, canCancel = !readOnly }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [cancel, setCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        q: search,
        estado: status,
      });
      const result = await panelApi(
        `/api/eventos/${event._id}/inscripciones?${params}`,
      );
      setRows(result.data || []);
      setPagination(
        result.pagination || {
          page,
          pages: 1,
          total: result.data?.length || 0,
        },
      );
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [event._id, page, search, status]);
  useEffect(() => {
    load();
  }, [load]);
  async function exportExcel() {
    setExporting(true);
    setError("");
    try {
      const response = await fetch(`/api/eventos/${event._id}/exportar`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.error || "No se pudo exportar. Inténtalo nuevamente.",
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `inscripciones-${event.slug}.xlsx`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setExporting(false);
    }
  }
  async function loadHistory(registration) {
    setHistory(null);
    setHistoryError("");
    setHistoryLoading(true);
    try {
      const personId = registration.personaId?._id || registration.personaId;
      const result = await panelApi(
        `/api/eventos/${event._id}/participantes/${personId}`,
      );
      setHistory(result.data);
    } catch (failure) {
      setHistoryError(failure.message);
    } finally {
      setHistoryLoading(false);
    }
  }
  const fields = selected
    ? (selected.formSnapshot || event.formulario?.published)?.sections?.flatMap(
        (section) => section.fields,
      ) || []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Inscripciones</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Respuestas, confirmaciones y recorrido de tus participantes.
          </p>
        </div>
        {!readOnly && <Button
          variant="outline"
          onClick={exportExcel}
          disabled={exporting || !pagination.total}
        >
          <Download />
          {exporting ? "Preparando…" : "Exportar Excel"}
        </Button>}
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(query.trim());
            }}
            className="flex min-w-0 flex-1 basis-72 gap-2"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Buscar inscripciones"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, DNI, correo o código"
              />
            </div>
            <Button variant="outline" type="submit">
              Buscar
            </Button>
          </form>
          <div className="w-full sm:w-44">
            <AdminSelect
              aria-label="Filtrar estado de inscripción"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="inscrito">Confirmadas</option>
              <option value="cancelado">Canceladas</option>
            </AdminSelect>
          </div>
        </div>
        {error && (
          <div role="alert" className="border-b p-4 text-sm text-destructive">
            {error}
            <Button variant="link" onClick={load} className="ml-2 text-inherit">
              Reintentar
            </Button>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Inscripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center text-muted-foreground"
                  >
                    Cargando inscripciones…
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell>
                      <p className="font-medium">
                        {registration.participante?.nombres}{" "}
                        {registration.participante?.apellidos}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {registration.participante?.correo}
                      </p>
                      {registration.conflictoIdentidad && (
                        <Badge variant="outline" className="mt-1">
                          Datos por revisar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {registration.codigo}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatEventDate(registration.createdAt)}
                      <span className="mt-1 block">
                        Formulario v{registration.formVersion || 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          registration.estado === "cancelado"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {statusLabel(registration.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ver inscripción de ${registration.participante?.nombres || registration.codigo}`}
                        onClick={() => {
                          setSelected(registration);
                          setHistory(null);
                          setHistoryError("");
                        }}
                      >
                        <Eye />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center py-14 text-center">
                      <UsersRound
                        className="mb-3 size-8 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <p className="font-medium">
                        {search || status
                          ? "No hay resultados con estos filtros"
                          : "Las primeras respuestas aparecerán aquí"}
                      </p>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        {search || status
                          ? "Prueba otra búsqueda o cambia el estado."
                          : "Publica tu formulario y comparte el enlace con los participantes."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {pagination.total}{" "}
            {pagination.total === 1 ? "inscripción" : "inscripciones"}
          </span>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              Página {page} de {Math.max(1, pagination.pages)}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => value - 1)}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página siguiente"
              disabled={page >= pagination.pages || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.participante?.nombres}{" "}
              {selected?.participante?.apellidos}
            </DialogTitle>
            <DialogDescription>
              Inscripción {selected?.codigo} · {statusLabel(selected?.estado)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <dl className="grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                {[
                  ["DNI", selected.participante?.dni],
                  ["Correo", selected.participante?.correo],
                  ["Fecha", formatEventDate(selected.createdAt)],
                  ["Invitaciones futuras", selected.comunicaciones?.solicitado === true ? "Solicitó suscribirse; consulta el estado vigente en Suscripciones." : selected.comunicaciones?.solicitado === false ? "No autorizó en esta inscripción" : "Sin consentimiento registrado"],
                  [
                    "Confirmación por correo",
                    {
                      pendiente: "Pendiente de envío",
                      enviado: "Enviada",
                      sin_configurar: "Correo aún sin configurar",
                      fallido: "No se pudo enviar",
                    }[selected.correoEstado] ||
                      selected.correoEstado ||
                      "Pendiente",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words text-sm">
                      {value || "Sin dato"}
                    </dd>
                  </div>
                ))}
              </dl>
              {selected.conflictoIdentidad && (
                <p className="rounded-lg border p-3 text-sm leading-6">
                  Los datos declarados difieren de la ficha existente. La ficha
                  original se conservó; revisa esta inscripción antes de
                  modificar información del participante.
                </p>
              )}
              <div>
                <h3 className="mb-4 text-sm font-semibold">
                  Respuestas · versión {selected.formVersion || 1}
                </h3>
                <dl className="space-y-4">
                  {Object.entries(selected.respuestas || {}).map(
                    ([id, value]) => {
                      const question = fields.find((field) => field.id === id);
                      return (
                        <div key={id} className="border-b pb-3 last:border-b-0">
                          <dt className="text-xs text-muted-foreground">
                            {question?.label || id}
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                            {displayAnswer(question, value)}
                          </dd>
                        </div>
                      );
                    },
                  )}
                </dl>
              </div>
              <div className="space-y-4 border-t pt-5">
                <Button
                  variant="outline"
                  onClick={() => loadHistory(selected)}
                  disabled={historyLoading}
                >
                  <History />
                  {historyLoading
                    ? "Consultando…"
                    : "Ver historial del participante"}
                </Button>
                {historyError && (
                  <p role="alert" className="text-sm text-destructive">
                    {historyError}
                  </p>
                )}
                {history && (
                  <div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Este historial muestra inscripciones. No acredita
                      asistencia al evento.
                    </p>
                    <ul className="divide-y rounded-lg border">
                      {history.inscripciones?.map((item, index) => (
                        <li
                          key={item._id || `${item.codigo}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {item.evento?.titulo ||
                                item.eventoId?.titulo ||
                                "Evento"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatEventDate(item.createdAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {statusLabel(item.estado)}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {!readOnly && canCancel && selected.estado === "inscrito" && (
                <div className="flex justify-end border-t pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => setCancel(selected)}
                  >
                    Cancelar inscripción
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AdminConfirm
        show={Boolean(cancel)}
        title="Cancelar inscripción"
        message="El participante dejará de tener una inscripción activa y se liberará su cupo. Sus respuestas se conservarán en el historial."
        type="error"
        confirmText={cancelling ? "Cancelando…" : "Cancelar inscripción"}
        onCancel={() => {
          if (!cancelling) setCancel(null);
        }}
        onConfirm={async () => {
          if (cancelling) return;
          setCancelling(true);
          try {
            await panelApi(
              `/api/eventos/${event._id}/inscripciones/${cancel._id}`,
              { method: "PATCH", body: { estado: "cancelado" } },
            );
            setCancel(null);
            setSelected(null);
            await load();
            onCountChange?.();
          } catch (failure) {
            setError(failure.message);
            setCancel(null);
            setSelected(null);
          } finally {
            setCancelling(false);
          }
        }}
      />
    </div>
  );
}
