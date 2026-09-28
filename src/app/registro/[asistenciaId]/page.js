'use client'

import {
  LogOut as AdminLogOutIcon,
  ClipboardCheck as AdminClipboardCheckIcon,
  ArrowLeft as AdminArrowLeftIcon,
  LoaderCircle as AdminLoaderCircleIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminModal } from '@/components/admin/form-controls'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AlarmClockCheck, AlarmClockMinus } from 'lucide-react'
const Ico = {
  Check: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  IdCard: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Spinner: () => (
    <svg width="18" height="18" viewBox="0 0 36 36" fill="none" className="animate-spin">
      <circle cx="18" cy="18" r="14" strokeWidth="3" stroke="currentColor" />
      <path d="M18 4a14 14 0 0 1 14 14" strokeWidth="3" strokeLinecap="round" stroke="currentColor" />
    </svg>
  ),
  Alert: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  User: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Attendance: () => (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Back: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
}
function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}
export default function RegistroAsistenciaPage() {
  const router = useRouter()
  const params = useParams()
  const asistenciaId = params?.asistenciaId
  const [encargado, setEncargado] = useState(null)
  const [asistencia, setAsistencia] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [dni, setDni] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [registrados, setRegistrados] = useState([])
  const [showLogout, setShowLogout] = useState(false)
  const [loadingOverlay, setLoadingOverlay] = useState(false)
  const [awaitingEstado, setAwaitingEstado] = useState(null)
  const inputRef = useRef(null)
  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/auth/verify')
        const data = await res.json()
        if (!res.ok || !data?.user) {
          router.replace('/login')
          return
        }
        const isLegacyManager = data.user.rol === 'ENCARGADO'
        const isPanelMember = ['SEDIPRANO', 'USER'].includes(data.user.rol)
        if (!isLegacyManager && !isPanelMember) {
          router.replace('/panel')
          return
        }
        if (isPanelMember) {
          const assignmentsResponse = await fetch('/api/mi/asistencias', { cache: 'no-store' })
          const assignments = await assignmentsResponse.json()
          const isAssigned = assignmentsResponse.ok
            && assignments.data?.some((item) => String(item._id) === String(asistenciaId))
          if (!isAssigned) {
            setAuthError('wrong_asistencia')
            setAuthLoading(false)
            return
          }
        }
        if (data.user.asistenciaId && data.user.asistenciaId !== asistenciaId) {
          setAuthError('wrong_asistencia')
          setAuthLoading(false)
          return
        }
        setEncargado(data.user)
      } catch {
        router.replace('/login')
      } finally {
        setAuthLoading(false)
      }
    }
    verificar()
  }, [router, asistenciaId])
  useEffect(() => {
    if (!asistenciaId || authLoading || authError) return
    fetch(`/api/asistencias/${asistenciaId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.asistencia) setAsistencia(d.asistencia)
      })
      .catch(() => {})
  }, [asistenciaId, authLoading, authError])
  useEffect(() => {
    if (!authLoading && !authError && !awaitingEstado && inputRef.current) {
      inputRef.current.focus()
    }
  }, [authLoading, authError, awaitingEstado])
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4500)
    return () => clearTimeout(timer)
  }, [feedback])
  function handleSubmit(e) {
    e.preventDefault()
    const dniClean = dni.trim()
    if (!dniClean || dniClean.length < 8) return
    setFeedback(null)
    setAwaitingEstado({
      dni: dniClean,
    })
  }
  async function handleRegistrar(estado) {
    if (!awaitingEstado) return
    setSubmitting(true)
    setLoadingOverlay(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/registro/${asistenciaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: awaitingEstado.dni,
          estado,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthError('revoked')
          return
        }
        setFeedback({
          type: 'error',
          msg: data.message || 'Error al registrar',
        })
        setAwaitingEstado(null)
        return
      }
      if (data.yaRegistrado) {
        setFeedback({
          type: 'warn',
          msg: data.message,
          nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
        })
        setAwaitingEstado(null)
        return
      }
      setFeedback({
        type: 'success',
        msg: data.message,
        nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
      })
      setRegistrados((prev) => [
        {
          nombre: `${data.sediprano.nombres} ${data.sediprano.apellidos}`,
          area: data.sediprano.area,
          hora: new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          estado,
        },
        ...prev,
      ])
    } catch {
      setFeedback({
        type: 'error',
        msg: 'Error de conexión. Intenta de nuevo.',
      })
      setAwaitingEstado(null)
    } finally {
      setSubmitting(false)
      setLoadingOverlay(false)
      setAwaitingEstado(null)
      setDni('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }
  function handleCancelarEstado() {
    setAwaitingEstado(null)
    setFeedback(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch {}
    router.replace('/login')
  }
  if (authLoading) {
    return (
      <div className="space-y-6">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" className="animate-spin">
          <circle cx="18" cy="18" r="14" strokeWidth="3" stroke="currentColor" />
          <path d="M18 4a14 14 0 0 1 14 14" strokeWidth="3" strokeLinecap="round" stroke="currentColor" />
        </svg>
      </div>
    )
  }
  if (authError === 'revoked') {
    return (
      <div className="space-y-6">
        <div
          style={{
            maxWidth: '360px',
          }}
          className="text-center"
        >
          <div
            style={{
              opacity: 0.5,
            }}
            className="text-destructive mb-4 flex justify-center"
          >
            <Ico.Lock />
          </div>
          <h2 className="text-foreground mt-0 mr-0 mb-2 ml-0 text-lg font-semibold">Acceso revocado</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ya no eres el encargado de esta asistencia. Tu sesión ha sido revocada. Contacta a la directiva si
            crees que es un error.
          </p>
          <Button onClick={handleLogout} variant="default" type="button">
            Cerrar sesión
          </Button>
        </div>
      </div>
    )
  }
  if (authError === 'wrong_asistencia') {
    return (
      <div className="space-y-6">
        <div
          style={{
            maxWidth: '360px',
          }}
          className="text-center"
        >
          <div className="text-foreground mb-4 flex justify-center">
            <Ico.Lock />
          </div>
          <h2 className="text-foreground mt-0 mr-0 mb-2 ml-0 text-lg font-semibold">Acceso no permitido</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Solo puedes registrar asistencia en la sesión que te fue asignada.
          </p>
          <Button onClick={handleLogout} variant="default" type="button">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }
  const dniLength = dni.length
  return (
    <div className="space-y-6">
      {showLogout && (
        <AdminModal onClose={() => setShowLogout(false)}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                }}
                className="rounded-full bg-muted flex items-center justify-center shrink-0 text-foreground"
              >
                <AdminLogOutIcon className="size-4" />
              </div>
              <h3 className="text-foreground m-0 text-lg font-semibold">Cerrar sesión</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Seguro que deseas cerrar sesión? Deberás volver a ingresar tus credenciales para continuar.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowLogout(false)} variant="outline" type="button" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleLogout} variant="default" type="button" className="flex-1">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </AdminModal>
      )}

      {loadingOverlay && (
        <AdminModal>
          <div className="space-y-6" />
          <p className="font-semibold text-sm text-foreground m-0">Registrando asistencia...</p>
        </AdminModal>
      )}

      <header
        style={{
          top: 0,
          zIndex: 100,
        }}
        className="bg-muted border-b pt-3 pr-4 pb-3 pl-4 flex items-center justify-between sticky shadow-xs"
      >
        <div className="flex items-center gap-2">
          <img
            src="/logos/isotipo.webp"
            alt="SEDIPRO"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
          <div>
            <p className="font-semibold text-sm text-foreground m-0">Registro de Asistencia</p>
            {asistencia && (
              <p className="text-xs text-foreground m-0">
                {formatDate(asistencia.fecha)} · {asistencia.descripcion}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => setShowLogout(true)}
          variant="outline"
          type="button"
          className="flex items-center"
        >
          <AdminLogOutIcon className="size-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </header>

      <main
        style={{
          maxWidth: '520px',
        }}
        className="mx-auto pt-6 pr-4 pb-6 pl-4"
      >
        {encargado && (
          <div className="flex items-center gap-3 bg-muted border rounded-xl pt-3 pr-4 pb-3 pl-4 mb-6 shadow-xs">
            <div
              style={{
                width: '42px',
                height: '42px',
              }}
              className="rounded-full overflow-hidden shrink-0 border"
            >
              <img
                src="/img/hito-cara.jpg"
                alt="Foto de encargado"
                style={{
                  objectFit: 'cover',
                }}
                className="w-full h-full"
              />
            </div>
            <div>
              <p className="text-xs text-foreground m-0 font-semibold">Encargado de asistencia</p>
              <p className="font-semibold text-sm text-foreground m-0">
                {encargado.nombres} {encargado.apellidos}
              </p>
            </div>
          </div>
        )}

        <div className="bg-muted border rounded-xl overflow-hidden shadow-xs mb-4">
          <div
            style={{
              height: '4px',
            }}
            className="bg-muted"
          />

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-foreground">
                <AdminClipboardCheckIcon className="size-4" />
              </div>
              <h2 className="text-foreground m-0 text-lg font-semibold">Registrar asistencia</h2>
            </div>

            {feedback &&
              (() => {
                return (
                  <div className="flex items-start gap-2 bg-muted border rounded-xl pt-3 pr-3 pb-3 pl-3 mb-4">
                    <span className="text-foreground shrink-0 mt-0.5">
                      {feedback.type === 'success' ? <Ico.Check /> : <Ico.Alert />}
                    </span>
                    <div>
                      {feedback.nombre && (
                        <p className="text-sm font-semibold text-foreground mt-0 mr-0 mb-0.5 ml-0">
                          {feedback.nombre}
                        </p>
                      )}
                      <p className="text-sm text-foreground m-0">{feedback.msg}</p>
                    </div>
                  </div>
                )
              })()}

            {!awaitingEstado && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Ingresa el DNI del sediprano para elegir su estado.
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Ico.IdCard /> DNI del Sediprano
                    </Label>
                    <span className="text-sm font-semibold text-destructive">{dniLength}/8</span>
                  </div>

                  <div className="relative flex items-center bg-muted rounded-xl border overflow-hidden pt-0 pr-2 pb-0 pl-2">
                    <div className="flex items-center justify-center gap-0.5 pt-0 pr-2 pb-0 pl-2 flex-1">
                      {Array.from(
                        {
                          length: 8,
                        },
                        (_, i) => {
                          const digit = dni[i] || ''
                          const isFilled = digit !== ''
                          return (
                            <div
                              key={i}
                              style={{
                                width: '36px',
                                height: '48px',
                              }}
                              className="flex items-center justify-center text-lg font-semibold text-foreground border-b"
                            >
                              {digit || '•'}
                            </div>
                          )
                        },
                      )}
                    </div>

                    <Input
                      ref={inputRef}
                      type="text"
                      value={dni}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                        setDni(value)
                      }}
                      placeholder=""
                      disabled={submitting}
                      maxLength={8}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      style={{
                        inset: 0,
                        opacity: 0,
                        zIndex: 10,
                      }}
                      className="absolute w-full"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div
                      style={{
                        height: '4px',
                      }}
                      className="flex-1 rounded-xl bg-muted overflow-hidden"
                    >
                      <div
                        style={{
                          width: `${(dniLength / 8) * 100}%`,
                        }}
                        className="h-full bg-muted rounded-xl"
                      />
                    </div>
                    <span
                      style={{
                        minWidth: '40px',
                      }}
                      className="text-xs font-medium text-destructive text-right"
                    >
                      {dniLength === 8 ? 'Listo' : dniLength > 0 ? `${8 - dniLength} restante` : '—'}
                    </span>
                  </div>
                </div>

                <Button
                  disabled={dni.trim().length < 8}
                  type="submit"
                  variant="default"
                  className="w-full flex items-center justify-center"
                >
                  <Ico.User /> Marcar Sediprano
                </Button>
              </form>
            )}

            {awaitingEstado && (
              <div>
                <div className="bg-muted border rounded-xl pt-2 pr-3 pb-2 pl-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground flex">
                      <Ico.IdCard />
                    </span>
                    <span className="text-sm text-foreground font-semibold">DNI:</span>
                    <span className="text-sm text-foreground font-semibold">{awaitingEstado.dni}</span>
                  </div>
                  <Button
                    onClick={handleCancelarEstado}
                    disabled={submitting}
                    variant="outline"
                    type="button"
                    className="flex items-center"
                  >
                    <AdminArrowLeftIcon className="size-4" /> Cambiar
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  ¿Con qué estado deseas registrar al sediprano?
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleRegistrar('presente')}
                    disabled={submitting}
                    type="button"
                    variant={submitting ? 'default' : 'outline'}
                    className="flex flex-col items-center"
                  >
                    {submitting ? (
                      <AdminLoaderCircleIcon className="size-4 animate-spin" />
                    ) : (
                      <AlarmClockCheck />
                    )}
                    <span>Presente</span>
                  </Button>

                  <Button
                    onClick={() => handleRegistrar('tardanza')}
                    disabled={submitting}
                    type="button"
                    variant={submitting ? 'default' : 'outline'}
                    className="flex flex-col items-center"
                  >
                    {submitting ? (
                      <AdminLoaderCircleIcon className="size-4 animate-spin" />
                    ) : (
                      <AlarmClockMinus />
                    )}
                    <span>Tardanza</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {registrados.length > 0 && (
          <div className="bg-muted border rounded-xl overflow-hidden shadow-xs">
            <div className="pt-3 pr-4 pb-3 pl-4 border-b flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">Registrados esta sesión</span>
              <Badge variant="secondary" className="">
                {registrados.length} registrado{registrados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <ul
              style={{
                maxHeight: '280px',
              }}
              className="m-0 p-0 overflow-y-auto"
            >
              {registrados.map((r, i) => (
                <li key={i} className="flex items-center justify-between pt-3 pr-4 pb-3 pl-4 border-b">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                      }}
                      className="rounded-full shrink-0 bg-muted"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground m-0">{r.nombre}</p>
                      <p className="text-xs text-foreground m-0">{r.area}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <Badge variant="secondary" className="">
                      {r.estado === 'tardanza' ? 'Tardanza' : 'Presente'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{r.hora}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
