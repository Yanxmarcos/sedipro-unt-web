'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from '@/components/Icon'
import Link from 'next/link'

const NAV_ITEMS = [
    { href: '/panel', label: 'Dashboard', iconKey: 'Dashboard', exact: true },
    { href: '/panel/asistencias', label: 'Asistencias', iconKey: 'Attendance' },
    { href: '/panel/eventos', label: 'Eventos', iconKey: 'Attendance' },
    { href: '/panel/votaciones', label: 'Votaciones', iconKey: 'Vote' },
    { href: '/panel/sedipranos', label: 'Sedipranos', iconKey: 'Members' },
    { href: '/panel/usuarios', label: 'Usuarios', iconKey: 'Members', adminOnly: true },
    {
        href: '/panel/sedinvita',
        label: 'SEDInvita',
        iconKey: 'SEDInvita',
        children: [
            { type: 'label', label: 'Configuración' },
            { href: '/panel/sedinvita/edicion', label: 'Edicion' },
            { href: '/panel/sedinvita/postulantes', label: 'Postulantes' },
            { href: '/panel/sedinvita/turnos', label: 'Turnos' },
            { href: '/panel/sedinvita/areas', label: 'Áreas' },
            { href: '/panel/sedinvita/grupos', label: 'Grupos y facilitadores' },
            { href: '/panel/sedinvita/dinamicas', label: 'Dinamicas' },
            { type: 'label', label: 'Día del evento' },
            { href: '/panel/sedinvita/asistencia', label: 'Asistencia' },
            { href: '/panel/sedinvita/evaluacion', label: 'Evaluación' },
            // { type: 'label', label: 'Cierre' },
            // { href: '/panel/sedinvita/resultados', label: 'Resultados' },
        ],
    },
]

// Devuelve true si la ruta actual corresponde a este item de submenú.
// Los items con exact:true (como "Resumen") solo se activan en coincidencia exacta,
// para que no "se enciendan" cada vez que la ruta es un hijo más profundo de SEDInvita.
function isChildActive(child, pathname) {
    if (!child.href) return false
    if (child.exact) return pathname === child.href
    return pathname === child.href || pathname.startsWith(child.href + '/')
}

function getActiveInfo(pathname, items = NAV_ITEMS) {
    for (const item of items) {
        if (item.children) {
            const child = item.children.find(c => c.href && isChildActive(c, pathname))
            if (child) return { item, label: item.label, sub: child.label === 'Resumen' ? null : child.label }
        } else {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            if (active) return { item, label: item.label, sub: null }
        }
    }
    return { item: NAV_ITEMS[0], label: 'Dashboard', sub: null }
}

function SideNavGroup({ item, pathname, hideLabel, theme, open, onToggle, onLinkClick }) {
    const IconComp = Icon[item.iconKey]
    const childActive = item.children.some(c => c.href && isChildActive(c, pathname))
    const parentActive = childActive
    const submenuHeight = item.children.reduce((acc, c) => acc + (c.type === 'label' ? 32 : 42), 0) + 12

    return (
        <div className="sdp-navgroup" style={{ marginBottom: '2px', position: 'relative' }}>
            {hideLabel ? (
                <Link
                    href={item.children?.[0]?.href || '/'} 
                    onClick={onLinkClick}
                    title={item.label}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px', borderRadius: '12px', textDecoration: 'none',
                        background: childActive ? 'linear-gradient(135deg,#672577,#3454A1)' : 'transparent',
                        color: childActive ? '#fff' : theme.navText,
                        boxShadow: childActive ? '0 4px 14px rgba(103,37,119,0.28)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = theme.navHoverBg }}
                    onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = '' }}
                >
                    <span style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp />
                    </span>
                </Link>
            ) : (
                <button
                    onClick={onToggle}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '10px', borderRadius: '12px',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: parentActive ? 'linear-gradient(135deg,#672577,#3454A1)' : 'transparent',
                        color: parentActive ? '#fff' : theme.navText,
                        boxShadow: parentActive ? '0 4px 14px rgba(103,37,119,0.28)' : 'none',
                        transition: 'background 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!parentActive) e.currentTarget.style.backgroundColor = theme.navHoverBg }}
                    onMouseLeave={(e) => { if (!parentActive) e.currentTarget.style.backgroundColor = '' }}
                >
                    <span style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp />
                    </span>
                    <span style={{
                        flex: 1, fontFamily: 'Poppins,sans-serif', fontSize: '13px',
                        fontWeight: childActive ? 600 : 500,
                        whiteSpace: 'nowrap', overflow: 'hidden',
                    }}>
                        {item.label}
                    </span>
                    <span style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: open ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                    }}>
                        <Icon.ChevronLeft />
                    </span>
                </button>
            )}

            {/* Submenu desplegable (sidebar expandida) */}
            {!hideLabel && (
                <div style={{
                    overflow: 'hidden',
                    maxHeight: open ? `${submenuHeight}px` : '0px',
                    transition: 'max-height 0.25s ease',
                }}>
                    <div style={{ paddingLeft: '0px', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.children.map(child => {
                            if (child.type === 'label') {
                                return (
                                    <p key={child.label} style={{
                                        fontFamily: 'Poppins,sans-serif', fontSize: '10px', fontWeight: 600,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        color: theme.bodyText, opacity: 0.75,
                                        margin: '6px 0 0 16px', padding: 0,
                                    }}>
                                        {child.label}
                                    </p>
                                )
                            }
                            const active = isChildActive(child, pathname)
                            return (
                                <Link
                                    key={child.href} href={child.href} onClick={onLinkClick}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                                        fontSize: '12px', fontFamily: 'Poppins,sans-serif',
                                        fontWeight: active ? 600 : 500,
                                        color: active ? '#fff' : theme.navText,
                                        background: active ? 'linear-gradient(135deg,#672577,#3454A1)' : 'transparent',
                                    }}
                                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = theme.navHoverBg }}
                                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '' }}
                                >
                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            border: `2px solid ${active ? '#fff' : theme.navText}`,
                                            background: 'transparent',
                                            opacity: active ? 1 : 0.6,
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                    {child.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Flyout (sidebar colapsada, desktop) */}
            {hideLabel && (
                <div className="sdp-flyout" style={{
                    position: 'absolute', left: 'calc(100% + 12px)', top: 0,
                    backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '12px', boxShadow: theme.cardShadow,
                    minWidth: '190px', padding: '6px', zIndex: 99,
                }}>
                    <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', fontWeight: 600, color: theme.labelText, margin: '4px 8px 6px' }}>
                        {item.label}
                    </p>
                    {item.children.map(child => {
                        if (child.type === 'label') {
                            return (
                                <p key={child.label} style={{
                                    fontFamily: 'Poppins,sans-serif', fontSize: '10px', fontWeight: 600,
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    color: theme.bodyText, opacity: 0.75,
                                    margin: '8px 8px 4px',
                                }}>
                                    {child.label}
                                </p>
                            )
                        }
                        const active = isChildActive(child, pathname)
                        return (
                            <Link
                                key={child.href} href={child.href} onClick={onLinkClick}
                                style={{
                                    display: 'block', padding: '7px 10px', borderRadius: '8px', textDecoration: 'none',
                                    fontSize: '12px', fontFamily: 'Poppins,sans-serif',
                                    fontWeight: active ? 600 : 500,
                                    color: active ? '#fff' : theme.navText,
                                    background: active ? 'linear-gradient(135deg,#672577,#3454A1)' : 'transparent',
                                }}
                                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = theme.navHoverBg }}
                                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '' }}
                            >
                                {child.label}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function getTheme(dark) {
    return {
        pageBg: dark ? '#0D0916' : '#f8f5fa',
        sidebarBg: dark ? 'rgba(16,8,26,0.98)' : 'rgba(214,182,223,0.62)',
        sidebarBorder: dark ? 'rgba(103,37,119,0.25)' : 'rgba(103,37,119,0.16)',
        sidebarShadow: dark ? '4px 0 32px rgba(0,0,0,0.6)' : '4px 0 24px rgba(103,37,119,0.12)',
        navbarBg: dark ? 'linear-gradient(90deg,#3B1550,#1E2F6B)' : 'linear-gradient(90deg,#672577,#3454A1)',
        navbarShadow: dark ? '0 2px 20px rgba(0,0,0,0.55)' : '0 2px 16px rgba(103,37,119,0.25)',
        brandPrimary: dark ? '#D6B6DF' : '#4A1A5E',
        brandSub: dark ? '#6B5880' : '#9180A0',
        navText: dark ? '#C8A8D8' : '#4A1A5E',
        navHoverBg: dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.10)',
        divider: dark ? 'rgba(103,37,119,0.22)' : 'rgba(103,37,119,0.15)',
        cardBg: dark ? '#160C22' : '#ffffff',
        cardBorder: dark ? 'rgba(103,37,119,0.30)' : 'rgba(214,182,223,0.50)',
        cardShadow: dark ? '0 24px 64px rgba(0,0,0,0.55)' : '0 20px 50px rgba(103,37,119,0.14)',
        inputBg: dark ? '#1F1030' : '#ffffff',
        inputBorder: dark ? 'rgba(103,37,119,0.38)' : '#D1D5DB',
        inputText: dark ? '#EAD8F5' : '#111827',
        labelText: dark ? '#C8A8D8' : '#4A1A5E',
        bodyText: dark ? '#9880B0' : '#6B7280',
        logoutHover: dark ? 'rgba(239,68,68,0.16)' : '#FEE2E2',
    }
}

function useIsMobile(bp = 768) {
    const [isMobile, setIsMobile] = useState(true)

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
        const handler = (e) => setIsMobile(e.matches)
        setIsMobile(mq.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [bp])

    return isMobile
}

function LoadingScreen({ dark }) {
    const bg = dark ? '#0D0916' : '#f8f5fa'
    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: bg,
            flexDirection: 'column', gap: '16px',
        }}>
            
            <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '3px solid rgba(103,37,119,0.18)',
                borderTopColor: '#672577',
                animation: 'sdpSpin 0.8s linear infinite',
            }} />
            <p style={{
                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                color: '#672577', margin: 0,
            }}>
                Verificando autenticación…
            </p>
            <style>{`@keyframes sdpSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

function PwField({ label, value, visible, onChange, onToggle, theme }) {
    return (
        <div>
            <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                fontFamily: 'Poppins,sans-serif', color: theme.labelText, marginBottom: '6px',
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#672577' }}>
                    <Icon.Lock />
                </span>
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    required
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: '34px', paddingRight: '38px', paddingTop: '11px', paddingBottom: '11px',
                        fontSize: '14px', fontFamily: 'Poppins,sans-serif',
                        borderRadius: '12px', border: `1px solid ${theme.inputBorder}`,
                        backgroundColor: theme.inputBg, color: theme.inputText,
                        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#672577'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.14)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = theme.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button
                    type="button" tabIndex={-1} onClick={onToggle}
                    style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.bodyText, padding: '3px', display: 'flex' }}
                >
                    {visible ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
            </div>
        </div>
    )
}

function SettingsModal({ open, onClose, userData, theme }) {
    const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
    const [show, setShow] = useState({ current: false, newPw: false, confirm: false })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    function reset() {
        setPw({ current: '', newPw: '', confirm: '' })
        setShow({ current: false, newPw: false, confirm: false })
        setError(''); setSuccess(false)
    }
    function handleClose() { reset(); onClose() }

    async function handleSubmit(e) {
        e.preventDefault(); setError('')
        if (pw.newPw !== pw.confirm) return setError('Las contraseñas no coinciden')
        if (pw.newPw.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña')
            setSuccess(true)
            setTimeout(handleClose, 2200)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    const displayName = userData?.nombres && userData?.apellidos
    ? `${userData.nombres} ${userData.apellidos}`
    : 'Usuario';
    const initial = displayName[0].toUpperCase()

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}
        >
            <div style={{
                width: '100%', maxWidth: '100%',
                maxHeight: '92dvh', overflowY: 'auto',
                borderRadius: '20px 20px 0 0',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.cardShadow,
                animation: 'settingsSlideUp 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}>
                
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: theme.navbarBg,
                    borderRadius: '20px 20px 0 0',
                    position: 'sticky', top: 0, zIndex: 1,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                        <Icon.Settings />
                        <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '15px' }}>Configuración de cuenta</span>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Icon.Close />
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${theme.divider}` }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#672577,#3454A1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '17px', fontFamily: 'Montserrat,sans-serif' }}>{initial}</span>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '14px', color: theme.labelText, margin: 0 }}>
                                {displayName}
                            </p>
                            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: theme.bodyText, margin: '3px 0 0' }}>
                                {userData?.rol || 'Administrador'} · SEDIPRO UNT
                            </p>
                        </div>
                    </div>

                    <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '13px', color: theme.labelText, marginBottom: '14px' }}>
                        Cambiar contraseña
                    </p>

                    {success ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#D1FAE5', border: '1px solid #10B981', color: '#065F46', fontFamily: 'Poppins,sans-serif', fontSize: '13px' }}>
                            <Icon.CheckCircle /> Contraseña actualizada correctamente
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <PwField label="Contraseña actual" value={pw.current} visible={show.current} onChange={(e) => setPw(p => ({ ...p, current: e.target.value }))} onToggle={() => setShow(s => ({ ...s, current: !s.current }))} theme={theme} />
                            <PwField label="Nueva contraseña" value={pw.newPw} visible={show.newPw} onChange={(e) => setPw(p => ({ ...p, newPw: e.target.value }))} onToggle={() => setShow(s => ({ ...s, newPw: !s.newPw }))} theme={theme} />
                            <PwField label="Confirmar nueva contraseña" value={pw.confirm} visible={show.confirm} onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} theme={theme} />

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', fontFamily: 'Poppins,sans-serif', fontSize: '13px' }}>
                                    <span style={{ marginTop: '1px', flexShrink: 0 }}><Icon.Warning /></span>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                                <button type="button" onClick={handleClose}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontFamily: 'Poppins,sans-serif', fontSize: '14px', fontWeight: 600, backgroundColor: theme.navHoverBg, color: theme.labelText, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontFamily: 'Poppins,sans-serif', fontSize: '14px', fontWeight: 600, background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#672577,#3454A1)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(103,37,119,0.35)' }}>
                                    {loading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <svg style={{ animation: 'sdpSpin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                                                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" style={{ opacity: 0.75 }} />
                                            </svg>
                                            Guardando…
                                        </span>
                                    ) : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    )}
                    <div style={{ height: 'env(safe-area-inset-bottom, 12px)' }} />
                </div>
            </div>

            <style>{`
                @keyframes settingsSlideUp {
                from { transform: translateY(100%); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
                }
                @media (min-width: 600px) {
                .settings-inner {
                    max-width: 440px !important;
                    border-radius: 20px !important;
                    align-self: center !important;
                }
                }
            `}</style>
        </div>
    )
}

function SideNavLink({ item, active, hideLabel, theme, onClick }) {
    const IconComp = Icon[item.iconKey]
    return (
        <Link
            href={item.href}
            onClick={onClick}
            title={hideLabel ? item.label : undefined}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px', borderRadius: '12px',
                textDecoration: 'none', position: 'relative', marginBottom: '2px',
                background: active ? 'linear-gradient(135deg,#672577,#3454A1)' : 'transparent',
                color: active ? '#fff' : theme.navText,
                boxShadow: active ? '0 4px 14px rgba(103,37,119,0.28)' : 'none',
                transition: 'background 0.15s, box-shadow 0.15s',
                userSelect: 'none', WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = theme.navHoverBg }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '' }}
        >
            {active && (
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '22px', borderRadius: '0 3px 3px 0', backgroundColor: 'rgba(255,255,255,0.5)' }} />
            )}
            <span style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp />
            </span>
            <span style={{
                fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: active ? 600 : 500,
                whiteSpace: 'nowrap', overflow: 'hidden',
                opacity: hideLabel ? 0 : 1,
                maxWidth: hideLabel ? '0px' : '180px',
                transition: 'opacity 0.18s, max-width 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {item.label}
            </span>
            {hideLabel && (
                <span className="sdp-tooltip" style={{
                    position: 'absolute', left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: '#672577', color: '#fff',
                    fontSize: '12px', fontFamily: 'Poppins,sans-serif', fontWeight: 500,
                    padding: '5px 11px', borderRadius: '8px', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(103,37,119,0.35)',
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s', zIndex: 99,
                }}>
                    {item.label}
                </span>
            )}
        </Link>
    )
}

export default function PanelLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useIsMobile(768)
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [darkMode] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [userData, setUserData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [openMenus, setOpenMenus] = useState({})

    const visibleNavItems = useMemo(() => {
        if (!userData) return NAV_ITEMS
        return NAV_ITEMS.filter(item => !item.adminOnly || userData.rol === 'ADMIN')
    }, [userData])

    useEffect(() => {
        visibleNavItems.forEach(item => {
            if (item.children?.some(c => c.href && isChildActive(c, pathname))) {
                setOpenMenus(prev => prev[item.href] ? prev : { ...prev, [item.href]: true })
            }
        })
    }, [pathname, visibleNavItems])

    useEffect(() => {
        try { setCollapsed(localStorage.getItem('sedipro_collapsed') === 'true') } catch { }
    }, [])

    // Tema único temporalmente: el panel se mantiene en modo claro.
    // useEffect(() => { try { localStorage.setItem('sedipro_dark', darkMode) } catch { } }, [darkMode])
    useEffect(() => { try { localStorage.setItem('sedipro_collapsed', collapsed) } catch { } }, [collapsed])

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                setIsLoading(true)
                const res = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    router.push('/login')
                    return
                }

                const data = await res.json()
                if (data.authenticated && data.user) {
                    setUserData(data.user)
                } else {
                    router.push('/login')
                }
            } catch (err) {
                console.error('Error verificando autenticación:', err)
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        verifyAuth()
    }, [router])

    useEffect(() => { setMobileOpen(false) }, [pathname])

    const handleToggle = useCallback(() => {
        if (isMobile) setMobileOpen(o => !o)
        else setCollapsed(c => !c)
    }, [isMobile])

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            })
            if (!res.ok) console.error('Error al cerrar sesión')
        } catch (err) {
            console.error('Error en logout:', err)
        } finally {
            setUserData(null)
            router.push('/login')
        }
    }

    function isActive(item) {
        return item.exact ? pathname === item.href : pathname.startsWith(item.href)
    }

    const activeInfo = getActiveInfo(pathname, visibleNavItems)
    const theme = getTheme(darkMode)
    const desktopCollapsed = !isMobile && collapsed
    const displayName = userData?.nombres && userData?.apellidos
    ? `${userData.nombres} ${userData.apellidos}`
    : 'Usuario';
    const initial = displayName[0]?.toUpperCase() ?? 'U'

    if (isLoading) return <LoadingScreen dark={darkMode} />

    if (!userData) return null

    const SIDEBAR_W = isMobile ? '260px' : (collapsed ? '64px' : '224px')

    return (
        <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', backgroundColor: theme.pageBg, fontFamily: 'Poppins,sans-serif', transition: 'background-color 0.3s' }}>

            <style>{`
                @keyframes sdpFadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sdpSpin    { to   { transform: rotate(360deg); } }
                a:hover .sdp-tooltip, button:hover .sdp-tooltip { opacity: 1 !important; }
                * { -webkit-tap-highlight-color: transparent; }
                ::-webkit-scrollbar        { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track  { background: transparent; }
                ::-webkit-scrollbar-thumb  { background: rgba(103,37,119,0.28); border-radius: 4px; }
                .sdp-navgroup { position: relative; }
                .sdp-navgroup .sdp-flyout {
                    opacity: 0; visibility: hidden; transform: translateX(-6px);
                    transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
                    pointer-events: none;
                }
                .sdp-navgroup:hover .sdp-flyout {
                    opacity: 1; visibility: visible; transform: translateX(0);
                    pointer-events: auto;
                }
            `}</style>

            {isMobile && mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 39,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                        animation: 'sdpFadeIn 0.2s ease',
                    }}
                />
            )}

            <aside
                style={{
                    ...(isMobile ? {
                        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
                        width: SIDEBAR_W,
                        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                    } : {
                        position: 'relative', flexShrink: 0, zIndex: 'auto',
                        width: SIDEBAR_W, minWidth: SIDEBAR_W,
                        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }),
                    display: 'flex', flexDirection: 'column',
                    overflowX: 'hidden', overflowY: 'auto',
                    backgroundColor: theme.sidebarBg,
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    borderRight: `1px solid ${theme.sidebarBorder}`,
                    boxShadow: theme.sidebarShadow,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 12px', borderBottom: `1px solid ${theme.divider}`, minHeight: '68px', flexShrink: 0 }}>
                    <div style={{ flexShrink: 0, width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src="/logos/isotipo.webp" alt="SEDIPRO"
                            style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(103,37,119,0.35))' }}
                            onError={(e) => {
                                const fb = document.createElement('div')
                                fb.style.cssText = 'width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#672577,#3454A1);display:flex;align-items:center;justify-content:center'
                                fb.innerHTML = '<span style="color:#fff;font-size:14px;font-weight:700;font-family:Montserrat,sans-serif">S</span>'
                                e.currentTarget.replaceWith(fb)
                            }}
                        />
                    </div>
                    <div style={{
                        marginLeft: '10px', overflow: 'hidden', whiteSpace: 'nowrap',
                        opacity: desktopCollapsed ? 0 : 1,
                        maxWidth: desktopCollapsed ? '0px' : '180px',
                        transition: 'opacity 0.18s, max-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                    }}>
                        <p style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '13px', color: theme.brandPrimary, lineHeight: 1.2, margin: 0 }}>SEDIPRO UNT</p>
                        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '10px', fontWeight: 500, color: isMobile ? theme.brandPrimary : theme.brandSub, margin: '3px 0 0' }}>Panel de Control</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {visibleNavItems.map((item) => (
                        item.children ? (
                            <SideNavGroup
                                key={item.href}
                                item={item}
                                pathname={pathname}
                                hideLabel={desktopCollapsed}
                                theme={theme}
                                open={!!openMenus[item.href]}
                                onToggle={() => setOpenMenus(m => ({ ...m, [item.href]: !m[item.href] }))}
                                onLinkClick={() => isMobile && setMobileOpen(false)}
                            />
                        ) : (
                            <SideNavLink
                                key={item.href}
                                item={item}
                                active={isActive(item)}
                                hideLabel={desktopCollapsed}
                                theme={theme}
                                onClick={() => isMobile && setMobileOpen(false)}
                            />
                        )
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '8px', borderTop: `1px solid ${theme.divider}`, flexShrink: 0 }}>
                    <button
                        onClick={handleLogout}
                        title={desktopCollapsed ? 'Cerrar sesión' : undefined}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            width: '100%', padding: '10px', borderRadius: '12px',
                            border: 'none', backgroundColor: 'transparent',
                            color: '#EF4444', cursor: 'pointer', position: 'relative',
                            transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.logoutHover }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                    >
                        <span style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon.Logout />
                        </span>
                        <span style={{
                            fontFamily: 'Poppins,sans-serif', fontSize: '13px', fontWeight: 500,
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            opacity: desktopCollapsed ? 0 : 1,
                            maxWidth: desktopCollapsed ? '0px' : '180px',
                            transition: 'opacity 0.18s, max-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                        }}>
                            Cerrar sesión
                        </span>
                        {desktopCollapsed && (
                            <span className="sdp-tooltip" style={{
                                position: 'absolute', left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)',
                                backgroundColor: '#EF4444', color: '#fff',
                                fontSize: '12px', fontFamily: 'Poppins,sans-serif', fontWeight: 500,
                                padding: '5px 11px', borderRadius: '8px', whiteSpace: 'nowrap',
                                boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
                                pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s', zIndex: 99,
                            }}>
                                Cerrar sesión
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <header style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: '56px', padding: '0 12px 0 14px', flexShrink: 0,
                    background: theme.navbarBg, boxShadow: theme.navbarShadow,
                    transition: 'background 0.3s', position: 'relative', zIndex: 30,
                }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <button
                            onClick={handleToggle} aria-label="Toggle menú"
                            style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.88)', borderRadius: '10px', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)' }}
                        >
                            <Icon.Menu />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', minWidth: 0 }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Poppins,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>Panel</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}><Icon.ChevronRight /></span>
                            <span style={{ color: activeInfo.sub ? 'rgba(255,255,255,0.7)' : '#fff', fontSize: '13px', fontFamily: 'Poppins,sans-serif', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {activeInfo.label}
                            </span>
                            {activeInfo.sub && (
                                <>
                                    <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}><Icon.ChevronRight /></span>
                                    <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'Poppins,sans-serif', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activeInfo.sub}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>

                        {/* <button
                            onClick={() => setDarkMode(() => {})}
                            title={darkMode ? 'Modo claro' : 'Modo oscuro'} aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
                            style={{ background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.88)', borderRadius: '10px', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)' }}
                        >
                            {darkMode ? <Icon.Sun /> : <Icon.Moon />}
                        </button> */}

                        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 5px' }} />

                        <button
                            onClick={() => setSettingsOpen(true)}
                            title={`Configuración de cuenta (${displayName})`}
                            style={{
                                display: 'flex', alignItems: 'center',
                                gap: '7px',
                                padding: isMobile ? '5px' : '5px 10px 5px 5px',
                                backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '10px',
                                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.20)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}
                        >
                            
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg,rgba(255,255,255,0.30),rgba(255,255,255,0.12))',
                                border: '1.5px solid rgba(255,255,255,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'Montserrat,sans-serif', lineHeight: 1 }}>
                                    {initial}
                                </span>
                            </div>

                            {!isMobile && (
                                <span style={{
                                    color: '#fff', fontSize: '13px',
                                    fontFamily: 'Poppins,sans-serif', fontWeight: 500,
                                    maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {displayName}
                                </span>
                            )}
                        </button>
                    </div>
                </header>
                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: theme.pageBg, transition: 'background-color 0.3s' }}>
                    {children}
                </main>
            </div>

            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                userData={userData}
                theme={theme}
            />
        </div>
    )
}
