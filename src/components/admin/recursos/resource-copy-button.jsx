"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyResourceImage } from "@/lib/resource-clipboard.mjs";

export default function ResourceCopyButton({
  asset,
  variant,
  compact = false,
  size = "4096",
  background = "transparente",
  hex = "#29295D",
  disabled = false,
  onBusyChange,
}) {
  const tooltipId = useId();
  const [busy, setBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const lock = useRef(false),
    controller = useRef(null),
    timer = useRef(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      clearTimeout(timer.current);
    },
    [],
  );
  // The confirmation belongs to these settings, not to the previous variant.
  const key = `${asset.id}:${variant.id}:${size}:${background}:${hex}`;
  const success = copiedKey === key;
  async function copy() {
    if (lock.current) return;
    lock.current = true;
    controller.current = new AbortController();
    setBusy(true);
    setCopiedKey("");
    onBusyChange?.(true);
    try {
      const result = await copyResourceImage(asset, variant, {
        size,
        background,
        hex,
        signal: controller.current.signal,
      });
      setCopiedKey(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(""), 4000);
      toast.success("Imagen copiada. Ya puedes pegarla en Canva.", {
        description:
          "Usa Ctrl + V en Windows o ⌘ + V en Mac dentro de tu diseño.",
      });
      if (result.auditPending)
        toast.warning(
          "La imagen se copió, pero el registro de la operación quedó pendiente.",
        );
    } catch (error) {
      if (error.name !== "AbortError")
        toast.error(
          error.message || "No se pudo copiar. Puedes descargar el PNG.",
        );
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  const label = busy
    ? "Preparando PNG…"
    : success
      ? "Copiado para Canva"
      : "Copiar PNG para Canva";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={compact ? "ghost" : "outline"}
            className={
              compact
                ? "size-11 shrink-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent dark:hover:bg-transparent"
                : "min-h-11 w-full"
            }
            aria-label={
              compact ? `${label}: ${asset.name} · ${variant.name}` : label
            }
            aria-describedby={tooltipId}
            disabled={disabled || busy}
            onClick={copy}
          />
        }
      >
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : success ? (
          <Check className="size-5" />
        ) : (
          <Image
            src="/logos/canva.svg"
            alt=""
            aria-hidden="true"
            width={compact ? 20 : 24}
            height={compact ? 20 : 24}
            className={compact ? "size-5 shrink-0" : "size-6 shrink-0"}
            unoptimized
          />
        )}
        {!compact && label}
      </TooltipTrigger>
      <TooltipContent id={tooltipId} role="tooltip">
        {success
          ? "Copiado. Ya puedes pegarlo en Canva."
          : `Copiar imagen PNG · ${size === "original" ? "tamaño original" : `${size} px de lado mayor`}`}
      </TooltipContent>
    </Tooltip>
  );
}
