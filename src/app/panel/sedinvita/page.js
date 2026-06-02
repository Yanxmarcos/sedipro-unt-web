'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'

// ─────────────────────────────────────────────
// TEMA  (mismo sistema que el resto del panel)
// ─────────────────────────────────────────────
function getTheme(dark) {
    return {
        pageBg:        dark ? '#0E0818' : '#f8f5fa',
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
        titleText:     dark ? '#EAD8F5' : '#4A1A5E',
        modalBg:       dark ? '#1A0D2E' : '#ffffff',
        divider:       dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.15)',
        tabActive:     dark ? 'rgba(103,37,119,0.30)' : '#ffffff',
        tabBg:         dark ? 'rgba(255,255,255,0.04)' : 'rgba(103,37,119,0.06)',
        tabBorder:     dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.18)',
        overlayBg:     'rgba(0,0,0,0.55)',
    }
}

// ─────────────────────────────────────────────
// ÍCONOS SVG inline
// ─────────────────────────────────────────────
const Ico = {
    Upload:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    Close:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Warning:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Spinner:  () => <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/><path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/></svg>,
    Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Calendar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Ticket:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/></svg>,
    Envelope: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="2,5 12,13 22,5"/></svg>,
    Plus:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
}

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────
function initials(nombres, apellidos) {
    return `${nombres?.[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase()
}

// Mapea las columnas del Excel (nombres exactos del formulario) a nuestros campos
const EXCEL_COL_MAP = {
    'CORREO ELECTRÓNICO':               'correo',
    'Correo Electrónico':               'correo',
    'CORREO ELECTRONICO':               'correo',
    'correo electrónico':               'correo',
    'Correo electronico':               'correo',
    'APELLIDOS':                        'apellidos',
    'Apellidos':                        'apellidos',
    'NOMBRES':                          'nombres',
    'Nombres':                          'nombres',
    'CÓDIGO DE MATRÍCULA UNT':          'codigoMatricula',
    'Código de Matrícula UNT':          'codigoMatricula',
    'CODIGO DE MATRICULA UNT':          'codigoMatricula',
    'Código de matricula UNT':          'codigoMatricula',
    'NÚMERO DE CELULAR':                'celular',
    'Número de Celular':                'celular',
    'NUMERO DE CELULAR':                'celular',
    'Número de celular':                'celular',
    'CARRERA UNIVERSITARIA':            'carrera',
    'Carrera Universitaria':            'carrera',
    'CICLO ACTUAL - SEMESTRE 2026-I':   'ciclo',
    'CICLO ACTUAL':                     'ciclo',
    'Ciclo Actual':                     'ciclo',
}

function parseExcelRows(sheetData) {
    if (!sheetData.length) return []
    const headers = sheetData[0]
    const rows = []
    for (let r = 1; r < sheetData.length; r++) {
        const raw = sheetData[r]
        if (!raw || raw.every(c => !c)) continue
        const obj = {}
        headers.forEach((h, i) => {
            const key = EXCEL_COL_MAP[String(h ?? '').trim()]
            if (key) obj[key] = String(raw[i] ?? '').trim()
        })
        // solo filas con al menos código de matrícula
        if (obj.codigoMatricula) rows.push(obj)
    }
    return rows
}

// ─────────────────────────────────────────────
// FASES
// ─────────────────────────────────────────────
const FASES = [
    { key: 'F1', label: 'Fase 1', color: '#10B981', desc: 'Inscripciones' },
    { key: 'F2', label: 'Fase 2', color: '#3B82F6', desc: 'Induccion I + Dinámicas' },
    { key: 'F3', label: 'Fase 3', color: '#F59E0B', desc: 'Inducción II' },
    { key: 'F4', label: 'Fase 4', color: '#672577', desc: 'Entrevistas + Fin' },
]

// ─────────────────────────────────────────────
// COMPONENTES PEQUEÑOS REUTILIZABLES
// ─────────────────────────────────────────────
function ActionBtn({ children, color, hoverColor, bg, title, onClick, disabled }) {
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                backgroundColor: bg, color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s', opacity: disabled ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!disabled) { e.currentTarget.style.color = hoverColor; e.currentTarget.style.transform = 'scale(1.1)' } }}
            onMouseLeave={e => { if (!disabled) { e.currentTarget.style.color = color; e.currentTarget.style.transform = 'scale(1)' } }}
        >
            {children}
        </button>
    )
}

function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[40, 120, 120, 100, 90, 120, 60].map((w, j) => (
                <td key={j} style={{ padding: '13px 14px' }}>
                    <div style={{
                        height: '12px', borderRadius: '6px', width: `${w}px`, maxWidth: '100%',
                        backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)',
                        animation: 'pulse 1.4s ease-in-out infinite',
                    }} />
                </td>
            ))}
        </tr>
    ))
}

// ─────────────────────────────────────────────
// MODAL DE EDICIÓN / CREACIÓN
// ─────────────────────────────────────────────
const EMPTY_FORM = { correo: '', apellidos: '', nombres: '', codigoMatricula: '', celular: '', carrera: '', ciclo: '' }

function FormModal({ open, onClose, initial, dark, onSaved }) {
    const t = getTheme(dark)
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const isEdit = !!initial?._id

    useEffect(() => {
        if (open) {
            setForm(initial ? { ...initial } : { ...EMPTY_FORM })
            setError('')
        }
    }, [open, initial])

    if (!open) return null

    function field(label, key, placeholder, opts = {}) {
        return (
            <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, fontFamily: 'Poppins,sans-serif', color: t.labelText, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}{opts.required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
                </label>
                <input
                    type={opts.type ?? 'text'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '10px 12px', fontSize: '13px', fontFamily: 'Poppins,sans-serif',
                        borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                        backgroundColor: t.inputBg, color: t.inputText, outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.14)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                />
            </div>
        )
    }

    async function handleSubmit() {
        setError('')
        if (!form.correo || !form.apellidos || !form.nombres || !form.codigoMatricula) {
            setError('Correo, apellidos, nombres y código de matrícula son requeridos')
            return
        }
        setLoading(true)
        try {
            const url  = isEdit ? `/api/sedinvita/${initial._id}` : '/api/sedinvita'
            const method = isEdit ? 'PUT' : 'POST'
            const res  = await fetch(url, {
                method, credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
            onSaved(data.data, isEdit)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                backgroundColor: t.overlayBg,
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}
        >
            <div style={{
                width: '100%', maxWidth: '520px', maxHeight: '92dvh', overflowY: 'auto',
                borderRadius: '20px 20px 0 0',
                backgroundColor: t.modalBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
                animation: 'slideUp 0.26s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '15px 18px',
                    background: 'linear-gradient(90deg,#3B1550,#1E2F6B)',
                    borderRadius: '20px 20px 0 0',
                    position: 'sticky', top: 0, zIndex: 1,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: '#fff' }}>
                        <Ico.Envelope />
                        <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px' }}>
                            {isEdit ? 'Editar SEDInvitado' : 'Nuevo SEDInvitado'}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                        <Ico.Close />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {field('Apellidos', 'apellidos', 'Ej: García López', { required: true })}
                        {field('Nombres', 'nombres', 'Ej: Juan Carlos', { required: true })}
                    </div>
                    {field('Correo electrónico', 'correo', 'correo@ejemplo.com', { required: true, type: 'email' })}
                    {field('Código de matrícula UNT', 'codigoMatricula', 'Ej: 1234567890', { required: true })}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {field('Celular', 'celular', 'Ej: 987654321')}
                        {field('Ciclo actual', 'ciclo', 'Ej: 5')}
                    </div>
                    {field('Carrera universitaria', 'carrera', 'Ej: Ingeniería de Sistemas')}

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 13px', borderRadius: '10px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', fontFamily: 'Poppins,sans-serif', fontSize: '12px' }}>
                            <span style={{ marginTop: '1px', flexShrink: 0 }}><Ico.Warning /></span>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '11px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, backgroundColor: dark ? 'rgba(103,37,119,0.12)' : '#f3eef8', color: t.labelText, border: `1px solid ${t.cardBorder}`, cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit} disabled={loading}
                            style={{ flex: 1, padding: '11px', borderRadius: '11px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#672577,#3454A1)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(103,37,119,0.30)' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                                    <Ico.Spinner /> Guardando…
                                </span>
                            ) : isEdit ? 'Guardar cambios' : 'Crear SEDInvitado'}
                        </button>
                    </div>
                    <div style={{ height: 'env(safe-area-inset-bottom, 10px)' }} />
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// MODAL CONFIRMAR ELIMINACIÓN
// ─────────────────────────────────────────────
function DeleteModal({ open, target, onClose, dark, onDeleted }) {
    const t = getTheme(dark)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!open || !target) return null

    async function handleDelete() {
        setLoading(true); setError('')
        try {
            const res = await fetch(`/api/sedinvita/${target._id}`, { method: 'DELETE', credentials: 'include' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Error al eliminar')
            onDeleted(target._id)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: t.overlayBg, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '20px' }}
        >
            <div style={{ width: '100%', maxWidth: '360px', borderRadius: '18px', backgroundColor: t.modalBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, padding: '24px', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#EF4444' }}>
                        <Ico.Trash />
                    </div>
                    <p style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: '0 0 6px' }}>Eliminar SEDInvitado</p>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: t.bodyText, margin: 0 }}>
                        ¿Eliminar a <strong style={{ color: t.labelText }}>{target.nombres} {target.apellidos}</strong>? Esta acción no se puede deshacer.
                    </p>
                </div>
                {error && (
                    <div style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', fontFamily: 'Poppins,sans-serif', fontSize: '12px', display: 'flex', gap: '7px' }}>
                        <Ico.Warning /> {error}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '11px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: t.labelText, border: `1px solid ${t.cardBorder}`, cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: '11px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, backgroundColor: loading ? '#9CA3AF' : '#EF4444', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// TAB: SEDI INVITADOS
// ─────────────────────────────────────────────
function TabSEDInvitados({ dark }) {
    const t = getTheme(dark)
    const fileRef = useRef(null)

    const [data, setData]               = useState([])
    const [loading, setLoading]         = useState(true)
    const [search, setSearch]           = useState('')
    const [importing, setImporting]     = useState(false)
    const [importMsg, setImportMsg]     = useState(null)  // { type: 'success'|'error', text }
    const [formOpen, setFormOpen]       = useState(false)
    const [editTarget, setEditTarget]   = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/sedinvita', { credentials: 'include' })
            const json = await res.json()
            if (res.ok) setData(json.data ?? [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    // ── Filtro de búsqueda ──
    const filtered = data.filter(inv => {
        const q = search.toLowerCase()
        return (
            inv.nombres?.toLowerCase().includes(q) ||
            inv.apellidos?.toLowerCase().includes(q) ||
            inv.correo?.toLowerCase().includes(q) ||
            inv.codigoMatricula?.toLowerCase().includes(q) ||
            inv.carrera?.toLowerCase().includes(q)
        )
    })

    // ── Importar Excel ──
    async function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''
        setImporting(true)
        setImportMsg(null)
        try {
            const buffer = await file.arrayBuffer()
            const wb     = XLSX.read(buffer, { type: 'array' })
            const ws     = wb.Sheets[wb.SheetNames[0]]
            const raw    = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
            const rows   = parseExcelRows(raw)

            if (!rows.length) throw new Error('No se encontraron filas válidas en el Excel')

            // 1. Borrar todos
            const delRes = await fetch('/api/sedinvita', { method: 'DELETE', credentials: 'include' })
            if (!delRes.ok) throw new Error('Error al limpiar la base de datos')

            // 2. Insertar en lotes de 50
            let ok = 0, fail = 0
            const BATCH = 50
            for (let i = 0; i < rows.length; i += BATCH) {
                const batch = rows.slice(i, i + BATCH)
                await Promise.all(batch.map(async row => {
                    const r = await fetch('/api/sedinvita', {
                        method: 'POST', credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(row),
                    })
                    r.ok ? ok++ : fail++
                }))
            }

            await fetchData()
            setImportMsg({ type: 'success', text: `✓ ${ok} SEDInvitados importados correctamente${fail ? ` (${fail} omitidos)` : ''}` })
        } catch (err) {
            setImportMsg({ type: 'error', text: err.message })
        } finally {
            setImporting(false)
            setTimeout(() => setImportMsg(null), 6000)
        }
    }

    function openCreate() { setEditTarget(null); setFormOpen(true) }
    function openEdit(inv) { setEditTarget(inv); setFormOpen(true) }

    function onSaved(record, isEdit) {
        if (isEdit) setData(d => d.map(x => x._id === record._id ? record : x))
        else setData(d => [...d, record])
    }
    function onDeleted(id) { setData(d => d.filter(x => x._id !== id)) }

    return (
        <div>
            {/* Barra de acciones */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px',
            }}>
                {/* Búsqueda */}
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '0' }}>
                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: t.dividerText, pointerEvents: 'none' }}>
                        <Ico.Search />
                    </span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, correo, código…"
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px',
                            fontSize: '13px', fontFamily: 'Poppins,sans-serif',
                            borderRadius: '11px', border: `1px solid ${t.inputBorder}`,
                            backgroundColor: t.inputBg, color: t.inputText, outline: 'none',
                        }}
                    />
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {/* Importar Excel */}
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={importing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '9px 14px', borderRadius: '11px', border: 'none',
                            backgroundColor: dark ? 'rgba(16,185,129,0.15)' : '#D1FAE5',
                            color: '#065F46', fontFamily: 'Poppins,sans-serif',
                            fontSize: '13px', fontWeight: 600, cursor: importing ? 'not-allowed' : 'pointer',
                            opacity: importing ? 0.7 : 1, transition: 'opacity 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {importing ? <Ico.Spinner /> : <Ico.Upload />}
                        {importing ? 'Importando…' : 'Cargar Excel'}
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />

                    {/* Nuevo manual */}
                    <button
                        onClick={openCreate}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '9px 14px', borderRadius: '11px', border: 'none',
                            background: 'linear-gradient(135deg,#672577,#3454A1)',
                            color: '#fff', fontFamily: 'Poppins,sans-serif',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(103,37,119,0.28)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Ico.Plus /> Nuevo
                    </button>
                </div>
            </div>

            {/* Mensaje de importación */}
            {importMsg && (
                <div style={{
                    marginBottom: '14px', padding: '11px 14px', borderRadius: '11px',
                    display: 'flex', alignItems: 'center', gap: '9px',
                    fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500,
                    backgroundColor: importMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                    border: `1px solid ${importMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
                    color: importMsg.type === 'success' ? '#065F46' : '#991B1B',
                    animation: 'fadeIn 0.2s ease',
                }}>
                    {importMsg.type === 'success' ? <Ico.Check /> : <Ico.Warning />}
                    {importMsg.text}
                </div>
            )}

            {/* Tabla */}
            <div style={{
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
                borderRadius: '14px',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['Estudiante', 'Correo', 'Código UNT', 'Carrera', 'Ciclo', 'Celular', 'Acciones'].map(h => (
                                    <th key={h} style={{
                                        padding: '11px 14px', textAlign: 'left',
                                        fontFamily: 'Poppins,sans-serif', fontSize: '11px',
                                        fontWeight: 700, color: t.tableHeadText,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap',
                                        borderBottom: `1px solid ${t.tableBorder}`,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonRows dark={dark} count={6} />
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ico.Users />
                                            </div>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                                {search ? 'No se encontraron resultados' : 'No hay SEDInvitados registrados'}
                                            </p>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                                                {search ? 'Intenta con otra búsqueda' : 'Carga un Excel o crea uno manualmente'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((inv, i) => {
                                const isEven = i % 2 === 1
                                return (
                                    <tr
                                        key={inv._id}
                                        style={{ backgroundColor: isEven ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                    >
                                        {/* Estudiante */}
                                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                                    background: 'linear-gradient(135deg,#672577,#3454A1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '11px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
                                                }}>
                                                    {initials(inv.nombres, inv.apellidos)}
                                                </div>
                                                <div>
                                                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827', margin: 0 }}>
                                                        {inv.apellidos}, {inv.nombres}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Correo */}
                                        <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText }}>
                                            {inv.correo}
                                        </td>
                                        {/* Código */}
                                        <td style={{ padding: '11px 14px' }}>
                                            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600, color: '#672577', backgroundColor: dark ? 'rgba(103,37,119,0.15)' : 'rgba(103,37,119,0.08)', padding: '3px 9px', borderRadius: '8px' }}>
                                                {inv.codigoMatricula}
                                            </span>
                                        </td>
                                        {/* Carrera */}
                                        <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: dark ? '#EAD8F5' : '#374151', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {inv.carrera || '—'}
                                        </td>
                                        {/* Ciclo */}
                                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                                            {inv.ciclo ? (
                                                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 700, color: '#3B82F6', backgroundColor: dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', padding: '3px 9px', borderRadius: '8px' }}>
                                                    {inv.ciclo}°
                                                </span>
                                            ) : <span style={{ color: t.dividerText, fontSize: '12px' }}>—</span>}
                                        </td>
                                        {/* Celular */}
                                        <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: dark ? '#EAD8F5' : '#374151', whiteSpace: 'nowrap' }}>
                                            {inv.celular || '—'}
                                        </td>
                                        {/* Acciones */}
                                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <ActionBtn color="#3B82F6" hoverColor="#2563EB" bg={dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'} title="Editar" onClick={() => openEdit(inv)}>
                                                    <Ico.Edit />
                                                </ActionBtn>
                                                <ActionBtn color="#EF4444" hoverColor="#DC2626" bg={dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'} title="Eliminar" onClick={() => setDeleteTarget(inv)}>
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

                {!loading && filtered.length > 0 && (
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {filtered.length} SEDInvitado{filtered.length !== 1 ? 's' : ''}{search ? ` encontrado${filtered.length !== 1 ? 's' : ''}` : ' registrado' + (filtered.length !== 1 ? 's' : '')}
                            {data.length !== filtered.length && ` de ${data.length} total`}
                        </p>
                    </div>
                )}
            </div>

            {/* Modales */}
            <FormModal open={formOpen} onClose={() => setFormOpen(false)} initial={editTarget} dark={dark} onSaved={onSaved} />
            <DeleteModal open={!!deleteTarget} target={deleteTarget} onClose={() => setDeleteTarget(null)} dark={dark} onDeleted={onDeleted} />
        </div>
    )
}

// ─────────────────────────────────────────────
// TAB: ASISTENCIA (placeholder)
// ─────────────────────────────────────────────
function TabAsistencia({ dark }) {
    const t = getTheme(dark)
    return (
        <div style={{
            backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
            boxShadow: t.cardShadow, borderRadius: '14px',
            padding: '52px 24px', textAlign: 'center',
        }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#672577' }}>
                <Ico.Calendar />
            </div>
            <p style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '17px', color: t.titleText, margin: '0 0 8px' }}>
                Asistencia al Evento
            </p>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: t.bodyText, margin: '0 auto', maxWidth: '340px', lineHeight: 1.6 }}>
                Aquí podrás registrar y controlar la asistencia de los SEDInvitados durante el evento. Disponible próximamente.
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────
// TAB: TURNO PARA EVENTO (placeholder)
// ─────────────────────────────────────────────
function TabTurno({ dark }) {
    const t = getTheme(dark)
    return (
        <div style={{
            backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
            boxShadow: t.cardShadow, borderRadius: '14px',
            padding: '52px 24px', textAlign: 'center',
        }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#672577' }}>
                <Ico.Ticket />
            </div>
            <p style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '17px', color: t.titleText, margin: '0 0 8px' }}>
                Turno para Evento
            </p>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: t.bodyText, margin: '0 auto', maxWidth: '340px', lineHeight: 1.6 }}>
                Gestiona el orden y los turnos asignados a cada SEDInvitado para el evento. Disponible próximamente.
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const TABS = [
    { key: 'invitados',  label: 'SEDInvitados', Icon: Ico.Users    },
    { key: 'asistencia', label: 'Asistencia',   Icon: Ico.Calendar },
    { key: 'turno',      label: 'Turno Evento', Icon: Ico.Ticket   },
]

export default function SEDInvitaPage() {
    const [dark, setDark]     = useState(false)
    const [fase, setFase]     = useState('F1')
    const [tab, setTab]       = useState('invitados')

    // Lee dark mode del mismo key que el layout
    useEffect(() => {
        try {
            const stored = localStorage.getItem('sedipro_dark')
            if (stored !== null) setDark(stored === 'true')
        } catch { }
        // escucha cambios en tiempo real (cuando el usuario cambia en el navbar)
        const handler = (e) => { if (e.key === 'sedipro_dark') setDark(e.newValue === 'true') }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])

    const t    = getTheme(dark)

    return (
        <div style={{
            minHeight: '100%', padding: '20px 16px',
            backgroundColor: t.pageBg, transition: 'background-color 0.3s',
            fontFamily: 'Poppins, sans-serif',
            maxWidth: '1200px', margin: '0 auto',
        }}>

            {/* ── Encabezado ── */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '4px' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '20px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>
                            SEDInvita
                        </h1>
                        <p style={{ fontSize: '12px', color: t.bodyText, margin: '2px 0 0' }}>
                            Gestión de procesos dentro del proyecto SEDInvita 2026
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Selector de Fase ── */}
            <div style={{
                backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow, borderRadius: '14px',
                padding: '14px 16px', marginBottom: '16px',
            }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: t.labelText, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                    Fase del programa
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {FASES.map(f => {
                        const active = fase === f.key
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFase(f.key)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                    padding: '9px 14px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                                    flex: '1 1 120px',
                                    backgroundColor: active ? f.color : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                    boxShadow: active ? `0 4px 14px ${f.color}44` : 'none',
                                    transition: 'all 0.2s ease',
                                    outline: active ? `2px solid ${f.color}` : `1px solid ${t.tabBorder}`,
                                    outlineOffset: active ? '0px' : '-1px',
                                }}
                            >
                                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 700, color: active ? '#fff' : t.titleText, lineHeight: 1 }}>
                                    {f.label}
                                </span>
                                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: active ? 'rgba(255,255,255,0.8)' : t.bodyText, marginTop: '3px' }}>
                                    {f.desc}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Tabs mobile-first ── */}
            <div style={{
                backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow, borderRadius: '14px',
                overflow: 'hidden',
            }}>
                {/* Tab bar */}
                <div style={{
                    display: 'flex', borderBottom: `1px solid ${t.tabBorder}`,
                    backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(103,37,119,0.03)',
                    overflowX: 'auto', WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                }}>
                    {TABS.map(({ key, label, Icon }) => {
                        const active = tab === key
                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '7px', flex: '1 1 0', minWidth: '100px',
                                    padding: '13px 10px', border: 'none', cursor: 'pointer',
                                    backgroundColor: active ? t.tabActive : 'transparent',
                                    borderBottom: active ? '2px solid #672577' : '2px solid transparent',
                                    color: active ? '#672577' : t.bodyText,
                                    fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: active ? 700 : 500,
                                    transition: 'all 0.18s', whiteSpace: 'nowrap',
                                    boxShadow: active ? (dark ? '0 2px 12px rgba(103,37,119,0.25)' : '0 2px 8px rgba(103,37,119,0.10)') : 'none',
                                }}
                            >
                                <Icon />
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab content */}
                <div style={{ padding: '16px' }}>
                    {tab === 'invitados'  && <TabSEDInvitados  dark={dark} />}
                    {tab === 'asistencia' && <TabAsistencia    dark={dark} />}
                    {tab === 'turno'      && <TabTurno         dark={dark} />}
                </div>
            </div>

            <style>{`
                @keyframes spin      { to { transform: rotate(360deg); } }
                @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp   { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes pulse     { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
                ::-webkit-scrollbar  { width: 0; height: 0; }
            `}</style>
        </div>
    )
}