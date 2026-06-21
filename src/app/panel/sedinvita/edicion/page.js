// src/app/panel/sedinvita/edicion/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'

export default function Page() {
    const [dark, setDark] = useState(false)
    const t = getTheme(dark)
    
    // Theme
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

    // Estados
    const [ediciones, setEdiciones] = useState([])
    const [edicionActiva, setEdicionActiva] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Formulario
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        nombre: '',
        anio: new Date().getFullYear(),
        estado: 'planificacion',
        fechaInicio: '',
        fechaFin: '',
        activa: false,
        seleccionTurnosAbierta: false
    })

    // Cargar ediciones
    const fetchEdiciones = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/sedinvita/ediciones', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar ediciones')
            setEdiciones(json.data || [])
            const activa = (json.data || []).find(e => e.activa === true)
            setEdicionActiva(activa || null)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEdiciones()
    }, [fetchEdiciones])

    // Resetear formulario
    const resetForm = useCallback(() => {
        setFormData({
            nombre: '',
            anio: new Date().getFullYear(),
            estado: 'planificacion',
            fechaInicio: '',
            fechaFin: '',
            activa: false,
            seleccionTurnosAbierta: false
        })
        setEditingId(null)
        setShowForm(false)
    }, [])

    // Guardar edición
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId 
                ? `/api/sedinvita/ediciones/${editingId}`
                : '/api/sedinvita/ediciones'
            const method = editingId ? 'PATCH' : 'POST'
            
            const payload = { ...formData }
            if (payload.fechaInicio === '') payload.fechaInicio = null
            if (payload.fechaFin === '') payload.fechaFin = null
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al guardar edición')
            
            await fetchEdiciones()
            resetForm()
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Activar edición
    const handleToggleActiva = async (id, currentActiva) => {
        if (currentActiva) return
        if (!confirm('¿Activar esta edición? Se desactivará la actual.')) return
        
        setLoading(true)
        try {
            const res = await fetch(`/api/sedinvita/ediciones/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ activa: true })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al activar edición')
            await fetchEdiciones()
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Abrir/Cerrar selección de turnos
    const handleToggleSeleccionTurnos = async (id, currentValue) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/sedinvita/ediciones/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ seleccionTurnosAbierta: !currentValue })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al actualizar')
            await fetchEdiciones()
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Editar edición
    const handleEdit = (edicion) => {
        setFormData({
            nombre: edicion.nombre || '',
            anio: edicion.anio || new Date().getFullYear(),
            estado: edicion.estado || 'planificacion',
            fechaInicio: edicion.fechaInicio ? new Date(edicion.fechaInicio).toISOString().split('T')[0] : '',
            fechaFin: edicion.fechaFin ? new Date(edicion.fechaFin).toISOString().split('T')[0] : '',
            activa: edicion.activa || false,
            seleccionTurnosAbierta: edicion.seleccionTurnosAbierta || false
        })
        setEditingId(edicion._id)
        setShowForm(true)
    }

    const estados = ['planificacion', 'abierto', 'cerrado', 'finalizado']

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
                            Ediciones SEDInvita
                        </h1>
                        <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                            Configuración de ediciones del evento
                        </p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Botón crear */}
            <div style={{ marginBottom: '16px' }}>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm()
                        } else {
                            setFormData({
                                nombre: '',
                                anio: new Date().getFullYear(),
                                estado: 'planificacion',
                                fechaInicio: '',
                                fechaFin: '',
                                activa: false,
                                seleccionTurnosAbierta: false
                            })
                            setEditingId(null)
                            setShowForm(true)
                        }
                    }}
                    style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#672577',
                        color: '#fff',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    {showForm ? 'Cancelar' : '+ Nueva Edición'}
                </button>
            </div>

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: t.cardShadow
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Nombre *
                            </label>
                            <input
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                placeholder="Ej: SEDInvita 2026"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Año *
                            </label>
                            <input
                                type="number"
                                value={formData.anio}
                                onChange={e => setFormData({ ...formData, anio: Number(e.target.value) })}
                                required
                                min={2000}
                                max={2100}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Estado
                            </label>
                            <select
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                {estados.map(e => (
                                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Activa
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.activa}
                                    onChange={e => setFormData({ ...formData, activa: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#672577', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '12px', color: t.bodyText }}>
                                    {formData.activa ? 'Edición activa' : 'Inactiva'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={formData.fechaInicio}
                                onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={formData.fechaFin}
                                onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                Selección Pública de Turnos
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.seleccionTurnosAbierta}
                                    onChange={e => setFormData({ ...formData, seleccionTurnosAbierta: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#672577', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '12px', color: t.bodyText }}>
                                    {formData.seleccionTurnosAbierta ? 'Abierta' : 'Cerrada'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '9px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#672577',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{
                                padding: '9px 24px',
                                borderRadius: '8px',
                                border: `1px solid ${t.cardBorder}`,
                                backgroundColor: 'transparent',
                                color: t.bodyText,
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Tabla de ediciones */}
            <div style={{
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
                borderRadius: '14px',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['Año', 'Nombre', 'Estado', 'Activa', 'Turnos', 'Acciones'].map(h => (
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
                                <SkeletonRows dark={dark} count={5} />
                            ) : ediciones.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Ico.Calendar />
                                            </div>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                                No hay ediciones registradas
                                            </p>
                                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                                                Crea la primera edición usando el botón "Nueva Edición"
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ediciones.map((ed, i) => {
                                    const isEven = i % 2 === 1
                                    const isActiva = ed.activa === true
                                    return (
                                        <tr
                                            key={ed._id}
                                            style={{ 
                                                backgroundColor: isEven ? t.tableRowAlt : t.tableRow, 
                                                borderBottom: `1px solid ${t.tableBorder}`,
                                                transition: 'background-color 0.1s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                        >
                                            <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: t.titleText }}>
                                                {ed.anio}
                                            </td>
                                            <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: t.inputText }}>
                                                {ed.nombre}
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <span style={{
                                                    fontFamily: 'Poppins,sans-serif', fontSize: '11px',
                                                    padding: '3px 10px', borderRadius: '6px',
                                                    backgroundColor: ed.estado === 'planificacion' ? '#FEF3C7' : 
                                                                  ed.estado === 'abierto' ? '#D1FAE5' :
                                                                  ed.estado === 'cerrado' ? '#FEE2E2' : '#E5E7EB',
                                                    color: ed.estado === 'planificacion' ? '#92400E' :
                                                          ed.estado === 'abierto' ? '#065F46' :
                                                          ed.estado === 'cerrado' ? '#991B1B' : '#374151'
                                                }}>
                                                    {ed.estado?.charAt(0).toUpperCase() + ed.estado?.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                {isActiva ? (
                                                    <span style={{ color: '#065F46', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        Activa
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleActiva(ed._id, isActiva)}
                                                        style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            backgroundColor: '#E5E7EB',
                                                            color: '#374151',
                                                            fontSize: '11px',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Activar
                                                    </button>
                                                )}
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <span style={{ 
                                                    fontSize: '12px', 
                                                    color: ed.seleccionTurnosAbierta ? '#065F46' : '#991B1B',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {ed.seleccionTurnosAbierta ? '🔓 Abierta' : '🔒 Cerrada'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 14px' }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleEdit(ed)}
                                                        title="Editar edición"
                                                        className="p-1.5 rounded-lg transition-colors" 
                                                        style={{ color: 'var(--color-edit)', backgroundColor: dark ? '#2d2b3e' : '#dbeafe' }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    {isActiva && (
                                                        <button
                                                            onClick={() => handleToggleSeleccionTurnos(ed._id, ed.seleccionTurnosAbierta)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: '#FEF3C7',
                                                                color: '#92400E',
                                                                fontSize: '11px',
                                                                fontFamily: 'Poppins, sans-serif',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {ed.seleccionTurnosAbierta ? 'Cerrar' : 'Abrir'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && ediciones.length > 0 && (
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {ediciones.length} edición{ediciones.length !== 1 ? 'es' : ''} registrada{ediciones.length !== 1 ? 's' : ''}
                            {edicionActiva && ` • Activa: ${edicionActiva.nombre} (${edicionActiva.anio})`}
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
// ÍCONOS SVG inline// ─────────────────────────────────────────────
const Ico = {
    Calendar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
}

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────
function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[60, 80, 60, 80, 60, 80].map((w, j) => (
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