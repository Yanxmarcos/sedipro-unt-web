"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCheckbox, AdminSelect } from "@/components/admin/form-controls";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";
import {
  canonical,
  fullArea,
  CERTIFICATE_DIRECTORY_URL,
  memberParticipant,
  parseParticipantRows,
  roleLabel,
  titleCase,
  validateParticipants,
} from "@/lib/certificate-data.mjs";

const MAX_PARTICIPANTS = 500;
const EMPTY_PARTICIPANTS = [];
const DIRECTORY_TTL = 5 * 60 * 1000;
const GROUPS = [
  { value: "director", label: "Dirección del proyecto", short: "Dirección" },
  {
    value: "coordinator",
    label: "Coordinación de áreas",
    short: "Coordinación",
  },
  { value: "advisor", label: "Asesoría de áreas", short: "Asesoría" },
];
const sourcesFor = (kind) =>
  kind === "sedipranos"
    ? [
        { value: "directory", label: "Padrón de sedipranos" },
        { value: "excel", label: "Desde Excel" },
      ]
    : [
        { value: "excel", label: "Desde Excel" },
        { value: "event", label: "Inscripciones de evento" },
        { value: "manual", label: "Ingreso manual" },
      ];
const searchText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

export default function CertificateSetup({
  kind,
  value,
  onChange,
  onContinue,
  onBack,
  onDirectoryLoaded,
}) {
  const participants = value.participants || EMPTY_PARTICIPANTS;
  const source = value.source || sourcesFor(kind)[0].value;
  const [group, setGroup] = useState("director");
  const [query, setQuery] = useState("");
  const [directory, setDirectory] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState("");
  const [directoryRefresh, setDirectoryRefresh] = useState(0);
  const directoryCache = useRef(null);
  const directoryCallback = useRef(onDirectoryLoaded);
  directoryCallback.current = onDirectoryLoaded;
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [eventsRefresh, setEventsRefresh] = useState(0);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [manual, setManual] = useState({ name: "", role: "Participante" });
  const fileRef = useRef(null);
  const importSequence = useRef(0);
  const latestSource = useRef(source);
  latestSource.current = source;

  useEffect(() => {
    return () => {
      importSequence.current += 1;
    };
  }, []);

  useEffect(() => {
    if (kind !== "sedipranos") return;
    let active = true;
    async function load() {
      const cached = directoryCache.current;
      if (
        cached &&
        Date.now() - cached.at < DIRECTORY_TTL &&
        cached.refresh === directoryRefresh
      ) {
        setDirectory(cached.rows);
        directoryCallback.current?.(cached.rows);
        return;
      }
      setDirectoryLoading(true);
      setDirectoryError("");
      try {
        const result = await panelApi(CERTIFICATE_DIRECTORY_URL);
        if (!active) return;
        const rows = Array.isArray(result.data) ? result.data : [];
        directoryCache.current = {
          rows,
          at: Date.now(),
          refresh: directoryRefresh,
        };
        setDirectory(rows);
        directoryCallback.current?.(rows);
      } catch (failure) {
        if (active)
          setDirectoryError(
            failure.message ||
              "No se pudo cargar el padrón. Intenta nuevamente.",
          );
      } finally {
        if (active) setDirectoryLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [kind, directoryRefresh]);

  useEffect(() => {
    if (kind !== "externos" || source !== "event") return;
    let active = true;
    async function load() {
      setEventsLoading(true);
      setEventsError("");
      try {
        const result = await panelApi("/api/eventos?incluirArchivados=true");
        if (active) setEvents(Array.isArray(result.data) ? result.data : []);
      } catch (failure) {
        if (active)
          setEventsError(
            failure.message || "No se pudieron cargar los eventos.",
          );
      } finally {
        if (active) setEventsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [kind, source, eventsRefresh]);

  const directoryRows = useMemo(
    () =>
      directory
        .filter(
          (member) =>
            member.activo !== false &&
            member.account?.active !== false &&
            canonical(member.area) !== "directiva",
        )
        .map((member) => ({
          raw: member,
          participant: memberParticipant(member, group),
        }))
        .filter(({ participant }) =>
          searchText(
            `${participant.name} ${fullArea(participant.area)}`,
          ).includes(searchText(query)),
        )
        .sort((a, b) =>
          a.participant.name.localeCompare(b.participant.name, "es"),
        ),
    [directory, group, query],
  );
  const selectedMembers = useMemo(
    () =>
      new Map(
        participants
          .filter((participant) => participant.memberId)
          .map((participant) => [String(participant.memberId), participant]),
      ),
    [participants],
  );
  const selectedImportedNames = useMemo(
    () =>
      new Map(
        participants
          .filter((participant) => !participant.memberId)
          .map((participant) => [canonical(participant.name), participant]),
      ),
    [participants],
  );
  const selectedFor = useCallback(
    (participant) =>
      selectedMembers.get(String(participant.memberId)) ||
      selectedImportedNames.get(canonical(participant.name)),
    [selectedMembers, selectedImportedNames],
  );
  const groupIndex = GROUPS.findIndex((item) => item.value === group);

  const updateParticipant = useCallback(
    (id, patch) => {
      onChange({
        participants: participants.map((participant) =>
          participant.id === id ? { ...participant, ...patch } : participant,
        ),
      });
      setErrors([]);
    },
    [participants, onChange],
  );

  function removeParticipant(id) {
    onChange({
      participants: participants.filter((participant) => participant.id !== id),
    });
    setErrors([]);
  }

  function toggleMember(member) {
    const participant = memberParticipant(member, group);
    const selected = selectedFor(participant);
    if (selected) {
      if (selected.roleType === group) removeParticipant(selected.id);
      return;
    }
    if (participants.length >= MAX_PARTICIPANTS) {
      setErrors([
        "Puedes preparar hasta 500 certificados por sesión. Quita un participante antes de añadir otro.",
      ]);
      return;
    }
    onChange({ participants: [...participants, participant] });
    setErrors([]);
  }

  function changeSource(next) {
    importSequence.current += 1;
    setImporting(false);
    setErrors([]);
    setImportMessage("");
    onChange({ source: next });
  }

  async function importExcel(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setErrors([]);
    setImportMessage("");
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setErrors(["Selecciona un archivo Excel .xlsx o .xls."]);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors([
        "El Excel supera los 10 MB. Reduce el archivo e inténtalo nuevamente.",
      ]);
      return;
    }
    const sequence = ++importSequence.current;
    setImporting(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
        dense: true,
      });
      if (!workbook.SheetNames.length)
        throw new Error("El Excel no contiene hojas.");
      const rows = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1, defval: "", raw: false, blankrows: false },
      );
      if (rows.length > MAX_PARTICIPANTS + 1)
        throw new Error(
          "El Excel supera los 500 participantes. Divídelo en archivos más pequeños.",
        );
      const imported = parseParticipantRows(rows, kind);
      if (!imported.length)
        throw new Error(
          "La primera hoja está vacía. Completa la plantilla antes de cargarla.",
        );
      if (
        sequence !== importSequence.current ||
        latestSource.current !== "excel"
      )
        return;
      onChange({ participants: imported, source: "excel" });
      setImportMessage(
        `${imported.length} participantes cargados desde ${file.name}. Revisa los datos antes de continuar.`,
      );
    } catch (failure) {
      if (sequence === importSequence.current)
        setErrors([
          failure.message ||
            "No se pudo leer el Excel. Utiliza la plantilla disponible.",
        ]);
    } finally {
      if (sequence === importSequence.current) setImporting(false);
    }
  }

  async function importEvent() {
    if (!value.eventId) {
      setErrors([
        "Selecciona el evento del que quieres obtener las inscripciones.",
      ]);
      return;
    }
    const sequence = ++importSequence.current;
    const eventId = value.eventId;
    setErrors([]);
    setImportMessage("");
    setImporting(true);
    try {
      let page = 1;
      let pages = 1;
      const registrations = [];
      do {
        const result = await panelApi(
          `/api/eventos/${encodeURIComponent(eventId)}/inscripciones?estado=inscrito&limit=100&page=${page}`,
        );
        if (
          sequence !== importSequence.current ||
          latestSource.current !== "event"
        )
          return;
        const rows = Array.isArray(result.data) ? result.data : [];
        if (
          Number(result.pagination?.total) > MAX_PARTICIPANTS ||
          registrations.length + rows.length > MAX_PARTICIPANTS
        ) {
          throw new Error(
            "El evento tiene más de 500 inscripciones. Exporta y divide la lista en archivos Excel de hasta 500 participantes.",
          );
        }
        registrations.push(...rows);
        pages = Math.max(1, Number(result.pagination?.pages) || 1);
        if (pages > 5)
          throw new Error(
            "El evento supera el límite de 500 participantes. Utiliza archivos Excel por lotes.",
          );
        page += 1;
      } while (page <= pages);
      if (!registrations.length)
        throw new Error("Este evento no tiene inscripciones confirmadas.");
      const imported = registrations.map((registration, index) => ({
        id: `event-${eventId}-${registration._id || index}`,
        name: titleCase(
          [
            registration.participante?.nombres,
            registration.participante?.apellidos,
          ]
            .filter(Boolean)
            .join(" "),
        ),
        area: "",
        sexo: "NO_ESPECIFICADO",
        roleType: "external",
        role: "Participante",
        source: "event",
      }));
      const issues = validateParticipants(imported, kind);
      if (issues.length) throw new Error(issues.join(" "));
      const selectedEvent = events.find((item) => item._id === eventId);
      onChange({
        participants: imported,
        ...(!value.project?.trim() && selectedEvent
          ? { project: selectedEvent.titulo }
          : {}),
      });
      setImportMessage(
        `${imported.length} inscripciones confirmadas cargadas. Puedes editar el nombre y rol de cada participante.`,
      );
    } catch (failure) {
      if (sequence === importSequence.current)
        setErrors([
          failure.message || "No se pudieron cargar las inscripciones.",
        ]);
    } finally {
      if (sequence === importSequence.current) setImporting(false);
    }
  }

  function addManual(event) {
    event.preventDefault();
    const name = titleCase(manual.name.trim());
    const role = manual.role.trim();
    if (!name || !role) {
      setErrors(["Completa el nombre y el rol del participante."]);
      return;
    }
    if (participants.length >= MAX_PARTICIPANTS) {
      setErrors(["Puedes preparar hasta 500 certificados por sesión."]);
      return;
    }
    const next = [
      ...participants,
      {
        id: `manual-${crypto.randomUUID()}`,
        name,
        role,
        area: "",
        sexo: "NO_ESPECIFICADO",
        roleType: "external",
        source: "manual",
      },
    ];
    const issues = validateParticipants(next, kind);
    if (issues.length) {
      setErrors(issues);
      return;
    }
    onChange({ participants: next });
    setManual({ name: "", role: manual.role });
    setErrors([]);
  }

  function continueSetup() {
    const issues = [];
    if (!value.project?.trim()) issues.push("Ingresa el nombre del proyecto.");
    if (
      !Number.isInteger(Number(value.year)) ||
      Number(value.year) < 1900 ||
      Number(value.year) > 2200
    )
      issues.push("Ingresa un año de periodo válido.");
    issues.push(...validateParticipants(participants, kind));
    if (
      kind === "sedipranos" &&
      !participants.some((participant) => participant.roleType === "director")
    )
      issues.push(
        "Selecciona al menos una persona para la dirección del proyecto.",
      );
    setErrors([...new Set(issues)]);
    if (!issues.length) onContinue();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Proyecto y participantes</h2>
          <p className="text-sm text-muted-foreground">
            {kind === "sedipranos"
              ? "Asigna los cargos del equipo o importa la lista desde Excel."
              : "Importa las inscripciones, carga un Excel o añade los participantes manualmente."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="certificate-project">Nombre del proyecto</Label>
            <Input
              id="certificate-project"
              value={value.project || ""}
              maxLength={160}
              onChange={(event) => onChange({ project: event.target.value })}
              placeholder="Ej. SedInvita 2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificate-year">Año del periodo</Label>
            <Input
              id="certificate-year"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2200"
              value={value.year ?? ""}
              onChange={(event) =>
                onChange({
                  year: event.target.value ? Number(event.target.value) : "",
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2 sm:max-w-sm">
          <Label htmlFor="certificate-source">Origen de participantes</Label>
          <AdminSelect
            id="certificate-source"
            value={source}
            onChange={(event) => changeSource(event.target.value)}
          >
            {sourcesFor(kind).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>

      {source === "directory" && kind === "sedipranos" && (
        <section
          className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
          aria-label="Selección del padrón"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Seleccionar sedipranos</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={directoryLoading}
              onClick={() => setDirectoryRefresh((current) => current + 1)}
            >
              <RefreshCw className="size-4" />
              Actualizar padrón
            </Button>
          </div>
          <Tabs
            value={group}
            onValueChange={(next) => {
              setGroup(next);
              setQuery("");
            }}
          >
            <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
              {GROUPS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="gap-2"
                >
                  {item.short}
                  <Badge variant="secondary">
                    {
                      participants.filter(
                        (participant) => participant.roleType === item.value,
                      ).length
                    }
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{GROUPS[groupIndex]?.label}</h3>
            <p className="text-sm text-muted-foreground">
              {group === "director"
                ? "Selecciona una o varias personas para dirigir el proyecto."
                : "Este grupo es opcional. Las personas con otro cargo asignado no se pueden volver a seleccionar."}
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar sedipranos por nombre o área"
              placeholder="Buscar por nombre o área…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {directoryLoading ? (
            <PageLoading label="Cargando padrón de sedipranos…" />
          ) : directoryError ? (
            <PageError
              message={directoryError}
              onRetry={() => setDirectoryRefresh((current) => current + 1)}
            />
          ) : !directoryRows.length ? (
            <EmptyState
              title={
                query ? "No hay coincidencias" : "No hay sedipranos disponibles"
              }
              description={
                query
                  ? "Prueba con otro nombre o área."
                  : "Actualiza el padrón o utiliza la plantilla Excel."
              }
            />
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border divide-y">
              {directoryRows.map(({ raw, participant }) => {
                const selected = selectedFor(participant);
                const assignedElsewhere =
                  selected && selected.roleType !== group;
                const inputId = `certificate-member-${participant.memberId}`;
                return (
                  <label
                    key={participant.memberId}
                    htmlFor={inputId}
                    className={`flex items-center gap-3 px-3 py-3 ${assignedElsewhere ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"}`}
                  >
                    <AdminCheckbox
                      id={inputId}
                      checked={Boolean(selected && selected.roleType === group)}
                      disabled={Boolean(assignedElsewhere)}
                      onChange={() => toggleMember(raw)}
                      aria-label={`Seleccionar a ${participant.name}`}
                    />
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage
                        src={participant.photoUrl || raw.fotoPerfil?.url}
                        alt=""
                      />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium break-words">
                        {participant.name}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {fullArea(participant.area) || "Sin área registrada"}
                      </span>
                    </span>
                    {assignedElsewhere && (
                      <span className="max-w-32 text-right text-xs text-muted-foreground">
                        Ya en{" "}
                        {GROUPS.find(
                          (item) => item.value === selected.roleType,
                        )?.short.toLocaleLowerCase("es") || "otro grupo"}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={groupIndex === 0}
              onClick={() => {
                setGroup(GROUPS[groupIndex - 1].value);
                setQuery("");
              }}
            >
              <ArrowLeft className="size-4" />
              Grupo anterior
            </Button>
            {groupIndex < GROUPS.length - 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={
                  group === "director" &&
                  !participants.some(
                    (participant) => participant.roleType === "director",
                  )
                }
                onClick={() => {
                  setGroup(GROUPS[groupIndex + 1].value);
                  setQuery("");
                }}
              >
                Siguiente grupo
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </section>
      )}

      {source === "excel" && (
        <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Importar participantes</h2>
            <p className="text-sm text-muted-foreground">
              Completa la primera hoja de la plantilla. Se admiten hasta 500
              participantes y archivos de 10 MB.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const link = document.createElement("a");
                link.href = `/certificados/plantilla-${kind === "sedipranos" ? "sedipranos" : "externos"}.xlsx`;
                link.download = `Plantilla-Excel-Certificados-${kind === "sedipranos" ? "Sedipranos" : "Externos"}.xlsx`;
                link.click();
              }}
            >
              <Download className="size-4" />
              Descargar plantilla Excel
            </Button>
            <Button
              type="button"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
            >
              {importing ? "Leyendo Excel…" : "Cargar Excel"}
            </Button>
            <input
              ref={fileRef}
              className="sr-only"
              tabIndex={-1}
              type="file"
              accept=".xlsx,.xls"
              aria-label="Cargar participantes desde Excel"
              onChange={importExcel}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            La importación reemplaza la lista actual.{" "}
            {kind === "sedipranos"
              ? "Indica el cargo como Director/Directora, Coordinador/Coordinadora o Asesor/Asesora, y el área de cada persona."
              : "Incluye el nombre completo y el rol de cada participante."}
          </p>
        </section>
      )}

      {source === "event" && kind === "externos" && (
        <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Inscripciones de evento</h2>
            <p className="text-sm text-muted-foreground">
              Se cargarán las inscripciones confirmadas. La inscripción no
              acredita asistencia al evento.
            </p>
          </div>
          {eventsLoading ? (
            <PageLoading label="Cargando eventos…" />
          ) : eventsError ? (
            <PageError
              message={eventsError}
              onRetry={() => setEventsRefresh((current) => current + 1)}
            />
          ) : !events.length ? (
            <EmptyState
              title="No hay eventos disponibles"
              description="Utiliza un Excel o añade los participantes manualmente."
            />
          ) : (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
              <div className="w-full space-y-2 sm:max-w-lg">
                <Label htmlFor="certificate-event">Evento</Label>
                <AdminSelect
                  id="certificate-event"
                  disabled={importing}
                  value={value.eventId || ""}
                  onChange={(event) =>
                    onChange({ eventId: event.target.value })
                  }
                >
                  <option value="">Selecciona un evento</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.titulo}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <Button
                type="button"
                disabled={importing || !value.eventId}
                onClick={importEvent}
              >
                {importing ? "Cargando inscripciones…" : "Cargar inscripciones"}
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Esta carga reemplaza la lista actual. Los cambios de nombre o rol
            solo se aplican a estos certificados.
          </p>
        </section>
      )}

      {source === "manual" && kind === "externos" && (
        <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
          <h2 className="text-base font-semibold">Añadir participante</h2>
          <form
            onSubmit={addManual}
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="certificate-manual-name">Nombre completo</Label>
              <Input
                id="certificate-manual-name"
                value={manual.name}
                maxLength={180}
                onChange={(event) =>
                  setManual((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombres y apellidos"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="certificate-manual-role">Rol</Label>
              <Input
                id="certificate-manual-role"
                value={manual.role}
                maxLength={180}
                onChange={(event) =>
                  setManual((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit">
              <Plus className="size-4" />
              Añadir
            </Button>
          </form>
        </section>
      )}

      {importMessage && (
        <p role="status" className="text-sm text-muted-foreground">
          {importMessage}
        </p>
      )}
      <section
        className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
        aria-label="Participantes seleccionados"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">
            Participantes seleccionados
          </h2>
          <Badge variant="secondary">{participants.length} de 500</Badge>
        </div>
        {kind === "sedipranos" && (
          <p className="text-sm text-muted-foreground">
            Revisa los cargos y el tratamiento. Si falta el sexo en el padrón,
            elige masculino o femenino para este certificado; esta selección no
            actualiza la ficha.
          </p>
        )}
        {!participants.length ? (
          <EmptyState
            title="Aún no hay participantes"
            description="Selecciona personas del padrón, importa una lista o añade participantes para continuar."
          />
        ) : (
          <div className="max-h-96 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Cargo o rol</TableHead>
                  {kind === "sedipranos" && (
                    <>
                      <TableHead>Área</TableHead>
                      <TableHead>Tratamiento</TableHead>
                    </>
                  )}
                  <TableHead className="w-12">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      {kind === "externos" ? (
                        <Input
                          className="min-w-56"
                          aria-label={`Nombre de ${participant.name}`}
                          value={participant.name}
                          maxLength={180}
                          onChange={(event) =>
                            updateParticipant(participant.id, {
                              name: event.target.value,
                            })
                          }
                          onBlur={(event) =>
                            updateParticipant(participant.id, {
                              name: titleCase(event.target.value),
                            })
                          }
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {participant.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {kind === "externos" ? (
                        <Input
                          className="min-w-40"
                          aria-label={`Rol de ${participant.name}`}
                          value={participant.role}
                          maxLength={120}
                          onChange={(event) =>
                            updateParticipant(participant.id, {
                              role: event.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className="text-sm">
                          {roleLabel(participant.roleType, participant.sexo) ||
                            GROUPS.find(
                              (item) => item.value === participant.roleType,
                            )?.label}
                        </span>
                      )}
                    </TableCell>
                    {kind === "sedipranos" && (
                      <>
                        <TableCell className="text-sm">
                          {fullArea(participant.area) || "—"}
                        </TableCell>
                        <TableCell>
                          <AdminSelect
                            className="min-w-36"
                            aria-label={`Tratamiento de ${participant.name}`}
                            value={participant.sexo || "NO_ESPECIFICADO"}
                            onChange={(event) =>
                              updateParticipant(participant.id, {
                                sexo: event.target.value,
                                role: roleLabel(
                                  participant.roleType,
                                  event.target.value,
                                ),
                              })
                            }
                          >
                            <option value="NO_ESPECIFICADO" disabled>
                              Selecciona…
                            </option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                          </AdminSelect>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Quitar a ${participant.name}`}
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      {errors.length > 0 && (
        <div role="alert" className="space-y-1 text-sm text-destructive">
          {errors.map((message, index) => (
            <p key={`${index}-${message}`}>{message}</p>
          ))}
        </div>
      )}
      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Cambiar destinatarios
        </Button>
        <Button type="button" onClick={continueSetup} disabled={importing}>
          Continuar a plantilla y firmas
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
