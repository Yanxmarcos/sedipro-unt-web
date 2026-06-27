// src/app/sedinvita/facilitador/evaluar/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const ESCALA = [
    { valor: 1, etiqueta: 'Malo' },
    { valor: 2, etiqueta: 'Regular' },
    { valor: 3, etiqueta: 'Bueno' },
    { valor: 4, etiqueta: 'Excelente' },
]

export default function EvaluarPage() {
    const router = useRouter()

    const [authLoading, setAuthLoading] = useState(true)
    const [authError, setAuthError] = useState(null) // null | 'revoked'
    const [facilitador, setFacilitador] = useState(null)
    const [grupos, setGrupos] = useState([])
    const [grupoId, setGrupoId] = useState(null)

    const [detalle, setDetalle] = useState(null) // { grupo, dinamicas, evaluaciones }
    const [loadingDetalle, setLoadingDetalle] = useState(false)
    const [postulanteId, setPostulanteId] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [showLogout, setShowLogout] = useState(false)

    useEffect(() => {
        async function verificar() {
            try {
                const res = await fetch('/api/sedinvita/facilitadores/verify')
                const data = await res.json()
                if (res.status === 403) { setAuthError('revoked'); return }
                if (!res.ok || !data?.user) { router.replace('/sedinvita/facilitador/login'); return }
                setFacilitador(data.user)
                setGrupos(data.grupos)
                if (data.grupos.length === 1) setGrupoId(data.grupos[0]._id)
            } catch {
                router.replace('/sedinvita/facilitador/login')
            } finally {
                setAuthLoading(false)
            }
        }
        verificar()
    }, [router])

    const fetchDetalle = useCallback(async (id) => {
        if (!id) return
        setLoadingDetalle(true)
        try {
            const res = await fetch(`/api/sedinvita/evaluaciones?grupoId=${id}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setDetalle(data)
            if (data.grupo.postulantes.length > 0 && !postulanteId) {
                setPostulanteId(data.grupo.postulantes[0]._id)
            }
        } catch {
            setFeedback({ type: 'error', msg: 'No se pudo cargar el grupo' })
        } finally {
            setLoadingDetalle(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => { if (grupoId) fetchDetalle(grupoId) }, [grupoId, fetchDetalle])

    useEffect(() => {
        if (!feedback) return
        const timer = setTimeout(() => setFeedback(null), 3500)
        return () => clearTimeout(timer)
    }, [feedback])

    async function handleLogout() {
        try { await fetch('/api/sedinvita/facilitadores/logout', { method: 'POST' }) } catch {}
        router.replace('/sedinvita/facilitador/login')
    }

    // FIX 2: Actualizar SOLO la evaluación localmente sin recargar
    async function guardarEvaluacion(dinamicaId, payload) {
        try {
            const res = await fetch('/api/sedinvita/evaluaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grupoId, postulanteId, dinamicaId, ...payload }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al guardar')
            
            setFeedback({ type: 'success', msg: 'Evaluación guardada ✓' })
            
            // FIX 2: Actualizar SOLO la evaluación en el estado local
            // Sin recargar todo, sin cambiar de postulante
            const evaluacionGuardada = data.data || data.evaluacion
            setDetalle(prev => {
                // Filtrar evaluaciones anteriores del mismo postulante y dinámica
                const evaluacionesActualizadas = prev.evaluaciones.filter(
                    e => !(e.postulanteId === postulanteId && e.dinamicaId === dinamicaId)
                )
                // Agregar la nueva evaluación
                return {
                    ...prev,
                    evaluaciones: [...evaluacionesActualizadas, evaluacionGuardada]
                }
            })
        } catch (err) {
            setFeedback({ type: 'error', msg: err.message })
        }
    }

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f5fa' }}>
                <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3" />
                    <path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (authError === 'revoked') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f5fa', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1F1030', margin: '0 0 10px 0' }}>Acceso revocado</h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                        Ya no tienes grupos asignados. Contacta a la directiva si crees que es un error.
                    </p>
                    <button onClick={handleLogout} style={{ padding: '11px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        )
    }

    // Selector de grupo si tiene más de uno
    if (!grupoId) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8f5fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: '#4A1A5E', marginBottom: '16px' }}>
                    Elige el grupo que vas a evaluar
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '380px' }}>
                    {grupos.map(g => (
                        <button key={g._id} onClick={() => setGrupoId(g._id)}
                            style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(214,182,223,0.55)', backgroundColor: '#fff', textAlign: 'left', cursor: 'pointer' }}>
                            <strong style={{ color: '#4A1A5E', fontSize: '14px' }}>{g.nombre || 'Grupo'}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>{g.turnoId?.nombre} · {g.postulantes.length} postulantes</p>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const feedbackColors = {
        success: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)', text: '#065F46' },
        error:   { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  text: '#991B1B' },
    }

    const postulantes = detalle?.grupo?.postulantes || []
    const dinamicas = detalle?.dinamicas || []
    const evaluaciones = detalle?.evaluaciones || []
    const evaluacionesPorClave = new Map(evaluaciones.map(e => [`${e.postulanteId}_${e.dinamicaId}`, e]))
    const postulanteActivo = postulantes.find(p => p._id === postulanteId)

    function evaluacionesCompletadas(pId) {
        return dinamicas.filter(d => evaluacionesPorClave.has(`${pId}_${d._id}`)).length
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f5fa', fontFamily: 'Poppins, sans-serif' }}>
            {showLogout && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) setShowLogout(false) }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '340px', width: '100%', textAlign: 'center' }}>
                        <p style={{ fontSize: '14px', color: '#1F1030', marginBottom: '20px' }}>¿Cerrar sesión?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowLogout(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleLogout} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Salir</button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{ backgroundColor: '#672577', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ color: '#fff' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', margin: 0 }}>{detalle?.grupo?.nombre || 'Mi grupo'}</p>
                    <p style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>{detalle?.grupo?.turnoId?.nombre} · {facilitador?.nombres} {facilitador?.apellidos}</p>
                </div>
                <button onClick={() => setShowLogout(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Salir
                </button>
            </header>

            {feedback && (
                <div style={{ margin: '10px 16px 0', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', backgroundColor: feedbackColors[feedback.type].bg, border: `1px solid ${feedbackColors[feedback.type].border}`, color: feedbackColors[feedback.type].text }}>
                    {feedback.msg}
                </div>
            )}

            {/* Selector de postulante: chips horizontales (mobile-first) */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '14px 16px', WebkitOverflowScrolling: 'touch' }}>
                {postulantes.map(p => {
                    const completadas = evaluacionesCompletadas(p._id)
                    const activo = p._id === postulanteId
                    return (
                        <button key={p._id} onClick={() => setPostulanteId(p._id)}
                            style={{
                                flexShrink: 0, padding: '8px 14px', borderRadius: '20px',
                                border: activo ? '2px solid #672577' : '1px solid rgba(214,182,223,0.55)',
                                backgroundColor: activo ? 'rgba(103,37,119,0.08)' : '#fff',
                                color: activo ? '#4A1A5E' : '#374151',
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                            {p.apellidos}, {p.nombres.split(' ')[0]}
                            <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.7 }}>{completadas}/{dinamicas.length}</span>
                        </button>
                    )
                })}
            </div>

            <main style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {loadingDetalle ? (
                    <p style={{ textAlign: 'center', color: '#9880B0', fontSize: '13px', padding: '40px 0' }}>Cargando…</p>
                ) : !postulanteActivo ? (
                    <p style={{ textAlign: 'center', color: '#9880B0', fontSize: '13px', padding: '40px 0' }}>No hay postulantes en este grupo</p>
                ) : dinamicas.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9880B0', fontSize: '13px', padding: '40px 0' }}>Aún no hay dinámicas configuradas para este turno</p>
                ) : (
                    dinamicas.map(d => (
                        <DinamicaCard
                            key={d._id}
                            dinamica={d}
                            evaluacionExistente={evaluacionesPorClave.get(`${postulanteId}_${d._id}`)}
                            onGuardar={(payload) => guardarEvaluacion(d._id, payload)}
                        />
                    ))
                )}
            </main>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

function DinamicaCard({ dinamica, evaluacionExistente, onGuardar }) {
    const inicial = Object.fromEntries(
        dinamica.competencias.map(c => [c, evaluacionExistente?.puntajes?.find(p => p.competencia === c)?.puntaje || 0])
    )
    const [puntajes, setPuntajes] = useState(inicial)
    const [comentario, setComentario] = useState(evaluacionExistente?.comentario || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setPuntajes(Object.fromEntries(dinamica.competencias.map(c => [c, evaluacionExistente?.puntajes?.find(p => p.competencia === c)?.puntaje || 0])))
        setComentario(evaluacionExistente?.comentario || '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evaluacionExistente, dinamica._id])

    const completo = dinamica.competencias.every(c => puntajes[c] > 0)

    async function handleGuardar() {
        setSaving(true)
        await onGuardar({
            puntajes: dinamica.competencias.map(c => ({ competencia: c, puntaje: puntajes[c] })),
            comentario,
            // Backend ignora esto si viene de facilitador, pero lo mandamos vacío de todas formas
            opinionInfiltrado: '',
        })
        setSaving(false)
    }

    // FIX 1: Toggle de puntajes - poder deseleccionar
    function togglePuntaje(competencia, valor) {
        setPuntajes(prev => ({
            ...prev,
            [competencia]: prev[competencia] === valor ? 0 : valor
        }))
    }

    return (
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(103,37,119,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: '#4A1A5E', margin: 0 }}>{dinamica.nombre}</p>
                {evaluacionExistente && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: 'rgba(34,197,94,0.10)', padding: '2px 8px', borderRadius: '8px' }}>Guardado ✓</span>
                )}
            </div>

            {dinamica.competencias.map(c => (
                <div key={c} style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#4A1A5E', marginBottom: '6px' }}>{c}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {ESCALA.map(opt => {
                            const activo = puntajes[c] === opt.valor
                            return (
                                <button 
                                    key={opt.valor} 
                                    onClick={() => togglePuntaje(c, opt.valor)}
                                    style={{
                                        padding: '8px 4px', borderRadius: '8px',
                                        border: activo ? '2px solid #672577' : '1px solid #e5d9ef',
                                        backgroundColor: activo ? 'rgba(103,37,119,0.10)' : '#f9f6fb',
                                        color: activo ? '#4A1A5E' : '#6B7280',
                                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s ease-in-out',
                                    }}>
                                    {opt.valor} · {opt.etiqueta}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4A1A5E', display: 'block', marginBottom: '4px' }}>Comentario adicional</label>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e5d9ef', fontSize: '12px', fontFamily: 'Poppins, sans-serif', resize: 'vertical' }} />
            </div>

            <button onClick={handleGuardar} disabled={!completo || saving}
                style={{
                    width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                    backgroundColor: !completo || saving ? '#E5E7EB' : '#672577',
                    color: !completo || saving ? '#9CA3AF' : '#fff',
                    fontSize: '13px', fontWeight: 700, cursor: !completo || saving ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                }}>
                {saving ? 'Guardando…' : 'Guardar evaluación'}
            </button>
        </div>
    )
}