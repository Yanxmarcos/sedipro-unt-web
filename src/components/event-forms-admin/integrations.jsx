"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, Mail, RefreshCw, Table2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { panelApi } from "@/lib/panel-api";
import { SheetEditors } from "./sheet-editors";

export function Integrations({ eventId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const result = await panelApi(`/api/eventos/${eventId}/integraciones`, {
        signal: AbortSignal.timeout(20000),
      });
      setData(result.data);
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  }, [eventId]);
  useEffect(() => {
    load();
  }, [load]);
  async function action(path, success) {
    setBusy(path);
    setNotice("");
    try {
      await panelApi(`/api/eventos/${eventId}/${path}`, {
        method: "POST",
        signal: AbortSignal.timeout(60000),
      });
      setNotice(success);
      await load();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Integraciones</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Las inscripciones se guardan primero en SEDIPRO. El correo y la hoja
          pueden sincronizarse después.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error}
          <Button variant="link" onClick={load}>
            Reintentar
          </Button>
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-muted p-4 text-sm">
          {notice}
        </p>
      )}
      {!data && !error ? (
        <p className="py-10 text-sm text-muted-foreground">
          Consultando integraciones…
        </p>
      ) : (
        data && (
          <div className="divide-y rounded-xl border bg-card">
            <section className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <h3 className="flex items-center gap-2 font-medium">
                  <Mail className="size-4" />
                  Correo de confirmación
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Envía la confirmación y permite recuperar el QR mediante
                  verificación de correo.
                </p>
              </div>
              <div className="space-y-3">
                <Badge
                  variant={data.correo?.configured ? "default" : "secondary"}
                >
                  {data.correo?.configured ? (
                    <>
                      <Check />
                      Conectado
                    </>
                  ) : (
                    "Pendiente de configuración"
                  )}
                </Badge>
                <p className="break-all text-sm">
                  {data.correo?.sender || "ti.sedipro@unitru.edu.pe"}
                </p>
                {!data.correo?.configured && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    El correo institucional aún debe autorizarse. Las
                    inscripciones seguirán guardándose y el participante podrá
                    descargar su confirmación al terminar.
                  </p>
                )}
              </div>
            </section>
            <section className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <h3 className="flex items-center gap-2 font-medium">
                  <Table2 className="size-4" />
                  Google Sheets
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Mantén una hoja del evento con sus preguntas y respuestas. La
                  conexión es opcional.
                </p>
              </div>
              <div className="space-y-3">
                <Badge
                  variant={data.sheets?.configured ? "default" : "secondary"}
                >
                  {data.sheets?.configured
                    ? "Disponible"
                    : "Pendiente de configuración"}
                </Badge>
                {data.sheets?.url && (
                  <a
                    href={data.sheets.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Abrir hoja
                    <ExternalLink />
                  </a>
                )}
                <SheetEditors
                  key={`${eventId}-${data.sheets?.revision || 0}`}
                  eventId={eventId}
                  config={data.sheets}
                  busy={busy}
                  setBusy={setBusy}
                  onSaved={async (message, failure) => {
                    setNotice(message);
                    await load();
                    if (failure) setError(failure);
                  }}
                />
                {!data.sheets?.configured && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    Configuraremos la conexión con la cuenta institucional
                    cuando esté autorizada.
                  </p>
                )}
              </div>
            </section>
            <section className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <h3 className="text-sm font-medium">Entregas pendientes</h3>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {data.pending || 0} pendientes · {data.failed || 0} con error
                </p>
              </div>
              <Button
                variant="outline"
                disabled={
                  Boolean(busy) ||
                  (!data.correo?.configured && !data.sheets?.configured) ||
                  !(data.pending || data.failed)
                }
                onClick={() =>
                  action(
                    "integraciones/reintentar",
                    "Reintento procesado. Revisa el estado de las entregas.",
                  )
                }
              >
                <RefreshCw />
                {busy === "integraciones/reintentar"
                  ? "Reintentando…"
                  : "Reintentar entregas"}
              </Button>
            </section>
          </div>
        )
      )}
    </div>
  );
}
