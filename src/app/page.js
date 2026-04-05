'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
    const [step, setStep] = useState('loading')
    const [votacion, setVotacion] = useState(null)
    const [sediprano, setSediprano] = useState(null)
    const [dni, setDni] = useState('')
    const [opcionSeleccionada, setOpcionSeleccionada] = useState('')
    const [error, setError] = useState('')
    const [loadingDni, setLoadingDni] = useState(false)
    const [saving, setSaving] = useState(false)
    const [alert, setAlert] = useState({ show: false })

    const dniLength = dni.length
    const isReady = dniLength === 8

    useEffect(() => {
        fetch('/api/votaciones/activa')
            .then(r => r.json())
            .then(data => {
                if (data.activa) {
                    setVotacion(data.votacion)
                    setStep('dni')
                } else {
                    setStep('cerrado')
                }
            })
            .catch(() => setStep('cerrado'))
    }, [])

    const inputStyle = {
        borderColor: error ? '#EF4444' : isReady ? 'var(--color-success)' : '#D1D5DB',
        boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.15)' : isReady ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
    }

    const handleVerificarDni = async () => {
        if (!isReady) return
        setError('')
        setLoadingDni(true)
        try {
            const res = await fetch(`/api/votaciones/activa?dni=${dni}`)
            const data = await res.json()

            if (!data.activa) return setError('No hay votación activa en este momento')
            if (data.error || !data.sediprano) return setError(data.error || 'DNI no encontrado en el padrón de SEDIPRO')
            if (data.yaVoto) {
                setSediprano(data.sediprano)
                setStep('yaVoto')
                return
            }
            setSediprano(data.sediprano)
            setVotacion(data.votacion)
            setStep('votando')
        } catch {
            setError('Error al verificar. Inténtalo de nuevo.')
        } finally {
            setLoadingDni(false)
        }
    }

    const handleVotar = async () => {
        if (!opcionSeleccionada) return setError('Selecciona una opción antes de confirmar')
        setSaving(true)
        setError('')
        try {
            const res = await fetch(`/api/votaciones/${votacion._id}/votar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sedipranoId: sediprano._id, opcionSeleccionada })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.message)

            setAlert({
                show: true,
                type: 'success',
                title: '¡Voto registrado!',
                message: `Tu voto por "${opcionSeleccionada}" ha sido guardado correctamente.`,
                onConfirm: () => {
                    setAlert({ show: false })
                    setDni('')
                    setOpcionSeleccionada('')
                    setSediprano(null)
                    setError('')
                    setStep('dni')
                }
            })
        } catch {
            setError('Error al registrar el voto. Inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    const cardStyle = {
        backgroundColor: '#fff',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
        border: '1px solid rgba(214,182,223,0.45)',
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ backgroundColor: '#f8f5fa' }}>

            {alert.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-fade-in" style={cardStyle}>
                        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
                        <div className="p-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-poppins" style={{ color: '#1e293b' }}>{alert.title}</h3>
                                <p className="mt-1.5 text-sm font-poppins text-gray-500">{alert.message}</p>
                            </div>
                            <button onClick={alert.onConfirm} className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white" style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 14px rgba(103,37,119,0.35)' }}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.18 }} />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.13 }} />
            </div>

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                <header className="text-center mb-7">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logos/sedi-logo.svg"
                            alt="Logo SEDIPRO UNT"
                            className="w-24 h-24 lg:w-32 lg:h-32 object-contain transition-transform duration-300 hover:scale-105"
                            style={{ filter: 'drop-shadow(0 8px 16px rgba(103,37,119,0.30)) drop-shadow(0 2px 4px rgba(103,37,119,0.15))' }}
                            onError={(e) => {
                                const img = e.currentTarget
                                const fb = document.createElement('div')
                                fb.style.cssText = 'width:80px;height:80px;border-radius:50%;background:var(--color-primary);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(103,37,119,0.30)'
                                fb.innerHTML = '<span style="color:#fff;font-size:1.5rem;font-weight:700;font-family:Montserrat,sans-serif">S</span>'
                                img.replaceWith(fb)
                            }}
                        />
                    </div>
                    <p className="text-base font-semibold font-poppins text-primary">Sistema de Votación</p>
                </header>

                <div className="rounded-xl overflow-hidden" style={cardStyle}>
                    <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent" aria-hidden="true" />

                    <div className="p-7 space-y-6">
                        {/* Loading */}
                        {step === 'loading' && (
                            <div className="flex justify-center py-6">
                                <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                            </div>
                        )}

                        {/* Cerrado */}
                        {step === 'cerrado' && (
                            <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold font-poppins text-accent">Proceso Cerrado</h2>
                                    <p className="mt-1.5 text-sm font-poppins text-gray-500">No hay votaciones activas por el momento. Mantente atento a los comunicados oficiales.</p>
                                </div>
                            </div>
                        )}

                        {/* DNI */}
                        {step === 'dni' && (
                            <div className="space-y-4">
                                {votacion && (
                                    <div className="rounded-xl p-3.5 space-y-1" style={{ backgroundColor: '#faf5fc', border: '1px solid rgba(103,37,119,0.15)' }}>
                                        <p className="text-xs font-semibold font-poppins" style={{ color: 'var(--color-primary)' }}>Votación activa</p>
                                        <p className="text-sm font-bold font-poppins text-accent">{votacion.titulo}</p>
                                        <p className="text-xs font-poppins text-gray-500">Opciones: {votacion.opciones?.join(', ')}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="dni" className="block text-sm font-semibold font-poppins mb-1.5 text-primary-active">Número de DNI</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary" aria-hidden="true">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0" />
                                            </svg>
                                        </span>
                                        <input
                                            id="dni"
                                            type="text"
                                            value={dni}
                                            onChange={(e) => { setDni(e.target.value.replace(/\D/g, '').slice(0, 8)); setError('') }}
                                            onKeyDown={e => e.key === 'Enter' && isReady && handleVerificarDni()}
                                            placeholder="Ej. 70123456"
                                            maxLength={8}
                                            inputMode="numeric"
                                            autoComplete="off"
                                            aria-required="true"
                                            aria-invalid={!!error}
                                            className="form-input w-full pl-9 pr-14 py-2.5 text-sm font-poppins rounded-lg border bg-white text-gray-900 transition-all duration-150 focus:outline-none focus:ring-0"
                                            style={inputStyle}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-poppins tabular-nums font-semibold" style={{ color: isReady ? 'var(--color-success)' : '#9CA3AF' }}>
                                            {dniLength}/8
                                        </span>
                                    </div>
                                    {error ? (
                                        <div className="flex items-start gap-2.5 text-sm mt-3 px-3.5 py-3 rounded-lg font-poppins bg-error-light border border-error text-error-dark animate-fade-in">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-error"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    ) : (
                                        <p id="dni-hint" className="mt-1.5 text-xs font-poppins text-gray-400">
                                            Ingresa los 8 dígitos de tu DNI peruano.
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleVerificarDni}
                                    disabled={!isReady || loadingDni}
                                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white transition-all duration-200"
                                    style={{ backgroundColor: isReady ? 'var(--color-primary)' : '#D1D5DB', boxShadow: isReady ? '0 4px 14px rgba(103,37,119,0.35)' : 'none', cursor: isReady ? 'pointer' : 'not-allowed' }}
                                >
                                    {loadingDni ? 'Verificando...' : 'Continuar'}
                                </button>
                            </div>
                        )}

                        {/* Votando */}
                        {step === 'votando' && votacion && sediprano && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#f3e8ff' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold font-poppins text-accent">{sediprano.apellidos} {sediprano.nombres}</p>
                                    <p className="text-xs font-poppins text-gray-400">DNI: {sediprano.dni}</p>
                                </div>

                                <div className="rounded-xl p-3.5" style={{ backgroundColor: '#faf5fc', border: '1px solid rgba(103,37,119,0.15)' }}>
                                    <p className="text-xs font-semibold font-poppins mb-1" style={{ color: 'var(--color-primary)' }}>Pregunta</p>
                                    <p className="text-sm font-bold font-poppins text-accent">{votacion.titulo}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold font-poppins text-gray-500">Selecciona tu opción:</p>
                                    {votacion.opciones?.map(op => (
                                        <label key={op} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all" style={{
                                            borderColor: opcionSeleccionada === op ? 'var(--color-primary)' : '#e5e7eb',
                                            backgroundColor: opcionSeleccionada === op ? '#faf5fc' : '#fff',
                                            boxShadow: opcionSeleccionada === op ? '0 0 0 2px rgba(103,37,119,0.2)' : 'none'
                                        }}>
                                            <input type="radio" name="opcion" value={op} checked={opcionSeleccionada === op} onChange={() => { setOpcionSeleccionada(op); setError('') }} className="accent-primary" />
                                            <span className="text-sm font-semibold font-poppins" style={{ color: opcionSeleccionada === op ? 'var(--color-primary)' : '#374151' }}>{op}</span>
                                        </label>
                                    ))}
                                </div>

                                {error &&
                                    <div className="flex items-start gap-2.5 text-sm px-3.5 py-3 rounded-lg font-poppins bg-error-light border border-error text-error-dark animate-fade-in">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-error"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                }

                                <div className="flex gap-3">
                                    <button onClick={() => { setStep('dni'); setDni(''); setOpcionSeleccionada(''); setError('') }} className="flex-1 py-2.5 rounded-lg font-semibold text-sm font-poppins border transition-all" style={{ borderColor: '#d1d5db', color: '#6b7280' }}>
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleVotar}
                                        disabled={!opcionSeleccionada || saving}
                                        className="flex-1 py-2.5 rounded-lg font-semibold text-sm font-poppins text-white transition-all"
                                        style={{ backgroundColor: opcionSeleccionada ? 'var(--color-primary)' : '#D1D5DB', boxShadow: opcionSeleccionada ? '0 4px 14px rgba(103,37,119,0.35)' : 'none' }}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar selección'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Ya votó */}
                        {step === 'yaVoto' && (
                            <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold font-poppins text-accent">Ya has votado</h2>
                                    <p className="mt-1.5 text-sm font-poppins text-gray-500">
                                        {sediprano?.apellidos} {sediprano?.nombres}, tu voto ya fue registrado en esta votación. No puedes votar dos veces.
                                    </p>
                                </div>
                                <button onClick={() => { setStep('dni'); setDni(''); setSediprano(null); setError('') }} className="text-sm font-semibold font-poppins" style={{ color: 'var(--color-primary)' }}>
                                    ← Volver
                                </button>
                            </div>
                        )}

                        <hr className="border-gray-200" />

                        <Link
                            href="/login"
                            className="block w-full py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white transition-all duration-200 focus:outline-none text-center"
                            style={{
                                background: 'linear-gradient(135deg, #672577, #3454A1)',
                                boxShadow: '0 4px 14px rgba(103,37,119,0.35)',
                                borderRadius: '12px', // Para que coincida con el navbar (era 12px)
                            }}
                        >
                            Administración
                        </Link>
                    </div>
                </div>

                <footer className="mt-5 text-center space-y-1">
                    <p className="text-xs font-poppins text-gray-400">© {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>
    )
}