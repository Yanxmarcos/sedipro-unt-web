'use client'

import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AdminModal } from '@/components/admin/form-controls'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
const ESCALA = [
  {
    valor: 1,
    etiqueta: 'Malo',
  },
  {
    valor: 2,
    etiqueta: 'Regular',
  },
  {
    valor: 3,
    etiqueta: 'Bueno',
  },
  {
    valor: 4,
    etiqueta: 'Excelente',
  },
]
export default function EvaluarPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [facilitador, setFacilitador] = useState(null)
  const [grupos, setGrupos] = useState([])
  const [grupoId, setGrupoId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [postulanteId, setPostulanteId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/sedinvita/facilitadores/verify')
        const data = await res.json()
        if (res.status === 403) {
          setAuthError('revoked')
          return
        }
        if (!res.ok || !data?.user) {
          router.replace('/sedinvita/facilitador/login')
          return
        }
        setFacilitador(data.user)
        setGrupos(data.grupos)
        if (data.grupos.length === 1) setGrupoId(data.grupos[0]._id)
      } catch {
        router.replace('/sedinvita/facilitador/login')
      } finally {
        setAuthLoading(false)
      }
    }
    verificar()
  }, [router])
  const fetchDetalle = useCallback(async (id) => {
    if (!id) return
    setLoadingDetalle(true)
    try {
      const res = await fetch(`/api/sedinvita/evaluaciones?grupoId=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDetalle(data)
      if (data.grupo.postulantes.length > 0 && !postulanteId) {
        setPostulanteId(data.grupo.postulantes[0]._id)
      }
    } catch {
      setFeedback({
        type: 'error',
        msg: 'No se pudo cargar el grupo',
      })
    } finally {
      setLoadingDetalle(false)
    }
  }, [])
  useEffect(() => {
    if (grupoId) fetchDetalle(grupoId)
  }, [grupoId, fetchDetalle])
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 3500)
    return () => clearTimeout(timer)
  }, [feedback])
  async function handleLogout() {
    try {
      await fetch('/api/sedinvita/facilitadores/logout', {
        method: 'POST',
      })
    } catch {}
    router.replace('/sedinvita/facilitador/login')
  }
  async function guardarEvaluacion(dinamicaId, payload) {
    try {
      const res = await fetch('/api/sedinvita/evaluaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grupoId,
          postulanteId,
          dinamicaId,
          ...payload,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setFeedback({
        type: 'success',
        msg: 'Evaluación guardada ✓',
      })
      const evaluacionGuardada = data.data || data.evaluacion
      setDetalle((prev) => {
        const evaluacionesActualizadas = prev.evaluaciones.filter(
          (e) => !(e.postulanteId === postulanteId && e.dinamicaId === dinamicaId),
        )
        return {
          ...prev,
          evaluaciones: [...evaluacionesActualizadas, evaluacionGuardada],
        }
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.message,
      })
    }
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
          <h2 className="text-foreground mt-0 mr-0 mb-2 ml-0 text-lg font-semibold">Acceso revocado</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ya no tienes grupos asignados. Contacta a la directiva si crees que es un error.
          </p>
          <Button onClick={handleLogout} variant="default" type="button">
            Cerrar sesión
          </Button>
        </div>
      </div>
    )
  }
  if (!grupoId) {
    return (
      <div className="space-y-6">
        <p className="font-semibold text-base text-foreground mb-4">Elige el grupo que vas a evaluar</p>
        <div
          style={{
            maxWidth: '380px',
          }}
          className="flex flex-col gap-2 w-full"
        >
          {grupos.map((g) => (
            <Button
              key={g._id}
              onClick={() => setGrupoId(g._id)}
              variant="outline"
              type="button"
              className="h-auto min-h-9 whitespace-normal py-3"
            >
              <strong className="text-current text-sm">{g.nombre || 'Grupo'}</strong>
              <p className="mt-0.5 mr-0 mb-0 ml-0 text-sm text-current">
                {g.turnoId?.nombre} · {g.postulantes.length} postulantes
              </p>
            </Button>
          ))}
        </div>
      </div>
    )
  }
  const postulantes = detalle?.grupo?.postulantes || []
  const dinamicas = detalle?.dinamicas || []
  const evaluaciones = detalle?.evaluaciones || []
  const evaluacionesPorClave = new Map(evaluaciones.map((e) => [`${e.postulanteId}_${e.dinamicaId}`, e]))
  const postulanteActivo = postulantes.find((p) => p._id === postulanteId)
  function evaluacionesCompletadas(pId) {
    return dinamicas.filter((d) => evaluacionesPorClave.has(`${pId}_${d._id}`)).length
  }
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

      <header
        style={{
          top: 0,
          zIndex: 10,
        }}
        className="bg-muted pt-3 pr-4 pb-3 pl-4 flex items-center justify-between sticky"
      >
        <div className="text-foreground">
          <p className="font-semibold text-sm m-0">{detalle?.grupo?.nombre || 'Mi grupo'}</p>
          <p
            style={{
              opacity: 0.85,
            }}
            className="text-xs m-0"
          >
            {detalle?.grupo?.turnoId?.nombre} · {facilitador?.nombres} {facilitador?.apellidos}
          </p>
        </div>
        <Button onClick={() => setShowLogout(true)} variant="outline" type="button">
          Salir
        </Button>
      </header>

      {feedback && (
        <div className="mt-2 mr-4 mb-0 ml-4 pt-2 pr-3 pb-2 pl-3 rounded-xl text-sm bg-muted border text-foreground">
          {feedback.msg}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pt-3 pr-4 pb-3 pl-4">
        {postulantes.map((p) => {
          const completadas = evaluacionesCompletadas(p._id)
          const activo = p._id === postulanteId
          return (
            <Button
              key={p._id}
              onClick={() => setPostulanteId(p._id)}
              type="button"
              variant={activo ? 'default' : 'outline'}
              className="shrink-0"
            >
              {p.apellidos}, {p.nombres.split(' ')[0]}
              <span
                style={{
                  opacity: 0.7,
                }}
                className="ml-1.5 text-xs"
              >
                {completadas}/{dinamicas.length}
              </span>
            </Button>
          )
        })}
      </div>

      <main
        style={{
          maxWidth: '560px',
        }}
        className="mx-auto pt-0 pr-4 pb-8 pl-4 flex flex-col gap-3"
      >
        {loadingDetalle ? (
          <p className="text-center text-foreground text-sm pt-8 pr-0 pb-8 pl-0">Cargando…</p>
        ) : !postulanteActivo ? (
          <p className="text-center text-foreground text-sm pt-8 pr-0 pb-8 pl-0">
            No hay postulantes en este grupo
          </p>
        ) : dinamicas.length === 0 ? (
          <p className="text-center text-foreground text-sm pt-8 pr-0 pb-8 pl-0">
            Aún no hay dinámicas configuradas para este turno
          </p>
        ) : (
          dinamicas.map((d) => (
            <DinamicaCard
              key={d._id}
              dinamica={d}
              evaluacionExistente={evaluacionesPorClave.get(`${postulanteId}_${d._id}`)}
              onGuardar={(payload) => guardarEvaluacion(d._id, payload)}
            />
          ))
        )}
      </main>
    </div>
  )
}
function DinamicaCard({ dinamica, evaluacionExistente, onGuardar }) {
  const inicial = Object.fromEntries(
    dinamica.competencias.map((c) => [
      c,
      evaluacionExistente?.puntajes?.find((p) => p.competencia === c)?.puntaje || 0,
    ]),
  )
  const [puntajes, setPuntajes] = useState(inicial)
  const [comentario, setComentario] = useState(evaluacionExistente?.comentario || '')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setPuntajes(
      Object.fromEntries(
        dinamica.competencias.map((c) => [
          c,
          evaluacionExistente?.puntajes?.find((p) => p.competencia === c)?.puntaje || 0,
        ]),
      ),
    )
    setComentario(evaluacionExistente?.comentario || '')
  }, [evaluacionExistente, dinamica._id])
  const completo = dinamica.competencias.every((c) => puntajes[c] > 0)
  async function handleGuardar() {
    setSaving(true)
    await onGuardar({
      puntajes: dinamica.competencias.map((c) => ({
        competencia: c,
        puntaje: puntajes[c],
      })),
      comentario,
      opinionInfiltrado: '',
    })
    setSaving(false)
  }
  function togglePuntaje(competencia, valor) {
    setPuntajes((prev) => ({
      ...prev,
      [competencia]: prev[competencia] === valor ? 0 : valor,
    }))
  }
  return (
    <div className="bg-card border rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm text-foreground m-0">{dinamica.nombre}</p>
        {evaluacionExistente && (
          <Badge variant="secondary" className="">
            Guardado ✓
          </Badge>
        )}
      </div>

      {dinamica.competencias.map((c) => (
        <div key={c} className="mb-3">
          <p className="text-sm font-semibold text-foreground mb-1.5">{c}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {ESCALA.map((opt) => {
              const activo = puntajes[c] === opt.valor
              return (
                <Button
                  key={opt.valor}
                  onClick={() => togglePuntaje(c, opt.valor)}
                  type="button"
                  variant={activo ? 'default' : 'outline'}
                >
                  {opt.valor} · {opt.etiqueta}
                </Button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mb-3 grid gap-2">
        <Label className="text-sm font-semibold text-foreground block mb-1">Comentario adicional</Label>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={2}
          className="w-full"
        />
      </div>

      <Button
        onClick={handleGuardar}
        disabled={!completo || saving}
        type="button"
        variant="default"
        className="w-full"
      >
        {saving ? 'Guardando…' : 'Guardar evaluación'}
      </Button>
    </div>
  )
}
