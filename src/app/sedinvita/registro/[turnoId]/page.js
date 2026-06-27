// src/app/sedinvita/registro/[turnoId]/page.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

const Ico = {
    Check: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    IdCard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    ),
    Logout: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Spinner: () => (
        <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    Attendance: () => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    Lock: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    Search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    User: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Group: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Present: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    Late: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
}

export default function RegistroTurnoPage() {
    const router = useRouter()
    const params = useParams()
    const turnoId = params?.turnoId

    const [encargado, setEncargado] = useState(null)
    const [turno, setTurno] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [authError, setAuthError] = useState(null)
    const [codigo, setCodigo] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [registrados, setRegistrados] = useState([])
    const [showLogout, setShowLogout] = useState(false)
    
    // Nuevos estados
    const [postulanteEncontrado, setPostulanteEncontrado] = useState(null)
    const [buscando, setBuscando] = useState(false)
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('presente')
    const [codigoBuscado, setCodigoBuscado] = useState('')

    const inputRef = useRef(null)

    useEffect(() => {
        async function verificar() {
            try {
                const res = await fetch('/api/sedinvita/encargados-asistencia/verify')
                const data = await res.json()

                if (res.status === 403) { setAuthError('revoked'); return }
                if (!res.ok || !data?.user) { router.replace('/sedinvita/login'); return }

                const miTurno = (data.turnos || []).find(t => t._id === turnoId)
                if (!miTurno) { setAuthError('wrong_turno'); return }

                setEncargado(data.user)
                setTurno(miTurno)
            } catch {
                router.replace('/sedinvita/login')
            } finally {
                setAuthLoading(false)
            }
        }
        verificar()
    }, [router, turnoId])

    useEffect(() => {
        if (!authLoading && !authError && inputRef.current) inputRef.current.focus()
    }, [authLoading, authError])

    useEffect(() => {
        if (!feedback) return
        const timer = setTimeout(() => setFeedback(null), 4500)
        return () => clearTimeout(timer)
    }, [feedback])

    // Función para buscar postulante al presionar el botón
    async function handleBuscar() {
        const codigoClean = codigo.trim()
        if (!codigoClean || codigoClean.length !== 10) {
            setFeedback({ type: 'warn', msg: 'Ingresa un código de matrícula de 10 dígitos' })
            return
        }

        setBuscando(true)
        setPostulanteEncontrado(null)
        setFeedback(null)

        try {
            const res = await fetch(`/api/sedinvita/registro/${turnoId}?codigo=${encodeURIComponent(codigoClean)}`)
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 404) {
                    setFeedback({ type: 'warn', msg: 'No se encontró postulante con ese código' })
                } else if (res.status === 400) {
                    setFeedback({ type: 'warn', msg: data.message || 'El postulante no pertenece a este turno' })
                } else if (res.status === 401 || res.status === 403) {
                    setAuthError('revoked')
                    return
                } else {
                    setFeedback({ type: 'error', msg: data.message || 'Error al buscar postulante' })
                }
                setBuscando(false)
                return
            }

            if (data.success && data.postulante) {
                setPostulanteEncontrado(data.postulante)
                setCodigoBuscado(codigoClean)
                // Si ya tiene asistencia, seleccionar ese estado
                if (data.asistencia) {
                    setEstadoSeleccionado(data.asistencia.estado)
                } else {
                    setEstadoSeleccionado('presente')
                }
                setFeedback({ type: 'success', msg: `Postulante encontrado: ${data.postulante.nombres} ${data.postulante.apellidos}` })
            }
        } catch (error) {
            console.error('Error al buscar postulante:', error)
            setFeedback({ type: 'error', msg: 'Error de conexión al buscar postulante' })
        } finally {
            setBuscando(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        if (!postulanteEncontrado) {
            setFeedback({ type: 'warn', msg: 'Primero busca un postulante válido' })
            return
        }

        setSubmitting(true)
        setFeedback(null)

        try {
            const res = await fetch(`/api/sedinvita/registro/${turnoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    codigoMatricula: codigoBuscado,
                    estado: estadoSeleccionado
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) { setAuthError('revoked'); return }
                setFeedback({ type: 'error', msg: data.message || 'Error al registrar' })
                return
            }

            if (data.yaRegistrado) {
                setFeedback({ type: 'warn', msg: data.message })
                // Actualizar el estado en la lista si cambió
                if (data.estadoActual) {
                    setRegistrados(prev => {
                        const index = prev.findIndex(r => r.codigo === codigoBuscado)
                        if (index !== -1) {
                            const newList = [...prev]
                            newList[index] = {
                                ...newList[index],
                                estado: data.estadoActual,
                            }
                            return newList
                        }
                        return prev
                    })
                }
                setPostulanteEncontrado(null)
                setCodigo('')
                setCodigoBuscado('')
                setTimeout(() => inputRef.current?.focus(), 50)
                return
            }

            setFeedback({ type: 'success', msg: data.message })
            
            // Agregar a la lista de registrados
            const nuevoRegistro = {
                nombre: `${data.postulante.nombres} ${data.postulante.apellidos}`,
                codigo: data.postulante.codigoMatricula,
                grupo: data.postulante.grupo || null,
                estado: data.estadoActual || estadoSeleccionado,
                hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
            }
            
            setRegistrados(prev => [nuevoRegistro, ...prev])
            setPostulanteEncontrado(null)
            setCodigo('')
            setCodigoBuscado('')
            setEstadoSeleccionado('presente')
            
        } catch {
            setFeedback({ type: 'error', msg: 'Error de conexión. Intenta de nuevo.' })
        } finally {
            setSubmitting(false)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }

    async function handleLogout() {
        try { await fetch('/api/sedinvita/encargados-asistencia/logout', { method: 'POST' }) } catch {}
        router.replace('/sedinvita/login')
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
                    <div style={{ color: '#EF4444', opacity: 0.5, marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><Ico.Lock /></div>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1F1030', margin: '0 0 10px 0' }}>Acceso revocado</h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                        Ya no eres encargado de este turno. Tu sesión ha sido revocada. Contacta a la directiva si crees que es un error.
                    </p>
                    <button onClick={handleLogout} style={{ padding: '11px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.30)' }}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        )
    }

    if (authError === 'wrong_turno') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f5fa', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <div style={{ color: 'rgba(103,37,119,0.30)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><Ico.Lock /></div>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: '#4A1A5E', margin: '0 0 10px 0' }}>Acceso no permitido</h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                        Solo puedes registrar asistencia en el turno que te fue asignado.
                    </p>
                    <button onClick={() => router.replace('/sedinvita/login')} style={{ padding: '11px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #672577, #3454A1)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(103,37,119,0.30)' }}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        )
    }

    const feedbackColors = {
        success: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)', text: '#065F46', icon: '#10B981' },
        warn:    { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', text: '#92400E', icon: '#F59E0B' },
        error:   { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  text: '#991B1B', icon: '#EF4444' },
    }

    const codigoLength = codigo.replace(/\D/g, '').length
    const isValidLength = codigoLength === 10

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f5fa', fontFamily: 'Poppins, sans-serif' }}>

            {showLogout && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={e => { if (e.target === e.currentTarget) setShowLogout(false) }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '340px', width: '100%', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#1F1030', marginBottom: '20px' }}>¿Cerrar sesión?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowLogout(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#374151', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleLogout} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Salir</button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{ backgroundColor: '#672577', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                    <Ico.Attendance />
                    <div>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', margin: 0 }}>{turno?.nombre || 'Turno'}</p>
                        <p style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>{encargado?.nombres} {encargado?.apellidos}</p>
                    </div>
                </div>
                <button onClick={() => setShowLogout(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    <Ico.Logout /> Salir
                </button>
            </header>

            <main style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{ backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(103,37,119,0.07)' }}>
                    {feedback && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
                            backgroundColor: feedbackColors[feedback.type].bg,
                            border: `1px solid ${feedbackColors[feedback.type].border}`,
                            color: feedbackColors[feedback.type].text,
                            animation: 'fadeIn 0.2s ease',
                        }}>
                            <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{feedback.msg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#4A1A5E' }}>
                                <Ico.IdCard /> Código de matrícula
                            </label>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: isValidLength ? '#10B981' : codigoLength > 0 ? '#EF4444' : '#9CA3AF',
                                transition: 'color 0.2s ease'
                            }}>
                                {codigoLength}/10
                            </span>
                        </div>

                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: `2px solid ${
                                isValidLength 
                                    ? '#10B981' 
                                    : codigoLength > 0 
                                        ? '#EF4444' 
                                        : '#e5d9ef'
                            }`,
                            transition: 'border-color 0.2s ease',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                padding: '0 8px',
                                flex: 1,
                            }}>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const digit = codigo[i] || ''
                                    const isFilled = digit !== ''
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                width: '28px',
                                                height: '48px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                color: isFilled ? '#1F1030' : '#D1D5DB',
                                                borderBottom: `2px solid ${
                                                    isFilled 
                                                        ? isValidLength 
                                                            ? '#10B981' 
                                                            : '#EF4444'
                                                        : '#E5E7EB'
                                                }`,
                                                transition: 'all 0.15s ease',
                                                background: isFilled ? 'rgba(103,37,119,0.04)' : 'transparent'
                                            }}
                                        >
                                            {digit || '•'}
                                        </div>
                                    )
                                })}
                            </div>

                            <input
                                ref={inputRef}
                                type="text"
                                value={codigo}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    setCodigo(value)
                                }}
                                placeholder=""
                                disabled={submitting || buscando}
                                maxLength={10}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                }}
                                autoComplete="off"
                            />
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                backgroundColor: '#F3F4F6',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(codigoLength / 10) * 100}%`,
                                    height: '100%',
                                    backgroundColor: isValidLength ? '#10B981' : codigoLength > 0 ? '#EF4444' : '#E5E7EB',
                                    transition: 'width 0.2s ease, background-color 0.2s ease',
                                    borderRadius: '2px'
                                }} />
                            </div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: isValidLength ? '#10B981' : codigoLength > 0 ? '#EF4444' : '#9CA3AF',
                                minWidth: '40px',
                                textAlign: 'right'
                            }}>
                                {isValidLength ? '✓ Listo' : codigoLength > 0 ? `${10 - codigoLength} restante` : '—'}
                            </span>
                        </div>

                        {/* Botón Buscar */}
                        <button
                            type="button"
                            onClick={handleBuscar}
                            disabled={!isValidLength || buscando}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                marginTop: '12px',
                                backgroundColor: !isValidLength || buscando ? '#E5E7EB' : '#4A1A5E',
                                color: !isValidLength || buscando ? '#9CA3AF' : '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: !isValidLength || buscando ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {buscando ? <Ico.Spinner /> : <Ico.Search />}
                            {buscando ? 'Buscando...' : 'Buscar postulante'}
                        </button>

                        {/* Información del postulante encontrado */}
                        {postulanteEncontrado && (
                            <div style={{
                                marginTop: '16px',
                                padding: '14px 16px',
                                backgroundColor: 'rgba(103,37,119,0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(103,37,119,0.15)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Ico.User />
                                    <span style={{ fontWeight: 600, color: '#1F1030', fontSize: '14px' }}>
                                        {postulanteEncontrado.nombres} {postulanteEncontrado.apellidos}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#4B5563' }}>
                                    <span>Código: <strong>{postulanteEncontrado.codigoMatricula}</strong></span>
                                    {postulanteEncontrado.grupo && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Ico.Group /> Grupo: <strong>{postulanteEncontrado.grupo}</strong>
                                        </span>
                                    )}
                                    {postulanteEncontrado.correoElectronico && (
                                        <span>📧 {postulanteEncontrado.correoElectronico}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Selección de estado (Presente / Tardanza) */}
                        {postulanteEncontrado && (
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4A1A5E', marginBottom: '8px' }}>
                                    Estado de asistencia
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEstadoSeleccionado('presente')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            border: `2px solid ${estadoSeleccionado === 'presente' ? '#10B981' : '#E5E7EB'}`,
                                            backgroundColor: estadoSeleccionado === 'presente' ? 'rgba(16,185,129,0.10)' : '#fff',
                                            color: estadoSeleccionado === 'presente' ? '#065F46' : '#6B7280',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <Ico.Present /> Presente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEstadoSeleccionado('tardanza')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            border: `2px solid ${estadoSeleccionado === 'tardanza' ? '#F59E0B' : '#E5E7EB'}`,
                                            backgroundColor: estadoSeleccionado === 'tardanza' ? 'rgba(245,158,11,0.10)' : '#fff',
                                            color: estadoSeleccionado === 'tardanza' ? '#92400E' : '#6B7280',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <Ico.Late /> Tardanza
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !postulanteEncontrado}
                            style={{
                                width: '100%', 
                                padding: '14px', 
                                borderRadius: '12px', 
                                border: 'none',
                                marginTop: '16px',
                                backgroundColor: !postulanteEncontrado || submitting ? '#E5E7EB' : '#672577',
                                color: !postulanteEncontrado || submitting ? '#9CA3AF' : '#fff',
                                fontFamily: 'Poppins, sans-serif', 
                                fontSize: '14px', 
                                fontWeight: 700,
                                cursor: !postulanteEncontrado || submitting ? 'not-allowed' : 'pointer',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px',
                                transition: 'all 0.2s ease',
                                transform: postulanteEncontrado && !submitting ? 'scale(1)' : 'scale(0.98)',
                                opacity: postulanteEncontrado && !submitting ? 1 : 0.6
                            }}
                        >
                            {submitting ? <Ico.Spinner /> : <Ico.Check />}
                            {submitting ? 'Registrando...' : postulanteEncontrado ? `Marcar como ${estadoSeleccionado}` : 'Busca un postulante primero'}
                        </button>
                        
                        <div style={{ 
                            marginTop: '12px', 
                            padding: '10px 14px', 
                            backgroundColor: 'rgba(156, 32, 7, 0.06)', 
                            borderRadius: '10px',
                            borderLeft: '3px solid #9C2007',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#9C2007' }}>
                                No olvides darle al botón <strong>"Salir"</strong> cuando termines.
                            </span>
                        </div>
                    </form>
                </div>

                {registrados.length > 0 && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(103,37,119,0.07)' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(214,182,223,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px', color: '#4A1A5E' }}>Registrados esta sesión</span>
                            <span style={{ backgroundColor: 'rgba(103,37,119,0.10)', color: '#4A1A5E', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{registrados.length}</span>
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '280px', overflowY: 'auto' }}>
                            {registrados.map((r, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i < registrados.length - 1 ? '1px solid rgba(214,182,223,0.30)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: r.estado === 'presente' ? '#10B981' : r.estado === 'tardanza' ? '#F59E0B' : '#9CA3AF',
                                            flexShrink: 0
                                        }} />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{r.nombre}</p>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#9880B0' }}>
                                                <span>{r.codigo}</span>
                                                {r.grupo && <span>• Grupo: {r.grupo}</span>}
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: r.estado === 'presente' ? '#10B981' : r.estado === 'tardanza' ? '#F59E0B' : '#9CA3AF'
                                                }}>
                                                    {r.estado === 'presente' ? '✓ Presente' : r.estado === 'tardanza' ? 'Tardanza' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>{r.hora}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } } 
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}