"use client";

import Link from "next/link";
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
import { EmptyState } from "@/components/admin/page-state";

export default function MisAsistenciasPage() {
  const { assignments, refresh } = usePanelSession();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tomar asistencia
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Asistencias en las que estás asignado como encargado.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw /> Actualizar
        </Button>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        {assignments.length === 0 ? (
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
