'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

function isDark() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sedipro_dark') === 'true'
}

function getTheme(dark) {
    return {
        cardBg:        dark ? '#160C22' : '#ffffff',
        cardBorder:    dark ? 'rgba(103,37,119,0.28)' : 'rgba(214,182,223,0.55)',
        cardShadow:    dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(103,37,119,0.10)',
        inputBg:       dark ? '#1F1030' : '#f9f6fb',
        inputBorder:   dark ? 'rgba(103,37,119,0.35)' : '#e5d9ef',
        inputText:     dark ? '#EAD8F5' : '#111827',
        labelText:     dark ? '#C8A8D8' : '#4A1A5E',
        bodyText:      dark ? '#9880B0' : '#6B7280',
        tableHead:     dark ? '#1A0D2E' : '#f5f0f9',
        tableHeadText: dark ? '#C8A8D8' : '#4A1A5E',
        tableRow:      dark ? '#160C22' : '#ffffff',
        tableRowAlt:   dark ? '#1A0D2B' : '#faf7fc',
        tableRowHover: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.05)',
        tableBorder:   dark ? 'rgba(103,37,119,0.16)' : 'rgba(214,182,223,0.45)',
        dividerText:   dark ? '#6B5080' : '#c4aed4',
        pageBg:        dark ? '#0E0818' : '#f8f5fa',
        titleText:     dark ? '#EAD8F5' : '#4A1A5E',
    }
}

function fmtFecha(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtFechaHora(d) {
    if (!d) return '—'
    return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtFechaLocal(d) {
    if (!d) return '—'
    const fecha = typeof d === 'string' ? d.split('T')[0] : d
    const [year, month, day] = fecha.split('-')
    const meses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.']
    return `${day} ${meses[parseInt(month) - 1]} ${year}`
}

function BarChart({ opciones, totalVotos, dark }) {
    const colors = ['#672577', '#3454A1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#84CC16']
    return (
        <div className="space-y-3">
            {opciones.map((op, i) => {
                const pct = totalVotos > 0 ? (op.votos / totalVotos) * 100 : 0
                return (
                    <div key={op.opcion} className="space-y-1">
                        <div className="flex items-center justify-between text-sm font-poppins">
                            <span className="font-semibold" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>{op.opcion}</span>
                            <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>{op.votos} votos ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-8 rounded-lg overflow-hidden" style={{ backgroundColor: dark ? '#2d2b3e' : '#f3f4f6' }}>
                            <div
                                className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                                style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, backgroundColor: colors[i % colors.length] }}
                            >
                                {pct > 15 && <span className="text-xs font-bold text-white">{pct.toFixed(0)}%</span>}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function Toast({ show, type, message, onClose }) {
    useEffect(() => { if (show) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) } }, [show])
    if (!show) return null
    const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' }
    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-down max-w-xs w-full">
            <div className="rounded-xl p-4 shadow-lg flex items-start gap-3" style={{ backgroundColor: isDark() ? '#1e1b2e' : '#fff', border: `1px solid ${colors[type]}30` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: colors[type] }} />
                <p className="text-sm font-poppins flex-1" style={{ color: isDark() ? '#e2e8f0' : '#374151' }}>{message}</p>
                <button onClick={onClose} className="text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
        </div>
    )
}

export default function ResultadosPage() {
    const { id } = useParams()
    const router = useRouter()
    const [dark, setDark] = useState(false)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showVotantes, setShowVotantes] = useState(false)
    const [toast, setToast] = useState({ show: false })
    const chartRef = useRef(null)
    const t = getTheme(dark)

    useEffect(() => {
        const stored = localStorage.getItem('sedipro_dark')
        if (stored !== null) setDark(stored === 'true')

        const onStorage = (e) => {
            if (e.key === 'sedipro_dark') setDark(e.newValue === 'true')
        }
        window.addEventListener('storage', onStorage)

        const interval = setInterval(() => {
            const val = localStorage.getItem('sedipro_dark')
            setDark(prev => {
                const next = val === 'true'
                return prev !== next ? next : prev
            })
        }, 400)

        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval) }
    }, [])

    useEffect(() => {
        fetch(`/api/votaciones/${id}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    const showToast = (type, message) => setToast({ show: true, type, message })

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
                ['Total presentes:', vot.asistencia?.resumen?.presentes || 0],
                [],
                ['Opción', 'Votos', 'Porcentaje'],
                ...(vot.resumen?.opciones || []).map(o => {
                    const pct = vot.resumen?.totalVotos > 0 ? ((o.votos / vot.resumen.totalVotos) * 100).toFixed(1) + '%' : '0%'
                    return [o.opcion, o.votos, pct]
                })
            ]
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), 'Resumen')

            const votantesData = [
                ['Nombre Completo', 'DNI', 'Opción Elegida', 'Fecha de Voto'],
                ...(votos || []).map(v => [
                    `${v.sediprano?.apellidos || ''} ${v.sediprano?.nombres || ''}`.trim(),
                    v.sediprano?.dni || '',
                    v.opcionSeleccionada,
                    fmtFechaHora(v.fechaVoto)
                ])
            ]
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(votantesData), 'Votantes')
            XLSX.writeFile(wb, `resultados_${vot.titulo.replace(/\s+/g, '_')}.xlsx`)
            showToast('success', 'Excel exportado')
        } catch { showToast('error', 'Error al exportar') }
    }

    const bg = dark ? '#0f0d1a' : '#f8f5fa'
    const cardBg = dark ? '#1a1726' : '#fff'
    const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(214,182,223,0.45)'
    const textMain = dark ? '#e2e8f0' : '#1e293b'
    const textMuted = dark ? '#94a3b8' : '#6b7280'
    const thBg = dark ? '#1e1b2e' : '#f9fafb'

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bg }}>
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
    )

    if (!data?.votacion) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bg }}>
            <p className="font-poppins text-sm" style={{ color: textMuted }}>Votación no encontrada</p>
        </div>
    )

    const { votacion: vot, votos = [], presentes = [] } = data
    const totalVotos = vot.resumen?.totalVotos || 0
    const totalPresentes = vot.asistencia?.resumen?.presentes || 0
    const pctParticipacion = totalPresentes > 0 ? Math.round((totalVotos / totalPresentes) * 100) : 0

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: bg }}>
            <Toast {...toast} onClose={() => setToast({ show: false })} />

            {/* Back + Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg,
                            color: t.labelText, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div>
                        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: t.titleText, margin: 0 }}>
                            {vot.titulo}
                        </h1>
                        {vot.asistencia && (
                            <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '3px', marginBottom: 0 }}>
                                {fmtFechaLocal(vot.asistencia.fecha)} — {vot.asistencia.descripcion}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExportExcel}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '9px 16px', borderRadius: '10px',
                            border: `1px solid rgba(16,185,129,0.35)`,
                            backgroundColor: 'rgba(16,185,129,0.10)', color: '#059669',
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                        Exportar Excel
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {[
                    { label: 'Total votos', value: totalVotos, color: 'var(--color-primary)' },
                    { label: 'Presentes', value: totalPresentes, color: 'var(--color-secondary)' },
                    { label: 'Participación', value: `${pctParticipacion}%`, color: pctParticipacion >= 70 ? '#10B981' : '#F59E0B' },
                    { label: 'Estado', value: vot.estado === 'activa' ? 'Activa' : 'Cerrada', color: vot.estado === 'activa' ? '#10B981' : '#6B7280' },
                    { label: 'Fecha inicio', value: fmtFechaHora(vot.fechaInicio), color: '#3B82F6' },
                    { label: 'Fecha cierre', value: fmtFechaHora(vot.fechaCierre), color: '#EF4444' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-3" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                        <p className="text-xs font-poppins" style={{ color: textMuted }}>{s.label}</p>
                        <p className="text-sm font-bold font-montserrat mt-1 wrap-break-word" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <h2 className="text-sm font-bold font-poppins mb-4" style={{ color: textMain }}>Resultados por opción</h2>
                <BarChart opciones={vot.resumen?.opciones || []} totalVotos={totalVotos} dark={dark} />
            </div>

            {/* Tabla resultados */}
            <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <div className="p-4 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                    <h2 className="text-sm font-bold font-poppins" style={{ color: textMain }}>Tabla de resultados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-poppins">
                        <thead>
                            <tr style={{ backgroundColor: thBg }}>
                                {['Opción', 'Votos', 'Porcentaje', 'Barra'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(vot.resumen?.opciones || []).map((op, i) => {
                                const pct = totalVotos > 0 ? (op.votos / totalVotos) * 100 : 0
                                const colors = ['#672577', '#3454A1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
                                return (
                                    <tr key={op.opcion} className="border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                        <td className="px-4 py-3 font-semibold" style={{ color: textMain }}>{op.opcion}</td>
                                        <td className="px-4 py-3" style={{ color: textMuted }}>{op.votos}</td>
                                        <td className="px-4 py-3 font-semibold" style={{ color: colors[i % colors.length] }}>{pct.toFixed(1)}%</td>
                                        <td className="px-4 py-3 min-w-30">
                                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? '#2d2b3e' : '#e5e7eb' }}>
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Toggle votantes */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <button onClick={() => setShowVotantes(v => !v)} className="w-full p-4 flex items-center justify-between text-left transition-colors hover:opacity-80">
                    <span className="text-sm font-bold font-poppins" style={{ color: textMain }}>
                        Lista de votantes ({votos.length})
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${showVotantes ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: textMuted }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {showVotantes && (
                    <div className="border-t overflow-x-auto" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                        <table className="w-full text-sm font-poppins">
                            <thead>
                                <tr style={{ backgroundColor: thBg }}>
                                    {['Nombre', 'DNI', 'Opción', 'Fecha de voto'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {votos.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm font-poppins" style={{ color: textMuted }}>Sin votos registrados</td></tr>
                                ) : votos.map(v => (
                                    <tr key={v._id} className="border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                        <td className="px-4 py-3 font-semibold" style={{ color: textMain }}>{`${v.sediprano?.apellidos || ''} ${v.sediprano?.nombres || ''}`.trim() || '—'}</td>
                                        <td className="px-4 py-3" style={{ color: textMuted }}>{v.sediprano?.dni || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>{v.opcionSeleccionada}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: textMuted }}>{fmtFechaHora(v.fechaVoto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}