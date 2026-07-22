'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

const AREAS = ['DIRECTIVA', 'GTH', 'TI', 'MKT', 'PMO', 'LTK Y FNZ']

const AREA_COLORS = {
    DIRECTIVA: { 
        bg: 'rgba(103,37,119,0.14)', 
        text: '#7C4191', 
        border: 'rgba(103,37,119,0.30)' 
    },

    GTH: { 
        bg: 'rgba(115,184,90,0.14)', 
        text: '#73B85A', 
        border: 'rgba(115,184,90,0.30)' 
    },

    TI: { 
        bg: 'rgba(230,74,14,0.14)', 
        text: '#E64A0E', 
        border: 'rgba(230,74,14,0.30)' 
    },

    MKT: { 
        bg: 'rgba(179,21,58,0.14)', 
        text: '#B3153A', 
        border: 'rgba(179,21,58,0.30)' 
    },

    PMO: { 
        bg: 'rgba(230,177,73,0.14)', 
        text: '#E6B149', 
        border: 'rgba(230,177,73,0.30)' 
    },

    LTK: { 
        bg: 'rgba(95,192,211,0.14)', 
        text: '#5FC0D3', 
        border: 'rgba(95,192,211,0.30)' 
    },

    DEFAULT: { 
        bg: 'rgba(95,192,211,0.14)', 
        text: '#5FC0D3', 
        border: 'rgba(95,192,211,0.30)' 
    },
}

function getAreaColor(area = '') {
    const key = area.toUpperCase().split(' ')[0]
    return AREA_COLORS[key] ?? AREA_COLORS.DEFAULT
}

function getTheme(dark) {
    return {
        cardBg:          dark ? '#160C22'                      : '#ffffff',
        cardBorder:      dark ? 'rgba(103,37,119,0.28)'        : 'rgba(214,182,223,0.55)',
        cardShadow:      dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(103,37,119,0.10)',
        inputBg:         dark ? '#1F1030'                      : '#f9f6fb',
        inputBorder:     dark ? 'rgba(103,37,119,0.35)'        : '#e5d9ef',
        inputText:       dark ? '#EAD8F5'                      : '#111827',
        labelText:       dark ? '#C8A8D8'                      : '#4A1A5E',
        bodyText:        dark ? '#9880B0'                      : '#6B7280',
        tableHead:       dark ? '#1A0D2E'                      : '#f5f0f9',
        tableHeadText:   dark ? '#C8A8D8'                      : '#4A1A5E',
        tableRow:        dark ? '#160C22'                      : '#ffffff',
        tableRowAlt:     dark ? '#1A0D2B'                      : '#faf7fc',
        tableRowHover:   dark ? 'rgba(103,37,119,0.10)'        : 'rgba(103,37,119,0.05)',
        tableBorder:     dark ? 'rgba(103,37,119,0.16)'        : 'rgba(214,182,223,0.45)',
        dividerText:     dark ? '#6B5080'                      : '#c4aed4',
        emptyIcon:       dark ? 'rgba(103,37,119,0.18)'        : 'rgba(103,37,119,0.08)',
        paginBg:         dark ? '#1F1030'                      : '#f5f0f9',
        paginBorder:     dark ? 'rgba(103,37,119,0.28)'        : 'rgba(214,182,223,0.6)',
        paginText:       dark ? '#C8A8D8'                      : '#4A1A5E',
        paginActiveBg:   '#672577',
        paginActiveText: '#ffffff',
        badgeTotal:      dark ? 'rgba(103,37,119,0.20)'        : 'rgba(103,37,119,0.10)',
        badgeTotalText:  dark ? '#C8A8D8'                      : '#672577',
        sortActive:      '#672577',
        sortInactive:    dark ? '#6B5080'                      : '#c4aed4',
        overlayBg:       dark ? 'rgba(0,0,0,0.72)'            : 'rgba(0,0,0,0.45)',
        titleText:       dark ? '#EAD8F5'                      : '#1F0B2E',
    }
}

const Ico = {
    Search: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
    ),
    ChevronUp: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
    ),
    ChevronDown: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    Users: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    ChevronsLeft: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
        </svg>
    ),
    ChevronsRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
        </svg>
    ),
    ChevLeft: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
        </svg>
    ),
    ChevRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    ),
    Spinner: () => (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/>
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    ),
    Empty: () => (
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
    ),
    Plus: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    ),
    CheckCircle: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    ),
    XCircle: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    ),
}

const COLUMNS = [
    { key: 'index',     label: '#',         sortable: false, width: '52px',  align: 'center' },
    { key: 'nombres',   label: 'Nombres',   sortable: true,  width: 'auto'                   },
    { key: 'apellidos', label: 'Apellidos', sortable: true,  width: 'auto'                   },
    { key: 'dni',       label: 'DNI',       sortable: true,  width: '120px', align: 'center' },
    { key: 'area',      label: 'Área',      sortable: true,  width: '150px', align: 'center' },
    { key: 'fechas',    label: 'Fechas',    sortable: false, width: '200px', align: 'center' },
    { key: 'acciones',  label: 'Acciones',  sortable: false, width: '96px',  align: 'center' },
]

const PAGE_SIZE_OPTIONS = [50, 100, 200]

function Toast({ toast }) {
    if (!toast) return null
    const isSuccess = toast.type === 'success'
    return (
        <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '13px 18px', borderRadius: '12px', maxWidth: '340px',
            backgroundColor: isSuccess ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
            border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.30)' : 'rgba(239,68,68,0.30)'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            animation: 'sdpSlideIn 0.25s ease',
            fontFamily: 'Poppins, sans-serif',
        }}>
            <span style={{ color: isSuccess ? '#FFFFFF' : '#FFFFFF', flexShrink: 0 }}>
                {isSuccess ? <Ico.CheckCircle /> : <Ico.XCircle />}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: isSuccess ? '#ffffff' : '#ffffff', lineHeight: 1.4 }}>
                {toast.msg}
            </span>
        </div>
    )
}

function ConfirmDialog({ dark, row, onConfirm, onCancel, loading }) {
    const t = getTheme(dark)
    const nombre = row ? `${row.nombres} ${row.apellidos}` : ''
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: t.overlayBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', animation: 'sdpFadeIn 0.15s ease',
        }}>
            <div style={{
                backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px', padding: '28px 24px',
                maxWidth: '380px', width: '100%',
                boxShadow: t.cardShadow, animation: 'sdpSlideDown 0.2s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: 'rgba(239,68,68,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#EF4444',
                    }}>
                        <Ico.Trash />
                    </div>
                    <h3 style={{
                        fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
                        fontSize: '16px', color: t.titleText, margin: 0,
                    }}>
                        Eliminar Sediprano
                    </h3>
                </div>
                <p style={{
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                    color: t.bodyText, marginBottom: '24px', lineHeight: 1.6,
                }}>
                    ¿Estás seguro de que deseas eliminar a{' '}
                    <strong style={{ color: t.titleText }}>{nombre}</strong>?
                    Esta acción no se puede deshacer.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px',
                            border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg,
                            color: t.labelText, fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px',
                            border: 'none', backgroundColor: '#EF4444', color: '#fff',
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                            cursor: loading ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(239,68,68,0.30)',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        {loading ? 'Eliminando…' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function Field({
    label, fieldKey, placeholder, maxLen, numericOnly,
    form, setForm, errors, setErrors, t
}) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div>
            <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                fontFamily: 'Poppins, sans-serif', color: t.labelText, marginBottom: '6px',
            }}>
                {label}
            </label>
            <input
                type="text"
                value={form[fieldKey]}
                maxLength={maxLen}
                placeholder={placeholder ?? ''}
                onChange={e => {
                    let value = e.target.value
                    if (numericOnly) value = value.replace(/\D/g, '')

                    setForm(prev => ({ ...prev, [fieldKey]: value }))

                    if (errors[fieldKey]) {
                        setErrors(prev => ({ ...prev, [fieldKey]: null }))
                    }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                    borderRadius: '10px',
                    border: `1px solid ${errors[fieldKey] ? '#EF4444' : (isFocused ? '#672577' : t.inputBorder)}`,
                    backgroundColor: t.inputBg, color: t.inputText,
                    outline: 'none',
                    boxShadow: isFocused && !errors[fieldKey] ? '0 0 0 3px rgba(103,37,119,0.13)' : 'none',
                }}
            />
            {errors[fieldKey] && (
                <p style={{
                    fontFamily: 'Poppins, sans-serif', fontSize: '11px',
                    color: '#EF4444', margin: '4px 0 0',
                }}>
                    {errors[fieldKey]}
                </p>
            )}
        </div>
    )
}

function SedipranoModal({ dark, mode, row, onClose, onSaved, showToast }) {
    const t      = getTheme(dark)
    const isEdit = mode === 'edit'

    const [form, setForm] = useState({
        area:      row?.area      ?? AREAS[0],
        nombres:   row?.nombres   ?? '',
        apellidos: row?.apellidos ?? '',
        dni:       row?.dni       ?? '',
    })
    const [errors,  setErrors]  = useState({})
    const [loading, setLoading] = useState(false)

    function validate() {
        const e = {}
        if (!form.nombres.trim())   e.nombres   = 'Los nombres son requeridos'
        if (!form.apellidos.trim()) e.apellidos  = 'Los apellidos son requeridos'
        if (!form.dni.trim())       e.dni        = 'El DNI es requerido'
        else if (!/^\d{8}$/.test(form.dni.trim())) e.dni = 'El DNI debe tener exactamente 8 dígitos'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            const url    = isEdit ? `/api/sedipranos/${row._id}` : '/api/sedipranos'
            const method = isEdit ? 'PUT' : 'POST'
            const res    = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    area:      form.area.trim().toUpperCase(),
                    nombres:   form.nombres.trim(),
                    apellidos: form.apellidos.trim(),
                    dni:       form.dni.trim(),
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Error al guardar')
            onSaved(json.data, isEdit)
            showToast('success', isEdit ? 'Sediprano actualizado correctamente' : 'Sediprano creado correctamente')
            onClose()
        } catch (err) {
            showToast('error', err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: t.overlayBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', animation: 'sdpFadeIn 0.15s ease',
            }}
            onClick={e => { if (e.target === e.currentTarget && !loading) onClose() }}
        >
            <div style={{
                backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px', padding: '28px 24px',
                maxWidth: '460px', width: '100%',
                boxShadow: t.cardShadow, animation: 'sdpSlideDown 0.2s ease',
            }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #672577, #3454A1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', boxShadow: '0 4px 14px rgba(103,37,119,0.35)',
                    }}>
                        {isEdit ? <Ico.Edit /> : <Ico.Plus />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
                            fontSize: '16px', color: t.titleText, margin: 0,
                        }}>
                            {isEdit ? 'Editar Sediprano' : 'Nuevo Sediprano'}
                        </h3>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px',
                            color: t.bodyText, margin: '3px 0 0',
                        }}>
                            {isEdit ? 'Modifica los datos del miembro' : 'Agrega un nuevo miembro a SEDIPRO'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: t.bodyText, padding: '4px 6px', display: 'flex',
                            borderRadius: '8px', fontSize: '16px', lineHeight: 1,
                            transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                        ✕
                    </button>
                </div>

                {/* ── Campos ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Área */}
                    <div>
                        <label style={{
                            display: 'block', fontSize: '12px', fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif', color: t.labelText, marginBottom: '6px',
                        }}>
                            Área
                        </label>
                        <select
                            value={form.area}
                            onChange={e => setForm(prev => ({ ...prev, area: e.target.value }))}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '9px 36px 9px 12px',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23672577' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    {/* Nombres + Apellidos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Field label="Nombres"   fieldKey="nombres"   placeholder="Ej: Juan Carlos" form={form}
                                setForm={setForm}
                                errors={errors}
                                setErrors={setErrors}
                                t={t} />
                        <Field label="Apellidos" fieldKey="apellidos" placeholder="Ej: García López" form={form}
                                setForm={setForm}
                                errors={errors}
                                setErrors={setErrors}
                                t={t} />
                    </div>

                    {/* DNI */}
                    <Field label="DNI" fieldKey="dni" placeholder="12345678" maxLen={8} numericOnly={true} form={form}
                        setForm={setForm}
                        errors={errors}
                        setErrors={setErrors}
                        t={t} />
                </div>

                {/* ── Botones ── */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '10px',
                            border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg,
                            color: t.labelText, fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #672577, #3454A1)', color: '#fff',
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                            cursor: loading ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(103,37,119,0.30)',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        {loading
                            ? (isEdit ? 'Guardando…' : 'Creando…')
                            : (isEdit ? 'Guardar cambios' : 'Agregar Sediprano')
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── SedipranosTable (principal) ──────────────────────────────────────────────
export default function SedipranosTable() {
    const [dark, setDark]           = useState(false)
    const [data, setData]           = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState(null)
    const [search, setSearch]       = useState('')
    const [sort, setSort]           = useState({ key: 'apellidos', dir: 'asc' })
    const [page, setPage]           = useState(1)
    const [pageSize, setPageSize]   = useState(200)

    // CRUD state
    const [modal,      setModal]      = useState(null)  // null | { mode: 'create'|'edit', row: null|{} }
    const [confirmDel, setConfirmDel] = useState(null)  // null | row
    const [deleting,   setDeleting]   = useState(false)
    const [toast,      setToast]      = useState(null)  // null | { type, msg }

    const [areaFilter, setAreaFilter] = useState('')

    // ── Dark mode (misma lógica del proyecto) ──
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

    // ── Carga inicial ──
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        fetch('/api/sedipranos', { credentials: 'include' })
            .then(r => r.json())
            .then(json => {
                if (cancelled) return
                if (!json.success) throw new Error(json.error ?? 'Error al cargar')
                setData(json.data)
            })
            .catch(err => { if (!cancelled) setError(err.message) })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [])

    // ── Helpers ──
    const showToast = useCallback((type, msg) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }, [])

    const handleSaved = useCallback((savedRow, isEdit) => {
        setData(prev =>
            isEdit
                ? prev.map(r => String(r._id) === String(savedRow._id) ? savedRow : r)
                : [...prev, savedRow]
        )
    }, [])

    const handleDelete = useCallback(async () => {
        if (!confirmDel) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/sedipranos/${confirmDel._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Error al eliminar')
            setData(prev => prev.filter(r => String(r._id) !== String(confirmDel._id)))
            showToast('success', 'Sediprano eliminado correctamente')
            setConfirmDel(null)
        } catch (err) {
            showToast('error', err.message)
        } finally {
            setDeleting(false)
        }
    }, [confirmDel, showToast])

    const t = getTheme(dark)

    // ── Filtrado + orden ──
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        let rows = data
        
        // Filtro por búsqueda
        if (q) {
            rows = rows.filter(r =>
                r.nombres.toLowerCase().includes(q)   ||
                r.apellidos.toLowerCase().includes(q) ||
                r.dni.includes(q)                     ||
                r.area.toLowerCase().includes(q)
            )
        }
        
        // Filtro por área
        if (areaFilter) {
            rows = rows.filter(r => r.area === areaFilter)
        }

        // Ordenamiento
        if (sort.key && sort.key !== 'index' && sort.key !== 'acciones') {
            rows = [...rows].sort((a, b) => {
                const av = (a[sort.key] ?? '').toLowerCase()
                const bv = (b[sort.key] ?? '').toLowerCase()
                return sort.dir === 'asc'
                    ? av.localeCompare(bv, 'es')
                    : bv.localeCompare(av, 'es')
            })
        }
        return rows
    }, [data, search, areaFilter, sort])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage   = Math.min(page, totalPages)

    const pageRows = useMemo(() => {
        const start = (safePage - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, safePage, pageSize])

    const handleSort = useCallback((key) => {
        setSort(prev => prev.key === key
            ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { key, dir: 'asc' }
        )
        setPage(1)
    }, [])

    const handleSearch = useCallback((e) => {
        setSearch(e.target.value)
        setPage(1)
    }, [])

    const pageNumbers = useMemo(() => {
        const delta = 2
        const range = []
        const rangeWithDots = []
        let l
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
                range.push(i)
            }
        }
        for (const i of range) {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1)
                else if (i - l > 2) rangeWithDots.push('…')
            }
            rangeWithDots.push(i)
            l = i
        }
        return rangeWithDots
    }, [totalPages, safePage])

    const startRow = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
    const endRow   = Math.min(safePage * pageSize, filtered.length)

    const card = {
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.cardShadow,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'background-color 0.3s, border-color 0.3s',
    }

    const paginBtn = (active, disabled) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '32px', height: '32px', padding: '0 6px',
        borderRadius: '8px', border: `1px solid ${active ? 'transparent' : t.paginBorder}`,
        backgroundColor: active ? t.paginActiveBg : t.paginBg,
        color: active ? t.paginActiveText : t.paginText,
        fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: 'all 0.15s',
    })

    // ── Estados de carga/error ──
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '72px 0' }}>
            <div style={{ animation: 'sdpSpin 0.8s linear infinite' }}><Ico.Spinner /></div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#672577', margin: 0 }}>Cargando sedipranos…</p>
            <style>{`@keyframes sdpSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error) return (
        <div style={{ ...card, padding: '40px 28px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#EF4444', margin: 0 }}>⚠ {error}</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Toast toast={toast} />

            {/* ── Tarjeta resumen ── */}
            <div style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* <div style={{
                    width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #672577, #3454A1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', boxShadow: '0 4px 14px rgba(103,37,119,0.35)',
                }}>
                    <Ico.Users />
                </div> */}
                <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                        Total de Sedipranos
                    </p>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '28px',
                        color: dark ? '#EAD8F5' : '#4A1A5E', margin: '2px 0 0', lineHeight: 1,
                    }}>
                        {data.length}
                    </p>
                </div>

                {/* Breakdown por área */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {Object.entries(
                        data.reduce((acc, r) => { acc[r.area] = (acc[r.area] ?? 0) + 1; return acc }, {})
                    ).sort((a, b) => b[1] - a[1]).map(([area, count]) => {
                        const c = getAreaColor(area)
                        return (
                            <span key={area} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 10px', borderRadius: '20px',
                                backgroundColor: c.bg, border: `1px solid ${c.border}`,
                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
                                color: c.text, whiteSpace: 'nowrap',
                            }}>
                                {/* <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.text, flexShrink: 0 }} /> */}
                                {area}: {count}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* ── Tabla ── */}
            <div style={card}>

                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                    padding: '16px 20px', borderBottom: `1px solid ${t.tableBorder}`,
                }}>
                    {/* Mostrar N registros */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText }}>Mostrar</span>
                        <select
                            value={pageSize}
                            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                            style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500,
                                padding: '5px 26px 5px 10px', borderRadius: '8px',
                                border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23672577' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                            }}
                        >
                            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText }}>registros</span>
                    </div>

                    {/* Buscador + botón Agregar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Buscador */}
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                                color: '#672577', pointerEvents: 'none', display: 'flex',
                            }}>
                                <Ico.Search />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar sediprano…"
                                value={search}
                                onChange={handleSearch}
                                style={{
                                    paddingLeft: '34px', paddingRight: '12px',
                                    paddingTop: '7px', paddingBottom: '7px',
                                    width: '200px', maxWidth: '100%',
                                    fontSize: '13px', fontFamily: 'Poppins, sans-serif',
                                    borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: t.inputBg, color: t.inputText,
                                    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                                onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                            />
                        </div>

                        {/* Selector de filtro por área */}
                        <select
                            value={areaFilter}
                            onChange={e => {
                                setAreaFilter(e.target.value)
                                setPage(1) // Resetear a página 1 al cambiar filtro
                            }}
                            style={{
                                padding: '7px 32px 7px 12px',
                                fontSize: '13px', fontFamily: 'Poppins, sans-serif',
                                borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23672577' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                minWidth: '150px',
                                transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            <option value="">Todas las áreas</option>
                            {AREAS.map(area => {
                                const color = getAreaColor(area)
                                return (
                                    <option key={area} value={area} style={{ 
                                        backgroundColor: color.bg,
                                        color: color.text,
                                        fontWeight: 600
                                    }}>
                                        {area}
                                    </option>
                                )
                            })}
                        </select>

                        {/* Botón Agregar */}
                        <button
                            onClick={() => setModal({ mode: 'create', row: null })}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 16px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, #672577, #3454A1)', color: '#fff',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                boxShadow: '0 4px 12px rgba(103,37,119,0.30)',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            <Ico.Plus />
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {COLUMNS.map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        style={{
                                            width: col.width, textAlign: col.align ?? 'left',
                                            padding: '11px 16px',
                                            fontFamily: 'Montserrat, sans-serif', fontSize: '11px',
                                            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                            color: t.tableHeadText,
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                            cursor: col.sortable ? 'pointer' : 'default',
                                            userSelect: 'none', whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            {col.label}
                                            {col.sortable && (
                                                <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', color: sort.key === col.key ? t.sortActive : t.sortInactive }}>
                                                    <span style={{ opacity: sort.key === col.key && sort.dir === 'asc'  ? 1 : 0.35 }}><Ico.ChevronUp /></span>
                                                    <span style={{ opacity: sort.key === col.key && sort.dir === 'desc' ? 1 : 0.35 }}><Ico.ChevronDown /></span>
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <Ico.Empty />
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', margin: 0 }}>
                                                {search ? 'Sin resultados para la búsqueda' : 'No hay sedipranos registrados'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.map((row, i) => {
                                const globalIdx = (safePage - 1) * pageSize + i + 1
                                const isEven    = i % 2 === 1
                                const areaC     = getAreaColor(row.area)

                                return (
                                    <tr
                                        key={row._id ?? row.dni}
                                        style={{
                                            backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                            transition: 'background-color 0.12s',
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.tableRowHover }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow }}
                                    >
                                        {/* # */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.dividerText }}>
                                            {globalIdx}
                                        </td>
                                        {/* Nombres */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#111827', fontWeight: 500 }}>
                                            {row.nombres.toUpperCase()}
                                        </td>
                                        {/* Apellidos */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#111827' }}>
                                            {row.apellidos.toUpperCase()}
                                        </td>
                                        {/* DNI */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                            <span style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                                                letterSpacing: '0.05em', color: dark ? '#C8A8D8' : '#4A1A5E',
                                                backgroundColor: dark ? 'rgba(103,37,119,0.14)' : 'rgba(103,37,119,0.08)',
                                                padding: '3px 10px', borderRadius: '6px',
                                            }}>
                                                {row.dni}
                                            </span>
                                        </td>
                                        {/* Área */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                                backgroundColor: areaC.bg, border: `1px solid ${areaC.border}`,
                                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
                                                color: areaC.text, whiteSpace: 'nowrap',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                            }}>
                                                {row.area}
                                            </span>
                                        </td>
                                        {/* Fechas - Nueva columna */}
                                        <td style={{ 
                                            padding: '8px 12px', 
                                            textAlign: 'center',
                                            fontSize: '11px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div style={{ 
                                                    color: dark ? '#9880B0' : '#6B7280',
                                                    fontSize: '10px',
                                                    fontWeight: 400,
                                                }}>
                                                    <span style={{ opacity: 0.6 }}>Creado: </span>
                                                    {formatDate(row.createdAt)}
                                                </div>
                                                <div style={{ 
                                                    color: dark ? '#9880B0' : '#6B7280',
                                                    fontSize: '10px',
                                                    fontWeight: 400,
                                                }}>
                                                    <span style={{ opacity: 0.6 }}>Actualizado: </span>
                                                    {formatDate(row.updatedAt)}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Acciones */}
                                        <td style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <button
                                                    onClick={() => setModal({ mode: 'edit', row })}
                                                    title="Editar"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                                                        backgroundColor: dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.08)',
                                                        color: '#672577', cursor: 'pointer', transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.38)' : 'rgba(103,37,119,0.18)' }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.08)' }}
                                                >
                                                    <Ico.Edit />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDel(row)}
                                                    title="Eliminar"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                                                        backgroundColor: 'rgba(239,68,68,0.10)',
                                                        color: '#EF4444', cursor: 'pointer', transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.22)' }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.10)' }}
                                                >
                                                    <Ico.Trash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer paginación */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                    padding: '14px 20px', borderTop: `1px solid ${t.tableBorder}`,
                }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                        {filtered.length === 0
                            ? 'Sin registros'
                            : `Mostrando ${startRow} – ${endRow} de ${filtered.length} registro${filtered.length !== 1 ? 's' : ''}${search ? ` (filtrado de ${data.length} total)` : ''}`
                        }
                    </p>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <button onClick={() => setPage(1)} disabled={safePage === 1} style={paginBtn(false, safePage === 1)}><Ico.ChevronsLeft /></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={paginBtn(false, safePage === 1)}><Ico.ChevLeft /></button>

                            {pageNumbers.map((n, i) =>
                                n === '…'
                                    ? <span key={`d${i}`} style={{ padding: '0 4px', color: t.dividerText, fontSize: '13px' }}>…</span>
                                    : <button key={n} onClick={() => setPage(n)} style={paginBtn(n === safePage, false)}>{n}</button>
                            )}

                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={paginBtn(false, safePage === totalPages)}><Ico.ChevRight /></button>
                            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={paginBtn(false, safePage === totalPages)}><Ico.ChevronsRight /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modales ── */}
            {modal && (
                <SedipranoModal
                    dark={dark}
                    mode={modal.mode}
                    row={modal.row}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                    showToast={showToast}
                />
            )}

            {confirmDel && (
                <ConfirmDialog
                    dark={dark}
                    row={confirmDel}
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => !deleting && setConfirmDel(null)}
                />
            )}

            <style>{`
                @keyframes sdpSpin    { to { transform: rotate(360deg); } }
                @keyframes sdpFadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sdpSlideDown {
                    from { opacity: 0; transform: translateY(-12px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)       scale(1);    }
                }
                @keyframes sdpSlideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0);     }
                }
            `}</style>
        </div>
    )
}

function formatDate(dateString) {
    if (!dateString) return 'No registrado'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}