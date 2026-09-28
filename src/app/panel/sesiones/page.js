"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock3, RefreshCw, Search, UsersRound } from "lucide-react";
import { ROLE_LABELS } from "@/lib/panel-permissions.mjs";
import { panelApi } from "@/lib/panel-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Lima",
});

function formatDate(value) {
  if (!value) return "Nunca";
  return dateFormatter.format(new Date(value));
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await panelApi("/api/sessions");
      setSessions(result.data || []);
      setSummary({ total: result.total || 0, active: result.active || 0 });
      setError("");
    } catch (failure) {
      setError(failure.message || "No se pudieron cargar las sesiones.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    const interval = window.setInterval(
      () => loadSessions({ silent: true }),
      30 * 1000,
    );
    return () => window.clearInterval(interval);
  }, [loadSessions]);

  const filteredSessions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return sessions;
    return sessions.filter((session) =>
      [
        session.nombres,
        session.apellidos,
        session.user,
        session.dni,
        ROLE_LABELS[session.rol],
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
  }, [query, sessions]);

  if (loading) return <PageLoading label="Cargando sesiones…" />;
  if (error && sessions.length === 0)
    return <PageError message={error} onRetry={() => loadSessions()} />;

  const accessed = sessions.filter((session) => session.lastLogin).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sesiones</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Actividad reciente y último ingreso de las cuentas del panel.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => loadSessions({ silent: true })}
          disabled={refreshing}
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Activity}
          label="Activos ahora"
          value={summary.active}
        />
        <MetricCard icon={Clock3} label="Con ingresos" value={accessed} />
        <MetricCard icon={UsersRound} label="Cuentas" value={summary.total} />
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-col gap-4 border-b py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Actividad de usuarios</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Se actualiza automáticamente cada 30 segundos.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar sesiones"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, usuario o DNI"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSessions.length === 0 ? (
            <EmptyState
              title="No se encontraron cuentas"
              description="Prueba con otro nombre, usuario o DNI."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último ingreso</TableHead>
                  <TableHead>Última actividad</TableHead>
                  <TableHead className="pr-5">Cuenta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="pl-5">
                      <div className="font-medium">
                        {session.nombres} {session.apellidos}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.user} · DNI {session.dni}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ROLE_LABELS[session.rol] || session.rol}
                    </TableCell>
                    <TableCell>
                      {session.active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                          Desconectado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(session.lastLogin)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(session.lastSeenAt)}
                    </TableCell>
                    <TableCell className="pr-5">
                      <Badge
                        variant={
                          session.accountActive ? "outline" : "destructive"
                        }
                      >
                        {session.accountActive ? "Habilitada" : "Inactiva"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
