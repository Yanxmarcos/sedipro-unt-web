// src/app/panel/sedinvita/areas/page.js
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
    const [areas, setAreas] = useState([])
    const [postulantesSinArea, setPostulantesSinArea] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingAction, setLoadingAction] = useState(false)
    const [error, setError] = useState(null)
    const [busquedaPostulante, setBusquedaPostulante] = useState('')
    const [areaSeleccionada, setAreaSeleccionada] = useState(null)
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)

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

    // Cargar todas las áreas y postulantes
    const cargarDatos = useCallback(async () => {
        const activa = await fetchEdicionActiva()
        if (!activa) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [areasRes, sinAreaRes] = await Promise.all([
                fetch('/api/sedinvita/postulantes/por-area', {
                    credentials: 'include'
                }),
                fetch(`/api/sedinvita/postulantes/sin-area?edicionId=${activa._id}`, {
                    credentials: 'include'
                })
            ])

            const areasJson = await areasRes.json()
            if (!areasRes.ok) throw new Error(areasJson.error || 'Error al cargar áreas')

            const sinAreaJson = await sinAreaRes.json()
            if (!sinAreaRes.ok) throw new Error(sinAreaJson.error || 'Error al cargar postulantes sin área')

            setAreas(areasJson.areas || [])
            setPostulantesSinArea(sinAreaJson.data || [])
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [fetchEdicionActiva])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    // Quitar área de un postulante
    const handleQuitarArea = async (codigoMatricula, nombreCompleto) => {
        if (!confirm(`¿Estás seguro de quitar el área de ${nombreCompleto} (${codigoMatricula})?`)) {
            return
        }

        setLoadingAction(true)
        setError(null)

        try {
            const res = await fetch(
                `/api/sedinvita/admin/quitar-area?codigo=${codigoMatricula}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Error al quitar área')

            setMensajeConfirmacion(`Área quitada correctamente de ${nombreCompleto}`)
            setTimeout(() => setMensajeConfirmacion(null), 4000)

            // Recargar datos
            await cargarDatos()

        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoadingAction(false)
        }
    }

    // Colores por área
    const getAreaColors = (areaId) => {
        const colors = {
            gth: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
            pmo: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400' },
            ti: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
            mkt: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
            ltkyfnz: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
        }
        return colors[areaId] || { bg: 'bg-gray-500/10', border: 'border-gray-500/50', text: 'text-gray-400' }
    }

    const getAreaNombre = (areaId) => {
        const nombres = {
            gth: 'GTH',
            pmo: 'PMO',
            ti: 'TI',
            mkt: 'MKT',
            ltkyfnz: 'LTK & FNZ'
        }
        return nombres[areaId] || areaId
    }

    // Filtrar postulantes sin área
    const postulantesSinAreaFiltrados = useMemo(() => {
        let resultado = postulantesSinArea
        if (busquedaPostulante.trim()) {
            const busqueda = busquedaPostulante.trim().toLowerCase()
            resultado = resultado.filter(p => 
                p.codigoMatricula?.toLowerCase().includes(busqueda) ||
                p.nombres?.toLowerCase().includes(busqueda) ||
                p.apellidos?.toLowerCase().includes(busqueda) ||
                `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
                p.correoElectronico?.toLowerCase().includes(busqueda) ||
                p.numeroCelular?.toLowerCase().includes(busqueda)
            )
        }
        return resultado
    }, [postulantesSinArea, busquedaPostulante])

    const totalConArea = areas.reduce((acc, area) => acc + area.postulantes.length, 0)

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
                            Áreas - Fase 3
                        </h1>
                        <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '4px', marginBottom: 0 }}>
                            Postulantes agrupados por área seleccionada
                            {edicionActiva && ` • ${edicionActiva.nombre} (${edicionActiva.anio})`}
                            {!loading && ` • ${totalConArea} con área • ${postulantesSinArea.length} sin área`}
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

            {error && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px'
                }}>
                    {error}
                </div>
            )}

            {!edicionActiva && !error && !loading && (
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
                            <Ico.Users />
                        </div>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                            No hay edición activa
                        </p>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', margin: 0, opacity: 0.7 }}>
                            Activa una edición en la sección "Ediciones" para gestionar áreas
                        </p>
                    </div>
                </div>
            )}

            {edicionActiva && (
                <>
                    {/* Tarjetas de resumen */}
                    {!loading && areas.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            {areas.map(area => {
                                const colors = getAreaColors(area.area)
                                const count = area.postulantes.length
                                const isSelected = areaSeleccionada === area.area
                                return (
                                    <div
                                        key={area.area}
                                        onClick={() => setAreaSeleccionada(isSelected ? null : area.area)}
                                        style={{
                                            backgroundColor: isSelected ? colors.bg : t.cardBg,
                                            border: `1px solid ${isSelected ? colors.border : t.cardBorder}`,
                                            borderRadius: '12px',
                                            padding: '14px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected ? `0 0 0 2px ${colors.border}` : t.cardShadow,
                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                        }}
                                    >
                                        <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>{getAreaNombre(area.area)}</p>
                                        <p style={{ fontSize: '22px', fontWeight: 700, color: t.bodyText, margin: '4px 0' }}>
                                            {count}
                                        </p>
                                        <p style={{ fontSize: '10px', color: t.bodyText, margin: 0, opacity: 0.6 }}>
                                            postulantes
                                        </p>
                                    </div>
                                )
                            })}
                            <div
                                onClick={() => setAreaSeleccionada(null)}
                                style={{
                                    backgroundColor: areaSeleccionada === null ? 'rgba(156, 163, 175, 0.1)' : t.cardBg,
                                    border: `1px solid ${areaSeleccionada === null ? 'rgba(156, 163, 175, 0.5)' : t.cardBorder}`,
                                    borderRadius: '12px',
                                    padding: '14px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: areaSeleccionada === null ? '0 0 0 2px rgba(156, 163, 175, 0.3)' : t.cardShadow,
                                    transform: areaSeleccionada === null ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <p style={{ fontSize: '11px', color: t.bodyText, margin: 0 }}>Sin área</p>
                                <p style={{ fontSize: '22px', fontWeight: 700, color: '#9CA3AF', margin: '4px 0' }}>
                                    {postulantesSinArea.length}
                                </p>
                                <p style={{ fontSize: '10px', color: t.bodyText, margin: 0, opacity: 0.6 }}>
                                    postulantes
                                </p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: t.bodyText }}>
                            Cargando postulantes...
                        </div>
                    )}

                    {/* TABLA DE POSTULANTES POR ÁREA (cuando se selecciona un área) */}
                    {!loading && areaSeleccionada !== null && (
                        <div style={{
                            backgroundColor: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                            boxShadow: t.cardShadow,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            marginBottom: '20px'
                        }}>
                            {(() => {
                                const area = areas.find(a => a.area === areaSeleccionada)
                                if (!area) return null
                                
                                const postulantesFiltrados = area.postulantes.filter(p => {
                                    if (!busquedaPostulante.trim()) return true
                                    const busqueda = busquedaPostulante.trim().toLowerCase()
                                    return (
                                        p.codigoMatricula?.toLowerCase().includes(busqueda) ||
                                        p.nombres?.toLowerCase().includes(busqueda) ||
                                        p.apellidos?.toLowerCase().includes(busqueda) ||
                                        `${p.apellidos} ${p.nombres}`.toLowerCase().includes(busqueda) ||
                                        p.correoElectronico?.toLowerCase().includes(busqueda) ||
                                        p.numeroCelular?.toLowerCase().includes(busqueda)
                                    )
                                })

                                const colors = getAreaColors(area.area)

                                return (
                                    <>
                                        <div style={{ 
                                            padding: '12px 16px', 
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                            backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f8f5fa',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    backgroundColor: colors.bg,
                                                    border: `2px solid ${colors.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: colors.text }}>
                                                        {getAreaNombre(area.area).charAt(0)}
                                                    </span>
                                                </div> */}
                                                <div>
                                                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: t.titleText, margin: 0 }}>
                                                        {getAreaNombre(area.area)}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: t.bodyText, margin: 0 }}>
                                                        {postulantesFiltrados.length} postulante{postulantesFiltrados.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAreaSeleccionada(null)}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${t.cardBorder}`,
                                                    backgroundColor: 'transparent',
                                                    color: t.bodyText,
                                                    fontSize: '11px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                        {postulantesFiltrados.length === 0 ? (
                                            <div style={{ padding: '40px 20px', textAlign: 'center', color: t.bodyText }}>
                                                No hay postulantes en esta área
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: t.tableHead }}>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Código</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Postulante</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Correo</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Celular</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Fecha Elección</th>
                                                            <th style={{ padding: '10px 14px', textAlign: 'center', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {postulantesFiltrados.map((p, i) => {
                                                            const isEven = i % 2 === 1
                                                            return (
                                                                <tr
                                                                    key={p.codigoMatricula}
                                                                    style={{
                                                                        backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                                                        borderBottom: i < postulantesFiltrados.length - 1 ? `1px solid ${t.tableBorder}` : 'none'
                                                                    }}
                                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                                                >
                                                                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: t.bodyText }}>
                                                                        {p.codigoMatricula}
                                                                    </td>
                                                                    <td style={{ padding: '10px 14px', fontWeight: 500, color: t.bodyText }}>
                                                                        {p.apellidos} {p.nombres}
                                                                    </td>
                                                                    <td style={{ padding: '10px 14px', fontSize: '12px', color: t.bodyText }}>
                                                                        {p.correoElectronico || '—'}
                                                                    </td>
                                                                    <td style={{ padding: '10px 14px', fontSize: '12px', color: t.bodyText }}>
                                                                        {p.numeroCelular || '—'}
                                                                    </td>
                                                                    <td style={{ padding: '10px 14px', fontSize: '12px', color: t.bodyText }}>
                                                                        {p.fechaEleccion ? new Date(p.fechaEleccion).toLocaleString('es-PE') : '—'}
                                                                    </td>
                                                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                                        <button
                                                                            onClick={() => handleQuitarArea(p.codigoMatricula, `${p.apellidos} ${p.nombres}`)}
                                                                            disabled={loadingAction}
                                                                            style={{
                                                                                padding: '4px 12px',
                                                                                borderRadius: '6px',
                                                                                border: 'none',
                                                                                backgroundColor: loadingAction ? '#9CA3AF' : '#EF4444',
                                                                                color: '#fff',
                                                                                fontSize: '11px',
                                                                                fontWeight: 600,
                                                                                cursor: loadingAction ? 'not-allowed' : 'pointer',
                                                                                transition: 'all 0.2s',
                                                                                opacity: loadingAction ? 0.6 : 1
                                                                            }}
                                                                            onMouseEnter={e => {
                                                                                if (!loadingAction) e.currentTarget.style.backgroundColor = '#DC2626'
                                                                            }}
                                                                            onMouseLeave={e => {
                                                                                if (!loadingAction) e.currentTarget.style.backgroundColor = '#EF4444'
                                                                            }}
                                                                        >
                                                                            {loadingAction ? '...' : 'Quitar área'}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TABLA DE POSTULANTES SIN ÁREA (SIEMPRE VISIBLE AL FINAL) */}
                    {/* ============================================================ */}
                    {!loading && (
                        <div style={{
                            backgroundColor: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                            boxShadow: t.cardShadow,
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}>
                            <div style={{ 
                                padding: '12px 16px', 
                                borderBottom: `1px solid ${t.tableBorder}`,
                                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f8f5fa',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px', color: t.titleText, margin: 0 }}>
                                        Postulantes sin área
                                    </p>
                                    <p style={{ fontSize: '12px', color: t.bodyText, margin: 0 }}>
                                        {postulantesSinArea.length} postulante{postulantesSinArea.length !== 1 ? 's' : ''} en Fase 3 que aún no han elegido área
                                    </p>
                                </div>
                                <div style={{ position: 'relative', minWidth: '200px' }}>
                                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: t.dividerText, pointerEvents: 'none' }}>
                                        <Ico.Search />
                                    </span>
                                    <input
                                        value={busquedaPostulante}
                                        onChange={e => setBusquedaPostulante(e.target.value)}
                                        placeholder="Buscar postulante..."
                                        style={{
                                            width: '100%',
                                            padding: '6px 12px 6px 32px',
                                            borderRadius: '8px',
                                            border: `1px solid ${t.inputBorder}`,
                                            backgroundColor: dark ? '#2d2b3e' : '#fff',
                                            color: t.inputText,
                                            fontSize: '12px',
                                            fontFamily: 'Poppins, sans-serif',
                                            outline: 'none',
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#672577' }}
                                        onBlur={e => { e.target.style.borderColor = t.inputBorder }}
                                    />
                                </div>
                            </div>

                            {postulantesSinAreaFiltrados.length === 0 ? (
                                <div style={{ padding: '56px 20px', textAlign: 'center', color: t.dividerText }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: t.emptyIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Ico.Users />
                                        </div>
                                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', margin: 0 }}>
                                            {busquedaPostulante ? 'No hay postulantes que coincidan con la búsqueda' : '¡Excelente! Todos los postulantes ya tienen área asignada'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: t.tableHead }}>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Código</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Postulante</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Correo</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Celular</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: t.tableHeadText, fontSize: '11px', fontWeight: 700 }}>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {postulantesSinAreaFiltrados.map((p, i) => {
                                                const isEven = i % 2 === 1
                                                return (
                                                    <tr
                                                        key={p.codigoMatricula}
                                                        style={{
                                                            backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                                            borderBottom: i < postulantesSinAreaFiltrados.length - 1 ? `1px solid ${t.tableBorder}` : 'none'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.tableRowHover}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                                    >
                                                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: t.bodyText }}>
                                                            {p.codigoMatricula}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', fontWeight: 500, color: t.bodyText }}>
                                                            {p.apellidos} {p.nombres}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', fontSize: '12px', color: t.bodyText }}>
                                                            {p.correoElectronico || '—'}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', fontSize: '12px', color: t.bodyText }}>
                                                            {p.numeroCelular || '—'}
                                                        </td>
                                                        <td style={{ padding: '10px 14px' }}>
                                                            <span style={{
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                backgroundColor: '#FEF3C7',
                                                                color: '#92400E'
                                                            }}>
                                                                Sin área
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {postulantesSinAreaFiltrados.length > 0 && (
                                <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.tableBorder}` }}>
                                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                                        {postulantesSinAreaFiltrados.length} postulante{postulantesSinAreaFiltrados.length !== 1 ? 's' : ''} sin área
                                        {postulantesSinAreaFiltrados.length !== postulantesSinArea.length && 
                                            ` (${postulantesSinArea.length - postulantesSinAreaFiltrados.length} ocultos por búsqueda)`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
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
    Users:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}