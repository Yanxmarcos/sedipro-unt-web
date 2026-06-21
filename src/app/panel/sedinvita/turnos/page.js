// src/app/panel/sedinvita/turnos/page.js
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

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
    const [edicionActiva, setEdicionActiva] = useState(null)
    const [turnos, setTurnos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [faseFilter, setFaseFilter] = useState('fase2')
    
    // Modal
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        edicionId: '',
        fase: 'fase2',
        nombre: '',
        horarioInicio: '',
        horarioFin: '',
        cupo: '',
        estado: 'abierto'
    })

    const fases = ['fase2', 'fase3', 'fase4']
    const estados = ['abierto', 'lleno', 'cerrado']

    // Estados para postulantes y estadísticas
    const [estadisticas, setEstadisticas] = useState(null)
    const [postulantes, setPostulantes] = useState([]) // Almacena TODOS los postulantes
    const [filtroPostulantes, setFiltroPostulantes] = useState('todos')
    const [busquedaPostulante, setBusquedaPostulante] = useState('')
    const [loadingStats, setLoadingStats] = useState(false)
    const [loadingPostulantes, setLoadingPostulantes] = useState(false)
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)

    // Filtrar postulantes localmente (client-side)
    const postulantesFiltrados = useMemo(() => {
        let resultado = postulantes
        
        // Filtrar por búsqueda (código, nombre o apellido)
        if (busquedaPostulante.trim()) {
            const busqueda = busquedaPostulante.trim().toLowerCase()
            resultado = resultado.filter(p => 
                p.codigoMatricula?.toLowerCase().includes(busqueda) ||
                p.nombres?.toLowerCase().includes(busqueda) ||
                p.apellidos?.toLowerCase().includes(busqueda) ||
                `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
                `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busqueda)
            )
        }
        
        return resultado
    }, [postulantes, busquedaPostulante])

    // Cargar edición activa
    const fetchEdicionActiva = useCallback(async () => {
        try {
            const res = await fetch('/api/sedinvita/ediciones', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar ediciones')
            const activa = (json.data || []).find(e => e.activa === true)
            setEdicionActiva(activa || null)
            return activa
        } catch (err) {
            console.error(err)
            setError(err.message)
            return null
        }
    }, [])

    // Cargar turnos
    const fetchTurnos = useCallback(async (edicionId, fase) => {
        if (!edicionId) return
        setLoading(true)
        try {
            const res = await fetch(
                `/api/sedinvita/turnos?edicionId=${edicionId}&fase=${fase}`,
                { credentials: 'include' }
            )
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar turnos')
            setTurnos(json.data || [])
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Función para cargar estadísticas
    const fetchEstadisticas = useCallback(async (fase) => {
        if (!edicionActiva) return
        setLoadingStats(true)
        try {
            const res = await fetch(
                `/api/sedinvita/turnos/estadisticas?fase=${fase}&edicionId=${edicionActiva._id}`,
                { credentials: 'include' }
            )
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar estadísticas')
            setEstadisticas(json.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingStats(false)
        }
    }, [edicionActiva])

    // Función para cargar postulantes (SOLO cuando cambia la fase o el filtro de estado)
    const fetchPostulantes = useCallback(async (fase, filtro) => {
        if (!edicionActiva) return
        setLoadingPostulantes(true)
        try {
            const params = new URLSearchParams({
                fase,
                filtro: filtro || 'todos',
                busqueda: '' // Ya no enviamos búsqueda al servidor
            })
            const res = await fetch(
                `/api/sedinvita/turnos/postulantes?${params}`,
                { credentials: 'include' }
            )
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al cargar postulantes')
            setPostulantes(json.data.postulantes || [])
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoadingPostulantes(false)
        }
    }, [edicionActiva])

    // Inicializar
    useEffect(() => {
        const init = async () => {
            const activa = await fetchEdicionActiva()
            if (activa) {
                await fetchTurnos(activa._id, faseFilter)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [fetchEdicionActiva, fetchTurnos, faseFilter])

    // Cargar estadísticas y postulantes cuando cambia la fase o el filtro de estado
    useEffect(() => {
        if (edicionActiva) {
            fetchEstadisticas(faseFilter)
            fetchPostulantes(faseFilter, filtroPostulantes)
        }
    }, [edicionActiva, faseFilter, filtroPostulantes, fetchEstadisticas, fetchPostulantes])

    // Guardar turno
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId 
                ? `/api/sedinvita/turnos/${editingId}`
                : '/api/sedinvita/turnos'
            const method = editingId ? 'PATCH' : 'POST'
            
            const payload = {
                ...formData,
                edicionId: edicionActiva._id,
                cupo: Number(formData.cupo)
            }
            if (payload.horarioInicio === '') payload.horarioInicio = undefined
            if (payload.horarioFin === '') payload.horarioFin = undefined
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al guardar turno')
            
            await fetchTurnos(edicionActiva._id, faseFilter)
            resetForm()
            setMensajeConfirmacion('Turno guardado correctamente')
            setTimeout(() => setMensajeConfirmacion(null), 3000)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Editar turno
    const handleEdit = (turno) => {
        setFormData({
            edicionId: turno.edicionId,
            fase: turno.fase || 'fase2',
            nombre: turno.nombre || '',
            horarioInicio: turno.horarioInicio || '',
            horarioFin: turno.horarioFin || '',
            cupo: turno.cupo || '',
            estado: turno.estado || 'abierto'
        })
        setEditingId(turno._id)
        setShowModal(true)
    }

    // Eliminar turno
    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este turno? Solo se permite si no tiene inscritos.')) return
        
        setLoading(true)
        try {
            const res = await fetch(`/api/sedinvita/turnos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al eliminar turno')
            
            await fetchTurnos(edicionActiva._id, faseFilter)
            setMensajeConfirmacion('Turno eliminado correctamente')
            setTimeout(() => setMensajeConfirmacion(null), 3000)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Eliminar turno de un postulante
    const handleEliminarTurno = async (postulante) => {
        if (!confirm(`¿Estás seguro de eliminar el turno de ${postulante.nombres} ${postulante.apellidos} (${postulante.codigoMatricula})?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/sedinvita/turnos/eliminar-turno?codigo=${postulante.codigoMatricula}&turnoId=${postulante.turno?.id}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Error al eliminar turno');

            // Recargar datos (sin la búsqueda)
            await Promise.all([
                fetchTurnos(edicionActiva._id, faseFilter),
                fetchEstadisticas(faseFilter),
                fetchPostulantes(faseFilter, filtroPostulantes)
            ]);
            
            setMensajeConfirmacion('Turno eliminado correctamente')
            setTimeout(() => setMensajeConfirmacion(null), 3000)
        } catch (err) {
            console.error(err);
            alert('❌ Error al eliminar turno: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            edicionId: edicionActiva?._id || '',
            fase: 'fase2',
            nombre: '',
            horarioInicio: '',
            horarioFin: '',
            cupo: '',
            estado: 'abierto'
        })
        setEditingId(null)
        setShowModal(false)
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
                            Turnos SEDInvita
                        </h1>
                        <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                            Administración de turnos por fase
                            {edicionActiva && ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
                        </p>
                    </div>
                </div>
            </div>

            {mensajeConfirmacion && (
                <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: dark ? 'rgba(34,197,94,0.15)' : '#ecfdf5', 
                    color: '#065f46', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '13px',
                    border: '1px solid #6ee7b7'
                }}>
                    {mensajeConfirmacion}
                </div>
            )}

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

            {/* Sin edición activa */}
            {!edicionActiva && !error && (
                <div style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: '14px',
                    padding: '56px 20px',
                    textAlign: 'center',
                    boxShadow: t.cardShadow
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ico.Ticket />
                        </div>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                            No hay edición activa
                        </p>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                            Activa una edición en la sección "Ediciones" para gestionar turnos
                        </p>
                    </div>
                </div>
            )}

            {/* Contenido con edición activa */}
            {edicionActiva && (
                <>
                    {/* Barra de filtros y acciones */}
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '12px', 
                        marginBottom: '16px',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText }}>
                                Fase:
                            </label>
                            <select
                                value={faseFilter}
                                onChange={e => setFaseFilter(e.target.value)}
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
                                {fases.map(f => (
                                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }} />
                        <button
                            onClick={() => {
                                setFormData({
                                    edicionId: edicionActiva._id,
                                    fase: faseFilter,
                                    nombre: '',
                                    horarioInicio: '',
                                    horarioFin: '',
                                    cupo: '',
                                    estado: 'abierto'
                                })
                                setEditingId(null)
                                setShowModal(true)
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
                            + Nuevo Turno
                        </button>
                    </div>

                    {/* Modal de turno */}
                    {showModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: t.overlayBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                            animation: 'fadeIn 0.2s ease'
                        }} onClick={e => {
                            if (e.target === e.currentTarget) resetForm()
                        }}>
                            <div style={{
                                backgroundColor: t.modalBg,
                                borderRadius: '16px',
                                padding: '24px',
                                maxWidth: '500px',
                                width: '100%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                border: `1px solid ${t.cardBorder}`,
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                animation: 'slideUp 0.25s ease'
                            }}>
                                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: t.titleText, margin: '0 0 16px 0' }}>
                                    {editingId ? 'Editar Turno' : 'Nuevo Turno'}
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: 'grid', gap: '14px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                                Nombre *
                                            </label>
                                            <input
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                required
                                                placeholder="Ej: Turno Mañana"
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
                                                Fase *
                                            </label>
                                            <select
                                                value={formData.fase}
                                                onChange={e => setFormData({ ...formData, fase: e.target.value })}
                                                required
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
                                                {fases.map(f => (
                                                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: t.labelText, display: 'block', marginBottom: '4px' }}>
                                                Horario Inicio
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.horarioInicio}
                                                onChange={e => setFormData({ ...formData, horarioInicio: e.target.value })}
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
                                                Horario Fin
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.horarioFin}
                                                onChange={e => setFormData({ ...formData, horarioFin: e.target.value })}
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
                                                Cupo *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.cupo}
                                                onChange={e => setFormData({ ...formData, cupo: e.target.value })}
                                                required
                                                placeholder="Ej: 30"
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
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                flex: 1,
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
                            </div>
                        </div>
                    )}

                    {/* Tabla de turnos */}
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
                                        {['Nombre', 'Fase', 'Horario', 'Cupo', 'Inscritos', 'Estado', 'Acciones'].map(h => (
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
                                    ) : turnos.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Ico.Ticket />
                                                    </div>
                                                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                                        No hay turnos para {faseFilter}
                                                    </p>
                                                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                                                        Crea el primer turno usando el botón "Nuevo Turno"
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        turnos.map((turno, i) => {
                                            const isEven = i % 2 === 1
                                            const inscritos = turno.inscritos || 0
                                            const cupo = turno.cupo || 0
                                            const disponible = cupo - inscritos
                                            
                                            return (
                                                <tr
                                                    key={turno._id}
                                                    style={{ 
                                                        backgroundColor: isEven ? t.tableRowAlt : t.tableRow, 
                                                        borderBottom: `1px solid ${t.tableBorder}`,
                                                        transition: 'background-color 0.1s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                                >
                                                    <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 600, color: t.titleText }}>
                                                        {turno.nombre}
                                                    </td>
                                                    <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText }}>
                                                        {turno.fase?.charAt(0).toUpperCase() + turno.fase?.slice(1)}
                                                    </td>
                                                    <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.inputText }}>
                                                        {turno.horarioInicio || '—'} {turno.horarioFin ? `- ${turno.horarioFin}` : ''}
                                                    </td>
                                                    <td style={{ padding: '11px 14px', fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.inputText }}>
                                                        {cupo}
                                                    </td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <span style={{
                                                            fontFamily: 'Poppins,sans-serif', fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: disponible > 0 ? '#065F46' : '#991B1B'
                                                        }}>
                                                            {inscritos}
                                                            {disponible > 0 && ` (${disponible} disp.)`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <span style={{
                                                            fontFamily: 'Poppins,sans-serif', fontSize: '11px',
                                                            padding: '3px 10px', borderRadius: '6px',
                                                            backgroundColor: turno.estado === 'abierto' ? '#D1FAE5' :
                                                                          turno.estado === 'lleno' ? '#FEF3C7' : '#FEE2E2',
                                                            color: turno.estado === 'abierto' ? '#065F46' :
                                                                  turno.estado === 'lleno' ? '#92400E' : '#991B1B'
                                                        }}>
                                                            {turno.estado?.charAt(0).toUpperCase() + turno.estado?.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => handleEdit(turno)}
                                                                title="Editar turno"
                                                                className="p-1.5 rounded-lg transition-colors" 
                                                                style={{ color: 'var(--color-edit)', backgroundColor: dark ? '#2d2b3e' : '#dbeafe' }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            {inscritos === 0 && (
                                                                <button
                                                                    onClick={() => handleDelete(turno._id)}
                                                                    style={{
                                                                        padding: '4px 10px',
                                                                        borderRadius: '6px',
                                                                        border: 'none',
                                                                        backgroundColor: '#FEE2E2',
                                                                        color: '#991B1B',
                                                                        fontSize: '11px',
                                                                        fontFamily: 'Poppins, sans-serif',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Eliminar
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
                        {!loading && turnos.length > 0 && (
                            <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                                    {turnos.length} turno{turnos.length !== 1 ? 's' : ''} en {faseFilter}
                                    {edicionActiva && ` • Edición: ${edicionActiva.nombre} (${edicionActiva.anio})`}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Panel de estadísticas */}
            {edicionActiva && estadisticas && !loadingStats && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    marginTop: '20px'
                }}>
                    <div style={{
                        backgroundColor: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: t.cardShadow
                    }}>
                        <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>Total Postulantes</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: t.titleText, margin: '4px 0' }}>
                            {estadisticas.resumen.totalPostulantes}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: t.cardShadow
                    }}>
                        <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>Con turno</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#059669', margin: '4px 0' }}>
                            {estadisticas.resumen.conTurno}
                        </p>
                        <p style={{ fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {estadisticas.resumen.porcentajeAvance}% del total
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: t.cardShadow
                    }}>
                        <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>Sin turno</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', margin: '4px 0' }}>
                            {estadisticas.resumen.sinTurno}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: t.cardShadow
                    }}>
                        <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>Cupos</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: t.titleText, margin: '4px 0' }}>
                            {estadisticas.resumen.totalInscritos}/{estadisticas.resumen.totalCupos}
                        </p>
                        <p style={{ fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {estadisticas.resumen.porcentajeOcupacion}% ocupados
                        </p>
                    </div>
                </div>
            )}

            {/* Lista de postulantes */}
            {edicionActiva && (
                <div style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    boxShadow: t.cardShadow
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: t.titleText, margin: 0 }}>
                            Postulantes por turno
                            {postulantes.length > 0 && (
                                <span style={{ fontSize: '12px', fontWeight: 'normal', color: t.bodyText, marginLeft: '8px' }}>
                                    ({postulantes.length} total)
                                </span>
                            )}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <select
                                value={filtroPostulantes}
                                onChange={e => {
                                    setFiltroPostulantes(e.target.value)
                                    setBusquedaPostulante('') // Limpiar búsqueda al cambiar filtro
                                }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="todos">Todos</option>
                                <option value="con_turno">Con turno</option>
                                <option value="sin_turno">Sin turno</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Buscar código, nombre..."
                                value={busquedaPostulante}
                                onChange={e => setBusquedaPostulante(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: dark ? '#2d2b3e' : '#fff',
                                    color: t.inputText,
                                    fontSize: '12px',
                                    minWidth: '200px'
                                }}
                            />
                            {busquedaPostulante && (
                                <button
                                    onClick={() => setBusquedaPostulante('')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: `1px solid ${t.inputBorder}`,
                                        backgroundColor: 'transparent',
                                        color: t.bodyText,
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    ✕ Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {loadingPostulantes ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: t.bodyText }}>
                            Cargando postulantes...
                        </div>
                    ) : postulantes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: t.bodyText }}>
                            No hay postulantes para esta fase
                        </div>
                    ) : postulantesFiltrados.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: t.bodyText }}>
                            No hay postulantes que coincidan con la búsqueda
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: t.tableHead }}>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px' }}>Código</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px' }}>Postulante</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px' }}>Contacto</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px' }}>Estado</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px' }}>Turno</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'center', color: t.tableHeadText, fontSize: '11px' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postulantesFiltrados.map((p, i) => (
                                            <tr key={p.codigoMatricula} style={{
                                                borderBottom: i < postulantesFiltrados.length - 1 ? `1px solid ${t.tableBorder}` : 'none',
                                                backgroundColor: i % 2 === 0 ? t.tableRow : t.tableRowAlt
                                            }}>
                                                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: t.bodyText }}>
                                                    {p.codigoMatricula}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontWeight: 500, color: t.bodyText }}>
                                                    {p.apellidos} {p.nombres}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontSize: '12px', color: t.bodyText }}>
                                                    {p.correoElectronico && <div>{p.correoElectronico}</div>}
                                                    {p.numeroCelular && <div style={{ fontSize: '11px' }}>{p.numeroCelular}</div>}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: t.bodyText }}>
                                                    {p.tieneTurno ? (
                                                        <span style={{
                                                            padding: '2px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            backgroundColor: '#D1FAE5',
                                                            color: '#065F46'
                                                        }}>Con Turno</span>
                                                    ) : (
                                                        <span style={{
                                                            padding: '2px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            backgroundColor: '#FEF3C7',
                                                            color: '#92400E'
                                                        }}>Sin Turno</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: t.bodyText }}>
                                                    {p.tieneTurno && p.turno ? (
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.turno.nombre}</div>
                                                        </div>
                                                    ) : <span style={{ color: t.bodyText }}>—</span>}
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    {p.tieneTurno ? (
                                                        <button
                                                            onClick={() => handleEliminarTurno(p)}
                                                            disabled={loading}
                                                            style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: loading ? '#9CA3AF' : '#EF4444',
                                                                color: '#fff',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: loading ? 0.6 : 1
                                                            }}
                                                            onMouseEnter={e => {
                                                                if (!loading) e.currentTarget.style.backgroundColor = '#DC2626'
                                                            }}
                                                            onMouseLeave={e => {
                                                                if (!loading) e.currentTarget.style.backgroundColor = '#EF4444'
                                                            }}
                                                        >
                                                            {loading ? 'Procesando...' : 'Quitar turno'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {postulantesFiltrados.length < postulantes.length && (
                                <div style={{ 
                                    padding: '10px 16px', 
                                    borderTop: `1px solid ${t.tableBorder}`,
                                    fontSize: '12px',
                                    color: t.bodyText
                                }}>
                                    Mostrando {postulantesFiltrados.length} de {postulantes.length} postulantes
                                </div>
                            )}
                        </>
                    )}
                </div>
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
    Ticket: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/></svg>,
}

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────
function SkeletonRows({ dark, count = 5 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[80, 60, 80, 40, 60, 60, 80].map((w, j) => (
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