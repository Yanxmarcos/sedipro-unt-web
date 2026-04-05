'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

function SweetAlert({ show, type, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true }) {
    if (!show) return null
    const colors = {
        warning: { bg: '#FEF3C7', icon: '#F59E0B', border: '#FDE68A' },
        error: { bg: '#FEE2E2', icon: '#EF4444', border: '#FECACA' },
        success: { bg: '#D1FAE5', icon: '#10B981', border: '#A7F3D0' },
        info: { bg: '#DBEAFE', icon: '#3B82F6', border: '#BFDBFE' },
    }
    const c = colors[type] || colors.info
    const icons = {
        warning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
        error: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        success: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-fade-in" style={{ backgroundColor: isDarkMode() ? '#1e1b2e' : '#fff', border: `1px solid ${c.border}` }}>
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }} />
                <div className="p-6 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={c.icon}>{icons[type]}</svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-poppins" style={{ color: isDarkMode() ? '#e2e8f0' : '#1e293b' }}>{title}</h3>
                        <p className="mt-1.5 text-sm font-poppins text-gray-500">{message}</p>
                    </div>
                    <div className="flex gap-3 pt-1">
                        {showCancel && (
                            <button onClick={onCancel} className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins border transition-all duration-200" style={{ borderColor: '#d1d5db', color: isDarkMode() ? '#e2e8f0' : '#374151', backgroundColor: isDarkMode() ? '#2d2b3e' : '#f9fafb' }}>
                                {cancelText}
                            </button>
                        )}
                        <button onClick={onConfirm} className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white transition-all duration-200" style={{ backgroundColor: type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : 'var(--color-primary)', boxShadow: '0 4px 14px rgba(103,37,119,0.35)' }}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function isDarkMode() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sedipro_dark') === 'true'
}

function Toast({ show, type, message, onClose }) {
    useEffect(() => { if (show) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) } }, [show])
    if (!show) return null
    const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' }
    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-down max-w-xs w-full">
            <div className="rounded-xl p-4 shadow-lg flex items-start gap-3" style={{ backgroundColor: isDarkMode() ? '#1e1b2e' : '#fff', border: `1px solid ${colors[type]}30` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: colors[type] }} />
                <p className="text-sm font-poppins flex-1" style={{ color: isDarkMode() ? '#e2e8f0' : '#374151' }}>{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    )
}

function SkeletonRow() {
    const dark = isDarkMode()
    return (
        <tr>
            {[...Array(7)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 rounded animate-pulse" style={{ backgroundColor: dark ? '#2d2b3e' : '#e5e7eb', width: `${60 + Math.random() * 40}%` }} />
                </td>
            ))}
        </tr>
    )
}

function fmtFechaLocal(d) {
    if (!d) return '—'
    const fecha = typeof d === 'string' ? d.split('T')[0] : d
    const [year, month, day] = fecha.split('-')
    const meses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.']
    return `${day} ${meses[parseInt(month) - 1]} ${year}`
}

function fmtFechaUTC(d) {
    if (!d) return '—'

    return new Date(d).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

function fmtFechaHoraUTC(d) {
    if (!d) return '—'

    return new Date(d).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function VotacionesPage() {
    const router = useRouter()
    const [dark, setDark] = useState(false)
    const [votaciones, setVotaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [asistencias, setAsistencias] = useState([])
    const [alert, setAlert] = useState({ show: false })
    const [toast, setToast] = useState({ show: false })
    const [search, setSearch] = useState('')

    const [form, setForm] = useState({ asistenciaId: '', titulo: '', tipo: 'binaria', opciones: ['', ''], fechaInicio: '', fechaCierre: '' })
    const [editForm, setEditForm] = useState({ titulo: '', fechaCierre: '', estado: 'activa' })
    const [saving, setSaving] = useState(false)

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

    const showToast = (type, message) => setToast({ show: true, type, message })

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
            setAsistencias((data.asistencias || []).filter(a => a.resumen?.presentes > 0))
        } catch {}
    }, [])

    useEffect(() => { fetchVotaciones() }, [fetchVotaciones])

    const handleOpenForm = () => {
        fetchAsistencias()
        setForm({ asistenciaId: '', titulo: '', tipo: 'binaria', opciones: ['', ''], fechaInicio: '', fechaCierre: '' })
        setShowForm(true)
        setShowEditForm(false)
    }

    const handleAddOpcion = () => {
        if (form.opciones.length >= 10) return
        setForm(f => ({ ...f, opciones: [...f.opciones, ''] }))
    }
    const handleRemoveOpcion = (i) => {
        if (form.opciones.length <= 2) return
        setForm(f => ({ ...f, opciones: f.opciones.filter((_, idx) => idx !== i) }))
    }
    const handleOpcionChange = (i, val) => {
        setForm(f => { const o = [...f.opciones]; o[i] = val; return { ...f, opciones: o } })
    }

    const handleCreate = async () => {
        const { asistenciaId, titulo, tipo, opciones, fechaInicio, fechaCierre } = form
        if (!asistenciaId) return showToast('warning', 'Selecciona una asistencia')
        if (!titulo.trim()) return showToast('warning', 'El título es requerido')
        if (tipo === 'multiple') {
            const clean = opciones.map(o => o.trim()).filter(Boolean)
            if (clean.length < 2) return showToast('warning', 'Mínimo 2 opciones')
            if (new Set(clean.map(o => o.toLowerCase())).size !== clean.length) return showToast('warning', 'No se pueden repetir opciones')
        }
        setSaving(true)
        try {
            const res = await fetch('/api/votaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asistenciaId, titulo, tipo, opciones: tipo === 'multiple' ? opciones.map(o => o.trim()).filter(Boolean) : undefined, fechaInicio: fechaInicio || undefined, fechaCierre: fechaCierre || undefined })
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
    if (!fechaUTC) return '';
        const fecha = new Date(fechaUTC);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleEditOpen = async (v) => {
        if (v.resumen?.totalVotos > 0) {
            return setAlert({ show: true, type: 'warning', title: 'No se puede editar', message: `Esta votación ya tiene ${v.resumen.totalVotos} voto(s) registrado(s). No es posible editarla.`, showCancel: false, confirmText: 'Entendido', onConfirm: () => setAlert({ show: false }), onCancel: () => setAlert({ show: false }) })
        }
        setEditTarget(v)
        setEditForm({ titulo: v.titulo, fechaCierre: formatForInput(v.fechaCierre), estado: v.estado })
        setShowEditForm(true)
        setShowForm(false)
    }

    const handleEdit = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/votaciones/${editTarget._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: editForm.titulo, fechaCierre: editForm.fechaCierre || null, estado: editForm.estado })
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
            show: true, type: 'error',
            title: 'Eliminar votación',
            message: `¿Eliminar "${v.titulo}"? Se eliminarán todos los votos registrados también. Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar', cancelText: 'Cancelar',
            onCancel: () => setAlert({ show: false }),
            onConfirm: async () => {
                setAlert({ show: false })
                try {
                    const res = await fetch(`/api/votaciones/${v._id}`, { method: 'DELETE' })
                    const data = await res.json()
                    if (!res.ok) return showToast('error', data.message)
                    showToast('success', 'Votación eliminada')
                    fetchVotaciones()
                } catch {
                    showToast('error', 'Error al eliminar')
                }
            }
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
                ...(votos || []).map(voto => [
                    `${voto.sediprano?.apellidos || ''} ${voto.sediprano?.nombres || ''}`.trim(),
                    voto.sediprano?.dni || '',
                    voto.opcionSeleccionada,
                    fmtFechaHoraUTC(voto.fechaVoto)
                ])
            ]
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(votantesData), 'Votantes')

            XLSX.writeFile(wb, `votacion_${vot.titulo.replace(/\s+/g, '_')}.xlsx`)
            showToast('success', 'Excel exportado correctamente')
        } catch {
            showToast('error', 'Error al exportar')
        }
    }

    const filtered = votaciones.filter(v =>
        v.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        v.asistencia?.descripcion?.toLowerCase().includes(search.toLowerCase())
    )

    const bg = dark ? '#0f0d1a' : '#f8f5fa'
    const cardBg = dark ? '#1a1726' : '#fff'
    const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(214,182,223,0.45)'
    const textMain = dark ? '#e2e8f0' : '#1e293b'
    const textMuted = dark ? '#94a3b8' : '#6b7280'
    const inputBg = dark ? '#2d2b3e' : '#fff'
    const inputBorder = dark ? '#3d3b52' : '#d1d5db'
    const trHover = dark ? '#2d2b3e' : '#faf5fc'
    const thBg = dark ? '#1e1b2e' : '#f9fafb'

    const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textMain }
    const labelStyle = { color: dark ? '#c4b5fd' : 'var(--color-primary-active)' }

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: bg }}>
            <SweetAlert {...alert} />
            <Toast {...toast} onClose={() => setToast({ show: false })} />

            {/* Header */}
            <div className="mb-6">
                <h1
                    style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: 'var(--color-primary-active)',
                        margin: 0,
                        lineHeight: 1.2,
                    }}
                >
                    Votaciones
                </h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px' }}>
                    Gestiona las votaciones de SEDIPRO UNT
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                    onClick={handleOpenForm}
                    className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-sm font-poppins text-white transition-all duration-200"
                    style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 14px rgba(103,37,119,0.35)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Crear votación
                </button>
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por título o asistencia..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-poppins rounded-xl border focus:outline-none transition-all"
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Form crear */}
            {showForm && (
                <div className="mb-5 rounded-2xl overflow-hidden animate-slide-down" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: 'var(--shadow-modal)' }}>
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold font-poppins" style={{ color: textMain }}>Nueva Votación</h2>
                            <button onClick={() => setShowForm(false)} style={{ color: textMuted }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Asistencia */}
                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Asistencia vinculada *</label>
                            <select value={form.asistenciaId} onChange={e => setForm(f => ({ ...f, asistenciaId: e.target.value }))} className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle}>
                                <option value="">Seleccionar asistencia...</option>
                                {asistencias.map(a => (
                                    <option key={a._id} value={a._id}>
                                        {fmtFechaLocal(a.fecha)} — {a.descripcion} ({a.resumen?.presentes} presentes)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Título */}
                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Título *</label>
                            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej. ¿Aprueba el nuevo estatuto?" className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                        </div>

                        {/* Tipo */}
                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-2" style={labelStyle}>Tipo de votación *</label>
                            <div className="flex gap-4">
                                {[{ val: 'binaria', label: 'Sí / No' }, { val: 'multiple', label: 'Opción múltiple' }].map(t => (
                                    <label key={t.val} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" value={t.val} checked={form.tipo === t.val} onChange={() => setForm(f => ({ ...f, tipo: t.val, opciones: ['', ''] }))} className="accent-primary" />
                                        <span className="text-sm font-poppins" style={{ color: textMain }}>{t.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {form.tipo === 'binaria' && (
                            <div className="flex gap-2">
                                {['SI', 'NO'].map(o => (
                                    <span key={o} className="px-3 py-1 rounded-full text-xs font-semibold font-poppins" style={{ backgroundColor: dark ? '#2d2b3e' : '#f3f4f6', color: textMuted }}>{o}</span>
                                ))}
                            </div>
                        )}

                        {form.tipo === 'multiple' && (
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold font-poppins" style={labelStyle}>Opciones ({form.opciones.length}/10)</label>
                                {form.opciones.map((op, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input value={op} onChange={e => handleOpcionChange(i, e.target.value)} placeholder={`Opción ${i + 1}`} className="flex-1 py-2 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                                        {form.opciones.length > 2 && (
                                            <button onClick={() => handleRemoveOpcion(i)} className="px-2 rounded-lg transition-colors" style={{ color: '#EF4444', backgroundColor: dark ? '#2d2b3e' : '#fee2e2' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.opciones.length < 10 && (
                                    <button onClick={handleAddOpcion} className="text-xs font-semibold font-poppins flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Agregar opción
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Fechas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Fecha de inicio</label>
                                <input type="datetime-local" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Fecha de cierre <span style={{ color: textMuted }}>(opcional)</span></label>
                                <input type="datetime-local" value={form.fechaCierre} onChange={e => setForm(f => ({ ...f, fechaCierre: e.target.value }))} className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm font-poppins border transition-all" style={{ borderColor: inputBorder, color: textMuted, backgroundColor: 'transparent' }}>Cancelar</button>
                            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm font-poppins text-white transition-all" style={{ backgroundColor: 'var(--color-primary)', opacity: saving ? 0.7 : 1 }}>
                                {saving ? 'Guardando...' : 'Crear votación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form editar */}
            {showEditForm && editTarget && (
                <div className="mb-5 rounded-2xl overflow-hidden animate-slide-down" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: 'var(--shadow-modal)' }}>
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold font-poppins" style={{ color: textMain }}>Editar Votación</h2>
                            <button onClick={() => setShowEditForm(false)} style={{ color: textMuted }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Info no editable */}
                        <div className="rounded-xl p-3 text-xs font-poppins space-y-1" style={{ backgroundColor: dark ? '#2d2b3e' : '#f9fafb', color: textMuted }}>
                            <p><span className="font-semibold">Asistencia:</span> {editTarget.asistencia ? `${fmtFechaLocal(editTarget.asistencia.fecha)} — ${editTarget.asistencia.descripcion}` : '—'}</p>
                            <p><span className="font-semibold">Tipo:</span> {editTarget.tipo === 'binaria' ? 'Sí / No' : 'Opción múltiple'}</p>
                            <p><span className="font-semibold">Opciones:</span> {editTarget.opciones?.join(', ')}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Título *</label>
                            <input value={editForm.titulo} onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))} className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-1.5" style={labelStyle}>Fecha de cierre</label>
                            <input type="datetime-local" value={editForm.fechaCierre} onChange={e => setEditForm(f => ({ ...f, fechaCierre: e.target.value }))} className="w-full py-2.5 px-3 text-sm font-poppins rounded-lg border focus:outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold font-poppins mb-2" style={labelStyle}>Estado</label>
                            <div className="flex gap-4">
                                {[{ val: 'activa', label: 'Activa' }, { val: 'cerrada', label: 'Cerrada' }].map(s => (
                                    <label key={s.val} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" value={s.val} checked={editForm.estado === s.val} onChange={() => setEditForm(f => ({ ...f, estado: s.val }))} className="accent-primary" />
                                        <span className="text-sm font-poppins" style={{ color: textMain }}>{s.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowEditForm(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm font-poppins border transition-all" style={{ borderColor: inputBorder, color: textMuted }}>Cancelar</button>
                            <button onClick={handleEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm font-poppins text-white transition-all" style={{ backgroundColor: 'var(--color-primary)', opacity: saving ? 0.7 : 1 }}>
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: 'var(--shadow-card)' }}>
                {/* Encabezado con ícono y contador */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="9" y1="13" x2="15" y2="13" />
                                <line x1="9" y1="17" x2="13" y2="17" />
                            </svg>
                        </span>
                        <span style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: textMain
                        }}>
                            Listado de votaciones
                        </span>
                    </div>
                    {!loading && (
                        <span style={{
                            backgroundColor: dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)',
                            color: dark ? '#C8A8D8' : '#672577',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '20px',
                        }}>
                            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-poppins">
                        <thead>
                            <tr style={{ backgroundColor: thBg }}>
                                {['Fecha', 'Título', 'Asistencia', 'Tipo', 'Participación', 'Estado', 'Acciones'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: dark ? '#2d2b3e' : '#f3f4f6' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: textMuted }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <p className="font-semibold" style={{ color: textMain }}>No se registraron votaciones</p>
                                            <p className="text-xs" style={{ color: textMuted }}>Crea una nueva votación con el botón de arriba</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(v => {
                                const presentes = v.asistencia?.resumen?.presentes || 0
                                const votos = v.resumen?.totalVotos || 0
                                const pct = presentes > 0 ? Math.round((votos / presentes) * 100) : 0
                                const isActiva = v.estado === 'activa'
                                return (
                                    <tr key={v._id} className="border-t transition-colors" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = trHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: textMuted }}>{fmtFechaUTC(v.createdAt)}</td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <span className="font-semibold line-clamp-2" style={{ color: textMain }}>{v.titulo}</span>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs" style={{ color: textMuted }}>
                                            <span className="text-xs">
                                                {v.asistencia ? `${fmtFechaLocal(v.asistencia.fecha)} — ${v.asistencia.descripcion}` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: dark ? '#2d2b3e' : '#f3f4f6', color: textMuted }}>
                                                {v.tipo === 'binaria' ? 'Sí/No' : 'Múltiple'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="space-y-1 min-w-25">
                                                <span className="text-xs font-semibold" style={{ color: textMain }}>{votos}/{presentes} <span style={{ color: textMuted }}>({pct}%)</span></span>
                                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: dark ? '#2d2b3e' : '#e5e7eb' }}>
                                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#3B82F6' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                                                backgroundColor: isActiva ? (dark ? '#065F46' : '#D1FAE5') : (dark ? '#374151' : '#F3F4F6'),
                                                color: isActiva ? '#10B981' : (dark ? '#9CA3AF' : '#6B7280')
                                            }}>
                                                {isActiva ? 'Activa' : 'Cerrada'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <button title="Ver resultados" onClick={() => router.push(`/panel/votaciones/${v._id}/resultados`)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-view)', backgroundColor: dark ? '#2d2b3e' : '#f3f4f6' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button title="Editar votación" onClick={() => handleEditOpen(v)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-edit)', backgroundColor: dark ? '#2d2b3e' : '#dbeafe' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button title="Exportar Excel" onClick={() => handleExportExcel(v)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#10B981', backgroundColor: dark ? '#2d2b3e' : '#d1fae5' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </button>
                                                <button title="Eliminar votación" onClick={() => handleDelete(v)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-delete)', backgroundColor: dark ? '#2d2b3e' : '#fee2e2' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer con contador */}
                {!loading && filtered.length > 0 && (
                    <div style={{
                        padding: '12px 20px',
                        borderTop: `1px solid ${borderColor}`,
                    }}>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            color: textMuted,
                            margin: 0
                        }}>
                            {filtered.length} votación{filtered.length !== 1 ? 'es' : ''} registrada{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}