"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Save, Search, Table2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { panelApi } from "@/lib/panel-api";
import { formatPersonName } from "@/lib/person-name";
import { SheetAccessList } from "./sheet-access-list";

export function SheetEditors({ eventId, config, busy, setBusy, onSaved }) {
  const [selected, setSelected] = useState(config.editors || []);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const dirty =
    JSON.stringify(selected.map((p) => p._id).sort()) !==
    JSON.stringify((config.editors || []).map((p) => p._id).sort());
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await panelApi(
          `/api/eventos/${eventId}/google-sheet?q=${encodeURIComponent(query)}`,
          {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(20000),
            ]),
          },
        );
        if (!controller.signal.aborted) {
          setCandidates(result.data);
          setHasMore(result.hasMore);
          setSearchError("");
        }
      } catch (failure) {
        if (!controller.signal.aborted) setSearchError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [eventId, query, attempt]);

  async function action(mode) {
    if (busy) return;
    setBusy(mode);
    try {
      await panelApi(`/api/eventos/${eventId}/google-sheet`, {
        method: mode === "access" ? "PATCH" : "POST",
        ...(mode !== "sync"
          ? {
              body: {
                editores: selected.map((p) => p._id),
                revision: config.revision,
              },
            }
          : {}),
        signal: AbortSignal.timeout(120000),
      });
      await onSaved(
        mode === "sync"
          ? "Respuestas sincronizadas."
          : "Hoja y accesos guardados.",
      );
    } catch (failure) {
      await onSaved("", failure.message);
    } finally {
      setBusy("");
    }
  }
  const visible = [
    ...selected.filter((p) => !candidates.some((c) => c._id === p._id)),
    ...candidates,
  ];
  return (
    <div className="space-y-4">
      <SheetAccessList eventId={eventId} config={config} busy={busy} />
      <div>
        <Label htmlFor="sheet-editor-search">Editores de la hoja</Label>
        <p
          id="sheet-editor-help"
          className="mt-1 text-xs leading-5 text-muted-foreground"
        >
          Elige hasta 20 sedipranos. Accederán con su correo institucional; la
          cuenta de TI conserva la propiedad.
        </p>
      </div>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
        />
        <Input
          id="sheet-editor-search"
          className="pl-9"
          placeholder="Buscar nombre, apellido o correo"
          aria-describedby="sheet-editor-help"
          value={query}
          disabled={Boolean(busy)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className="max-h-72 overflow-y-auto rounded-lg border"
        aria-busy={loading}
      >
        {loading && (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            Buscando sedipranos…
          </p>
        )}
        {searchError && (
          <div role="alert" className="p-4 text-sm text-destructive">
            {searchError}
            <Button variant="link" onClick={() => setAttempt((n) => n + 1)}>
              Reintentar búsqueda
            </Button>
          </div>
        )}
        {!loading && !searchError && !visible.length && (
          <p className="p-4 text-sm text-muted-foreground">
            No encontramos sedipranos activos con correo institucional.
          </p>
        )}
        {visible.map((person) => {
          const checked = selected.some((p) => p._id === person._id);
          return (
            <Label
              key={person._id}
              className="flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-muted/40"
            >
              <Checkbox
                checked={checked}
                disabled={Boolean(busy) || (!checked && selected.length >= 20)}
                onCheckedChange={(value) =>
                  setSelected((current) =>
                    value
                      ? [...current, person]
                      : current.filter((p) => p._id !== person._id),
                  )
                }
              />
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={person.fotoPerfil?.url} alt="" />
                <AvatarFallback>
                  {person.nombres?.[0]?.toUpperCase()}
                  {person.apellidos?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 text-sm">
                <span className="block break-words">
                  {formatPersonName(person.nombres, person.apellidos)}
                </span>
                <span className="block break-all text-xs leading-5 text-muted-foreground">
                  {person.correoInstitucional}
                </span>
              </span>
            </Label>
          );
        })}
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {selected.length} de 20 seleccionados
        {hasMore ? " · Busca para ver más personas" : ""}
      </p>
      <p className="text-xs leading-5 text-muted-foreground">
        Al desmarcar a alguien, solo retiramos los permisos concedidos desde
        este panel; los accesos añadidos directamente en Google se administran
        allí.
      </p>
      {config.accessPending && (
        <p role="alert" className="text-sm text-destructive">
          {config.accessError ||
            "Hay cambios de acceso pendientes. Vuelve a guardar para aplicarlos en Google."}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={
            !config.configured ||
            Boolean(busy) ||
            (Boolean(config.url) && !dirty && !config.accessPending)
          }
          onClick={() => action(config.url ? "access" : "create")}
        >
          {busy === "access" || busy === "create" ? (
            <LoaderCircle className="animate-spin" />
          ) : config.url ? (
            <Save />
          ) : (
            <Table2 />
          )}
          {busy === "access" || busy === "create"
            ? "Guardando…"
            : config.url
              ? "Guardar accesos"
              : "Crear hoja del evento"}
        </Button>
        {config.url && (
          <Button
            variant="outline"
            disabled={!config.configured || Boolean(busy)}
            onClick={() => action("sync")}
          >
            {busy === "sync" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Table2 />
            )}
            {busy === "sync" ? "Sincronizando…" : "Sincronizar respuestas"}
          </Button>
        )}
      </div>
    </div>
  );
}
