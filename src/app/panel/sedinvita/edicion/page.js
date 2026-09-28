'use client'

import { Calendar as AdminCalendarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { AdminSelect, AdminCheckbox } from '@/components/admin/form-controls'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
export default function Page() {
  const [ediciones, setEdiciones] = useState([])
  const [edicionActiva, setEdicionActiva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    estado: 'planificacion',
    fechaInicio: '',
    fechaFin: '',
    activa: false,
    seleccionTurnosAbierta: false,
  })
  const fetchEdiciones = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sedinvita/ediciones', {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar ediciones')
      setEdiciones(json.data || [])
      const activa = (json.data || []).find((e) => e.activa === true)
      setEdicionActiva(activa || null)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    fetchEdiciones()
  }, [fetchEdiciones])
  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      anio: new Date().getFullYear(),
      estado: 'planificacion',
      fechaInicio: '',
      fechaFin: '',
      activa: false,
      seleccionTurnosAbierta: false,
    })
    setEditingId(null)
    setShowForm(false)
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/sedinvita/ediciones/${editingId}` : '/api/sedinvita/ediciones'
      const method = editingId ? 'PATCH' : 'POST'
      const payload = {
        ...formData,
      }
      if (payload.fechaInicio === '') payload.fechaInicio = null
      if (payload.fechaFin === '') payload.fechaFin = null
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar edición')
      await fetchEdiciones()
      resetForm()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleToggleActiva = async (id, currentActiva) => {
    if (currentActiva) return
    if (!confirm('¿Activar esta edición? Se desactivará la actual.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sedinvita/ediciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          activa: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al activar edición')
      await fetchEdiciones()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleToggleSeleccionTurnos = async (id, currentValue) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sedinvita/ediciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          seleccionTurnosAbierta: !currentValue,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al actualizar')
      await fetchEdiciones()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleEdit = (edicion) => {
    setFormData({
      nombre: edicion.nombre || '',
      anio: edicion.anio || new Date().getFullYear(),
      estado: edicion.estado || 'planificacion',
      fechaInicio: edicion.fechaInicio ? new Date(edicion.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: edicion.fechaFin ? new Date(edicion.fechaFin).toISOString().split('T')[0] : '',
      activa: edicion.activa || false,
      seleccionTurnosAbierta: edicion.seleccionTurnosAbierta || false,
    })
    setEditingId(edicion._id)
    setShowForm(true)
  }
  const estados = ['planificacion', 'abierto', 'cerrado', 'finalizado']
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Ediciones SEDInvita</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-0">Configuración de ediciones del evento</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="pt-3 pr-4 pb-3 pl-4 bg-muted text-destructive rounded-xl mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="mb-4">
        <Button
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setFormData({
                nombre: '',
                anio: new Date().getFullYear(),
                estado: 'planificacion',
                fechaInicio: '',
                fechaFin: '',
                activa: false,
                seleccionTurnosAbierta: false,
              })
              setEditingId(null)
              setShowForm(true)
            }
          }}
          type="button"
          variant="default"
          className="items-center"
        >
          {showForm ? 'Cancelar' : '+ Nueva Edición'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-4 mb-4 shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
                required
                placeholder="Ej: SEDInvita 2026"
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Año *</Label>
              <Input
                type="number"
                value={formData.anio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    anio: Number(e.target.value),
                  })
                }
                required
                min={2000}
                max={2100}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Estado</Label>
              <AdminSelect
                value={formData.estado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estado: e.target.value,
                  })
                }
                className="w-full"
              >
                {estados.map((e) => (
                  <option key={e} value={e}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Activa</Label>
              <div className="flex items-center gap-2 pt-1.5">
                <AdminCheckbox
                  checked={formData.activa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activa: e.target.checked,
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.activa ? 'Edición activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Fecha Inicio</Label>
              <Input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaInicio: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">Fecha Fin</Label>
              <Input
                type="date"
                value={formData.fechaFin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaFin: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>
            <div
              style={{
                gridColumn: '1 / -1',
              }}
            >
              <Label className="text-sm font-semibold text-muted-foreground block mb-1">
                Selección Pública de Turnos
              </Label>
              <div className="flex items-center gap-2 pt-1.5">
                <AdminCheckbox
                  checked={formData.seleccionTurnosAbierta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seleccionTurnosAbierta: e.target.checked,
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.seleccionTurnosAbierta ? 'Abierta' : 'Cerrada'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
              }}
              type="submit"
              variant="default"
            >
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </Button>
            <Button type="button" onClick={resetForm} variant="outline">
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <Card className="overflow-hidden gap-0 py-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {['Año', 'Nombre', 'Estado', 'Activa', 'Turnos', 'Acciones'].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={5} />
              ) : ediciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                        }}
                        className="rounded-full bg-muted flex items-center justify-center"
                      >
                        <AdminCalendarIcon className="size-4" />
                      </div>
                      <p className="text-sm m-0">No hay ediciones registradas</p>
                      <p
                        style={{
                          opacity: 0.7,
                        }}
                        className="text-sm m-0"
                      >
                        Crea la primera edición usando el botón "Nueva Edición"
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ediciones.map((ed, i) => {
                  const isEven = i % 2 === 1
                  const isActiva = ed.activa === true
                  return (
                    <TableRow key={ed._id}>
                      <TableCell>{ed.anio}</TableCell>
                      <TableCell>{ed.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="">
                          {ed.estado?.charAt(0).toUpperCase() + ed.estado?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isActiva ? (
                          <span className="text-foreground font-semibold text-sm flex items-center gap-1">
                            Activa
                          </span>
                        ) : (
                          <Button
                            onClick={() => handleToggleActiva(ed._id, isActiva)}
                            variant="outline"
                            type="button"
                          >
                            Activar
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-destructive font-medium flex items-center gap-1">
                          {ed.seleccionTurnosAbierta ? '🔓 Abierta' : '🔒 Cerrada'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          <Button
                            onClick={() => handleEdit(ed)}
                            title="Editar edición"
                            variant="outline"
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                          {isActiva && (
                            <Button
                              onClick={() => handleToggleSeleccionTurnos(ed._id, ed.seleccionTurnosAbierta)}
                              variant="outline"
                              type="button"
                            >
                              {ed.seleccionTurnosAbierta ? 'Cerrar' : 'Abrir'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && ediciones.length > 0 && (
          <div className="pt-2 pr-4 pb-2 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0">
              {ediciones.length} edición{ediciones.length !== 1 ? 'es' : ''} registrada
              {ediciones.length !== 1 ? 's' : ''}
              {edicionActiva && ` • Activa: ${edicionActiva.nombre} (${edicionActiva.anio})`}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
function SkeletonRows({ dark, count = 5 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[60, 80, 60, 80, 60, 80].map((w, j) => (
        <TableCell key={j}>
          <div
            style={{
              height: '12px',
              width: `${w}px`,
              maxWidth: '100%',
            }}
            className="rounded-xl bg-muted animate-pulse"
          />
        </TableCell>
      ))}
    </TableRow>
  ))
}
