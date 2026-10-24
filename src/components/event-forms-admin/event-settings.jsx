"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminSelect } from "@/components/admin/form-controls";
import { VenuePicker } from "./venue-picker";
import {
  MODALITIES,
  VIRTUAL_PLATFORMS,
  hasPhysicalVenue,
  hasVirtualVenue,
  validPoint,
} from "@/lib/event-location.mjs";

export const EVENT_STATES = {
  borrador: "Borrador",
  publicado: "Publicado",
  cerrado: "Cerrado",
  finalizado: "Finalizado",
};
export function formatEventDate(value) {
  if (!value) return "Fecha por definir";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}
function localDate(value) {
  if (!value) return "";
  return new Date(new Date(value).getTime() - 5 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}
const toLimaISO = (value) =>
  value ? new Date(`${value}:00-05:00`).toISOString() : null;

export function EventSettings({
  event = {},
  onSave,
  saving,
  create = false,
  onCancel,
  onEdit,
}) {
  const [form, setForm] = useState(() => ({
    titulo: event.titulo || "",
    descripcion: event.descripcion || "",
    lugar: event.lugar || "",
    modalidad: event.modalidad || "presencial",
    plataformaVirtual: event.plataformaVirtual || "google_meet",
    ubicacion: event.ubicacion || null,
    referencia: event.referencia || "",
    fechaInicio: localDate(event.fechaInicio),
    fechaFin: localDate(event.fechaFin),
    cupo: event.cupo || "",
    qrHabilitado: event.qrHabilitado ?? false,
    aperturaInscripciones: localDate(event.aperturaInscripciones),
    cierreInscripciones: localDate(event.cierreInscripciones),
  }));
  const [error, setError] = useState("");
  const set = (key, value) => {
    if (saving) return;
    setForm((current) => ({ ...current, [key]: value }));
    onEdit?.();
  };
  function submit(e) {
    e.preventDefault();
    if (saving) return;
    if (hasPhysicalVenue(form.modalidad) && !validPoint(form.ubicacion)) {
      setError("Selecciona el lugar en el mapa antes de guardar.");
      return;
    }
    if (form.fechaFin && form.fechaFin < form.fechaInicio) {
      setError("La fecha de fin debe ser posterior al inicio.");
      return;
    }
    if (
      form.aperturaInscripciones &&
      form.cierreInscripciones &&
      form.cierreInscripciones <= form.aperturaInscripciones
    ) {
      setError("El cierre de inscripciones debe ser posterior a la apertura.");
      return;
    }
    setError("");
    const values = {
      ...form,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      lugar: form.lugar.trim(),
      referencia: form.referencia.trim(),
      ...(!hasPhysicalVenue(form.modalidad)
        ? { lugar: "", referencia: "", ubicacion: null }
        : {}),
      ...(!hasVirtualVenue(form.modalidad) ? { plataformaVirtual: "" } : {}),
      fechaInicio: toLimaISO(form.fechaInicio),
      fechaFin: toLimaISO(form.fechaFin),
      cupo: form.cupo ? Number(form.cupo) : null,
    };
    if (create) {
      delete values.aperturaInscripciones;
      delete values.cierreInscripciones;
    } else {
      values.aperturaInscripciones = toLimaISO(form.aperturaInscripciones);
      values.cierreInscripciones = toLimaISO(form.cierreInscripciones);
    }
    onSave(values);
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="evento-titulo">Nombre del evento</Label>
        <Input
          id="evento-titulo"
          required
          maxLength={160}
          value={form.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          placeholder="Ej. Encuentro de dirección de proyectos"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="evento-descripcion">Descripción</Label>
        <Textarea
          id="evento-descripcion"
          rows={3}
          maxLength={5000}
          value={form.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          placeholder="Cuéntales de qué trata y qué necesitan saber antes de inscribirse."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="evento-inicio">Inicio</Label>
          <Input
            id="evento-inicio"
            type="datetime-local"
            required
            value={form.fechaInicio}
            onChange={(e) => set("fechaInicio", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="evento-fin">
            Fin{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Input
            id="evento-fin"
            type="datetime-local"
            min={form.fechaInicio}
            value={form.fechaFin}
            onChange={(e) => set("fechaFin", e.target.value)}
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Todas las fechas se configuran en hora de Perú.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="evento-modalidad">Modalidad</Label>
          <AdminSelect
            id="evento-modalidad"
            value={form.modalidad}
            disabled={saving}
            onChange={(e) => set("modalidad", e.target.value)}
          >
            {MODALITIES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="evento-cupo">Cupo máximo</Label>
          <Input
            id="evento-cupo"
            type="number"
            min={1}
            max={1000000}
            step={1}
            value={form.cupo}
            onChange={(e) => set("cupo", e.target.value)}
            placeholder="Sin límite"
          />
        </div>
      </div>
      {hasVirtualVenue(form.modalidad) && (
        <div className="space-y-2">
          <Label htmlFor="evento-plataforma">Plataforma virtual</Label>
          <AdminSelect
            id="evento-plataforma"
            value={form.plataformaVirtual}
            disabled={saving}
            onChange={(e) => set("plataformaVirtual", e.target.value)}
          >
            {VIRTUAL_PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </AdminSelect>
        </div>
      )}
      {hasPhysicalVenue(form.modalidad) && (
        <VenuePicker
          value={form}
          disabled={saving}
          onChange={(patch) => {
            setForm((current) => ({ ...current, ...patch }));
            onEdit?.();
          }}
        />
      )}
      {!create && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="evento-apertura">Apertura de inscripciones</Label>
            <Input
              id="evento-apertura"
              type="datetime-local"
              value={form.aperturaInscripciones}
              onChange={(e) => set("aperturaInscripciones", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Vacío: al publicar y abrir el formulario.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="evento-cierre">Cierre de inscripciones</Label>
            <Input
              id="evento-cierre"
              type="datetime-local"
              min={form.aperturaInscripciones}
              value={form.cierreInscripciones}
              onChange={(e) => set("cierreInscripciones", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Vacío: hasta que cierres el formulario.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-5 rounded-lg bg-muted/60 p-4">
        <div>
          <Label htmlFor="evento-qr" className="cursor-pointer">
            Entregar un QR de inscripción
          </Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Cada participante recibirá su código al confirmar. Puedes usarlo
            para verificar el ingreso más adelante.
          </p>
        </div>
        <Switch
          id="evento-qr"
          checked={form.qrHabilitado}
          onCheckedChange={(checked) => set("qrHabilitado", checked)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving
            ? "Guardando…"
            : create
              ? "Crear y preparar formulario"
              : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}
