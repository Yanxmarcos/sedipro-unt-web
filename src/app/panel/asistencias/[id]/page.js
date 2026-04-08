'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import * as XLSX from 'xlsx'

function getTheme(dark) {
    return {
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
        pageBg:        dark ? '#0E0818' : '#f8f5fa',
        titleText:     dark ? '#EAD8F5' : '#4A1A5E',
    }
}

const Ico = {
    Back: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
        </svg>
    ),
    Search: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
    ),
    Save: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
    ),
    Excel: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
    ),
    Spinner: () => (
        <svg width="18" height="18" viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/>
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    ),
    Sun: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
    ),
    Moon: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    ),
}

const ESTADOS = {
    presente:    { label: 'Presente',    color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)' },
    tardanza:    { label: 'Tardanza', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.30)' },
    justificado: { label: 'Justificado', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
    ausente:     { label: 'Ausente',     color: '#EF4444', bg: 'rgba(239,68,68,0.11)',  border: 'rgba(239,68,68,0.28)' },
}

function EstadoBtn({ estado, active, onClick, readOnly }) {
    const e = ESTADOS[estado]
    return (
        <button
            onClick={readOnly ? undefined : onClick}
            style={{
                padding: '5px 12px', borderRadius: '20px',
                border: `1.5px solid ${active ? e.border : 'transparent'}`,
                backgroundColor: active ? e.bg : 'transparent',
                color: active ? e.color : '#9CA3AF',
                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: active ? 700 : 500,
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
            }}
            onMouseEnter={e2 => { if (!readOnly && !active) { e2.currentTarget.style.backgroundColor = e.bg; e2.currentTarget.style.border = `1.5px solid ${e.border}`; e2.currentTarget.style.color = e.color } }}
            onMouseLeave={e2 => { if (!active) { e2.currentTarget.style.backgroundColor = 'transparent'; e2.currentTarget.style.border = '1.5px solid transparent'; e2.currentTarget.style.color = '#9CA3AF' } }}
        >
            {e.label}
        </button>
    )
}

function formatDate(iso) {
    if (!iso) return '—'
    const [year, month, day] = iso.split('T')[0].split('-')
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return `${day} de ${meses[Number(month) - 1]} de ${year}`
}

function SkeletonRows({ dark, count = 8 }) {
    const t = getTheme(dark)
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
            {[1, 2, 3, 4].map(j => (
                <td key={j} style={{ padding: '14px 16px' }}>
                    <div style={{
                        height: '13px', borderRadius: '6px', width: j === 1 ? '40px' : j === 2 ? '55%' : j === 3 ? '70px' : '160px',
                        backgroundColor: dark ? 'rgba(103,37,119,0.12)' : 'rgba(103,37,119,0.07)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                </td>
            ))}
        </tr>
    ))
}

function exportToExcel(asistencia, registro) {
    const excelData = [
        [`Asistencia: ${asistencia.descripcion}`],
        [`Fecha: ${formatDate(asistencia.fecha)}`],
        [],
        ['N°', 'Nombres', 'Apellidos', 'DNI', 'Área', 'Estado'],
        ...registro.map((r, i) => [
            i + 1,
            r.sediprano?.nombres ?? '—',
            r.sediprano?.apellidos ?? '—',
            r.sediprano?.dni ?? '—',
            r.sediprano?.area ?? '—',
            ESTADOS[r.estado]?.label ?? r.estado,
        ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(excelData)
    
    ws['!cols'] = [
        {wch:6},   // N°
        {wch:25},  // Nombres
        {wch:25},  // Apellidos
        {wch:15},  // DNI
        {wch:20},  // Área
        {wch:12}   // Estado
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia')
    XLSX.writeFile(wb, `asistencia_${asistencia.descripcion?.replace(/\s+/g, '_')}_${new Date(asistencia.fecha).toISOString().slice(0, 10)}.xlsx`)
}

export default function AsistenciaDetallePage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') ?? 'view'
    const isEdit = mode === 'edit'

    const [dark, setDark] = useState(false)
    const [asistencia, setAsistencia] = useState(null)
    const [registro, setRegistro] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [toast, setToast] = useState(null)
    const t = getTheme(dark)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/asistencias/${params.id}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setAsistencia(data.asistencia)
            setRegistro(data.asistencia.registro ?? [])
        } catch (err) {
            showToast(err.message || 'Error al cargar', 'error')
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        const stored = localStorage.getItem('sedipro_dark')
        if (stored !== null) setDark(stored === 'true')
        const onStorage = (e) => {
            if (e.key === 'sedipro_dark') {
                setDark(e.newValue === 'true')
            }
        }
        window.addEventListener('storage', onStorage)

        const interval = setInterval(() => {
            const val = localStorage.getItem('sedipro_dark')
            setDark(prev => {
                const next = val === 'true'
                return prev !== next ? next : prev
            })
        }, 400)

        return () => {
            window.removeEventListener('storage', onStorage)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredRegistro = useMemo(() => {
        if (!search.trim()) return registro
        const q = search.toLowerCase()
        return registro.filter(r => {
            const s = r.sediprano
            if (!s) return false
            return (
                s.nombres?.toLowerCase().includes(q) ||
                s.apellidos?.toLowerCase().includes(q) ||
                s.dni?.toLowerCase().includes(q)
            )
        })
    }, [registro, search])

    function setEstado(sedipranoId, estado) {
        setRegistro(prev => prev.map(r =>
            r.sedipranoId?.toString() === sedipranoId?.toString()
                ? { ...r, estado }
                : r
        ))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const res = await fetch(`/api/asistencias/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registro: registro.map(r => ({ sedipranoId: r.sedipranoId, estado: r.estado })) }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            showToast('Asistencia guardada correctamente')
            router.push('/panel/asistencias')
        } catch (err) {
            showToast(err.message || 'Error al guardar', 'error')
        } finally {
            setSaving(false)
        }
    }

    const summary = useMemo(() => {
        const presentes = registro.filter(r => r.estado === 'presente').length
        const justificados = registro.filter(r => r.estado === 'justificado').length
        const ausentes = registro.filter(r => r.estado === 'ausente').length
        const tardanzas = registro.filter(r => r.estado === 'tardanza').length
        return { presentes, ausentes, justificados, tardanzas, total: registro.length }
    }, [registro])

    return (
        <div style={{ padding: '24px', minHeight: '100%', fontFamily: 'Poppins, sans-serif', backgroundColor: t.pageBg, transition: 'background-color 0.2s' }}>

            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 2000,
                    backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
                    color: '#fff', padding: '12px 20px', borderRadius: '12px',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
                    animation: 'slideDown 0.2s ease', maxWidth: '320px',
                }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => router.push('/panel/asistencias')}
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            border: `1px solid ${t.inputBorder}`, backgroundColor: t.inputBg,
                            color: t.labelText, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                        }}
                    >
                        <Ico.Back />
                    </button>
                    <div>
                        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '20px', color: t.titleText, margin: 0 }}>
                            {isEdit ? 'Editar asistencia' : 'Ver asistencia'}
                        </h1>
                        {asistencia && (
                            <p style={{ fontSize: '13px', color: t.bodyText, marginTop: '3px', marginBottom: 0 }}>
                                {asistencia.descripcion} · {formatDate(asistencia.fecha)}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {!loading && asistencia && (
                        <button
                            onClick={() => exportToExcel(asistencia, registro)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '9px 16px', borderRadius: '10px',
                                border: `1px solid rgba(16,185,129,0.35)`,
                                backgroundColor: 'rgba(16,185,129,0.10)', color: '#059669',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                        >
                            <Ico.Excel /> Exportar Excel
                        </button>
                    )}

                    {isEdit && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '9px 18px', borderRadius: '10px', border: 'none',
                                backgroundColor: 'var(--color-primary)', color: '#fff',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                                boxShadow: '0 4px 14px rgba(103,37,119,0.28)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {saving ? <><Ico.Spinner /> Guardando…</> : <><Ico.Save /> Guardar</>}
                        </button>
                    )}
                </div>
            </div>

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Total', value: summary.total, color: 'var(--color-primary)', bg: dark ? 'rgba(103,37,119,0.14)' : 'rgba(103,37,119,0.08)' },
                        { label: 'Presentes', value: summary.presentes, color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
                        { label: 'Tardanzas', value: summary.tardanzas, color: '#F97316', bg: 'rgba(249,115,22,0.10)' },
                        { label: 'Justificados', value: summary.justificados, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
                        { label: 'Ausentes', value: summary.ausentes, color: '#EF4444', bg: 'rgba(239,68,68,0.09)' },
                    ].map(c => (
                        <div key={c.label} style={{
                            backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                            borderRadius: '14px', padding: '14px 16px', textAlign: 'center',
                            boxShadow: t.cardShadow,
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: c.bg, margin: '0 auto 8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 800, color: c.color }}>{c.value}</span>
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: t.bodyText, margin: 0 }}>{c.label}</p>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}`,
                borderRadius: '16px', boxShadow: t.cardShadow, overflow: 'hidden',
            }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.tableBorder}` }}>
                    <div style={{ position: 'relative', maxWidth: '320px' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: t.dividerText, display: 'flex' }}>
                            <Ico.Search />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '9px 12px 9px 32px',
                                borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.12)' }}
                            onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {['#', 'Nombre completo', 'DNI', 'Estado'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '11px 16px',
                                        textAlign: i === 0 ? 'center' : i === 3 ? 'center' : 'left',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '11px',
                                        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                        color: t.tableHeadText, borderBottom: `1px solid ${t.tableBorder}`,
                                        whiteSpace: 'nowrap',
                                        width: i === 0 ? '52px' : i === 2 ? '110px' : 'auto',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonRows dark={dark} count={8} />
                            ) : filteredRegistro.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center', color: t.dividerText, fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                                        {search ? 'Sin resultados para la búsqueda' : 'Sin registros'}
                                    </td>
                                </tr>
                            ) : filteredRegistro.map((r, i) => {
                                const isEven = i % 2 === 1
                                const s = r.sediprano
                                return (
                                    <tr
                                        key={r.sedipranoId?.toString() ?? i}
                                        style={{
                                            backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                            transition: 'background-color 0.1s',
                                        }}
                                        onMouseEnter={e2 => e2.currentTarget.style.backgroundColor = t.tableRowHover}
                                        onMouseLeave={e2 => e2.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow}
                                    >
                                        {/* # */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.dividerText }}>
                                            {i + 1}
                                        </td>
                                        {/* Nombre */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#111827', fontWeight: 500 }}>
                                            {s ? `${s.nombres} ${s.apellidos}` : '—'}
                                            {s?.area && (
                                                <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 600, color: t.bodyText, backgroundColor: dark ? 'rgba(103,37,119,0.14)' : 'rgba(103,37,119,0.08)', padding: '1px 7px', borderRadius: '10px' }}>
                                                    {s.area}
                                                </span>
                                            )}
                                        </td>
                                        {/* DNI */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                                                letterSpacing: '0.05em', color: dark ? '#C8A8D8' : '#4A1A5E',
                                                backgroundColor: dark ? 'rgba(103,37,119,0.14)' : 'rgba(103,37,119,0.08)',
                                                padding: '3px 10px', borderRadius: '6px',
                                            }}>
                                                {s?.dni ?? '—'}
                                            </span>
                                        </td>
                                        {/* Estado */}
                                        <td style={{ padding: '10px 16px' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {Object.keys(ESTADOS).map(estado => (
                                                    <EstadoBtn
                                                        key={estado}
                                                        estado={estado}
                                                        active={r.estado === estado}
                                                        readOnly={!isEdit}
                                                        onClick={() => setEstado(r.sedipranoId, estado)}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredRegistro.length > 0 && (
                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.tableBorder}` }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                            {filteredRegistro.length} de {registro.length} miembro{registro.length !== 1 ? 's' : ''}
                            {search ? ` (filtrado)` : ''}
                        </p>
                    </div>
                )}
            </div>

            {isEdit && !loading && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100 }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '13px 22px', borderRadius: '14px', border: 'none',
                            backgroundColor: 'var(--color-primary)', color: '#fff',
                            fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            boxShadow: '0 6px 24px rgba(103,37,119,0.40)',
                        }}
                    >
                        {saving ? <><Ico.Spinner /> Guardando…</> : <><Ico.Save /> Guardar asistencia</>}
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
            `}</style>
        </div>
    )
}