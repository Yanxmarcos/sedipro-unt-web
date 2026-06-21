// src/app/panel/sedinvita/grupos/page.js
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

    const [edicionActiva, setEdicionActiva] = useState(null)
    const [turnos, setTurnos] = useState([])
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
    const [grupos, setGrupos] = useState([])
    const [facilitadores, setFacilitadores] = useState([])
    const [postulantesDisponibles, setPostulantesDisponibles] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [fase, setFase] = useState('fase2')

    // Modal grupo
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        nombre: '',
        turnoId: '',
        facilitadores: [],
        postulantes: [],
    })
    const [searchPostulante, setSearchPostulante] = useState('')

    // Modal asignar facilitador (elige un Sediprano existente)
    const [showAsignarFacilitador, setShowAsignarFacilitador] = useState(false)

    const fases = ['fase2', 'fase3', 'fase4']

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const resEdiciones = await fetch('/api/sedinvita/ediciones', { credentials: 'include' })
            const jsonEdiciones = await resEdiciones.json()
            if (!resEdiciones.ok) throw new Error(jsonEdiciones.error || 'Error al cargar ediciones')

            const activa = (jsonEdiciones.data || []).find(e => e.activa === true)
            setEdicionActiva(activa || null)

            if (activa) {
                const resTurnos = await fetch(
                    `/api/sedinvita/turnos?edicionId=${activa._id}&fase=${fase}`,
                    { credentials: 'include' }
                )
                const jsonTurnos = await resTurnos.json()
                if (resTurnos.ok) setTurnos(jsonTurnos.data || [])

                await fetchFacilitadores(activa._id)

                if (turnoSeleccionado) {
                    await fetchGrupos(activa._id, turnoSeleccionado)
                    await fetchPostulantesDisponibles(turnoSeleccionado)
                }
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [fase, turnoSeleccionado])

    useEffect(() => { fetchData() }, [fetchData])

    const fetchFacilitadores = async (edicionId) => {
        try {
            const res = await fetch(`/api/sedinvita/facilitadores?edicionId=${edicionId}`, { credentials: 'include' })
            const json = await res.json()
            if (res.ok) setFacilitadores(json.data || [])
        } catch (err) {
            console.error('Error al cargar facilitadores:', err)
        }
    }

    const fetchGrupos = async (edicionId, turnoId) => {
        try {
            const res = await fetch(
                `/api/sedinvita/grupos?edicionId=${edicionId}&turnoId=${turnoId}&fase=${fase}`,
                { credentials: 'include' }
            )
            const json = await res.json()
            if (res.ok) setGrupos(json.data || [])
        } catch (err) {
            console.error('Error al cargar grupos:', err)
        }
    }

    const fetchPostulantesDisponibles = async (turnoId) => {
        try {
            const res = await fetch(
                `/api/sedinvita/grupos/postulantes-disponibles?turnoId=${turnoId}`,
                { credentials: 'include' }
            )
            const json = await res.json()
            if (res.ok) setPostulantesDisponibles(json.data || [])
        } catch (err) {
            console.error('Error al cargar postulantes:', err)
        }
    }

    const handleSubmitGrupo = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId ? `/api/sedinvita/grupos/${editingId}` : '/api/sedinvita/grupos'
            const method = editingId ? 'PATCH' : 'POST'

            const payload = { ...formData, edicionId: edicionActiva._id, fase }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al guardar grupo')

            await fetchData()
            resetForm()
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGrupo = async (id) => {
        if (!confirm('¿Eliminar este grupo? Los postulantes quedarán sin grupo asignado.')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/sedinvita/grupos/${id}`, { method: 'DELETE', credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al eliminar grupo')
            await fetchData()
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAsignarFacilitador = async (sedipranoId) => {
        const res = await fetch('/api/sedinvita/facilitadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ edicionId: edicionActiva._id, sedipranoId }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al asignar facilitador')
        await fetchFacilitadores(edicionActiva._id)
        return json
    }

    const handleEliminarFacilitador = async (id) => {
        if (!confirm('¿Quitar a este facilitador? Solo si no tiene grupos asignados.')) return
        try {
            const res = await fetch(`/api/sedinvita/facilitadores/${id}`, { method: 'DELETE', credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al eliminar facilitador')
            await fetchFacilitadores(edicionActiva._id)
        } catch (err) {
            alert(err.message)
        }
    }

    const resetForm = () => {
        setFormData({ nombre: '', turnoId: '', facilitadores: [], postulantes: [] })
        setEditingId(null)
        setShowModal(false)
        setSearchPostulante('')
    }

    const filteredPostulantes = postulantesDisponibles.filter(p => {
        const search = searchPostulante.toLowerCase()
        return (
            p.nombres?.toLowerCase().includes(search) ||
            p.apellidos?.toLowerCase().includes(search) ||
            p.codigoMatricula?.toLowerCase().includes(search) ||
            p.correoElectronico?.toLowerCase().includes(search)
        )
    })

    const togglePostulante = (postulanteId) => {
        setFormData(prev => {
            const current = prev.postulantes || []
            return current.includes(postulanteId)
                ? { ...prev, postulantes: current.filter(id => id !== postulanteId) }
                : { ...prev, postulantes: [...current, postulanteId] }
        })
    }

    const toggleFacilitadorEnGrupo = (facilitadorId) => {
        setFormData(prev => {
            const current = prev.facilitadores || []
            return current.includes(facilitadorId)
                ? { ...prev, facilitadores: current.filter(id => id !== facilitadorId) }
                : { ...prev, facilitadores: [...current, facilitadorId] }
        })
    }

    return (
        <div style={{ minHeight: '100%', padding: '20px 16px', backgroundColor: t.pageBg, transition: 'background-color 0.3s', fontFamily: 'Poppins, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: t.titleText, margin: 0, lineHeight: 1.2 }}>
                    Grupos y Facilitadores
                </h1>
                <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                    Asignación de grupos y facilitadores por turno
                    {edicionActiva && ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            {!edicionActiva && !error && (
                <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '56px 20px', textAlign: 'center', boxShadow: t.cardShadow }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ico.Users />
                        </div>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>No hay edición activa</p>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>Activa una edición para gestionar grupos y facilitadores</p>
                    </div>
                </div>
            )}

            {edicionActiva && (
                <>
                    {/* Filtros y acciones */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText }}>Fase:</label>
                            <select
                                value={fase}
                                onChange={e => { setFase(e.target.value); setTurnoSeleccionado(null); setGrupos([]) }}
                                style={{
                                    padding: '6px 24px 6px 12px', // Padding derecho extra
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif',
                                    cursor: 'pointer',
                                    minWidth: '110px' // Ancho mínimo
                                }}
                            >
                                {fases.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText }}>Turno:</label>
                            <select
                                value={turnoSeleccionado || ''}
                                onChange={e => {
                                    const value = e.target.value
                                    setTurnoSeleccionado(value || null)
                                    if (value) {
                                        fetchGrupos(edicionActiva._id, value)
                                        fetchPostulantesDisponibles(value)
                                    } else {
                                        setGrupos([]); setPostulantesDisponibles([])
                                    }
                                }}
                                style={{
                                    padding: '6px 24px 6px 12px', // Padding derecho extra
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif',
                                    cursor: 'pointer',
                                    minWidth: '110px' // Ancho mínimo
                                }}
                            >
                                <option value="">Seleccionar turno</option>
                                {turnos.map(tn => (
                                    <option key={tn._id} value={tn._id}>
                                        {tn.nombre} ({tn.horarioInicio || '--'} - {tn.horarioFin || '--'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1 }} />

                        {turnoSeleccionado && (
                            <button
                                onClick={() => {
                                    setFormData({ nombre: '', turnoId: turnoSeleccionado, facilitadores: [], postulantes: [] })
                                    setEditingId(null)
                                    setShowModal(true)
                                }}
                                style={primaryBtnStyle(false)}
                            >
                                + Nuevo Grupo
                            </button>
                        )}
                    </div>

                    {/* Modal de Grupo */}
                    {showModal && (
                        <div style={overlayStyle(t)} onClick={e => { if (e.target === e.currentTarget) resetForm() }}>
                            <div style={modalStyle(t)}>
                                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: t.titleText, margin: '0 0 16px 0' }}>
                                    {editingId ? 'Editar Grupo' : 'Nuevo Grupo'}
                                </h2>
                                <form onSubmit={handleSubmitGrupo}>
                                    <div style={{ display: 'grid', gap: '14px' }}>
                                        <div>
                                            <label style={labelStyle(t)}>Nombre del Grupo</label>
                                            <input
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                placeholder="Ej: Grupo A"
                                                style={inputStyle(t, dark)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={labelStyle(t)}>Facilitador(es)</label>
                                            <div style={checklistBoxStyle(t)}>
                                                {facilitadores.length === 0 ? (
                                                    <p style={{ fontSize: '12px', color: t.bodyText, textAlign: 'center', padding: '12px 0' }}>
                                                        No hay facilitadores asignados a esta edición. Agrégalos abajo en la sección "Facilitadores".
                                                    </p>
                                                ) : (
                                                    facilitadores.map(f => {
                                                        const isSelected = (formData.facilitadores || []).includes(f._id)
                                                        return (
                                                            <label key={f._id} style={checklistItemStyle(isSelected)}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleFacilitadorEnGrupo(f._id)}
                                                                    style={{ accentColor: '#672577', cursor: 'pointer' }}
                                                                />
                                                                <div>
                                                                    <span style={{ fontSize: '13px', color: t.inputText }}>{f.nombres} {f.apellidos}</span>
                                                                    <span style={{ fontSize: '11px', color: t.bodyText, marginLeft: '8px' }}>DNI: {f.dni}</span>
                                                                </div>
                                                            </label>
                                                        )
                                                    })
                                                )}
                                            </div>
                                            <p style={{ fontSize: '11px', color: t.bodyText, marginTop: '4px' }}>
                                                {formData.facilitadores?.length || 0} facilitador{formData.facilitadores?.length !== 1 ? 'es' : ''} seleccionado{formData.facilitadores?.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <div>
                                            <label style={labelStyle(t)}>Postulantes Asignados</label>
                                            <div style={{ marginBottom: '8px' }}>
                                                <input
                                                    value={searchPostulante}
                                                    onChange={e => setSearchPostulante(e.target.value)}
                                                    placeholder="Buscar postulante..."
                                                    style={inputStyle(t, dark)}
                                                />
                                            </div>
                                            <div style={checklistBoxStyle(t)}>
                                                {filteredPostulantes.length === 0 ? (
                                                    <p style={{ fontSize: '12px', color: t.bodyText, textAlign: 'center', padding: '12px 0' }}>No hay postulantes disponibles en este turno</p>
                                                ) : (
                                                    filteredPostulantes.map(p => {
                                                        const isSelected = (formData.postulantes || []).includes(p._id)
                                                        return (
                                                            <label key={p._id} style={checklistItemStyle(isSelected)}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => togglePostulante(p._id)}
                                                                    style={{ accentColor: '#672577', cursor: 'pointer' }}
                                                                />
                                                                <div>
                                                                    <span style={{ fontSize: '13px', color: t.inputText }}>{p.apellidos} {p.nombres}</span>
                                                                    <span style={{ fontSize: '11px', color: t.bodyText, marginLeft: '8px' }}>{p.codigoMatricula}</span>
                                                                </div>
                                                            </label>
                                                        )
                                                    })
                                                )}
                                            </div>
                                            <p style={{ fontSize: '11px', color: t.bodyText, marginTop: '4px' }}>
                                                {formData.postulantes?.length || 0} postulantes seleccionados
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading || (formData.facilitadores || []).length === 0}
                                            style={primaryBtnStyle(loading || (formData.facilitadores || []).length === 0, true)}
                                        >
                                            {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                                        </button>
                                        <button type="button" onClick={resetForm} style={secondaryBtnStyle(t)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal asignar facilitador (elige Sediprano existente) */}
                    {showAsignarFacilitador && (
                        <ModalAsignarFacilitador
                            dark={dark}
                            edicion={edicionActiva}
                            facilitadoresActuales={facilitadores}
                            onClose={() => setShowAsignarFacilitador(false)}
                            onAsignar={handleAsignarFacilitador}
                        />
                    )}

                    {/* Tabla de Grupos */}
                    {turnoSeleccionado ? (
                        <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
                            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: t.tableHead }}>
                                            {['Grupo', 'Facilitadores', 'Postulantes', 'Acciones'].map(h => (
                                                <th key={h} style={thStyle(t)}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <SkeletonRows dark={dark} count={5} />
                                        ) : grupos.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Ico.Users />
                                                        </div>
                                                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>No hay grupos para este turno</p>
                                                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>Crea el primer grupo usando el botón "Nuevo Grupo"</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            grupos.map((grupo, i) => {
                                                const isEven = i % 2 === 1
                                                return (
                                                    <tr
                                                        key={grupo._id}
                                                        style={{ backgroundColor: isEven ? t.tableRowAlt : t.tableRow, borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s' }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                                    >
                                                        <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: t.titleText }}>
                                                            {grupo.nombre || 'Sin nombre'}
                                                        </td>
                                                        <td style={{ padding: '11px 14px' }}>
                                                            {(grupo.facilitadores || []).length === 0 ? (
                                                                <span style={{ fontSize: '12px', color: '#dc2626' }}>Sin facilitador</span>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    {grupo.facilitadores.map(f => (
                                                                        <span key={f._id} style={{ fontSize: '12px', color: t.inputText }}>
                                                                            {f.nombres} {f.apellidos} <span style={{ color: t.bodyText, fontSize: '11px' }}>· {f.dni}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '11px 14px' }}>
                                                            <span style={{ fontSize: '12px', color: t.inputText }}>{grupo.postulantes?.length || 0} postulantes</span>
                                                            {grupo.postulantes && grupo.postulantes.length > 0 && (
                                                                <div style={{ fontSize: '11px', color: t.bodyText, marginTop: '4px' }}>
                                                                    {grupo.postulantes.slice(0, 3).map(p => `${p.apellidos} ${p.nombres}`).join(', ')}
                                                                    {grupo.postulantes.length > 3 && ` y ${grupo.postulantes.length - 3} más`}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '11px 14px' }}>
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            nombre: grupo.nombre || '',
                                                                            turnoId: grupo.turnoId,
                                                                            facilitadores: grupo.facilitadores?.map(f => f._id) || [],
                                                                            postulantes: grupo.postulantes?.map(p => p._id) || [],
                                                                        })
                                                                        setEditingId(grupo._id)
                                                                        setShowModal(true)
                                                                    }}
                                                                    style={smallBtnStyle('#E0E7FF', '#3730A3')}
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button onClick={() => handleDeleteGrupo(grupo._id)} style={smallBtnStyle('#FEE2E2', '#991B1B')}>
                                                                    Eliminar
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
                            {!loading && grupos.length > 0 && (
                                <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                                        {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} en este turno
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '56px 20px', textAlign: 'center', boxShadow: t.cardShadow, marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ico.Ticket />
                                </div>
                                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>Selecciona un turno para ver sus grupos</p>
                                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>Elige un turno del filtro superior para comenzar</p>
                            </div>
                        </div>
                    )}

                    {/* Listado de Facilitadores de la edición */}
                    <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '16px', boxShadow: t.cardShadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                            <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: t.titleText, margin: 0 }}>
                                Facilitadores de esta edición
                            </p>
                            <button onClick={() => setShowAsignarFacilitador(true)} style={primaryBtnStyle(false)}>
                                + Agregar facilitador
                            </button>
                        </div>

                        {facilitadores.length === 0 ? (
                            <p style={{ fontSize: '13px', color: t.dividerText, textAlign: 'center', padding: '20px 0' }}>
                                Aún no hay facilitadores asignados
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {facilitadores.map(f => (
                                    <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', backgroundColor: dark ? 'rgba(103,37,119,0.10)' : 'rgba(103,37,119,0.04)' }}>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0 }}>{f.nombres} {f.apellidos}</p>
                                            <p style={{ fontSize: '11px', color: t.bodyText, margin: '2px 0 0 0' }}>
                                                DNI: {f.dni} · {f.totalGrupos || 0} grupo{f.totalGrupos !== 1 ? 's' : ''} asignado{f.totalGrupos !== 1 ? 's' : ''}
                                                {f.grupos?.length > 0 && ` (${f.grupos.join(', ')})`}
                                            </p>
                                        </div>
                                        <button onClick={() => handleEliminarFacilitador(f._id)} style={smallBtnStyle('#FEE2E2', '#991B1B')}>
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

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
// MODAL: asignar facilitador desde Sedipranos (igual patrón que Asistencias)
// ─────────────────────────────────────────────
function ModalAsignarFacilitador({ dark, edicion, facilitadoresActuales, onClose, onAsignar }) {
    const t = getTheme(dark)
    const [sedipranos, setSedipranos] = useState([])
    const [loadingSed, setLoadingSed] = useState(true)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [saving, setSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // A diferencia de los encargados de asistencia, aquí SÍ se puede elegir
    // cualquier área, incluida Directiva.
    const yaAsignadosIds = new Set(facilitadoresActuales.map(f => f.sedipranoId?.toString()))

    useEffect(() => {
        fetch('/api/sedipranos', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setSedipranos(d.data || []))
            .catch(() => {})
            .finally(() => setLoadingSed(false))
    }, [])

    const filtrados = sedipranos.filter(s => {
        const q = search.toLowerCase()
        return (
            s.nombres?.toLowerCase().includes(q) ||
            s.apellidos?.toLowerCase().includes(q) ||
            s.dni?.includes(q) ||
            s.area?.toLowerCase().includes(q)
        )
    })

    async function handleAsignar() {
        if (!selected) return
        setSaving(true)
        setErrorMsg('')
        try {
            await onAsignar(selected._id)
            onClose()
        } catch (err) {
            setErrorMsg(err.message || 'Error al asignar facilitador')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1010, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
            <div style={{ backgroundColor: t.modalBg, border: `1px solid ${t.cardBorder}`, borderRadius: '18px', width: '100%', maxWidth: '460px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: t.cardShadow, animation: 'slideUp 0.2s ease', overflow: 'hidden' }}>

                <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${t.tableBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '16px', color: t.titleText, margin: 0 }}>
                            Agregar facilitador
                        </h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: '2px 0 0 0' }}>
                            {edicion.nombre} ({edicion.anio})
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: t.bodyText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, DNI o área…"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.inputText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loadingSed ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>Cargando sedipranos…</div>
                    ) : filtrados.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: t.dividerText, fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                            {search ? 'Sin resultados' : 'No hay sedipranos disponibles'}
                        </div>
                    ) : filtrados.map(s => {
                        const yaAsignado = yaAsignadosIds.has(s._id?.toString())
                        const isSel = selected?._id === s._id
                        return (
                            <button
                                key={s._id}
                                onClick={() => !yaAsignado && setSelected(isSel ? null : s)}
                                disabled={yaAsignado}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', border: 'none', textAlign: 'left', cursor: yaAsignado ? 'not-allowed' : 'pointer', backgroundColor: isSel ? (dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.08)') : 'transparent', borderBottom: `1px solid ${t.tableBorder}`, transition: 'background-color 0.1s', opacity: yaAsignado ? 0.45 : 1 }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isSel ? 'linear-gradient(135deg, #672577, #3454A1)' : (dark ? 'rgba(103,37,119,0.20)' : 'rgba(103,37,119,0.10)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isSel ? '#fff' : '#672577', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '13px' }}>
                                    {initials(s.nombres, s.apellidos)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: t.inputText, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.nombres} {s.apellidos}
                                        {yaAsignado && <span style={{ fontSize: '10px', marginLeft: '6px', color: '#10B981', fontWeight: 700 }}>• ya es facilitador</span>}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: t.bodyText, margin: 0 }}>{s.area} · DNI: {s.dni}</p>
                                </div>
                                {isSel && (
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
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg, color: t.labelText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleAsignar}
                        disabled={!selected || saving}
                        style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: selected && !saving ? '#672577' : '#E5E7EB', color: selected && !saving ? '#fff' : '#9CA3AF', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: selected && !saving ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                    >
                        {saving ? <><Ico.Spinner /> Asignando…</> : <><Ico.UserPlus /> {selected ? `Asignar a ${selected.nombres}` : 'Selecciona uno'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

function initials(nombres, apellidos) {
    const n = (nombres || '').trim()[0] || ''
    const a = (apellidos || '').trim()[0] || ''
    return `${n}${a}`.toUpperCase()
}

// ─────────────────────────────────────────────
// ESTILOS REUTILIZABLES
// ─────────────────────────────────────────────
function selectStyle(t, dark) {
    return { padding: '6px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
}
function inputStyle(t, dark) {
    return { width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${t.inputBorder}`, backgroundColor: dark ? '#2d2b3e' : '#fff', color: t.inputText, fontSize: '13px', fontFamily: 'Poppins, sans-serif' }
}
function labelStyle(t) {
    return { fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }
}
function checklistBoxStyle(t) {
    return { maxHeight: '200px', overflowY: 'auto', border: `1px solid ${t.inputBorder}`, borderRadius: '8px', padding: '8px' }
}
function checklistItemStyle(isSelected) {
    return { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', backgroundColor: isSelected ? 'rgba(103,37,119,0.08)' : 'transparent', transition: 'background-color 0.2s' }
}
function overlayStyle(t) {
    return { position: 'fixed', inset: 0, backgroundColor: t.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', animation: 'fadeIn 0.2s ease' }
}
function modalStyle(t) {
    return { backgroundColor: t.modalBg, borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${t.cardBorder}`, maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.25s ease' }
}
function primaryBtnStyle(disabled, fullWidth) {
    return { padding: '9px 18px', borderRadius: '10px', border: 'none', backgroundColor: disabled ? '#D1D5DB' : '#672577', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', flex: fullWidth ? 1 : undefined }
}
function secondaryBtnStyle(t) {
    return { padding: '9px 24px', borderRadius: '8px', border: `1px solid ${t.cardBorder}`, backgroundColor: 'transparent', color: t.bodyText, fontFamily: 'Poppins, sans-serif', fontSize: '13px', cursor: 'pointer' }
}
function smallBtnStyle(bg, color) {
    return { padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: bg, color, fontSize: '11px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }
}
function thStyle(t) {
    return { padding: '11px 14px', textAlign: 'left', fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 700, color: t.tableHeadText, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `1px solid ${t.tableBorder}` }
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
    Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Ticket:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/></svg>,
    Close:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Spinner:  () => <svg width="14" height="14" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M18 4a14 14 0 0 1 14 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>,
    UserPlus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
}

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────
function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[80, 120, 100, 100].map((w, j) => (
                <td key={j} style={{ padding: '13px 14px' }}>
                    <div style={{ height: '12px', borderRadius: '6px', width: `${w}px`, maxWidth: '100%', backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                </td>
            ))}
        </tr>
    ))
}