"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { panelApi } from "@/lib/panel-api";
import { formatPersonName } from "@/lib/person-name";

const roles = {
  owner: "Propietario",
  writer: "Editor",
  reader: "Lector",
  commenter: "Comentarista",
  organizer: "Administrador",
  fileOrganizer: "Gestor",
};

export function SheetAccessList({ eventId, config, busy }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(Boolean(config.url));
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const visiblePeople = people.filter(
    (person) =>
      person.rol !== "owner" ||
      person.correo?.trim().toLowerCase() !== "ti.sedipro@unitru.edu.pe",
  );
  useEffect(() => {
    if (!config.url) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await panelApi(
          `/api/eventos/${eventId}/google-sheet?mode=access`,
          {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(20000),
            ]),
          },
        );
        if (!controller.signal.aborted) setPeople(result.data);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [eventId, config.url, config.revision, attempt]);
  return (
    <section
      className="space-y-3 border-b pb-5"
      aria-labelledby="sheet-access-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 id="sheet-access-title" className="text-sm font-medium">
          Personas con acceso
        </h4>
        {config.url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading || Boolean(busy)}
            onClick={() => setAttempt((n) => n + 1)}
            aria-label="Actualizar lista de accesos"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Actualizar
          </Button>
        )}
      </div>
      {!config.url ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Aquí verás los accesos cuando crees la hoja.
        </p>
      ) : loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Verificando accesos en Google…
        </p>
      ) : error ? (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{error}</p>
          <p className="text-xs">
            Pulsa Actualizar para consultar de nuevo los permisos de Google.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs leading-5 text-muted-foreground">
            Accesos actuales de Google, incluidos los añadidos directamente en
            la hoja.
          </p>
          {visiblePeople.length ? (
            <ul className="divide-y">
              {visiblePeople.map((person) => (
                <li key={person.id} className="flex items-start gap-3 py-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={person.fotoPerfil || undefined} alt="" />
                    <AvatarFallback>
                      {person.nombre?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="break-words text-sm font-medium">
                      {person.tipo === "user"
                        ? formatPersonName(person.nombre)
                        : person.nombre}
                    </p>
                    {person.correo && (
                      <p className="break-all text-xs text-muted-foreground">
                        {person.correo}
                      </p>
                    )}
                    <Badge variant="secondary">
                      {roles[person.rol] || "Acceso autorizado"}
                    </Badge>
                    {person.tipo !== "user" && (
                      <p className="text-xs text-muted-foreground">
                        {person.tipo === "domain"
                          ? "Acceso de dominio"
                          : person.tipo === "anyone"
                            ? "Acceso mediante enlace"
                            : "Acceso de grupo"}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay otras personas con acceso a esta hoja.
            </p>
          )}
        </>
      )}
    </section>
  );
}
