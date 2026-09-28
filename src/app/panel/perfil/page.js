"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfilePhoto } from "@/components/admin/profile-photo";
import { PasswordForm } from "@/components/admin/password-form";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { ROLE_LABELS, normalizeRole } from "@/lib/panel-permissions.mjs";
import { UNT_CAREERS, canonicalCareer } from "@/lib/unt-careers";
import { AdminSelect } from "@/components/admin/form-controls";

export default function PerfilPage() {
  const { user, refresh } = usePanelSession();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    telefono: "",
    correoInstitucional: "",
    carrera: "",
    codigoMatricula: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await panelApi("/api/profile/me");
      setProfile(data);
      setForm({
        telefono: String(data.telefono || "")
          .replace(/\D/g, "")
          .slice(0, 9),
        correoInstitucional: data.correoInstitucional || "",
        carrera: canonicalCareer(data.carrera),
        codigoMatricula: String(data.codigoMatricula || "")
          .replace(/\D/g, "")
          .slice(0, 10),
      });
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event) {
    event.preventDefault();

    if (form.telefono && !/^\d{1,9}$/.test(form.telefono)) {
      toast.error("El teléfono debe contener hasta 9 dígitos.");
      return;
    }

    if (form.codigoMatricula && !/^\d{10}$/.test(form.codigoMatricula)) {
      toast.error("El código de matrícula debe tener exactamente 10 dígitos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correoInstitucional)) {
      toast.error("Ingresa un correo institucional válido.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await panelApi("/api/profile/me", {
        method: "PATCH",
        body: form,
      });
      setProfile((current) => ({ ...current, ...data }));
      toast.success("Datos de perfil actualizados.");
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  const name = [profile.nombres, profile.apellidos].filter(Boolean).join(" ");
  const accountDate = profile.accountCreatedAt
    ? new Date(profile.accountCreatedAt).toLocaleDateString("es-PE", {
        dateStyle: "long",
      })
    : "No disponible";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu información personal y la seguridad de tu cuenta.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            <span className="mr-2">{profile.area || "Sin área asignada"}</span>
            <Badge variant="secondary">
              {ROLE_LABELS[normalizeRole(profile.rol)] || profile.rol}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-1">
              <h2 className="font-semibold">Información personal</h2>
              <p className="text-sm text-muted-foreground">
                Actualiza tu foto y tus datos de contacto.
              </p>
            </div>
            <div className="space-y-6 lg:col-span-2">
              {profile.linked !== false && (
                <ProfilePhoto
                  name={name}
                  url={profile.fotoPerfil?.url}
                  onUploaded={(photo) =>
                    setProfile((current) => ({ ...current, fotoPerfil: photo }))
                  }
                />
              )}
              {profile.linked === false && (
                <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Tu cuenta todavía no está vinculada a una ficha de sediprano.
                  Administración debe completar la vinculación para habilitar la
                  foto y los datos personales.
                </p>
              )}
              <form onSubmit={save} noValidate className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    ["nombres", "Nombres", profile.nombres],
                    ["apellidos", "Apellidos", profile.apellidos],
                    ["dni", "DNI / usuario", profile.dni],
                    ["area", "Área", profile.area || "Sin área asignada"],
                  ].map(([key, label, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        value={value || ""}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                  ))}
                  {[
                    ["telefono", "Teléfono (opcional)", 9],
                    ["codigoMatricula", "Código de matrícula (opcional)", 10],
                  ].map(([key, label, maxLength]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        type="text"
                        inputMode="numeric"
                        autoComplete={key === "telefono" ? "tel" : "off"}
                        value={form[key]}
                        minLength={key === "codigoMatricula" ? 10 : undefined}
                        pattern={
                          key === "codigoMatricula" ? "[0-9]{10}" : "[0-9]{0,9}"
                        }
                        disabled={saving || profile.linked === false}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [key]: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, maxLength),
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor="correoInstitucional">
                      Correo institucional
                    </Label>
                    <Input
                      id="correoInstitucional"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.correoInstitucional}
                      maxLength={254}
                      required
                      disabled={saving || profile.linked === false}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          correoInstitucional: event.target.value
                            .trimStart()
                            .toLowerCase()
                            .slice(0, 254),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <AdminSelect
                      id="carrera"
                      value={form.carrera}
                      required
                      disabled={saving || profile.linked === false}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          carrera: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecciona tu carrera</option>
                      {UNT_CAREERS.map((career) => (
                        <option key={career} value={career}>
                          {career}
                        </option>
                      ))}
                    </AdminSelect>
                  </div>
                  <div className="space-y-2">
                    <Label>Cuenta creada</Label>
                    <p className="py-2 text-sm">{accountDate}</p>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={saving || profile.linked === false}
                >
                  {saving ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </form>
            </div>
          </div>
          <Separator />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-1">
              <h2 className="font-semibold">Seguridad</h2>
              <p className="text-sm text-muted-foreground">
                Cambia tu contraseña cuando lo necesites.
              </p>
            </div>
            <div className="max-w-xl lg:col-span-2">
              <PasswordForm dni={user?.dni} onSaved={refresh} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
