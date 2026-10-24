"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Info,
  LoaderCircle,
  RefreshCw,
  Search,
  UsersRound,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AdminSelect } from "@/components/admin/form-controls";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";
import { formatPersonName } from "@/lib/person-name";
import { formatEventDate } from "./event-settings";
import { EventQrScanner } from "./qr-scanner";

const names = (p) => formatPersonName(p?.nombres, p?.apellidos);
const hour = (value) =>
  new Date(value).toLocaleTimeString("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
const settingsKey = (enabled, people) =>
  JSON.stringify([enabled, people.map((p) => String(p._id)).sort()]);
const qrErrorTitle = (failure) => {
  if (failure.status === 400) {
    if (failure.message.includes("otro evento")) return "QR de otro evento";
    if (failure.message.includes("no utiliza QR")) return "QR no habilitado";
    return "QR no válido";
  }
  if (failure.status === 404) return "Inscripción no vigente";
  if (failure.status === 403) return "Registro no disponible";
  if (failure.status === 401) return "Sesión no válida";
  if (failure.status === 429) return "Espera un momento";
  return "No se pudo confirmar la asistencia";
};

function AttendanceSettings({ id, config, onSaved }) {
  const [selected, setSelected] = useState(config.responsables);
  const [enabled, setEnabled] = useState(config.habilitada);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [baseline, setBaseline] = useState(() => ({
    revision: config.revision,
    key: settingsKey(config.habilitada, config.responsables),
  }));
  const sourceKey = settingsKey(config.habilitada, config.responsables);
  const dirty = settingsKey(enabled, selected) !== baseline.key;
  // Sync untouched forms. Keep local edits only when the server's settings
  // are unchanged (e.g. an attendance mark advanced the shared revision).
  if (
    config.revision > baseline.revision &&
    (!dirty || sourceKey === baseline.key)
  ) {
    setBaseline({ revision: config.revision, key: sourceKey });
    if (!dirty) {
      setSelected(config.responsables);
      setEnabled(config.habilitada);
      setNotice("");
    }
  }
  const stale = config.revision > baseline.revision;
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await panelApi(
          `/api/eventos/${id}/responsables?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setCandidates(result.data);
          setError("");
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, query]);
  async function save(e) {
    e.preventDefault();
    if (saving || stale) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await panelApi(`/api/eventos/${id}/asistencia`, {
        method: "PATCH",
        body: {
          habilitada: enabled,
          responsables: selected.map((p) => p._id),
          revision: baseline.revision,
        },
      });
      setBaseline({
        revision: result.data.revision,
        key: settingsKey(result.data.habilitada, result.data.responsables),
      });
      setSelected(result.data.responsables);
      setEnabled(result.data.habilitada);
      setNotice("Configuración guardada.");
      await onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  const visible = [
    ...selected.filter((p) => !candidates.some((c) => c._id === p._id)),
    ...candidates,
  ];
  return (
    <form
      onSubmit={save}
      className="space-y-5 rounded-xl border bg-card p-5 sm:p-6"
    >
      <div>
        <h3 className="font-semibold">Responsables y acceso</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Las personas elegidas podrán tomar asistencia desde su cuenta, dentro
          de este evento. La directiva y administración también pueden
          registrarla.
        </p>
      </div>
      {stale && (
        <div
          role="alert"
          className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm"
        >
          <p>
            Otro gestor cambió la configuración. Tus ajustes siguen aquí; carga
            la versión actual antes de volver a editarlos.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelected(config.responsables);
              setEnabled(config.habilitada);
              setBaseline({ revision: config.revision, key: sourceKey });
              setError("");
              setNotice("");
            }}
          >
            Descartar ajustes y actualizar
          </Button>
        </div>
      )}
      <Label className="flex items-center gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={saving}
        />
        Toma de asistencia abierta
      </Label>
      <div className="space-y-2">
        <Label htmlFor="event-responsible-search">Buscar responsables</Label>
        <Input
          id="event-responsible-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre o apellido"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {selected.length} de 30 seleccionados · Solo cuentas activas vinculadas
        a sedipranos.
      </p>
      <div className="max-h-72 overflow-y-auto rounded-lg border">
        {loading && (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            Buscando cuentas…
          </p>
        )}
        {!loading && !visible.length && (
          <p className="p-4 text-sm text-muted-foreground">
            No encontramos cuentas con esos nombres.
          </p>
        )}
        {visible.map((p) => (
          <Label
            key={p._id}
            className="flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-muted/40"
          >
            <Checkbox
              checked={selected.some((s) => s._id === p._id)}
              disabled={
                saving ||
                (!selected.some((s) => s._id === p._id) &&
                  selected.length >= 30)
              }
              onCheckedChange={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, p]
                    : current.filter((s) => s._id !== p._id),
                )
              }
            />
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={p.fotoPerfil?.url} alt="" />
              <AvatarFallback>
                {p.nombres?.[0]}
                {p.apellidos?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 break-words text-sm">
              {names(p)}
              {p.active === false && (
                <span className="ml-2 text-destructive">
                  Cuenta inactiva: retírala
                </span>
              )}
            </span>
          </Label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      <Button disabled={saving || stale} type="submit">
        {saving ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <ClipboardCheck />
        )}
        {saving ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>
  );
}

export function EventAttendance({ id, taking = false }) {
  const [data, setData] = useState(null),
    [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1);
  const [estado, setEstado] = useState("presente"),
    [saving, setSaving] = useState(false),
    [feedback, setFeedback] = useState(null),
    [qr, setQr] = useState("");
  const [qrConfirmation, setQrConfirmation] = useState(null);
  const confirmationLock = useRef(false);
  const inFlight = useRef(false),
    requestVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const result = await panelApi(
        `/api/eventos/${id}/asistencia?${new URLSearchParams({ q: search, estado: filter, page: String(page) })}`,
      );
      if (version !== requestVersion.current) return;
      setData(result.data);
      setPagination(result.pagination);
      setError("");
    } catch (failure) {
      if (version === requestVersion.current) setError(failure.message);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [id, search, filter, page]);
  const invalidate = useCallback(() => {
    ++requestVersion.current;
  }, []);
  useEffect(() => {
    load();
    return invalidate;
  }, [load, invalidate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  const dismissConfirmation = useCallback(() => {
    confirmationLock.current = false;
    setQrConfirmation(null);
  }, []);
  useEffect(() => {
    if (!qrConfirmation) return;
    const timer = setTimeout(dismissConfirmation, qrConfirmation.error ? 4500 : 2800);
    return () => clearTimeout(timer);
  }, [qrConfirmation, dismissConfirmation]);
  async function mark(body) {
    if (inFlight.current || confirmationLock.current) return;
    inFlight.current = true;
    setSaving(true);
    setFeedback(null);
    setError("");
    try {
      const result = await panelApi(`/api/eventos/${id}/checkin`, {
        method: "POST",
        body: { ...body, estado },
      });
      setFeedback(result);
      if (body.qr) {
        confirmationLock.current = true;
        setQrConfirmation(result);
      }
      setQr("");
      await load();
    } catch (failure) {
      setError(failure.message);
      if (body.qr) {
        confirmationLock.current = true;
        setQrConfirmation({ error: true, status: failure.status, title: qrErrorTitle(failure), message: failure.message });
      }
      if (failure.status === 403) await load();
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }
  if (loading) return <PageLoading />;
  if (!data) return <PageError message={error} onRetry={load} />;
  const { evento, configuracion: config, resumen, registros } = data;
  return (
    <div className="space-y-6">
      {taking && (
        <header className="space-y-2">
          <Link
            href={`/panel/eventos/${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="size-4" /> Volver al evento
          </Link>
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            Asistencia · {evento.titulo}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatEventDate(evento.fechaInicio)}
          </p>
        </header>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {taking ? "Control de ingreso" : "Asistencia del evento"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.habilitada ? "Registro abierto" : "Registro cerrado"} ·{" "}
            {evento.qrHabilitado ? "QR y búsqueda manual" : "Búsqueda manual"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!taking && config.puedeMarcar && (
            <Link
              href={`/panel/eventos/${id}/checkin`}
              className={buttonVariants()}
            >
              <ClipboardCheck /> Tomar asistencia
            </Link>
          )}
          <Button variant="outline" disabled={saving} onClick={load}>
            <RefreshCw /> Actualizar
          </Button>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-card p-4 sm:p-5">
        {[
          ["Presentes", resumen.presente],
          ["Tardanzas", resumen.tardanza],
          ["Pendientes", resumen.pendiente],
        ].map(([label, total]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground sm:text-sm">
              {label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {total}
            </dd>
          </div>
        ))}
      </dl>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {feedback && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{names(feedback.data.participante)}</p>
            <p className="mt-1 text-sm">
              {feedback.yaRegistrado
                ? "Ya tenía asistencia registrada. Se conserva la primera marca."
                : "Asistencia registrada."}{" "}
              {feedback.data.asistencia.estado === "tardanza"
                ? "Tardanza"
                : "Presente"}{" "}
              · {hour(feedback.data.asistencia.hora)}
            </p>
          </div>
        </div>
      )}
      {taking && !config.puedeMarcar && (
        <p className="rounded-lg border bg-muted/30 p-4 text-sm">
          {config.habilitada
            ? "Puedes consultar la asistencia. Para registrarla, un gestor debe asignarte como responsable de este evento."
            : "La toma de asistencia está cerrada. Un gestor puede abrirla desde la pestaña Asistencia del evento."}
        </p>
      )}
      <div
        className={
          taking && config.puedeMarcar
            ? "grid items-start gap-6 xl:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]"
            : "space-y-6"
        }
      >
        {taking && config.puedeMarcar && (
          <Card>
            <CardHeader>
              <CardTitle>Registrar asistencia</CardTitle>
              <CardDescription>
                Elige el estado antes de escanear o marcar un participante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-medium">
                  Estado de asistencia
                </legend>
                <RadioGroup
                  value={estado}
                  onValueChange={setEstado}
                  disabled={saving}
                  className="grid grid-cols-2"
                >
                  {["presente", "tardanza"].map((value) => (
                    <Label
                      key={value}
                      htmlFor={"event-mark-" + value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-3"
                    >
                      <RadioGroupItem
                        id={"event-mark-" + value}
                        value={value}
                      />
                      {value === "presente" ? "Presente" : "Tardanza"}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>
              {evento.qrHabilitado && (
                <>
                  <EventQrScanner
                    onScan={(value) => mark({ qr: value })}
                    disabled={saving || Boolean(qrConfirmation)}
                  />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (qr.trim()) mark({ qr: qr.trim() });
                    }}
                    className="space-y-3 border-t pt-5"
                  >
                    <Label htmlFor="event-qr-value">
                      QR con lector USB o texto
                    </Label>
                    <Input
                      id="event-qr-value"
                      value={qr}
                      onChange={(e) => setQr(e.target.value)}
                      placeholder="Escanea aquí con tu lector"
                      autoComplete="off"
                      disabled={saving || Boolean(qrConfirmation)}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={saving || Boolean(qrConfirmation) || !qr.trim()}
                    >
                      Registrar QR
                    </Button>
                  </form>
                </>
              )}
              {!evento.qrHabilitado && (
                <p className="text-sm leading-6 text-muted-foreground">
                  Busca por DNI o nombre y pulsa Registrar en la inscripción
                  correspondiente.
                </p>
              )}
              {saving && (
                <p
                  role="status"
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <LoaderCircle className="size-4 animate-spin" /> Registrando
                  asistencia…
                </p>
              )}
            </CardContent>
          </Card>
        )}
        <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <div className="space-y-4 border-b p-4 sm:p-5">
            <h3 className="font-semibold">Participantes inscritos</h3>
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-0 flex-1 basis-60">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  aria-label="Buscar participante por DNI o nombre"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="DNI, nombre, correo o código"
                  className="pl-9"
                />
              </div>
              <div className="w-full sm:w-44">
                <AdminSelect
                  aria-label="Filtrar asistencia"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="presente">Presentes</option>
                  <option value="tardanza">Tardanzas</option>
                </AdminSelect>
              </div>
            </div>
          </div>
          <Table className="min-w-[560px]">
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Asistencia</TableHead>
                {taking && config.puedeMarcar && (
                  <TableHead className="text-right">Acción</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <p className="font-medium">{names(row.participante)}</p>
                    <p className="mt-1 max-w-64 break-all text-xs text-muted-foreground">
                      {row.codigo}
                    </p>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.participante?.dni}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.asistencia ? "secondary" : "outline"}>
                      {row.asistencia
                        ? row.asistencia.estado === "tardanza"
                          ? "Tardanza"
                          : "Presente"
                        : "Pendiente"}
                    </Badge>
                    {row.asistencia && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {hour(row.asistencia.hora)} ·{" "}
                        {row.asistencia.metodo === "qr" ? "QR" : "Manual"}
                      </p>
                    )}
                  </TableCell>
                  {taking && config.puedeMarcar && (
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving || Boolean(row.asistencia)}
                        onClick={() => mark({ inscripcionId: row._id })}
                      >
                        {row.asistencia ? "Registrado" : "Registrar"}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!registros.length && (
                <TableRow>
                  <TableCell
                    colSpan={taking && config.puedeMarcar ? 4 : 3}
                    className="h-40 text-center"
                  >
                    <UsersRound className="mx-auto mb-3 size-7 text-muted-foreground" />
                    <p className="font-medium">
                      {search || filter
                        ? "No hay participantes con ese filtro"
                        : "Todavía no hay inscritos"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search || filter
                        ? "Prueba otra búsqueda o estado."
                        : "Las inscripciones confirmadas aparecerán aquí."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between gap-3 border-t p-4 text-sm">
            <span className="text-muted-foreground">
              {pagination.total} inscritos · {pagination.page}/
              {pagination.pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => setPage((v) => v - 1)}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Página siguiente"
                disabled={page >= pagination.pages}
                onClick={() => setPage((v) => v + 1)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Dialog
        open={Boolean(qrConfirmation)}
        onOpenChange={(open) => { if (!open) dismissConfirmation(); }}
      >
        <DialogContent className="gap-4 text-center sm:max-w-sm">
          {qrConfirmation && (
            <>
              {qrConfirmation.error ? (
                <XCircle aria-hidden="true" className="mx-auto size-12 text-destructive" />
              ) : qrConfirmation.yaRegistrado ? (
                <Info aria-hidden="true" className="mx-auto size-12 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-green-600 dark:text-green-400" />
              )}
              <DialogHeader className="gap-3">
                <DialogTitle className="text-lg leading-snug">
                  {qrConfirmation.error ? qrConfirmation.title : qrConfirmation.yaRegistrado ? "Ya estaba registrado" : "Asistencia registrada"}
                </DialogTitle>
                <DialogDescription className={qrConfirmation.error
                  ? "break-words text-sm leading-6"
                  : "break-words text-xl font-semibold leading-snug text-foreground"}>
                  {qrConfirmation.error ? qrConfirmation.message : names(qrConfirmation.data.participante)}
                </DialogDescription>
              </DialogHeader>
              {!qrConfirmation.error && <p className="text-sm text-muted-foreground">
                {qrConfirmation.data.asistencia.estado === "tardanza" ? "Tardanza" : "Presente"}
                {" · "}{hour(qrConfirmation.data.asistencia.hora)}
              </p>}
              {qrConfirmation.yaRegistrado && (
                <p className="text-sm text-muted-foreground">Se conserva la primera marca.</p>
              )}
              <Button onClick={dismissConfirmation} className="w-full">
                {qrConfirmation.error && [401, 403].includes(qrConfirmation.status) ? "Entendido" : "Seguir escaneando"}
              </Button>
              <p className="text-xs text-muted-foreground">Este aviso se cierra automáticamente.</p>
            </>
          )}
        </DialogContent>
      </Dialog>
      {!taking && (
        <section className="space-y-4 border-t pt-6">
          <h3 className="font-semibold">Responsables de asistencia</h3>
          <div className="flex flex-wrap gap-3">
            {config.responsables.map((p) => (
              <div key={p._id} className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={p.fotoPerfil?.url} alt="" />
                  <AvatarFallback>
                    {p.nombres?.[0]}
                    {p.apellidos?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{names(p)}</span>
              </div>
            ))}
            {!config.responsables.length && (
              <p className="text-sm text-muted-foreground">
                Aún no hay responsables asignados.
              </p>
            )}
          </div>
          {config.puedeGestionar && (
            <AttendanceSettings id={id} config={config} onSaved={load} />
          )}
        </section>
      )}
    </div>
  );
}
