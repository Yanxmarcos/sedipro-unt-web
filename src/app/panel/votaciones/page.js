'use client'
import { usePanelSession } from '@/components/admin/panel-session'

import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { AdminToast } from '@/components/admin/form-controls'
import { AdminConfirm as SweetAlert } from '@/components/admin/form-controls'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow, TableHead, TableHeader, TableBody, Table } from '@/components/ui/table'
import { AdminModal, AdminSelect } from '@/components/admin/form-controls'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
function Toast(props) {
  return <AdminToast {...props} />
}
function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(7)].map((_, i) => (
        <TableCell key={i}>
          <div
            style={{
              width: `${60 + (i % 5) * 8}%`,
            }}
            className="h-4 rounded animate-pulse bg-muted"
          />
        </TableCell>
      ))}
    </TableRow>
  )
}
function fmtFechaLocal(d) {
  if (!d) return '—'
  const fecha = typeof d === 'string' ? d.split('T')[0] : d
  const [year, month, day] = fecha.split('-')
  const meses = [
    'ene.',
    'feb.',
    'mar.',
    'abr.',
    'may.',
    'jun.',
    'jul.',
    'ago.',
    'sept.',
    'oct.',
    'nov.',
    'dic.',
  ]
  return `${day} ${meses[parseInt(month) - 1]} ${year}`
}
function fmtFechaUTC(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
function fmtFechaHoraUTC(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
export default function VotacionesPage() {
  const { permissions } = usePanelSession()
  const router = useRouter()
  const [votaciones, setVotaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [asistencias, setAsistencias] = useState([])
  const [alert, setAlert] = useState({
    show: false,
  })
  const [toast, setToast] = useState({
    show: false,
  })
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    asistenciaId: '',
    titulo: '',
    tipo: 'binaria',
    opciones: ['', ''],
    fechaInicio: '',
    fechaCierre: '',
  })
  const [editForm, setEditForm] = useState({
    titulo: '',
    fechaCierre: '',
    estado: 'activa',
  })
  const [saving, setSaving] = useState(false)
  const showToast = (type, message) =>
    setToast({
      show: true,
      type,
      message,
    })
  const fetchVotaciones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/votaciones')
      const data = await res.json()
      setVotaciones(data.votaciones || [])
    } catch {
      showToast('error', 'Error al cargar votaciones')
    } finally {
      setLoading(false)
    }
  }, [])
  const fetchAsistencias = useCallback(async () => {
    try {
      const res = await fetch('/api/asistencias')
      const data = await res.json()
      setAsistencias(
        (data.asistencias || []).filter((a) => {
          const habilitados = (a.resumen?.presentes || 0) + (a.resumen?.tardanzas || 0)
          return habilitados > 0
        }),
      )
    } catch (error) {
      console.error('Error cargando asistencias:', error)
    }
  }, [])
  useEffect(() => {
    fetchVotaciones()
  }, [fetchVotaciones])
  const handleOpenForm = () => {
    fetchAsistencias()
    setForm({
      asistenciaId: '',
      titulo: '',
      tipo: 'binaria',
      opciones: ['', ''],
      fechaInicio: '',
      fechaCierre: '',
    })
    setShowForm(true)
    setShowEditForm(false)
  }
  const handleAddOpcion = () => {
    if (form.opciones.length >= 10) return
    setForm((f) => ({
      ...f,
      opciones: [...f.opciones, ''],
    }))
  }
  const handleRemoveOpcion = (i) => {
    if (form.opciones.length <= 2) return
    setForm((f) => ({
      ...f,
      opciones: f.opciones.filter((_, idx) => idx !== i),
    }))
  }
  const handleOpcionChange = (i, val) => {
    setForm((f) => {
      const o = [...f.opciones]
      o[i] = val
      return {
        ...f,
        opciones: o,
      }
    })
  }
  const handleCreate = async () => {
    const { asistenciaId, titulo, tipo, opciones, fechaInicio, fechaCierre } = form
    if (!asistenciaId) return showToast('warning', 'Selecciona una asistencia')
    if (!titulo.trim()) return showToast('warning', 'El título es requerido')
    if (tipo === 'multiple') {
      const clean = opciones.map((o) => o.trim()).filter(Boolean)
      if (clean.length < 2) return showToast('warning', 'Mínimo 2 opciones')
      if (new Set(clean.map((o) => o.toLowerCase())).size !== clean.length)
        return showToast('warning', 'No se pueden repetir opciones')
    }
    setSaving(true)
    try {
      const res = await fetch('/api/votaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asistenciaId,
          titulo,
          tipo,
          opciones: tipo === 'multiple' ? opciones.map((o) => o.trim()).filter(Boolean) : undefined,
          fechaInicio: fechaInicio || undefined,
          fechaCierre: fechaCierre || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) return showToast('error', data.message)
      showToast('success', '¡Votación creada correctamente!')
      setShowForm(false)
      fetchVotaciones()
    } catch {
      showToast('error', 'Error al crear votación')
    } finally {
      setSaving(false)
    }
  }
  const formatForInput = (fechaUTC) => {
    if (!fechaUTC) return ''
    const fecha = new Date(fechaUTC)
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    const hours = String(fecha.getHours()).padStart(2, '0')
    const minutes = String(fecha.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  const handleEditOpen = async (v) => {
    if (v.resumen?.totalVotos > 0) {
      return setAlert({
        show: true,
        type: 'warning',
        title: 'No se puede editar',
        message: `Esta votación ya tiene ${v.resumen.totalVotos} voto(s) registrado(s). No es posible editarla.`,
        showCancel: false,
        confirmText: 'Entendido',
        onConfirm: () =>
          setAlert({
            show: false,
          }),
        onCancel: () =>
          setAlert({
            show: false,
          }),
      })
    }
    setEditTarget(v)
    setEditForm({
      titulo: v.titulo,
      fechaCierre: formatForInput(v.fechaCierre),
      estado: v.estado,
    })
    setShowEditForm(true)
    setShowForm(false)
  }
  const handleEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/votaciones/${editTarget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: editForm.titulo,
          fechaCierre: editForm.fechaCierre || null,
          estado: editForm.estado,
        }),
      })
      const data = await res.json()
      if (!res.ok) return showToast('error', data.message)
      showToast('success', 'Votación actualizada')
      setShowEditForm(false)
      fetchVotaciones()
    } catch {
      showToast('error', 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = (v) => {
    setAlert({
      show: true,
      type: 'error',
      title: 'Eliminar votación',
      message: `¿Retirar "${v.titulo}" de la lista? Sus votos y resultados se conservarán en el historial.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onCancel: () =>
        setAlert({
          show: false,
        }),
      onConfirm: async () => {
        setAlert({
          show: false,
        })
        try {
          const res = await fetch(`/api/votaciones/${v._id}`, {
            method: 'DELETE',
          })
          const data = await res.json()
          if (!res.ok) return showToast('error', data.message)
          showToast('success', 'Votación eliminada')
          fetchVotaciones()
        } catch {
          showToast('error', 'Error al eliminar')
        }
      },
    })
  }
  const handleExportExcel = async (v) => {
    try {
      const res = await fetch(`/api/votaciones/${v._id}`)
      const data = await res.json()
      const { votacion: vot, votos, presentes } = data
      const wb = XLSX.utils.book_new()
      const resumenData = [
        ['RESUMEN DE VOTACIÓN'],
        ['Título:', vot.titulo],
        ['Tipo:', vot.tipo === 'binaria' ? 'Sí/No' : 'Opción múltiple'],
        ['Estado:', vot.estado === 'activa' ? 'Activa' : 'Cerrada'],
        ['Total votos:', vot.resumen?.totalVotos || 0],
        [
          'Total Habilitados:',
          (vot.asistencia?.resumen?.presentes || 0) + (vot.asistencia?.resumen?.tardanzas || 0),
        ],
        [],
        ['Opción', 'Votos', 'Porcentaje'],
        ...(vot.resumen?.opciones || []).map((o) => {
          const pct =
            vot.resumen?.totalVotos > 0 ? ((o.votos / vot.resumen.totalVotos) * 100).toFixed(1) + '%' : '0%'
          return [o.opcion, o.votos, pct]
        }),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), 'Resumen')
      const votantesData = [
        ['Nombre Completo', 'DNI', 'Opción Elegida', 'Fecha de Voto'],
        ...(votos || []).map((voto) => [
          `${voto.sediprano?.apellidos || ''} ${voto.sediprano?.nombres || ''}`.trim(),
          voto.sediprano?.dni || '',
          voto.opcionSeleccionada,
          fmtFechaHoraUTC(voto.fechaVoto),
        ]),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(votantesData), 'Votantes')
      XLSX.writeFile(wb, `votacion_${vot.titulo.replace(/\s+/g, '_')}.xlsx`)
      showToast('success', 'Excel exportado correctamente')
    } catch {
      showToast('error', 'Error al exportar')
    }
  }
  const filtered = votaciones.filter(
    (v) =>
      v.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      v.asistencia?.descripcion?.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="space-y-6">
      <SweetAlert {...alert} />
      <Toast
        {...toast}
        onClose={() =>
          setToast({
            show: false,
          })
        }
      />

      <div className="mb-6">
        <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">Votaciones</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Gestiona las votaciones de SEDIPRO UNT</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button
          onClick={handleOpenForm}
          variant="default"
          type="button"
          className="flex items-center justify-center gap-2 duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear votación
        </Button>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o asistencia..."
            className="w-full focus:outline-none"
          />
        </div>
      </div>

      {showForm && (
        <Card className="mb-5 overflow-hidden animate-slide-down gap-0 py-0">
          <div className="h-1 w-full bg-muted" />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Nueva Votación</h2>
              <Button onClick={() => setShowForm(false)} variant="outline" type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            <div className="grid gap-2">
              <Label className="block text-xs font-semibold mb-1.5 text-foreground">
                Asistencia vinculada *
              </Label>
              <AdminSelect
                value={form.asistenciaId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    asistenciaId: e.target.value,
                  }))
                }
                className="w-full focus:outline-none"
              >
                <option value="">Seleccionar asistencia...</option>
                {asistencias.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.descripcion} ({fmtFechaUTC(a.fecha)}) (
                    {(a.resumen?.presentes || 0) + (a.resumen?.tardanzas || 0)} habilitados)
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div className="grid gap-2">
              <Label className="block text-xs font-semibold mb-1.5 text-foreground">Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    titulo: e.target.value,
                  }))
                }
                placeholder="Ej. ¿Aprueba el nuevo estatuto?"
                className="w-full focus:outline-none"
              />
            </div>

            <div>
              <Label className="block text-xs font-semibold mb-2 text-foreground">Tipo de votación *</Label>
              <RadioGroup
                className="flex gap-4"
                value={form.tipo}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    tipo: value,
                    opciones: ['', ''],
                  }))
                }
              >
                {[
                  {
                    val: 'binaria',
                    label: 'Sí / No',
                  },
                  {
                    val: 'multiple',
                    label: 'Opción múltiple',
                  },
                ].map((t) => (
                  <Label key={t.val} className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value={t.val} />
                    <span className="text-sm text-foreground">{t.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {form.tipo === 'binaria' && (
              <div className="flex gap-2">
                {['SI', 'NO'].map((o) => (
                  <Badge key={o} variant="secondary" className="">
                    {o}
                  </Badge>
                ))}
              </div>
            )}

            {form.tipo === 'multiple' && (
              <div className="space-y-2">
                <Label className="block text-xs font-semibold text-foreground">
                  Opciones ({form.opciones.length}/10)
                </Label>
                {form.opciones.map((op, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={op}
                      onChange={(e) => handleOpcionChange(i, e.target.value)}
                      placeholder={`Opción ${i + 1}`}
                      className="flex-1 focus:outline-none"
                    />
                    {form.opciones.length > 2 && (
                      <Button onClick={() => handleRemoveOpcion(i)} variant="outline" type="button">
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
                {form.opciones.length < 10 && (
                  <Button
                    onClick={handleAddOpcion}
                    variant="outline"
                    type="button"
                    className="flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar opción
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="block text-xs font-semibold mb-1.5 text-foreground">Fecha de inicio</Label>
                <Input
                  type="datetime-local"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fechaInicio: e.target.value,
                    }))
                  }
                  className="w-full focus:outline-none"
                />
              </div>
              <div className="grid gap-2">
                <Label className="block text-xs font-semibold mb-1.5 text-foreground">
                  Fecha de cierre <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={form.fechaCierre}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fechaCierre: e.target.value,
                    }))
                  }
                  className="w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={() => setShowForm(false)} variant="outline" type="button" className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                variant="default"
                type="button"
                style={{
                  opacity: saving ? 0.7 : 1,
                }}
                className="flex-1"
              >
                {saving ? 'Guardando...' : 'Crear votación'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showEditForm && editTarget && (
        <Card className="mb-5 overflow-hidden animate-slide-down gap-0 py-0">
          <div className="h-1 w-full bg-muted" />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Editar Votación</h2>
              <Button onClick={() => setShowEditForm(false)} variant="outline" type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            <div className="rounded-xl p-3 text-xs space-y-1 bg-muted text-muted-foreground">
              <p>
                <span className="font-semibold">Asistencia:</span>{' '}
                {editTarget.asistencia
                  ? `${fmtFechaLocal(editTarget.asistencia.fecha)} — ${editTarget.asistencia.descripcion}`
                  : '—'}
              </p>
              <p>
                <span className="font-semibold">Tipo:</span>{' '}
                {editTarget.tipo === 'binaria' ? 'Sí / No' : 'Opción múltiple'}
              </p>
              <p>
                <span className="font-semibold">Opciones:</span> {editTarget.opciones?.join(', ')}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="block text-xs font-semibold mb-1.5 text-foreground">Título *</Label>
              <Input
                value={editForm.titulo}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    titulo: e.target.value,
                  }))
                }
                className="w-full focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <Label className="block text-xs font-semibold mb-1.5 text-foreground">Fecha de cierre</Label>
              <Input
                type="datetime-local"
                value={editForm.fechaCierre}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    fechaCierre: e.target.value,
                  }))
                }
                className="w-full focus:outline-none"
              />
            </div>
            <div>
              <Label className="block text-xs font-semibold mb-2 text-foreground">Estado</Label>
              <RadioGroup
                className="flex gap-4"
                value={editForm.estado}
                onValueChange={(value) =>
                  setEditForm((f) => ({
                    ...f,
                    estado: value,
                  }))
                }
              >
                {[
                  {
                    val: 'activa',
                    label: 'Activa',
                  },
                  {
                    val: 'cerrada',
                    label: 'Cerrada',
                  },
                ].map((s) => (
                  <Label key={s.val} className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value={s.val} />
                    <span className="text-sm text-foreground">{s.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => setShowEditForm(false)}
                variant="outline"
                type="button"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEdit}
                disabled={saving}
                type="button"
                style={{
                  opacity: saving ? 0.7 : 1,
                }}
                variant="default"
                className="flex-1"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden gap-0 py-0">
        <div className="pt-4 pr-4 pb-4 pl-4 border-b flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-foreground flex">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="22"
                height="22"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
            </span>
            <span className="font-semibold text-sm text-foreground">Listado de votaciones</span>
          </div>
          {!loading && (
            <Badge variant="secondary" className="">
              {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {['Fecha', 'Título', 'Asistencia', 'Tipo', 'Participación', 'Estado', 'Acciones'].map((h) => (
                  <TableHead key={h} className="uppercase tracking-wide">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-7 w-7 text-muted-foreground"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-foreground">No se registraron votaciones</p>
                      <p className="text-xs text-muted-foreground">
                        Crea una nueva votación con el botón de arriba
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => {
                  const presentesCount = v.asistencia?.resumen?.presentes || 0
                  const tardanzasCount = v.asistencia?.resumen?.tardanzas || 0
                  const totalHabilitados = presentesCount + tardanzasCount
                  const votos = v.resumen?.totalVotos || 0
                  const pct = totalHabilitados > 0 ? Math.round((votos / totalHabilitados) * 100) : 0
                  const isActiva = v.estado === 'activa'
                  return (
                    <TableRow key={v._id}>
                      <TableCell className="whitespace-nowrap">{fmtFechaUTC(v.createdAt)}</TableCell>
                      <TableCell className="max-w-xs">
                        <span className="font-semibold line-clamp-2 text-foreground">{v.titulo}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-xs">
                          {v.asistencia
                            ? `${fmtFechaLocal(v.asistencia.fecha)} — ${v.asistencia.descripcion}`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className="">
                          {v.tipo === 'binaria' ? 'Sí/No' : 'Múltiple'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="space-y-1 min-w-25">
                          <span className="text-xs font-semibold text-foreground">
                            {votos}/{totalHabilitados} <span className="text-muted-foreground">({pct}%)</span>
                          </span>
                          <Progress value={pct} aria-label="Avance" />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className="">
                          {isActiva ? 'Activa' : 'Cerrada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button
                            title="Ver resultados"
                            onClick={() => router.push(`/panel/votaciones/${v._id}/resultados`)}
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Button>
                          <Button
                            title="Editar votación"
                            onClick={() => handleEditOpen(v)}
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
                          <Button
                            title="Exportar Excel"
                            onClick={() => handleExportExcel(v)}
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
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </Button>
                          {permissions.canDelete && <Button
                            title="Eliminar votación"
                            onClick={() => handleDelete(v)}
                            variant="destructive"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="pt-3 pr-4 pb-3 pl-4 border-t">
            <p className="text-sm text-muted-foreground m-0">
              {filtered.length} votación{filtered.length !== 1 ? 'es' : ''} registrada
              {filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
