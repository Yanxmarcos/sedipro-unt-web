"use client";
import { usePanelSession } from "@/components/admin/panel-session";

import {
  UserPlus as AdminUserPlusIcon,
  X as AdminXIcon,
  UserX as AdminUserXIcon,
  Search as AdminSearchIcon,
  LoaderCircle as AdminLoaderCircleIcon,
  Trash2 as AdminTrash2Icon,
  Plus as AdminPlusIcon,
  ClipboardCheck as AdminClipboardCheckIcon,
  Calendar as AdminCalendarIcon,
  Eye as AdminEyeIcon,
  Pencil as AdminPencilIcon,
  FileSpreadsheet as AdminFileSpreadsheetIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminToast } from "@/components/admin/form-controls";
import { Label } from "@/components/ui/label";
import {
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AdminModal } from "@/components/admin/form-controls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportAttendanceToExcel } from "@/lib/export-attendance";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const meses = [
    "ene.",
    "feb.",
    "mar.",
    "abr.",
    "may.",
    "jun.",
    "jul.",
    "ago.",
    "sep.",
    "oct.",
    "nov.",
    "dic.",
  ];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}
function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}
function initials(nombres, apellidos) {
  return `${nombres?.[0] ?? ""}${apellidos?.[0] ?? ""}`.toUpperCase();
}
function EncargadosCell({ encargados, dark, onOpen }) {
  const MAX_VISIBLE = 3;
  if (!encargados?.length) {
    return (
      <Button
        onClick={onOpen}
        title="Asignar encargado"
        variant="outline"
        type="button"
        className="flex items-center"
      >
        <AdminUserPlusIcon className="size-4" />
        Sin asignación
      </Button>
    );
  }
  const visible = encargados.slice(0, MAX_VISIBLE);
  const extra = encargados.length - MAX_VISIBLE;
  return (
    <Button
      onClick={onOpen}
      title={`Ver encargados (${encargados.length})`}
      variant="outline"
      type="button"
      className="flex items-center h-auto min-h-9 whitespace-normal py-3"
    >
      <div className="flex items-center">
        {visible.map((enc, i) => (
          <Avatar
            key={enc._id}
            title={`${enc.nombres} ${enc.apellidos}`}
            style={{
              width: "26px",
              height: "26px",
              zIndex: MAX_VISIBLE - i,
            }}
            className="-ml-2 shrink-0 border first:ml-0"
          >
            <AvatarImage
              src={enc.fotoPerfil?.url || undefined}
              alt={`${enc.nombres || ""} ${enc.apellidos || ""}`.trim()}
            />
            <AvatarFallback className="bg-current/10 text-xs font-semibold text-current">
              {initials(enc.nombres, enc.apellidos)}
            </AvatarFallback>
          </Avatar>
        ))}
        {extra > 0 && (
          <div
            style={{
              width: "26px",
              height: "26px",
            }}
            className="rounded-full bg-current/10 flex items-center justify-center text-current text-xs font-semibold border -ml-2 shrink-0"
          >
            +{extra}
          </div>
        )}
      </div>
      <span className="text-sm font-semibold text-current whitespace-nowrap">
        {encargados.length === 1
          ? encargados[0].nombres
          : `${encargados.length} enc.`}
      </span>
    </Button>
  );
}
function ModalEncargados({
  dark,
  asistencia,
  encargados,
  onClose,
  onAgregar,
  onEliminar,
  eliminando,
}) {
  const { permissions } = usePanelSession();
  const [confirmEl, setConfirmEl] = useState(null);
  return (
    <AdminModal onClose={onClose}>
      <div className="space-y-6">
        <div className="border-b flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-foreground m-0 text-lg font-semibold">
              Encargados de asistencia
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">
              {asistencia.descripcion} · {formatDate(asistencia.fecha)}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            type="button"
            className="flex items-center justify-center"
            size="icon-sm"
            aria-label="Cerrar"
          >
            <AdminXIcon className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {encargados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No hay encargados asignados aún
            </div>
          ) : (
            encargados.map((enc, i) => (
              <div
                key={enc._id}
                className="flex items-center gap-3 pt-3 pr-6 pb-3 pl-6 border-b"
              >
                <Avatar className="size-10 shrink-0 border">
                  <AvatarImage
                    src={enc.fotoPerfil?.url || undefined}
                    alt={`${enc.nombres || ""} ${enc.apellidos || ""}`.trim()}
                  />
                  <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                    {initials(enc.nombres, enc.apellidos)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                    {enc.nombres} {enc.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground m-0">
                    DNI: {enc.dni} · Accede con su cuenta personal
                  </p>
                </div>

                {permissions.canDelete &&
                  (confirmEl?._id === enc._id ? (
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        onClick={() => setConfirmEl(null)}
                        variant="outline"
                        type="button"
                      >
                        No
                      </Button>
                      <Button
                        onClick={() => {
                          onEliminar(enc);
                          setConfirmEl(null);
                        }}
                        disabled={eliminando === enc._id}
                        variant="destructive"
                        type="button"
                      >
                        {eliminando === enc._id ? "…" : "Sí"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setConfirmEl(enc)}
                      title="Quitar encargado"
                      variant="destructive"
                      type="button"
                      className="flex items-center justify-center shrink-0"
                      size="icon-sm"
                    >
                      <AdminUserXIcon className="size-4" />
                    </Button>
                  ))}
              </div>
            ))
          )}
        </div>

        <div className="border-t shrink-0">
          <Button
            onClick={onAgregar}
            variant="default"
            type="button"
            className="w-full flex items-center justify-center"
          >
            <AdminUserPlusIcon className="size-4" />
            Agregar encargado
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
function ModalAgregarEncargado({
  dark,
  asistencia,
  encargadosActuales,
  onClose,
  onAsignado,
}) {
  const [sedipranos, setSedipranos] = useState([]);
  const [loadingSed, setLoadingSed] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const yaAsignadosIds = new Set(
    encargadosActuales.map((e) => e.sedipranoId?.toString()),
  );
  useEffect(() => {
    fetch("/api/sedipranos")
      .then((r) => r.json())
      .then((d) => {
        const lista = (d.data || []).filter((s) => s.activo !== false);
        setSedipranos(lista);
      })
      .catch(() => {})
      .finally(() => setLoadingSed(false));
  }, []);
  const filtrados = sedipranos.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.nombres?.toLowerCase().includes(q) ||
      s.apellidos?.toLowerCase().includes(q) ||
      s.dni?.includes(q) ||
      s.area?.toLowerCase().includes(q)
    );
  });
  async function handleAsignar() {
    if (!selected) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/encargados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asistenciaId: asistencia._id,
          sedipranoId: selected._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onAsignado(data.encargado);
    } catch (err) {
      setErrorMsg(err.message || "Error al asignar encargado");
    } finally {
      setSaving(false);
    }
  }
  return (
    <AdminModal onClose={onClose}>
      <div className="space-y-6">
        <div className="border-b flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-foreground m-0 text-lg font-semibold">
              Agregar encargado
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">
              {asistencia.descripcion} · {formatDate(asistencia.fecha)}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            type="button"
            className="flex items-center justify-center"
            size="icon-sm"
            aria-label="Cerrar"
          >
            <AdminXIcon className="size-4" />
          </Button>
        </div>

        <div className="border-b shrink-0">
          <div className="relative">
            <span
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              className="absolute text-muted-foreground flex"
            >
              <AdminSearchIcon className="size-4" />
            </span>
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI o área…"
              className="w-full pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingSed ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Cargando sedipranos…
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {search ? "Sin resultados" : "No hay sedipranos disponibles"}
            </div>
          ) : (
            filtrados.map((s) => {
              const yaAsignado = yaAsignadosIds.has(s._id?.toString());
              const isSel = selected?._id === s._id;
              return (
                <Button
                  key={s._id}
                  onClick={() => !yaAsignado && setSelected(isSel ? null : s)}
                  disabled={yaAsignado}
                  type="button"
                  variant={isSel ? "default" : "outline"}
                  style={{
                    opacity: yaAsignado ? 0.45 : 1,
                  }}
                  className="w-full flex items-center h-auto min-h-9 whitespace-normal py-3"
                >
                  <Avatar className="size-9 shrink-0 border border-current/15">
                    <AvatarImage
                      src={s.fotoPerfil?.url || undefined}
                      alt={`${s.nombres || ""} ${s.apellidos || ""}`.trim()}
                    />
                    <AvatarFallback className="bg-current/10 text-sm font-semibold text-current">
                      {initials(s.nombres, s.apellidos)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-current m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                      {s.nombres} {s.apellidos}
                      {yaAsignado && (
                        <span className="text-xs ml-1.5 text-current font-semibold">
                          • ya asignado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-current m-0">
                      {s.area} · DNI: {s.dni}
                    </p>
                  </div>
                  {isSel && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      className="rounded-full bg-current/10 flex items-center justify-center shrink-0"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </Button>
              );
            })
          )}
        </div>

        {errorMsg && (
          <div className="mt-2 mr-6 mb-2 ml-6 pt-2 pr-3 pb-2 pl-3 rounded-xl bg-muted border text-destructive text-sm shrink-0">
            {errorMsg}
          </div>
        )}

        <div className="border-t flex gap-2 shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            type="button"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAsignar}
            disabled={!selected || saving}
            type="button"
            variant={selected && !saving ? "default" : "outline"}
            style={{
              flex: 2,
            }}
            className="flex items-center justify-center"
          >
            {saving ? (
              <>
                <AdminLoaderCircleIcon className="size-4 animate-spin" />{" "}
                Asignando…
              </>
            ) : (
              <>
                <AdminUserPlusIcon className="size-4" />{" "}
                {selected ? `Asignar a ${selected.nombres}` : "Selecciona uno"}
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
function ConfirmDialog({ dark, title, message, onConfirm, onCancel }) {
  return (
    <AdminModal onClose={onCancel}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{
              width: "40px",
              height: "40px",
            }}
            className="rounded-full bg-muted flex items-center justify-center shrink-0"
          >
            <AdminTrash2Icon className="size-4" />
          </div>
          <h3 className="text-foreground m-0 text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            type="button"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="outline"
            type="button"
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
function SkeletonRows({ dark, count = 5 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[80, "60%", 90, 110, 120].map((w, j) => (
        <TableCell key={j}>
          <div
            style={{
              height: "14px",
              width: w,
            }}
            className="rounded-xl bg-muted animate-pulse"
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
export default function AsistenciasPage() {
  const router = useRouter();
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fecha: todayISO(),
    descripcion: "",
  });
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [modalGestionar, setModalGestionar] = useState(null);
  const [modalAgregar, setModalAgregar] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const fetchAsistencias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/asistencias");
      const data = await res.json();
      setAsistencias(data.asistencias || []);
    } catch {
      showToast("Error al cargar asistencias", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchAsistencias();
  }, [fetchAsistencias]);
  function showToast(msg, type = "success") {
    setToast({
      msg,
      type,
    });
    setTimeout(() => setToast(null), 3500);
  }
  async function handleCreate() {
    setFormError("");
    if (!formData.fecha) return setFormError("La fecha es requerida");
    if (!formData.descripcion.trim())
      return setFormError("La descripción es requerida");
    setCreating(true);
    try {
      const res = await fetch("/api/asistencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Asistencia creada correctamente");
      setShowForm(false);
      setFormData({
        fecha: todayISO(),
        descripcion: "",
      });
      fetchAsistencias();
    } catch (err) {
      setFormError(err.message || "Error al crear asistencia");
    } finally {
      setCreating(false);
    }
  }
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/asistencias/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Asistencia eliminada");
      setDeleteTarget(null);
      fetchAsistencias();
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }
  async function handleExport(asistencia) {
    setExportingId(asistencia._id);
    try {
      const response = await fetch(`/api/asistencias/${asistencia._id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const attendance = data.asistencia;
      exportAttendanceToExcel(attendance, attendance.registro ?? []);
      showToast("Asistencia exportada correctamente");
    } catch (error) {
      showToast(error.message || "Error al exportar la asistencia", "error");
    } finally {
      setExportingId(null);
    }
  }
  function handleEncargadoAgregado(asistenciaId, nuevoEncargado) {
    showToast(`${nuevoEncargado.nombres} asignado como encargado`);
    setModalAgregar(null);
    setAsistencias((prev) =>
      prev.map((a) => {
        if (a._id !== asistenciaId) return a;
        return {
          ...a,
          encargados: [...(a.encargados || []), nuevoEncargado],
        };
      }),
    );
    setModalGestionar((prev) => {
      if (!prev || prev._id !== asistenciaId) return prev;
      return {
        ...prev,
        encargados: [...(prev.encargados || []), nuevoEncargado],
      };
    });
  }
  async function handleEliminarEncargado(asistenciaId, encargado) {
    setEliminando(encargado._id);
    try {
      const res = await fetch(
        `/api/encargados/${asistenciaId}?id=${encargado._id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Encargado eliminado correctamente");
      const filtrar = (lista) => lista.filter((e) => e._id !== encargado._id);
      setAsistencias((prev) =>
        prev.map((a) =>
          a._id === asistenciaId
            ? {
                ...a,
                encargados: filtrar(a.encargados || []),
              }
            : a,
        ),
      );
      setModalGestionar((prev) =>
        prev?._id === asistenciaId
          ? {
              ...prev,
              encargados: filtrar(prev.encargados || []),
            }
          : prev,
      );
    } catch (err) {
      showToast(err.message || "Error al eliminar encargado", "error");
    } finally {
      setEliminando(null);
    }
  }
  const filteredAsistencias = asistencias.filter(
    (a) =>
      a.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(a.fecha).toLowerCase().includes(search.toLowerCase()),
  );
  function abrirGestion(a) {
    setModalGestionar({
      ...a,
      encargados: a.encargados || [],
    });
  }
  return (
    <div className="space-y-6">
      {toast && <AdminToast type={toast.type} message={toast.msg} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar asistencia"
          message={`¿Retirar "${deleteTarget.descripcion}" de la lista? Se conservarán sus registros y su historial.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {modalGestionar && !modalAgregar && (
        <ModalEncargados
          asistencia={modalGestionar}
          encargados={modalGestionar.encargados || []}
          eliminando={eliminando}
          onClose={() => setModalGestionar(null)}
          onAgregar={() => setModalAgregar(modalGestionar)}
          onEliminar={(enc) => handleEliminarEncargado(modalGestionar._id, enc)}
        />
      )}

      {modalAgregar && (
        <ModalAgregarEncargado
          asistencia={modalAgregar}
          encargadosActuales={
            modalGestionar?._id === modalAgregar._id
              ? modalGestionar.encargados || []
              : modalAgregar.encargados || []
          }
          onClose={() => setModalAgregar(null)}
          onAsignado={(enc) => handleEncargadoAgregado(modalAgregar._id, enc)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">
          Asistencias
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-0">
          Registro y control de asistencias
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
          variant="default"
          type="button"
          className="flex items-center justify-center gap-2 duration-200"
        >
          {showForm ? (
            <>
              <AdminXIcon className="size-4" /> Cancelar
            </>
          ) : (
            <>
              <AdminPlusIcon className="size-4" /> Crear asistencia
            </>
          )}
        </Button>
        <div className="relative flex-1">
          <span
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
            className="absolute text-muted-foreground flex items-center"
          >
            <AdminSearchIcon className="size-4" />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fecha o descripción..."
            className="w-full pl-9 focus:outline-none"
          />
        </div>
      </div>

      {showForm && (
        <Card className="mb-4 p-6">
          <h3 className="text-foreground mt-0 mr-0 mb-4 ml-0 text-lg font-semibold">
            Nueva asistencia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="grid gap-2">
              <Label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Fecha
              </Label>
              <Input
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    fecha: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Descripción
              </Label>
              <Input
                type="text"
                placeholder="Ej: Reunión ordinaria semanal"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    descripcion: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          {formError && (
            <div className="flex items-center gap-2 bg-muted border rounded-xl pt-2 pr-3 pb-2 pl-3 text-destructive text-sm mb-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {formError}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={creating}
              type="button"
              style={{
                opacity: creating ? 0.7 : 1,
              }}
              variant="default"
              className="flex items-center"
            >
              {creating ? (
                <>
                  <AdminLoaderCircleIcon className="size-4 animate-spin" />{" "}
                  Guardando…
                </>
              ) : (
                "Guardar asistencia"
              )}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden gap-0 py-0">
        <div className="pt-4 pr-4 pb-4 pl-4 border-b flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-foreground flex">
              <AdminClipboardCheckIcon className="size-4" />
            </span>
            <span className="font-semibold text-sm text-foreground">
              Listado de asistencias
            </span>
          </div>
          {!loading && (
            <Badge variant="secondary" className="">
              {filteredAsistencias.length} registro
              {filteredAsistencias.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {[
                  "Fecha",
                  "Descripción",
                  "Resumen",
                  "Encargados",
                  "Acciones",
                ].map((h, i) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={5} />
              ) : filteredAsistencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                        }}
                        className="rounded-full bg-muted flex items-center justify-center"
                      >
                        <AdminClipboardCheckIcon className="size-4" />
                      </div>
                      <p className="text-sm m-0">
                        {search
                          ? "No se encontraron resultados"
                          : "No se registraron asistencias"}
                      </p>
                      <p
                        style={{
                          opacity: 0.7,
                        }}
                        className="text-sm m-0"
                      >
                        {search
                          ? "Intenta con otra búsqueda"
                          : 'Haz clic en "Crear asistencia" para comenzar'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAsistencias.map((a, i) => {
                  const isEven = i % 2 === 1;
                  return (
                    <TableRow key={a._id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <AdminCalendarIcon className="size-4" />
                          <span className="text-sm font-semibold text-foreground">
                            {formatDate(a.fecha)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-72 min-w-72 max-w-72 whitespace-normal break-words">
                        {a.descripcion}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          <ResumenBadge
                            label="P"
                            value={a.resumen?.presentes ?? 0}
                          />
                          <ResumenBadge
                            label="T"
                            value={a.resumen?.tardanzas ?? 0}
                          />
                          <ResumenBadge
                            label="J"
                            value={a.resumen?.justificados ?? 0}
                          />
                          <ResumenBadge
                            label="A"
                            value={a.resumen?.ausentes ?? 0}
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <EncargadosCell
                          encargados={a.encargados}
                          onOpen={() => abrirGestion(a)}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1.5 justify-center">
                          <ActionBtn
                            title="Ver"
                            onClick={() =>
                              router.push(
                                `/panel/asistencias/${a._id}?mode=view`,
                              )
                            }
                          >
                            <AdminEyeIcon className="size-4" />
                          </ActionBtn>
                          <ActionBtn
                            title="Editar"
                            onClick={() =>
                              router.push(
                                `/panel/asistencias/${a._id}?mode=edit`,
                              )
                            }
                          >
                            <AdminPencilIcon className="size-4" />
                          </ActionBtn>
                          <ActionBtn
                            title="Exportar"
                            onClick={() => handleExport(a)}
                            disabled={exportingId === a._id}
                          >
                            {exportingId === a._id ? (
                              <AdminLoaderCircleIcon className="size-4 animate-spin" />
                            ) : (
                              <AdminFileSpreadsheetIcon className="size-4" />
                            )}
                          </ActionBtn>
                          <ActionBtn
                            title="Eliminar"
                            onClick={() => setDeleteTarget(a)}
                          >
                            <AdminTrash2Icon className="size-4" />
                          </ActionBtn>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filteredAsistencias.length > 0 && (
          <div className="pt-3 pr-4 pb-3 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0">
              {filteredAsistencias.length} asistencia
              {filteredAsistencias.length !== 1 ? "s" : ""} registrada
              {filteredAsistencias.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
function ResumenBadge({ label, value }) {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-1 whitespace-nowrap"
    >
      {label} {value}
    </Badge>
  );
}
function ActionBtn({ children, title, onClick, disabled = false }) {
  const { permissions } = usePanelSession();
  if (title === "Eliminar" && !permissions.canDelete) return null;
  return (
    <Button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      variant={title === "Eliminar" ? "destructive" : "outline"}
      size="icon-sm"
      type="button"
      className="flex items-center justify-center"
    >
      {children}
    </Button>
  );
}
