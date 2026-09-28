'use client'

import { Badge } from '@/components/ui/badge'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminSelect, AdminModal } from '@/components/admin/form-controls'
import { useState, useEffect, useCallback } from 'react'
export default function Page() {
  const fases = ['fase2', 'fase3', 'fase4']
  const [edicionActiva, setEdicionActiva] = useState(null)
  const [faseFilter, setFaseFilter] = useState('fase2')
  const [turnos, setTurnos] = useState([])
  const [turnoId, setTurnoId] = useState('')
  const [roster, setRoster] = useState([])
  const [resumen, setResumen] = useState({
    presentes: 0,
    tardanzas: 0,
    ausentes: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [encargados, setEncargados] = useState([])
  const [showAsignar, setShowAsignar] = useState(false)
  const [sedipranos, setSedipranos] = useState([])
  const [buscarSediprano, setBuscarSediprano] = useState('')
  const [asignando, setAsignando] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [rosterLocal, setRosterLocal] = useState({})
  const fetchEdicionActiva = useCallback(async () => {
    try {
      const res = await fetch('/api/sedinvita/ediciones', {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar ediciones')
      const activa = (json.data || []).find((e) => e.activa === true)
      setEdicionActiva(activa || null)
      return activa
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])
  const fetchTurnos = useCallback(async (edicionId, fase) => {
    if (!edicionId) return
    try {
      const res = await fetch(`/api/sedinvita/turnos?edicionId=${edicionId}&fase=${fase}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar turnos')
      setTurnos(json.data || [])
      setTurnoId((prev) => ((json.data || []).some((x) => x._id === prev) ? prev : json.data?.[0]?._id || ''))
    } catch (err) {
      setError(err.message)
    }
  }, [])
  const fetchRoster = useCallback(async (id) => {
    if (!id) {
      setRoster([])
      setRosterLocal({})
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sedinvita/asistencia?turnoId=${id}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar asistencia')
      const data = json.data || []
      setRoster(data)
      setRosterLocal({})
      const presentes = data.filter((p) => p.asistencia.estado === 'presente').length
      const tardanzas = data.filter((p) => p.asistencia.estado === 'tardanza').length
      const ausentes = data.filter((p) => p.asistencia.estado === 'ausente').length
      setResumen({
        presentes,
        tardanzas,
        ausentes,
        total: data.length,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  const fetchEncargados = useCallback(async (id) => {
    if (!id) {
      setEncargados([])
      return
    }
    try {
      const res = await fetch(`/api/sedinvita/encargados-asistencia?turnoId=${id}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (res.ok) setEncargados(json.data || [])
    } catch {}
  }, [])
  useEffect(() => {
    const init = async () => {
      const activa = await fetchEdicionActiva()
      if (activa) await fetchTurnos(activa._id, faseFilter)
      else setLoading(false)
    }
    init()
  }, [fetchEdicionActiva, fetchTurnos, faseFilter])
  useEffect(() => {
    fetchRoster(turnoId)
    fetchEncargados(turnoId)
  }, [turnoId, fetchRoster, fetchEncargados])
  async function toggleAsistencia(postulanteId, nuevoEstado) {
    try {
      setRosterLocal((prev) => ({
        ...prev,
        [postulanteId]: nuevoEstado,
      }))
      const rosterConLocal = roster.map((p) =>
        p._id === postulanteId
          ? {
              ...p,
              asistencia: {
                ...p.asistencia,
                estado: nuevoEstado,
              },
            }
          : p,
      )
      const presentes = rosterConLocal.filter((p) => p.asistencia.estado === 'presente').length
      const tardanzas = rosterConLocal.filter((p) => p.asistencia.estado === 'tardanza').length
      const ausentes = rosterConLocal.filter((p) => p.asistencia.estado === 'ausente').length
      setResumen({
        presentes,
        tardanzas,
        ausentes,
        total: rosterConLocal.length,
      })
      const res = await fetch('/api/sedinvita/asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postulanteId,
          turnoId,
          estado: nuevoEstado,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error al guardar')
      }
      setRoster((prevRoster) =>
        prevRoster.map((p) =>
          p._id === postulanteId
            ? {
                ...p,
                asistencia: {
                  ...p.asistencia,
                  estado: nuevoEstado,
                  hora: new Date(),
                },
              }
            : p,
        ),
      )
      setRosterLocal((prev) => {
        const next = {
          ...prev,
        }
        delete next[postulanteId]
        return next
      })
    } catch (err) {
      setRosterLocal((prev) => {
        const next = {
          ...prev,
        }
        delete next[postulanteId]
        return next
      })
      const presentes = roster.filter((p) => p.asistencia.estado === 'presente').length
      const tardanzas = roster.filter((p) => p.asistencia.estado === 'tardanza').length
      const ausentes = roster.filter((p) => p.asistencia.estado === 'ausente').length
      setResumen({
        presentes,
        tardanzas,
        ausentes,
        total: roster.length,
      })
      alert('Error al guardar asistencia: ' + err.message)
    }
  }
  async function copiarLink() {
    const link = `${window.location.origin}/sedinvita/login`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('No se pudo copiar')
    }
  }
  async function abrirAsignar() {
    if (!turnoId) return
    setShowAsignar(true)
    try {
      const res = await fetch('/api/sedipranos', {
        credentials: 'include',
      })
      const json = await res.json()
      if (res.ok) setSedipranos(json.data || [])
    } catch {}
  }
  async function asignarEncargado(sedipranoId) {
    setAsignando(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/sedinvita/encargados-asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          turnoId,
          edicionId: edicionActiva?._id,
          sedipranoId,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setEncargados((prev) => [...prev, json.data])
        setShowAsignar(false)
        setBuscarSediprano('')
      } else {
        setErrorMsg(json.error || 'Error')
      }
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setAsignando(false)
    }
  }
  async function eliminarEncargado(id) {
    if (!confirm('¿Eliminar este encargado?')) return
    try {
      const res = await fetch(`/api/sedinvita/encargados-asistencia/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setEncargados((prev) => prev.filter((e) => e._id !== id))
      }
    } catch {}
  }
  const filtered = roster.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.apellidos?.toLowerCase().includes(q) ||
      p.nombres?.toLowerCase().includes(q) ||
      p.codigoMatricula?.includes(q)
    )
  })
  const sedipranosFiltrados = sedipranos
    .filter((s) => {
      const q = buscarSediprano.toLowerCase()
      return (
        s.nombres?.toLowerCase().includes(q) || s.apellidos?.toLowerCase().includes(q) || s.dni?.includes(q)
      )
    })
    .filter((s) => !encargados.some((e) => e.sedipranoId === s._id))
  const turnoActual = turnos.find((x) => x._id === turnoId)
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Asistencia SEDInvita</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-0">
          Día del evento · marca presente/tardanza/ausente por turno
          {edicionActiva && ` · ${edicionActiva.nombre} (${edicionActiva.anio})`}
        </p>
      </div>

      {error && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-destructive rounded-xl mb-4 text-sm">{error}</div>
      )}

      {!edicionActiva && !error ? (
        <EmptyState text="No hay edición activa" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <AdminSelect value={faseFilter} onChange={(e) => setFaseFilter(e.target.value)}>
              {fases.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              value={turnoId}
              onChange={(e) => setTurnoId(e.target.value)}
              style={{
                minWidth: '160px',
              }}
            >
              {turnos.length === 0 && <option value="">Sin turnos</option>}
              {turnos.map((tn) => (
                <option key={tn._id} value={tn._id}>
                  {tn.nombre}
                </option>
              ))}
            </AdminSelect>
            <div
              style={{
                minWidth: '160px',
              }}
              className="flex-1"
            >
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <CounterCard label="Presentes" value={resumen.presentes} />
            <CounterCard label="Tardanzas" value={resumen.tardanzas} />
            <CounterCard label="Ausentes" value={resumen.ausentes} />
            <CounterCard label="Total turno" value={resumen.total} />
          </div>

          <Card className="mb-4 p-6">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <p className="font-semibold text-sm text-foreground m-0">
                Encargados de este turno
                <span className="text-sm font-medium text-muted-foreground ml-2">
                  ({encargados.length} asignado{encargados.length !== 1 ? 's' : ''})
                </span>
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={copiarLink} variant="outline" type="button">
                  {copied ? 'Copiado' : 'Copiar link'}
                </Button>
                <Button onClick={abrirAsignar} disabled={!turnoId} variant="outline" type="button">
                  + Agregar encargado
                </Button>
              </div>
            </div>

            {encargados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center pt-4 pr-0 pb-4 pl-0">
                Aún no hay encargados asignados a este turno
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {encargados.map((e) => (
                  <div
                    key={e._id}
                    className="flex items-center justify-between pt-2 pr-3 pb-2 pl-3 rounded-xl bg-muted border"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground m-0">
                        {e.nombres} {e.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">DNI: {e.dni}</p>
                    </div>
                    <Button onClick={() => eliminarEncargado(e._id)} variant="destructive" type="button">
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {showAsignar && (
            <AdminModal onClose={() => setShowAsignar(false)}>
              <div className="space-y-6">
                <div className="border-b flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-foreground m-0 text-lg font-semibold">Agregar encargado</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 mr-0 mb-0 ml-0">
                      {turnoActual?.nombre || 'Selecciona un turno'} · {edicionActiva?.nombre} (
                      {edicionActiva?.anio})
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAsignar(false)}
                    variant="outline"
                    type="button"
                    className="flex items-center justify-center"
                  >
                    ✕
                  </Button>
                </div>

                <div className="border-b shrink-0">
                  <Input
                    autoFocus
                    value={buscarSediprano}
                    onChange={(e) => setBuscarSediprano(e.target.value)}
                    placeholder="Buscar por nombre o DNI…"
                    className="w-full"
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {sedipranos.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">Cargando sedipranos…</div>
                  ) : sedipranosFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No hay sedipranos disponibles
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {sedipranosFiltrados.map((s) => (
                        <Button
                          key={s._id}
                          onClick={() => asignarEncargado(s._id)}
                          disabled={asignando}
                          variant="outline"
                          type="button"
                        >
                          <strong>
                            {s.nombres} {s.apellidos}
                          </strong>
                          <span className="block text-xs text-current mt-0.5">DNI: {s.dni}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AdminModal>
          )}

          <Card className="overflow-hidden gap-0 py-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {['Postulante', 'Código', 'Estado', 'Hora', 'Acción'].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <SkeletonRows count={6} />
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        {turnoId ? 'No hay postulantes con este turno elegido' : 'Selecciona un turno'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p, i) => {
                      const estado =
                        rosterLocal[p._id] !== undefined ? rosterLocal[p._id] : p.asistencia.estado
                      const stateColors = {
                        presente: {
                          label: 'Presente',
                        },
                        tardanza: {
                          label: 'Tardanza',
                        },
                        ausente: {
                          label: 'Ausente',
                        },
                      }
                      const colors = stateColors[estado] || stateColors.ausente
                      const isLoading = rosterLocal[p._id] !== undefined
                      return (
                        <TableRow key={p._id}>
                          <TableCell>
                            {p.apellidos} {p.nombres}
                          </TableCell>
                          <TableCell>{p.codigoMatricula}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="">
                              {colors.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.asistencia.hora
                              ? new Date(p.asistencia.hora).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                onClick={() => toggleAsistencia(p._id, 'presente')}
                                disabled={isLoading}
                                type="button"
                                variant={estado === 'presente' ? 'default' : 'outline'}
                                style={{
                                  opacity: isLoading ? 0.6 : 1,
                                }}
                              >
                                Presente
                              </Button>
                              <Button
                                onClick={() => toggleAsistencia(p._id, 'tardanza')}
                                disabled={isLoading}
                                type="button"
                                variant={estado === 'tardanza' ? 'default' : 'outline'}
                                style={{
                                  opacity: isLoading ? 0.6 : 1,
                                }}
                              >
                                Tardanza
                              </Button>
                              <Button
                                onClick={() => toggleAsistencia(p._id, 'ausente')}
                                disabled={isLoading}
                                type="button"
                                variant={estado === 'ausente' ? 'default' : 'outline'}
                                style={{
                                  opacity: isLoading ? 0.6 : 1,
                                }}
                              >
                                Ausente
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
function CounterCard({ label, value, color, bg }) {
  return (
    <div
      style={{
        flex: '1 1 100px',
      }}
      className="bg-muted rounded-xl pt-3 pr-4 pb-3 pl-4 border"
    >
      <p
        style={{
          opacity: 0.8,
        }}
        className="text-xs font-semibold text-foreground m-0"
      >
        {label}
      </p>
      <p className="text-2xl font-semibold text-foreground mt-0.5 mr-0 mb-0 ml-0">{value}</p>
    </div>
  )
}
function EmptyState({ t, text }) {
  return (
    <Card className="text-center p-6">
      <p className="text-sm text-muted-foreground m-0">{text}</p>
    </Card>
  )
}
function SkeletonRows({ dark, count }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[1, 2, 3, 4, 5].map((j) => (
        <TableCell key={j}>
          <div
            style={{
              height: '12px',
            }}
            className="bg-muted rounded-xl animate-pulse"
          ></div>
        </TableCell>
      ))}
    </TableRow>
  ))
}
