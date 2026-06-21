// src\app\panel\asistencias\page.js
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
        modalBg:       dark ? '#1A0D2E' : '#ffffff',
        overlayBg:     'rgba(0,0,0,0.55)',
    }
}

const Ico = {
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    Calendar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Attendance: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    Spinner: () => <svg width="20" height="20" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/><path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/></svg>,
    Close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    UserPlus: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    UserX: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>,
    Users: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    const meses = ['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.']
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
}
function todayISO() {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}
function initials(nombres, apellidos) {
    return `${nombres?.[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase()
}

function EncargadosCell({ encargados, dark, onOpen }) {
    const t = getTheme(dark)
    const MAX_VISIBLE = 3

    if (!encargados?.length) {
        return (
            <button
                onClick={onOpen}
                title="Asignar encargado"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '10px', border: `1px dashed ${dark ? 'rgba(103,37,119,0.35)' : 'rgba(103,37,119,0.30)'}`, backgroundColor: 'transparent', color: t.dividerText, fontSize: '12px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid'; e.currentTarget.style.color = '#672577'; e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.08)' : 'rgba(103,37,119,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed'; e.currentTarget.style.color = t.dividerText; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
                <Ico.UserPlus />
                Sin asignación
            </button>
        )
    }

    const visible = encargados.slice(0, MAX_VISIBLE)
    const extra   = encargados.length - MAX_VISIBLE

    return (
        <button
            onClick={onOpen}
            title={`Ver encargados (${encargados.length})`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '10px', border: `1px solid ${dark ? 'rgba(103,37,119,0.30)' : 'rgba(103,37,119,0.20)'}`, backgroundColor: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.05)' }}
        >
            {/* Avatares apilados */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {visible.map((enc, i) => (
                    <div key={enc._id} title={`${enc.nombres} ${enc.apellidos}`} style={{ width: '26px', height: '26px', borderRadius: '50%', background: `linear-gradient(135deg, ${i % 2 === 0 ? '#672577, #3454A1' : '#3454A1, #672577'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, border: `2px solid ${dark ? '#160C22' : '#fff'}`, marginLeft: i > 0 ? '-8px' : '0', flexShrink: 0, zIndex: MAX_VISIBLE - i }}>
                        {initials(enc.nombres, enc.apellidos)}
                    </div>
                ))}
                {extra > 0 && (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: dark ? 'rgba(103,37,119,0.30)' : 'rgba(103,37,119,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#C8A8D8' : '#672577', fontSize: '9px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, border: `2px solid ${dark ? '#160C22' : '#fff'}`, marginLeft: '-8px', flexShrink: 0 }}>
                        +{extra}
                    </div>
                )}
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: dark ? '#C8A8D8' : '#4A1A5E', whiteSpace: 'nowrap' }}>
                {encargados.length === 1
                    ? encargados[0].nombres
                    : `${encargados.length} enc.`}
            </span>
        </button>
    )
}

function ModalEncargados({ dark, asistencia, encargados, onClose, onAgregar, onEliminar, eliminando }) {
    const t = getTheme(dark)
    const [confirmEl, setConfirmEl] = useState(null)

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
            <div style={{ backgroundColor: t.modalBg, border: `1px solid ${t.cardBorder}`, borderRadius: '18px', width: '100%', maxWidth: '440px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: t.cardShadow, animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${t.tableBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>
                            Encargados de asistencia
                        </h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: '2px 0 0 0' }}>
                            {asistencia.descripcion} · {formatDate(asistencia.fecha)}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: t.bodyText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Ico.Close />
                    </button>
                </div>

                {/* Lista de encargados actuales */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {encargados.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: t.dividerText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                            No hay encargados asignados aún
                        </div>
                    ) : encargados.map((enc, i) => (
                        <div key={enc._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', borderBottom: i < encargados.length - 1 ? `1px solid ${t.tableBorder}` : 'none' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #672577, #3454A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                                {initials(enc.nombres, enc.apellidos)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {enc.nombres} {enc.apellidos}
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: t.bodyText, margin: 0 }}>
                                    DNI: {enc.dni} · Contraseña: su DNI
                                </p>
                            </div>
                            {/* Botón eliminar este encargado */}
                            {confirmEl?._id === enc._id ? (
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <button onClick={() => setConfirmEl(null)} style={{ padding: '5px 10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.bodyText, fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                                        No
                                    </button>
                                    <button
                                        onClick={() => { onEliminar(enc); setConfirmEl(null) }}
                                        disabled={eliminando === enc._id}
                                        style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {eliminando === enc._id ? '…' : 'Sí'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmEl(enc)}
                                    title="Quitar encargado"
                                    style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.20)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'scale(1)' }}
                                >
                                    <Ico.UserX />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer: botón agregar */}
                <div style={{ padding: '14px 22px', borderTop: `1px solid ${t.tableBorder}`, flexShrink: 0 }}>
                    <button
                        onClick={onAgregar}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#672577', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(103,37,119,0.28)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#541e61' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#672577' }}
                    >
                        <Ico.UserPlus />
                        Agregar encargado
                    </button>
                </div>
            </div>
        </div>
    )
}

function ModalAgregarEncargado({ dark, asistencia, encargadosActuales, onClose, onAsignado }) {
    const t = getTheme(dark)
    const [sedipranos, setSedipranos] = useState([])
    const [loadingSed, setLoadingSed] = useState(true)
    const [search,     setSearch]     = useState('')
    const [selected,   setSelected]   = useState(null)
    const [saving,     setSaving]     = useState(false)
    const [errorMsg,   setErrorMsg]   = useState('')

    const yaAsignadosIds = new Set(encargadosActuales.map(e => e.sedipranoId?.toString()))

    useEffect(() => {
        fetch('/api/sedipranos')
            .then(r => r.json())
            .then(d => {
                const lista = (d.data || []).filter(
                    s => s.area?.toUpperCase() !== 'DIRECTIVA'
                )
                setSedipranos(lista)
            })
            .catch(() => {})
            .finally(() => setLoadingSed(false))
    }, [])

    const filtrados = sedipranos.filter(s => {
        const q = search.toLowerCase()
        return (
            s.nombres?.toLowerCase().includes(q) ||
            s.apellidos?.toLowerCase().includes(q) ||
            s.dni?.includes(q) ||
            s.area?.toLowerCase().includes(q)
        )
    })

    async function handleAsignar() {
        if (!selected) return
        setSaving(true)
        setErrorMsg('')
        try {
            const res  = await fetch('/api/encargados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asistenciaId: asistencia._id, sedipranoId: selected._id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            onAsignado(data.encargado)
        } catch (err) {
            setErrorMsg(err.message || 'Error al asignar encargado')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1010, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
            <div style={{ backgroundColor: t.modalBg, border: `1px solid ${t.cardBorder}`, borderRadius: '18px', width: '100%', maxWidth: '460px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: t.cardShadow, animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${t.tableBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>
                            Agregar encargado
                        </h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: '2px 0 0 0' }}>
                            {asistencia.descripcion} · {formatDate(asistencia.fecha)}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: t.bodyText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Ico.Close />
                    </button>
                </div>

                {/* Buscador */}
                <div style={{ padding: '14px 22px', borderBottom: `1px solid ${t.tableBorder}`, flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.bodyText, pointerEvents: 'none', display: 'flex' }}>
                            <Ico.Search />
                        </span>
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, DNI o área…"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', outline: 'none' }}
                            onFocus={e => { e.target.style.borderColor = '#672577'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                            onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                        />
                    </div>
                </div>

                {/* Lista */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loadingSed ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                            Cargando sedipranos…
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: t.dividerText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                            {search ? 'Sin resultados' : 'No hay sedipranos disponibles'}
                        </div>
                    ) : filtrados.map(s => {
                        const yaAsignado = yaAsignadosIds.has(s._id?.toString())
                        const isSel = selected?._id === s._id
                        return (
                            <button
                                key={s._id}
                                onClick={() => !yaAsignado && setSelected(isSel ? null : s)}
                                disabled={yaAsignado}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', border: 'none', textAlign: 'left', cursor: yaAsignado ? 'not-allowed' : 'pointer', backgroundColor: isSel ? (dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.08)') : 'transparent', borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s', opacity: yaAsignado ? 0.45 : 1 }}
                                onMouseEnter={e => { if (!isSel && !yaAsignado) e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.04)' }}
                                onMouseLeave={e => { if (!isSel) e.currentTarget.style.backgroundColor = isSel ? (dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.08)') : 'transparent' }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isSel ? 'linear-gradient(135deg, #672577, #3454A1)' : (dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isSel ? '#fff' : '#672577', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}>
                                    {initials(s.nombres, s.apellidos)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.nombres} {s.apellidos}
                                        {yaAsignado && <span style={{ fontSize: '10px', marginLeft: '6px', color: '#10B981', fontWeight: 700 }}>• ya asignado</span>}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: t.bodyText, margin: 0 }}>
                                        {s.area} · DNI: {s.dni}
                                    </p>
                                </div>
                                {isSel && (
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#672577', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Error */}
                {errorMsg && (
                    <div style={{ margin: '10px 22px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontFamily: 'Poppins, sans-serif', fontSize: '12px', flexShrink: 0 }}>
                        {errorMsg}
                    </div>
                )}

                {/* Footer */}
                <div style={{ padding: '14px 22px', borderTop: `1px solid ${t.tableBorder}`, display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.labelText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleAsignar}
                        disabled={!selected || saving}
                        style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: selected && !saving ? '#672577' : '#E5E7EB', color: selected && !saving ? '#fff' : '#9CA3AF', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: selected && !saving ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', boxShadow: selected && !saving ? '0 4px 14px rgba(103,37,119,0.28)' : 'none', transition: 'all 0.15s' }}
                    >
                        {saving
                            ? <><Ico.Spinner /> Asignando…</>
                            : <><Ico.UserPlus /> {selected ? `Asignar a ${selected.nombres}` : 'Selecciona uno'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

function ConfirmDialog({ dark, title, message, onConfirm, onCancel }) {
    const t = getTheme(dark)
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
            <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '16px', padding: '28px 24px', maxWidth: '380px', width: '100%', boxShadow: t.cardShadow, animation: 'slideDown 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Ico.Trash />
                    </div>
                    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>{title}</h3>
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText, marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.labelText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.30)' }}>Eliminar</button>
                </div>
            </div>
        </div>
    )
}

function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[80, '60%', 90, 110, 120].map((w, j) => (
                <td key={j} style={{ padding: '14px 16px' }}>
                    <div style={{ height: '14px', borderRadius: '6px', backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)', width: w, animation: 'pulse 1.5s ease-in-out infinite' }} />
                </td>
            ))}
        </tr>
    ))
}

export default function AsistenciasPage() {
    const router = useRouter()

    const [dark, setDark]               = useState(false)
    const [asistencias, setAsistencias] = useState([])
    const [loading, setLoading]         = useState(true)
    const [creating, setCreating]       = useState(false)
    const [showForm, setShowForm]       = useState(false)
    const [formData, setFormData]       = useState({ fecha: todayISO(), descripcion: '' })
    const [formError, setFormError]     = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting]       = useState(false)
    const [toast, setToast]             = useState(null)
    const [search, setSearch]           = useState('')

    // Modales de encargados
    const [modalGestionar, setModalGestionar] = useState(null) // asistencia seleccionada
    const [modalAgregar,   setModalAgregar]   = useState(null) // asistencia seleccionada
    const [eliminando,     setEliminando]     = useState(null) // id del encargado en proceso

    const t = getTheme(dark)

    const fetchAsistencias = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch('/api/asistencias')
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
        const onStorage = e => { if (e.key === 'sedipro_dark') setDark(e.newValue === 'true') }
        window.addEventListener('storage', onStorage)
        const interval = setInterval(() => {
            const val = localStorage.getItem('sedipro_dark')
            setDark(prev => { const next = val === 'true'; return prev !== next ? next : prev })
        }, 400)
        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval) }
    }, [])

    useEffect(() => { fetchAsistencias() }, [fetchAsistencias])

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
            const res  = await fetch('/api/asistencias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
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
            const res  = await fetch(`/api/asistencias/${deleteTarget._id}`, { method: 'DELETE' })
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

    function handleEncargadoAgregado(asistenciaId, nuevoEncargado) {
        showToast(`${nuevoEncargado.nombres} asignado como encargado`)
        setModalAgregar(null)
        setAsistencias(prev => prev.map(a => {
            if (a._id !== asistenciaId) return a
            return { ...a, encargados: [...(a.encargados || []), nuevoEncargado] }
        }))
        // Actualizar también el modal de gestión si está abierto
        setModalGestionar(prev => {
            if (!prev || prev._id !== asistenciaId) return prev
            return { ...prev, encargados: [...(prev.encargados || []), nuevoEncargado] }
        })
    }

    async function handleEliminarEncargado(asistenciaId, encargado) {
        setEliminando(encargado._id)
        try {
            const res  = await fetch(`/api/encargados/${asistenciaId}?id=${encargado._id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            showToast('Encargado eliminado correctamente')

            const filtrar = lista => lista.filter(e => e._id !== encargado._id)

            setAsistencias(prev => prev.map(a =>
                a._id === asistenciaId ? { ...a, encargados: filtrar(a.encargados || []) } : a
            ))
            setModalGestionar(prev =>
                prev?._id === asistenciaId ? { ...prev, encargados: filtrar(prev.encargados || []) } : prev
            )
        } catch (err) {
            showToast(err.message || 'Error al eliminar encargado', 'error')
        } finally {
            setEliminando(null)
        }
    }

    const filteredAsistencias = asistencias.filter(a =>
        a.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        formatDate(a.fecha).toLowerCase().includes(search.toLowerCase())
    )

    const inputStyle = () => ({
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg,
        color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px',
        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
    })

    // Sync encargados del modal al abrir gestión
    function abrirGestion(a) {
        setModalGestionar({ ...a, encargados: a.encargados || [] })
    }

    return (
        <div style={{ padding: '24px', minHeight: '100%', fontFamily: 'Poppins, sans-serif', backgroundColor: t.pageBg, transition: 'background-color 0.2s' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000, backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981', color: '#fff', padding: '12px 20px', borderRadius: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.20)', animation: 'slideDown 0.2s ease', maxWidth: '320px' }}>
                    {toast.msg}
                </div>
            )}

            {/* Confirm eliminar asistencia */}
            {deleteTarget && (
                <ConfirmDialog
                    dark={dark}
                    title="Eliminar asistencia"
                    message={`¿Seguro que deseas eliminar "${deleteTarget.descripcion}"? También se eliminarán los encargados asignados.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Modal gestionar encargados */}
            {modalGestionar && !modalAgregar && (
                <ModalEncargados
                    dark={dark}
                    asistencia={modalGestionar}
                    encargados={modalGestionar.encargados || []}
                    eliminando={eliminando}
                    onClose={() => setModalGestionar(null)}
                    onAgregar={() => setModalAgregar(modalGestionar)}
                    onEliminar={enc => handleEliminarEncargado(modalGestionar._id, enc)}
                />
            )}

            {/* Modal agregar encargado */}
            {modalAgregar && (
                <ModalAgregarEncargado
                    dark={dark}
                    asistencia={modalAgregar}
                    encargadosActuales={
                        modalGestionar?._id === modalAgregar._id
                            ? (modalGestionar.encargados || [])
                            : (modalAgregar.encargados || [])
                    }
                    onClose={() => setModalAgregar(null)}
                    onAsignado={enc => handleEncargadoAgregado(modalAgregar._id, enc)}
                />
            )}

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>Asistencias</h1>
                <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>Registro y control de asistencias</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                    onClick={() => { setShowForm(v => !v); setFormError('') }}
                    className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-sm font-poppins text-white transition-all duration-200"
                    style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 14px rgba(103,37,119,0.35)' }}
                >
                    {showForm ? <><Ico.Close /> Cancelar</> : <><Ico.Plus /> Crear asistencia</>}
                </button>
                <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.bodyText, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}><Ico.Search /></span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por fecha o descripción..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-poppins rounded-xl border focus:outline-none transition-all"
                        style={{ backgroundColor: dark ? '#2d2b3e' : '#fff', borderColor: dark ? '#3d3b52' : '#d1d5db', color: dark ? '#e2e8f0' : '#1e293b' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                        onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                    />
                </div>
            </div>

            {/* Formulario crear */}
            {showForm && (
                <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: t.cardShadow, animation: 'slideDown 0.2s ease' }}>
                    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: t.titleText, margin: '0 0 16px 0' }}>Nueva asistencia</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.labelText, marginBottom: '6px' }}>Fecha</label>
                            <input type="date" value={formData.fecha} onChange={e => setFormData(f => ({ ...f, fecha: e.target.value }))} style={inputStyle()} onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }} onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.labelText, marginBottom: '6px' }}>Descripción</label>
                            <input type="text" placeholder="Ej: Reunión ordinaria semanal" value={formData.descripcion} onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))} style={inputStyle()} onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }} onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                        </div>
                    </div>
                    {formError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#EF4444', fontFamily: 'Poppins, sans-serif', fontSize: '12px', marginBottom: '14px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {formError}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleCreate} disabled={creating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--color-primary)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, boxShadow: '0 4px 14px rgba(103,37,119,0.28)' }}>
                            {creating ? <><Ico.Spinner /> Guardando…</> : 'Guardar asistencia'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '16px', boxShadow: t.cardShadow, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.tableBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Ico.Attendance /></span>
                        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: t.titleText }}>Listado de asistencias</span>
                    </div>
                    {!loading && (
                        <span style={{ backgroundColor: dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)', color: dark ? '#C8A8D8' : '#672577', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                            {filteredAsistencias.length} registro{filteredAsistencias.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['Fecha', 'Descripción', 'Resumen', 'Encargados', 'Acciones'].map((h, i) => (
                                    <th key={h} style={{ padding: '11px 16px', textAlign: i === 4 ? 'center' : 'left', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.tableHeadText, borderBottom: `1px solid ${t.tableBorder}`, whiteSpace: 'nowrap', width: i === 0 ? '130px' : i === 2 ? '120px' : i === 3 ? '170px' : i === 4 ? '130px' : 'auto' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonRows dark={dark} count={5} />
                            ) : filteredAsistencias.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico.Attendance /></div>
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', margin: 0 }}>{search ? 'No se encontraron resultados' : 'No se registraron asistencias'}</p>
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>{search ? 'Intenta con otra búsqueda' : 'Haz clic en "Crear asistencia" para comenzar'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAsistencias.map((a, i) => {
                                const isEven = i % 2 === 1
                                return (
                                    <tr
                                        key={a._id}
                                        style={{ backgroundColor: isEven ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                    >
                                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: t.labelText }}>
                                                <Ico.Calendar />
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827' }}>{formatDate(a.fecha)}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#374151' }}>{a.descripcion}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <ResumenBadge label="P" value={a.resumen?.presentes ?? 0} color="#10B981" />
                                                <ResumenBadge label="T" value={a.resumen?.tardanzas ?? 0} color="#F97316" />
                                                <ResumenBadge label="J" value={a.resumen?.justificados ?? 0} color="#F59E0B" />
                                                <ResumenBadge label="A" value={a.resumen?.ausentes ?? 0} color="#EF4444" />
                                            </div>
                                        </td>

                                        {/* ── Columna Encargados ── */}
                                        <td style={{ padding: '10px 16px' }}>
                                            <EncargadosCell
                                                encargados={a.encargados}
                                                dark={dark}
                                                onOpen={() => abrirGestion(a)}
                                            />
                                        </td>

                                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <ActionBtn color="#6B7280" hoverColor="#4B5563" bg={dark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'} title="Ver" onClick={() => router.push(`/panel/asistencias/${a._id}?mode=view`)}><Ico.Eye /></ActionBtn>
                                                <ActionBtn color="#3B82F6" hoverColor="#2563EB" bg={dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'} title="Editar" onClick={() => router.push(`/panel/asistencias/${a._id}?mode=edit`)}><Ico.Edit /></ActionBtn>
                                                <ActionBtn color="#EF4444" hoverColor="#DC2626" bg={dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'} title="Eliminar" onClick={() => setDeleteTarget(a)}><Ico.Trash /></ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredAsistencias.length > 0 && (
                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {filteredAsistencias.length} asistencia{filteredAsistencias.length !== 1 ? 's' : ''} registrada{filteredAsistencias.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin      { to { transform: rotate(360deg); } }
                @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes pulse     { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
            `}</style>
        </div>
    )
}

function ResumenBadge({ label, value, color }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', backgroundColor: `${color}18`, border: `1px solid ${color}40`, fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color, whiteSpace: 'nowrap' }}>
            {label} {value}
        </span>
    )
}

function ActionBtn({ children, color, hoverColor, bg, title, onClick }) {
    return (
        <button title={title} onClick={onClick} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.transform = 'scale(1)' }}
        >
            {children}
        </button>
    )
}