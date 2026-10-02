"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Power,
  Search,
  Shield,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSelect } from "@/components/admin/form-controls";
import {
  PageError,
  PageLoading,
  EmptyState,
} from "@/components/admin/page-state";
import { ProfilePhoto } from "@/components/admin/profile-photo";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import {
  ROLE_LABELS,
  assignableRoles,
  normalizeRole,
} from "@/lib/panel-permissions.mjs";
import { UNT_CAREERS, canonicalCareer } from "@/lib/unt-careers";

const AREAS = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT"];
const date = (value) =>
  value ? new Date(value).toLocaleDateString("es-PE") : "—";
const fullName = (row) =>
  [row.nombres, row.apellidos].filter(Boolean).join(" ");
const initials = (row) =>
  [row.nombres?.[0], row.apellidos?.[0]].filter(Boolean).join("");

function memberRow(member) {
  return {
    ...member,
    memberId: member._id,
    userId: member.account?.id,
    rol: normalizeRole(member.account?.rol || "SEDIPRANO"),
    active: member.activo !== false && member.account?.active !== false,
    accountCreatedAt: member.account?.createdAt,
    lastLogin: member.account?.lastLogin,
    mustChangePassword: member.account?.mustChangePassword,
  };
}

function accountRow(account) {
  const member = account.sedipranoId || {};
  return {
    ...member,
    nombres: account.nombres,
    apellidos: account.apellidos,
    dni: account.dni,
    memberId: member._id,
    userId: account._id,
    rol: normalizeRole(account.rol),
    active: account.active !== false,
    accountCreatedAt: account.createdAt,
    lastLogin: account.lastLogin,
    mustChangePassword: account.mustChangePassword,
  };
}

function MemberEditor({ row, user, onClose, onSaved }) {
  const [record, setRecord] = useState(row || null);
  const [form, setForm] = useState({
    nombres: row?.nombres || "",
    apellidos: row?.apellidos || "",
    dni: row?.dni || "",
    area: row?.area || "",
    telefono: row?.telefono || "",
    correoInstitucional: row?.correoInstitucional || "",
    carrera: canonicalCareer(row?.carrera),
    codigoMatricula: row?.codigoMatricula || "",
    ...(!row ? { rol: "SEDIPRANO" } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const areas = [...new Set([...AREAS, row?.area].filter(Boolean))];

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const memberId = record?.memberId;
      const result = await panelApi(
        memberId ? "/api/sedipranos/" + memberId : "/api/sedipranos",
        {
          method: memberId ? "PUT" : "POST",
          body: form,
        },
      );
      const next = memberRow(result.data);
      setRecord(next);
      if (!memberId) setCreated(true);
      await onSaved();
      toast.success(
        memberId ? "Ficha actualizada." : "Sediprano y cuenta creados.",
      );
      if (memberId) onClose();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {record ? "Ficha del sediprano" : "Nuevo sediprano"}
          </DialogTitle>
          <DialogDescription>
            {record
              ? "Administra su información personal y área."
              : "Se creará también una cuenta de acceso. El usuario y la contraseña inicial serán su DNI."}
          </DialogDescription>
        </DialogHeader>
        {created && (
          <p
            role="status"
            className="rounded-lg border bg-muted/40 p-3 text-sm"
          >
            Cuenta creada. El usuario y la contraseña inicial son su DNI. Al
            ingresar deberá cambiar la contraseña. Ahora puedes añadir su foto.
          </p>
        )}
        <ProfilePhoto
          name={fullName(form)}
          url={record?.fotoPerfil?.url}
          sedipranoId={record?.memberId}
          disabled={!record || record.activo === false}
          onUploaded={async (photo) => {
            setRecord((current) => ({ ...current, fotoPerfil: photo }));
            await onSaved();
          }}
        />
        {!record && (
          <p className="text-xs text-muted-foreground">
            Guarda la ficha para habilitar la foto de perfil.
          </p>
        )}
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {!record && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="member-role">Rol inicial de la cuenta</Label>
                <AdminSelect
                  id="member-role"
                  value={form.rol}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, rol: event.target.value }))
                  }
                >
                  {assignableRoles(user).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            )}
            {[
              ["nombres", "Nombres", true],
              ["apellidos", "Apellidos", true],
              ["dni", "DNI", true],
            ].map(([key, label, required]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={"member-" + key}>{label}</Label>
                <Input
                  id={"member-" + key}
                  value={form[key]}
                  required={required}
                  maxLength={key === "dni" ? 8 : 120}
                  pattern={key === "dni" ? "[0-9]{8}" : undefined}
                  inputMode={key === "dni" ? "numeric" : undefined}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]:
                        key === "dni"
                          ? event.target.value.replace(/\D/g, "")
                          : event.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="member-area">Área</Label>
              <AdminSelect
                id="member-area"
                value={form.area}
                required
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    area: event.target.value,
                  }))
                }
              >
                <option value="">Selecciona un área</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </AdminSelect>
            </div>
            {[
              ["telefono", "Teléfono (opcional)", "tel"],
              ["codigoMatricula", "Código de matrícula", "text"],
            ].map(([key, label, type]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={"member-" + key}>{label}</Label>
                <Input
                  id={"member-" + key}
                  type={type}
                  value={form[key]}
                  maxLength={120}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="member-correoInstitucional">
                Correo institucional
              </Label>
              <Input
                id="member-correoInstitucional"
                type="email"
                value={form.correoInstitucional}
                maxLength={254}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    correoInstitucional: event.target.value
                      .trimStart()
                      .toLowerCase(),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-carrera">Carrera</Label>
              <AdminSelect
                id="member-carrera"
                value={form.carrera}
                required
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    carrera: event.target.value,
                  }))
                }
              >
                <option value="">Selecciona una carrera</option>
                {UNT_CAREERS.map((career) => (
                  <option key={career} value={career}>
                    {career}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              {created ? "Listo" : "Cancelar"}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="animate-spin" />}
              {saving
                ? "Guardando…"
                : record
                  ? "Guardar cambios"
                  : "Crear sediprano y cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberDetails({ row, onClose }) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información del sediprano</DialogTitle>
          <DialogDescription>
            Datos personales y acceso al sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-3 text-center">
          <Avatar className="size-24">
            <AvatarImage src={row.fotoPerfil?.url} alt={fullName(row)} />
            <AvatarFallback className="text-2xl">
              {initials(row)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{fullName(row)}</h2>
          <Badge variant="secondary">{ROLE_LABELS[row.rol] || row.rol}</Badge>
        </div>
        <dl className="space-y-3 border-t pt-4 text-sm">
          {[
            ["DNI / usuario", row.dni],
            ["Área", row.area],
            ["Teléfono", row.telefono],
            ["Correo institucional", row.correoInstitucional],
            ["Carrera", row.carrera],
            ["Código de matrícula", row.codigoMatricula],
            ["Estado de acceso", row.active ? "Activo" : "Inactivo"],
            ["Cuenta creada", date(row.accountCreatedAt)],
            [
              "Último ingreso",
              row.lastLogin ? date(row.lastLogin) : "Sin ingresos",
            ],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-2 gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="break-words text-right font-medium">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
        {!row.userId && (
          <p className="text-sm text-muted-foreground">
            Esta ficha aún está pendiente de vincular a una cuenta.
          </p>
        )}
        {row.mustChangePassword && (
          <p className="text-sm text-muted-foreground">
            Debe cambiar la contraseña inicial en su próximo ingreso.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({ row, user, onClose, onSaved }) {
  const [role, setRole] = useState(row.rol);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await panelApi("/api/users", {
        method: "PATCH",
        body: { userId: row.userId, rol: role },
      });
      toast.success("Rol actualizado.");
      await onSaved();
      window.dispatchEvent(new Event("panel:session-changed"));
      onClose();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestionar rol</DialogTitle>
          <DialogDescription>
            {fullName(row)} · {row.area || "Sin área"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="account-role">Rol del sistema</Label>
            <AdminSelect
              id="account-role"
              value={role}
              disabled={saving}
              onChange={(event) => setRole(event.target.value)}
            >
              {assignableRoles(user).map((key) => (
                <option key={key} value={key}>
                  {ROLE_LABELS[key]}
                </option>
              ))}
            </AdminSelect>
          </div>
          <p className="text-sm text-muted-foreground">
            El área y el rol son independientes. Un integrante de TI puede ser
            administrador.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
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
            <Button type="submit" disabled={saving || role === row.rol}>
              {saving ? "Guardando…" : "Guardar rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MemberDirectory({ mode = "members" }) {
  const { user, permissions } = usePanelSession();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [editor, setEditor] = useState(null);
  const [details, setDetails] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const result = await panelApi(
        mode === "users" ? "/api/users" : "/api/sedipranos",
      );
      setRows(
        (result.data || []).map(mode === "users" ? accountRow : memberRow),
      );
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-PE");
    return rows.filter(
      (row) =>
        (!query ||
          [
            fullName(row),
            row.dni,
            row.correoInstitucional,
            row.carrera,
            row.codigoMatricula,
          ].some((value) =>
            String(value || "")
              .toLocaleLowerCase("es-PE")
              .includes(query),
          )) &&
        (!area || row.area === area) &&
        (!role || row.rol === role) &&
        (!status || (status === "active") === row.active),
    );
  }, [rows, search, area, role, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = filtered.slice(start, start + pageSize);
  const areas = [
    ...new Set([...AREAS, ...rows.map((row) => row.area).filter(Boolean)]),
  ];

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  async function toggleStatus() {
    setSaving(true);
    setStatusError("");
    try {
      const row = statusTarget;
      if (row.memberId) {
        await panelApi("/api/sedipranos", {
          method: "PATCH",
          body: { sedipranoId: row.memberId, activo: !row.active },
        });
      } else {
        await panelApi("/api/users", {
          method: "PATCH",
          body: { userId: row.userId, active: !row.active },
        });
      }
      toast.success(row.active ? "Cuenta desactivada." : "Cuenta activada.");
      setStatusTarget(null);
      await load();
    } catch (failure) {
      setStatusError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {mode === "users" && (
        <p className="text-sm text-muted-foreground">
          Crea una cuenta con el botón “Crear cuenta” y elige su rol inicial.
          Para cambiar el rol de una cuenta existente, usa “Cambiar rol” en su fila.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total", rows.length, Users],
          ["Activos", rows.filter((row) => row.active).length, UserCheck],
          ["Inactivos", rows.filter((row) => !row.active).length, UserX],
        ].map(([label, count, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {loading ? "—" : count}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <InputGroup className="w-full sm:max-w-sm">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Buscar por nombre, DNI, carrera o matrícula"
              placeholder="Buscar por nombre o DNI…"
              value={search}
              onChange={(event) => changeFilter(setSearch, event.target.value)}
            />
          </InputGroup>
          <Button onClick={() => setEditor({ row: null })}>
            <Plus /> {mode === "users" ? "Crear cuenta" : "Nuevo sediprano"}
          </Button>
        </div>
        <div className="grid gap-3 border-b p-4 sm:grid-cols-3">
          <AdminSelect
            value={area}
            onChange={(event) => changeFilter(setArea, event.target.value)}
            aria-label="Filtrar por área"
          >
            <option value="">Todas las áreas</option>
            {areas.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            value={role}
            onChange={(event) => changeFilter(setRole, event.target.value)}
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            value={status}
            onChange={(event) => changeFilter(setStatus, event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </AdminSelect>
        </div>
        {error ? (
          <div className="p-4">
            <PageError message={error} onRetry={load} />
          </div>
        ) : loading ? (
          <PageLoading />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No se encontraron registros"
            description="Prueba con otros filtros o agrega un sediprano."
          />
        ) : (
          <Table className="min-w-[1120px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-64 pl-4">Sediprano</TableHead>
                <TableHead className="w-28">DNI</TableHead>
                <TableHead className="w-28">Área</TableHead>
                <TableHead className="w-36">Rol</TableHead>
                <TableHead className="w-44">Carrera / matrícula</TableHead>
                <TableHead className="w-32">Cuenta creada</TableHead>
                <TableHead className="w-28">Estado</TableHead>
                <TableHead className="w-52 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => {
                const protectedAccount =
                  row.userId === String(user?.id) ||
                  row.rol === "SUPERADMINISTRADOR" ||
                  (!permissions.isSuperadmin &&
                    ["ADMINISTRADOR", "SUPERADMINISTRADOR"].includes(row.rol));
                return (
                  <TableRow key={row.memberId || row.userId}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarImage
                            src={row.fotoPerfil?.url}
                            alt={fullName(row)}
                          />
                          <AvatarFallback>{initials(row)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="break-words font-medium">
                            {fullName(row)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {row.telefono || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{row.dni}</TableCell>
                    <TableCell>{row.area || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-normal">
                        {ROLE_LABELS[row.rol] || row.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p>{row.carrera || "—"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.codigoMatricula || "Sin matrícula"}
                      </p>
                    </TableCell>
                    <TableCell>{date(row.accountCreatedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={row.active ? "secondary" : "outline"}>
                        {row.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Ver ficha"
                          aria-label={"Ver ficha de " + fullName(row)}
                          onClick={() => setDetails(row)}
                        >
                          <Eye />
                        </Button>
                        {row.memberId && (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            title="Editar ficha"
                            aria-label={"Editar ficha de " + fullName(row)}
                            onClick={() => setEditor({ row })}
                          >
                            <Pencil />
                          </Button>
                        )}
                        {!protectedAccount && (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            title={
                              row.active
                                ? "Desactivar cuenta"
                                : "Activar cuenta"
                            }
                            aria-label={
                              (row.active ? "Desactivar " : "Activar ") +
                              fullName(row)
                            }
                            onClick={() => {
                              setStatusError("");
                              setStatusTarget(row);
                            }}
                          >
                            <Power />
                          </Button>
                        )}
                        {permissions.canManageRoles &&
                          row.userId &&
                          row.memberId &&
                          row.userId !== String(user?.id) &&
                          (permissions.isSuperadmin ||
                            !["ADMINISTRADOR", "SUPERADMINISTRADOR"].includes(
                              row.rol,
                            )) && (
                            <Button
                              size={mode === "users" ? "sm" : "icon-sm"}
                              variant="outline"
                              title="Cambiar rol"
                              aria-label={"Cambiar rol de " + fullName(row)}
                              onClick={() => setRoleTarget(row)}
                            >
                              <Shield />
                              {mode === "users" && <span>Cambiar rol</span>}
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm">
          <p className="text-muted-foreground">
            {filtered.length ? start + 1 : 0}–
            {Math.min(start + pageSize, filtered.length)} de {filtered.length}{" "}
            registros
          </p>
          <div className="flex items-center gap-2">
            <AdminSelect
              value={pageSize}
              onChange={(event) =>
                changeFilter(setPageSize, Number(event.target.value))
              }
              aria-label="Registros por página"
              className="w-20"
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </AdminSelect>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Página anterior"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              {currentPage} / {pages}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Página siguiente"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>

      {editor && (
        <MemberEditor
          row={editor.row}
          user={user}
          onClose={() => setEditor(null)}
          onSaved={load}
        />
      )}
      {details && (
        <MemberDetails row={details} onClose={() => setDetails(null)} />
      )}
      {roleTarget && (
        <RoleDialog
          row={roleTarget}
          user={user}
          onClose={() => setRoleTarget(null)}
          onSaved={load}
        />
      )}
      <Dialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open && !saving) setStatusTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTarget?.active ? "Desactivar cuenta" : "Activar cuenta"}
            </DialogTitle>
            <DialogDescription>
              {fullName(statusTarget || {})}.{" "}
              {statusTarget?.active
                ? "Perderá el acceso al sistema. Su ficha e historial se conservan."
                : "Podrá volver a iniciar sesión con su contraseña."}
            </DialogDescription>
          </DialogHeader>
          {statusError && (
            <p role="alert" className="text-sm text-destructive">
              {statusError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setStatusTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              disabled={saving}
              variant={statusTarget?.active ? "destructive" : "default"}
              onClick={toggleStatus}
            >
              {saving ? "Guardando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
