// src/app/panel/sedinvita/asistencia/page.js
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

    const fases = ['fase2', 'fase3', 'fase4']

    const [edicionActiva, setEdicionActiva] = useState(null)
    const [faseFilter, setFaseFilter] = useState('fase2')
    const [turnos, setTurnos] = useState([])
    const [turnoId, setTurnoId] = useState('')

    const [roster, setRoster] = useState([])
    const [resumen, setResumen] = useState({ presentes: 0, ausentes: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')

    const [encargados, setEncargados] = useState([])
    const [showAsignar, setShowAsignar] = useState(false)
    const [sedipranos, setSedipranos] = useState([])
    const [buscarSediprano, setBuscarSediprano] = useState('')
    const [asignando, setAsignando] = useState(false)
    const [copied, setCopied] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const fetchEdicionActiva = useCallback(async () => {
        try {
            const res = await fetch('/api/sedinvita/ediciones', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar ediciones')
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
            if (!res.ok) throw new Error(json.error || 'Error al cargar turnos')
            setTurnos(json.data || [])
            setTurnoId(prev => (json.data || []).some(x => x._id === prev) ? prev : (json.data?.[0]?._id || ''))
        } catch (err) {
            setError(err.message)
        }
    }, [])

    const fetchRoster = useCallback(async (id) => {
        if (!id) { setRoster([]); setLoading(false); return }
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/sedinvita/asistencia?turnoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar asistencia')
            setRoster(json.data || [])
            setResumen(json.resumen || { presentes: 0, ausentes: 0, total: 0 })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchEncargados = useCallback(async (id) => {
        if (!id) { setEncargados([]); return }
        try {
            const res = await fetch(`/api/sedinvita/encargados-asistencia?turnoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (res.ok) setEncargados(json.data || [])
        } catch { /* noop */ }
    }, [])

    useEffect(() => {
        const init = async () => {
            const activa = await fetchEdicionActiva()
            if (activa) await fetchTurnos(activa._id, faseFilter)
            else setLoading(false)
        }
        init()
    }, [fetchEdicionActiva, fetchTurnos, faseFilter])

    useEffect(() => {
        fetchRoster(turnoId)
        fetchEncargados(turnoId)
    }, [turnoId, fetchRoster, fetchEncargados])

    useEffect(() => {
        if (!turnoId) return
        fetchRoster(turnoId)
    }, [turnoId, fetchRoster])

    const toggleAsistencia = async (postulanteId, estadoActual) => {
        const nuevoEstado = estadoActual === 'presente' ? 'ausente' : 'presente'
        setRoster(prev => prev.map(p => p._id === postulanteId ? { ...p, asistencia: { ...p.asistencia, estado: nuevoEstado } } : p))
        try {
            const res = await fetch('/api/sedinvita/asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ postulanteId, turnoId, estado: nuevoEstado }),
            })
            if (!res.ok) throw new Error()
            fetchRoster(turnoId)
        } catch {
            fetchRoster(turnoId)
        }
    }

    // En la función abrirAsignar, cuando cargas los sedipranos
    const abrirAsignar = async () => {
        setShowAsignar(true)
        setBuscarSediprano('')
        setErrorMsg('')
        if (sedipranos.length === 0) {
            try {
                const res = await fetch('/api/sedipranos', { credentials: 'include' })
                const json = await res.json()
                if (res.ok) {
                    // FILTRAR: Excluir área "Directiva"
                    const filtrados = (json.data || []).filter(s => 
                        s.area && s.area.toLowerCase() !== 'directiva'
                    )
                    setSedipranos(filtrados)
                }
            } catch { /* noop */ }
        }
    }

    const asignarEncargado = async (sedipranoId) => {
        setAsignando(true)
        setErrorMsg('')
        try {
            const res = await fetch('/api/sedinvita/encargados-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ turnoId, edicionId: edicionActiva._id, sedipranoId }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al asignar')
            await fetchEncargados(turnoId)
            setShowAsignar(false)
        } catch (err) {
            setErrorMsg(err.message)
        } finally {
            setAsignando(false)
        }
    }

    const eliminarEncargado = async (id) => {
        if (!confirm('¿Quitar a este encargado? Perderá acceso de inmediato.')) return
        try {
            const res = await fetch(`/api/sedinvita/encargados-asistencia/${id}`, { method: 'DELETE', credentials: 'include' })
            if (res.ok) fetchEncargados(turnoId)
        } catch { /* noop */ }
    }

    const copiarLink = () => {
        const link = `${window.location.origin}/sedinvita/login`
        navigator.clipboard?.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const filtered = roster.filter(p => {
        const q = search.toLowerCase()
        return p.nombres?.toLowerCase().includes(q) || p.apellidos?.toLowerCase().includes(q) || p.codigoMatricula?.toLowerCase().includes(q)
    })

    // Filtrar sedipranos que no están ya asignados como encargados
    const sedipranosFiltrados = sedipranos
        .filter(s => {
            // Excluir Directiva
            if (s.area && s.area.toLowerCase() === 'directiva') return false
            const q = buscarSediprano.toLowerCase()
            if (!q) return true
            return s.nombres?.toLowerCase().includes(q) || 
                s.apellidos?.toLowerCase().includes(q) || 
                s.dni?.includes(q)
        })
        .filter(s => !encargados.some(e => e.sedipranoId === s._id))
        

    const turnoActual = turnos.find(x => x._id === turnoId)

    return (
        <div style={{ minHeight: '100%', padding: '20px 16px', backgroundColor: t.pageBg, transition: 'background-color 0.3s', fontFamily: 'Poppins, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>
                    Asistencia SEDInvita
                </h1>
                <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                    Día del evento · marca presente/ausente por turno
                    {edicionActiva && ` · ${edicionActiva.nombre} (${edicionActiva.anio})`}
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            {!edicionActiva && !error ? (
                <EmptyState t={t} text="No hay edición activa" />
            ) : (
                <>
                    {/* Filtros */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                        <select value={faseFilter} onChange={e => setFaseFilter(e.target.value)} style={selectStyle(t, dark)}>
                            {fases.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                        </select>
                        <select value={turnoId} onChange={e => setTurnoId(e.target.value)} style={{ ...selectStyle(t, dark), minWidth: '160px' }}>
                            {turnos.length === 0 && <option value="">Sin turnos</option>}
                            {turnos.map(tn => <option key={tn._id} value={tn._id}>{tn.nombre}</option>)}
                        </select>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o código..."
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}
                            />
                        </div>
                    </div>

                    {/* Contador en vivo */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <CounterCard label="Presentes" value={resumen.presentes} color="#16a34a" bg={dark ? 'rgba(34,197,94,0.14)' : '#ffffff'} />
                        <CounterCard label="Ausentes" value={resumen.ausentes} color="#dc2626" bg={dark ? 'rgba(239,68,68,0.14)' : '#ffffff'} />
                        <CounterCard label="Total turno" value={resumen.total} color="#672577" bg={dark ? 'rgba(103,37,119,0.18)' : '#ffffff'} />
                    </div>

                    {/* Encargados - con interfaz mejorada */}
                    <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '16px', marginBottom: '16px', boxShadow: t.cardShadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: t.titleText, margin: 0 }}>
                                Encargados de este turno
                                <span style={{ fontSize: '12px', fontWeight: 'normal', color: t.bodyText, marginLeft: '8px' }}>
                                    ({encargados.length} asignado{encargados.length !== 1 ? 's' : ''})
                                </span>
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button onClick={copiarLink} style={secondaryBtnStyle(t)}>
                                    {copied ? 'Copiado' : 'Copiar link'}
                                </button>
                                <button onClick={abrirAsignar} disabled={!turnoId} style={primaryBtnStyle(!turnoId)}>
                                    + Agregar encargado
                                </button>
                            </div>
                        </div>

                        {encargados.length === 0 ? (
                            <p style={{ fontSize: '13px', color: t.dividerText, textAlign: 'center', padding: '20px 0' }}>
                                Aún no hay encargados asignados a este turno
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {encargados.map(e => (
                                    <div key={e._id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '10px 12px', 
                                        borderRadius: '10px', 
                                        backgroundColor: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.04)',
                                        border: `1px solid ${dark ? 'rgba(103,37,119,0.12)' : 'rgba(214,182,223,0.25)'}`
                                    }}>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0 }}>
                                                {e.nombres} {e.apellidos}
                                            </p>
                                            <p style={{ fontSize: '11px', color: t.bodyText, margin: '2px 0 0 0' }}>
                                                DNI: {e.dni} · {e.area || 'Sin área'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => eliminarEncargado(e._id)} 
                                            style={smallBtnStyle('#FEE2E2', '#991B1B')}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modal Asignar Encargado - CON LA MISMA INTERFAZ QUE FACILITADORES */}
                    {showAsignar && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1010, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
                            <div style={{ backgroundColor: t.modalBg, border: `1px solid ${t.cardBorder}`, borderRadius: '18px', width: '100%', maxWidth: '460px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: t.cardShadow, animation: 'slideUp 0.2s ease', overflow: 'hidden' }}>

                                <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${t.tableBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>
                                            Agregar encargado
                                        </h3>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: '2px 0 0 0' }}>
                                            {turnoActual?.nombre || 'Selecciona un turno'} · {edicionActiva?.nombre} ({edicionActiva?.anio})
                                        </p>
                                    </div>
                                    <button onClick={() => setShowAsignar(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: t.bodyText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Ico.Close />
                                    </button>
                                </div>

                                <div style={{ padding: '14px 22px', borderBottom: `1px solid ${t.tableBorder}`, flexShrink: 0 }}>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.bodyText, pointerEvents: 'none', display: 'flex' }}>
                                            <Ico.Search />
                                        </span>
                                        <input
                                            autoFocus
                                            value={buscarSediprano}
                                            onChange={e => setBuscarSediprano(e.target.value)}
                                            placeholder="Buscar por nombre, DNI o área…"
                                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {sedipranos.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>Cargando sedipranos…</div>
                                    ) : sedipranosFiltrados.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: t.dividerText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                                            {buscarSediprano ? 'Sin resultados' : 'Todos los sedipranos ya están asignados'}
                                        </div>
                                    ) : sedipranosFiltrados.map(s => {
                                        const yaAsignado = encargados.some(e => e.sedipranoId === s._id)
                                        return (
                                            <button
                                                key={s._id}
                                                onClick={() => !yaAsignado && asignarEncargado(s._id)}
                                                disabled={yaAsignado || asignando}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', border: 'none', textAlign: 'left', cursor: yaAsignado ? 'not-allowed' : asignando ? 'wait' : 'pointer', backgroundColor: 'transparent', borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s', opacity: yaAsignado ? 0.45 : 1 }}
                                                onMouseEnter={e => { if (!yaAsignado && !asignando) e.currentTarget.style.backgroundColor = dark ? 'rgba(103,37,119,0.08)' : 'rgba(103,37,119,0.04)' }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                            >
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: yaAsignado ? (dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.10)') : (dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: yaAsignado ? '#10B981' : '#672577', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px' }}>
                                                    {initials(s.nombres, s.apellidos)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {s.nombres} {s.apellidos}
                                                        {yaAsignado && <span style={{ fontSize: '10px', marginLeft: '6px', color: '#10B981', fontWeight: 700 }}>✓ ya asignado</span>}
                                                    </p>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: t.bodyText, margin: 0 }}>{s.area || 'Sin área'} · DNI: {s.dni}</p>
                                                </div>
                                                {!yaAsignado && (
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#672577', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {errorMsg && (
                                    <div style={{ margin: '10px 22px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontFamily: 'Poppins, sans-serif', fontSize: '12px', flexShrink: 0 }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <div style={{ padding: '14px 22px', borderTop: `1px solid ${t.tableBorder}`, display: 'flex', gap: '10px', flexShrink: 0 }}>
                                    <button onClick={() => setShowAsignar(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.labelText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button
                                        disabled
                                        style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#E5E7EB', color: '#9CA3AF', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                                    >
                                        {asignando ? <><Ico.Spinner /> Asignando…</> : 'Selecciona un sediprano'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Roster */}
                    <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: t.tableHead }}>
                                        {['Postulante', 'Código', 'Estado', 'Hora', 'Acción'].map(h => (
                                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: t.tableHeadText, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${t.tableBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <SkeletonRows dark={dark} count={6} />
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: t.dividerText, fontSize: '13px' }}>
                                            {turnoId ? 'No hay postulantes con este turno elegido' : 'Selecciona un turno'}
                                        </td></tr>
                                    ) : (
                                        filtered.map((p, i) => {
                                            const presente = p.asistencia.estado === 'presente'
                                            return (
                                                <tr key={p._id} style={{ backgroundColor: i % 2 ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}` }}>
                                                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827', whiteSpace: 'nowrap' }}>{p.apellidos} {p.nombres}</td>
                                                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#672577', fontWeight: 600 }}>{p.codigoMatricula}</td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', color: presente ? '#16a34a' : '#dc2626', backgroundColor: presente ? (dark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)') : (dark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.10)') }}>
                                                            {presente ? 'Presente' : 'Ausente'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '11px 14px', fontSize: '12px', color: t.bodyText }}>
                                                        {p.asistencia.hora ? new Date(p.asistencia.hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <button
                                                            onClick={() => toggleAsistencia(p._id, p.asistencia.estado)}
                                                            style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', backgroundColor: presente ? '#FEE2E2' : '#D1FAE5', color: presente ? '#991B1B' : '#065F46' }}
                                                        >
                                                            {presente ? 'Marcar ausente' : 'Marcar presente'}
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
                </>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
                ::-webkit-scrollbar { width: 0; height: 0; }
            `}</style>
        </div>
    )
}

function CounterCard({ label, value, color, bg }) {
    return (
        <div style={{ flex: '1 1 100px', backgroundColor: bg, borderRadius: '12px', padding: '12px 16px', border: "1px solid rgba(214,182,223,0.55)" }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color, opacity: 0.8, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color, margin: '2px 0 0 0', fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
        </div>
    )
}

function EmptyState({ t, text }) {
    return (
        <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '56px 20px', textAlign: 'center', boxShadow: t.cardShadow }}>
            <p style={{ fontSize: '14px', color: t.dividerText, margin: 0 }}>{text}</p>
        </div>
    )
}

function selectStyle(t, dark) {
    return { padding: '6px 24px 6px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
}

function primaryBtnStyle(disabled) {
    return {
        padding: '7px 14px', borderRadius: '8px', border: 'none',
        backgroundColor: disabled ? '#D1D5DB' : '#672577', color: '#fff',
        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s'
    }
}

function secondaryBtnStyle(t) {
    return {
        padding: '7px 14px', borderRadius: '8px', border: `1px solid ${t.cardBorder}`,
        backgroundColor: 'transparent', color: t.bodyText,
        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s'
    }
}

function smallBtnStyle(bg, color) {
    return {
        padding: '4px 10px', borderRadius: '6px', border: 'none',
        backgroundColor: bg, color, fontSize: '11px',
        fontFamily: 'Poppins, sans-serif', cursor: 'pointer',
        transition: 'all 0.2s'
    }
}

function initials(nombres, apellidos) {
    const n = (nombres || '').trim()[0] || ''
    const a = (apellidos || '').trim()[0] || ''
    return `${n}${a}`.toUpperCase()
}

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
        tableBorder:   dark ? 'rgba(103,37,119,0.16)' : 'rgba(214,182,223,0.45)',
        dividerText:   dark ? '#6B5080' : '#c4aed4',
        emptyIcon:     dark ? 'rgba(103,37,119,0.18)' : 'rgba(103,37,119,0.08)',
        titleText:     dark ? '#EAD8F5' : '#4A1A5E',
        modalBg:       dark ? '#1A0D2E' : '#ffffff',
        overlayBg:     'rgba(0,0,0,0.55)',
    }
}

function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[140, 80, 90, 60, 110].map((w, j) => (
                <td key={j} style={{ padding: '13px 14px' }}>
                    <div style={{ height: '12px', borderRadius: '6px', width: `${w}px`, maxWidth: '100%', backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                </td>
            ))}
        </tr>
    ))
}

// ÍCONOS SVG inline (consistentes con facilitadores)
const Ico = {
    Close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Spinner: () => <svg width="14" height="14" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M18 4a14 14 0 0 1 14 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>,
}