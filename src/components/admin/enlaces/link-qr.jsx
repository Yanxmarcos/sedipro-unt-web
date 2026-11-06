"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Download, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";
import {
  QR_DOWNLOAD_STYLES,
  renderShortLinkQrFiles,
  exportShortLinkQrPng,
} from "@/lib/short-link-qr.mjs";
import { StateBadge } from "./link-shared";

export function LinkQr({ linkId, onClose }) {
  const [link, setLink] = useState(null);
  const [style, setStyle] = useState("institutional");
  const [result, setResult] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [exportError, setExportError] = useState("");
  const generation = useRef(0),
    exportUrl = useRef(null),
    exportPending = useRef(false);
  const styleId = useId();
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setFetching(true);
    setFetchError("");
    setLink(null);
    panelApi(`/api/enlaces/${linkId}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!cancelled) setLink(data);
      })
      .catch((failure) => {
        if (!cancelled)
          setFetchError(failure.message || "No se pudo consultar el enlace.");
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [linkId, retry]);
  useEffect(() => {
    if (!link) return;
    const counter = generation;
    const current = ++counter.current;
    let cancelled = false,
      imageUrl,
      svgUrl;
    setLoading(true);
    setError("");
    setResult(null);
    setDownloading(false);
    setExportError("");
    exportPending.current = false;
    (async () => {
      try {
        const files = await renderShortLinkQrFiles(link.urlCorta, style);
        if (cancelled) return;
        imageUrl = URL.createObjectURL(files.png);
        svgUrl = URL.createObjectURL(files.svg);
        const suffix = QR_DOWNLOAD_STYLES.find(
          (option) => option.id === style,
        ).suffix;
        setResult({ link, style, imageUrl, svgUrl, svg: files.svg, suffix });
      } catch (failure) {
        if (!cancelled)
          setError(failure.message || "No se pudo generar el QR.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (counter.current === current) counter.current++;
      exportPending.current = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      if (exportUrl.current) URL.revokeObjectURL(exportUrl.current);
      exportUrl.current = null;
    };
  }, [link, style]);
  const ready =
    result &&
    result.style === style &&
    result.link._id === linkId &&
    !fetching &&
    !loading &&
    !error &&
    !fetchError;
  function refresh() {
    generation.current++;
    setRetry((value) => value + 1);
  }
  function changeStyle(next) {
    if (
      next === style ||
      !QR_DOWNLOAD_STYLES.some((option) => option.id === next)
    )
      return;
    generation.current++;
    setResult(null);
    setStyle(next);
  }
  function close() {
    generation.current++;
    onClose();
  }
  const filename = ready
    ? `sedipro-${result.link.prefijo}-${result.link.codigo}-qr${result.suffix}`
    : "";
  async function downloadPng() {
    if (!ready || exportPending.current) return;
    exportPending.current = true;
    const current = generation.current;
    setDownloading(true);
    setExportError("");
    try {
      if (!exportUrl.current) {
        const png = await exportShortLinkQrPng(result.svg);
        if (current !== generation.current) return;
        exportUrl.current = URL.createObjectURL(png);
      }
      const anchor = document.createElement("a");
      anchor.href = exportUrl.current;
      anchor.download = `${filename}.png`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } catch (failure) {
      if (current === generation.current)
        setExportError(
          failure.message ||
            "No se pudo descargar el PNG. Vuelve a intentarlo.",
        );
    } finally {
      if (current === generation.current) {
        exportPending.current = false;
        setDownloading(false);
      }
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Código QR institucional</DialogTitle>
          <DialogDescription>
            Escanéalo para abrir el enlace de SEDIPRO UNT.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {link && (
            <div className="flex items-start justify-between gap-3">
              <p className="break-words font-medium">{link.titulo}</p>
              <StateBadge state={link.estadoEfectivo} />
            </div>
          )}
          {fetchError || error ? (
            <PageError message={fetchError || error} onRetry={refresh} />
          ) : !ready ? (
            <PageLoading label="Generando QR…" />
          ) : (
            <div
              data-testid="qr-preview"
              className="mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-lg"
            >
              <Image
                unoptimized
                src={result.imageUrl}
                alt={`Código QR de ${link.titulo}`}
                width={1024}
                height={1024}
                className="aspect-square h-full w-full"
              />
            </div>
          )}
          <fieldset className="space-y-2">
            <legend id={`${styleId}-label`} className="text-sm font-medium">
              Estilo de descarga
            </legend>
            <RadioGroup
              aria-labelledby={`${styleId}-label`}
              value={style}
              onValueChange={changeStyle}
              disabled={fetching || !link}
              className="grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {QR_DOWNLOAD_STYLES.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={`${styleId}-${option.id}`}
                  className={`min-h-11 cursor-pointer rounded-lg border px-3 py-2.5 leading-5 ${style === option.id ? "border-foreground bg-muted" : "border-input hover:bg-muted/50"}`}
                >
                  <RadioGroupItem
                    id={`${styleId}-${option.id}`}
                    value={option.id}
                  />
                  <span>{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          {style === "white-black" && (
            <p className="text-xs text-muted-foreground" role="status">
              Algunos lectores no reconocen códigos invertidos. Pruébalo con tu
              celular antes de compartirlo.
            </p>
          )}
          {ready && (
            <>
              <p className="break-all text-center text-sm text-muted-foreground">
                {link.urlCorta}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={downloading} onClick={downloadPng}>
                  <Download />
                  {downloading ? "Preparando PNG…" : "Descargar PNG"}
                </Button>
                <a
                  className={buttonVariants({ variant: "outline" })}
                  href={result.svgUrl}
                  download={`${filename}.svg`}
                >
                  <Download /> Descargar SVG
                </a>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                PNG de 4096 × 4096 px · SVG vectorial
              </p>
              {exportError && (
                <p role="alert" className="text-sm text-destructive">
                  {exportError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                El QR usa este enlace corto. Si lo pausas, vence o lo mueves a
                papelera, dejará de redirigir; al reactivarlo, el mismo QR
                vuelve a funcionar si está vigente.
              </p>
              {link.estadoEfectivo !== "activo" && (
                <p role="status" className="text-sm font-medium">
                  Este enlace no está activo. Su QR mostrará la página 404 hasta
                  que vuelva a estar disponible.
                </p>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cerrar
          </Button>
          {ready && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Regenerar código QR"
              onClick={refresh}
            >
              <RefreshCw />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
