'use client'

import { useEffect, useState } from 'react'

const CARDS = [
    {
        key: 'sedipranos',
        label: 'Sedipranos',
        sublabel: 'Miembros registrados',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: 'var(--color-primary)',
        colorLight: 'rgba(103,37,119,0.10)',
        href: '/panel/sedipranos',
    },
    {
        key: 'asistencias',
        label: 'Asistencias',
        sublabel: 'Sesiones registradas',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="9 16 11 18 15 14" />
            </svg>
        ),
        color: 'var(--color-secondary)',
        colorLight: 'rgba(52,84,161,0.10)',
        href: '/panel/asistencias',
    },
    {
        key: 'votaciones',
        label: 'Votaciones',
        sublabel: 'Votaciones creadas',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
        ),
        color: 'var(--color-accent)',
        colorLight: 'rgba(43,45,103,0.10)',
        href: '/panel/votaciones',
    },
    {
        key: 'usuarios',
        label: 'Usuarios',
        sublabel: 'Accesos al sistema',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        color: 'var(--color-success)',
        colorLight: 'rgba(16,185,129,0.10)',
    },
]

function StatCard({ card, value, loading, dark }) {
    const theme = getTheme(dark)
    
    return (
        <a
            href={card.href}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: theme.cardBg,
                borderRadius: '16px',
                padding: '22px 20px',
                boxShadow: theme.cardShadow,
                textDecoration: 'none',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'pointer',
                border: `1px solid ${theme.cardBorder}`,
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = dark 
                    ? '0 12px 40px rgba(0,0,0,0.6)' 
                    : '0 8px 28px 0 rgba(74,26,94,0.13), 0 2px 6px 0 rgba(0,0,0,0.07)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = theme.cardShadow
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '3px',
                background: card.color,
                borderRadius: '16px 16px 0 0',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: theme.labelText,
                    fontFamily: 'Poppins, sans-serif',
                }}>
                    {card.label}
                </span>
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: card.colorLight,
                    color: card.color,
                    flexShrink: 0,
                }}>
                    {card.icon}
                </span>
            </div>

            {/* Number */}
            <div>
                {loading ? (
                    <div style={{
                        height: '40px',
                        width: '70px',
                        borderRadius: '8px',
                        backgroundColor: dark ? '#2a1a3a' : '#f0e8f4',
                        backgroundImage: dark 
                            ? 'linear-gradient(90deg, #2a1a3a 25%, #3a2a4a 50%, #2a1a3a 75%)'
                            : 'linear-gradient(90deg, #f0e8f4 25%, #e8d8f0 50%, #f0e8f4 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.4s infinite',
                    }} />
                ) : (
                    <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 800,
                        fontSize: '36px',
                        color: dark ? '#EAD8F5' : 'var(--color-primary-active)',
                        lineHeight: 1,
                        display: 'block',
                    }}>
                        {value ?? '—'}
                    </span>
                )}
                <span style={{
                    fontSize: '12px',
                    color: theme.bodyText,
                    marginTop: '4px',
                    display: 'block',
                    fontFamily: 'Poppins, sans-serif',
                }}>
                    {card.sublabel}
                </span>
            </div>
        </a>
    )
}

export default function PanelPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [dark, setDark] = useState(false)

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setStats(data)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        const stored = localStorage.getItem('sedipro_dark')
        if (stored !== null) setDark(stored === 'true')

        const onStorage = (e) => {
            if (e.key === 'sedipro_dark') setDark(e.newValue === 'true')
        }
        window.addEventListener('storage', onStorage)

        const interval = setInterval(() => {
            const val = localStorage.getItem('sedipro_dark')
            setDark(prev => {
                const next = val === 'true'
                return prev !== next ? next : prev
            })
        }, 400)

        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval) }
    }, [])

    const theme = getTheme(dark)

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .stat-card-anim {
                    animation: fadeUp 0.4s ease both;
                }
                .stat-card-anim:nth-child(1) { animation-delay: 0.05s; }
                .stat-card-anim:nth-child(2) { animation-delay: 0.12s; }
                .stat-card-anim:nth-child(3) { animation-delay: 0.19s; }
                .stat-card-anim:nth-child(4) { animation-delay: 0.26s; }
                
                body {
                    background: ${dark ? '#0A0612' : '#ffffff'};
                }
            `}</style>

            <div style={{
                padding: '28px',
                minHeight: '100%',
                fontFamily: 'Poppins, sans-serif',
                background: dark ? '#0A0612' : 'transparent',
            }}>
                <div style={{ marginBottom: '28px', animation: 'fadeUp 0.35s ease both' }}>
                    <h1 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: dark ? '#EAD8F5' : 'var(--color-primary-active)',
                        margin: 0,
                        lineHeight: 1.2,
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ 
                        fontSize: '13px', 
                        color: dark ? '#9880B0' : '#9CA3AF', 
                        marginTop: '6px', 
                        margin: '6px 0 0' 
                    }}>
                        Bienvenido al Panel de Control de SEDIPRO UNT
                    </p>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{
                        background: dark ? 'rgba(220,38,38,0.15)' : 'var(--color-error-light)',
                        border: `1px solid ${dark ? '#ef4444' : 'var(--color-error)'}`,
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        color: dark ? '#fca5a5' : 'var(--color-error-dark)',
                        fontSize: '13px',
                        fontWeight: 500,
                    }}>
                        No se pudieron cargar las estadísticas. Intenta recargar la página.
                    </div>
                )}

                {/* Stats grid */}
                <div style={{
                    display: `grid`,
                    gridTemplateColumns: `repeat(2, 1fr)`,
                    gap: `14px`,
                    marginBottom: `28px`,
                }}
                className="stats-grid"
                >
                    <style>{`
                        @media (min-width: 640px) {
                            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 18px !important; }
                        }
                        @media (min-width: 900px) {
                            .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
                        }
                    `}</style>

                    {CARDS.map(card => (
                        <div key={card.key} className="stat-card-anim">
                            <StatCard
                                card={card}
                                value={stats?.[card.key]}
                                loading={loading}
                                dark={dark}
                            />
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        animation: 'fadeUp 0.45s 0.32s ease both',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        boxShadow: theme.cardShadow,
                        border: `1px solid ${theme.cardBorder}`,
                        background: theme.cardBg,
                    }}
                >
                    
                    <div style={{ padding: '14px 16px 16px' }}>
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            aspectRatio: '16/7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <img
                                src="/img/buho.webp"
                                alt="Foto de buho."
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    borderRadius: '12px',
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

function getTheme(dark) {
    return {
        cardBg:         dark ? '#160C22'                        : '#ffffff',
        cardBorder:     dark ? 'rgba(103,37,119,0.28)'          : 'rgba(214,182,223,0.55)',
        cardShadow:     dark ? '0 8px 32px rgba(0,0,0,0.45)'   : '0 4px 24px rgba(103,37,119,0.10)',
        inputBg:        dark ? '#1F1030'                        : '#f9f6fb',
        inputBorder:    dark ? 'rgba(103,37,119,0.35)'          : '#e5d9ef',
        inputText:      dark ? '#EAD8F5'                        : '#111827',
        labelText:      dark ? '#C8A8D8'                        : '#4A1A5E',
        bodyText:       dark ? '#9880B0'                        : '#6B7280',
        tableHead:      dark ? '#1A0D2E'                        : '#f5f0f9',
        tableHeadText:  dark ? '#C8A8D8'                        : '#4A1A5E',
        tableRow:       dark ? '#160C22'                        : '#ffffff',
        tableRowAlt:    dark ? '#1A0D2B'                        : '#faf7fc',
        tableRowHover:  dark ? 'rgba(103,37,119,0.10)'          : 'rgba(103,37,119,0.05)',
        tableBorder:    dark ? 'rgba(103,37,119,0.16)'          : 'rgba(214,182,223,0.45)',
        dividerText:    dark ? '#6B5080'                        : '#c4aed4',
        emptyIcon:      dark ? 'rgba(103,37,119,0.18)'          : 'rgba(103,37,119,0.08)',
        paginBg:        dark ? '#1F1030'                        : '#f5f0f9',
        paginBorder:    dark ? 'rgba(103,37,119,0.28)'          : 'rgba(214,182,223,0.6)',
        paginText:      dark ? '#C8A8D8'                        : '#4A1A5E',
        paginActiveBg:  '#672577',
        paginActiveText:'#ffffff',
        badgeTotal:     dark ? 'rgba(103,37,119,0.20)'          : 'rgba(103,37,119,0.10)',
        badgeTotalText: dark ? '#C8A8D8'                        : '#672577',
        sortActive:     '#672577',
        sortInactive:   dark ? '#6B5080'                        : '#c4aed4',
    }
}