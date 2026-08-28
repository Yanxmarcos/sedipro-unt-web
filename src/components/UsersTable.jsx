'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

const ROLES = ['DIRECTIVA', 'USER']

const ROLE_COLORS = {
    DIRECTIVA: {
        bg: 'rgba(103,37,119,0.14)',
        text: '#7C4191',
        border: 'rgba(103,37,119,0.30)',
    },
    USER: {
        bg: 'rgba(95,192,211,0.14)',
        text: '#5FC0D3',
        border: 'rgba(95,192,211,0.30)',
    },
    DEFAULT: {
        bg: 'rgba(95,192,211,0.14)',
        text: '#5FC0D3',
        border: 'rgba(95,192,211,0.30)',
    },
}

function getRoleColor(rol = '') {
    return ROLE_COLORS[rol] ?? ROLE_COLORS.DEFAULT
}

function isActive(lastLogin) {
    if (!lastLogin) return false
    const diff = Date.now() - new Date(lastLogin).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
}

function getTheme(dark) {
    return {
        cardBg:          dark ? '#160C22'                      : '#ffffff',
        cardBorder:      dark ? 'rgba(103,37,119,0.28)'        : 'rgba(214,182,223,0.55)',
        cardShadow:      dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(103,37,119,0.10)',
        inputBg:         dark ? '#1F1030'                      : '#f9f6fb',
        inputBorder:     dark ? 'rgba(103,37,119,0.35)'        : '#e5d9ef',
        inputText:       dark ? '#EAD8F5'                      : '#111827',
        labelText:       dark ? '#C8A8D8'                      : '#4A1A5E',
        bodyText:        dark ? '#9880B0'                      : '#6B7280',
        tableHead:       dark ? '#1A0D2E'                      : '#f5f0f9',
        tableHeadText:   dark ? '#C8A8D8'                      : '#4A1A5E',
        tableRow:        dark ? '#160C22'                      : '#ffffff',
        tableRowAlt:     dark ? '#1A0D2B'                      : '#faf7fc',
        tableRowHover:   dark ? 'rgba(103,37,119,0.10)'        : 'rgba(103,37,119,0.05)',
        tableBorder:     dark ? 'rgba(103,37,119,0.16)'        : 'rgba(214,182,223,0.45)',
        dividerText:     dark ? '#6B5080'                      : '#c4aed4',
        paginBg:         dark ? '#1F1030'                      : '#f5f0f9',
        paginBorder:     dark ? 'rgba(103,37,119,0.28)'        : 'rgba(214,182,223,0.6)',
        paginText:       dark ? '#C8A8D8'                      : '#4A1A5E',
        paginActiveBg:   '#672577',
        paginActiveText: '#ffffff',
        badgeTotal:      dark ? 'rgba(103,37,119,0.20)'        : 'rgba(103,37,119,0.10)',
        badgeTotalText:  dark ? '#C8A8D8'                      : '#672577',
        sortActive:      '#672577',
        sortInactive:    dark ? '#6B5080'                      : '#c4aed4',
        titleText:       dark ? '#EAD8F5'                      : '#1F0B2E',
    }
}

const Ico = {
    Search: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
    ),
    ChevronUp: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
    ),
    ChevronDown: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    Users: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    ChevronsLeft: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
        </svg>
    ),
    ChevronsRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
        </svg>
    ),
    ChevLeft: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
        </svg>
    ),
    ChevRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    ),
    Spinner: () => (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="rgba(103,37,119,0.15)" strokeWidth="3"/>
            <path d="M18 4a14 14 0 0 1 14 14" stroke="#672577" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    ),
    Empty: () => (
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
    ),
    Shield: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    ),
}

const COLUMNS = [
    { key: 'index',       label: '#',               sortable: false, width: '52px',  align: 'center' },
    { key: 'nombres',     label: 'Nombres',          sortable: true,  width: 'auto'                    },
    { key: 'apellidos',   label: 'Apellidos',        sortable: true,  width: 'auto'                    },
    { key: 'dni',         label: 'DNI',              sortable: true,  width: '120px', align: 'center'  },
    { key: 'rol',         label: 'Rol',              sortable: true,  width: '130px', align: 'center'  },
    { key: 'createdAt',   label: 'Cuenta desde',     sortable: true,  width: '150px', align: 'center'  },
    { key: 'lastLogin',   label: 'Última conexión',  sortable: true,  width: '180px', align: 'center'  },
    { key: 'estado',      label: 'Estado',           sortable: false, width: '100px', align: 'center'  },
]

const PAGE_SIZE_OPTIONS = [50, 100, 200]

const STATUS_STYLE = {
    active:   { bg: 'rgba(16,185,129,0.14)', text: '#059669', border: 'rgba(16,185,129,0.30)', label: 'Activo' },
    inactive: { bg: 'rgba(156,163,175,0.14)', text: '#6B7280', border: 'rgba(156,163,175,0.30)', label: 'Inactivo' },
}

export default function UsersTable() {
    const [dark, setDark]           = useState(false)
    const [data, setData]           = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState(null)
    const [search, setSearch]       = useState('')
    const [sort, setSort]           = useState({ key: 'lastLogin', dir: 'desc' })
    const [page, setPage]           = useState(1)
    const [pageSize, setPageSize]   = useState(200)
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => {
        let cancelled = false
        const readDark = () => {
            try { setDark(localStorage.getItem('sedipro_dark') === 'true') } catch {}
        }
        readDark()
        const id = setInterval(readDark, 400)
        window.addEventListener('storage', readDark)
        return () => { cancelled = true; clearInterval(id); window.removeEventListener('storage', readDark) }
    }, [])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        fetch('/api/users', { credentials: 'include' })
            .then(r => r.json())
            .then(json => {
                if (cancelled) return
                if (!json.success) throw new Error(json.error ?? 'Error al cargar')
                setData(json.data)
            })
            .catch(err => { if (!cancelled) setError(err.message) })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [])

    const showToast = useCallback((type, msg) => {}, [])

    const t = getTheme(dark)

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        let rows = data

        if (q) {
            rows = rows.filter(r =>
                r.nombres.toLowerCase().includes(q)   ||
                r.apellidos.toLowerCase().includes(q) ||
                r.dni.includes(q)                     ||
                r.rol.toLowerCase().includes(q)
            )
        }

        if (roleFilter) {
            rows = rows.filter(r => r.rol === roleFilter)
        }

        if (sort.key && sort.key !== 'index' && sort.key !== 'estado') {
            rows = [...rows].sort((a, b) => {
                let av, bv
                if (sort.key === 'createdAt' || sort.key === 'lastLogin') {
                    av = a[sort.key] ? new Date(a[sort.key]).getTime() : 0
                    bv = b[sort.key] ? new Date(b[sort.key]).getTime() : 0
                    return sort.dir === 'asc' ? av - bv : bv - av
                }
                av = (a[sort.key] ?? '').toLowerCase()
                bv = (b[sort.key] ?? '').toLowerCase()
                return sort.dir === 'asc'
                    ? av.localeCompare(bv, 'es')
                    : bv.localeCompare(av, 'es')
            })
        }
        return rows
    }, [data, search, roleFilter, sort])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage   = Math.min(page, totalPages)

    const pageRows = useMemo(() => {
        const start = (safePage - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, safePage, pageSize])

    const handleSort = useCallback((key) => {
        setSort(prev => prev.key === key
            ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { key, dir: 'asc' }
        )
        setPage(1)
    }, [])

    const handleSearch = useCallback((e) => {
        setSearch(e.target.value)
        setPage(1)
    }, [])

    const pageNumbers = useMemo(() => {
        const delta = 2
        const range = []
        const rangeWithDots = []
        let l
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
                range.push(i)
            }
        }
        for (const i of range) {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1)
                else if (i - l > 2) rangeWithDots.push('…')
            }
            rangeWithDots.push(i)
            l = i
        }
        return rangeWithDots
    }, [totalPages, safePage])

    const startRow = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
    const endRow   = Math.min(safePage * pageSize, filtered.length)

    const card = {
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.cardShadow,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'background-color 0.3s, border-color 0.3s',
    }

    const paginBtn = (active, disabled) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '32px', height: '32px', padding: '0 6px',
        borderRadius: '8px', border: `1px solid ${active ? 'transparent' : t.paginBorder}`,
        backgroundColor: active ? t.paginActiveBg : t.paginBg,
        color: active ? t.paginActiveText : t.paginText,
        fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: 'all 0.15s',
    })

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '72px 0' }}>
            <div style={{ animation: 'sdpSpin 0.8s linear infinite' }}><Ico.Spinner /></div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#672577', margin: 0 }}>Cargando usuarios…</p>
            <style>{`@keyframes sdpSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error) return (
        <div style={{ ...card, padding: '40px 28px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#EF4444', margin: 0 }}>⚠ {error}</p>
        </div>
    )

    const activeCount  = data.filter(u => isActive(u.lastLogin)).length
    const inactiveCount = data.length - activeCount

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Tarjeta resumen ── */}
            <div style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                        Total de Usuarios
                    </p>
                    <p style={{
                        fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '28px',
                        color: dark ? '#EAD8F5' : '#4A1A5E', margin: '2px 0 0', lineHeight: 1,
                    }}>
                        {data.length}
                    </p>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '20px',
                        backgroundColor: STATUS_STYLE.active.bg, border: `1px solid ${STATUS_STYLE.active.border}`,
                        fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
                        color: STATUS_STYLE.active.text, whiteSpace: 'nowrap',
                    }}>
                        Activos: {activeCount}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '20px',
                        backgroundColor: STATUS_STYLE.inactive.bg, border: `1px solid ${STATUS_STYLE.inactive.border}`,
                        fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
                        color: STATUS_STYLE.inactive.text, whiteSpace: 'nowrap',
                    }}>
                        Inactivos: {inactiveCount}
                    </span>
                    {Object.entries(
                        data.reduce((acc, r) => { acc[r.rol] = (acc[r.rol] ?? 0) + 1; return acc }, {})
                    ).sort((a, b) => b[1] - a[1]).map(([rol, count]) => {
                        const c = getRoleColor(rol)
                        return (
                            <span key={rol} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 10px', borderRadius: '20px',
                                backgroundColor: c.bg, border: `1px solid ${c.border}`,
                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
                                color: c.text, whiteSpace: 'nowrap',
                            }}>
                                {rol}: {count}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* ── Tabla ── */}
            <div style={card}>

                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                    padding: '16px 20px', borderBottom: `1px solid ${t.tableBorder}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText }}>Mostrar</span>
                        <select
                            value={pageSize}
                            onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                            style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500,
                                padding: '5px 26px 5px 10px', borderRadius: '8px',
                                border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23672577' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                            }}
                        >
                            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: t.bodyText }}>registros</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                                color: '#672577', pointerEvents: 'none', display: 'flex',
                            }}>
                                <Ico.Search />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar usuario…"
                                value={search}
                                onChange={handleSearch}
                                style={{
                                    paddingLeft: '34px', paddingRight: '12px',
                                    paddingTop: '7px', paddingBottom: '7px',
                                    width: '200px', maxWidth: '100%',
                                    fontSize: '13px', fontFamily: 'Poppins, sans-serif',
                                    borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                    backgroundColor: t.inputBg, color: t.inputText,
                                    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                                onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={e => {
                                setRoleFilter(e.target.value)
                                setPage(1)
                            }}
                            style={{
                                padding: '7px 32px 7px 12px',
                                fontSize: '13px', fontFamily: 'Poppins, sans-serif',
                                borderRadius: '10px', border: `1px solid ${t.inputBorder}`,
                                backgroundColor: t.inputBg, color: t.inputText,
                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23672577' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                minWidth: '150px',
                                transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.13)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            <option value="">Todos los roles</option>
                            {ROLES.map(rol => {
                                const color = getRoleColor(rol)
                                return (
                                    <option key={rol} value={rol} style={{
                                        backgroundColor: color.bg,
                                        color: color.text,
                                        fontWeight: 600
                                    }}>
                                        {rol}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ backgroundColor: t.tableHead }}>
                                {COLUMNS.map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        style={{
                                            width: col.width, textAlign: col.align ?? 'left',
                                            padding: '11px 16px',
                                            fontFamily: 'Montserrat, sans-serif', fontSize: '11px',
                                            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                            color: t.tableHeadText,
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                            cursor: col.sortable ? 'pointer' : 'default',
                                            userSelect: 'none', whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            {col.label}
                                            {col.sortable && (
                                                <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', color: sort.key === col.key ? t.sortActive : t.sortInactive }}>
                                                    <span style={{ opacity: sort.key === col.key && sort.dir === 'asc'  ? 1 : 0.35 }}><Ico.ChevronUp /></span>
                                                    <span style={{ opacity: sort.key === col.key && sort.dir === 'desc' ? 1 : 0.35 }}><Ico.ChevronDown /></span>
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: t.dividerText }}>
                                            <Ico.Empty />
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', margin: 0 }}>
                                                {search || roleFilter ? 'Sin resultados para la búsqueda' : 'No hay usuarios registrados'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.map((row, i) => {
                                const globalIdx = (safePage - 1) * pageSize + i + 1
                                const isEven    = i % 2 === 1
                                const roleC     = getRoleColor(row.rol)
                                const active    = isActive(row.lastLogin)
                                const status    = active ? STATUS_STYLE.active : STATUS_STYLE.inactive

                                return (
                                    <tr
                                        key={row._id ?? row.dni}
                                        style={{
                                            backgroundColor: isEven ? t.tableRowAlt : t.tableRow,
                                            transition: 'background-color 0.12s',
                                            borderBottom: `1px solid ${t.tableBorder}`,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.tableRowHover }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = isEven ? t.tableRowAlt : t.tableRow }}
                                    >
                                        {/* # */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: t.dividerText }}>
                                            {globalIdx}
                                        </td>
                                        {/* Nombres */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#111827', fontWeight: 500 }}>
                                            {row.nombres?.toUpperCase()}
                                        </td>
                                        {/* Apellidos */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: dark ? '#EAD8F5' : '#111827' }}>
                                            {row.apellidos?.toUpperCase()}
                                        </td>
                                        {/* DNI */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                            <span style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                                                letterSpacing: '0.05em', color: dark ? '#C8A8D8' : '#4A1A5E',
                                                backgroundColor: dark ? 'rgba(103,37,119,0.14)' : 'rgba(103,37,119,0.08)',
                                                padding: '3px 10px', borderRadius: '6px',
                                            }}>
                                                {row.dni}
                                            </span>
                                        </td>
                                        {/* Rol */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                                backgroundColor: roleC.bg, border: `1px solid ${roleC.border}`,
                                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
                                                color: roleC.text, whiteSpace: 'nowrap',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                            }}>
                                                {row.rol}
                                            </span>
                                        </td>
                                        {/* Cuenta desde */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: dark ? '#9880B0' : '#6B7280' }}>
                                            {formatDate(row.createdAt)}
                                        </td>
                                        {/* Última conexión */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: dark ? '#9880B0' : '#6B7280' }}>
                                            {row.lastLogin ? formatDate(row.lastLogin) : 'Nunca'}
                                        </td>
                                        {/* Estado */}
                                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                                backgroundColor: status.bg, border: `1px solid ${status.border}`,
                                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
                                                color: status.text, whiteSpace: 'nowrap',
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer paginación */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px',
                    padding: '14px 20px', borderTop: `1px solid ${t.tableBorder}`,
                }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: t.bodyText, margin: 0 }}>
                        {filtered.length === 0
                            ? 'Sin registros'
                            : `Mostrando ${startRow} – ${endRow} de ${filtered.length} registro${filtered.length !== 1 ? 's' : ''}${search || roleFilter ? ` (filtrado de ${data.length} total)` : ''}`
                        }
                    </p>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <button onClick={() => setPage(1)} disabled={safePage === 1} style={paginBtn(false, safePage === 1)}><Ico.ChevronsLeft /></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={paginBtn(false, safePage === 1)}><Ico.ChevLeft /></button>

                            {pageNumbers.map((n, i) =>
                                n === '…'
                                    ? <span key={`d${i}`} style={{ padding: '0 4px', color: t.dividerText, fontSize: '13px' }}>…</span>
                                    : <button key={n} onClick={() => setPage(n)} style={paginBtn(n === safePage, false)}>{n}</button>
                            )}

                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={paginBtn(false, safePage === totalPages)}><Ico.ChevRight /></button>
                            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={paginBtn(false, safePage === totalPages)}><Ico.ChevronsRight /></button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes sdpSpin    { to { transform: rotate(360deg); } }
                @keyframes sdpFadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sdpSlideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0);     }
                }
            `}</style>
        </div>
    )
}

function formatDate(dateString) {
    if (!dateString) return 'No registrado'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
