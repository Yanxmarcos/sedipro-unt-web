"use client";

import {
  Users as AdminUsersIcon,
  Search as AdminSearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminSelect } from "@/components/admin/form-controls";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback, useMemo } from "react";
export default function Page() {
  const [edicionActiva, setEdicionActiva] = useState(null);
  const [areas, setAreas] = useState([]);
  const [postulantesSinArea, setPostulantesSinArea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [busquedaPostulante, setBusquedaPostulante] = useState("");
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null);
  const [faseFilter, setFaseFilter] = useState("fase4");
  const fases = ["fase3", "fase4"];
  const [postulantesFase4, setPostulantesFase4] = useState([]);
  const [areasFase4, setAreasFase4] = useState([]);
  const [postulantesFase4SinArea, setPostulantesFase4SinArea] = useState([]);
  const [vista, setVista] = useState("principal");
  const [areasSecundaria, setAreasSecundaria] = useState([]);
  const [totalSecundaria, setTotalSecundaria] = useState(0);
  const [postulantesSinSecundaria, setPostulantesSinSecundaria] = useState([]);
  const [areaSecundariaSeleccionada, setAreaSecundariaSeleccionada] =
    useState(null);
  const fetchEdicionActiva = useCallback(async () => {
    try {
      const res = await fetch("/api/sedinvita/ediciones", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar ediciones");
      const activa = (json.data || []).find((e) => e.activa === true);
      setEdicionActiva(activa || null);
      return activa;
    } catch (err) {
      console.error(err);
      setError(err.message);
      return null;
    }
  }, []);
  const cargarDatosFase4 = useCallback(async (edicionId) => {
    try {
      const res = await fetch(
        `/api/sedinvita/postulantes/fase4?edicionId=${edicionId}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar Fase 4");
      setPostulantesFase4(json.postulantes || []);
      setAreasFase4(json.areas || []);
      setPostulantesFase4SinArea(json.sinArea || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }, []);
  const cargarDatos = useCallback(async () => {
    const activa = await fetchEdicionActiva();
    if (!activa) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [areasRes, sinAreaRes] = await Promise.all([
        fetch("/api/sedinvita/postulantes/por-area", {
          credentials: "include",
        }),
        fetch(`/api/sedinvita/postulantes/sin-area?edicionId=${activa._id}`, {
          credentials: "include",
        }),
      ]);
      const areasJson = await areasRes.json();
      if (!areasRes.ok)
        throw new Error(areasJson.error || "Error al cargar áreas");
      const sinAreaJson = await sinAreaRes.json();
      if (!sinAreaRes.ok)
        throw new Error(
          sinAreaJson.error || "Error al cargar postulantes sin área",
        );
      setAreas(areasJson.areas || []);
      setPostulantesSinArea(sinAreaJson.data || []);
      setAreasSecundaria(areasJson.areasSecundaria || []);
      setTotalSecundaria(areasJson.totalSecundaria || 0);
      setPostulantesSinSecundaria(areasJson.postulantesSinSecundaria || []);
      await cargarDatosFase4(activa._id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchEdicionActiva, cargarDatosFase4]);
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);
  const handleQuitarArea = async (codigoMatricula, nombreCompleto) => {
    if (
      !confirm(
        `¿Estás seguro de quitar el área de ${nombreCompleto} (${codigoMatricula})?`,
      )
    ) {
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sedinvita/admin/quitar-area?codigo=${codigoMatricula}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al quitar área");
      setMensajeConfirmacion(`Área quitada correctamente de ${nombreCompleto}`);
      setTimeout(() => setMensajeConfirmacion(null), 4000);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };
  const handleAsignarAreaFinal = async (
    codigoMatricula,
    areaFinal,
    nombreCompleto,
  ) => {
    if (!areaFinal) {
      setError("Debes seleccionar un área");
      return;
    }
    if (
      !confirm(
        `¿Asignar el área "${getAreaNombre(areaFinal)}" a ${nombreCompleto} (${codigoMatricula})?`,
      )
    ) {
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch("/api/sedinvita/admin/asignar-area-final", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigoMatricula,
          areaFinal,
        }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al asignar área final");
      setMensajeConfirmacion(
        `Área final "${getAreaNombre(areaFinal)}" asignada a ${nombreCompleto}`,
      );
      setTimeout(() => setMensajeConfirmacion(null), 4000);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };
  const handleQuitarAreaSecundaria = async (
    codigoMatricula,
    nombreCompleto,
  ) => {
    if (
      !confirm(
        `¿Estás seguro de quitar el área de segunda opción de ${nombreCompleto} (${codigoMatricula})? Su área principal no se verá afectada.`,
      )
    ) {
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sedinvita/admin/quitar-area?codigo=${codigoMatricula}&tipo=secundaria`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Error al quitar área de segunda opción");
      setMensajeConfirmacion(
        `Área de segunda opción quitada correctamente de ${nombreCompleto}`,
      );
      setTimeout(() => setMensajeConfirmacion(null), 4000);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };
  const getAreaNombre = (areaId) => {
    const nombres = {
      gth: "GTH",
      pmo: "PMO",
      ti: "TI",
      mkt: "MKT",
      ltkyfnz: "LTK Y FNZ",
    };
    return nombres[areaId] || areaId;
  };
  const postulantesSinAreaFiltrados = useMemo(() => {
    let resultado = postulantesSinArea;
    if (busquedaPostulante.trim()) {
      const busqueda = busquedaPostulante.trim().toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
          p.nombres?.toLowerCase().includes(busqueda) ||
          p.apellidos?.toLowerCase().includes(busqueda) ||
          `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
          p.correoElectronico?.toLowerCase().includes(busqueda) ||
          p.numeroCelular?.toLowerCase().includes(busqueda),
      );
    }
    return resultado;
  }, [postulantesSinArea, busquedaPostulante]);
  const postulantesSinSecundariaFiltrados = useMemo(() => {
    let resultado = postulantesSinSecundaria;
    if (busquedaPostulante.trim()) {
      const busqueda = busquedaPostulante.trim().toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
          p.nombres?.toLowerCase().includes(busqueda) ||
          p.apellidos?.toLowerCase().includes(busqueda) ||
          `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
          p.correoElectronico?.toLowerCase().includes(busqueda) ||
          p.numeroCelular?.toLowerCase().includes(busqueda),
      );
    }
    return resultado;
  }, [postulantesSinSecundaria, busquedaPostulante]);
  const postulantesFase4Filtrados = useMemo(() => {
    let resultado = postulantesFase4;
    if (busquedaPostulante.trim()) {
      const busqueda = busquedaPostulante.trim().toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
          p.nombres?.toLowerCase().includes(busqueda) ||
          p.apellidos?.toLowerCase().includes(busqueda) ||
          `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
          p.correoElectronico?.toLowerCase().includes(busqueda) ||
          p.numeroCelular?.toLowerCase().includes(busqueda),
      );
    }
    return resultado;
  }, [postulantesFase4, busquedaPostulante]);
  const totalConArea = areas.reduce(
    (acc, area) => acc + area.postulantes.length,
    0,
  );
  const totalFase4ConArea = areasFase4.reduce(
    (acc, area) => acc + area.postulantes.length,
    0,
  );
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">
              Áreas
            </h1>
            <p className="text-sm text-muted-foreground mt-1 mb-0">
              {faseFilter === "fase3"
                ? `Postulantes agrupados por área seleccionada • ${totalConArea} con área • ${postulantesSinArea.length} sin área`
                : `Postulantes en Fase 4 • ${totalFase4ConArea} con área final • ${postulantesFase4SinArea.length} sin asignar`}
              {edicionActiva &&
                ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
            </p>
          </div>
        </div>
      </div>

      <div className="items-center flex-wrap mb-4 grid gap-2">
        <Label className="text-sm font-semibold text-muted-foreground">
          Fase:
        </Label>
        <AdminSelect
          value={faseFilter}
          onChange={(e) => {
            setFaseFilter(e.target.value);
            setAreaSeleccionada(null);
            setAreaSecundariaSeleccionada(null);
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

      {mensajeConfirmacion && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-foreground rounded-xl mb-4 text-sm border">
          {mensajeConfirmacion}
        </div>
      )}

      {error && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-destructive rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {!edicionActiva && !error && !loading && (
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
              Activa una edición en la sección "Ediciones" para gestionar áreas
            </p>
          </div>
        </Card>
      )}

      {edicionActiva && faseFilter === "fase3" && (
        <>
          {!loading && (
            <div className="inline-flex gap-1 p-1 bg-muted border rounded-xl mb-4">
              <Button
                onClick={() => {
                  setVista("principal");
                  setAreaSeleccionada(null);
                }}
                type="button"
                variant={vista === "principal" ? "default" : "outline"}
              >
                Primera Opción
              </Button>
              <Button
                onClick={() => {
                  setVista("secundaria");
                  setAreaSecundariaSeleccionada(null);
                }}
                type="button"
                variant={vista === "secundaria" ? "default" : "outline"}
              >
                Segunda Opción
              </Button>
            </div>
          )}

          {vista === "principal" && (
            <>
              {!loading && areas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {areas.map((area) => {
                    const count = area.postulantes.length;
                    const isSelected = areaSeleccionada === area.area;
                    return (
                      <Card
                        key={area.area}
                        onClick={() =>
                          setAreaSeleccionada(isSelected ? null : area.area)
                        }
                        style={{
                          transform: isSelected ? "scale(1.02)" : "scale(1)",
                        }}
                        className="text-center cursor-pointer p-6"
                      >
                        <p className="text-xs text-muted-foreground m-0">
                          {getAreaNombre(area.area)}
                        </p>
                        <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                          {count}
                        </p>
                        <p
                          style={{
                            opacity: 0.6,
                          }}
                          className="text-xs text-muted-foreground m-0"
                        >
                          postulantes
                        </p>
                      </Card>
                    );
                  })}
                  <Card
                    onClick={() => setAreaSeleccionada(null)}
                    style={{
                      transform:
                        areaSeleccionada === null ? "scale(1.02)" : "scale(1)",
                    }}
                    className="text-center cursor-pointer p-6"
                  >
                    <p className="text-xs text-muted-foreground m-0">
                      Sin área
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                      {postulantesSinArea.length}
                    </p>
                    <p
                      style={{
                        opacity: 0.6,
                      }}
                      className="text-xs text-muted-foreground m-0"
                    >
                      postulantes
                    </p>
                  </Card>
                </div>
              )}

              {loading && (
                <div className="text-center p-8 text-muted-foreground">
                  Cargando postulantes...
                </div>
              )}

              {!loading && areaSeleccionada !== null && (
                <Card className="overflow-hidden mb-4 gap-0 py-0">
                  {(() => {
                    const area = areas.find((a) => a.area === areaSeleccionada);
                    if (!area) return null;
                    const postulantesFiltrados = area.postulantes.filter(
                      (p) => {
                        if (!busquedaPostulante.trim()) return true;
                        const busqueda = busquedaPostulante
                          .trim()
                          .toLowerCase();
                        return (
                          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
                          p.nombres?.toLowerCase().includes(busqueda) ||
                          p.apellidos?.toLowerCase().includes(busqueda) ||
                          `${p.apellidos} ${p.nombres}`
                            .toLowerCase()
                            .includes(busqueda) ||
                          p.correoElectronico
                            ?.toLowerCase()
                            .includes(busqueda) ||
                          p.numeroCelular?.toLowerCase().includes(busqueda)
                        );
                      },
                    );
                    return (
                      <>
                        <div className="pt-3 pr-4 pb-3 pl-4 border-b bg-background flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-sm text-foreground m-0">
                                {getAreaNombre(area.area)}
                              </p>
                              <p className="text-sm text-muted-foreground m-0">
                                {postulantesFiltrados.length} postulante
                                {postulantesFiltrados.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setAreaSeleccionada(null)}
                            variant="outline"
                            type="button"
                          >
                            Cerrar
                          </Button>
                        </div>
                        {postulantesFiltrados.length === 0 ? (
                          <div className="pt-8 pr-4 pb-8 pl-4 text-center text-muted-foreground">
                            No hay postulantes en esta área
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código</TableHead>
                                  <TableHead>Postulante</TableHead>
                                  <TableHead>Correo</TableHead>
                                  <TableHead>Celular</TableHead>
                                  <TableHead>Fecha Elección</TableHead>
                                  <TableHead>Acción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {postulantesFiltrados.map((p, i) => {
                                  const isEven = i % 2 === 1;
                                  return (
                                    <TableRow key={p.codigoMatricula}>
                                      <TableCell>{p.codigoMatricula}</TableCell>
                                      <TableCell>
                                        {p.apellidos} {p.nombres}
                                      </TableCell>
                                      <TableCell>
                                        {p.correoElectronico || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {p.numeroCelular || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {p.fechaEleccion
                                          ? new Date(
                                              p.fechaEleccion,
                                            ).toLocaleString("es-PE")
                                          : "—"}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          onClick={() =>
                                            handleQuitarArea(
                                              p.codigoMatricula,
                                              `${p.apellidos} ${p.nombres}`,
                                            )
                                          }
                                          disabled={loadingAction}
                                          type="button"
                                          variant={
                                            loadingAction
                                              ? "default"
                                              : "outline"
                                          }
                                          style={{
                                            opacity: loadingAction ? 0.6 : 1,
                                          }}
                                        >
                                          {loadingAction
                                            ? "..."
                                            : "Quitar área"}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </Card>
              )}

              {!loading && (
                <Card className="overflow-hidden gap-0 py-0">
                  <div className="pt-3 pr-4 pb-3 pl-4 border-b bg-background flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground m-0">
                        Postulantes sin área
                      </p>
                      <p className="text-sm text-muted-foreground m-0">
                        {postulantesSinArea.length} postulante
                        {postulantesSinArea.length !== 1 ? "s" : ""} en Fase 3
                        que aún no han elegido área
                      </p>
                    </div>
                    <div
                      style={{
                        minWidth: "200px",
                      }}
                      className="relative"
                    >
                      <span
                        style={{
                          left: "11px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                        className="absolute text-muted-foreground"
                      >
                        <AdminSearchIcon className="size-4" />
                      </span>
                      <Input
                        value={busquedaPostulante}
                        onChange={(e) => setBusquedaPostulante(e.target.value)}
                        placeholder="Buscar postulante..."
                        className="w-full pl-9"
                      />
                    </div>
                  </div>

                  {postulantesSinAreaFiltrados.length === 0 ? (
                    <div className="pt-12 pr-4 pb-12 pl-4 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
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
                          {busquedaPostulante
                            ? "No hay postulantes que coincidan con la búsqueda"
                            : "¡Excelente! Todos los postulantes ya tienen área asignada"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Postulante</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Celular</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {postulantesSinAreaFiltrados.map((p, i) => {
                            const isEven = i % 2 === 1;
                            return (
                              <TableRow key={p.codigoMatricula}>
                                <TableCell>{p.codigoMatricula}</TableCell>
                                <TableCell>
                                  {p.apellidos} {p.nombres}
                                </TableCell>
                                <TableCell>
                                  {p.correoElectronico || "—"}
                                </TableCell>
                                <TableCell>{p.numeroCelular || "—"}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="">
                                    Sin área
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {postulantesSinAreaFiltrados.length > 0 && (
                    <div className="pt-2 pr-4 pb-2 pl-4 border-t">
                      <p className="text-sm text-muted-foreground m-0">
                        {postulantesSinAreaFiltrados.length} postulante
                        {postulantesSinAreaFiltrados.length !== 1
                          ? "s"
                          : ""}{" "}
                        sin área
                        {postulantesSinAreaFiltrados.length !==
                          postulantesSinArea.length &&
                          ` (${postulantesSinArea.length - postulantesSinAreaFiltrados.length} ocultos por búsqueda)`}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {vista === "secundaria" && (
            <>
              {!loading && areasSecundaria.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {areasSecundaria.map((area) => {
                    const count = area.postulantes.length;
                    const isSelected = areaSecundariaSeleccionada === area.area;
                    return (
                      <Card
                        key={area.area}
                        onClick={() =>
                          setAreaSecundariaSeleccionada(
                            isSelected ? null : area.area,
                          )
                        }
                        style={{
                          transform: isSelected ? "scale(1.02)" : "scale(1)",
                        }}
                        className="text-center cursor-pointer p-6"
                      >
                        <p className="text-xs text-muted-foreground m-0">
                          {getAreaNombre(area.area)}
                        </p>
                        <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                          {count}
                        </p>
                        <p
                          style={{
                            opacity: 0.6,
                          }}
                          className="text-xs text-muted-foreground m-0"
                        >
                          postulantes
                        </p>
                      </Card>
                    );
                  })}
                  <Card
                    onClick={() => setAreaSecundariaSeleccionada(null)}
                    style={{
                      transform:
                        areaSecundariaSeleccionada === null
                          ? "scale(1.02)"
                          : "scale(1)",
                    }}
                    className="text-center cursor-pointer p-6"
                  >
                    <p className="text-xs text-muted-foreground m-0">
                      Sin 2ª opción
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                      {postulantesSinSecundaria.length}
                    </p>
                    <p
                      style={{
                        opacity: 0.6,
                      }}
                      className="text-xs text-muted-foreground m-0"
                    >
                      postulantes
                    </p>
                  </Card>
                </div>
              )}

              {loading && (
                <div className="text-center p-8 text-muted-foreground">
                  Cargando postulantes...
                </div>
              )}

              {!loading && areaSecundariaSeleccionada !== null && (
                <Card className="overflow-hidden mb-4 gap-0 py-0">
                  {(() => {
                    const area = areasSecundaria.find(
                      (a) => a.area === areaSecundariaSeleccionada,
                    );
                    if (!area) return null;
                    const postulantesFiltrados = area.postulantes.filter(
                      (p) => {
                        if (!busquedaPostulante.trim()) return true;
                        const busqueda = busquedaPostulante
                          .trim()
                          .toLowerCase();
                        return (
                          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
                          p.nombres?.toLowerCase().includes(busqueda) ||
                          p.apellidos?.toLowerCase().includes(busqueda) ||
                          `${p.apellidos} ${p.nombres}`
                            .toLowerCase()
                            .includes(busqueda) ||
                          p.correoElectronico
                            ?.toLowerCase()
                            .includes(busqueda) ||
                          p.numeroCelular?.toLowerCase().includes(busqueda)
                        );
                      },
                    );
                    return (
                      <>
                        <div className="pt-3 pr-4 pb-3 pl-4 border-b bg-background flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-sm text-foreground m-0">
                              {getAreaNombre(area.area)}{" "}
                              <span className="font-medium text-sm text-muted-foreground">
                                (2ª opción)
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground m-0">
                              {postulantesFiltrados.length} postulante
                              {postulantesFiltrados.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <Button
                            onClick={() => setAreaSecundariaSeleccionada(null)}
                            variant="outline"
                            type="button"
                          >
                            Cerrar
                          </Button>
                        </div>
                        {postulantesFiltrados.length === 0 ? (
                          <div className="pt-8 pr-4 pb-8 pl-4 text-center text-muted-foreground">
                            No hay postulantes en esta área como segunda opción
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código</TableHead>
                                  <TableHead>Postulante</TableHead>
                                  <TableHead>Área Principal</TableHead>
                                  <TableHead>Correo</TableHead>
                                  <TableHead>Fecha Elección</TableHead>
                                  <TableHead>Acción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {postulantesFiltrados.map((p, i) => {
                                  const isEven = i % 2 === 1;
                                  return (
                                    <TableRow key={p.codigoMatricula}>
                                      <TableCell>{p.codigoMatricula}</TableCell>
                                      <TableCell>
                                        {p.apellidos} {p.nombres}
                                      </TableCell>
                                      <TableCell>
                                        <span className="pt-0.5 pr-2 pb-0.5 pl-2 rounded-xl text-xs font-semibold text-muted-foreground">
                                          {p.nombreAreaPrincipal}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        {p.correoElectronico || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {p.fechaEleccion
                                          ? new Date(
                                              p.fechaEleccion,
                                            ).toLocaleString("es-PE")
                                          : "—"}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          onClick={() =>
                                            handleQuitarAreaSecundaria(
                                              p.codigoMatricula,
                                              `${p.apellidos} ${p.nombres}`,
                                            )
                                          }
                                          disabled={loadingAction}
                                          type="button"
                                          variant={
                                            loadingAction
                                              ? "default"
                                              : "outline"
                                          }
                                          style={{
                                            opacity: loadingAction ? 0.6 : 1,
                                          }}
                                        >
                                          {loadingAction
                                            ? "..."
                                            : "Quitar 2ª opción"}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </Card>
              )}

              {!loading && (
                <Card className="overflow-hidden gap-0 py-0">
                  <div className="pt-3 pr-4 pb-3 pl-4 border-b bg-background flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground m-0">
                        Postulantes sin segunda opción
                      </p>
                      <p className="text-sm text-muted-foreground m-0">
                        {postulantesSinSecundaria.length} postulante
                        {postulantesSinSecundaria.length !== 1 ? "s" : ""} con
                        área principal que aún no eligieron segunda opción
                      </p>
                    </div>
                    <div
                      style={{
                        minWidth: "200px",
                      }}
                      className="relative"
                    >
                      <span
                        style={{
                          left: "11px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                        className="absolute text-muted-foreground"
                      >
                        <AdminSearchIcon className="size-4" />
                      </span>
                      <Input
                        value={busquedaPostulante}
                        onChange={(e) => setBusquedaPostulante(e.target.value)}
                        placeholder="Buscar postulante..."
                        className="w-full pl-9"
                      />
                    </div>
                  </div>

                  {postulantesSinSecundariaFiltrados.length === 0 ? (
                    <div className="pt-12 pr-4 pb-12 pl-4 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
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
                          {busquedaPostulante
                            ? "No hay postulantes que coincidan con la búsqueda"
                            : "Todos los postulantes con área principal ya eligieron su segunda opción"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Postulante</TableHead>
                            <TableHead>Área Principal</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Celular</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {postulantesSinSecundariaFiltrados.map((p, i) => {
                            const isEven = i % 2 === 1;
                            return (
                              <TableRow key={p.codigoMatricula}>
                                <TableCell>{p.codigoMatricula}</TableCell>
                                <TableCell>
                                  {p.apellidos} {p.nombres}
                                </TableCell>
                                <TableCell>
                                  <span className="pt-0.5 pr-2 pb-0.5 pl-2 rounded-xl text-xs font-semibold text-muted-foreground">
                                    {p.nombreAreaPrincipal}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {p.correoElectronico || "—"}
                                </TableCell>
                                <TableCell>{p.numeroCelular || "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {postulantesSinSecundariaFiltrados.length > 0 && (
                    <div className="pt-2 pr-4 pb-2 pl-4 border-t">
                      <p className="text-sm text-muted-foreground m-0">
                        {postulantesSinSecundariaFiltrados.length} postulante
                        {postulantesSinSecundariaFiltrados.length !== 1
                          ? "s"
                          : ""}{" "}
                        sin segunda opción
                        {postulantesSinSecundariaFiltrados.length !==
                          postulantesSinSecundaria.length &&
                          ` (${postulantesSinSecundaria.length - postulantesSinSecundariaFiltrados.length} ocultos por búsqueda)`}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </>
      )}

      {edicionActiva && faseFilter === "fase4" && (
        <>
          {!loading && areasFase4.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {areasFase4.map((area) => {
                const count = area.postulantes.length;
                const isSelected = areaSeleccionada === area.area;
                return (
                  <Card
                    key={area.area}
                    onClick={() =>
                      setAreaSeleccionada(isSelected ? null : area.area)
                    }
                    style={{
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                    }}
                    className="text-center cursor-pointer p-6"
                  >
                    <p className="text-xs text-muted-foreground m-0">
                      {getAreaNombre(area.area)}
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                      {count}
                    </p>
                    <p
                      style={{
                        opacity: 0.6,
                      }}
                      className="text-xs text-muted-foreground m-0"
                    >
                      postulantes
                    </p>
                  </Card>
                );
              })}
              <Card
                onClick={() => setAreaSeleccionada(null)}
                style={{
                  transform:
                    areaSeleccionada === null ? "scale(1.02)" : "scale(1)",
                }}
                className="text-center cursor-pointer p-6"
              >
                <p className="text-xs text-muted-foreground m-0">Sin asignar</p>
                <p className="text-lg font-semibold text-muted-foreground mt-1 mr-0 mb-1 ml-0">
                  {postulantesFase4SinArea.length}
                </p>
                <p
                  style={{
                    opacity: 0.6,
                  }}
                  className="text-xs text-muted-foreground m-0"
                >
                  postulantes
                </p>
              </Card>
            </div>
          )}

          {loading && (
            <div className="text-center p-8 text-muted-foreground">
              Cargando postulantes...
            </div>
          )}

          {!loading && (
            <Card className="overflow-hidden gap-0 py-0">
              <div className="pt-3 pr-4 pb-3 pl-4 border-b bg-background flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-sm text-foreground m-0">
                    Postulantes en Fase 4
                  </p>
                  <p className="text-sm text-muted-foreground m-0">
                    {postulantesFase4.length} postulante
                    {postulantesFase4.length !== 1 ? "s" : ""} en Fase 4
                    {postulantesFase4SinArea.length > 0 &&
                      ` • ${postulantesFase4SinArea.length} sin asignar`}
                  </p>
                </div>
                <div
                  style={{
                    minWidth: "200px",
                  }}
                  className="relative"
                >
                  <span
                    style={{
                      left: "11px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                    className="absolute text-muted-foreground"
                  >
                    <AdminSearchIcon className="size-4" />
                  </span>
                  <Input
                    value={busquedaPostulante}
                    onChange={(e) => setBusquedaPostulante(e.target.value)}
                    placeholder="Buscar postulante..."
                    className="w-full pl-9"
                  />
                </div>
              </div>

              {postulantesFase4Filtrados.length === 0 ? (
                <div className="pt-12 pr-4 pb-12 pl-4 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
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
                      {busquedaPostulante
                        ? "No hay postulantes que coincidan con la búsqueda"
                        : "No hay postulantes en Fase 4"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Postulante</TableHead>
                        <TableHead>Área Principal</TableHead>
                        <TableHead>Área Secundaria</TableHead>
                        <TableHead>Área Final</TableHead>
                        <TableHead>Asignar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postulantesFase4Filtrados.map((p, i) => {
                        const isEven = i % 2 === 1;
                        const areaPrincipal = p.areaPrincipal || "—";
                        const areaSecundaria = p.areaSecundaria || null;
                        const areaFinal = p.areaFinal || null;
                        const opciones = [];
                        if (areaPrincipal)
                          opciones.push({
                            value: areaPrincipal,
                            label: `${getAreaNombre(areaPrincipal)} (Principal)`,
                          });
                        if (areaSecundaria)
                          opciones.push({
                            value: areaSecundaria,
                            label: `${getAreaNombre(areaSecundaria)} (Secundaria)`,
                          });
                        const valorActual = areaFinal || "";
                        return (
                          <TableRow key={p.codigoMatricula}>
                            <TableCell>{p.codigoMatricula}</TableCell>
                            <TableCell>
                              {p.apellidos} {p.nombres}
                            </TableCell>
                            <TableCell>
                              {areaPrincipal !== "—" ? (
                                <Badge variant="secondary" className="">
                                  {getAreaNombre(areaPrincipal)}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {areaSecundaria ? (
                                <Badge variant="secondary" className="">
                                  {getAreaNombre(areaSecundaria)}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {areaFinal ? (
                                <Badge variant="secondary" className="">
                                  ✓ {getAreaNombre(areaFinal)}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="">
                                  Sin asignar
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1.5 items-center justify-center flex-wrap">
                                <AdminSelect
                                  value={valorActual}
                                  onChange={(e) => {
                                    const selected = e.target.value;
                                    if (selected && selected !== areaFinal) {
                                      handleAsignarAreaFinal(
                                        p.codigoMatricula,
                                        selected,
                                        `${p.apellidos} ${p.nombres}`,
                                      );
                                    }
                                  }}
                                  disabled={loadingAction}
                                  style={{
                                    minWidth: "120px",
                                    opacity: loadingAction ? 0.6 : 1,
                                  }}
                                >
                                  <option value="">Seleccionar...</option>
                                  {opciones.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </AdminSelect>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              {postulantesFase4Filtrados.length > 0 && (
                <div className="pt-2 pr-4 pb-2 pl-4 border-t">
                  <p className="text-sm text-muted-foreground m-0">
                    {postulantesFase4Filtrados.length} postulante
                    {postulantesFase4Filtrados.length !== 1 ? "s" : ""} en Fase
                    4
                    {postulantesFase4Filtrados.length !==
                      postulantesFase4.length &&
                      ` (${postulantesFase4.length - postulantesFase4Filtrados.length} ocultos por búsqueda)`}
                  </p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
