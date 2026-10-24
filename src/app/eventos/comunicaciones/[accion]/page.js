"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, LoaderCircle, Mail, MailX } from "lucide-react";
import { COMMUNICATIONS_CONSENT_TEXT } from "@/lib/event-communications.mjs";
import styles from "@/components/event-forms/public-form.module.css";

export default function CommunicationsAction() {
  const { accion } = useParams();
  const confirmation = accion === "confirmar";
  const [token, setToken] = useState("");
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const secret = window.location.hash.slice(1);
    // The capability travels in the fragment, never in request URLs or referrers.
    setToken(secret);
    let live = true;
    async function inspect() {
      if (!["confirmar", "cancelar"].includes(accion) || !secret)
        throw new Error(
          "Abre el enlace completo que recibiste por correo. Si necesitas ayuda, escríbenos a ti.sedipro@unitru.edu.pe.",
        );
      const response = await fetch(`/api/eventos/comunicaciones/${accion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: secret }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "No pudimos comprobar el enlace. Inténtalo nuevamente.",
        );
      if (live)
        setState(
          (confirmation && data.data.estado === "suscrito") ||
            (!confirmation && data.data.estado === "baja")
            ? "done"
            : "ready",
        );
    }
    inspect().catch((failure) => {
      if (live) {
        setError(failure.message);
        setState("error");
      }
    });
    return () => {
      live = false;
    };
  }, [accion, confirmation]);

  async function apply() {
    if (saving || state !== "ready") return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/eventos/comunicaciones/${accion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, aplicar: true }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "No pudimos guardar tu decisión. Inténtalo nuevamente.",
        );
      setState("done");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  const Icon = state === "done" ? CheckCircle2 : confirmation ? Mail : MailX;
  return (
    <main className={styles.page} data-public-scrollbar="true">
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <Link href="/" aria-label="SEDIPRO UNT, inicio">
            <Image
              src="/logos/sedi-logo.svg"
              alt="SEDIPRO UNT"
              width={200}
              height={72}
              priority
            />
          </Link>
          <span>Invitaciones</span>
        </div>
      </header>
      <section
        className={styles.subscriptionShell}
        aria-labelledby="subscription-title"
      >
        <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
        <h1 id="subscription-title">
          {state === "done"
            ? confirmation
              ? "Tu suscripción está activa"
              : "Cancelaste tu suscripción"
            : confirmation
              ? "Confirma tu suscripción"
              : "Cancelar suscripción"}
        </h1>
        {state === "loading" ? (
          <p role="status">
            <LoaderCircle
              size={18}
              className={styles.spin}
              aria-hidden="true"
            />{" "}
            Comprobando tu enlace…
          </p>
        ) : (
          <>
            {state === "ready" && (
              <>
                <p>
                  {confirmation
                    ? COMMUNICATIONS_CONSENT_TEXT
                    : "Dejarás de recibir invitaciones a futuros eventos y otras informaciones relacionadas de SEDIPRO UNT."}
                </p>
                <p className={styles.help}>
                  {confirmation
                    ? "Solo activaremos los envíos cuando confirmes. Podrás darte de baja desde el enlace de cada invitación."
                    : "Tus inscripciones y códigos QR seguirán siendo válidos. Los correos necesarios para gestionar tus inscripciones continuarán llegando."}
                </p>
              </>
            )}
            {state === "done" && (
              <p role="status">
                {confirmation
                  ? "Recibirás las próximas invitaciones de SEDIPRO UNT. Puedes cancelar la suscripción en cualquier momento."
                  : "Tu correo quedó excluido de futuras invitaciones. Esta baja no afecta tus inscripciones ni tus códigos QR."}
              </p>
            )}
            {error && (
              <p className={styles.fieldError} role="alert">
                {error}
              </p>
            )}
            {state === "ready" && (
              <button
                type="button"
                onClick={apply}
                disabled={saving}
                className={styles.primaryButton}
              >
                {saving && (
                  <LoaderCircle
                    size={18}
                    className={styles.spin}
                    aria-hidden="true"
                  />
                )}
                {saving
                  ? "Guardando…"
                  : confirmation
                    ? "Confirmar mi suscripción"
                    : "Cancelar mi suscripción"}
              </button>
            )}
            <Link href="/" className={styles.subscriptionHome}>
              Volver al sitio
            </Link>
          </>
        )}
        <p className={styles.help}>
          ¿Necesitas ayuda?{" "}
          <a href="mailto:ti.sedipro@unitru.edu.pe">ti.sedipro@unitru.edu.pe</a>
        </p>
      </section>
    </main>
  );
}
