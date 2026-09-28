'use client'

import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { AdminSelect, AdminModal } from '@/components/admin/form-controls'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
const COMPETENCIA_VACIA = ['', '', '']
export default function Page() {
  const fases = ['fase2', 'fase3', 'fase4']
  const [edicionActiva, setEdicionActiva] = useState(null)
  const [faseFilter, setFaseFilter] = useState('fase2')
  const [turnos, setTurnos] = useState([])
  const [turnoId, setTurnoId] = useState('')
  const [dinamicas, setDinamicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    competencias: COMPETENCIA_VACIA,
    orden: 0,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
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
  const fetchDinamicas = useCallback(async (id) => {
    if (!id) {
      setDinamicas([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sedinvita/dinamicas?turnoId=${id}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setDinamicas(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
    fetchDinamicas(turnoId)
  }, [turnoId, fetchDinamicas])
  function abrirCrear() {
    setEditing(null)
    setForm({
      nombre: '',
      descripcion: '',
      competencias: COMPETENCIA_VACIA,
      orden: dinamicas.length,
    })
    setFormError(null)
    setShowModal(true)
  }
  function abrirEditar(d) {
    setEditing(d)
    setForm({
      nombre: d.nombre,
      descripcion: d.descripcion || '',
      competencias: [d.competencias[0] || '', d.competencias[1] || '', d.competencias[2] || ''],
      orden: d.orden || 0,
    })
    setFormError(null)
    setShowModal(true)
  }
  async function guardar() {
    setFormError(null)
    const competenciasLimpias = form.competencias.map((c) => c.trim()).filter(Boolean)
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido')
      return
    }
    if (competenciasLimpias.length !== 3) {
      setFormError('Debes indicar exactamente tres competencias')
      return
    }
    setSaving(true)
    try {
      const body = {
        edicionId: edicionActiva._id,
        turnoId,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        competencias: competenciasLimpias,
        orden: Number(form.orden) || 0,
      }
      const res = editing
        ? await fetch(`/api/sedinvita/dinamicas/${editing._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(body),
          })
        : await fetch('/api/sedinvita/dinamicas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(body),
          })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar')
      setShowModal(false)
      fetchDinamicas(turnoId)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }
  async function eliminar(d) {
    if (!confirm(`¿Eliminar la dinámica "${d.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/sedinvita/dinamicas/${d._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      fetchDinamicas(turnoId)
    } catch (err) {
      alert(err.message)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Dinámicas</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-0">
            Cada dinámica evalúa exactamente tres competencias ·{' '}
            {edicionActiva ? `${edicionActiva.nombre} (${edicionActiva.anio})` : ''}
          </p>
        </div>
        <Button onClick={abrirCrear} disabled={!turnoId} type="button" variant="default">
          + Nueva dinámica
        </Button>
      </div>

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          Array.from({
            length: 3,
          }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '150px',
              }}
              className="rounded-xl bg-muted animate-pulse"
            />
          ))
        ) : dinamicas.length === 0 ? (
          <Card
            style={{
              gridColumn: '1/-1',
            }}
            className="text-center text-muted-foreground text-sm p-6"
          >
            {turnoId ? 'Aún no hay dinámicas para este turno' : 'Selecciona un turno'}
          </Card>
        ) : (
          dinamicas.map((d) => (
            <Card key={d._id} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm text-foreground m-0">{d.nombre}</p>
                <Badge variant="secondary" className="">
                  #{d.orden}
                </Badge>
              </div>
              {d.descripcion && (
                <p className="text-sm text-muted-foreground mt-0 mr-0 mb-2 ml-0">{d.descripcion}</p>
              )}
              <div className="flex flex-col gap-1 mb-3">
                {d.competencias.map((c, i) => (
                  <Badge
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: 'fit-content',
                    }}
                    variant="secondary"
                    className=""
                  >
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => abrirEditar(d)} variant="outline" type="button" className="flex-1">
                  Editar
                </Button>
                <Button onClick={() => eliminar(d)} variant="destructive" type="button" className="flex-1">
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <AdminModal
          onClose={() => {
            setShowModal(false)
          }}
        >
          <div className="space-y-6">
            <h2 className="text-foreground mt-0 mr-0 mb-4 ml-0 text-lg font-semibold">
              {editing ? 'Editar dinámica' : 'Nueva dinámica'}
            </h2>

            <div className="mb-3 grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nombre: e.target.value,
                  }))
                }
                placeholder="Ej: La Torre Humana"
              />
            </div>

            <div className="mb-3 grid gap-2">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descripcion: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            <div className="mb-3">
              <Label>Competencias (exactamente 3)</Label>
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={form.competencias[i]}
                  onChange={(e) =>
                    setForm((f) => {
                      const nuevas = [...f.competencias]
                      nuevas[i] = e.target.value
                      return {
                        ...f,
                        competencias: nuevas,
                      }
                    })
                  }
                  placeholder={`Competencia ${i + 1}`}
                  className="mb-2"
                />
              ))}
            </div>

            <div className="mb-4 grid gap-2">
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.orden}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    orden: e.target.value,
                  }))
                }
              />
            </div>

            {formError && (
              <div className="pt-2 pr-3 pb-2 pl-3 bg-muted text-destructive rounded-xl mb-3 text-sm">
                {formError}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setShowModal(false)} variant="outline" type="button" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={guardar} disabled={saving} type="button" variant="default" className="flex-1">
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
