// src/app/sedinvita/facilitador/login/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FacilitadorLoginPage() {
    const [dni, setDni] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            const res = await fetch('/api/sedinvita/facilitadores/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: dni.trim(), password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
            router.push('/sedinvita/facilitador/evaluar')
        } catch (err) {
            setError(err.message || 'No se pudo iniciar sesión.')
        } finally {
            setIsLoading(false)
        }
    }

    const isReady = dni.trim().length > 0 && password.trim().length > 0
    const getBaseInputStyle = () => error
        ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' }
        : { borderColor: '#D1D5DB', boxShadow: 'none' }
    const btnStyle = isReady && !isLoading
        ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(103,37,119,0.35)', cursor: 'pointer' }
        : { backgroundColor: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ backgroundColor: '#f8f5fa' }}>
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.18 }} />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.13 }} />
            </div>

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                <header className="text-center mb-4">
                    <div className="flex justify-center mb-2">
                        <img src="/logos/sedi-logo.svg" alt="Logo SEDIPRO UNT" className="w-24 h-24 object-contain"
                            style={{ filter: 'drop-shadow(0 8px 16px rgba(103,37,119,0.30)) drop-shadow(0 2px 4px rgba(103,37,119,0.15))' }} />
                    </div>
                    <p className="text-base font-semibold font-poppins text-primary">
                        Acceso SEDInvita · Facilitadores
                    </p>
                </header>

                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-modal)', border: '1px solid rgba(214,182,223,0.45)' }}>
                    <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent" aria-hidden="true" />
                    <form onSubmit={handleSubmit} className="p-7 space-y-5" noValidate>
                        <div>
                            <label htmlFor="dni" className="block text-sm font-semibold font-poppins mb-1.5 text-primary-active">Usuario</label>
                            <input id="dni" type="text" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Usuario" autoComplete="username"
                                className="form-input w-full px-4 py-2.5 text-sm font-poppins rounded-lg border bg-white text-gray-900 transition-all duration-150 focus:outline-none" style={getBaseInputStyle()} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold font-poppins mb-1.5 text-primary-active">Contraseña</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••••" autoComplete="current-password"
                                className="form-input w-full px-4 py-2.5 text-sm font-poppins rounded-lg border bg-white text-gray-900 transition-all duration-150 focus:outline-none" style={getBaseInputStyle()} />
                        </div>
                        {error && (
                            <div role="alert" className="flex items-start gap-2.5 text-sm px-3.5 py-3 rounded-lg font-poppins bg-error-light border border-error text-error-dark">
                                <span>{error}</span>
                            </div>
                        )}
                        <button type="submit" disabled={!isReady || isLoading}
                            className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins transition-all duration-200 focus:outline-none" style={btnStyle}>
                            {isLoading ? 'Ingresando…' : 'Ingresar'}
                        </button>
                    </form>
                </div>

                <footer className="mt-5 text-center">
                    <p className="text-sm font-poppins text-gray-400">No olvides cerrar sesión cuando termines.</p>
                </footer>
            </div>
        </div>
    )
}