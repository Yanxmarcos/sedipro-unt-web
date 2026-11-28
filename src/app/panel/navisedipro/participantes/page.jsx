"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageError, PageLoading } from "@/components/admin/page-state";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { panelApi } from "@/lib/panel-api";

const endpoint = "/api/navisedipro";

export default function NavisediproPanel() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    panelApi(endpoint, { signal: controller.signal }).then((next) => {
      if (!controller.signal.aborted) setResult(next);
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    });
    return () => controller.abort();
  }, []);

  async function retry() {
    setError("");
    try {
      setResult(await panelApi(endpoint));
    } catch (failure) {
      setError(failure.message);
    }
  }
  if (!result) return error
    ? <PageError message={error} onRetry={retry} />
    : <PageLoading label="Cargando donadores de NAVISEDIPRO." />;

  const query = search.trim().toLocaleLowerCase("es");
  const rows = result.data.filter(({ nombre, dni }) => `${nombre} ${dni}`.toLocaleLowerCase("es").includes(query));
  const section = "space-y-4 rounded-lg border bg-card p-4 sm:p-6";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">NAVISEDIPRO</h1>
        <p className="text-sm text-muted-foreground">{result.data.length} donadores validados · Meta de 150</p>
      </header>
      <section className={section} aria-labelledby="navi-participants">
        <h2 id="navi-participants" className="text-lg font-semibold">Lista de donadores</h2>
        {result.data.length > 0 && <Input aria-label="Buscar donadores" placeholder="Buscar por nombre o DNI"
          value={search} onChange={(event) => setSearch(event.target.value)} />}
        {rows.length === 0 ? (
          <EmptyState title={query ? "Sin coincidencias" : "Aún no hay donaciones validadas"} />
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nombres y apellidos</TableHead><TableHead>DNI</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(({ nombre, dni }) => <TableRow key={dni}>
                <TableCell>{nombre}</TableCell><TableCell>{dni}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
