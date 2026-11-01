"use client";

import Link from "next/link";
import { attendanceScopeLabel } from "@/lib/attendance-scope.mjs";
import { ClipboardCheck, ArrowRight, RefreshCw } from "lucide-react";
import { usePanelSession } from "@/components/admin/panel-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageError } from "@/components/admin/page-state";

export default function MisAsistenciasPage() {
  const { assignments, assignmentsError, refresh } = usePanelSession();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tomar asistencia
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignmentsError
              ? "Consulta tus asignaciones como encargado."
              : assignments.length > 0
                ? `Estás encargado de ${assignments.length} asistencia${assignments.length === 1 ? "" : "s"}. Ingresa a una sesión para registrar la asistencia.`
                : "Actualmente no tienes asistencias a tu cargo."}
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw /> Actualizar
        </Button>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        {assignmentsError ? (
          <PageError message={assignmentsError} onRetry={refresh} />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No tienes asistencias asignadas"
            description="Cuando te asignen como encargado, podrás ingresar a tomar asistencia desde aquí."
          />
        ) : (
          <Table className="min-w-[600px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 pl-4">Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-40 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="pl-4">
                    {new Date(item.fecha).toLocaleDateString("es-PE", {
                      timeZone: "America/Lima",
                    })}
                  </TableCell>
                  <TableCell className="break-words font-medium">
                    {item.descripcion || "Asistencia"}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {attendanceScopeLabel(item)}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={"/panel/asistencias/tomar/" + item._id} />
                      }
                    >
                      Ingresar <ArrowRight />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
