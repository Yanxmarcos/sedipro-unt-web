"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GestionEventoPage() {
  const routeParams = useParams();
  const [id, setId] = useState(null);
  const [event, setEvent] = useState(null);
  const [regs, setRegs] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [field, setField] = useState({
    clave: "",
    etiqueta: "",
    tipo: "texto",
    requerido: false,
    opciones: "",
  });
  useEffect(() => {
    setId(routeParams.id);
  }, [routeParams.id]);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/eventos/${id}`),
        fetch(`/api/eventos/${id}/inscripciones`),
      ]);
      const da = await a.json();
      const db = await b.json();
      if (!a.ok) throw new Error(da.error);
      if (!b.ok) throw new Error(db.error);
      setEvent(da.data);
      setRegs(db.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  async function patch(data) {
    const r = await fetch(`/api/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setEvent(d.data);
    return d.data;
  }
  async function togglePublish() {
    try {
      const next = event.estado === "publicado" ? "cerrado" : "publicado";
      await patch({ estado: next, inscripcionAbierta: next === "publicado" });
      setNotice(
        next === "publicado"
          ? "Evento publicado e inscripciones abiertas."
          : "Inscripciones cerradas.",
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function createSheet() {
    try {
      const r = await fetch(`/api/eventos/${id}/google-sheet`, {
        method: "POST",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setEvent((x) => ({ ...x, googleSheetUrl: d.data.url }));
      setNotice("Hoja de Google creada correctamente.");
    } catch (e) {
      setError(e.message);
    }
  }
  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const f = new FormData();
      f.append("file", file);
      const r = await fetch(`/api/eventos/${id}/importar`, {
        method: "POST",
        body: f,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setNotice(
        `Importación terminada: ${d.data.created} creados, ${d.data.duplicates} duplicados omitidos${d.data.errors.length ? `, ${d.data.errors.length} con error` : ""}.`,
      );
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }
  async function addField(e) {
    e.preventDefault();
    if (!field.clave || !field.etiqueta) return;
    try {
      await patch({
        camposPersonalizados: [
          ...(event.camposPersonalizados || []),
          {
            ...field,
            opciones: field.opciones
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          },
        ],
      });
      setField({
        clave: "",
        etiqueta: "",
        tipo: "texto",
        requerido: false,
        opciones: "",
      });
    } catch (e) {
      setError(e.message);
    }
  }
  async function deleteField(i) {
    try {
      await patch({
        camposPersonalizados: event.camposPersonalizados.filter(
          (_, n) => n !== i,
        ),
      });
    } catch (e) {
      setError(e.message);
    }
  }
  if (loading)
    return <div className="p-8 text-center text-slate-700">Cargando evento…</div>;
  if (!event)
    return (
      <div className="p-8 text-red-700">{error || "Evento no encontrado"}</div>
    );
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/eventos/${event.slug}`
      : `/eventos/${event.slug}`;
  return (
    <div className="mx-auto max-w-6xl p-5 text-slate-800 sm:p-8">
      <Link
        href="/panel/eventos"
        className="text-sm font-semibold text-purple-800"
      >
        ← Todos los eventos
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{event.titulo}</h1>
          <p className="text-sm text-slate-600">
            {new Date(event.fechaInicio).toLocaleString("es-PE")} ·{" "}
            {event.lugar || "Sin lugar"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={togglePublish}
            className="rounded-lg bg-[#672577] px-3 py-2 text-sm font-semibold text-white"
          >
            {event.estado === "publicado"
              ? "Cerrar inscripción"
              : "Publicar y abrir"}
          </button>
          <Link
            href={`/panel/eventos/${id}/checkin`}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Abrir check-in
          </Link>
        </div>
      </div>
      {(error || notice) && (
        <p
          className={`mt-4 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {error || notice}
        </p>
      )}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#672577]">Formulario público</h2>
          <p className="mt-2 break-all rounded bg-slate-50 p-2 text-sm text-slate-700">
            {publicUrl}
          </p>
          <a
            className="mt-3 inline-block text-sm font-semibold text-purple-800 underline"
            href={publicUrl}
            target="_blank"
          >
            Abrir formulario
          </a>
          <hr className="my-5 border-slate-200" />
          <h2 className="font-bold text-[#672577]">Google Sheets</h2>
          {event.googleSheetUrl ? (
            <a
              className="mt-2 inline-block text-sm font-semibold text-purple-800 underline"
              href={event.googleSheetUrl}
              target="_blank"
            >
              Abrir hoja vinculada ↗
            </a>
          ) : (
            <button
              onClick={createSheet}
              className="mt-3 rounded-lg border border-purple-300 px-3 py-2 text-sm font-semibold text-purple-800"
            >
              Crear hoja del evento
            </button>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Requiere las credenciales de Google configuradas en el servidor.
          </p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#672577]">Importar respuestas de Google Forms</h2>
          <p className="mt-2 text-sm text-slate-600">
            Admite CSV, XLS o XLSX. Columnas requeridas: Nombres, Apellidos y
            Correo electrónico. Reconoce DNI, Celular y
            Organización/Universidad.
          </p>
          <label className="mt-4 inline-block cursor-pointer rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
            {uploading ? "Importando…" : "Seleccionar archivo"}
            <input
              disabled={uploading}
              className="hidden"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={importFile}
            />
          </label>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-[#672577]">Campos personalizados</h2>
          <form onSubmit={addField} className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              required
              placeholder="clave, ej. carrera"
              className="rounded border border-slate-300 p-2 text-sm text-slate-800"
              value={field.clave}
              onChange={(e) =>
                setField((x) => ({ ...x, clave: e.target.value }))
              }
            />
            <input
              required
              placeholder="Etiqueta"
              className="rounded border border-slate-300 p-2 text-sm text-slate-800"
              value={field.etiqueta}
              onChange={(e) =>
                setField((x) => ({ ...x, etiqueta: e.target.value }))
              }
            />
            <select
              className="rounded border border-slate-300 p-2 text-sm text-slate-800"
              value={field.tipo}
              onChange={(e) =>
                setField((x) => ({ ...x, tipo: e.target.value }))
              }
            >
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="seleccion">Selección</option>
              <option value="textarea">Texto largo</option>
            </select>
            <input
              placeholder="Opciones separadas por coma"
              className="rounded border border-slate-300 p-2 text-sm text-slate-800"
              value={field.opciones}
              onChange={(e) =>
                setField((x) => ({ ...x, opciones: e.target.value }))
              }
            />
            <button className="rounded bg-purple-700 p-2 text-sm font-semibold text-white">
              Agregar campo
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {event.camposPersonalizados?.map((f, i) => (
              <span
                key={`${f.clave}-${i}`}
                className="rounded bg-purple-50 px-2 py-1 text-sm text-purple-900"
              >
                {f.etiqueta}
                {f.requerido ? " *" : ""}{" "}
                <button
                  onClick={() => deleteField(i)}
                  className="ml-1 font-bold text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex justify-between p-5">
          <h2 className="font-bold text-[#672577]">Inscritos ({regs.length})</h2>
          <span className="text-sm text-slate-600">
            {event.totalAsistencias} presentes
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Persona</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Código</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {regs.map((r) => (
                <tr key={r._id}>
                  <td className="p-3 font-medium">
                    {r.personaId?.nombres} {r.personaId?.apellidos}
                  </td>
                  <td className="p-3">{r.personaId?.correo}</td>
                  <td className="p-3 font-mono text-xs">{r.codigo}</td>
                  <td className="p-3">{r.estado}</td>
                  <td className="p-3">
                    {r.asistencia
                      ? `${r.asistencia.estado} · ${new Date(r.asistencia.hora).toLocaleTimeString("es-PE")}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
