// src\app\registro\[asistenciaId]\page.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

const Ico = {
    Check: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Clock: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    IdCard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    ),
    Logout: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Spinner: () => (
        <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    Alert: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    User: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Attendance: () => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    Lock: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    Back: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),
}

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

export default function RegistroAsistenciaPage() {
    const router       = useRouter()
    const params       = useParams()
    const asistenciaId = params?.asistenciaId

    const [encargado,      setEncargado]      = useState(null)
    const [asistencia,     setAsistencia]     = useState(null)
    const [authLoading,    setAuthLoading]    = useState(true)
    const [authError,      setAuthError]      = useState(null) // null | 'unauthorized' | 'wrong_asistencia' | 'revoked'
    const [dni,            setDni]            = useState('')
    const [submitting,     setSubmitting]     = useState(false)
    const [feedback,       setFeedback]       = useState(null)
    const [registrados,    setRegistrados]    = useState([])
    const [showLogout,     setShowLogout]     = useState(false)

    // Paso 2: DNI encontrado, esperando que el encargado elija el estado
    const [awaitingEstado, setAwaitingEstado] = useState(null) // null | { dni: string }

    const inputRef = useRef(null)

    /* ── verificar auth ── */
    useEffect(() => {
        async function verificar() {
            try {
                const res  = await fetch('/api/auth/verify')
                const data = await res.json()

                if (!res.ok || !data?.user) {
                    router.replace('/login')
                    return
                }

                if (data.user.rol !== 'ENCARGADO') {
                    router.replace('/panel')
                    return
                }

                if (data.user.asistenciaId && data.user.asistenciaId !== asistenciaId) {
                    setAuthError('wrong_asistencia')
                    setAuthLoading(false)
                    return
                }

                setEncargado(data.user)
            } catch {
                router.replace('/login')
            } finally {
                setAuthLoading(false)
            }
        }
        verificar()
    }, [router, asistenciaId])

    useEffect(() => {
        if (!asistenciaId || authLoading || authError) return
        fetch(`/api/asistencias/${asistenciaId}`)
            .then(r => r.json())
            .then(d => { if (d.asistencia) setAsistencia(d.asistencia) })
            .catch(() => {})
    }, [asistenciaId, authLoading, authError])

    useEffect(() => {
        if (!authLoading && !authError && !awaitingEstado && inputRef.current) {
            inputRef.current.focus()
        }
    }, [authLoading, authError, awaitingEstado])

    useEffect(() => {
        if (!feedback) return
        const timer = setTimeout(() => setFeedback(null), 4500)
        return () => clearTimeout(timer)
    }, [feedback])

    /* ── Paso 1: el encargado ingresa el DNI y confirma ── */
    function handleSubmit(e) {
        e.preventDefault()
        const dniClean = dni.trim()
        if (!dniClean || dniClean.length < 8) return
        setFeedback(null)
        setAwaitingEstado({ dni: dniClean })
    }

    /* ── Paso 2: el encargado elige el estado ── */
    async function handleRegistrar(estado) {
        if (!awaitingEstado) return
        setSubmitting(true)
        setFeedback(null)

        try {
            const res  = await fetch(`/api/registro/${asistenciaId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: awaitingEstado.dni, estado }),
            })
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    setAuthError('revoked')
                    return
                }
                setFeedback({ type: 'error', msg: data.message || 'Error al registrar' })
                setAwaitingEstado(null)
                return
            }

            if (data.yaRegistrado) {
                setFeedback({
                    type: 'warn',
                    msg: data.message,
                    nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
                })
                setAwaitingEstado(null)
                return
            }

            setFeedback({
                type: 'success',
                msg: data.message,
                nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
            })

            setRegistrados(prev => [
                {
                    nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
                    area:   data.sediprano.area,
                    hora:   new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                    estado,
                },
                ...prev,
            ])

        } catch {
            setFeedback({ type: 'error', msg: 'Error de conexión. Intenta de nuevo.' })
            setAwaitingEstado(null)
        } finally {
            setSubmitting(false)
            setAwaitingEstado(null)
            setDni('')
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }

    function handleCancelarEstado() {
        setAwaitingEstado(null)
        setFeedback(null)
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    async function handleLogout() {
        try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
        router.replace('/login')
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
                    <div style={{ color: '#EF4444', opacity: 0.5, marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <Ico.Lock />
                    </div>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1F1030', margin: '0 0 10px 0' }}>
                        Acceso revocado
                    </h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                        Ya no eres el encargado de esta asistencia. Tu sesión ha sido revocada. Contacta a la directiva si crees que es un error.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '11px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.30)' }}
                    >
                        Cerrar sesión
                    </button>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (authError === 'wrong_asistencia') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f5fa', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <div style={{ color: 'rgba(103,37,119,0.30)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <Ico.Lock />
                    </div>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: '#4A1A5E', margin: '0 0 10px 0' }}>
                        Acceso no permitido
                    </h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                        Solo puedes registrar asistencia en la sesión que te fue asignada.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '11px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #672577, #3454A1)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(103,37,119,0.30)' }}
                    >
                        Volver al inicio
                    </button>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    const feedbackColors = {
        success: { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.35)', text: '#065F46', icon: '#10B981' },
        warn:    { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.35)', text: '#92400E', icon: '#F59E0B' },
        error:   { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.30)',  text: '#991B1B', icon: '#EF4444' },
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f5fa', fontFamily: 'Poppins, sans-serif' }}>

            {/* ── Modal de confirmación logout ── */}
            {showLogout && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px 24px', maxWidth: '340px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.20)', animation: 'slideDown 0.2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(103,37,119,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#672577' }}>
                                <Ico.Logout />
                            </div>
                            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: '#1F1030', margin: 0 }}>
                                Cerrar sesión
                            </h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', lineHeight: 1.6 }}>
                            ¿Seguro que deseas cerrar sesión? Deberás volver a ingresar tus credenciales para continuar.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowLogout(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5d9ef', backgroundColor: '#f9f6fb', color: '#4A1A5E', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Cancelar
                            </button>
                            <button onClick={handleLogout} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#672577', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(103,37,119,0.30)' }}>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(214,182,223,0.50)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(103,37,119,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logos/isotipo.webp" alt="SEDIPRO" style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    <div>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: '#4A1A5E', margin: 0, lineHeight: 1.2 }}>
                            Registro de Asistencia
                        </p>
                        {asistencia && (
                            <p style={{ fontSize: '11px', color: '#9880B0', margin: 0 }}>
                                {formatDate(asistencia.fecha)} · {asistencia.descripcion}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowLogout(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(214,182,223,0.60)', backgroundColor: 'rgba(103,37,119,0.06)', color: '#672577', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(103,37,119,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(103,37,119,0.06)' }}
                >
                    <Ico.Logout />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
            </header>

            <main style={{ maxWidth: '520px', margin: '0 auto', padding: '28px 16px' }}>
                {encargado && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '14px', padding: '14px 16px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(103,37,119,0.08)' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #672577, #3454A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                            <Ico.User />
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', color: '#9880B0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Encargado de asistencia
                            </p>
                            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: '#1F1030', margin: 0 }}>
                                {encargado.nombres} {encargado.apellidos}
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(103,37,119,0.10)', marginBottom: '20px' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #672577, #3454A1)' }} />

                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ color: '#672577' }}><Ico.Attendance /></div>
                            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#1F1030', margin: 0 }}>
                                Registrar asistencia
                            </h2>
                        </div>

                        {/* ── Feedback ── */}
                        {feedback && (() => {
                            const fc = feedbackColors[feedback.type]
                            return (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: fc.bg, border: `1px solid ${fc.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', animation: 'slideDown 0.2s ease' }}>
                                    <span style={{ color: fc.icon, flexShrink: 0, marginTop: '1px' }}>
                                        {feedback.type === 'success' ? <Ico.Check /> : <Ico.Alert />}
                                    </span>
                                    <div>
                                        {feedback.nombre && (
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: fc.text, margin: '0 0 2px 0' }}>
                                                {feedback.nombre}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '13px', color: fc.text, margin: 0, lineHeight: 1.5 }}>
                                            {feedback.msg}
                                        </p>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* ══════════════════════════════════════════
                            PASO 1 — Ingresar DNI
                        ══════════════════════════════════════════ */}
                        {!awaitingEstado && (
                            <form onSubmit={handleSubmit}>
                                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.6 }}>
                                    Ingresa el DNI del sediprano para elegir su estado.
                                </p>

                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A1A5E', marginBottom: '8px' }}>
                                    DNI del sediprano
                                </label>

                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9880B0', pointerEvents: 'none', display: 'flex' }}>
                                        <Ico.IdCard />
                                    </span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={8}
                                        value={dni}
                                        onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ej: 76543210"
                                        disabled={submitting}
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '13px 14px 13px 44px',
                                            borderRadius: '12px', border: '2px solid #e5d9ef',
                                            backgroundColor: '#f9f6fb', color: '#111827',
                                            fontSize: '16px', fontWeight: 700, letterSpacing: '0.10em',
                                            outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#672577'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e5d9ef'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={dni.trim().length < 8}
                                    style={{
                                        width: '100%', padding: '13px',
                                        borderRadius: '12px', border: 'none',
                                        background: dni.trim().length < 8 ? '#E5E7EB' : 'linear-gradient(135deg, #672577, #3454A1)',
                                        color: dni.trim().length < 8 ? '#9CA3AF' : '#fff',
                                        fontSize: '14px', fontWeight: 700,
                                        cursor: dni.trim().length < 8 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: dni.trim().length < 8 ? 'none' : '0 4px 16px rgba(103,37,119,0.30)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Ico.User /> Marcar Sediprano
                                </button>
                            </form>
                        )}

                        {/* ══════════════════════════════════════════
                            PASO 2 — Elegir estado
                        ══════════════════════════════════════════ */}
                        {awaitingEstado && (
                            <div style={{ animation: 'slideDown 0.2s ease' }}>
                                {/* DNI encontrado — indicador */}
                                <div style={{ backgroundColor: 'rgba(103,37,119,0.06)', border: '1px solid rgba(103,37,119,0.18)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#9880B0', display: 'flex' }}><Ico.IdCard /></span>
                                        <span style={{ fontSize: '13px', color: '#4A1A5E', fontWeight: 600 }}>DNI:</span>
                                        <span style={{ fontSize: '15px', color: '#1F1030', fontWeight: 700, letterSpacing: '0.10em' }}>{awaitingEstado.dni}</span>
                                    </div>
                                    <button
                                        onClick={handleCancelarEstado}
                                        disabled={submitting}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9880B0', background: 'none', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, padding: '4px 8px', borderRadius: '8px' }}
                                    >
                                        <Ico.Back /> Cambiar
                                    </button>
                                </div>

                                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: 1.6 }}>
                                    ¿Con qué estado deseas registrar al sediprano?
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {/* Botón Presente */}
                                    <button
                                        onClick={() => handleRegistrar('presente')}
                                        disabled={submitting}
                                        style={{
                                            padding: '16px 12px',
                                            borderRadius: '14px',
                                            border: '2px solid rgba(16,185,129,0.35)',
                                            backgroundColor: submitting ? '#F3F4F6' : 'rgba(16,185,129,0.08)',
                                            color: submitting ? '#9CA3AF' : '#065F46',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '14px', fontWeight: 700,
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.15s',
                                            boxShadow: submitting ? 'none' : '0 2px 10px rgba(16,185,129,0.15)',
                                        }}
                                        onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.16)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.60)' }}}
                                        onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)' }}}
                                    >
                                        {submitting
                                            ? <Ico.Spinner />
                                            : <span style={{ fontSize: '22px' }}>✓</span>
                                        }
                                        <span>Presente</span>
                                    </button>

                                    {/* Botón Tardanza */}
                                    <button
                                        onClick={() => handleRegistrar('tardanza')}
                                        disabled={submitting}
                                        style={{
                                            padding: '16px 12px',
                                            borderRadius: '14px',
                                            border: '2px solid rgba(245,158,11,0.35)',
                                            backgroundColor: submitting ? '#F3F4F6' : 'rgba(245,158,11,0.08)',
                                            color: submitting ? '#9CA3AF' : '#92400E',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '14px', fontWeight: 700,
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.15s',
                                            boxShadow: submitting ? 'none' : '0 2px 10px rgba(245,158,11,0.15)',
                                        }}
                                        onMouseEnter={e => { if (!submitting) { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.16)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.60)' }}}
                                        onMouseLeave={e => { if (!submitting) { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)' }}}
                                    >
                                        {submitting
                                            ? <Ico.Spinner />
                                            : <span style={{ fontSize: '22px' }}>⏰</span>
                                        }
                                        <span>Tardanza</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Historial de la sesión ── */}
                {registrados.length > 0 && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid rgba(214,182,223,0.55)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(103,37,119,0.07)' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(214,182,223,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px', color: '#4A1A5E' }}>
                                Registrados esta sesión
                            </span>
                            <span style={{ backgroundColor: 'rgba(103,37,119,0.10)', color: '#4A1A5E', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                                {registrados.length} registrado{registrados.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '280px', overflowY: 'auto' }}>
                            {registrados.map((r, i) => (
                                <li
                                    key={i}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '11px 18px',
                                        borderBottom: i < registrados.length - 1 ? '1px solid rgba(214,182,223,0.30)' : 'none',
                                        animation: i === 0 ? 'slideDown 0.25s ease' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                            backgroundColor: r.estado === 'tardanza' ? '#F59E0B' : '#10B981',
                                        }} />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{r.nombre}</p>
                                            <p style={{ fontSize: '11px', color: '#9880B0', margin: 0 }}>{r.area}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                                            backgroundColor: r.estado === 'tardanza' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                                            color: r.estado === 'tardanza' ? '#92400E' : '#065F46',
                                        }}>
                                            {r.estado === 'tardanza' ? 'Tardanza' : 'Presente'}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{r.hora}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes spin      { to { transform: rotate(360deg); } }
                @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
            `}</style>
        </div>
    )
}