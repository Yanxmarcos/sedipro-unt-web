'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AdminToast } from '@/components/admin/form-controls'
import { cn } from '@/lib/utils'
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
const ESTADOS = {
  presente: {
    label: 'Presente',
  },
  tardanza: {
    label: 'Tardanza',
  },
  justificado: {
    label: 'Justificado',
  },
  ausente: {
    label: 'Ausente',
  },
}
function fmtFechaHora(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
function BarChart({ opciones, totalVotos, dark }) {
  return (
    <div className="space-y-3">
      {opciones.map((op, i) => {
        const pct = totalVotos > 0 ? (op.votos / totalVotos) * 100 : 0
        return (
          <div key={op.opcion} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{op.opcion}</span>
              <span className="text-muted-foreground">
                {op.votos} votos ({pct.toFixed(1)}%)
              </span>
            </div>
            <Progress value={Math.max(pct, pct > 0 ? 8 : 0)} aria-label="Avance" />
          </div>
        )
      })}
    </div>
  )
}
function Toast(props) {
  return <AdminToast {...props} />
}
export default function ResultadosPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVotantes, setShowVotantes] = useState(false)
  const [toast, setToast] = useState({
    show: false,
  })
  const chartRef = useRef(null)
  const [showPendientes, setShowPendientes] = useState(false)
  useEffect(() => {
    fetch(`/api/votaciones/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])
  const showToast = (type, message) =>
    setToast({
      show: true,
      type,
      message,
    })
  const handleExportExcel = async () => {
    try {
      const wb = XLSX.utils.book_new()
      const { votacion: vot, votos } = data
      const resumenData = [
        ['RESUMEN DE VOTACIÓN'],
        ['Título:', vot.titulo],
        ['Tipo:', vot.tipo === 'binaria' ? 'Sí/No' : 'Opción múltiple'],
        ['Estado:', vot.estado === 'activa' ? 'Activa' : 'Cerrada'],
        ['Total votos:', vot.resumen?.totalVotos || 0],
        ['Total habilitados:', totalHabilitados],
        ['Participación:', `${pctParticipacion}%`],
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
        ...(votos || []).map((v) => [
          `${v.sediprano?.apellidos || ''} ${v.sediprano?.nombres || ''}`.trim(),
          v.sediprano?.dni || '',
          v.opcionSeleccionada,
          fmtFechaHora(v.fechaVoto),
        ]),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(votantesData), 'Votantes')
      XLSX.writeFile(wb, `resultados_${vot.titulo.replace(/\s+/g, '_')}.xlsx`)
      showToast('success', 'Excel exportado')
    } catch {
      showToast('error', 'Error al exportar')
    }
  }
  const ocultarOpcion = true
  if (loading)
    return (
      <div className="space-y-6">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" />
      </div>
    )
  if (!data?.votacion)
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Votación no encontrada</p>
      </div>
    )
  const { votacion: vot, votos = [], presentes = [] } = data
  const totalVotos = vot.resumen?.totalVotos || 0
  const totalHabilitados =
    (vot.asistencia?.resumen?.presentes || 0) + (vot.asistencia?.resumen?.tardanzas || 0)
  const pctParticipacion = totalHabilitados > 0 ? Math.round((totalVotos / totalHabilitados) * 100) : 0
  return (
    <div className="space-y-6">
      <Toast
        {...toast}
        onClose={() =>
          setToast({
            show: false,
          })
        }
      />

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            type="button"
            className="flex items-center justify-center shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <div>
            <h1 className="text-foreground m-0 text-2xl font-semibold tracking-tight">{vot.titulo}</h1>
            {vot.asistencia && (
              <p className="text-sm text-muted-foreground mt-0.5 mb-0">
                {fmtFechaLocal(vot.asistencia.fecha)} — {vot.asistencia.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Button onClick={handleExportExcel} variant="outline" type="button" className="flex items-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          {
            label: 'Total votos',
            value: totalVotos,
          },
          {
            label: 'Habilitados',
            value: totalHabilitados,
          },
          {
            label: 'Participación',
            value: `${pctParticipacion}%`,
          },
          {
            label: 'Estado',
            value: vot.estado === 'activa' ? 'Activa' : 'Cerrada',
          },
          {
            label: 'Fecha inicio',
            value: fmtFechaHora(vot.fechaInicio),
          },
          {
            label: 'Fecha cierre',
            value: fmtFechaHora(vot.fechaCierre),
          },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold mt-1 wrap-break-word text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-5 p-6">
        <h2 className="mb-4 text-foreground text-lg font-semibold">Resultados por opción</h2>
        <BarChart opciones={vot.resumen?.opciones || []} totalVotos={totalVotos} />
      </Card>

      <Card className="overflow-hidden mb-5 gap-0 py-0">
        <div className="p-4 border-b">
          <h2 className="text-foreground text-lg font-semibold">Tabla de resultados</h2>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {['Opción', 'Votos', 'Porcentaje', 'Barra'].map((h) => (
                  <TableHead key={h} className="uppercase tracking-wide">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(vot.resumen?.opciones || []).map((op, i) => {
                const pct = totalVotos > 0 ? (op.votos / totalVotos) * 100 : 0
                return (
                  <TableRow key={op.opcion}>
                    <TableCell>{op.opcion}</TableCell>
                    <TableCell>{op.votos}</TableCell>
                    <TableCell>{pct.toFixed(1)}%</TableCell>
                    <TableCell className="min-w-30">
                      <Progress value={pct} aria-label="Avance" />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="overflow-hidden mb-5 gap-0 py-0">
        <Button
          onClick={() => setShowVotantes((v) => !v)}
          variant="outline"
          type="button"
          className="w-full flex items-center justify-between hover:opacity-80"
        >
          <span className="text-sm font-bold text-current">Lista de votantes ({votos.length})</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={cn(
              `h-5 w-5 transition-transform duration-200 ${showVotantes ? 'rotate-180' : ''} `,
              'text-muted-foreground',
            )}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
        {showVotantes && (
          <div className="border-t overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  {['Nombre', 'DNI', 'Opción', 'Fecha de voto'].map((h) => (
                    <TableHead key={h} className="uppercase tracking-wide">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {votos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>Sin votos registrados</TableCell>
                  </TableRow>
                ) : (
                  votos.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>
                        {`${v.sediprano?.apellidos || ''} ${v.sediprano?.nombres || ''}`.trim() || '—'}
                      </TableCell>
                      <TableCell>{v.sediprano?.dni || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          title="Voto Oculto"
                          variant="secondary"
                          className="flex items-center justify-center"
                        >
                          {ocultarOpcion ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-eye-off-icon lucide-eye-off"
                            >
                              <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                              <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                              <path d="m2 2 20 20" />
                            </svg>
                          ) : (
                            v.opcionSeleccionada
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{fmtFechaHora(v.fechaVoto)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden gap-0 py-0">
        <Button
          onClick={() => setShowPendientes((p) => !p)}
          variant="outline"
          type="button"
          className="w-full flex items-center justify-between hover:opacity-80"
        >
          <span className="text-sm font-bold text-current">
            Pendientes por votar ({presentes.filter((p) => !p.yaVoto).length})
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={cn(
              `h-5 w-5 transition-transform duration-200 ${showPendientes ? 'rotate-180' : ''} `,
              'text-muted-foreground',
            )}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {showPendientes && (
          <div className="border-t overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  {['Nombre', 'Asistencia'].map((h) => (
                    <TableHead key={h} className="uppercase tracking-wide">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentes.filter((p) => !p.yaVoto).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2}>Todos han votado</TableCell>
                  </TableRow>
                ) : (
                  presentes
                    .filter((p) => !p.yaVoto)
                    .map((p) => {
                      const estadoAsistencia = p.estadoAsistencia?.toLowerCase() || 'presente'
                      const infoEstado = ESTADOS[estadoAsistencia] || ESTADOS.presente
                      return (
                        <TableRow key={p._id}>
                          <TableCell>{`${p.nombres || ''} ${p.apellidos || ''}`.trim() || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="inline-block">
                              {infoEstado.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
