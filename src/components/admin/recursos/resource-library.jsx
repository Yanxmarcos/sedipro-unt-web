"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  FileArchive,
  Images,
  History,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminSelect } from "@/components/admin/form-controls";
import { EmptyState } from "@/components/admin/page-state";
import { cn } from "@/lib/utils";
import catalog from "@/lib/resource-catalog.json";
import {
  resourceGalleryEntries,
  filterResourceEntries,
} from "@/lib/resource-gallery.mjs";
import {
  createResourceFile,
  createResourceKit,
  exportDimensions,
  resolveBackground,
} from "@/lib/resource-export.mjs";
import { usePanelSession } from "@/components/admin/panel-session";
import {
  startResourceActivity,
  downloadAuditedResource,
} from "@/lib/resource-audit.mjs";
import styles from "./resource-library.module.css";
import ResourceCopyButton from "./resource-copy-button";

const formats = {
  png: "PNG",
  svg: "SVG vectorial",
  pdf: "PDF vectorial",
  webp: "WebP",
  jpg: "JPG",
  original: "Archivo original",
};
const galleryEntries = resourceGalleryEntries(catalog);

function Preview({
  variant,
  name,
  className,
  background = null,
  inspect = "transparente",
  large = false,
  eager = false,
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        styles.preview,
        inspect === "transparente" && !background && styles.checker,
        inspect === "oscuro" && !background && "bg-zinc-800",
        inspect === "claro" && !background && "bg-white",
        className,
      )}
      style={background ? { backgroundColor: background } : undefined}
    >
      {failed ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-card p-4 text-center text-sm text-foreground">
          <Images className="size-5" />
          <span>Vista previa no disponible</span>
          {large && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFailed(false)}
            >
              Reintentar
            </Button>
          )}
        </div>
      ) : (
        <Image
          unoptimized
          src={
            variant.kind === "vector"
              ? variant.src
              : large
                ? variant.detailPreview || variant.src
                : variant.preview
          }
          alt={name}
          width={variant.width}
          height={variant.height}
          loading={large || eager ? "eager" : "lazy"}
          className={cn(
            "h-full w-full object-contain p-5",
            large && "p-6 sm:p-8",
          )}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function ResourceDetail({ asset, initialVariantId, onClose }) {
  const id = useId();
  const initialVariant =
    asset.variants.find((item) => item.id === initialVariantId) ||
    asset.variants[0];
  const [variantId, setVariantId] = useState(initialVariant.id);
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState("4096");
  const [background, setBackground] = useState("transparente");
  const [hex, setHex] = useState("#29295D");
  const [inspect, setInspect] = useState(
    initialVariant.light ? "oscuro" : "transparente",
  );
  const [busy, setBusy] = useState("");
  const [copyBusy, setCopyBusy] = useState(false);
  const working = Boolean(busy) || copyBusy;
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const controller = useRef(null),
    lock = useRef(false);
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    void startResourceActivity("ver_recurso", {
      recursoId: asset.id,
      varianteId: initialVariantId,
    }).catch(() => {
      toast.error(
        "No se pudo registrar la consulta del recurso. Revisa tu conexión.",
      );
    });
  }, [asset.id, initialVariantId]);
  const variant = asset.variants.find((item) => item.id === variantId);
  const effectiveFormat = variant.formats.includes(format) ? format : "png";
  const raw = effectiveFormat === "pdf" || effectiveFormat === "original";
  const effectiveBackground =
    !variant.transparent || effectiveFormat === "jpg"
      ? background === "transparente"
        ? "blanco"
        : background
      : background;
  const dimensions = exportDimensions(variant, raw ? "original" : size);
  const validHex = /^#[a-f\d]{6}$/i.test(hex);
  const color = raw
    ? null
    : effectiveBackground === "personalizado" && !validHex
      ? null
      : resolveBackground(
          effectiveBackground,
          hex,
          effectiveFormat,
          variant.transparent,
        );
  const category = catalog.categories.find(
    (item) => item.id === asset.category,
  ).name;
  useEffect(() => () => controller.current?.abort(), []);

  function changeVariant(next) {
    setVariantId(next);
    if (asset.variants.find((item) => item.id === next)?.light)
      setInspect("oscuro");
    setError("");
    setDone("");
  }
  async function download(kit = false) {
    if (lock.current) return;
    lock.current = true;
    controller.current = new AbortController();
    setBusy(kit ? "Preparando kit…" : "Preparando descarga…");
    setError("");
    setDone("");
    try {
      const signal = controller.current.signal;
      const details = kit
        ? { recursoId: asset.id, formato: "zip" }
        : {
            recursoId: asset.id,
            varianteId: variant.id,
            formato: effectiveFormat,
            tamano: raw ? "original" : size,
            fondo: raw ? "original" : color || "transparente",
          };
      const result = await downloadAuditedResource(
        kit ? "descargar_kit" : "descargar_recurso",
        details,
        () =>
          kit
            ? createResourceKit(asset, signal, (current, total) =>
                setBusy(`Preparando variante ${current} de ${total}…`),
              )
            : createResourceFile(asset, variant, {
                format: effectiveFormat,
                size,
                background: effectiveBackground,
                hex,
                signal,
              }),
        signal,
      );
      if (result.auditPending)
        toast.warning(
          "La descarga se inició, pero su resultado quedó pendiente en la auditoría.",
        );
      setDone(
        kit
          ? "Kit preparado. La descarga se ha iniciado."
          : "La descarga se ha iniciado.",
      );
    } catch (failure) {
      if (failure.name !== "AbortError")
        setError(
          failure.message || "No se pudo descargar. Vuelve a intentarlo.",
        );
    } finally {
      lock.current = false;
      setBusy("");
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="pr-7">
          <DialogTitle className="text-xl">{asset.name}</DialogTitle>
          <DialogDescription>
            {category} · Elige la variante y prepara tu descarga.
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="min-w-0 space-y-3">
            <Preview
              key={`${variant.id}-${asset.id}`}
              variant={variant}
              name={asset.name}
              large
              className="h-64 sm:h-80 md:h-96"
              background={color}
              inspect={inspect}
            />
            <fieldset className="flex flex-wrap items-center justify-between gap-2">
              <legend className="sr-only">Fondo de inspección</legend>
              <span className="text-xs text-muted-foreground">
                Vista previa
              </span>
              <div className="flex gap-1">
                {[
                  ["transparente", "Cuadrícula"],
                  ["claro", "Claro"],
                  ["oscuro", "Oscuro"],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={inspect === value ? "secondary" : "ghost"}
                    aria-pressed={inspect === value}
                    disabled={Boolean(color)}
                    onClick={() => setInspect(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-5 text-muted-foreground">
              {variant.kind === "vector"
                ? "Vectorial: conserva la nitidez en cualquier tamaño."
                : variant.prepared4k
                  ? `Versión restaurada y preparada a 4096 × 4096 px desde una fuente de ${variant.sourceWidth} × ${variant.sourceHeight} px. Con transparencia.`
                  : `${variant.quality === "Versión mejorada" ? "Versión mejorada de" : variant.quality === "Recorte sin fondo" ? "Recorte sin fondo de" : "Original de"} ${variant.width} × ${variant.height} px.${!variant.transparent ? " Incluye su fondo original." : " Con transparencia."}`}{" "}
              El fondo de inspección no se añade a la descarga.
            </p>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-variant`}>Variante</Label>
              <AdminSelect
                id={`${id}-variant`}
                value={variantId}
                onChange={(event) => changeVariant(event.target.value)}
                disabled={working}
              >
                {asset.variants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`${id}-format`}>Formato</Label>
                <AdminSelect
                  id={`${id}-format`}
                  value={effectiveFormat}
                  disabled={working}
                  onChange={(event) => {
                    setFormat(event.target.value);
                    setDone("");
                  }}
                >
                  {variant.formats.map((value) => (
                    <option key={value} value={value}>
                      {formats[value]}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-size`}>Tamaño</Label>
                <AdminSelect
                  id={`${id}-size`}
                  value={raw ? "original" : size}
                  disabled={raw || working}
                  onChange={(event) => {
                    setSize(event.target.value);
                    setDone("");
                  }}
                >
                  <option value="original">Original</option>
                  <option value="1024">1024 px</option>
                  <option value="2048">2048 px</option>
                  <option value="4096">4K · 4096 px</option>
                </AdminSelect>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-background`}>Fondo de descarga</Label>
              <AdminSelect
                id={`${id}-background`}
                value={raw ? "original" : effectiveBackground}
                disabled={raw || working}
                onChange={(event) => {
                  setBackground(event.target.value);
                  setDone("");
                }}
              >
                {raw && (
                  <option value="original">Fondo original del archivo</option>
                )}
                <option
                  value="transparente"
                  disabled={!variant.transparent || effectiveFormat === "jpg"}
                >
                  Transparente
                </option>
                <option value="blanco">Blanco</option>
                <option value="negro">Negro</option>
                <option value="personalizado">Color personalizado</option>
              </AdminSelect>
            </div>
            {!raw && effectiveBackground === "personalizado" && (
              <div className="space-y-2">
                <Label htmlFor={`${id}-hex`}>Código de color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    aria-label="Elegir color de fondo"
                    value={validHex ? hex : "#29295d"}
                    onChange={(event) => setHex(event.target.value)}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                    disabled={working}
                  />
                  <Input
                    id={`${id}-hex`}
                    value={hex}
                    maxLength={7}
                    onChange={(event) => setHex(event.target.value)}
                    aria-invalid={!validHex}
                    disabled={working}
                    spellCheck={false}
                  />
                </div>
                {!validHex && (
                  <p role="alert" className="text-xs text-destructive">
                    Usa seis caracteres después de #, por ejemplo #29295D.
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1 border-t pt-3 text-xs leading-5 text-muted-foreground">
              <p className="font-medium text-foreground">
                {raw
                  ? effectiveFormat === "pdf"
                    ? "PDF vectorial de la variante"
                    : "Archivo original sin modificaciones"
                  : `${dimensions.width} × ${dimensions.height} px${effectiveFormat === "svg" ? " · Vectorial" : ""}`}
              </p>
              <p>
                {raw
                  ? "Conserva el tamaño y el fondo de la fuente."
                  : variant.kind === "raster" &&
                      Math.max(dimensions.width, dimensions.height) >
                        Math.max(variant.width, variant.height)
                    ? `Ampliación desde ${variant.width} × ${variant.height} px; no añade detalle al original.`
                    : effectiveFormat === "jpg"
                      ? "JPG incluye un fondo sólido."
                      : "Se conservan las proporciones y los colores del recurso."}
              </p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {done && !busy && (
              <p role="status" className="flex gap-2 text-sm">
                <Check className="size-4 shrink-0" />
                {done}
              </p>
            )}
            <Button
              className="min-h-11 w-full"
              disabled={
                working ||
                (!raw && effectiveBackground === "personalizado" && !validHex)
              }
              onClick={() => download()}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ArrowDownToLine />
              )}
              {busy ||
                `Descargar ${effectiveFormat === "original" ? "original" : effectiveFormat.toUpperCase()}`}
            </Button>
            {asset.variants.length > 1 && (
              <Button
                className="min-h-11 w-full"
                variant="outline"
                disabled={working}
                onClick={() => download(true)}
              >
                <FileArchive />
                Descargar kit de variantes
              </Button>
            )}
            <ResourceCopyButton
              asset={asset}
              variant={variant}
              size={size}
              background={
                raw
                  ? variant.transparent
                    ? "transparente"
                    : "blanco"
                  : effectiveBackground
              }
              hex={hex}
              disabled={
                working ||
                (!raw && effectiveBackground === "personalizado" && !validHex)
              }
              onBusyChange={setCopyBusy}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Para pegar en Canva: PNG de{" "}
              {exportDimensions(variant, size).width} ×{" "}
              {exportDimensions(variant, size).height} px.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ResourceLibrary() {
  const { permissions } = usePanelSession();
  const opened = useRef(false);
  const sourceLock = useRef(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    void startResourceActivity("abrir_modulo").catch(() => {
      toast.error(
        "No se pudo registrar la entrada a Recursos institucionales. Revisa tu conexión.",
      );
    });
  }, []);
  async function downloadSource() {
    if (sourceLock.current) return;
    sourceLock.current = true;
    setSourceBusy(true);
    try {
      const result = await downloadAuditedResource(
        "descargar_fuente",
        { formato: "ai" },
        async () => {
          const response = await fetch(catalog.sourceFile);
          if (!response.ok)
            throw new Error("No se pudo cargar la fuente Illustrator.");
          return {
            blob: await response.blob(),
            filename: "sedipro-identidad.ai",
          };
        },
      );
      if (result.auditPending)
        toast.warning(
          "La descarga se inició, pero su resultado quedó pendiente en la auditoría.",
        );
    } catch (error) {
      toast.error(error.message || "No se pudo descargar la fuente.");
    } finally {
      sourceLock.current = false;
      setSourceBusy(false);
    }
  }
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("todos"),
    [selected, setSelected] = useState(null);
  const searchId = useId();
  const filtered = useMemo(
    () => filterResourceEntries(galleryEntries, category, query),
    [query, category],
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recursos institucionales
          </h1>
          <p className="text-sm text-muted-foreground">
            La marca de SEDIPRO UNT, siempre a la mano.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {permissions.canViewResourceAudit && (
            <Link
              href="/panel/recursos/auditoria"
              className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}
            >
              <History className="size-4" /> Auditoría
            </Link>
          )}
          <Button
            variant="outline"
            onClick={downloadSource}
            disabled={sourceBusy}
            className="min-h-11"
          >
            <FileArchive className="size-4" />
            {sourceBusy ? "Preparando fuente…" : "Fuente Illustrator"}{" "}
            <span className="text-xs text-muted-foreground">26 MB</span>
          </Button>
        </div>
      </div>
      <section aria-label="Biblioteca de recursos" className="space-y-5">
        <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
          <div className="relative">
            <Label htmlFor={searchId} className="sr-only">
              Buscar recursos
            </Label>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={searchId}
              placeholder="Buscar logos, áreas o poses de Hito…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 pr-11 pl-10"
            />
            {query && (
              <Button
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                size="icon"
                variant="ghost"
                onClick={() => setQuery("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Categorías de recursos"
          >
            {[{ id: "todos", name: "Todos" }, ...catalog.categories].map(
              (item) => (
                <Button
                  key={item.id}
                  aria-pressed={category === item.id}
                  variant={category === item.id ? "secondary" : "ghost"}
                  className="min-h-10"
                  onClick={() => setCategory(item.id)}
                >
                  {item.name}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {item.id === "todos"
                      ? galleryEntries.length
                      : galleryEntries.filter(
                          (entry) => entry.asset.category === item.id,
                        ).length}
                  </span>
                </Button>
              ),
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p role="status">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "recurso disponible"
              : "recursos disponibles"}
          </p>
          <p>Formatos y variantes según cada recurso</p>
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((entry, index) => {
              const { asset, variant } = entry;
              return (
                <article
                  key={entry.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/30"
                >
                  <button
                    type="button"
                    className="group m-3 mb-0 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={() => setSelected(entry)}
                    aria-label={`Ver ${entry.label}`}
                  >
                    <Preview
                      variant={variant}
                      name={asset.name}
                      className="h-44 sm:h-48"
                      inspect={variant.light ? "oscuro" : "transparente"}
                      eager={index < 3}
                    />
                    <span className="sr-only">Ver y descargar</span>
                  </button>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="space-y-2">
                      <h2 className="font-medium leading-6">{asset.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {variant.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {variant.kind === "vector"
                            ? "Vectorial"
                            : `${variant.width} × ${variant.height} px`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {variant.kind === "vector"
                            ? variant.pdf
                              ? "PNG · SVG · PDF"
                              : "PNG · SVG"
                            : variant.transparent
                              ? "Sin fondo"
                              : "Con fondo original"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(entry)}
                        className="h-auto min-h-11 min-w-0 flex-1 justify-between gap-1 px-0 text-left whitespace-normal"
                      >
                        <span>Ver y descargar</span>
                        <ArrowUpRight className="size-4 shrink-0" />
                      </Button>
                      <ResourceCopyButton
                        asset={asset}
                        variant={variant}
                        compact
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card">
            <EmptyState
              icon={Search}
              title="No encontramos recursos"
              description="Prueba otro nombre o cambia la categoría."
            />
            <div className="pb-6 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCategory("todos");
                  setQuery("");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </section>
      {selected && (
        <ResourceDetail
          key={selected.id}
          asset={selected.asset}
          initialVariantId={selected.variant.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
