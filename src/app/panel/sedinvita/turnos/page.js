'use client'

import { Ticket as AdminTicketIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdminSelect, AdminModal } from '@/components/admin/form-controls'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useState, useEffect, useCallback, useMemo } from 'react'
export default function Page() {
  const [edicionActiva, setEdicionActiva] = useState(null)
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [faseFilter, setFaseFilter] = useState('fase2')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    edicionId: '',
    fase: 'fase2',
    nombre: '',
    horarioInicio: '',
    horarioFin: '',
    cupo: '',
    estado: 'abierto',
  })
  const fases = ['fase2', 'fase3', 'fase4']
  const estados = ['abierto', 'lleno', 'cerrado']
  const [estadisticas, setEstadisticas] = useState(null)
  const [postulantes, setPostulantes] = useState([])
  const [filtroPostulantes, setFiltroPostulantes] = useState('todos')
  const [busquedaPostulante, setBusquedaPostulante] = useState('')
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingPostulantes, setLoadingPostulantes] = useState(false)
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)
  const [filtroTurnoEspecifico, setFiltroTurnoEspecifico] = useState('todos')
  const opcionesTurnos = useMemo(() => {
    const nombresTurnos = [...new Set(turnos.map((t) => t.nombre))]
    return ['todos', ...nombresTurnos]
  }, [turnos])
  const postulantesFiltrados = useMemo(() => {
    let resultado = postulantes
    if (busquedaPostulante.trim()) {
      const busqueda = busquedaPostulante.trim().toLowerCase()
      resultado = resultado.filter(
        (p) =>
          p.codigoMatricula?.toLowerCase().includes(busqueda) ||
          p.nombres?.toLowerCase().includes(busqueda) ||
          p.apellidos?.toLowerCase().includes(busqueda) ||
          `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
          `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busqueda),
      )
    }
    if (filtroTurnoEspecifico !== 'todos') {
      resultado = resultado.filter((p) => p.tieneTurno && p.turno?.nombre === filtroTurnoEspecifico)
    }
    return resultado
  }, [postulantes, busquedaPostulante, filtroTurnoEspecifico])
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
      console.error(err)
      setError(err.message)
      return null
    }
  }, [])
  const fetchTurnos = useCallback(async (edicionId, fase) => {
    if (!edicionId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sedinvita/turnos?edicionId=${edicionId}&fase=${fase}`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar turnos')
      setTurnos(json.data || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  const fetchEstadisticas = useCallback(
    async (fase) => {
      if (!edicionActiva) return
      setLoadingStats(true)
      try {
        const res = await fetch(
          `/api/sedinvita/turnos/estadisticas?fase=${fase}&edicionId=${edicionActiva._id}`,
          {
            credentials: 'include',
          },
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al cargar estadísticas')
        setEstadisticas(json.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStats(false)
      }
    },
    [edicionActiva],
  )
  const fetchPostulantes = useCallback(
    async (fase, filtro) => {
      if (!edicionActiva) return
      setLoadingPostulantes(true)
      try {
        const params = new URLSearchParams({
          fase,
          filtro: filtro || 'todos',
          busqueda: '',
        })
        const res = await fetch(`/api/sedinvita/turnos/postulantes?${params}`, {
          credentials: 'include',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al cargar postulantes')
        setPostulantes(json.data.postulantes || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoadingPostulantes(false)
      }
    },
    [edicionActiva],
  )
  useEffect(() => {
    const init = async () => {
      const activa = await fetchEdicionActiva()
      if (activa) {
        await fetchTurnos(activa._id, faseFilter)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [fetchEdicionActiva, fetchTurnos, faseFilter])
  useEffect(() => {
    if (edicionActiva) {
      fetchEstadisticas(faseFilter)
      fetchPostulantes(faseFilter, filtroPostulantes)
    }
  }, [edicionActiva, faseFilter, filtroPostulantes, fetchEstadisticas, fetchPostulantes])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingId ? `/api/sedinvita/turnos/${editingId}` : '/api/sedinvita/turnos'
      const method = editingId ? 'PATCH' : 'POST'
      const payload = {
        ...formData,
        edicionId: edicionActiva._id,
        cupo: Number(formData.cupo),
      }
      if (payload.horarioInicio === '') payload.horarioInicio = undefined
      if (payload.horarioFin === '') payload.horarioFin = undefined
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar turno')
      await fetchTurnos(edicionActiva._id, faseFilter)
      resetForm()
      setMensajeConfirmacion('Turno guardado correctamente')
      setTimeout(() => setMensajeConfirmacion(null), 3000)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleEdit = (turno) => {
    setFormData({
      edicionId: turno.edicionId,
      fase: turno.fase || 'fase2',
      nombre: turno.nombre || '',
      horarioInicio: turno.horarioInicio || '',
      horarioFin: turno.horarioFin || '',
      cupo: turno.cupo || '',
      estado: turno.estado || 'abierto',
    })
    setEditingId(turno._id)
    setShowModal(true)
  }
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este turno? Solo se permite si no tiene inscritos.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sedinvita/turnos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al eliminar turno')
      await fetchTurnos(edicionActiva._id, faseFilter)
      setMensajeConfirmacion('Turno eliminado correctamente')
      setTimeout(() => setMensajeConfirmacion(null), 3000)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleEliminarTurno = async (postulante) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el turno de ${postulante.nombres} ${postulante.apellidos} (${postulante.codigoMatricula})?`,
      )
    ) {
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/sedinvita/turnos/eliminar-turno?codigo=${postulante.codigoMatricula}&turnoId=${postulante.turno?.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al eliminar turno')
      await Promise.all([
        fetchTurnos(edicionActiva._id, faseFilter),
        fetchEstadisticas(faseFilter),
        fetchPostulantes(faseFilter, filtroPostulantes),
      ])
      setMensajeConfirmacion('Turno eliminado correctamente')
      setTimeout(() => setMensajeConfirmacion(null), 3000)
    } catch (err) {
      console.error(err)
      alert('❌ Error al eliminar turno: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  const resetForm = () => {
    setFormData({
      edicionId: edicionActiva?._id || '',
      fase: 'fase2',
      nombre: '',
      horarioInicio: '',
      horarioFin: '',
      cupo: '',
      estado: 'abierto',
    })
    setEditingId(null)
    setShowModal(false)
  }
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Turnos SEDInvita</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-0">
              Administración de turnos por fase
              {edicionActiva && ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
            </p>
          </div>
        </div>
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

      {!edicionActiva && !error && (
        <Card className="text-center p-6">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div
              style={{
                width: '60px',
                height: '60px',
              }}
              className="rounded-full bg-muted flex items-center justify-center"
            >
              <AdminTicketIcon className="size-4" />
            </div>
            <p className="text-sm m-0">No hay edición activa</p>
            <p
              style={{
                opacity: 0.7,
              }}
              className="text-sm m-0"
            >
              Activa una edición en la sección "Ediciones" para gestionar turnos
            </p>
          </div>
        </Card>
      )}

      {edicionActiva && (
        <>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="items-center flex-wrap grid gap-2">
              <Label className="text-sm font-semibold text-muted-foreground">Fase:</Label>
              <AdminSelect
                value={faseFilter}
                onChange={(e) => setFaseFilter(e.target.value)}
                style={{
                  minWidth: '110px',
                }}
              >
                {fases.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="flex-1" />
            <Button
              onClick={() => {
                setFormData({
                  edicionId: edicionActiva._id,
                  fase: faseFilter,
                  nombre: '',
                  horarioInicio: '',
                  horarioFin: '',
                  cupo: '',
                  estado: 'abierto',
                })
                setEditingId(null)
                setShowModal(true)
              }}
              type="button"
              variant="default"
              className="items-center"
            >
              + Nuevo Turno
            </Button>
          </div>

          {showModal && (
            <AdminModal
              onClose={() => {
                resetForm()
              }}
            >
              <div className="space-y-6">
                <h2 className="text-foreground mt-0 mr-0 mb-4 ml-0 text-lg font-semibold">
                  {editingId ? 'Editar Turno' : 'Nuevo Turno'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground block mb-1">
                        Nombre *
                      </Label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombre: e.target.value,
                          })
                        }
                        required
                        placeholder="Ej: Turno Mañana"
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground block mb-1">Fase *</Label>
                      <AdminSelect
                        value={formData.fase}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fase: e.target.value,
                          })
                        }
                        required
                        className="w-full"
                      >
                        {fases.map((f) => (
                          <option key={f} value={f}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </option>
                        ))}
                      </AdminSelect>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground block mb-1">
                        Horario Inicio
                      </Label>
                      <Input
                        type="time"
                        value={formData.horarioInicio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            horarioInicio: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground block mb-1">
                        Horario Fin
                      </Label>
                      <Input
                        type="time"
                        value={formData.horarioFin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            horarioFin: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-muted-foreground block mb-1">Cupo *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.cupo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cupo: e.target.value,
                          })
                        }
                        required
                        placeholder="Ej: 30"
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
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      disabled={loading}
                      style={{
                        opacity: loading ? 0.6 : 1,
                      }}
                      type="submit"
                      variant="default"
                      className="flex-1"
                    >
                      {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </AdminModal>
          )}

          <Card className="overflow-hidden gap-0 py-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {['Nombre', 'Fase', 'Horario', 'Cupo', 'Inscritos', 'Estado', 'Acciones'].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <SkeletonRows count={5} />
                  ) : turnos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                            }}
                            className="rounded-full bg-muted flex items-center justify-center"
                          >
                            <AdminTicketIcon className="size-4" />
                          </div>
                          <p className="text-sm m-0">No hay turnos para {faseFilter}</p>
                          <p
                            style={{
                              opacity: 0.7,
                            }}
                            className="text-sm m-0"
                          >
                            Crea el primer turno usando el botón "Nuevo Turno"
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    turnos.map((turno, i) => {
                      const isEven = i % 2 === 1
                      const inscritos = turno.inscritos || 0
                      const cupo = turno.cupo || 0
                      const disponible = cupo - inscritos
                      return (
                        <TableRow key={turno._id}>
                          <TableCell>{turno.nombre}</TableCell>
                          <TableCell>{turno.fase?.charAt(0).toUpperCase() + turno.fase?.slice(1)}</TableCell>
                          <TableCell>
                            {turno.horarioInicio || '—'} {turno.horarioFin ? `- ${turno.horarioFin}` : ''}
                          </TableCell>
                          <TableCell>{cupo}</TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-destructive">
                              {inscritos}
                              {disponible > 0 && ` (${disponible} disp.)`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="">
                              {turno.estado?.charAt(0).toUpperCase() + turno.estado?.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap">
                              <Button
                                onClick={() => handleEdit(turno)}
                                title="Editar turno"
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
                              {inscritos === 0 && (
                                <Button
                                  onClick={() => handleDelete(turno._id)}
                                  variant="destructive"
                                  type="button"
                                >
                                  Eliminar
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
            {!loading && turnos.length > 0 && (
              <div className="pt-2 pr-4 pb-2 pl-4 border-t">
                <p className="text-sm text-muted-foreground m-0">
                  {turnos.length} turno{turnos.length !== 1 ? 's' : ''} en {faseFilter}
                  {edicionActiva && ` • Edición: ${edicionActiva.nombre} (${edicionActiva.anio})`}
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {edicionActiva && estadisticas && !loadingStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 mt-4">
          <Card className="p-6">
            <p className="text-xs text-muted-foreground m-0">Total Postulantes</p>
            <p className="text-2xl font-semibold text-foreground mt-1 mr-0 mb-1 ml-0">
              {estadisticas.resumen.totalPostulantes}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-muted-foreground m-0">Con turno</p>
            <p className="text-2xl font-semibold text-foreground mt-1 mr-0 mb-1 ml-0">
              {estadisticas.resumen.conTurno}
            </p>
            <p className="text-sm text-muted-foreground m-0">
              {estadisticas.resumen.porcentajeAvance}% del total
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-muted-foreground m-0">Sin turno</p>
            <p className="text-2xl font-semibold text-foreground mt-1 mr-0 mb-1 ml-0">
              {estadisticas.resumen.sinTurno}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-muted-foreground m-0">Cupos</p>
            <p className="text-2xl font-semibold text-foreground mt-1 mr-0 mb-1 ml-0">
              {estadisticas.resumen.totalInscritos}/{estadisticas.resumen.totalCupos}
            </p>
            <p className="text-sm text-muted-foreground m-0">
              {estadisticas.resumen.porcentajeOcupacion}% ocupados
            </p>
          </Card>
        </div>
      )}

      {edicionActiva && (
        <Card className="mb-4 p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="text-foreground m-0 text-lg font-semibold">
              Postulantes por turno
              {postulantes.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground ml-2">
                  {filtroPostulantes !== 'todos' || filtroTurnoEspecifico !== 'todos' ? (
                    <>
                      Mostrando {postulantesFiltrados.length} de {postulantes.length}
                      {filtroTurnoEspecifico !== 'todos' && ` (${filtroTurnoEspecifico})`}
                      {filtroTurnoEspecifico === 'todos' &&
                        filtroPostulantes !== 'todos' &&
                        ` (${filtroPostulantes === 'con_turno' ? 'con turno' : 'sin turno'})`}
                    </>
                  ) : (
                    `${postulantes.length} total`
                  )}
                </span>
              )}
              {postulantes.length === 0 && !loadingPostulantes && (
                <span className="text-sm font-medium text-muted-foreground ml-2">(0 postulantes)</span>
              )}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <AdminSelect
                value={filtroPostulantes}
                onChange={(e) => {
                  setFiltroPostulantes(e.target.value)
                  setBusquedaPostulante('')
                }}
              >
                <option value="todos">Todos</option>
                <option value="con_turno">Con turno</option>
                <option value="sin_turno">Sin turno</option>
              </AdminSelect>
              <AdminSelect
                value={filtroTurnoEspecifico}
                onChange={(e) => {
                  setFiltroTurnoEspecifico(e.target.value)
                  setBusquedaPostulante('')
                }}
                style={{
                  minWidth: '140px',
                }}
              >
                {opcionesTurnos.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion === 'todos' ? 'Todos los turnos' : opcion}
                  </option>
                ))}
              </AdminSelect>
              <Input
                type="text"
                placeholder="Buscar código, nombre..."
                value={busquedaPostulante}
                onChange={(e) => setBusquedaPostulante(e.target.value)}
                style={{
                  minWidth: '200px',
                }}
              />
              {busquedaPostulante && (
                <Button onClick={() => setBusquedaPostulante('')} variant="outline" type="button">
                  ✕ Limpiar
                </Button>
              )}
            </div>
          </div>

          {loadingPostulantes ? (
            <div className="text-center p-8 text-muted-foreground">Cargando postulantes...</div>
          ) : postulantes.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">No hay postulantes para esta fase</div>
          ) : postulantesFiltrados.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No hay postulantes que coincidan con la búsqueda
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Postulante</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postulantesFiltrados.map((p, i) => (
                      <TableRow key={p.codigoMatricula}>
                        <TableCell>{p.codigoMatricula}</TableCell>
                        <TableCell>
                          {p.apellidos} {p.nombres}
                        </TableCell>
                        <TableCell>
                          {p.correoElectronico && <div>{p.correoElectronico}</div>}
                          {p.numeroCelular && <div className="text-xs">{p.numeroCelular}</div>}
                        </TableCell>
                        <TableCell>
                          {p.tieneTurno ? (
                            <Badge variant="secondary" className="">
                              Con Turno
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="">
                              Sin Turno
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.tieneTurno && p.turno ? (
                            <div>
                              <div className="font-semibold text-sm">{p.turno.nombre}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.tieneTurno ? (
                            <Button
                              onClick={() => handleEliminarTurno(p)}
                              disabled={loading}
                              type="button"
                              variant={loading ? 'default' : 'outline'}
                              style={{
                                opacity: loading ? 0.6 : 1,
                              }}
                            >
                              {loading ? 'Procesando...' : 'Quitar turno'}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {postulantesFiltrados.length < postulantes.length && (
                <div className="pt-2 pr-4 pb-2 pl-4 border-t text-sm text-muted-foreground">
                  Mostrando {postulantesFiltrados.length} de {postulantes.length} postulantes
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
function SkeletonRows({ dark, count = 5 }) {
  return Array.from({
    length: count,
  }).map((_, i) => (
    <TableRow key={i}>
      {[80, 60, 80, 40, 60, 60, 80].map((w, j) => (
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
