'use client'

import { Progress } from '@/components/ui/progress'
import { useTheme } from '@/components/ThemeProvider'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { AdminSelect, AdminModal } from '@/components/admin/form-controls'
import { useState, useEffect, useCallback } from 'react'
const ESCALA = [
  {
    valor: 1,
    etiqueta: 'Malo',
  },
  {
    valor: 2,
    etiqueta: 'Regular',
  },
  {
    valor: 3,
    etiqueta: 'Bueno',
  },
  {
    valor: 4,
    etiqueta: 'Excelente',
  },
]
export default function Page() {
  const dark = useTheme().resolvedTheme === 'dark'
  const fases = ['fase2', 'fase3', 'fase4']
  const [edicionActiva, setEdicionActiva] = useState(null)
  const [faseFilter, setFaseFilter] = useState('fase2')
  const [turnos, setTurnos] = useState([])
  const [turnoId, setTurnoId] = useState('')
  const [resumen, setResumen] = useState([])
  const [loadingResumen, setLoadingResumen] = useState(true)
  const [error, setError] = useState(null)
  const [grupoId, setGrupoId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)
  const fetchEdicionActiva = useCallback(async () => {
    try {
      const res = await fetch('/api/sedinvita/ediciones', {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
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
      if (!res.ok) throw new Error(json.error)
      setTurnos(json.data || [])
      setTurnoId((prev) => ((json.data || []).some((x) => x._id === prev) ? prev : json.data?.[0]?._id || ''))
    } catch (err) {
      setError(err.message)
    }
  }, [])
  const fetchResumen = useCallback(async (id) => {
    if (!id) {
      setResumen([])
      setLoadingResumen(false)
      return
    }
    setLoadingResumen(true)
    try {
      const res = await fetch(`/api/sedinvita/evaluaciones/resumen?turnoId=${id}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResumen(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingResumen(false)
    }
  }, [])
  const fetchDetalle = useCallback(async (id) => {
    if (!id) return
    setLoadingDetalle(true)
    try {
      const res = await fetch(`/api/sedinvita/evaluaciones?grupoId=${id}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setDetalle(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingDetalle(false)
    }
  }, [])
  useEffect(() => {
    const init = async () => {
      const activa = await fetchEdicionActiva()
      if (activa) await fetchTurnos(activa._id, faseFilter)
      else setLoadingResumen(false)
    }
    init()
  }, [fetchEdicionActiva, fetchTurnos, faseFilter])
  useEffect(() => {
    fetchResumen(turnoId)
    setGrupoId(null)
    setDetalle(null)
  }, [turnoId, fetchResumen])
  useEffect(() => {
    if (grupoId) fetchDetalle(grupoId)
  }, [grupoId, fetchDetalle])
  async function guardarCorreccion(payload) {
    try {
      const res = await fetch(`/api/sedinvita/evaluaciones/${editando.evaluacion._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEditando(null)
      fetchDetalle(grupoId)
      fetchResumen(turnoId)
      setMensajeConfirmacion('Evaluación actualizada correctamente')
      setTimeout(() => setMensajeConfirmacion(null), 3000)
    } catch (err) {
      alert(err.message)
    }
  }
  async function eliminarEvaluacion(evaluacionId) {
    if (!confirm('¿Estás seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) return
    try {
      const res = await fetch(`/api/sedinvita/evaluaciones/${evaluacionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEliminando(null)
      fetchDetalle(grupoId)
      fetchResumen(turnoId)
      setMensajeConfirmacion('Evaluación eliminada correctamente')
      setTimeout(() => setMensajeConfirmacion(null), 3000)
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }
  const copiarLink = () => {
    const link = `${window.location.origin}/sedinvita/facilitador/login`
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const [copied, setCopied] = useState(false)
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Evaluación</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-0">
          Supervisión de avance por grupo ·{' '}
          {edicionActiva ? `${edicionActiva.nombre} (${edicionActiva.anio})` : ''}
        </p>
      </div>

      {mensajeConfirmacion && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-foreground rounded-xl mb-4 text-sm border">
          {mensajeConfirmacion}
        </div>
      )}

      {error && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-destructive rounded-xl mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <AdminSelect value={faseFilter} onChange={(e) => setFaseFilter(e.target.value)}>
          {fases.map((f) => (
            <option key={f} value={f}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect value={turnoId} onChange={(e) => setTurnoId(e.target.value)}>
          {turnos.length === 0 && <option value="">Sin turnos</option>}
          {turnos.map((tn) => (
            <option key={tn._id} value={tn._id}>
              {tn.nombre}
            </option>
          ))}
        </AdminSelect>
        <Button onClick={copiarLink} variant="outline" type="button">
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {loadingResumen ? (
          Array.from({
            length: 3,
          }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '90px',
              }}
              className="rounded-xl bg-muted animate-pulse"
            />
          ))
        ) : resumen.length === 0 ? (
          <p
            style={{
              gridColumn: '1/-1',
            }}
            className="text-sm text-muted-foreground text-center p-6"
          >
            No hay grupos para este turno
          </p>
        ) : (
          resumen.map((g) => (
            <Button
              key={g._id}
              onClick={() => setGrupoId(g._id)}
              variant="outline"
              type="button"
              className="h-auto min-h-9 whitespace-normal py-3"
            >
              <p className="font-semibold text-sm text-current m-0">{g.nombre || 'Grupo'}</p>
              <p className="text-xs text-current mt-0.5 mr-0 mb-2 ml-0">
                {g.facilitadores?.length
                  ? g.facilitadores.map((f) => `${f.nombres} ${f.apellidos}`).join(', ')
                  : 'Sin facilitador'}{' '}
                · {g.totalPostulantes} postulantes
              </p>
              <Progress value={g.porcentaje} aria-label="Avance" />
              <p className="text-xs font-semibold text-current mt-1.5 mr-0 mb-0 ml-0">
                {g.completadas}/{g.totalDinamicas * g.totalPostulantes} evaluaciones · {g.porcentaje}%
              </p>
            </Button>
          ))
        )}
      </div>

      {grupoId && (
        <Card className="overflow-hidden gap-0 py-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Postulante</TableHead>
                  {(detalle?.dinamicas || []).map((d) => (
                    <TableHead key={d._id}>{d.nombre}</TableHead>
                  ))}

                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingDetalle ? (
                  <TableRow>
                    <TableCell colSpan={99}>Cargando…</TableCell>
                  </TableRow>
                ) : (
                  (detalle?.grupo?.postulantes || []).map((p, i) => {
                    const evaluacionesPostulante = (detalle?.evaluaciones || []).filter(
                      (e) => e.postulanteId === p._id,
                    )
                    const totalPuntos = evaluacionesPostulante.reduce((sum, ev) => {
                      const suma = ev.puntajes.reduce((s, x) => s + x.puntaje, 0)
                      return sum + suma
                    }, 0)
                    return (
                      <TableRow key={p._id}>
                        <TableCell>
                          {p.apellidos}, {p.nombres}
                        </TableCell>
                        {(detalle?.dinamicas || []).map((d) => {
                          const ev = (detalle?.evaluaciones || []).find(
                            (e) => e.postulanteId === p._id && e.dinamicaId === d._id,
                          )
                          const suma = ev ? ev.puntajes.reduce((s, x) => s + x.puntaje, 0) : null
                          return (
                            <TableCell key={d._id}>
                              <Button
                                onClick={() =>
                                  setEditando({
                                    postulante: p,
                                    dinamica: d,
                                    evaluacion: ev || null,
                                  })
                                }
                                type="button"
                                variant={ev ? 'default' : 'outline'}
                              >
                                {ev ? `${suma}/12` : '—'}
                              </Button>
                            </TableCell>
                          )
                        })}

                        <TableCell>{totalPuntos > 0 ? totalPuntos : '—'}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              const ev = (detalle?.evaluaciones || []).find((e) => e.postulanteId === p._id)
                              if (ev) {
                                setEliminando({
                                  postulante: p,
                                  evaluacion: ev,
                                })
                              }
                            }}
                            disabled={!detalle?.evaluaciones?.some((e) => e.postulanteId === p._id)}
                            type="button"
                            variant={
                              detalle?.evaluaciones?.some((e) => e.postulanteId === p._id)
                                ? 'default'
                                : 'outline'
                            }
                            style={{
                              opacity: detalle?.evaluaciones?.some((e) => e.postulanteId === p._id) ? 1 : 0.5,
                            }}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {editando && (
        <CorreccionModal
          editando={editando}
          onClose={() => setEditando(null)}
          onGuardar={guardarCorreccion}
        />
      )}

      {eliminando && (
        <EliminarModal
          postulante={eliminando.postulante}
          evaluacion={eliminando.evaluacion}
          onClose={() => setEliminando(null)}
          onEliminar={eliminarEvaluacion}
        />
      )}
    </div>
  )
}
function CorreccionModal({ t, dark, editando, onClose, onGuardar }) {
  const { postulante, dinamica, evaluacion } = editando
  const [puntajes, setPuntajes] = useState(
    Object.fromEntries(
      dinamica.competencias.map((c) => [
        c,
        evaluacion?.puntajes?.find((p) => p.competencia === c)?.puntaje || 0,
      ]),
    ),
  )
  const [comentario, setComentario] = useState(evaluacion?.comentario || '')
  const [opinionInfiltrado, setOpinionInfiltrado] = useState(evaluacion?.opinionInfiltrado || '')
  const completo = dinamica.competencias.every((c) => puntajes[c] > 0)
  if (!evaluacion) {
    return (
      <AdminModal
        onClose={() => {
          onClose()
        }}
      >
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground mb-4">
            {postulante.apellidos}, {postulante.nombres} aún no tiene evaluación registrada en{' '}
            <strong>{dinamica.nombre}</strong>. Solo se pueden corregir evaluaciones ya enviadas por el
            facilitador.
          </p>
          <Button onClick={onClose} variant="default" type="button">
            Entendido
          </Button>
        </div>
      </AdminModal>
    )
  }
  return (
    <AdminModal
      onClose={() => {
        onClose()
      }}
    >
      <div className="space-y-6">
        <h2 className="text-foreground mt-0 mr-0 mb-1 ml-0 text-lg font-semibold">{dinamica.nombre}</h2>
        <p className="text-sm text-muted-foreground mt-0 mr-0 mb-4 ml-0">
          {postulante.apellidos}, {postulante.nombres} · corrección administrativa
        </p>

        {dinamica.competencias.map((c) => (
          <div key={c} className="mb-3">
            <p className="text-sm font-semibold text-foreground mb-1.5">{c}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
              {ESCALA.map((opt) => {
                const activo = puntajes[c] === opt.valor
                return (
                  <Button
                    key={opt.valor}
                    onClick={() =>
                      setPuntajes((prev) => ({
                        ...prev,
                        [c]: opt.valor,
                      }))
                    }
                    type="button"
                    variant={activo ? 'default' : 'outline'}
                  >
                    {opt.valor} · {opt.etiqueta}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mb-2 grid gap-2">
          <Label className="text-sm font-semibold text-foreground block mb-1">Opinión del infiltrado</Label>
          <Textarea
            value={opinionInfiltrado}
            onChange={(e) => setOpinionInfiltrado(e.target.value)}
            rows={2}
            className="w-full"
          />
        </div>
        <div className="mb-4 grid gap-2">
          <Label className="text-sm font-semibold text-foreground block mb-1">Comentario adicional</Label>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" type="button" className="flex-1">
            Cancelar
          </Button>
          <Button
            disabled={!completo}
            onClick={() =>
              onGuardar({
                puntajes: dinamica.competencias.map((c) => ({
                  competencia: c,
                  puntaje: puntajes[c],
                })),
                comentario,
                opinionInfiltrado,
              })
            }
            type="button"
            variant="default"
            className="flex-1"
          >
            Guardar corrección
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
function EliminarModal({ t, dark, postulante, evaluacion, onClose, onEliminar }) {
  return (
    <AdminModal
      onClose={() => {
        onClose()
      }}
    >
      <div className="space-y-6">
        <h2 className="text-destructive mt-0 mr-0 mb-2 ml-0 text-lg font-semibold">Eliminar evaluación</h2>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Estás seguro de eliminar la evaluación de{' '}
          <strong>
            {postulante.apellidos}, {postulante.nombres}
          </strong>
          ?
          <br />
          <br />
          Esta acción eliminará permanentemente el registro de la base de datos y no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" type="button" className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => onEliminar(evaluacion._id)}
            variant="destructive"
            type="button"
            className="flex-1"
          >
            Sí, eliminar
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
