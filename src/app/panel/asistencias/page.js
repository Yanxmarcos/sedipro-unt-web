'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
        emptyIcon:     dark ? 'rgba(103,37,119,0.18)' : 'rgba(103,37,119,0.08)',
        pageBg:        dark ? '#0E0818' : '#f8f5fa',
        titleText:     dark ? '#EAD8F5' : '#4A1A5E',
    }
}

const Ico = {
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    ),
    Eye: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    Edit: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    ),
    Trash: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    ),
    Calendar: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    Attendance: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
    ),
    Sun: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    ),
    Moon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    ),
    Spinner: () => (
        <svg width="20" height="20" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/>
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    ),
    Close: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

function todayISO() {
    const d = new Date()
    return d.toISOString().slice(0, 10)
}

function ConfirmDialog({ dark, title, message, onConfirm, onCancel }) {
    const t = getTheme(dark)
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
        }}>
            <div style={{
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px',
                padding: '28px 24px',
                maxWidth: '380px',
                width: '100%',
                boxShadow: t.cardShadow,
                animation: 'slideDown 0.2s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: 'rgba(239,68,68,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>
                    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>
                        {title}
                    </h3>
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText, marginBottom: '24px', lineHeight: 1.6 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                            backgroundColor: t.inputBg, color: t.labelText,
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                            backgroundColor: '#EF4444', color: '#fff',
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239,68,68,0.30)',
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}

function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[1, 2, 3, 4].map(j => (
                <td key={j} style={{ padding: '14px 16px' }}>
                    <div style={{
                        height: '14px', borderRadius: '6px',
                        backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)',
                        width: j === 1 ? '80px' : j === 2 ? '60%' : j === 3 ? '90px' : '120px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                </td>
            ))}
            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ height: '28px', width: '80px', borderRadius: '8px', backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </td>
        </tr>
    ))
}

export default function AsistenciasPage() {
    const router = useRouter()

    const [dark, setDark] = useState(false)
    const [asistencias, setAsistencias] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ fecha: todayISO(), descripcion: '' })
    const [formError, setFormError] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [toast, setToast] = useState(null)

    const t = getTheme(dark)

    const fetchAsistencias = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/asistencias')
            const data = await res.json()
            setAsistencias(data.asistencias || [])
        } catch {
            showToast('Error al cargar asistencias', 'error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const stored = localStorage.getItem('sedipro_dark')
        if (stored !== null) setDark(stored === 'true')
        const onStorage = (e) => {
            if (e.key === 'sedipro_dark') {
                setDark(e.newValue === 'true')
            }
        }
        window.addEventListener('storage', onStorage)

        const interval = setInterval(() => {
            const val = localStorage.getItem('sedipro_dark')
            setDark(prev => {
                const next = val === 'true'
                return prev !== next ? next : prev
            })
        }, 400)

        return () => {
            window.removeEventListener('storage', onStorage)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        fetchAsistencias()
    }, [fetchAsistencias])

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    async function handleCreate() {
        setFormError('')
        if (!formData.fecha) return setFormError('La fecha es requerida')
        if (!formData.descripcion.trim()) return setFormError('La descripción es requerida')

        setCreating(true)
        try {
            const res = await fetch('/api/asistencias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            showToast('Asistencia creada correctamente')
            setShowForm(false)
            setFormData({ fecha: todayISO(), descripcion: '' })
            fetchAsistencias()
        } catch (err) {
            setFormError(err.message || 'Error al crear asistencia')
        } finally {
            setCreating(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/asistencias/${deleteTarget._id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            showToast('Asistencia eliminada')
            setDeleteTarget(null)
            fetchAsistencias()
        } catch (err) {
            showToast(err.message || 'Error al eliminar', 'error')
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const inputStyle = (focused) => ({
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${focused ? 'var(--color-primary)' : t.inputBorder}`,
        boxShadow: focused ? '0 0 0 3px rgba(103,37,119,0.13)' : 'none',
        backgroundColor: t.inputBg,
        color: t.inputText,
        fontFamily: 'Poppins, sans-serif',
        fontSize: '13px',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
    })

    return (
        <div style={{ padding: '24px', minHeight: '100%', fontFamily: 'Poppins, sans-serif', backgroundColor: t.pageBg, transition: 'background-color 0.2s' }}>

            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 2000,
                    backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
                    color: '#fff', padding: '12px 20px', borderRadius: '12px',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
                    animation: 'slideDown 0.2s ease',
                    maxWidth: '320px',
                }}>
                    {toast.msg}
                </div>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    dark={dark}
                    title="Eliminar asistencia"
                    message={`¿Seguro que deseas eliminar la asistencia "${deleteTarget.descripcion}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>
                        Asistencias
                    </h1>
                    <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                        Registro y control de asistencias
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Create button */}
                    <button
                        onClick={() => { setShowForm(v => !v); setFormError('') }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 18px', borderRadius: '12px', border: 'none',
                            backgroundColor: showForm ? t.inputBg : 'var(--color-primary)',
                            border: showForm ? `1px solid ${t.inputBorder}` : 'none',
                            color: showForm ? t.labelText : '#fff',
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: showForm ? 'none' : '0 4px 14px rgba(103,37,119,0.30)',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {showForm ? <><Ico.Close /> Cancelar</> : <><Ico.Plus /> Crear asistencia</>}
                    </button>
                </div>
            </div>

            {showForm && (
                <div style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: t.cardShadow,
                    animation: 'slideDown 0.2s ease',
                }}>
                    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: t.titleText, margin: '0 0 16px 0' }}>
                        Nueva asistencia
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.labelText, marginBottom: '6px' }}>
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={e => setFormData(f => ({ ...f, fecha: e.target.value }))}
                                style={inputStyle(false)}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                                onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.labelText, marginBottom: '6px' }}>
                                Descripción
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Reunión ordinaria semanal"
                                value={formData.descripcion}
                                onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))}
                                style={inputStyle(false)}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                                onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                    </div>

                    {formError && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: '10px', padding: '10px 14px',
                            color: '#EF4444', fontFamily: 'Poppins, sans-serif', fontSize: '12px',
                            marginBottom: '14px',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {formError}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                backgroundColor: 'var(--color-primary)', color: '#fff',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                cursor: creating ? 'not-allowed' : 'pointer',
                                opacity: creating ? 0.7 : 1,
                                boxShadow: '0 4px 14px rgba(103,37,119,0.28)',
                            }}
                        >
                            {creating ? <><Ico.Spinner /> Guardando…</> : 'Guardar asistencia'}
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px',
                boxShadow: t.cardShadow,
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${t.tableBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Ico.Attendance /></span>
                        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: t.titleText }}>
                            Listado de asistencias
                        </span>
                    </div>
                    {!loading && (
                        <span style={{
                            backgroundColor: dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)',
                            color: dark ? '#C8A8D8' : '#672577',
                            fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '20px',
                        }}>
                            {asistencias.length} registro{asistencias.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['Fecha', 'Descripción', 'Resumen', 'Acciones'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '11px 16px',
                                        textAlign: i === 3 ? 'center' : 'left',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '11px',
                                        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                        color: t.tableHeadText,
                                        borderBottom: `1px solid ${t.tableBorder}`,
                                        whiteSpace: 'nowrap',
                                        width: i === 0 ? '130px' : i === 3 ? '160px' : 'auto',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonRows dark={dark} count={5} />
                            ) : asistencias.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ico.Attendance />
                                            </div>
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', margin: 0 }}>
                                                No se registraron asistencias
                                            </p>
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                                                Haz clic en "Crear asistencia" para comenzar
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : asistencias.map((a, i) => {
                                const isEven = i % 2 === 1
                                return (
                                    <tr
                                        key={a._id}
                                        style={{
                                            backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                            transition: 'background-color 0.1s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                    >
                                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: t.labelText }}>
                                                <Ico.Calendar />
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827' }}>
                                                    {formatDate(a.fecha)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Descripcion */}
                                        <td style={{ padding: '13px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#374151' }}>
                                            {a.descripcion}
                                        </td>

                                        {/* Resumen */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <ResumenBadge label="P" value={a.resumen?.presentes ?? 0} color="#10B981" dark={dark} />
                                                <ResumenBadge label="A" value={a.resumen?.ausentes ?? 0} color="#EF4444" dark={dark} />
                                                <ResumenBadge label="J" value={a.resumen?.justificados ?? 0} color="#F59E0B" dark={dark} />
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <ActionBtn
                                                    color="#6B7280"
                                                    hoverColor="#4B5563"
                                                    bg={dark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'}
                                                    title="Ver"
                                                    onClick={() => router.push(`/panel/asistencias/${a._id}?mode=view`)}
                                                >
                                                    <Ico.Eye />
                                                </ActionBtn>
                                                <ActionBtn
                                                    color="#3B82F6"
                                                    hoverColor="#2563EB"
                                                    bg={dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'}
                                                    title="Editar"
                                                    onClick={() => router.push(`/panel/asistencias/${a._id}?mode=edit`)}
                                                >
                                                    <Ico.Edit />
                                                </ActionBtn>
                                                <ActionBtn
                                                    color="#EF4444"
                                                    hoverColor="#DC2626"
                                                    bg={dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'}
                                                    title="Eliminar"
                                                    onClick={() => setDeleteTarget(a)}
                                                >
                                                    <Ico.Trash />
                                                </ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {!loading && asistencias.length > 0 && (
                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {asistencias.length} asistencia{asistencias.length !== 1 ? 's' : ''} registrada{asistencias.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
            `}</style>
        </div>
    )
}

function ResumenBadge({ label, value, color, dark }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '20px',
            backgroundColor: `${color}18`,
            border: `1px solid ${color}40`,
            fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
            color: color, whiteSpace: 'nowrap',
        }}>
            {label} {value}
        </span>
    )
}

function ActionBtn({ children, color, hoverColor, bg, title, onClick }) {
    return (
        <button
            title={title}
            onClick={onClick}
            style={{
                width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                backgroundColor: bg, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.transform = 'scale(1)' }}
        >
            {children}
        </button>
    )
}