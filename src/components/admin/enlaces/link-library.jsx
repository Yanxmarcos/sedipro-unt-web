"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  History,
  Link2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminConfirm, AdminSelect } from "@/components/admin/form-controls";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { PLATFORMS, TYPES, formatDate } from "./link-utils.mjs";
import { CopyLink, StateBadge, LinkPagination } from "./link-shared";
import { LinkForm } from "./link-form";

const emptyFilters = {
  q: "",
  prefijo: "",
  estado: "",
  creador: "",
  desde: "",
  hasta: "",
};
export default function LinkLibrary({ trash = false }) {
  const { permissions } = usePanelSession();
  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [creators, setCreators] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const version = useRef(0);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page: String(page),
        papelera: String(trash),
      });
      const result = await panelApi(`/api/enlaces?${params}`);
      if (current !== version.current) return;
      if (page > result.pagination.pages) {
        setPage(result.pagination.pages);
        return;
      }
      setRows(result.data);
      setPagination(result.pagination);
      setError("");
    } catch (failure) {
      if (current === version.current) setError(failure.message);
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [filters, page, trash]);
  useEffect(() => {
    const counter = version;
    load();
    return () => {
      ++counter.current;
    };
  }, [load]);
  useEffect(() => {
    let active = true;
    panelApi("/api/enlaces/creadores")
      .then((result) => {
        if (active) setCreators(result.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [rows]);
  function filter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  }
  async function perform() {
    if (busy || !action) return;
    setBusy(true);
    const { row, kind } = action;
    try {
      const result = await panelApi(
        `/api/enlaces/${row._id}${kind === "restaurar" ? "/restaurar" : kind === "definitivo" ? "/definitivo" : ""}`,
        {
          method:
            kind === "eliminar" || kind === "definitivo"
              ? "DELETE"
              : kind === "restaurar"
                ? "POST"
                : "PATCH",
          body: {
            revision: row.revision,
            ...(kind === "definitivo" ? { confirmacion: row._id } : {}),
            ...(kind === "pausar" || kind === "reactivar"
              ? { estado: kind === "pausar" ? "pausado" : "activo" }
              : {}),
          },
        },
      );
      toast.success(
        kind === "definitivo"
          ? "Enlace eliminado definitivamente."
          : kind === "eliminar"
            ? "Enlace movido a papelera."
            : kind === "restaurar"
              ? `Enlace restaurado. Estado: ${result.data.estadoEfectivo === "activo" ? "activo" : result.data.estadoEfectivo === "vencido" ? "vencido" : "pausado"}.`
              : "Estado actualizado.",
      );
      setAction(null);
      await load();
    } catch (failure) {
      toast.error(failure.message);
      setAction(null);
      await load();
    } finally {
      setBusy(false);
    }
  }
  async function reloadLink(id) {
    try {
      const result = await panelApi(`/api/enlaces/${id}`);
      setTarget(result.data);
    } catch (failure) {
      toast.error(failure.message);
    }
  }
  const actionCopy =
    action &&
    {
      eliminar: [
        "Mover enlace a papelera",
        "Los enlaces publicados dejarán de funcionar. Puedes restaurarlo desde la papelera.",
        "Mover a papelera",
      ],
      restaurar: [
        "Restaurar enlace",
        "Se conservarán la URL, el estado manual y el vencimiento anteriores. Si sigue pausado o vencido, no redirigirá.",
        "Restaurar enlace",
      ],
      definitivo: [
        "Eliminar enlace definitivamente",
        `Se eliminarán el destino y los datos de «${action?.row.titulo}». No podrás restaurarlo. Su código seguirá reservado y el historial de auditoría se conservará.`,
        "Eliminar definitivamente",
      ],
      pausar: [
        "Pausar enlace",
        "Las nuevas aperturas dejarán de redirigir hasta que lo reactives.",
        "Pausar enlace",
      ],
      reactivar: [
        "Reactivar enlace",
        "El enlace volverá a redirigir si no ha vencido.",
        "Reactivar enlace",
      ],
    }[action.kind];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {trash ? "Papelera de enlaces" : "Acortador de enlaces"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {trash
              ? "Restaura enlaces sin cambiar la URL que ya compartiste."
              : "Enlaces institucionales para tus publicaciones, formularios y grupos."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={trash ? "/panel/enlaces" : "/panel/enlaces/papelera"}
            className={buttonVariants({ variant: "outline" })}
          >
            {trash ? <Link2 /> : <Trash2 />}
            {trash ? "Biblioteca" : "Papelera"}
          </Link>
          {permissions.canViewLinkAudit && (
            <Link
              href="/panel/enlaces/auditoria"
              className={buttonVariants({ variant: "outline" })}
            >
              <History />
              Auditoría
            </Link>
          )}
          {!trash && (
            <Button onClick={() => setTarget("new")}>
              <Plus />
              Crear enlace
            </Button>
          )}
        </div>
      </header>
      {error && <PageError message={error} onRetry={load} />}
      <section
        className="overflow-hidden rounded-xl border bg-card"
        aria-label={trash ? "Enlaces en papelera" : "Biblioteca compartida"}
      >
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {trash ? "Enlaces eliminados" : "Biblioteca compartida"}
            </h2>
            <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Actualizar
            </Button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              filter("q", search.trim());
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                aria-label="Buscar enlaces"
                placeholder="Título, código, campaña o dominio"
                maxLength={160}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="link-platform">Plataforma</Label>
              <AdminSelect
                id="link-platform"
                value={filters.prefijo}
                onChange={(event) => filter("prefijo", event.target.value)}
              >
                <option value="">Todas las plataformas</option>
                {Object.entries(PLATFORMS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </AdminSelect>
            </div>
            {!trash && (
              <div className="space-y-1.5">
                <Label htmlFor="link-state">Estado</Label>
                <AdminSelect
                  id="link-state"
                  value={filters.estado}
                  onChange={(event) => filter("estado", event.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                  <option value="vencido">Vencido</option>
                </AdminSelect>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="link-creator">Creado por</Label>
              <AdminSelect
                id="link-creator"
                value={filters.creador}
                onChange={(event) => filter("creador", event.target.value)}
              >
                <option value="">Todas las personas</option>
                {creators.map((creator) => (
                  <option key={creator._id} value={creator._id}>
                    {creator.nombre}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-from">Creado desde</Label>
              <Input
                id="link-from"
                type="date"
                value={filters.desde}
                onChange={(event) => filter("desde", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-until">Creado hasta</Label>
              <Input
                id="link-until"
                type="date"
                value={filters.hasta}
                onChange={(event) => filter("hasta", event.target.value)}
              />
            </div>
          </div>
          {Object.values(filters).some(Boolean) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setFilters(emptyFilters);
                setPage(1);
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        {loading ? (
          <PageLoading label="Cargando enlaces…" />
        ) : !rows.length ? (
          <EmptyState
            icon={Link2}
            title={
              Object.values(filters).some(Boolean)
                ? "No hay coincidencias"
                : trash
                  ? "La papelera está vacía"
                  : "Crea tu primer enlace institucional"
            }
            description={
              Object.values(filters).some(Boolean)
                ? "Prueba con otros filtros o términos de búsqueda."
                : trash
                  ? "Los enlaces que elimines aparecerán aquí."
                  : "Pega el destino y comparte una URL de SEDIPRO UNT."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enlace</TableHead>
                <TableHead>Destino y campaña</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead>Responsable y fecha</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="min-w-60 max-w-80 whitespace-normal">
                    <p className="break-words font-medium">{row.titulo}</p>
                    <div className="mt-1 flex min-w-0 items-center gap-1">
                      <a
                        href={row.urlCorta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-all text-xs text-primary underline-offset-4 hover:underline"
                      >
                        {row.urlCorta.replace(/^https?:\/\//, "")}
                      </a>
                      <CopyLink url={row.urlCorta} title={row.titulo} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {PLATFORMS[row.prefijo]} · {TYPES[row.tipoDestino]}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-48 max-w-72 whitespace-normal">
                    <a
                      href={row.urlDestino}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={row.urlDestino}
                      className="inline-flex max-w-full items-center gap-1 text-sm underline-offset-4 hover:underline"
                    >
                      <span className="truncate">{row.dominioDestino}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {row.campana || "Sin campaña"}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-40">
                    <StateBadge state={row.estadoEfectivo} />
                    <p className="mt-2 whitespace-normal text-xs text-muted-foreground">
                      {row.venceAt
                        ? `Vence: ${formatDate(row.venceAt)}`
                        : "Sin vencimiento"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {new Intl.NumberFormat("es-PE").format(row.clics ?? 0)}
                  </TableCell>
                  <TableCell className="min-w-44 max-w-60 whitespace-normal">
                    <p className="text-sm">{row.creadorNombre}</p>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {trash && permissions.canPermanentlyDeleteLinks && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={busy}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Eliminar definitivamente ${row.titulo}`}
                          onClick={() => setAction({ row, kind: "definitivo" })}
                        >
                          <Trash2 />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Acciones de ${row.titulo}`}
                            />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                          {trash ? (
                            <DropdownMenuItem
                              onClick={() =>
                                setAction({ row, kind: "restaurar" })
                              }
                            >
                              <RotateCcw />
                              Restaurar
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => setTarget(row)}>
                                <Pencil />
                                Editar enlace
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setAction({
                                    row,
                                    kind:
                                      row.estado === "activo"
                                        ? "pausar"
                                        : "reactivar",
                                  })
                                }
                              >
                                {row.estado === "activo" ? <Pause /> : <Play />}
                                {row.estado === "activo"
                                  ? "Pausar"
                                  : "Reactivar"}
                              </DropdownMenuItem>
                            </>
                          )}
                          {permissions.canViewLinkAudit && (
                            <DropdownMenuItem
                              render={
                                <Link
                                  href={`/panel/enlaces/auditoria?enlaceId=${row._id}`}
                                />
                              }
                            >
                              <History />
                              Ver historial
                            </DropdownMenuItem>
                          )}
                          {!trash && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  setAction({ row, kind: "eliminar" })
                                }
                              >
                                <Trash2 />
                                Mover a papelera
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <LinkPagination
          pagination={pagination}
          onPage={setPage}
          disabled={loading || busy}
        />
      </section>
      {trash && (
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          Los códigos permanecen reservados. Restaurar no retira una pausa ni
          amplía el vencimiento.
        </p>
      )}
      {target && (
        <LinkForm
          key={target === "new" ? "new" : `${target._id}-${target.revision}`}
          link={target === "new" ? null : target}
          onClose={() => setTarget(null)}
          onReload={reloadLink}
          onSaved={(_row, close) => {
            if (close) setTarget(null);
            load();
          }}
        />
      )}
      <AdminConfirm
        show={Boolean(action)}
        title={actionCopy?.[0] || ""}
        message={actionCopy?.[1] || ""}
        confirmText={busy ? "Procesando…" : actionCopy?.[2]}
        type={
          action?.kind === "eliminar" || action?.kind === "definitivo"
            ? "error"
            : undefined
        }
        onConfirm={perform}
        onCancel={() => {
          if (!busy) setAction(null);
        }}
      />
    </div>
  );
}
