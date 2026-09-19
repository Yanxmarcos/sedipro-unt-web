"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-700";
const initial = {
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  lugar: "",
  cupo: "",
  estado: "borrador",
  inscripcionAbierta: false,
};

export default function EventosPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(
    () =>
      fetch("/api/eventos")
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          setEvents(d.data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  const set = (key, value) => setForm((x) => ({ ...x, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setForm(initial);
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="mx-auto max-w-6xl p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-sm text-slate-600">
            Inscripciones externas, QR y control presencial.
          </p>
        </div>
        <button
          className="rounded-lg bg-[#672577] px-4 py-2 font-semibold text-white"
          onClick={() => setOpen((x) => !x)}
        >
          {open ? "Cancelar" : "+ Crear evento"}
        </button>
      </div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {open && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 font-bold">Nuevo evento</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Título
              <input
                required
                className={input}
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Lugar
              <input
                className={input}
                value={form.lugar}
                onChange={(e) => set("lugar", e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Inicio
              <input
                required
                type="datetime-local"
                className={input}
                value={form.fechaInicio}
                onChange={(e) => set("fechaInicio", e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Fin
              <input
                type="datetime-local"
                className={input}
                value={form.fechaFin}
                onChange={(e) => set("fechaFin", e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Cupo{" "}
              <span className="font-normal text-slate-500">
                vacío = ilimitado
              </span>
              <input
                min="1"
                type="number"
                className={input}
                value={form.cupo}
                onChange={(e) => set("cupo", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={form.inscripcionAbierta}
                onChange={(e) => set("inscripcionAbierta", e.target.checked)}
              />
              Abrir inscripción al publicarlo
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">
            Descripción
            <textarea
              className={input}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
            />
          </label>
          <button
            disabled={saving}
            className="mt-4 rounded-lg bg-[#672577] px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Crear borrador"}
          </button>
        </form>
      )}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Cargando eventos…</p>
        ) : events.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Aún no hay eventos.</p>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <article
                key={event._id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">{event.titulo}</h2>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                      {event.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(event.fechaInicio).toLocaleString("es-PE")} ·{" "}
                    {event.lugar || "Sin lugar"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {event.totalInscripciones} inscritos ·{" "}
                    {event.totalAsistencias} presentes
                    {event.cupo ? ` · cupo ${event.cupo}` : ""}
                  </p>
                </div>
                <Link
                  className="rounded-lg border border-purple-300 px-3 py-2 text-sm font-semibold text-purple-800"
                  href={`/panel/eventos/${event._id}`}
                >
                  Gestionar
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
