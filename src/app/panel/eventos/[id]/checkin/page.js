'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
function tokenFromQr(value) {
  try {
    return new URL(value.trim()).pathname.split('/').pop()
  } catch {
    return value.trim()
  }
}
export default function CheckinEventoPage() {
  const routeParams = useParams()
  const [id, setId] = useState(null)
  const [event, setEvent] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [qr, setQr] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [camera, setCamera] = useState(false)
  const scannerRef = useRef(null)
  useEffect(() => {
    setId(routeParams.id)
  }, [routeParams.id])
  useEffect(() => {
    if (!id) return
    fetch(`/api/eventos/${id}`)
      .then((r) => r.json())
      .then((d) => setEvent(d.data))
  }, [id])
  const search = useCallback(
    async (value) => {
      if (!id || value.trim().length < 2) {
        setResults([])
        return
      }
      const r = await fetch(`/api/eventos/${id}/inscripciones?q=${encodeURIComponent(value)}`)
      const d = await r.json()
      if (r.ok) setResults(d.data.slice(0, 10))
    },
    [id],
  )
  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])
  async function checkin(body) {
    setError('')
    setMessage('')
    try {
      const r = await fetch(`/api/eventos/${id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      const name = `${d.data.person.nombres} ${d.data.person.apellidos}`
      setMessage(
        d.alreadyRegistered
          ? `${name} ya fue registrado a las ${new Date(d.data.attendance.hora).toLocaleTimeString('es-PE')}.`
          : `✓ ${name} registrado como ${d.data.attendance.estado}.`,
      )
      setQr('')
      setQuery('')
      setResults([])
    } catch (e) {
      setError(e.message)
    }
  }
  async function checkQr(e) {
    e.preventDefault()
    if (!qr.trim()) return
    await checkin({
      token: tokenFromQr(qr),
    })
  }
  async function startCamera() {
    setError('')
    setCamera(true)
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('event-qr-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      })
      scannerRef.current = scanner
      await scanner.start(
        {
          facingMode: 'environment',
        },
        {
          fps: 10,
          qrbox: {
            width: 240,
            height: 240,
          },
        },
        async (decodedText) => {
          await stopCamera()
          await checkin({
            token: tokenFromQr(decodedText),
          })
        },
        () => {},
      )
    } catch (error) {
      await stopCamera()
      setError(
        error?.name === 'NotAllowedError'
          ? 'No se autorizó el uso de la cámara. Permítelo desde el navegador y vuelve a intentarlo.'
          : 'No se pudo iniciar la cámara. Verifica que esté conectada y que ninguna otra aplicación la esté usando.',
      )
    }
  }
  async function stopCamera() {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (!scanner) return
    try {
      if (scanner.isScanning) await scanner.stop()
      await scanner.clear()
    } catch {}
    setCamera(false)
  }
  useEffect(() => () => void stopCamera(), [])
  return (
    <div className="space-y-6">
      <Link
        href={`/panel/eventos/${id}`}
        className={buttonVariants({
          variant: 'outline',
        })}
      >
        ← Volver al evento
      </Link>
      <h1 className="mt-3 text-[var(--primary)] text-2xl font-semibold tracking-tight">
        Check-in: {event?.titulo || '…'}
      </h1>
      <p className="text-sm text-muted-foreground">Escanea el QR o busca por nombre, correo, DNI o código.</p>
      {(message || error) && (
        <p
          className={cn(
            `mt-4 rounded-lg p-3 font-medium ${error ? 'bg-muted text-destructive' : 'bg-muted text-foreground'} `,
            '',
          )}
        >
          {error || message}
        </p>
      )}
      <section className="mt-5 rounded-xl border border-border bg-muted p-5 shadow-sm">
        <h2 className="text-[var(--primary)] text-lg font-semibold">Registro con QR</h2>
        <form onSubmit={checkQr} className="mt-3 flex gap-2 space-y-6">
          <Input
            autoFocus
            value={qr}
            onChange={(e) => setQr(e.target.value)}
            placeholder="Escanea o pega el QR aquí"
            className="flex-1 placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="default">
            Registrar
          </Button>
        </form>
        <Button onClick={camera ? stopCamera : startCamera} variant="outline" type="button" className="mt-3">
          {camera ? 'Detener cámara' : 'Usar cámara del dispositivo'}
        </Button>
        <div
          id="event-qr-reader"
          className={cn(`mt-3 max-w-md overflow-hidden rounded-lg bg-muted ${camera ? '' : 'hidden'} `, '')}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Un lector QR USB funciona directamente en el campo superior.
        </p>
      </section>
      <section className="mt-5 rounded-xl border border-border bg-muted p-5 shadow-sm">
        <h2 className="text-[var(--primary)] text-lg font-semibold">Búsqueda manual</h2>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre, correo, DNI o código"
          className="mt-3 w-full placeholder:text-muted-foreground"
        />
        {results.length > 0 && (
          <div className="mt-3 divide-y divide-slate-200 rounded-lg border border-border text-foreground">
            {results.map((r) => (
              <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-semibold">
                    {r.personaId.nombres} {r.personaId.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.personaId.correo} · {r.codigo}
                  </p>
                  {r.asistencia && (
                    <p className="text-xs font-semibold text-foreground">
                      Ya registrado: {new Date(r.asistencia.hora).toLocaleTimeString('es-PE')}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() =>
                    checkin({
                      inscripcionId: r._id,
                    })
                  }
                  variant="outline"
                  type="button"
                >
                  {r.asistencia ? 'Verificar' : 'Marcar presente'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
