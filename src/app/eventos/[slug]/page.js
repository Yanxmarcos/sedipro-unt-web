"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import GhostFibers from "@/components/GhostFibers";

const field =
  "mt-1 w-full rounded-lg border border-white/25 bg-white/75 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#672577] focus:ring-2 focus:ring-[#672577]/20";

const upperLetters = (value, maxLength) =>
  value
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, "")
    .slice(0, maxLength);
function Surface({ children, className = "" }) {
  return (
    <section
      className={`mx-auto w-full max-w-2xl overflow-hidden rounded-[14px] border border-white/20 bg-[#120f1773] shadow-[0_4px_32px_#00000040,inset_0_.5px_#ffffff0f] backdrop-blur-[32px] backdrop-saturate-[1.3] ${className}`}
    >
      {children}
    </section>
  );
}

export default function EventoPublicoPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    dni: "",
    celular: "",
    organizacion: "",
    respuestas: {},
  });
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/eventos/public/${slug}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setEvent(data.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/eventos/public/${slug}/inscripciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const qr = await QRCode.toDataURL(data.data.qrValue, {
        width: 300,
        margin: 2,
        color: { dark: "#4a1a5e", light: "#ffffff" },
      });
      setDone({ ...data.data, qr });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#160c22] text-white">
        Cargando evento…
      </main>
    );
  if (error && !event)
    return (
      <main className="grid min-h-screen place-items-center bg-[#160c22] p-6 text-center text-white">
        {error}
      </main>
    );
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-12">
      <div className="absolute inset-0 -z-10">
        <GhostFibers lineColor="#672577" glowColor="#c98ae0" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[#120d1a]/35" />
      {done ? (
        <Surface className="max-w-lg p-7 text-center text-white">
          <img
            src="/logos/sedi-logo.svg"
            alt="SEDIPRO UNT"
            className="mx-auto h-auto w-40 brightness-0"
          />
          <p className="mt-6 text-sm font-bold tracking-[.2em] text-[#e9c9f3]">
            INSCRIPCIÓN CONFIRMADA
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            ¡Nos vemos en {event.titulo}!
          </h1>
          <p className="mt-3 text-white/75">
            Guarda este QR. Se solicitará al ingreso.
          </p>
          <img
            className="mx-auto my-5 rounded-xl bg-white p-2"
            src={done.qr}
            alt="Código QR de asistencia"
          />
          <p className="rounded-lg bg-white/10 p-3 font-mono font-bold text-white">
            {done.codigo}
          </p>
          <p className="mt-4 text-sm text-white/70">Inscrito: {done.nombre}</p>
        </Surface>
      ) : (
        <Surface>
          <header className="border-b text-center border-white/10 bg-white/[.06] p-6 text-white sm:p-8">
            <img
              src="/logos/sedi-logo.svg"
              alt="SEDIPRO UNT"
              className="mx-auto block h-auto w-40 brightness-0 invert"
            />
            <p className="mt-6 text-xs font-bold tracking-[.2em] text-purple-500">
              EVENTO
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              {event.titulo}
            </h1>
            {event.descripcion && (
              <p className="mt-3 whitespace-pre-wrap text-white/80">
                {event.descripcion}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} strokeWidth={2} />
                {new Date(event.fechaInicio).toLocaleString("es-PE")}
              </span>
              {event.lugar && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={2} />
                  {event.lugar}
                </span>
              )}
            </div>
          </header>
          <form
            onSubmit={submit}
            className="space-y-4 bg-transparent p-6 text-white sm:p-8"
          >
            <h2 className="text-xl font-bold text-white">Formulario</h2>
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Nombres
                <input
                  required
                  autoCapitalize="characters"
                  className={field}
                  value={form.nombres}
                  onChange={(e) =>
                    set("nombres", upperLetters(e.target.value, 80))
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Apellidos
                <input
                  required
                  autoCapitalize="characters"
                  className={field}
                  value={form.apellidos}
                  onChange={(e) =>
                    set("apellidos", upperLetters(e.target.value, 80))
                  }
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Correo electrónico
              <input
                required
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                className={field}
                value={form.correo}
                onChange={(e) => set("correo", e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                DNI{" "}
                <span className="font-normal text-white/70">
                  {form.dni.length}/8
                </span>
                <input
                  required
                  inputMode="numeric"
                  maxLength="8"
                  pattern="[0-9]{8}"
                  className={field}
                  value={form.dni}
                  onChange={(e) =>
                    set("dni", e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Celular{" "}
                <span className="font-normal text-white/70">
                  {form.celular.length}/9
                </span>
                <input
                  required
                  inputMode="numeric"
                  maxLength="9"
                  pattern="[0-9]{9}"
                  className={field}
                  value={form.celular}
                  onChange={(e) =>
                    set(
                      "celular",
                      e.target.value.replace(/\D/g, "").slice(0, 9),
                    )
                  }
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Universidad, organización o empresa{" "}
              <span className="font-normal text-white/70">
                {form.organizacion.length}/100
              </span>
              <input
                required
                maxLength="100"
                autoCapitalize="characters"
                className={field}
                value={form.organizacion}
                onChange={(e) =>
                  set("organizacion", upperLetters(e.target.value, 100))
                }
              />
            </label>
            {event.camposPersonalizados.map((custom) => (
              <label key={custom.clave} className="block text-sm font-semibold">
                {custom.etiqueta}
                {custom.requerido && " *"}
                {custom.tipo === "textarea" ? (
                  <textarea
                    required={custom.requerido}
                    className={field}
                    value={form.respuestas[custom.clave] || ""}
                    onChange={(e) =>
                      set("respuestas", {
                        ...form.respuestas,
                        [custom.clave]: e.target.value,
                      })
                    }
                  />
                ) : custom.tipo === "seleccion" ? (
                  <select
                    required={custom.requerido}
                    className={field}
                    value={form.respuestas[custom.clave] || ""}
                    onChange={(e) =>
                      set("respuestas", {
                        ...form.respuestas,
                        [custom.clave]: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecciona una opción</option>
                    {custom.opciones?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required={custom.requerido}
                    type={custom.tipo === "numero" ? "number" : "text"}
                    className={field}
                    value={form.respuestas[custom.clave] || ""}
                    onChange={(e) =>
                      set("respuestas", {
                        ...form.respuestas,
                        [custom.clave]: e.target.value,
                      })
                    }
                  />
                )}
              </label>
            ))}
            <label className="flex items-start gap-2 text-xs text-white/75">
              <input required className="mt-0.5" type="checkbox" />
              <span>
                Autorizo el tratamiento de mis datos para gestionar mi
                participación en este evento.
              </span>
            </label>
            <button
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#672577] px-4 py-3 font-bold text-white shadow-lg shadow-[#672577]/25 transition hover:bg-[#541e61] disabled:opacity-60"
            >
              <ShieldCheck size={18} />
              {saving ? "Registrando…" : "Confirmar inscripción y generar QR"}
            </button>
          </form>
        </Surface>
      )}
    </main>
  );
}
