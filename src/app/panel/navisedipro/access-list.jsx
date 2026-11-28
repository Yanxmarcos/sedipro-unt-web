"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageError, PageLoading } from "@/components/admin/page-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { normalizeRole, ROLE_LABELS } from "@/lib/panel-permissions.mjs";
import { panelApi } from "@/lib/panel-api";

const endpoint = "/api/navisedipro/access";
const member = (account) => normalizeRole(account.rol) === "SEDIPRANO";
const name = (account) => `${account.nombres} ${account.apellidos}`;

export default function AccessList() {
  const [accounts, setAccounts] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    panelApi(endpoint, { signal: controller.signal }).then(({ accounts }) => {
      if (!controller.signal.aborted) setAccounts(accounts);
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    });
    return () => controller.abort();
  }, []);

  async function update(account, enabled) {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await panelApi(endpoint, { method: "PATCH", body: { id: account._id, enabled } });
      setAccounts((current) => current.map((item) => item._id === account._id
        ? { ...item, navisedipro2026Access: enabled } : item));
      setFeedback(enabled ? `Acceso concedido a ${name(account)}.` : `Acceso retirado a ${name(account)}.`);
    } catch (failure) {
      if (failure.status === 403 || failure.status === 401) {
        setAccounts(null);
        setOpen(false);
      }
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  const granted = accounts?.filter((account) => !member(account) || account.navisedipro2026Access);
  const needle = query.trim().toLocaleLowerCase("es");
  const eligible = accounts?.filter((account) => member(account) && !account.navisedipro2026Access &&
    `${name(account)} ${account.user}`.toLocaleLowerCase("es").includes(needle));

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6" aria-labelledby="navi-access">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="navi-access" className="text-lg font-semibold">Personas con acceso</h2>
        <Button disabled={!accounts || busy} onClick={() => { setQuery(""); setOpen(true); }}>Agregar sediprano</Button>
      </div>
      {error && !open && <PageError message={error} />}
      {feedback && !open && <p role="status" className="text-sm">{feedback}</p>}
      {!accounts && !error && <PageLoading label="Cargando accesos." />}
      {granted?.length === 0 && <EmptyState title="No hay cuentas con acceso" />}
      {granted?.length > 0 && <Table>
        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Permiso</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
        <TableBody>
          {granted.map((account) => <TableRow key={account._id}>
            <TableCell>{name(account)}</TableCell>
            <TableCell>{member(account) ? "Lectura asignada" : ROLE_LABELS[normalizeRole(account.rol)]}</TableCell>
            <TableCell>{member(account) && <Button variant="outline" size="sm" disabled={busy}
              onClick={() => update(account, false)}>Retirar acceso</Button>}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar sedipranos</DialogTitle>
            <DialogDescription>Selecciona quién podrá consultar la lista de donadores.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Buscar sedipranos" placeholder="Buscar por nombre o usuario" value={query}
            onChange={(event) => setQuery(event.target.value)} />
          {error && <PageError message={error} />}
          {feedback && <p role="status" className="text-sm">{feedback}</p>}
          {eligible?.length === 0 && <EmptyState title="No hay sedipranos disponibles" />}
          {eligible?.length > 0 && <Table>
            <TableHeader><TableRow><TableHead>Sediprano</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
            <TableBody>
              {eligible.map((account) => <TableRow key={account._id}>
                <TableCell>{name(account)} <span className="text-muted-foreground">({account.user})</span></TableCell>
                <TableCell><Button variant="outline" size="sm" disabled={busy}
                  onClick={() => update(account, true)}>Conceder acceso</Button></TableCell>
              </TableRow>)}
            </TableBody>
          </Table>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
