// src/app/panel/sedinvita/evaluacion/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'

const ESCALA = [
    { valor: 1, etiqueta: 'Malo' },
    { valor: 2, etiqueta: 'Regular' },
    { valor: 3, etiqueta: 'Bueno' },
    { valor: 4, etiqueta: 'Excelente' },
]

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

    const [resumen, setResumen] = useState([])
    const [loadingResumen, setLoadingResumen] = useState(true)
    const [error, setError] = useState(null)

    const [grupoId, setGrupoId] = useState(null)
    const [detalle, setDetalle] = useState(null)
    const [loadingDetalle, setLoadingDetalle] = useState(false)
    const [editando, setEditando] = useState(null) // { postulante, dinamica, evaluacion }
    const [eliminando, setEliminando] = useState(null) // { postulante, dinamica, evaluacion }
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)

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

    const fetchResumen = useCallback(async (id) => {
        if (!id) { setResumen([]); setLoadingResumen(false); return }
        setLoadingResumen(true)
        try {
            const res = await fetch(`/api/sedinvita/evaluaciones/resumen?turnoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setResumen(json.data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoadingResumen(false)
        }
    }, [])

    const fetchDetalle = useCallback(async (id) => {
        if (!id) return
        setLoadingDetalle(true)
        try {
            const res = await fetch(`/api/sedinvita/evaluaciones?grupoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setDetalle(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoadingDetalle(false)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            const activa = await fetchEdicionActiva()
            if (activa) await fetchTurnos(activa._id, faseFilter)
            else setLoadingResumen(false)
        }
        init()
    }, [fetchEdicionActiva, fetchTurnos, faseFilter])

    useEffect(() => { fetchResumen(turnoId); setGrupoId(null); setDetalle(null) }, [turnoId, fetchResumen])
    useEffect(() => { if (grupoId) fetchDetalle(grupoId) }, [grupoId, fetchDetalle])

    async function guardarCorreccion(payload) {
        try {
            const res = await fetch(`/api/sedinvita/evaluaciones/${editando.evaluacion._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setEditando(null)
            fetchDetalle(grupoId)
            fetchResumen(turnoId)
            setMensajeConfirmacion('Evaluación actualizada correctamente')
            setTimeout(() => setMensajeConfirmacion(null), 3000)
        } catch (err) {
            alert(err.message)
        }
    }

    async function eliminarEvaluacion(evaluacionId) {
        if (!confirm('¿Estás seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) return

        try {
            const res = await fetch(`/api/sedinvita/evaluaciones/${evaluacionId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            
            setEliminando(null)
            fetchDetalle(grupoId)
            fetchResumen(turnoId)
            setMensajeConfirmacion('Evaluación eliminada correctamente')
            setTimeout(() => setMensajeConfirmacion(null), 3000)
        } catch (err) {
            alert('Error al eliminar: ' + err.message)
        }
    }

    const copiarLink = () => {
        const link = `${window.location.origin}/sedinvita/facilitador/login`
        navigator.clipboard?.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function secondaryBtnStyle(t) {
        return {
            padding: '7px 14px', borderRadius: '8px', border: `1px solid ${t.cardBorder}`,
            backgroundColor: 'transparent', color: t.bodyText,
            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s'
        }
    }
    const [copied, setCopied] = useState(false)

    return (
        <div style={{ minHeight: '100%', padding: '20px 16px', backgroundColor: t.pageBg, fontFamily: 'Poppins, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0 }}>Evaluación</h1>
                <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                    Supervisión de avance por grupo · {edicionActiva ? `${edicionActiva.nombre} (${edicionActiva.anio})` : ''}
                </p>
            </div>

            {mensajeConfirmacion && (
                <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: dark ? 'rgba(34,197,94,0.15)' : '#ecfdf5', 
                    color: '#065f46', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '13px',
                    border: '1px solid #6ee7b7'
                }}>
                    {mensajeConfirmacion}
                </div>
            )}

            {error && <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select value={faseFilter} onChange={e => setFaseFilter(e.target.value)} style={selectStyle(t, dark)}>
                    {fases.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
                <select value={turnoId} onChange={e => setTurnoId(e.target.value)} style={selectStyle(t, dark)}>
                    {turnos.length === 0 && <option value="">Sin turnos</option>}
                    {turnos.map(tn => <option key={tn._id} value={tn._id}>{tn.nombre}</option>)}
                </select>
                <button onClick={copiarLink} style={secondaryBtnStyle(t)}>
                    {copied ? 'Copiado' : 'Copiar link'}
                </button>
            </div>

            {/* Tarjetas de grupos con % */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {loadingResumen ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ height: '90px', borderRadius: '14px', backgroundColor: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.05)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                    ))
                ) : resumen.length === 0 ? (
                    <p style={{ fontSize: '13px', color: t.dividerText, gridColumn: '1/-1', textAlign: 'center', padding: '24px' }}>No hay grupos para este turno</p>
                ) : (
                    resumen.map(g => (
                        <button key={g._id} onClick={() => setGrupoId(g._id)}
                            style={{
                                textAlign: 'left', padding: '14px', borderRadius: '14px', cursor: 'pointer',
                                border: grupoId === g._id ? '2px solid #672577' : `1px solid ${t.cardBorder}`,
                                backgroundColor: t.cardBg,
                            }}>
                            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px', color: t.titleText, margin: 0 }}>{g.nombre || 'Grupo'}</p>
                            <p style={{ fontSize: '11px', color: t.bodyText, margin: '2px 0 8px 0' }}>
                                {g.facilitadores?.length
                                    ? g.facilitadores.map(f => `${f.nombres} ${f.apellidos}`).join(', ')
                                    : 'Sin facilitador'} · {g.totalPostulantes} postulantes
                            </p>
                            <div style={{ height: '6px', borderRadius: '4px', backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#eee', overflow: 'hidden' }}>
                                <div style={{ width: `${g.porcentaje}%`, height: '100%', backgroundColor: g.porcentaje === 100 ? '#16a34a' : '#672577' }} />
                            </div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: g.porcentaje === 100 ? '#16a34a' : t.bodyText, margin: '6px 0 0 0' }}>
                                {g.completadas}/{g.totalDinamicas * g.totalPostulantes} evaluaciones · {g.porcentaje}%
                            </p>
                        </button>
                    ))
                )}
            </div>

            {/* Matriz de detalle */}
            {grupoId && (
                <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', overflow: 'hidden', boxShadow: t.cardShadow }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ backgroundColor: t.tableHead }}>
                                    <th style={thStyle(t)}>Postulante</th>
                                    {(detalle?.dinamicas || []).map(d => (
                                        <th key={d._id} style={thStyle(t)}>{d.nombre}</th>
                                    ))}
                                    {/* ⭐ NUEVA COLUMNA: Total */}
                                    <th style={{ ...thStyle(t), textAlign: 'center' }}>Total</th>
                                    <th style={{ ...thStyle(t), textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingDetalle ? (
                                    <tr><td colSpan={99} style={{ padding: '30px', textAlign: 'center', color: t.dividerText }}>Cargando…</td></tr>
                                ) : (
                                    (detalle?.grupo?.postulantes || []).map((p, i) => {
                                        // ⭐ Calcular total de puntos para este postulante
                                        const evaluacionesPostulante = (detalle?.evaluaciones || []).filter(e => e.postulanteId === p._id)
                                        const totalPuntos = evaluacionesPostulante.reduce((sum, ev) => {
                                            const suma = ev.puntajes.reduce((s, x) => s + x.puntaje, 0)
                                            return sum + suma
                                        }, 0)

                                        return (
                                            <tr key={p._id} style={{ backgroundColor: i % 2 ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}` }}>
                                                <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827', whiteSpace: 'nowrap' }}>
                                                    {p.apellidos}, {p.nombres}
                                                </td>
                                                {(detalle?.dinamicas || []).map(d => {
                                                    const ev = (detalle?.evaluaciones || []).find(e => e.postulanteId === p._id && e.dinamicaId === d._id)
                                                    const suma = ev ? ev.puntajes.reduce((s, x) => s + x.puntaje, 0) : null
                                                    return (
                                                        <td key={d._id} style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => setEditando({ postulante: p, dinamica: d, evaluacion: ev || null })}
                                                                style={{
                                                                    padding: '4px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                                    fontSize: '12px', fontWeight: 700,
                                                                    color: ev ? '#16a34a' : t.dividerText,
                                                                    backgroundColor: ev ? (dark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)') : (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'),
                                                                }}>
                                                                {ev ? `${suma}/12` : '—'}
                                                            </button>
                                                        </td>
                                                    )
                                                })}
                                                {/* ⭐ NUEVA COLUMNA: Total de puntos */}
                                                <td style={{ 
                                                    padding: '10px 14px', 
                                                    textAlign: 'center', 
                                                    fontWeight: 700, 
                                                    fontSize: '14px',
                                                    color: totalPuntos > 0 ? '#672577' : t.dividerText,
                                                    backgroundColor: totalPuntos > 0 ? (dark ? 'rgba(103,37,119,0.08)' : 'rgba(103,37,119,0.04)') : 'transparent',
                                                    borderRadius: '4px'
                                                }}>
                                                    {totalPuntos > 0 ? totalPuntos : '—'}
                                                </td>
                                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            const ev = (detalle?.evaluaciones || []).find(e => e.postulanteId === p._id)
                                                            if (ev) {
                                                                setEliminando({ postulante: p, evaluacion: ev })
                                                            }
                                                        }}
                                                        disabled={!detalle?.evaluaciones?.some(e => e.postulanteId === p._id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: detalle?.evaluaciones?.some(e => e.postulanteId === p._id) ? 'pointer' : 'not-allowed',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            color: '#fff',
                                                            backgroundColor: detalle?.evaluaciones?.some(e => e.postulanteId === p._id) ? '#dc2626' : '#9ca3af',
                                                            opacity: detalle?.evaluaciones?.some(e => e.postulanteId === p._id) ? 1 : 0.5,
                                                        }}>
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {editando && (
                <CorreccionModal t={t} dark={dark} editando={editando} onClose={() => setEditando(null)} onGuardar={guardarCorreccion} />
            )}

            {eliminando && (
                <EliminarModal 
                    t={t} 
                    dark={dark} 
                    postulante={eliminando.postulante} 
                    evaluacion={eliminando.evaluacion}
                    onClose={() => setEliminando(null)} 
                    onEliminar={eliminarEvaluacion} 
                />
            )}

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
        </div>
    )
}

function CorreccionModal({ t, dark, editando, onClose, onGuardar }) {
    const { postulante, dinamica, evaluacion } = editando
    const [puntajes, setPuntajes] = useState(
        Object.fromEntries(dinamica.competencias.map(c => [c, evaluacion?.puntajes?.find(p => p.competencia === c)?.puntaje || 0]))
    )
    const [comentario, setComentario] = useState(evaluacion?.comentario || '')
    const [opinionInfiltrado, setOpinionInfiltrado] = useState(evaluacion?.opinionInfiltrado || '')

    const completo = dinamica.competencias.every(c => puntajes[c] > 0)

    if (!evaluacion) {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
                <div style={{ backgroundColor: t.modalBg, borderRadius: '16px', padding: '24px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: t.bodyText, marginBottom: '16px' }}>
                        {postulante.apellidos}, {postulante.nombres} aún no tiene evaluación registrada en <strong>{dinamica.nombre}</strong>. Solo se pueden corregir evaluaciones ya enviadas por el facilitador.
                    </p>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#672577', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Entendido</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div style={{ backgroundColor: t.modalBg, borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${t.cardBorder}` }}>
                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 700, color: t.titleText, margin: '0 0 4px 0' }}>{dinamica.nombre}</h2>
                <p style={{ fontSize: '12px', color: t.bodyText, margin: '0 0 16px 0' }}>{postulante.apellidos}, {postulante.nombres} · corrección administrativa</p>

                {dinamica.competencias.map(c => (
                    <div key={c} style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: t.titleText, marginBottom: '6px' }}>{c}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {ESCALA.map(opt => {
                                const activo = puntajes[c] === opt.valor
                                return (
                                    <button key={opt.valor} onClick={() => setPuntajes(prev => ({ ...prev, [c]: opt.valor }))}
                                        style={{
                                            padding: '7px 4px', borderRadius: '8px',
                                            border: activo ? '2px solid #672577' : `1px solid ${t.inputBorder}`,
                                            backgroundColor: activo ? 'rgba(103,37,119,0.10)' : 'transparent',
                                            color: activo ? t.titleText : t.bodyText,
                                            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                        }}>
                                        {opt.valor} · {opt.etiqueta}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: t.titleText, display: 'block', marginBottom: '4px' }}>Opinión del infiltrado</label>
                    <textarea value={opinionInfiltrado} onChange={e => setOpinionInfiltrado(e.target.value)} rows={2}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, fontSize: '12px', fontFamily: 'Poppins, sans-serif', resize: 'vertical', backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: t.titleText, display: 'block', marginBottom: '4px' }}>Comentario adicional</label>
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, fontSize: '12px', fontFamily: 'Poppins, sans-serif', resize: 'vertical', backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: 'transparent', color: t.bodyText, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                    <button
                        disabled={!completo}
                        onClick={() => onGuardar({ puntajes: dinamica.competencias.map(c => ({ competencia: c, puntaje: puntajes[c] })), comentario, opinionInfiltrado })}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: completo ? '#672577' : '#D1D5DB', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: completo ? 'pointer' : 'not-allowed' }}>
                        Guardar corrección
                    </button>
                </div>
            </div>
        </div>
    )
}

function EliminarModal({ t, dark, postulante, evaluacion, onClose, onEliminar }) {
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div style={{ backgroundColor: t.modalBg, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', border: `1px solid ${t.cardBorder}` }}>
                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 700, color: '#dc2626', margin: '0 0 8px 0' }}>
                    Eliminar evaluación
                </h2>
                <p style={{ fontSize: '13px', color: t.bodyText, marginBottom: '16px' }}>
                    ¿Estás seguro de eliminar la evaluación de <strong>{postulante.apellidos}, {postulante.nombres}</strong>?
                    <br /><br />
                    Esta acción eliminará permanentemente el registro de la base de datos y no se puede deshacer.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: 'transparent', color: t.bodyText, fontSize: '13px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button onClick={() => onEliminar(evaluacion._id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}

function selectStyle(t, dark) {
    return { padding: '6px 24px 6px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
}

function thStyle(t) {
    return { padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: t.tableHeadText, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${t.tableBorder}`, whiteSpace: 'nowrap' }
}

function getTheme(dark) {
    return {
        pageBg: dark ? '#0E0818' : '#f8f5fa',
        cardBg: dark ? '#160C22' : '#ffffff',
        cardBorder: dark ? 'rgba(103,37,119,0.28)' : 'rgba(214,182,223,0.55)',
        cardShadow: dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(103,37,119,0.10)',
        inputBorder: dark ? 'rgba(103,37,119,0.35)' : '#e5d9ef',
        inputText: dark ? '#EAD8F5' : '#111827',
        bodyText: dark ? '#9880B0' : '#6B7280',
        tableHead: dark ? '#1A0D2E' : '#f5f0f9',
        tableHeadText: dark ? '#C8A8D8' : '#4A1A5E',
        tableRow: dark ? '#160C22' : '#ffffff',
        tableRowAlt: dark ? '#1A0D2B' : '#faf7fc',
        tableBorder: dark ? 'rgba(103,37,119,0.16)' : 'rgba(214,182,223,0.45)',
        dividerText: dark ? '#6B5080' : '#c4aed4',
        titleText: dark ? '#EAD8F5' : '#4A1A5E',
        modalBg: dark ? '#1A0D2E' : '#ffffff',
        overlayBg: 'rgba(0,0,0,0.55)',
    }
}