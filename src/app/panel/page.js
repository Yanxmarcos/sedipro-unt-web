"use client";

import Link from "next/link";
import { ClipboardCheck, Vote } from "lucide-react";
import OrdersDashboard from "@/components/admin/OrdersDashboard";
import { usePanelSession } from "@/components/admin/panel-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PanelHomePage() {
  const { user, assignments, permissions } = usePanelSession();
  if (permissions.canManage) return <OrdersDashboard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {user?.nombres?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenido a tu cuenta de SEDIPRO UNT.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {assignments.length > 0 && (
          <Card>
            <CardHeader>
              <ClipboardCheck className="mb-2 size-6" />
              <CardTitle>Tomar asistencia</CardTitle>
              <CardDescription>
                Tienes {assignments.length} asistencia
                {assignments.length === 1 ? "" : "s"} asignada
                {assignments.length === 1 ? "" : "s"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                nativeButton={false}
                render={<Link href="/panel/asistencias/tomar" />}
              >
                Ver mis asignaciones
              </Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <Vote className="mb-2 size-6" />
            <CardTitle>Votar</CardTitle>
            <CardDescription>
              Consulta las votaciones abiertas y participa con tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/panel/votaciones/votar" />}
            >
              Ver votaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
