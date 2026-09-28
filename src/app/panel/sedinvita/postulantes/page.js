"use client";

import {
  Search as AdminSearchIcon,
  Users as AdminUsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { useState, useEffect, useCallback } from "react";
export default function Page() {
  const [data, setData] = useState([]);
  const [edicion, setEdicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState("fase4");
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sedinvita/postulantes", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar datos");
      setData(json.data ?? []);
      setEdicion(json.edicion ?? null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const filtrarPorFase = (postulantes, fase) => {
    if (fase === "fase2") {
      return postulantes;
    } else if (fase === "fase3") {
      return postulantes.filter(
        (p) => p.faseActual === "fase3" || p.faseActual === "fase4",
      );
    } else if (fase === "fase4") {
      return postulantes.filter((p) => p.faseActual === "fase4");
    }
    return postulantes;
  };
  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.nombres?.toLowerCase().includes(q) ||
      p.apellidos?.toLowerCase().includes(q) ||
      p.correoElectronico?.toLowerCase().includes(q) ||
      p.codigoMatricula?.toLowerCase().includes(q) ||
      p.numeroCelular?.toLowerCase().includes(q);
    return matchSearch;
  });
  const filteredByFase = filtrarPorFase(filtered, faseSeleccionada);
  const contarPorFase = (fase) => {
    if (fase === "fase2") {
      return data.length;
    } else if (fase === "fase3") {
      return data.filter(
        (p) => p.faseActual === "fase3" || p.faseActual === "fase4",
      ).length;
    } else if (fase === "fase4") {
      return data.filter((p) => p.faseActual === "fase4").length;
    }
    return 0;
  };
  const fase2Count = contarPorFase("fase2");
  const fase3Count = contarPorFase("fase3");
  const fase4Count = contarPorFase("fase4");
  const getFaseNombre = (fase) => {
    if (fase === "fase2") return "Fase 2";
    if (fase === "fase3") return "Fase 3";
    if (fase === "fase4") return "Fase 4";
    return fase;
  };
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">
              Postulantes
            </h1>
            <p className="text-sm text-muted-foreground mt-1 mb-0">
              Lista de postulantes en {edicion?.nombre || "SEDInvita"} -
              Mostrando {getFaseNombre(faseSeleccionada)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setFaseSeleccionada("fase2")}
            type="button"
            variant={faseSeleccionada === "fase2" ? "default" : "outline"}
            className="flex items-center"
          >
            Fase 2
            <Badge
              style={{
                opacity: 0.9,
              }}
              variant="secondary"
              className=""
            >
              {fase2Count}
            </Badge>
          </Button>

          <Button
            onClick={() => setFaseSeleccionada("fase3")}
            type="button"
            variant={faseSeleccionada === "fase3" ? "default" : "outline"}
            className="flex items-center"
          >
            Fase 3
            <Badge
              style={{
                opacity: 0.9,
              }}
              variant="secondary"
              className=""
            >
              {fase3Count}
            </Badge>
          </Button>

          <Button
            onClick={() => setFaseSeleccionada("fase4")}
            type="button"
            variant={faseSeleccionada === "fase4" ? "default" : "outline"}
            className="flex items-center"
          >
            Fase 4
            <Badge
              style={{
                opacity: 0.9,
              }}
              variant="secondary"
              className=""
            >
              {fase4Count}
            </Badge>
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div
          style={{
            maxWidth: "400px",
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar postulante..."
            className="w-full pl-9 focus:outline-none"
          />
        </div>
      </div>

      <Card className="overflow-hidden gap-0 py-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {[
                  "Postulante",
                  "Correo",
                  "Código UNT",
                  "Celular",
                  "Fase",
                  "Estado",
                ].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={8} />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-3 text-destructive">
                      <p className="text-sm m-0">Error: {error}</p>
                      <Button
                        onClick={fetchData}
                        variant="default"
                        type="button"
                      >
                        Reintentar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredByFase.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
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
                        {search
                          ? "No se encontraron resultados"
                          : `No hay postulantes en ${getFaseNombre(faseSeleccionada)}`}
                      </p>
                      <p
                        style={{
                          opacity: 0.7,
                        }}
                        className="text-sm m-0"
                      >
                        {search ? "Intenta con otra búsqueda" : ""}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredByFase.map((p, i) => {
                  const isEven = i % 2 === 1;
                  const habilitado = p.estadoGeneral === "habilitado";
                  return (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground m-0">
                              {p.apellidos} {p.nombres}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.correoElectronico}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="">
                          {p.codigoMatricula}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.numeroCelular || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="">
                          {p.faseActual === "fase2"
                            ? "Fase 2"
                            : p.faseActual === "fase3"
                              ? "Fase 3"
                              : p.faseActual === "fase4"
                                ? "Fase 4"
                                : p.faseActual}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="">
                          {habilitado ? "Habilitado" : "Inhabilitado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && !error && filteredByFase.length > 0 && (
          <div className="pt-2 pr-4 pb-2 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0">
              {filteredByFase.length} postulante
              {filteredByFase.length !== 1 ? "s" : ""} en{" "}
              {getFaseNombre(faseSeleccionada)}
              {search && ` (filtrado por búsqueda)`}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
function SkeletonRows({ dark, count = 5 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[140, 160, 90, 90, 70, 90].map((w, j) => (
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
