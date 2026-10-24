"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Inter_Tight, Manrope } from "next/font/google";
import QRCode from "qrcode";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  KeyRound,
  LoaderCircle,
  Mail,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { EventFormRunner } from "@/components/event-forms/form-runner";
import styles from "@/components/event-forms/public-form.module.css";
import { EventVenue } from "@/components/event-forms/event-venue";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { HomeFooterFrame } from "@/components/public-site/home-institutional";

const footerSans = Manrope({ subsets: ["latin"], variable: "--font-public-sans", display: "swap" });
const footerStory = Inter_Tight({ subsets: ["latin"], variable: "--font-story-sans", display: "swap" });

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  dateStyle: "long",
  timeStyle: "short",
});
function eventDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha por confirmar"
    : dateFormat.format(date);
}

async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No pudimos conectar. Revisa tu conexión y vuelve a intentarlo.",
    );
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      result.error || result.message || "No se pudo completar la solicitud.",
    );
    error.fields = result.errors || {};
    error.code = result.code;
    throw error;
  }
  return result;
}

function Confirmation({ registration, message }) {
  const [qr, setQr] = useState("");
  const [qrError, setQrError] = useState(false);
  useEffect(() => {
    let current = true;
    if (!registration.qrValue) return;
    QRCode.toDataURL(registration.qrValue, {
      width: 420,
      margin: 3,
      errorCorrectionLevel: "M",
      color: { dark: "#29295d", light: "#ffffff" },
    })
      .then((url) => {
        if (current) {
          setQr(url);
          setQrError(false);
        }
      })
      .catch(() => {
        if (current) setQrError(true);
      });
    return () => {
      current = false;
    };
  }, [registration.qrValue]);

  function downloadConfirmation() {
    const text = `SEDIPRO UNT\nConfirmación de inscripción\n\nEvento: ${registration.eventTitle}\nParticipante: ${registration.nombre}\nCódigo de inscripción: ${registration.codigo}\nEstado: Inscripción confirmada\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `inscripcion-${registration.codigo}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      className={styles.confirmation}
      aria-labelledby="registration-success-title"
    >
      <div className={styles.successIcon}>
        <CheckCircle2 size={36} strokeWidth={1.5} />
      </div>
      <h2 id="registration-success-title">Tu lugar está confirmado.</h2>
      <p className={styles.successMessage}>
        {message ||
          "Tu inscripción se registró correctamente. ¡Nos vemos en el evento!"}
      </p>
      <dl className={styles.ticketInfo}>
        <div>
          <dt>Participante</dt>
          <dd>{registration.nombre}</dd>
        </div>
        <div>
          <dt>Código de inscripción</dt>
          <dd className={styles.ticketCode}>{registration.codigo}</dd>
        </div>
      </dl>
      {registration.qrValue && (
        <div className={styles.qrArea}>
          {qr ? (
            <Image
              unoptimized
              src={qr}
              width={240}
              height={240}
              alt={`QR de la inscripción ${registration.codigo}`}
            />
          ) : qrError ? (
            <p role="alert">
              Tu inscripción está confirmada, pero no pudimos dibujar el QR.
              Recarga y usa «Recuperar mi inscripción» para volver a obtenerlo.
            </p>
          ) : (
            <p role="status">
              <LoaderCircle size={20} className={styles.spin} />
              Preparando tu QR…
            </p>
          )}
          <p>Guarda tu QR para tenerlo a mano el día del evento.</p>
        </div>
      )}
      <div className={styles.confirmationActions}>
        {qr && (
          <a
            className={styles.primaryButton}
            href={qr}
            download={`qr-${registration.codigo}.png`}
          >
            <Download size={17} />
            Descargar mi QR
          </a>
        )}
        <button
          className={qr ? styles.secondaryButton : styles.primaryButton}
          type="button"
          onClick={downloadConfirmation}
        >
          <Download size={17} />
          Descargar confirmación
        </button>
      </div>
      <div className={styles.deliveryNote}>
        <Mail size={18} />
        <p>
          {registration.correoEstado === "sin_configurar"
            ? "El envío de correos aún no está disponible. Descarga tu confirmación para conservarla."
            : registration.correoEstado === "enviado"
              ? "También enviamos la confirmación a tu correo registrado."
              : "Tu inscripción ya está guardada. La confirmación por correo está pendiente de envío."}
        </p>
      </div>
    </section>
  );
}

function Recovery({ slug, available, onRecovered, onBack }) {
  const [dni, setDni] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const scope = "recover-registration";

  async function requestCode(event) {
    event.preventDefault();
    if (!/^\d{8}$/.test(dni)) {
      setError("Escribe los 8 dígitos de tu DNI.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await requestJson(
        `/api/eventos/public/${encodeURIComponent(slug)}/recuperar`,
        { method: "POST", body: JSON.stringify({ dni }) },
      );
      const result = response.data || response;
      setChallengeId(result.challengeId);
      setMessage(
        result.message ||
          "Si tienes una inscripción vigente, recibirás un código en el correo que registraste.",
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function verifyCode(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Escribe el código de 6 dígitos que recibiste.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await requestJson(
        `/api/eventos/public/${encodeURIComponent(slug)}/recuperar/verificar`,
        { method: "POST", body: JSON.stringify({ challengeId, code }) },
      );
      onRecovered(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.recovery} aria-labelledby="recovery-title">
      <KeyRound size={30} strokeWidth={1.5} className={styles.recoveryIcon} />
      <h2 id="recovery-title">Recupera tu inscripción.</h2>
      <p>
        Vuelve a ver tu confirmación y descarga tu QR, si este evento lo
        utiliza.
      </p>
      {!available ? (
        <div className={styles.closedNotice}>
          <Mail size={20} />
          <p>
            La recuperación por correo aún no está disponible para este evento.
            Si ya te inscribiste, conserva la confirmación que descargaste o
            comunícate con la organización.
          </p>
        </div>
      ) : challengeId ? (
        <form onSubmit={verifyCode} noValidate>
          <p className={styles.recoveryMessage}>{message}</p>
          <label className={styles.label} htmlFor={`${scope}-code`}>
            Código de verificación
          </label>
          <input
            id={`${scope}-code`}
            className={`${styles.input} ${styles.codeInput}`}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-describedby={error ? `${scope}-error` : undefined}
            disabled={busy}
          />
          {error && (
            <p className={styles.fieldError} id={`${scope}-error`} role="alert">
              {error}
            </p>
          )}
          <button
            className={styles.primaryButton}
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <LoaderCircle size={17} className={styles.spin} />
            ) : (
              <QrCode size={17} />
            )}
            {busy ? "Verificando…" : "Ver mi inscripción"}
          </button>
          <button
            className={styles.textButton}
            type="button"
            disabled={busy}
            onClick={() => {
              setChallengeId("");
              setCode("");
              setError("");
            }}
          >
            Cambiar DNI o solicitar otro código
          </button>
        </form>
      ) : (
        <form onSubmit={requestCode} noValidate>
          <label className={styles.label} htmlFor={`${scope}-dni`}>
            DNI
          </label>
          <input
            id={`${scope}-dni`}
            className={styles.input}
            value={dni}
            onChange={(event) =>
              setDni(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
            inputMode="numeric"
            maxLength={8}
            autoComplete="off"
            aria-describedby={error ? `${scope}-error` : `${scope}-help`}
            disabled={busy}
          />
          <p className={styles.help} id={`${scope}-help`}>
            Si estás inscrito, enviaremos un código al correo que utilizaste.
          </p>
          {error && (
            <p className={styles.fieldError} id={`${scope}-error`} role="alert">
              {error}
            </p>
          )}
          <button
            className={styles.primaryButton}
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <LoaderCircle size={17} className={styles.spin} />
            ) : (
              <ArrowRight size={17} />
            )}
            {busy ? "Solicitando…" : "Enviar código"}
          </button>
        </form>
      )}
      <p className={styles.privacyNote}>
        <ShieldCheck size={16} />
        Verificamos tu correo antes de mostrar tu inscripción.
      </p>
      <button
        className={styles.textButton}
        type="button"
        onClick={onBack}
        disabled={busy}
      >
        <ArrowLeft size={16} />
        Volver al evento
      </button>
    </section>
  );
}

export default function EventoPublicoPage() {
  const { slug } = useParams();
  return <EventoPublico key={slug} slug={slug} />;
}

function EventoPublico({ slug }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submission = useRef({ signature: "", key: "" });
  const resultHeading = useRef(null);
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    requestJson(`/api/eventos/public/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
    })
      .then((response) => {
        setEvent(response.data);
        setError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug, attempt]);

  async function submit(payload) {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    const signature = JSON.stringify({ version: event.version, ...payload });
    if (submission.current.signature !== signature)
      submission.current = { signature, key: crypto.randomUUID() };
    try {
      const response = await requestJson(
        `/api/eventos/public/${encodeURIComponent(slug)}/inscripciones`,
        {
          method: "POST",
          body: JSON.stringify({
            version: event.version,
            ...payload,
            idempotencyKey: submission.current.key,
          }),
        },
      );
      setDone(response.data);
      requestAnimationFrame(() => resultHeading.current?.focus());
    } catch (error) {
      setError(error.message);
      setFieldErrors(error.fields || {});
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <main className={styles.page} data-page-ready="false" aria-busy="true" />
    );
  if (!event)
    return (
      <main className={styles.page}>
        <div className={styles.unavailable}>
          <Image
            src="/logos/sedi-logo.svg"
            alt="SEDIPRO UNT"
            width={170}
            height={60}
          />
          <CalendarDays size={36} strokeWidth={1.5} />
          <h1>Este evento no está disponible.</h1>
          <p>
            {error || "Comprueba el enlace o consulta con la organización."}
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            <RefreshCw size={16} />
            Volver a intentar
          </button>
          <Link href="/" className={styles.textButton}>
            Ir a SEDIPRO UNT
            <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );

  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
        <Link href="/" aria-label="SEDIPRO UNT, ir al inicio">
          <Image
            src="/logos/sedi-logo.svg"
            alt="SEDIPRO UNT"
            width={156}
            height={55}
          />
        </Link>
        <span>Inscripciones</span>
        <Link href="/" className={styles.siteBack}>
          Volver al sitio
          <ArrowRight size={20} />
        </Link>
        </div>
      </header>
      <main id="main-content" className={styles.layout}>
        <aside className={styles.eventAside} aria-labelledby="event-title">
          <div className={styles.eventIntro}>
            <h1 id="event-title">{event.titulo}</h1>
            {event.descripcion && (
              <p className={styles.eventDescription}>{event.descripcion}</p>
            )}
            <dl className={styles.eventDetails}>
              <div>
                <dt>
                  <CalendarDays size={18} />
                  Cuándo
                </dt>
                <dd>{eventDate(event.fechaInicio)}</dd>
              </div>
            </dl>
            <EventVenue event={event} />
          </div>
        </aside>
        <div className={styles.formPanel}>
          {done ? (
            <div ref={resultHeading} tabIndex={-1}>
              <Confirmation
                registration={done}
                message={event.formulario?.settings?.confirmationMessage}
              />
            </div>
          ) : recovering ? (
            <Recovery
              slug={slug}
              available={event.recoveryAvailable}
              onRecovered={(data) => {
                setDone(data);
                setRecovering(false);
                requestAnimationFrame(() => resultHeading.current?.focus());
              }}
              onBack={() => setRecovering(false)}
            />
          ) : (
            <>
              <div className={styles.panelTop}>
                <span>
                  <Check size={14} />
                  Inscripción sin cuenta
                </span>
                <button
                  type="button"
                  onClick={() => setRecovering(true)}
                  className={styles.recoveryLink}
                >
                  Ya me inscribí
                  <KeyRound size={14} />
                </button>
              </div>
              {!event.abierta ? (
                <section className={styles.closedState}>
                  <CalendarDays size={32} strokeWidth={1.5} />
                  <h2>Las inscripciones están cerradas.</h2>
                  <p>
                    {event.motivoCierre ||
                      "Por ahora no estamos recibiendo nuevas inscripciones para este evento."}
                  </p>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setRecovering(true)}
                  >
                    <QrCode size={17} />
                    Recuperar mi inscripción
                  </button>
                </section>
              ) : event.formulario ? (
                <>
                  {error && (
                    <div className={styles.submitError} role="alert">
                      <p>{error}</p>
                      <button
                        className={styles.textButton}
                        type="button"
                        onClick={() => setRecovering(true)}
                      >
                        Si ya te inscribiste, recupera tu confirmación
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                  <EventFormRunner
                    key={`${event._id}-${event.version}`}
                    form={event.formulario}
                    onSubmit={submit}
                    submitting={submitting}
                    serverErrors={fieldErrors}
                    qrEnabled={event.qrHabilitado}
                  />
                </>
              ) : (
                <section className={styles.closedState}>
                  <h2>Estamos preparando el formulario.</h2>
                  <p>
                    La organización publicará las inscripciones próximamente.
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <div className={`${styles.landingFooter} ${footerSans.variable} ${footerStory.variable}`}>
        <ElasticSection surface="#141020" previous="#f7f5f9" revealBackground pronounced>
          <HomeFooterFrame><PublicFooter socialShowcase /></HomeFooterFrame>
        </ElasticSection>
      </div>
    </div>
  );
}
