// src\app\panel\sedinvita\postulantes\page.js
'use client'

import { useState, useEffect, useCallback } from 'react'

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

    const [data, setData] = useState([])
    const [edicion, setEdicion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)
    const [faseSeleccionada, setFaseSeleccionada] = useState('fase3')

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/sedinvita/postulantes', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar datos')
            setData(json.data ?? [])
            setEdicion(json.edicion ?? null)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filtrar por fase (lógica de filtrado progresivo)
    const filtrarPorFase = (postulantes, fase) => {
        if (fase === 'fase2') {
            // Fase 2: TODOS los postulantes
            return postulantes
        } else if (fase === 'fase3') {
            // Fase 3: SOLO los que están en fase 3 o superior
            return postulantes.filter(p => p.faseActual === 'fase3' || p.faseActual === 'fase4')
        } else if (fase === 'fase4') {
            // Fase 4: SOLO los que están en fase 4
            return postulantes.filter(p => p.faseActual === 'fase4')
        }
        return postulantes
    }

    // Aplicar filtros: primero fase, luego búsqueda
    const filtered = data.filter(p => {
        const q = search.toLowerCase()
        const matchSearch = 
            p.nombres?.toLowerCase().includes(q) ||
            p.apellidos?.toLowerCase().includes(q) ||
            p.correoElectronico?.toLowerCase().includes(q) ||
            p.codigoMatricula?.toLowerCase().includes(q) ||
            p.numeroCelular?.toLowerCase().includes(q)
        
        return matchSearch
    })

    // Aplicar filtro de fase después
    const filteredByFase = filtrarPorFase(filtered, faseSeleccionada)

    // Contadores (mostrar cuántos hay en cada fase)
    const contarPorFase = (fase) => {
        if (fase === 'fase2') {
            return data.length // Todos
        } else if (fase === 'fase3') {
            return data.filter(p => p.faseActual === 'fase3' || p.faseActual === 'fase4').length
        } else if (fase === 'fase4') {
            return data.filter(p => p.faseActual === 'fase4').length
        }
        return 0
    }

    const fase2Count = contarPorFase('fase2')
    const fase3Count = contarPorFase('fase3')
    const fase4Count = contarPorFase('fase4')

    // Obtener el nombre de la fase actual para mostrar
    const getFaseNombre = (fase) => {
        if (fase === 'fase2') return 'Fase 2'
        if (fase === 'fase3') return 'Fase 3'
        if (fase === 'fase4') return 'Fase 4'
        return fase
    }

    return (
        <div style={{
            minHeight: '100%', padding: '20px 16px',
            backgroundColor: t.pageBg, transition: 'background-color 0.3s',
            fontFamily: 'Poppins, sans-serif',
            maxWidth: '1200px', margin: '0 auto',
        }}>
            {/* Encabezado */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '4px' }}>
                    <div>
                        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>
                            Postulantes
                        </h1>
                        <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                            Lista de postulantes en {edicion?.nombre || 'SEDInvita'} - Mostrando {getFaseNombre(faseSeleccionada)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector de Fase y Contadores */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px', 
                marginBottom: '16px',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFaseSeleccionada('fase2')}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: faseSeleccionada === 'fase2' 
                                ? '2px solid #2563EB' 
                                : `1px solid ${t.cardBorder}`,
                            backgroundColor: faseSeleccionada === 'fase2' 
                                ? '#2563EB' 
                                : t.cardBg,
                            color: faseSeleccionada === 'fase2' 
                                ? '#ffffff' 
                                : t.bodyText,
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Fase 2
                        <span style={{
                            fontSize: '11px',
                            opacity: 0.9,
                            backgroundColor: faseSeleccionada === 'fase2' 
                                ? 'rgba(255,255,255,0.2)' 
                                : 'rgba(103,37,119,0.1)',
                            padding: '2px 10px',
                            borderRadius: '12px',
                        }}>
                            {fase2Count}
                        </span>
                    </button>

                    <button
                        onClick={() => setFaseSeleccionada('fase3')}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: faseSeleccionada === 'fase3' 
                                ? '2px solid #7C3AED' 
                                : `1px solid ${t.cardBorder}`,
                            backgroundColor: faseSeleccionada === 'fase3' 
                                ? '#7C3AED' 
                                : t.cardBg,
                            color: faseSeleccionada === 'fase3' 
                                ? '#ffffff' 
                                : t.bodyText,
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Fase 3
                        <span style={{
                            fontSize: '11px',
                            opacity: 0.9,
                            backgroundColor: faseSeleccionada === 'fase3' 
                                ? 'rgba(255,255,255,0.2)' 
                                : 'rgba(103,37,119,0.1)',
                            padding: '2px 10px',
                            borderRadius: '12px',
                        }}>
                            {fase3Count}
                        </span>
                    </button>

                    <button
                        onClick={() => setFaseSeleccionada('fase4')}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: faseSeleccionada === 'fase4' 
                                ? '2px solid #D946EF' 
                                : `1px solid ${t.cardBorder}`,
                            backgroundColor: faseSeleccionada === 'fase4' 
                                ? '#D946EF' 
                                : t.cardBg,
                            color: faseSeleccionada === 'fase4' 
                                ? '#ffffff' 
                                : t.bodyText,
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Fase 4
                        <span style={{
                            fontSize: '11px',
                            opacity: 0.9,
                            backgroundColor: faseSeleccionada === 'fase4' 
                                ? 'rgba(255,255,255,0.2)' 
                                : 'rgba(103,37,119,0.1)',
                            padding: '2px 10px',
                            borderRadius: '12px',
                        }}>
                            {fase4Count}
                        </span>
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: t.dividerText, pointerEvents: 'none' }}>
                        <Ico.Search />
                    </span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar postulante..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-poppins rounded-xl border focus:outline-none transition-all"
                        style={{ backgroundColor: dark ? '#2d2b3e' : '#fff', borderColor: dark ? '#3d3b52' : '#d1d5db', color: dark ? '#e2e8f0' : '#1e293b' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                        onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                    />
                </div>
            </div>

            {/* Tabla */}
            <div style={{
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
                borderRadius: '14px',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['Postulante', 'Correo', 'Código UNT', 'Celular', 'Fase', 'Estado'].map(h => (
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
                                <SkeletonRows dark={dark} count={8} />
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#EF4444' }}>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                                Error: {error}
                                            </p>
                                            <button
                                                onClick={fetchData}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#672577',
                                                    color: '#fff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredByFase.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ico.Users />
                                            </div>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                                {search ? 'No se encontraron resultados' : `No hay postulantes en ${getFaseNombre(faseSeleccionada)}`}
                                            </p>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                                                {search ? 'Intenta con otra búsqueda' : ''}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredByFase.map((p, i) => {
                                    const isEven = i % 2 === 1
                                    const habilitado = p.estadoGeneral === 'habilitado'
                                    return (
                                        <tr
                                            key={p._id}
                                            style={{ backgroundColor: isEven ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                        >
                                            <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div>
                                                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827', margin: 0 }}>
                                                            {p.apellidos} {p.nombres}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText }}>
                                                {p.correoElectronico}
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600, color: '#672577', backgroundColor: dark ? 'rgba(103,37,119,0.15)' : 'rgba(103,37,119,0.08)', padding: '3px 9px', borderRadius: '8px' }}>
                                                    {p.codigoMatricula}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: dark ? '#EAD8F5' : '#374151', whiteSpace: 'nowrap' }}>
                                                {p.numeroCelular || '—'}
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <span style={{ 
                                                    fontFamily: 'Poppins,sans-serif', 
                                                    fontSize: '12px', 
                                                    fontWeight: 600, 
                                                    color: p.faseActual === 'fase2' ? '#2563EB' : p.faseActual === 'fase3' ? '#7C3AED' : '#D946EF',
                                                    backgroundColor: dark 
                                                        ? `rgba(${p.faseActual === 'fase2' ? '37,99,235' : p.faseActual === 'fase3' ? '124,58,237' : '217,70,239'}, 0.16)` 
                                                        : `rgba(${p.faseActual === 'fase2' ? '37,99,235' : p.faseActual === 'fase3' ? '124,58,237' : '217,70,239'}, 0.08)`,
                                                    padding: '3px 9px', 
                                                    borderRadius: '8px', 
                                                    textTransform: 'capitalize' 
                                                }}>
                                                    {p.faseActual === 'fase2' ? 'Fase 2' : p.faseActual === 'fase3' ? 'Fase 3' : p.faseActual === 'fase4' ? 'Fase 4' : p.faseActual}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <span style={{
                                                    fontFamily: 'Poppins,sans-serif', fontSize: '12px', fontWeight: 600,
                                                    color: habilitado ? '#16a34a' : '#dc2626',
                                                    backgroundColor: habilitado
                                                        ? (dark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)')
                                                        : (dark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.10)'),
                                                    padding: '3px 9px', borderRadius: '8px',
                                                }}>
                                                    {habilitado ? 'Habilitado' : 'Inhabilitado'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && !error && filteredByFase.length > 0 && (
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {filteredByFase.length} postulante{filteredByFase.length !== 1 ? 's' : ''} en {getFaseNombre(faseSeleccionada)}
                            {search && ` (filtrado por búsqueda)`}
                        </p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
                ::-webkit-scrollbar { width: 0; height: 0; }
            `}</style>
        </div>
    )
}

// ─────────────────────────────────────────────
// TEMA
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
    Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Spinner:  () => <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/><path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/></svg>,
    Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Calendar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Ticket:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/></svg>,
}

function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[140, 160, 90, 90, 70, 90].map((w, j) => (
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