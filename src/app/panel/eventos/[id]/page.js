'use client'

import { Badge } from '@/components/ui/badge'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { AdminSelect } from '@/components/admin/form-controls'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
export default function GestionEventoPage() {
  const routeParams = useParams()
  const [id, setId] = useState(null)
  const [event, setEvent] = useState(null)
  const [regs, setRegs] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [field, setField] = useState({
    clave: '',
    etiqueta: '',
    tipo: 'texto',
    requerido: false,
    opciones: '',
  })
  useEffect(() => {
    setId(routeParams.id)
  }, [routeParams.id])
  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/eventos/${id}`),
        fetch(`/api/eventos/${id}/inscripciones`),
      ])
      const da = await a.json()
      const db = await b.json()
      if (!a.ok) throw new Error(da.error)
      if (!b.ok) throw new Error(db.error)
      setEvent(da.data)
      setRegs(db.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])
  useEffect(() => {
    load()
  }, [load])
  async function patch(data) {
    const r = await fetch(`/api/eventos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error)
    setEvent(d.data)
    return d.data
  }
  async function togglePublish() {
    try {
      const next = event.estado === 'publicado' ? 'cerrado' : 'publicado'
      await patch({
        estado: next,
        inscripcionAbierta: next === 'publicado',
      })
      setNotice(
        next === 'publicado' ? 'Evento publicado e inscripciones abiertas.' : 'Inscripciones cerradas.',
      )
    } catch (e) {
      setError(e.message)
    }
  }
  async function createSheet() {
    try {
      const r = await fetch(`/api/eventos/${id}/google-sheet`, {
        method: 'POST',
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setEvent((x) => ({
        ...x,
        googleSheetUrl: d.data.url,
      }))
      setNotice('Hoja de Google creada correctamente.')
    } catch (e) {
      setError(e.message)
    }
  }
  async function importFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const f = new FormData()
      f.append('file', file)
      const r = await fetch(`/api/eventos/${id}/importar`, {
        method: 'POST',
        body: f,
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setNotice(
        `Importación terminada: ${d.data.created} creados, ${d.data.duplicates} duplicados omitidos${d.data.errors.length ? `, ${d.data.errors.length} con error` : ''}.`,
      )
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }
  async function addField(e) {
    e.preventDefault()
    if (!field.clave || !field.etiqueta) return
    try {
      await patch({
        camposPersonalizados: [
          ...(event.camposPersonalizados || []),
          {
            ...field,
            opciones: field.opciones
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
          },
        ],
      })
      setField({
        clave: '',
        etiqueta: '',
        tipo: 'texto',
        requerido: false,
        opciones: '',
      })
    } catch (e) {
      setError(e.message)
    }
  }
  async function deleteField(i) {
    try {
      await patch({
        camposPersonalizados: event.camposPersonalizados.filter((_, n) => n !== i),
      })
    } catch (e) {
      setError(e.message)
    }
  }
  if (loading) return <div className="space-y-6">Cargando evento…</div>
  if (!event) return <div className="space-y-6">{error || 'Evento no encontrado'}</div>
  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/eventos/${event.slug}`
      : `/eventos/${event.slug}`
  return (
    <div className="space-y-6">
      <Link
        href="/panel/eventos"
        className={buttonVariants({
          variant: 'outline',
        })}
      >
        ← Todos los eventos
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">{event.titulo}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(event.fechaInicio).toLocaleString('es-PE')} · {event.lugar || 'Sin lugar'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={togglePublish} variant="outline" type="button">
            {event.estado === 'publicado' ? 'Cerrar inscripción' : 'Publicar y abrir'}
          </Button>
          <Link
            href={`/panel/eventos/${id}/checkin`}
            className={buttonVariants({
              variant: 'outline',
            })}
          >
            Abrir check-in
          </Link>
        </div>
      </div>
      {(error || notice) && (
        <p
          className={cn(
            `mt-4 rounded-lg p-3 text-sm ${error ? 'bg-muted text-destructive' : 'bg-muted text-foreground'} `,
            '',
          )}
        >
          {error || notice}
        </p>
      )}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-muted p-5 shadow-sm">
          <h2 className="text-[var(--primary)] text-lg font-semibold">Formulario público</h2>
          <p className="mt-2 break-all rounded bg-background p-2 text-sm text-foreground">{publicUrl}</p>
          <a
            href={publicUrl}
            target="_blank"
            className="mt-3 inline-block text-sm font-semibold text-foreground underline"
          >
            Abrir formulario
          </a>
          <hr className="my-5 border-border" />
          <h2 className="text-[var(--primary)] text-lg font-semibold">Google Sheets</h2>
          {event.googleSheetUrl ? (
            <a
              href={event.googleSheetUrl}
              target="_blank"
              className="mt-2 inline-block text-sm font-semibold text-foreground underline"
            >
              Abrir hoja vinculada ↗
            </a>
          ) : (
            <Button onClick={createSheet} variant="outline" type="button" className="mt-3">
              Crear hoja del evento
            </Button>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Requiere las credenciales de Google configuradas en el servidor.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-muted p-5 shadow-sm">
          <h2 className="text-[var(--primary)] text-lg font-semibold">Importar respuestas de Google Forms</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Admite CSV, XLS o XLSX. Columnas requeridas: Nombres, Apellidos y Correo electrónico. Reconoce
            DNI, Celular y Organización/Universidad.
          </p>
          <Label className="mt-4 cursor-pointer rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-foreground grid gap-2">
            {uploading ? 'Importando…' : 'Seleccionar archivo'}
            <Input
              disabled={uploading}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={importFile}
              className="hidden"
            />
          </Label>
        </section>
        <section className="rounded-xl border border-border bg-muted p-5 shadow-sm lg:col-span-2">
          <h2 className="text-[var(--primary)] text-lg font-semibold">Campos personalizados</h2>
          <form onSubmit={addField} className="mt-3 grid gap-2 md:grid-cols-5 space-y-6">
            <Input
              required
              placeholder="clave, ej. carrera"
              value={field.clave}
              onChange={(e) =>
                setField((x) => ({
                  ...x,
                  clave: e.target.value,
                }))
              }
            />
            <Input
              required
              placeholder="Etiqueta"
              value={field.etiqueta}
              onChange={(e) =>
                setField((x) => ({
                  ...x,
                  etiqueta: e.target.value,
                }))
              }
            />
            <AdminSelect
              value={field.tipo}
              onChange={(e) =>
                setField((x) => ({
                  ...x,
                  tipo: e.target.value,
                }))
              }
            >
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="seleccion">Selección</option>
              <option value="textarea">Texto largo</option>
            </AdminSelect>
            <Input
              placeholder="Opciones separadas por coma"
              value={field.opciones}
              onChange={(e) =>
                setField((x) => ({
                  ...x,
                  opciones: e.target.value,
                }))
              }
            />
            <Button type="submit" variant="default">
              Agregar campo
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {event.camposPersonalizados?.map((f, i) => (
              <Badge key={`${f.clave}-${i}`} variant="secondary" className="">
                {f.etiqueta}
                {f.requerido ? ' *' : ''}{' '}
                <Button onClick={() => deleteField(i)} variant="destructive" type="button" className="ml-1">
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-6 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
        <div className="flex justify-between p-5">
          <h2 className="text-[var(--primary)] text-lg font-semibold">Inscritos ({regs.length})</h2>
          <span className="text-sm text-muted-foreground">{event.totalAsistencias} presentes</span>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="uppercase">
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200">
              {regs.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    {r.personaId?.nombres} {r.personaId?.apellidos}
                  </TableCell>
                  <TableCell>{r.personaId?.correo}</TableCell>
                  <TableCell>{r.codigo}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>
                    {r.asistencia
                      ? `${r.asistencia.estado} · ${new Date(r.asistencia.hora).toLocaleTimeString('es-PE')}`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
