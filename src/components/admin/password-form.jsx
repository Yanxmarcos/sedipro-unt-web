"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { panelApi } from "@/lib/panel-api";

export function PasswordForm({ onSaved, dni, requiredChange = false }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmation: "",
  });
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event) {
    event.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmation)
      return setError("Las nuevas contraseñas no coinciden.");
    if (form.newPassword === form.currentPassword || form.newPassword === dni) {
      return setError(
        "Elige una contraseña diferente a tu DNI y a la contraseña actual.",
      );
    }
    setSaving(true);
    try {
      await panelApi("/api/auth/change-password", {
        method: "POST",
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      setForm({ currentPassword: "", newPassword: "", confirmation: "" });
      toast.success("Contraseña actualizada.");
      await onSaved?.();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {requiredChange && (
        <p className="text-sm text-muted-foreground">
          Antes de continuar, reemplaza tu contraseña inicial por una contraseña
          personal.
        </p>
      )}
      {[
        ["currentPassword", "Contraseña actual", "current-password"],
        ["newPassword", "Nueva contraseña", "new-password"],
        ["confirmation", "Confirmar nueva contraseña", "new-password"],
      ].map(([key, label, autoComplete]) => (
        <div className="space-y-2" key={key}>
          <Label htmlFor={key}>{label}</Label>
          <InputGroup>
            <InputGroupInput
              id={key}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              value={form[key]}
              minLength={key === "currentPassword" ? undefined : 8}
              maxLength={72}
              required
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  visible ? "Ocultar contraseñas" : "Mostrar contraseñas"
                }
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff /> : <Eye />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Usa al menos 8 caracteres. Tu contraseña no debe ser tu DNI.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
        {saving ? "Guardando…" : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
