"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  renderShortLinkQrFiles,
  exportShortLinkQrPng,
} from "@/lib/short-link-qr.mjs";
import { StateBadge } from "./link-shared";

export function LinkQr({ linkId, onClose }) {
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [loading, setLoading] = useState(true),
    [downloading, setDownloading] = useState(false),
    [exportError, setExportError] = useState("");
  const generation = useRef(0),
    exportUrl = useRef(null),
    exportPending = useRef(false);
  useEffect(() => {
    const currentGeneration = ++generation.current;
    let cancelled = false,
      imageUrl,
      svgUrl;
    setLoading(true);
    setError("");
    setResult(null);
    setDownloading(false);
    setExportError("");
    (async () => {
      try {
        const { data: link } = await panelApi(`/api/enlaces/${linkId}`);
        if (cancelled) return;
        const files = await renderShortLinkQrFiles(link.urlCorta);
        if (cancelled) return;
        imageUrl = URL.createObjectURL(files.png);
        svgUrl = URL.createObjectURL(files.svg);
        setResult({ link, imageUrl, svgUrl, svg: files.svg });
      } catch (failure) {
        if (!cancelled)
          setError(failure.message || "No se pudo generar el QR.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      generation.current = currentGeneration + 1;
      exportPending.current = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      if (exportUrl.current) URL.revokeObjectURL(exportUrl.current);
      exportUrl.current = null;
    };
  }, [linkId, retry]);
  async function downloadPng() {
    if (!result || exportPending.current) return;
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
      anchor.download = `sedipro-${result.link.prefijo}-${result.link.codigo}-qr.png`;
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
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Código QR institucional</DialogTitle>
          <DialogDescription>
            Escanéalo para abrir el enlace de SEDIPRO UNT.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <PageLoading label="Generando QR…" />
        ) : error ? (
          <PageError
            message={error}
            onRetry={() => setRetry((value) => value + 1)}
          />
        ) : (
          result && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="break-words font-medium">{result.link.titulo}</p>
                <StateBadge state={result.link.estadoEfectivo} />
              </div>
              <Image
                unoptimized
                src={result.imageUrl}
                alt={`Código QR de ${result.link.titulo}`}
                width={1024}
                height={1024}
                className="mx-auto aspect-square w-full max-w-72 rounded-lg bg-white"
              />
              <p className="break-all text-center text-sm text-muted-foreground">
                {result.link.urlCorta}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={downloading} onClick={downloadPng}>
                  <Download />{" "}
                  {downloading ? "Preparando PNG…" : "Descargar PNG"}
                </Button>
                <a
                  className={buttonVariants({ variant: "outline" })}
                  href={result.svgUrl}
                  download={`sedipro-${result.link.prefijo}-${result.link.codigo}-qr.svg`}
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
              {result.link.estadoEfectivo !== "activo" && (
                <p role="status" className="text-sm font-medium">
                  Este enlace no está activo. Su QR mostrará la página 404 hasta
                  que vuelva a estar disponible.
                </p>
              )}
            </div>
          )
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {result && !loading && !error && (
            <>
              <Button
                variant="outline"
                size="icon"
                aria-label="Regenerar código QR"
                onClick={() => setRetry((value) => value + 1)}
              >
                <RefreshCw />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
