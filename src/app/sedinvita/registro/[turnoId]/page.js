'use client'

import {
  ClipboardCheck as AdminClipboardCheckIcon,
  LogOut as AdminLogOutIcon,
  LoaderCircle as AdminLoaderCircleIcon,
  Search as AdminSearchIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminModal } from '@/components/admin/form-controls'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  User: () => (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Group: () => (
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Present: () => (
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Late: () => (
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
}
export default function RegistroTurnoPage() {
  const router = useRouter()
  const params = useParams()
  const turnoId = params?.turnoId
  const [encargado, setEncargado] = useState(null)
  const [turno, setTurno] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [registrados, setRegistrados] = useState([])
  const [showLogout, setShowLogout] = useState(false)
  const [postulanteEncontrado, setPostulanteEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('presente')
  const [codigoBuscado, setCodigoBuscado] = useState('')
  const inputRef = useRef(null)
  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/sedinvita/encargados-asistencia/verify')
        const data = await res.json()
        if (res.status === 403) {
          setAuthError('revoked')
          return
        }
        if (!res.ok || !data?.user) {
          router.replace('/sedinvita/login')
          return
        }
        const miTurno = (data.turnos || []).find((t) => t._id === turnoId)
        if (!miTurno) {
          setAuthError('wrong_turno')
          return
        }
        setEncargado(data.user)
        setTurno(miTurno)
      } catch {
        router.replace('/sedinvita/login')
      } finally {
        setAuthLoading(false)
      }
    }
    verificar()
  }, [router, turnoId])
  useEffect(() => {
    if (!authLoading && !authError && inputRef.current) inputRef.current.focus()
  }, [authLoading, authError])
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4500)
    return () => clearTimeout(timer)
  }, [feedback])
  async function handleBuscar() {
    const codigoClean = codigo.trim()
    if (!codigoClean || codigoClean.length !== 10) {
      setFeedback({
        type: 'warn',
        msg: 'Ingresa un código de matrícula de 10 dígitos',
      })
      return
    }
    setBuscando(true)
    setPostulanteEncontrado(null)
    setFeedback(null)
    try {
      const res = await fetch(`/api/sedinvita/registro/${turnoId}?codigo=${encodeURIComponent(codigoClean)}`)
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 404) {
          setFeedback({
            type: 'warn',
            msg: 'No se encontró postulante con ese código',
          })
        } else if (res.status === 400) {
          setFeedback({
            type: 'warn',
            msg: data.message || 'El postulante no pertenece a este turno',
          })
        } else if (res.status === 401 || res.status === 403) {
          setAuthError('revoked')
          return
        } else {
          setFeedback({
            type: 'error',
            msg: data.message || 'Error al buscar postulante',
          })
        }
        setBuscando(false)
        return
      }
      if (data.success && data.postulante) {
        setPostulanteEncontrado(data.postulante)
        setCodigoBuscado(codigoClean)
        if (data.asistencia) {
          setEstadoSeleccionado(data.asistencia.estado)
        } else {
          setEstadoSeleccionado('presente')
        }
        setFeedback({
          type: 'success',
          msg: `Postulante encontrado: ${data.postulante.nombres} ${data.postulante.apellidos}`,
        })
      }
    } catch (error) {
      console.error('Error al buscar postulante:', error)
      setFeedback({
        type: 'error',
        msg: 'Error de conexión al buscar postulante',
      })
    } finally {
      setBuscando(false)
    }
  }
  async function handleSubmit(e) {
    e.preventDefault()
    if (!postulanteEncontrado) {
      setFeedback({
        type: 'warn',
        msg: 'Primero busca un postulante válido',
      })
      return
    }
    setSubmitting(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/sedinvita/registro/${turnoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoMatricula: codigoBuscado,
          estado: estadoSeleccionado,
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
        return
      }
      if (data.yaRegistrado) {
        setFeedback({
          type: 'warn',
          msg: data.message,
        })
        if (data.estadoActual) {
          setRegistrados((prev) => {
            const index = prev.findIndex((r) => r.codigo === codigoBuscado)
            if (index !== -1) {
              const newList = [...prev]
              newList[index] = {
                ...newList[index],
                estado: data.estadoActual,
              }
              return newList
            }
            return prev
          })
        }
        setPostulanteEncontrado(null)
        setCodigo('')
        setCodigoBuscado('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      setFeedback({
        type: 'success',
        msg: data.message,
      })
      const nuevoRegistro = {
        nombre: `${data.postulante.nombres} ${data.postulante.apellidos}`,
        codigo: data.postulante.codigoMatricula,
        grupo: data.postulante.grupo || null,
        estado: data.estadoActual || estadoSeleccionado,
        hora: new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setRegistrados((prev) => [nuevoRegistro, ...prev])
      setPostulanteEncontrado(null)
      setCodigo('')
      setCodigoBuscado('')
      setEstadoSeleccionado('presente')
    } catch {
      setFeedback({
        type: 'error',
        msg: 'Error de conexión. Intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }
  async function handleLogout() {
    try {
      await fetch('/api/sedinvita/encargados-asistencia/logout', {
        method: 'POST',
      })
    } catch {}
    router.replace('/sedinvita/login')
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
            Ya no eres encargado de este turno. Tu sesión ha sido revocada. Contacta a la directiva si crees
            que es un error.
          </p>
          <Button onClick={handleLogout} variant="default" type="button">
            Cerrar sesión
          </Button>
        </div>
      </div>
    )
  }
  if (authError === 'wrong_turno') {
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
            Solo puedes registrar asistencia en el turno que te fue asignado.
          </p>
          <Button onClick={() => router.replace('/sedinvita/login')} variant="default" type="button">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }
  const codigoLength = codigo.replace(/\D/g, '').length
  const isValidLength = codigoLength === 10
  return (
    <div className="space-y-6">
      {showLogout && (
        <AdminModal
          onClose={() => {
            setShowLogout(false)
          }}
        >
          <div className="space-y-6">
            <p className="text-sm text-foreground mb-4">¿Cerrar sesión?</p>
            <div className="flex gap-2">
              <Button onClick={() => setShowLogout(false)} variant="outline" type="button" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleLogout} variant="outline" type="button" className="flex-1">
                Salir
              </Button>
            </div>
          </div>
        </AdminModal>
      )}

      <header className="bg-muted pt-4 pr-4 pb-4 pl-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <AdminClipboardCheckIcon className="size-4" />
          <div>
            <p className="font-semibold text-sm m-0">{turno?.nombre || 'Turno'}</p>
            <p
              style={{
                opacity: 0.85,
              }}
              className="text-xs m-0"
            >
              {encargado?.nombres} {encargado?.apellidos}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowLogout(true)}
          variant="outline"
          type="button"
          className="flex items-center"
        >
          <AdminLogOutIcon className="size-4" /> Salir
        </Button>
      </header>

      <main
        style={{
          maxWidth: '480px',
        }}
        className="mx-auto pt-6 pr-4 pb-6 pl-4 flex flex-col gap-4"
      >
        <div className="bg-card border rounded-xl p-6 shadow-xs">
          {feedback && (
            <div className="flex items-start gap-2 pt-3 pr-3 pb-3 pl-3 rounded-xl mb-4 bg-muted border text-foreground">
              <span className="text-sm">{feedback.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Ico.IdCard /> Código de matrícula
              </Label>
              <span className="text-sm font-semibold text-destructive">{codigoLength}/10</span>
            </div>

            <div className="relative flex items-center bg-muted rounded-xl border overflow-hidden">
              <div className="flex items-center justify-center gap-0.5 pt-0 pr-2 pb-0 pl-2 flex-1">
                {Array.from(
                  {
                    length: 10,
                  },
                  (_, i) => {
                    const digit = codigo[i] || ''
                    const isFilled = digit !== ''
                    return (
                      <div
                        key={i}
                        style={{
                          width: '28px',
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
                value={codigo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setCodigo(value)
                }}
                placeholder=""
                disabled={submitting || buscando}
                maxLength={10}
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
                    width: `${(codigoLength / 10) * 100}%`,
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
                {isValidLength ? 'Listo' : codigoLength > 0 ? `${10 - codigoLength} restante` : '—'}
              </span>
            </div>

            <Button
              type="button"
              onClick={handleBuscar}
              disabled={!isValidLength || buscando}
              variant={!isValidLength || buscando ? 'default' : 'outline'}
              className="w-full mt-3 flex items-center justify-center"
            >
              {buscando ? (
                <AdminLoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <AdminSearchIcon className="size-4" />
              )}
              {buscando ? 'Buscando...' : 'Buscar postulante'}
            </Button>

            {postulanteEncontrado && (
              <div className="mt-4 pt-3 pr-4 pb-3 pl-4 bg-muted rounded-xl border">
                <div className="flex items-center gap-2 mb-2">
                  <Ico.User />
                  <span className="font-semibold text-foreground text-sm">
                    {postulanteEncontrado.nombres} {postulanteEncontrado.apellidos}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-foreground">
                  <span>
                    Código: <strong>{postulanteEncontrado.codigoMatricula}</strong>
                  </span>
                  {postulanteEncontrado.grupo && (
                    <span className="flex items-center gap-1">
                      <Ico.Group /> Grupo: <strong>{postulanteEncontrado.grupo}</strong>
                    </span>
                  )}
                  {postulanteEncontrado.correoElectronico && (
                    <span>📧 {postulanteEncontrado.correoElectronico}</span>
                  )}
                </div>
              </div>
            )}

            {postulanteEncontrado && (
              <div className="mt-4">
                <Label className="block text-sm font-semibold text-foreground mb-2">
                  Estado de asistencia
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setEstadoSeleccionado('presente')}
                    variant={estadoSeleccionado === 'presente' ? 'default' : 'outline'}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Ico.Present /> Presente
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEstadoSeleccionado('tardanza')}
                    variant={estadoSeleccionado === 'tardanza' ? 'default' : 'outline'}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Ico.Late /> Tardanza
                  </Button>
                </div>
              </div>
            )}

            <Button
              disabled={submitting || !postulanteEncontrado}
              style={{
                transform: postulanteEncontrado && !submitting ? 'scale(1)' : 'scale(0.98)',
                opacity: postulanteEncontrado && !submitting ? 1 : 0.6,
              }}
              type="submit"
              variant="default"
              className="w-full mt-4 flex items-center justify-center"
            >
              {submitting ? <AdminLoaderCircleIcon className="size-4 animate-spin" /> : <Ico.Check />}
              {submitting
                ? 'Registrando...'
                : postulanteEncontrado
                  ? `Marcar como ${estadoSeleccionado}`
                  : 'Busca un postulante primero'}
            </Button>

            <div className="mt-3 pt-2 pr-3 pb-2 pl-3 bg-muted rounded-xl border-l flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                No olvides darle al botón <strong>"Salir"</strong> cuando termines.
              </span>
            </div>
          </form>
        </div>

        {registrados.length > 0 && (
          <div className="bg-muted border rounded-xl overflow-hidden shadow-xs">
            <div className="pt-3 pr-4 pb-3 pl-4 border-b flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">Registrados esta sesión</span>
              <Badge variant="secondary" className="">
                {registrados.length}
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
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                      }}
                      className="rounded-full bg-muted shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground m-0">{r.nombre}</p>
                      <div className="flex gap-2 text-xs text-foreground">
                        <span>{r.codigo}</span>
                        {r.grupo && <span>• Grupo: {r.grupo}</span>}
                        <span className="font-semibold text-muted-foreground">
                          {r.estado === 'presente' ? '✓ Presente' : r.estado === 'tardanza' ? 'Tardanza' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{r.hora}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
