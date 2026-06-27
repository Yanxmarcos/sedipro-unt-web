// src/app/panel/sedinvita/asistencia/page.js
// VERSIÓN FINAL - Ambos errores corregidos
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
    const [resumen, setResumen] = useState({ presentes: 0, tardanzas: 0, ausentes: 0, total: 0 })
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
    
    const [rosterLocal, setRosterLocal] = useState({})

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

    // FIX 1: Calcular tardanzas en fetchRoster
    const fetchRoster = useCallback(async (id) => {
        if (!id) { setRoster([]); setRosterLocal({}); setLoading(false); return }
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/sedinvita/asistencia?turnoId=${id}`, { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar asistencia')
            
            const data = json.data || []
            setRoster(data)
            setRosterLocal({})
            
            // FIX 1: Calcular resumen incluyendo tardanzas
            const presentes = data.filter(p => p.asistencia.estado === 'presente').length
            const tardanzas = data.filter(p => p.asistencia.estado === 'tardanza').length
            const ausentes = data.filter(p => p.asistencia.estado === 'ausente').length
            
            setResumen({ presentes, tardanzas, ausentes, total: data.length })
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

    // FIX 2: Actualizar roster cuando se guarda
    async function toggleAsistencia(postulanteId, nuevoEstado) {
        try {
            // Optimistic update - mostrar cambio inmediatamente
            setRosterLocal(prev => ({
                ...prev,
                [postulanteId]: nuevoEstado
            }))

            // Recalcular resumen localmente
            const rosterConLocal = roster.map(p => 
                p._id === postulanteId 
                    ? { ...p, asistencia: { ...p.asistencia, estado: nuevoEstado } }
                    : p
            )
            const presentes = rosterConLocal.filter(p => p.asistencia.estado === 'presente').length
            const tardanzas = rosterConLocal.filter(p => p.asistencia.estado === 'tardanza').length
            const ausentes = rosterConLocal.filter(p => p.asistencia.estado === 'ausente').length
            
            setResumen({ 
                presentes, 
                tardanzas, 
                ausentes, 
                total: rosterConLocal.length 
            })

            // Guardar en servidor
            const res = await fetch('/api/sedinvita/asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ postulanteId, turnoId, estado: nuevoEstado })
            })

            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Error al guardar')
            }

            // FIX 2: ACTUALIZAR EL ROSTER - esto es lo que faltaba
            setRoster(prevRoster => 
                prevRoster.map(p =>
                    p._id === postulanteId
                        ? { ...p, asistencia: { ...p.asistencia, estado: nuevoEstado, hora: new Date() } }
                        : p
                )
            )

            // Limpiar override local
            setRosterLocal(prev => {
                const next = { ...prev }
                delete next[postulanteId]
                return next
            })

        } catch (err) {
            // Revertir cambios si falla
            setRosterLocal(prev => {
                const next = { ...prev }
                delete next[postulanteId]
                return next
            })
            
            // Recalcular con datos originales
            const presentes = roster.filter(p => p.asistencia.estado === 'presente').length
            const tardanzas = roster.filter(p => p.asistencia.estado === 'tardanza').length
            const ausentes = roster.filter(p => p.asistencia.estado === 'ausente').length
            
            setResumen({ 
                presentes, 
                tardanzas, 
                ausentes, 
                total: roster.length 
            })
            
            alert('Error al guardar asistencia: ' + err.message)
        }
    }

    async function copiarLink() {
        const link = `${window.location.origin}/sedinvita/login`
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            alert('No se pudo copiar')
        }
    }

    async function abrirAsignar() {
        if (!turnoId) return
        setShowAsignar(true)
        try {
            const res = await fetch('/api/sedipranos', { credentials: 'include' })
            const json = await res.json()
            if (res.ok) setSedipranos(json.data || [])
        } catch { /* noop */ }
    }

    async function asignarEncargado(sedipranoId) {
        setAsignando(true)
        try {
            const res = await fetch('/api/sedinvita/encargados-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ turnoId, sedipranoId })
            })
            const json = await res.json()
            if (res.ok) {
                setEncargados(prev => [...prev, json.data])
                setShowAsignar(false)
                setBuscarSediprano('')
            } else {
                setErrorMsg(json.error || 'Error')
            }
        } catch (err) {
            setErrorMsg(err.message)
        } finally {
            setAsignando(false)
        }
    }

    async function eliminarEncargado(id) {
        if (!confirm('¿Eliminar este encargado?')) return
        try {
            const res = await fetch(`/api/sedinvita/encargados-asistencia/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (res.ok) {
                setEncargados(prev => prev.filter(e => e._id !== id))
            }
        } catch { /* noop */ }
    }

    const filtered = roster.filter(p => {
        const q = search.toLowerCase()
        return p.apellidos?.toLowerCase().includes(q) || 
               p.nombres?.toLowerCase().includes(q) || 
               p.codigoMatricula?.includes(q)
    })

    const sedipranosFiltrados = sedipranos
        .filter(s => {
            const q = buscarSediprano.toLowerCase()
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
                    Día del evento · marca presente/tardanza/ausente por turno
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

                    {/* Contador con TARDANZAS */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <CounterCard label="Presentes" value={resumen.presentes} color="#16a34a" bg={dark ? 'rgba(34,197,94,0.14)' : '#ffffff'} />
                        <CounterCard label="Tardanzas" value={resumen.tardanzas} color="#f59e0b" bg={dark ? 'rgba(245,158,11,0.14)' : '#ffffff'} />
                        <CounterCard label="Ausentes" value={resumen.ausentes} color="#dc2626" bg={dark ? 'rgba(239,68,68,0.14)' : '#ffffff'} />
                        <CounterCard label="Total turno" value={resumen.total} color="#672577" bg={dark ? 'rgba(103,37,119,0.18)' : '#ffffff'} />
                    </div>

                    {/* Encargados */}
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
                                                DNI: {e.dni}
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

                    {/* Modal Asignar */}
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
                                        ✕
                                    </button>
                                </div>

                                <div style={{ padding: '14px 22px', borderBottom: `1px solid ${t.tableBorder}`, flexShrink: 0 }}>
                                    <input
                                        autoFocus
                                        value={buscarSediprano}
                                        onChange={e => setBuscarSediprano(e.target.value)}
                                        placeholder="Buscar por nombre o DNI…"
                                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {sedipranos.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>Cargando sedipranos…</div>
                                    ) : sedipranosFiltrados.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>No hay sedipranos disponibles</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {sedipranosFiltrados.map(s => (
                                                <button
                                                    key={s._id}
                                                    onClick={() => asignarEncargado(s._id)}
                                                    disabled={asignando}
                                                    style={{ padding: '12px 22px', border: 'none', borderBottom: `1px solid ${t.tableBorder}`, backgroundColor: 'transparent', textAlign: 'left', cursor: asignando ? 'not-allowed' : 'pointer', color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}
                                                >
                                                    <strong>{s.nombres} {s.apellidos}</strong>
                                                    <span style={{ display: 'block', fontSize: '11px', color: t.bodyText, marginTop: '2px' }}>DNI: {s.dni}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
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
                                            const estado = rosterLocal[p._id] !== undefined ? rosterLocal[p._id] : p.asistencia.estado
                                            const stateColors = {
                                                presente: { text: '#16a34a', bg: dark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)', label: 'Presente' },
                                                tardanza: { text: '#f59e0b', bg: dark ? 'rgba(245,158,11,0.16)' : 'rgba(245,158,11,0.10)', label: 'Tardanza' },
                                                ausente: { text: '#dc2626', bg: dark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.10)', label: 'Ausente' }
                                            }
                                            const colors = stateColors[estado] || stateColors.ausente
                                            const isLoading = rosterLocal[p._id] !== undefined

                                            return (
                                                <tr key={p._id} style={{ backgroundColor: i % 2 ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}`, opacity: isLoading ? 0.7 : 1 }}>
                                                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 600, color: dark ? '#EAD8F5' : '#111827', whiteSpace: 'nowrap' }}>{p.apellidos} {p.nombres}</td>
                                                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#672577', fontWeight: 600 }}>{p.codigoMatricula}</td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', color: colors.text, backgroundColor: colors.bg }}>
                                                            {colors.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '11px 14px', fontSize: '12px', color: t.bodyText }}>
                                                        {p.asistencia.hora ? new Date(p.asistencia.hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => toggleAsistencia(p._id, 'presente')}
                                                                disabled={isLoading}
                                                                style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: estado === 'presente' ? '#D1FAE5' : '#F3F4F6', color: estado === 'presente' ? '#065F46' : '#6B7280', opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s' }}
                                                            >
                                                                Presente
                                                            </button>
                                                            <button
                                                                onClick={() => toggleAsistencia(p._id, 'tardanza')}
                                                                disabled={isLoading}
                                                                style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: estado === 'tardanza' ? '#FEF3C7' : '#F3F4F6', color: estado === 'tardanza' ? '#92400e' : '#6B7280', opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s' }}
                                                            >
                                                                Tardanza
                                                            </button>
                                                            <button
                                                                onClick={() => toggleAsistencia(p._id, 'ausente')}
                                                                disabled={isLoading}
                                                                style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: estado === 'ausente' ? '#FEE2E2' : '#F3F4F6', color: estado === 'ausente' ? '#991B1B' : '#6B7280', opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s' }}
                                                            >
                                                                Ausente
                                                            </button>
                                                        </div>
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
        backgroundColor: 'transparent', color: t.inputText,
        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s'
    }
}

function smallBtnStyle(bg, color) {
    return {
        padding: '5px 10px', borderRadius: '8px', border: 'none',
        backgroundColor: bg, color: color,
        fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
        cursor: 'pointer'
    }
}

function SkeletonRows({ dark, count }) {
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ backgroundColor: i % 2 ? '#f5f3f8' : '#fff', borderBottom: `1px solid #f0edf6` }}>
            {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} style={{ padding: '11px 14px' }}>
                    <div style={{ height: '12px', backgroundColor: '#e5d9ef', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                </td>
            ))}
        </tr>
    ))
}

function getTheme(dark) {
    return dark ? {
        pageBg: '#1a1827',
        titleText: '#fff',
        bodyText: '#b4b0c3',
        cardBg: '#2d2b3e',
        cardBorder: 'rgba(255,255,255,0.05)',
        cardShadow: '0 4px 20px rgba(0,0,0,0.3)',
        tableHead: '#3a3849',
        tableHeadText: '#b4b0c3',
        tableRow: '#2d2b3e',
        tableRowAlt: '#353343',
        tableBorder: 'rgba(255,255,255,0.08)',
        inputBg: '#3a3849',
        inputBorder: 'rgba(255,255,255,0.08)',
        inputText: '#fff',
        dividerText: '#8b86a3',
        overlayBg: 'rgba(0,0,0,0.7)',
        modalBg: '#2d2b3e'
    } : {
        pageBg: '#ffffff',
        titleText: '#1f1030',
        bodyText: '#6b7280',
        cardBg: '#ffffff',
        cardBorder: 'rgba(214,182,223,0.55)',
        cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
        tableHead: '#f8f5fa',
        tableHeadText: '#4a4a6a',
        tableRow: '#ffffff',
        tableRowAlt: '#f8f5fa',
        tableBorder: 'rgba(214,182,223,0.35)',
        inputBg: '#fff',
        inputBorder: 'rgba(214,182,223,0.55)',
        inputText: '#1f1030',
        dividerText: '#d1d5db',
        overlayBg: 'rgba(0,0,0,0.5)',
        modalBg: '#ffffff'
    }
}