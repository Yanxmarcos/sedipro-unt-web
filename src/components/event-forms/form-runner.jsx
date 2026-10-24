"use client";

import { useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import {
  getVisibleSections,
  validateAnswers,
  CONSENT_TEXT,
  normalizeFieldInput,
  UNT_EMAIL_DOMAIN,
} from "@/lib/event-form.mjs";
import { UNT_CAREERS } from "@/lib/unt-careers";
import { COMMUNICATIONS_CONSENT_TEXT } from "@/lib/event-communications.mjs";
import styles from "./public-form.module.css";

const numericLengths = { dni: 8, celular: 9, matricula: 10 };
const empty = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && !value.length);

export function answerLabel(field, value) {
  if (empty(value)) return "Sin respuesta";
  if (field.type === "booleano") return value === "si" ? "Sí" : "No";
  const label = (entry) =>
    field.options?.find((option) => option.id === entry)?.label ||
    String(entry);
  return Array.isArray(value) ? value.map(label).join(", ") : label(value);
}

function Question({ field, value, onChange, onBlur, error, scope, disabled }) {
  const id = `${scope}-${field.id}`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const helpText = [
    field.help,
    field.type === "correo" && field.emailDomain === UNT_EMAIL_DOMAIN
      ? "Usa un correo terminado en @unitru.edu.pe."
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const description =
    [helpText ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") ||
    undefined;
  const digitLength = numericLengths[field.type];
  const choices =
    field.type === "booleano"
      ? [
          { id: "si", label: "Sí" },
          { id: "no", label: "No" },
        ]
      : field.options || [];
  const title = (
    <>
      {field.label}
      {field.required && (
        <span className={styles.required} aria-label="obligatorio">
          {" "}
          *
        </span>
      )}
    </>
  );
  const hint = (
    <>
      {helpText && (
        <p id={helpId} className={styles.help}>
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </>
  );
  const props = {
    id,
    name: field.id,
    disabled,
    "aria-required": Boolean(field.required),
    "aria-invalid": Boolean(error),
    "aria-describedby": description,
    className: styles.input,
    onBlur,
  };

  if (field.type === "contenido")
    return (
      <div className={styles.contentBlock}>
        <h3>{field.label}</h3>
        {field.help && <p>{field.help}</p>}
      </div>
    );

  if (["seleccion", "multiple", "booleano"].includes(field.type)) {
    return (
      <fieldset
        className={styles.question}
        id={id}
        tabIndex={-1}
        aria-describedby={description}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        <legend className={styles.label}>{title}</legend>
        <div className={styles.options}>
          {choices.map((option) => {
            const checked =
              field.type === "multiple"
                ? Array.isArray(value) && value.includes(option.id)
                : value === option.id;
            return (
              <label
                className={`${styles.option} ${checked ? styles.optionSelected : ""}`}
                key={option.id}
              >
                <input
                  type={field.type === "multiple" ? "checkbox" : "radio"}
                  name={field.id}
                  checked={checked}
                  value={option.id}
                  onChange={() =>
                    onChange(
                      field.type === "multiple"
                        ? checked
                          ? value.filter((entry) => entry !== option.id)
                          : [...(Array.isArray(value) ? value : []), option.id]
                        : option.id,
                    )
                  }
                  onBlur={onBlur}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        {hint}
      </fieldset>
    );
  }

  if (field.type === "escala") {
    const min = Number.isFinite(Number(field.min)) ? Number(field.min) : 1;
    const max = Number.isFinite(Number(field.max))
      ? Math.min(Number(field.max), min + 10)
      : 5;
    const levels = Array.from(
      { length: Math.max(1, max - min + 1) },
      (_, index) => min + index,
    );
    return (
      <fieldset
        className={styles.question}
        id={id}
        tabIndex={-1}
        aria-describedby={description}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        <legend className={styles.label}>{title}</legend>
        <div className={styles.scale}>
          {levels.map((level) => (
            <label
              key={level}
              className={`${styles.scaleOption} ${String(value) === String(level) ? styles.scaleSelected : ""}`}
            >
              <input
                type="radio"
                name={field.id}
                value={level}
                checked={String(value) === String(level)}
                onChange={() => onChange(String(level))}
                onBlur={onBlur}
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
        {hint}
      </fieldset>
    );
  }

  return (
    <div className={styles.question}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {title}
        </label>
        {digitLength && (
          <span className={styles.counter} aria-hidden="true">
            {String(value || "").length}/{digitLength}
          </span>
        )}
      </div>
      {field.type === "textarea" ? (
        <textarea
          {...props}
          rows={4}
          maxLength={field.maxLength || 4000}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "desplegable" ? (
        <select
          {...props}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Selecciona una opción</option>
          {choices.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...props}
          type={
            field.type === "correo"
              ? "email"
              : field.type === "fecha"
                ? "date"
                : field.type === "numero"
                  ? "number"
                  : "text"
          }
          list={field.type === "carrera" ? `${id}-careers` : undefined}
          inputMode={
            digitLength
              ? "numeric"
              : field.type === "correo"
                ? "email"
                : field.type === "numero"
                  ? "decimal"
                  : "text"
          }
          autoComplete={
            field.type === "correo"
              ? "email"
              : field.type === "nombres"
                ? "given-name"
                : field.type === "apellidos"
                  ? "family-name"
                  : field.type === "celular"
                    ? "tel-national"
                    : "off"
          }
          autoCapitalize={
            ["nombres", "apellidos"].includes(field.type)
              ? "characters"
              : field.type === "correo"
                ? "none"
                : undefined
          }
          spellCheck={
            field.type === "correo" || Boolean(digitLength) ? false : undefined
          }
          maxLength={digitLength || field.maxLength || 500}
          min={field.type === "numero" ? field.min : undefined}
          max={field.type === "numero" ? field.max : undefined}
          step={field.type === "numero" ? "any" : undefined}
          value={value ?? ""}
          onChange={(event) => {
            const input = event.currentTarget;
            const original = input.value;
            const next = digitLength
              ? original.replace(/\D/g, "").slice(0, digitLength)
              : normalizeFieldInput(field.type, original);
            const start = input.selectionStart,
              end = input.selectionEnd;
            onChange(next);
            if (
              next !== original &&
              ["nombres", "apellidos"].includes(field.type) &&
              start !== null
            ) {
              const from = normalizeFieldInput(
                field.type,
                original.slice(0, start),
              ).length;
              const to = normalizeFieldInput(
                field.type,
                original.slice(0, end),
              ).length;
              requestAnimationFrame(() => {
                if (input.isConnected) input.setSelectionRange(from, to);
              });
            }
          }}
        />
      )}
      {field.type === "carrera" && (
        <datalist id={`${id}-careers`}>
          {UNT_CAREERS.map((career) => (
            <option key={career} value={career} />
          ))}
        </datalist>
      )}
      {hint}
    </div>
  );
}

export function EventFormRunner({
  form,
  onSubmit,
  submitting = false,
  serverErrors = {},
  preview = false,
  qrEnabled = false,
}) {
  const scope = useId();
  const heading = useRef(null);
  const [answers, setAnswers] = useState({});
  const [localErrors, setLocalErrors] = useState({});
  const [sectionId, setSectionId] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [communications, setCommunications] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [previewDone, setPreviewDone] = useState(false);
  const sections = getVisibleSections(form, answers);
  const multiStep = Boolean(form.settings?.multiStep) && sections.length > 1;
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === sectionId),
  );
  const current = sections[activeIndex];
  const shown = multiStep ? (current ? [current] : []) : sections;
  const errors = { ...localErrors, ...serverErrors };
  const questions = sections
    .flatMap((section) => section.fields)
    .filter((field) => field.type !== "contenido");
  const answered = questions.filter(
    (field) => !empty(answers[field.id]),
  ).length;
  const focusHeading = () =>
    requestAnimationFrame(() => heading.current?.focus());
  const focusQuestion = (id) =>
    requestAnimationFrame(() =>
      document.getElementById(`${scope}-${id}`)?.focus(),
    );

  function setAnswer(id, value) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [id]: value }));
    setLocalErrors((currentErrors) => {
      const next = { ...currentErrors };
      delete next[id];
      return next;
    });
  }

  function validateCurrent() {
    const result = validateAnswers(form, answers);
    const ids = new Set(
      shown.flatMap((section) => section.fields.map((field) => field.id)),
    );
    const relevant = Object.fromEntries(
      Object.entries(result.errors || {}).filter(([id]) => ids.has(id)),
    );
    setLocalErrors(relevant);
    if (Object.keys(relevant).length) {
      focusQuestion(Object.keys(relevant)[0]);
      return false;
    }
    return true;
  }

  function editQuestion(id) {
    const section = sections.find((item) =>
      item.fields.some((field) => field.id === id),
    );
    if (section) setSectionId(section.id);
    setReviewing(false);
    focusQuestion(id);
  }

  function advance(event) {
    event.preventDefault();
    if (!validateCurrent()) return;
    if (multiStep && activeIndex < sections.length - 1) {
      setSectionId(sections[activeIndex + 1].id);
      focusHeading();
      return;
    }
    const result = validateAnswers(form, answers);
    if (!result.success) {
      setLocalErrors(result.errors || {});
      const first = Object.keys(result.errors || {})[0];
      if (first) editQuestion(first);
      return;
    }
    setReviewing(true);
    focusHeading();
  }

  function submit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!consent) {
      setConsentError(
        "Necesitamos tu autorización para gestionar esta inscripción.",
      );
      return;
    }
    const result = validateAnswers(form, answers);
    if (!result.success) {
      setLocalErrors(result.errors || {});
      const first = Object.keys(result.errors || {})[0];
      if (first) editQuestion(first);
      return;
    }
    if (preview) {
      setPreviewDone(true);
      focusHeading();
      return;
    }
    onSubmit?.({
      answers: result.answers,
      consentimiento: true,
      comunicaciones: communications,
    });
  }

  if (previewDone)
    return (
      <div className={styles.runner}>
        <div className={styles.previewSuccess}>
          <CheckCircle2 size={36} />
          <h2 ref={heading} tabIndex={-1}>
            Así termina la inscripción
          </h2>
          <p>
            {form.settings?.confirmationMessage ||
              "Tu inscripción se registró correctamente."}
          </p>
          <p className={styles.help}>
            Esta fue una prueba. No se ha guardado ninguna inscripción.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setPreviewDone(false);
              setReviewing(false);
              focusHeading();
            }}
          >
            Volver a la vista previa
          </button>
        </div>
      </div>
    );

  return (
    <div className={styles.runner}>
      {preview && (
        <div className={styles.previewNotice}>
          Vista previa interactiva · las respuestas de prueba no se guardan.
        </div>
      )}
      <div className={styles.runnerHeader}>
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {reviewing
              ? "Revisa tu inscripción"
              : form.title || "Completa tu inscripción"}
          </h2>
          {!reviewing && form.description && <p>{form.description}</p>}
        </div>
        <span className={styles.progressText}>
          {reviewing
            ? "Antes de enviar"
            : multiStep
              ? `Paso ${activeIndex + 1} de ${sections.length}`
              : `${answered} de ${questions.length} respuestas`}
        </span>
      </div>
      {multiStep && (
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Progreso del formulario"
          aria-valuemin={0}
          aria-valuemax={sections.length + 1}
          aria-valuenow={reviewing ? sections.length + 1 : activeIndex + 1}
        >
          <span
            style={{
              width: `${((reviewing ? sections.length + 1 : activeIndex + 1) / (sections.length + 1)) * 100}%`,
            }}
          />
        </div>
      )}
      {Object.values(errors).some(Boolean) && (
        <div className={styles.errorSummary} role="alert">
          <p>Revisa estos datos para continuar:</p>
          <ul>
            {Object.entries(errors)
              .filter(([, message]) => message)
              .map(([id, message]) => {
                const field = questions.find((question) => question.id === id);
                return (
                  <li key={id}>
                    <button type="button" onClick={() => editQuestion(id)}>
                      {field?.label && <strong>{field.label}: </strong>}
                      {message}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      {reviewing ? (
        <form noValidate onSubmit={submit}>
          <p className={styles.reviewIntro}>
            Comprueba tus datos. Puedes corregir cualquier respuesta antes de
            confirmar.
          </p>
          {sections.map((section) => (
            <section key={section.id} className={styles.reviewSection}>
              <h3>{section.title}</h3>
              <dl className={styles.reviewList}>
                {section.fields
                  .filter((field) => field.type !== "contenido")
                  .map((field) => (
                    <div key={field.id}>
                      <dt>{field.label}</dt>
                      <dd>
                        <span>{answerLabel(field, answers[field.id])}</span>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => editQuestion(field.id)}
                          aria-label={`Editar ${field.label}`}
                          disabled={submitting}
                        >
                          <Pencil size={14} />
                          <span>Editar</span>
                        </button>
                      </dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}
          <div className={styles.consent}>
            <label>
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  setConsentError("");
                }}
                aria-invalid={Boolean(consentError)}
                aria-describedby={
                  consentError ? `${scope}-consent-error` : undefined
                }
                disabled={submitting}
              />
              <span>{CONSENT_TEXT}</span>
            </label>
            {consentError && (
              <p
                className={styles.fieldError}
                id={`${scope}-consent-error`}
                role="alert"
              >
                {consentError}
              </p>
            )}
          </div>
          <div className={`${styles.consent} ${styles.communicationsConsent}`}>
            <label>
              <input
                type="checkbox"
                name="comunicaciones"
                checked={communications}
                onChange={(event) => setCommunications(event.target.checked)}
                aria-describedby={`${scope}-communications-help`}
                disabled={submitting}
              />
              <span>
                {COMMUNICATIONS_CONSENT_TEXT}{" "}
                <span className={styles.optionalLabel}>(Opcional)</span>
              </span>
            </label>
            <p id={`${scope}-communications-help`}>
              Si lo eliges, te enviaremos un enlace para confirmar la
              suscripción. Puedes cancelarla desde el correo en cualquier
              momento. Tu decisión no afecta esta inscripción.
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setReviewing(false);
                focusHeading();
              }}
              disabled={submitting}
            >
              <ArrowLeft size={17} />
              Volver
            </button>
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle size={18} className={styles.spin} />
              ) : (
                <Check size={18} />
              )}
              {submitting
                ? "Registrando…"
                : preview
                  ? "Probar confirmación"
                  : "Confirmar inscripción"}
            </button>
          </div>
          <p className={styles.privacyNote}>
            <ShieldCheck size={15} />
            {qrEnabled
              ? "Al confirmar podrás descargar tu QR."
              : "Tus datos se utilizan para gestionar tu participación."}
          </p>
        </form>
      ) : (
        <form noValidate onSubmit={advance}>
          <p className={styles.requiredNote}>
            Los campos con <span aria-hidden="true">*</span> son obligatorios.
          </p>
          {shown.map((section) => (
            <section
              key={section.id}
              className={styles.formSection}
              aria-labelledby={`${scope}-section-${section.id}`}
            >
              <div className={styles.sectionHeading}>
                <h3 id={`${scope}-section-${section.id}`}>{section.title}</h3>
                {section.description && <p>{section.description}</p>}
              </div>
              <div className={styles.questions}>
                {section.fields.map((field) => (
                  <Question
                    key={field.id}
                    field={field}
                    value={answers[field.id]}
                    scope={scope}
                    error={errors[field.id]}
                    disabled={submitting}
                    onChange={(value) => setAnswer(field.id, value)}
                    onBlur={() => {
                      const result = validateAnswers(form, answers);
                      setLocalErrors((currentErrors) => ({
                        ...currentErrors,
                        [field.id]: result.errors?.[field.id],
                      }));
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
          <div className={styles.actions}>
            <div>
              {multiStep && activeIndex > 0 && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setSectionId(sections[activeIndex - 1].id);
                    setLocalErrors({});
                    focusHeading();
                  }}
                >
                  <ArrowLeft size={17} />
                  Anterior
                </button>
              )}
            </div>
            <button type="submit" className={styles.primaryButton}>
              {multiStep && activeIndex < sections.length - 1
                ? "Continuar"
                : "Revisar respuestas"}
              <ArrowRight size={17} />
            </button>
          </div>
          <p className={styles.privacyNote}>
            <ShieldCheck size={15} />
            Tus datos se utilizan para gestionar tu participación.
          </p>
        </form>
      )}
      {!reviewing && multiStep && (
        <ol
          className={styles.sectionTrail}
          aria-label="Secciones del formulario"
        >
          {sections.map((section, index) => (
            <li
              key={section.id}
              aria-current={index === activeIndex ? "step" : undefined}
            >
              {index < activeIndex ? (
                <Check size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <span>{section.title}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default EventFormRunner;
