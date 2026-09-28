"use client";

import {
  Users as AdminUsersIcon,
  Ticket as AdminTicketIcon,
  X as AdminXIcon,
  Search as AdminSearchIcon,
  LoaderCircle as AdminLoaderCircleIcon,
  UserPlus as AdminUserPlusIcon,
} from "lucide-react";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AdminSelect,
  AdminCheckbox,
  AdminModal,
} from "@/components/admin/form-controls";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
export default function Page() {
  const [edicionActiva, setEdicionActiva] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [facilitadores, setFacilitadores] = useState([]);
  const [postulantesDisponibles, setPostulantesDisponibles] = useState([]);
  const [loadingFacilitadores, setLoadingFacilitadores] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fase, setFase] = useState("fase2");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    turnoId: "",
    facilitadores: [],
    postulantes: [],
  });
  const [searchPostulante, setSearchPostulante] = useState("");
  const [showAsignarFacilitador, setShowAsignarFacilitador] = useState(false);
  const fases = ["fase2", "fase3", "fase4"];
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resEdiciones = await fetch("/api/sedinvita/ediciones", {
        credentials: "include",
      });
      const jsonEdiciones = await resEdiciones.json();
      if (!resEdiciones.ok)
        throw new Error(jsonEdiciones.error || "Error al cargar ediciones");
      const activa = (jsonEdiciones.data || []).find((e) => e.activa === true);
      setEdicionActiva(activa || null);
      if (activa) {
        const resTurnos = await fetch(
          `/api/sedinvita/turnos?edicionId=${activa._id}&fase=${fase}`,
          {
            credentials: "include",
          },
        );
        const jsonTurnos = await resTurnos.json();
        if (resTurnos.ok) setTurnos(jsonTurnos.data || []);
        await fetchFacilitadores(activa._id);
        if (turnoSeleccionado) {
          await fetchGrupos(activa._id, turnoSeleccionado);
          await fetchPostulantesDisponibles(turnoSeleccionado);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fase, turnoSeleccionado]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const fetchFacilitadores = async (edicionId) => {
    setLoadingFacilitadores(true);
    try {
      const res = await fetch(
        `/api/sedinvita/facilitadores?edicionId=${edicionId}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (res.ok) setFacilitadores(json.data || []);
    } catch (err) {
      console.error("Error al cargar facilitadores:", err);
    } finally {
      setLoadingFacilitadores(false);
    }
  };
  const fetchGrupos = async (edicionId, turnoId) => {
    try {
      const res = await fetch(
        `/api/sedinvita/grupos?edicionId=${edicionId}&turnoId=${turnoId}&fase=${fase}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (res.ok) setGrupos(json.data || []);
    } catch (err) {
      console.error("Error al cargar grupos:", err);
    }
  };
  const fetchPostulantesDisponibles = async (turnoId) => {
    try {
      const res = await fetch(
        `/api/sedinvita/grupos/postulantes-disponibles?turnoId=${turnoId}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (res.ok) setPostulantesDisponibles(json.data || []);
    } catch (err) {
      console.error("Error al cargar postulantes:", err);
    }
  };
  const handleSubmitGrupo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId
        ? `/api/sedinvita/grupos/${editingId}`
        : "/api/sedinvita/grupos";
      const method = editingId ? "PATCH" : "POST";
      const payload = {
        ...formData,
        edicionId: edicionActiva._id,
        fase,
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar grupo");
      await fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteGrupo = async (id) => {
    if (
      !confirm(
        "¿Eliminar este grupo? Los postulantes quedarán sin grupo asignado.",
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sedinvita/grupos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al eliminar grupo");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAsignarFacilitador = async (sedipranoId) => {
    const res = await fetch("/api/sedinvita/facilitadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        edicionId: edicionActiva._id,
        sedipranoId,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error al asignar facilitador");
    await fetchFacilitadores(edicionActiva._id);
    return json;
  };
  const handleEliminarFacilitador = async (id) => {
    if (
      !confirm("¿Quitar a este facilitador? Solo si no tiene grupos asignados.")
    )
      return;
    try {
      const res = await fetch(`/api/sedinvita/facilitadores/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Error al eliminar facilitador");
      await fetchFacilitadores(edicionActiva._id);
    } catch (err) {
      alert(err.message);
    }
  };
  const resetForm = () => {
    setFormData({
      nombre: "",
      turnoId: "",
      facilitadores: [],
      postulantes: [],
    });
    setEditingId(null);
    setShowModal(false);
    setSearchPostulante("");
  };
  const filteredPostulantes = postulantesDisponibles.filter((p) => {
    const search = searchPostulante.toLowerCase();
    return (
      p.nombres?.toLowerCase().includes(search) ||
      p.apellidos?.toLowerCase().includes(search) ||
      p.codigoMatricula?.toLowerCase().includes(search) ||
      p.correoElectronico?.toLowerCase().includes(search)
    );
  });
  const togglePostulante = (postulanteId) => {
    setFormData((prev) => {
      const current = prev.postulantes || [];
      return current.includes(postulanteId)
        ? {
            ...prev,
            postulantes: current.filter((id) => id !== postulanteId),
          }
        : {
            ...prev,
            postulantes: [...current, postulanteId],
          };
    });
  };
  const toggleFacilitadorEnGrupo = (facilitadorId) => {
    setFormData((prev) => {
      const current = prev.facilitadores || [];
      return current.includes(facilitadorId)
        ? {
            ...prev,
            facilitadores: current.filter((id) => id !== facilitadorId),
          }
        : {
            ...prev,
            facilitadores: [...current, facilitadorId],
          };
    });
  };
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">
          Grupos y Facilitadores
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-0">
          Asignación de grupos y facilitadores por turno
          {edicionActiva &&
            ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
        </p>
      </div>

      {error && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-destructive rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {!edicionActiva && !error && (
        <Card className="text-center p-6">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div
              style={{
                width: "60px",
                height: "60px",
              }}
              className="rounded-full bg-muted flex items-center justify-center"
            >
              <AdminUsersIcon className="size-4" />
            </div>
            <p className="text-sm m-0">No hay edición activa</p>
            <p
              style={{
                opacity: 0.7,
              }}
              className="text-sm m-0"
            >
              Activa una edición para gestionar grupos y facilitadores
            </p>
          </div>
        </Card>
      )}

      {edicionActiva && (
        <>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="items-center flex-wrap grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Fase:
              </Label>
              <AdminSelect
                value={fase}
                onChange={(e) => {
                  setFase(e.target.value);
                  setTurnoSeleccionado(null);
                  setGrupos([]);
                }}
                style={{
                  minWidth: "110px",
                }}
              >
                {fases.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div className="items-center flex-wrap grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Turno:
              </Label>
              <AdminSelect
                value={turnoSeleccionado || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setTurnoSeleccionado(value || null);
                  if (value) {
                    fetchGrupos(edicionActiva._id, value);
                    fetchPostulantesDisponibles(value);
                  } else {
                    setGrupos([]);
                    setPostulantesDisponibles([]);
                  }
                }}
                style={{
                  minWidth: "110px",
                }}
              >
                <option value="">Seleccionar turno</option>
                {turnos.map((tn) => (
                  <option key={tn._id} value={tn._id}>
                    {tn.nombre} ({tn.horarioInicio || "--"} -{" "}
                    {tn.horarioFin || "--"})
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div className="flex-1" />

            {turnoSeleccionado && (
              <Button
                onClick={() => {
                  setFormData({
                    nombre: "",
                    turnoId: turnoSeleccionado,
                    facilitadores: [],
                    postulantes: [],
                  });
                  setEditingId(null);
                  setShowModal(true);
                }}
                type="button"
                variant="default"
              >
                + Nuevo Grupo
              </Button>
            )}
          </div>

          {showModal && (
            <AdminModal onClose={resetForm}>
              <div className="space-y-6">
                <h2 className="text-foreground mt-0 mr-0 mb-4 ml-0 text-lg font-semibold">
                  {editingId ? "Editar Grupo" : "Nuevo Grupo"}
                </h2>
                <form onSubmit={handleSubmitGrupo} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Nombre del Grupo</Label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombre: e.target.value,
                          })
                        }
                        placeholder="Ej: Grupo A"
                        required
                      />
                    </div>

                    <div>
                      <Label>Facilitador(es)</Label>
                      <div>
                        {facilitadores.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center pt-3 pr-0 pb-3 pl-0">
                            No hay facilitadores asignados a esta edición.
                            Agrégalos abajo en la sección "Facilitadores".
                          </p>
                        ) : (
                          facilitadores.map((f) => {
                            const isSelected = (
                              formData.facilitadores || []
                            ).includes(f._id);
                            return (
                              <Label
                                key={f._id}
                                className="flex items-center gap-3 rounded-md border p-3"
                              >
                                <AdminCheckbox
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleFacilitadorEnGrupo(f._id)
                                  }
                                />
                                <div>
                                  <span className="text-sm text-foreground">
                                    {f.nombres} {f.apellidos}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    DNI: {f.dni}
                                  </span>
                                </div>
                              </Label>
                            );
                          })
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.facilitadores?.length || 0} facilitador
                        {formData.facilitadores?.length !== 1 ? "es" : ""}{" "}
                        seleccionado
                        {formData.facilitadores?.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div>
                      <Label>Postulantes Asignados</Label>
                      <div className="mb-2">
                        <Input
                          value={searchPostulante}
                          onChange={(e) => setSearchPostulante(e.target.value)}
                          placeholder="Buscar postulante..."
                        />
                      </div>
                      <div>
                        {filteredPostulantes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center pt-3 pr-0 pb-3 pl-0">
                            No hay postulantes disponibles en este turno
                          </p>
                        ) : (
                          filteredPostulantes.map((p) => {
                            const isSelected = (
                              formData.postulantes || []
                            ).includes(p._id);
                            return (
                              <Label
                                key={p._id}
                                className="flex items-center gap-3 rounded-md border p-3"
                              >
                                <AdminCheckbox
                                  checked={isSelected}
                                  onChange={() => togglePostulante(p._id)}
                                />
                                <div>
                                  <span className="text-sm text-foreground">
                                    {p.apellidos} {p.nombres}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {p.codigoMatricula}
                                  </span>
                                </div>
                              </Label>
                            );
                          })
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.postulantes?.length || 0} postulantes
                        seleccionados
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      disabled={
                        loading || (formData.facilitadores || []).length === 0
                      }
                      type="submit"
                      variant="default"
                    >
                      {loading
                        ? "Guardando..."
                        : editingId
                          ? "Actualizar"
                          : "Crear"}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </AdminModal>
          )}

          {showAsignarFacilitador && (
            <ModalAsignarFacilitador
              edicion={edicionActiva}
              facilitadoresActuales={facilitadores}
              onClose={() => setShowAsignarFacilitador(false)}
              onAsignar={handleAsignarFacilitador}
            />
          )}

          {turnoSeleccionado ? (
            <Card className="overflow-hidden mb-6 gap-0 py-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      {[
                        "Grupo",
                        "Facilitadores",
                        "Postulantes",
                        "Acciones",
                      ].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <SkeletonRows count={5} />
                    ) : grupos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div
                              style={{
                                width: "60px",
                                height: "60px",
                              }}
                              className="rounded-full bg-muted flex items-center justify-center"
                            >
                              <AdminUsersIcon className="size-4" />
                            </div>
                            <p className="text-sm m-0">
                              No hay grupos para este turno
                            </p>
                            <p
                              style={{
                                opacity: 0.7,
                              }}
                              className="text-sm m-0"
                            >
                              Crea el primer grupo usando el botón "Nuevo Grupo"
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      grupos.map((grupo, i) => {
                        const isEven = i % 2 === 1;
                        return (
                          <TableRow key={grupo._id}>
                            <TableCell>
                              {grupo.nombre || "Sin nombre"}
                            </TableCell>
                            <TableCell>
                              {(grupo.facilitadores || []).length === 0 ? (
                                <span className="text-sm text-destructive">
                                  Sin facilitador
                                </span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {grupo.facilitadores.map((f) => (
                                    <span
                                      key={f._id}
                                      className="text-sm text-foreground"
                                    >
                                      {f.nombres} {f.apellidos}{" "}
                                      <span className="text-muted-foreground text-xs">
                                        · {f.dni}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-foreground">
                                {grupo.postulantes?.length || 0} postulantes
                              </span>
                              {grupo.postulantes &&
                                grupo.postulantes.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {grupo.postulantes
                                      .map((p) => `${p.apellidos} ${p.nombres}`)
                                      .join(" | ")}
                                  </div>
                                )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1.5 flex-wrap">
                                <Button
                                  onClick={() => {
                                    setFormData({
                                      nombre: grupo.nombre || "",
                                      turnoId: grupo.turnoId,
                                      facilitadores:
                                        grupo.facilitadores?.map(
                                          (f) => f._id,
                                        ) || [],
                                      postulantes:
                                        grupo.postulantes?.map((p) => p._id) ||
                                        [],
                                    });
                                    setEditingId(grupo._id);
                                    setShowModal(true);
                                  }}
                                  title="Editar turno"
                                  variant="outline"
                                  type="button"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  onClick={() => handleDeleteGrupo(grupo._id)}
                                  variant="destructive"
                                  type="button"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {!loading && grupos.length > 0 && (
                <div className="pt-2 pr-4 pb-2 pl-4 border-t">
                  <p className="text-sm text-muted-foreground m-0">
                    {grupos.length} grupo{grupos.length !== 1 ? "s" : ""} en
                    este turno
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center mb-6 p-6">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                  }}
                  className="rounded-full bg-muted flex items-center justify-center"
                >
                  <AdminTicketIcon className="size-4" />
                </div>
                <p className="text-sm m-0">
                  Selecciona un turno para ver sus grupos
                </p>
                <p
                  style={{
                    opacity: 0.7,
                  }}
                  className="text-sm m-0"
                >
                  Elige un turno del filtro superior para comenzar
                </p>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <p className="font-semibold text-sm text-foreground m-0">
                Facilitadores de esta edición
              </p>
              <Button
                onClick={() => setShowAsignarFacilitador(true)}
                variant="outline"
                type="button"
              >
                + Agregar facilitador
              </Button>
            </div>

            {loadingFacilitadores ? (
              <SkeletonList count={3} />
            ) : facilitadores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center pt-4 pr-0 pb-4 pl-0">
                Aún no hay facilitadores asignados
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {facilitadores.map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center justify-between pt-2 pr-3 pb-2 pl-3 rounded-xl bg-muted"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground m-0">
                        {f.nombres} {f.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">
                        DNI: {f.dni} · {f.totalGrupos || 0} grupo
                        {f.totalGrupos !== 1 ? "s" : ""} asignado
                        {f.totalGrupos !== 1 ? "s" : ""}
                        {f.grupos?.length > 0 && ` (${f.grupos.join(", ")})`}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleEliminarFacilitador(f._id)}
                      variant="destructive"
                      type="button"
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
function ModalAsignarFacilitador({
  dark,
  edicion,
  facilitadoresActuales,
  onClose,
  onAsignar,
}) {
  const [sedipranos, setSedipranos] = useState([]);
  const [loadingSed, setLoadingSed] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const yaAsignadosIds = new Set(
    facilitadoresActuales.map((f) => f.sedipranoId?.toString()),
  );
  useEffect(() => {
    fetch("/api/sedipranos", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setSedipranos(d.data || []))
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
      await onAsignar(selected._id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Error al asignar facilitador");
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
              Agregar facilitador
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">
              {edicion.nombre} ({edicion.anio})
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
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                    }}
                    className="rounded-full bg-current/10 flex items-center justify-center shrink-0 text-current font-semibold text-sm"
                  >
                    {initials(s.nombres, s.apellidos)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-current m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                      {s.nombres} {s.apellidos}
                      {yaAsignado && (
                        <span className="text-xs ml-1.5 text-current font-semibold">
                          • ya es facilitador
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
function initials(nombres, apellidos) {
  const n = (nombres || "").trim()[0] || "";
  const a = (apellidos || "").trim()[0] || "";
  return `${n}${a}`.toUpperCase();
}
function SkeletonRows({ dark, count = 5 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[80, 120, 100, 100].map((w, j) => (
        <TableCell key={j}>
          <div
            style={{
              height: "12px",
              width: `${w}px`,
              maxWidth: "100%",
            }}
            className="rounded-xl bg-muted animate-pulse"
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
function SkeletonList({ dark, count = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({
        length: count,
      }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between pt-2 pr-3 pb-2 pl-3 rounded-xl bg-muted"
        >
          <div className="flex-1">
            <div
              style={{
                height: "14px",
                width: "60%",
                maxWidth: "100%",
              }}
              className="rounded-xl bg-muted animate-pulse mb-1.5"
            />

            <div
              style={{
                height: "11px",
                width: "70%",
                maxWidth: "100%",
              }}
              className="rounded-xl bg-muted animate-pulse"
            />
          </div>

          <div
            style={{
              height: "28px",
              width: "60px",
            }}
            className="rounded-xl bg-muted animate-pulse"
          />
        </div>
      ))}
    </div>
  );
}
