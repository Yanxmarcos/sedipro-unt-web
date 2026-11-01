"use client";
import { useEffect, useState } from "react";
import { Check, Link2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminConfirm } from "@/components/admin/form-controls";
import { panelApi } from "@/lib/panel-api";
import { PLATFORMS, TYPES, limaInput, expiryFromInput } from "./link-utils.mjs";
import { CopyLink } from "./link-shared";

export function LinkForm({ link, onClose, onSaved, onReload }) {
  const [values, setValues] = useState({
    titulo: link?.titulo || "",
    urlDestino: link?.urlDestino || "",
    campana: link?.campana || "",
    nota: link?.nota || "",
    venceAt: limaInput(link?.venceAt),
  });
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [detection, setDetection] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    if (!values.urlDestino.trim()) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setDetecting(true);
      setDetection(null);
      setDetectionError("");
      try {
        const result = await panelApi("/api/enlaces/detectar", {
          method: "POST",
          body: { urlDestino: values.urlDestino.trim() },
          signal: controller.signal,
        });
        if (active) setDetection(result.data);
      } catch (failure) {
        if (active) setDetectionError(failure.message);
      } finally {
        if (active) setDetecting(false);
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [values.urlDestino]);

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFields((current) => ({ ...current, [name]: undefined }));
    if (name === "urlDestino") {
      setDetection(null);
      setDetectionError("");
      setDetecting(false);
    }
  }
  async function save(body) {
    if (saving) return;
    setSaving(true);
    setError("");
    setFields({});
    try {
      const result = await panelApi(
        link ? `/api/enlaces/${link._id}` : "/api/enlaces",
        { method: link ? "PATCH" : "POST", body },
      );
      toast.success(link ? "Enlace actualizado." : "Enlace creado.");
      if (!link) setCreated(result.data);
      onSaved(result.data, Boolean(link));
    } catch (failure) {
      setError(failure.message);
      setFields(failure.fields || {});
      setConflict(failure.status === 409);
    } finally {
      setSaving(false);
      setConfirmation(null);
    }
  }
  function submit(event) {
    event.preventDefault();
    try {
      const body = {
        ...values,
        urlDestino: values.urlDestino.trim(),
        venceAt: expiryFromInput(values.venceAt),
        ...(link ? { revision: link.revision } : {}),
      };
      if (link && body.urlDestino !== link.urlDestino) setConfirmation(body);
      else save(body);
    } catch (failure) {
      setError(failure.message);
    }
  }
  const input = (name, label, props = {}) => (
    <div className="space-y-2">
      <Label htmlFor={`link-${name}`}>{label}</Label>
      <Input
        id={`link-${name}`}
        value={values[name]}
        onChange={(event) => change(name, event.target.value)}
        disabled={saving || conflict}
        aria-invalid={Boolean(fields[name])}
        aria-describedby={fields[name] ? `link-${name}-error` : undefined}
        {...props}
      />
      {fields[name] && (
        <p id={`link-${name}-error`} className="text-xs text-destructive">
          {fields[name]}
        </p>
      )}
    </div>
  );
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open && !saving) onClose();
        }}
      >
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
          showCloseButton={!saving}
        >
          <DialogHeader>
            <DialogTitle>
              {created
                ? "Enlace listo para compartir"
                : link
                  ? "Editar enlace"
                  : "Crear enlace"}
            </DialogTitle>
            <DialogDescription>
              {created
                ? "Tu enlace institucional ya está disponible."
                : "El destino se abrirá directamente, sin pantallas intermedias."}
            </DialogDescription>
          </DialogHeader>
          {created ? (
            <div className="space-y-5">
              <div
                className="flex items-center gap-2 text-sm font-medium"
                role="status"
              >
                <Check className="size-4" />
                {created.titulo}
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-link">Enlace institucional</Label>
                <Input
                  id="created-link"
                  readOnly
                  value={created.urlCorta}
                  onFocus={(event) => event.target.select()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
                <CopyLink url={created.urlCorta} title={created.titulo} text />
              </DialogFooter>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              {input("titulo", "Título interno", {
                required: true,
                maxLength: 160,
                placeholder: "Título interno",
                autoFocus: true,
              })}
              {input("urlDestino", "URL de destino", {
                required: true,
                type: "url",
                maxLength: 4096,
                placeholder: "https://",
                autoComplete: "off",
              })}
              <div
                className="min-h-5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {detecting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="size-3 animate-spin" />
                    Comprobando destino…
                  </span>
                ) : detection ? (
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    <Link2 className="size-3" />
                    {PLATFORMS[detection.prefijo]} ·{" "}
                    {TYPES[detection.tipoDestino]} · Prefijo /
                    {link?.prefijo || detection.prefijo}/
                  </span>
                ) : (
                  detectionError ||
                  "Se detectarán la plataforma y el tipo de enlace automáticamente."
                )}
              </div>
              {link && (
                <p className="break-words rounded-lg bg-muted p-3 text-xs leading-5">
                  El enlace publicado se conserva:{" "}
                  <span className="font-medium">{link.urlCorta}</span>. Para
                  cambiar de plataforma, crea otro enlace.
                </p>
              )}
              {input("campana", "Campaña (opcional)", {
                maxLength: 160,
                placeholder: "Nombre de la campaña",
              })}
              <div className="space-y-2">
                <Label htmlFor="link-nota">Nota interna (opcional)</Label>
                <Textarea
                  id="link-nota"
                  value={values.nota}
                  maxLength={1000}
                  rows={2}
                  disabled={saving || conflict}
                  onChange={(event) => change("nota", event.target.value)}
                  aria-invalid={Boolean(fields.nota)}
                />
                {fields.nota && (
                  <p className="text-xs text-destructive">{fields.nota}</p>
                )}
              </div>
              {input("venceAt", "Vencimiento (opcional)", {
                type: "datetime-local",
                min: "1900-01-01T00:00",
                max: "2200-12-31T23:59",
              })}
              <p className="text-xs text-muted-foreground">
                Sin fecha, el enlace permanece disponible hasta que lo pauses o
                elimines.
              </p>
              {error && (
                <div
                  role="alert"
                  className="space-y-2 text-sm text-destructive"
                >
                  <p>{error}</p>
                  {conflict && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => onReload(link._id)}
                    >
                      Recargar enlace
                    </Button>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || conflict}>
                  {saving && <LoaderCircle className="animate-spin" />}
                  {saving
                    ? "Guardando…"
                    : link
                      ? "Guardar cambios"
                      : "Crear enlace"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AdminConfirm
        show={Boolean(confirmation)}
        title="Cambiar el destino publicado"
        message="La misma URL institucional que ya compartiste abrirá el nuevo destino. ¿Deseas aplicar este cambio?"
        confirmText={saving ? "Guardando…" : "Cambiar destino y guardar"}
        onConfirm={() => save(confirmation)}
        onCancel={() => {
          if (!saving) setConfirmation(null);
        }}
      />
    </>
  );
}
