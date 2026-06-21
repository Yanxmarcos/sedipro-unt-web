// src/app/panel/sedinvita/dinamicas/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'

const COMPETENCIA_VACIA = ['', '', '']

export default function Page() {
    const [dark, setDark] = useState(false)
    const t = getTheme(dark)

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

    const fases = ['fase2', 'fase3', 'fase4']

    const [edicionActiva, setEdicionActiva] = useState(null)
    const [faseFilter, setFaseFilter] = useState('fase2')
    const [turnos, setTurnos] = useState([])
    const [turnoId, setTurnoId] = useState('')

    const [dinamicas, setDinamicas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null) // dinámica o null (crear)
    const [form, setForm] = useState({ nombre: '', descripcion: '', competencias: COMPETENCIA_VACIA, orden: 0 })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState(null)

    const fetchEdicionActiva = useCallback(async () => {
        try {
            const res = await fetch('/api/sedinvita/ediciones', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            const activa = (json.data || []).find(e => e.activa === true)
            setEdicionActiva(activa || null)
            return activa
        } catch (err) {
            setError(err.message)
            return null
        }
    }, [])

    const fetchTurnos = useCallback(async (edicionId, fase) => {
        if (!edicionId) return
        try {
            const res = await fetch(`/api/sedinvita/turnos?edicionId=${edicionId}&fase=${fase}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setTurnos(json.data || [])
            setTurnoId(prev => (json.data || []).some(x => x._id === prev) ? prev : (json.data?.[0]?._id || ''))
        } catch (err) {
            setError(err.message)
        }
    }, [])

    const fetchDinamicas = useCallback(async (id) => {
        if (!id) { setDinamicas([]); setLoading(false); return }
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/sedinvita/dinamicas?turnoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setDinamicas(json.data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            const activa = await fetchEdicionActiva()
            if (activa) await fetchTurnos(activa._id, faseFilter)
            else setLoading(false)
        }
        init()
    }, [fetchEdicionActiva, fetchTurnos, faseFilter])

    useEffect(() => { fetchDinamicas(turnoId) }, [turnoId, fetchDinamicas])

    function abrirCrear() {
        setEditing(null)
        setForm({ nombre: '', descripcion: '', competencias: COMPETENCIA_VACIA, orden: dinamicas.length })
        setFormError(null)
        setShowModal(true)
    }

    function abrirEditar(d) {
        setEditing(d)
        setForm({
            nombre: d.nombre,
            descripcion: d.descripcion || '',
            competencias: [d.competencias[0] || '', d.competencias[1] || '', d.competencias[2] || ''],
            orden: d.orden || 0,
        })
        setFormError(null)
        setShowModal(true)
    }

    async function guardar() {
        setFormError(null)
        const competenciasLimpias = form.competencias.map(c => c.trim()).filter(Boolean)
        if (!form.nombre.trim()) { setFormError('El nombre es requerido'); return }
        if (competenciasLimpias.length !== 3) { setFormError('Debes indicar exactamente tres competencias'); return }

        setSaving(true)
        try {
            const body = {
                edicionId: edicionActiva._id,
                turnoId,
                nombre: form.nombre.trim(),
                descripcion: form.descripcion.trim(),
                competencias: competenciasLimpias,
                orden: Number(form.orden) || 0,
            }
            const res = editing
                ? await fetch(`/api/sedinvita/dinamicas/${editing._id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify(body),
                })
                : await fetch('/api/sedinvita/dinamicas', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify(body),
                })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al guardar')
            setShowModal(false)
            fetchDinamicas(turnoId)
        } catch (err) {
            setFormError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function eliminar(d) {
        if (!confirm(`¿Eliminar la dinámica "${d.nombre}"? Esta acción no se puede deshacer.`)) return
        try {
            const res = await fetch(`/api/sedinvita/dinamicas/${d._id}`, { method: 'DELETE', credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            fetchDinamicas(turnoId)
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div style={{ minHeight: '100%', padding: '20px 16px', backgroundColor: t.pageBg, fontFamily: 'Poppins, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0 }}>Dinámicas</h1>
                    <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                        Cada dinámica evalúa exactamente tres competencias · {edicionActiva ? `${edicionActiva.nombre} (${edicionActiva.anio})` : ''}
                    </p>
                </div>
                <button onClick={abrirCrear} disabled={!turnoId} style={primaryBtnStyle(!turnoId)}>
                    + Nueva dinámica
                </button>
            </div>

            {error && <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select value={faseFilter} onChange={e => setFaseFilter(e.target.value)} style={selectStyle(t, dark)}>
                    {fases.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
                <select value={turnoId} onChange={e => setTurnoId(e.target.value)} style={selectStyle(t, dark)}>
                    {turnos.length === 0 && <option value="">Sin turnos</option>}
                    {turnos.map(tn => <option key={tn._id} value={tn._id}>{tn.nombre}</option>)}
                </select>
            </div>

            {/* Listado de dinámicas como tarjetas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ height: '150px', borderRadius: '14px', backgroundColor: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.05)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                    ))
                ) : dinamicas.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 20px', color: t.dividerText, fontSize: '13px', backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px' }}>
                        {turnoId ? 'Aún no hay dinámicas para este turno' : 'Selecciona un turno'}
                    </div>
                ) : (
                    dinamicas.map(d => (
                        <div key={d._id} style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '16px', boxShadow: t.cardShadow }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: t.titleText, margin: 0 }}>{d.nombre}</p>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: t.bodyText, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', padding: '2px 8px', borderRadius: '8px' }}>#{d.orden}</span>
                            </div>
                            {d.descripcion && <p style={{ fontSize: '12px', color: t.bodyText, margin: '0 0 10px 0' }}>{d.descripcion}</p>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                                {d.competencias.map((c, i) => (
                                    <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', backgroundColor: dark ? 'rgba(37,99,235,0.16)' : 'rgba(37,99,235,0.08)', padding: '3px 9px', borderRadius: '8px', display: 'inline-block', width: 'fit-content' }}>
                                        {c}
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => abrirEditar(d)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: '#E0E7FF', color: '#3730A3', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                                <button onClick={() => eliminar(d)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div style={{ backgroundColor: t.modalBg, borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${t.cardBorder}` }}>
                        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '17px', fontWeight: 700, color: t.titleText, margin: '0 0 16px 0' }}>
                            {editing ? 'Editar dinámica' : 'Nueva dinámica'}
                        </h2>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle(t)}>Nombre</label>
                            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: La Torre Humana" style={inputStyle(t, dark)} />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle(t)}>Descripción (opcional)</label>
                            <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} style={{ ...inputStyle(t, dark), resize: 'vertical' }} />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle(t)}>Competencias (exactamente 3)</label>
                            {[0, 1, 2].map(i => (
                                <input
                                    key={i}
                                    value={form.competencias[i]}
                                    onChange={e => setForm(f => {
                                        const nuevas = [...f.competencias]
                                        nuevas[i] = e.target.value
                                        return { ...f, competencias: nuevas }
                                    })}
                                    placeholder={`Competencia ${i + 1}`}
                                    style={{ ...inputStyle(t, dark), marginBottom: '8px' }}
                                />
                            ))}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle(t)}>Orden</label>
                            <input type="number" value={form.orden} onChange={e => setForm(f => ({ ...f, orden: e.target.value }))} style={inputStyle(t, dark)} />
                        </div>

                        {formError && (
                            <div style={{ padding: '10px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
                                {formError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: 'transparent', color: t.bodyText, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={guardar} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: saving ? '#D1D5DB' : '#672577', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
        </div>
    )
}

function selectStyle(t, dark) {
    return { padding: '6px 24px 6px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
}
function inputStyle(t, dark) {
    return { width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif' }
}
function labelStyle(t) {
    return { fontSize: '12px', fontWeight: 600, color: t.titleText, display: 'block', marginBottom: '5px' }
}
const primaryBtnStyle = (disabled) => ({
    padding: '9px 16px', borderRadius: '10px', border: 'none',
    backgroundColor: disabled ? '#D1D5DB' : '#672577', color: '#fff',
    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
})

function getTheme(dark) {
    return {
        pageBg: dark ? '#0E0818' : '#f8f5fa',
        cardBg: dark ? '#160C22' : '#ffffff',
        cardBorder: dark ? 'rgba(103,37,119,0.28)' : 'rgba(214,182,223,0.55)',
        cardShadow: dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(103,37,119,0.10)',
        inputBorder: dark ? 'rgba(103,37,119,0.35)' : '#e5d9ef',
        inputText: dark ? '#EAD8F5' : '#111827',
        bodyText: dark ? '#9880B0' : '#6B7280',
        dividerText: dark ? '#6B5080' : '#c4aed4',
        titleText: dark ? '#EAD8F5' : '#4A1A5E',
        modalBg: dark ? '#1A0D2E' : '#ffffff',
        overlayBg: 'rgba(0,0,0,0.55)',
    }
}