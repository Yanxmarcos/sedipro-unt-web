"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  GitBranch,
  GripVertical,
  LayoutList,
  LockKeyhole,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AdminConfirm, AdminSelect } from "@/components/admin/form-controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventFormRunner } from "@/components/event-forms/form-runner";
import publicFormStyles from "@/components/event-forms/public-form.module.css";
import {
  CORE_FIELDS,
  FIELD_TYPES,
  createDefaultForm,
  createField,
  validateDefinition,
} from "@/lib/event-form.mjs";
import { cn } from "@/lib/utils";

const uid = (prefix) =>
  `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
const CHOICES = ["seleccion", "multiple", "desplegable"];
const RULE_TYPES = [
  "seleccion",
  "multiple",
  "desplegable",
  "booleano",
  "texto",
  "celular",
  "matricula",
  "institucion",
  "carrera",
  "numero",
  "fecha",
  "escala",
];
const typeLabel = (type) =>
  FIELD_TYPES.find((item) => item.type === type)?.label || type;

function RuleValue({ field, value, onChange, label }) {
  if (CHOICES.includes(field?.type))
    return (
      <AdminSelect
        aria-label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Elige una respuesta</option>
        {field.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </AdminSelect>
    );
  if (field?.type === "booleano")
    return (
      <AdminSelect
        aria-label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Elige una respuesta</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </AdminSelect>
    );
  return (
    <Input
      aria-label={label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Respuesta que activa la regla"
    />
  );
}

export function FormBuilder({
  form,
  onChange,
  dirty,
  saving,
  onSave,
  version,
  qrEnabled,
}) {
  const [sectionId, setSectionId] = useState(form.sections[0]?.id);
  const [fieldId, setFieldId] = useState(null);
  const [library, setLibrary] = useState(false);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [replaceTemplate, setReplaceTemplate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [validation, setValidation] = useState({});
  const selectedIndex = Math.max(
    0,
    form.sections.findIndex((section) => section.id === sectionId),
  );
  const section = form.sections[selectedIndex];
  const field = section.fields.find((item) => item.id === fieldId);
  const locked = field && CORE_FIELDS.includes(field.id);
  const previousFields = useMemo(() => {
    const all = form.sections
      .slice(0, selectedIndex)
      .flatMap((item) => item.fields);
    all.push(
      ...section.fields.slice(
        0,
        Math.max(
          0,
          section.fields.findIndex((item) => item.id === fieldId),
        ),
      ),
    );
    return all.filter((item) => RULE_TYPES.includes(item.type));
  }, [form, selectedIndex, section, fieldId]);
  const count = form.sections.reduce(
    (sum, item) => sum + item.fields.length,
    0,
  );
  const change = (update) => {
    const next = structuredClone(form);
    update(next);
    onChange(next);
    setValidation({});
  };
  const patchForm = (key, value) =>
    change((next) => {
      next[key] = value;
    });
  const patchSection = (key, value) =>
    change((next) => {
      next.sections[selectedIndex][key] = value;
    });
  const patchField = (key, value) =>
    change((next) => {
      next.sections[selectedIndex].fields.find((item) => item.id === fieldId)[
        key
      ] = value;
    });
  const save = () => {
    const result = validateDefinition(form);
    setValidation(result.errors || {});
    if (result.success) onSave(result.form);
  };

  function addField(type) {
    const nextField = createField(type);
    change((next) => {
      next.sections[selectedIndex].fields.push(nextField);
    });
    setFieldId(nextField.id);
    setLibrary(false);
  }
  function removeDependencies(next, ids) {
    for (const item of next.sections) {
      item.fields.forEach((question) => {
        if (ids.includes(question.condition?.fieldId))
          question.condition = null;
      });
      if (ids.includes(item.jump?.fieldId)) item.jump = null;
    }
  }
  function deleteSelected() {
    if (deleteTarget.kind === "section") {
      const target = form.sections.find((item) => item.id === deleteTarget.id);
      change((next) => {
        next.sections = next.sections.filter((item) => item.id !== target.id);
        removeDependencies(
          next,
          target.fields.map((item) => item.id),
        );
        for (const item of next.sections)
          if (item.jump?.toSectionId === target.id) item.jump = null;
      });
      setSectionId(form.sections[0].id);
      setFieldId(null);
    } else {
      change((next) => {
        next.sections[selectedIndex].fields = next.sections[
          selectedIndex
        ].fields.filter((item) => item.id !== deleteTarget.id);
        removeDependencies(next, [deleteTarget.id]);
      });
      setFieldId(null);
    }
    setDeleteTarget(null);
  }
  function moveField(index, direction) {
    const to = index + direction;
    if (
      to < 0 ||
      to >= section.fields.length ||
      CORE_FIELDS.includes(section.fields[to].id)
    )
      return;
    change((next) => {
      const fields = next.sections[selectedIndex].fields;
      [fields[index], fields[to]] = [fields[to], fields[index]];
    });
  }
  function moveSection(direction) {
    const target = selectedIndex + direction;
    if (target < 1 || target >= form.sections.length) return;
    const next = structuredClone(form);
    [next.sections[selectedIndex], next.sections[target]] = [
      next.sections[target],
      next.sections[selectedIndex],
    ];
    const result = validateDefinition(next);
    if (!result.success) {
      setValidation({
        order:
          "No se puede cambiar este orden porque hay reglas que dependen de preguntas o secciones anteriores. Ajusta esas reglas primero.",
      });
      return;
    }
    onChange(next);
    setValidation({});
  }
  function duplicateField(question) {
    const copy = structuredClone(question);
    copy.id = uid("p");
    copy.label = `${copy.label} (copia)`;
    copy.options = copy.options.map((option) => ({ ...option, id: uid("o") }));
    change((next) => {
      const fields = next.sections[selectedIndex].fields;
      fields.splice(
        fields.findIndex((item) => item.id === question.id) + 1,
        0,
        copy,
      );
    });
    setFieldId(copy.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {count} preguntas · {form.sections.length}{" "}
            {form.sections.length === 1 ? "sección" : "secciones"}
          </span>
          <Badge variant="outline">
            {version ? `Versión pública ${version}` : "Sin publicar"}
          </Badge>
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            role="status"
          >
            {dirty ? (
              "Cambios sin guardar"
            ) : (
              <>
                <Check className="size-3.5" />
                Borrador guardado
              </>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye />
            Vista previa
          </Button>
          <Button disabled={!dirty || saving} onClick={save}>
            <Save />
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
        </div>
      </div>
      {Object.keys(validation).length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          <p className="font-medium">
            Revisa el formulario antes de guardarlo.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {[...new Set(Object.values(validation))].map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[230px_minmax(0,1fr)_310px]">
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-5">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <LayoutList className="size-4" />
                Estructura
              </h3>
            </div>
            <nav
              aria-label="Secciones del formulario"
              className="flex gap-1 overflow-x-auto p-2 xl:block xl:space-y-1"
            >
              {form.sections.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSectionId(item.id);
                    setFieldId(null);
                  }}
                  aria-current={item.id === section.id ? "step" : undefined}
                  className={cn(
                    "flex w-48 shrink-0 items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:w-full",
                    item.id === section.id
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span className="pt-0.5 text-xs tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 break-words">
                    {item.title || "Sección sin título"}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {item.fields.length}{" "}
                      {item.fields.length === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                disabled={form.sections.length >= 12}
                onClick={() => {
                  const id = uid("s");
                  change((next) => {
                    next.sections.push({
                      id,
                      title: "Nueva sección",
                      description: "",
                      fields: [],
                      jump: null,
                    });
                    next.settings.multiStep = true;
                  });
                  setSectionId(id);
                  setFieldId(null);
                }}
              >
                <Plus />
                Agregar sección
              </Button>
            </div>
          </div>
          <div className="space-y-3 px-1">
            <h3 className="text-xs font-medium text-muted-foreground">
              Empezar con una plantilla
            </h3>
            <div className="flex flex-wrap gap-2 xl:flex-col">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setReplaceTemplate("general")}
              >
                Inscripción general
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setReplaceTemplate("unt")}
              >
                Estudiantes UNT
              </Button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Reemplaza solo el borrador. Las respuestas publicadas conservan su
              versión.
            </p>
          </div>
        </aside>
        <div className="min-w-0 space-y-5">
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="form-title">Título del formulario</Label>
              <Input
                id="form-title"
                value={form.title}
                maxLength={160}
                onChange={(e) => patchForm("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">Presentación</Label>
              <Textarea
                id="form-description"
                rows={2}
                maxLength={3000}
                value={form.description}
                onChange={(e) => patchForm("description", e.target.value)}
                placeholder="Una bienvenida breve para tus participantes."
              />
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    aria-label="Título de la sección"
                    value={section.title}
                    maxLength={160}
                    onChange={(e) => patchSection("title", e.target.value)}
                    className="h-auto rounded-none border-0 bg-transparent p-0 text-base font-semibold shadow-none"
                  />
                  <Textarea
                    aria-label="Descripción de la sección"
                    rows={2}
                    value={section.description}
                    maxLength={2000}
                    onChange={(e) =>
                      patchSection("description", e.target.value)
                    }
                    placeholder="Descripción de esta sección (opcional)"
                    className="min-h-0 resize-none border-0 p-0 text-sm shadow-none"
                  />
                </div>
                {selectedIndex > 0 && (
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Subir sección"
                      disabled={selectedIndex <= 1}
                      onClick={() => moveSection(-1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Bajar sección"
                      disabled={selectedIndex === form.sections.length - 1}
                      onClick={() => moveSection(1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Eliminar sección"
                      onClick={() =>
                        setDeleteTarget({ kind: "section", id: section.id })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="divide-y">
              {section.fields.map((question, index) => (
                <article
                  key={question.id}
                  className={cn(
                    "relative p-4 transition-colors sm:p-5",
                    fieldId === question.id
                      ? "bg-muted/70"
                      : "hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex w-4 shrink-0 justify-center text-muted-foreground">
                      {CORE_FIELDS.includes(question.id) ? (
                        <LockKeyhole className="size-3.5" />
                      ) : (
                        <GripVertical className="size-4" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFieldId(question.id);
                        setLibrary(false);
                      }}
                      className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block break-words text-sm font-medium">
                        {question.label || "Pregunta sin título"}
                        {question.required && (
                          <span className="ml-1 text-muted-foreground">*</span>
                        )}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {question.type === "correo" &&
                        question.emailDomain === "unitru.edu.pe"
                          ? "Correo institucional UNT"
                          : typeLabel(question.type)}
                        {question.condition && (
                          <span className="inline-flex items-center gap-1">
                            <GitBranch className="size-3" />
                            Condicional
                          </span>
                        )}
                      </span>
                      {CHOICES.includes(question.type) && (
                        <span className="mt-3 block truncate text-xs text-muted-foreground">
                          {question.options
                            .map((option) => option.label)
                            .join(" · ")}
                        </span>
                      )}
                    </button>
                    {!CORE_FIELDS.includes(question.id) && (
                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={
                            index === 0 ||
                            CORE_FIELDS.includes(section.fields[index - 1]?.id)
                          }
                          aria-label={`Subir ${question.label}`}
                          title="Subir pregunta"
                          onClick={() => moveField(index, -1)}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={index === section.fields.length - 1}
                          aria-label={`Bajar ${question.label}`}
                          title="Bajar pregunta"
                          onClick={() => moveField(index, 1)}
                        >
                          <ArrowDown />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={count >= 60}
                          aria-label={`Duplicar ${question.label}`}
                          title="Duplicar pregunta"
                          onClick={() => duplicateField(question)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Eliminar ${question.label}`}
                          title="Eliminar pregunta"
                          onClick={() =>
                            setDeleteTarget({ kind: "field", id: question.id })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                  {fieldId === question.id && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() =>
                        document.getElementById("question-label")?.focus()
                      }
                      className="mt-2 ml-6 px-0 xl:hidden"
                    >
                      Editar pregunta
                    </Button>
                  )}
                </article>
              ))}
            </div>
            {!section.fields.length && (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Esta sección está lista para su primera pregunta.
              </div>
            )}
            <div className="border-t p-3">
              <Button
                variant="ghost"
                className="w-full"
                disabled={count >= 60}
                onClick={() => {
                  setFieldId(null);
                  setLibrary(true);
                }}
              >
                <Plus />
                Agregar pregunta
              </Button>
            </div>
          </section>
          {selectedIndex < form.sections.length - 1 && (
            <section className="space-y-3 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <GitBranch className="size-4" />
                    Recorrido de la sección
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Continúa a la siguiente sección o salta según una respuesta.
                  </p>
                </div>
                <Switch
                  aria-label="Configurar salto de sección"
                  checked={Boolean(section.jump)}
                  onCheckedChange={(checked) =>
                    patchSection(
                      "jump",
                      checked
                        ? {
                            fieldId: "",
                            value: "",
                            toSectionId: form.sections[selectedIndex + 1].id,
                          }
                        : null,
                    )
                  }
                />
              </div>
              {section.jump && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="section-jump-question">
                      Si la pregunta
                    </Label>
                    <AdminSelect
                      id="section-jump-question"
                      value={section.jump.fieldId}
                      onChange={(e) =>
                        patchSection("jump", {
                          ...section.jump,
                          fieldId: e.target.value,
                          value: "",
                        })
                      }
                    >
                      <option value="">Selecciona una pregunta</option>
                      {section.fields
                        .filter((item) => RULE_TYPES.includes(item.type))
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                    </AdminSelect>
                  </div>
                  <div className="space-y-2">
                    <Label>Recibe esta respuesta</Label>
                    <RuleValue
                      label="Respuesta para saltar sección"
                      field={section.fields.find(
                        (item) => item.id === section.jump.fieldId,
                      )}
                      value={section.jump.value}
                      onChange={(value) =>
                        patchSection("jump", { ...section.jump, value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="section-jump-destination">
                      Continuar en
                    </Label>
                    <AdminSelect
                      id="section-jump-destination"
                      value={section.jump.toSectionId}
                      onChange={(e) =>
                        patchSection("jump", {
                          ...section.jump,
                          toSectionId: e.target.value,
                        })
                      }
                    >
                      {form.sections.slice(selectedIndex + 1).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </AdminSelect>
                  </div>
                </div>
              )}
            </section>
          )}
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="form-steps">Mostrar una sección por paso</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Incluye progreso y navegación para volver atrás.
                </p>
              </div>
              <Switch
                id="form-steps"
                checked={form.settings.multiStep}
                onCheckedChange={(checked) =>
                  patchForm("settings", {
                    ...form.settings,
                    multiStep: checked,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-confirmation">Mensaje de confirmación</Label>
              <Textarea
                id="form-confirmation"
                rows={2}
                maxLength={2000}
                value={form.settings.confirmationMessage}
                onChange={(e) =>
                  patchForm("settings", {
                    ...form.settings,
                    confirmationMessage: e.target.value,
                  })
                }
              />
            </div>
          </section>
        </div>
        <aside className="rounded-xl border bg-card xl:sticky xl:top-5">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-sm font-semibold">
              {field ? "Editar pregunta" : "Biblioteca de preguntas"}
            </h3>
            {field && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Cerrar edición de pregunta"
                onClick={() => {
                  setFieldId(null);
                  setLibrary(true);
                }}
              >
                <X />
              </Button>
            )}
          </div>
          {!field ? (
            <div className="space-y-4 p-4">
              <p className="text-xs leading-5 text-muted-foreground">
                {library
                  ? "Elige qué necesitas preguntar en esta sección."
                  : "Selecciona una pregunta para editarla o añade un nuevo campo."}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {FIELD_TYPES.filter(
                  (item) => !CORE_FIELDS.includes(item.type),
                ).map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    disabled={count >= 60}
                    onClick={() => addField(item.type)}
                    className="h-auto min-h-9 justify-start whitespace-normal py-2 text-left"
                  >
                    <Plus className="size-3.5 shrink-0" />
                    {item.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Los datos de identificación ya están incluidos. No necesitas
                pedirlos dos veces.
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-4">
              {locked && (
                <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                  <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                  Este dato identifica al participante. Siempre será
                  obligatorio.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="question-label">
                  {field.type === "contenido"
                    ? "Título del bloque"
                    : "Pregunta"}
                </Label>
                <Textarea
                  id="question-label"
                  rows={2}
                  maxLength={250}
                  value={field.label}
                  onChange={(e) => patchField("label", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-help">
                  {field.type === "contenido"
                    ? "Descripción"
                    : "Ayuda o indicación"}
                </Label>
                <Textarea
                  id="question-help"
                  rows={2}
                  maxLength={2000}
                  value={field.help}
                  onChange={(e) => patchField("help", e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              {!locked && field.type !== "contenido" && (
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="question-required">
                    Respuesta obligatoria
                  </Label>
                  <Switch
                    id="question-required"
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      patchField("required", checked)
                    }
                  />
                </div>
              )}
              {CHOICES.includes(field.type) && (
                <div className="space-y-3">
                  <Label>Opciones de respuesta</Label>
                  {field.options.map((option, index) => (
                    <div key={option.id} className="flex gap-1">
                      <Input
                        aria-label={`Opción ${index + 1}`}
                        maxLength={200}
                        value={option.label}
                        onChange={(e) =>
                          patchField(
                            "options",
                            field.options.map((item) =>
                              item.id === option.id
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Eliminar opción ${index + 1}`}
                        disabled={field.options.length <= 1}
                        onClick={() =>
                          patchField(
                            "options",
                            field.options.filter(
                              (item) => item.id !== option.id,
                            ),
                          )
                        }
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={field.options.length >= 100}
                    onClick={() =>
                      patchField("options", [
                        ...field.options,
                        {
                          id: uid("o"),
                          label: `Opción ${field.options.length + 1}`,
                        },
                      ])
                    }
                  >
                    <Plus />
                    Agregar opción
                  </Button>
                </div>
              )}
              {["numero", "escala"].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="question-min">Mínimo</Label>
                    <Input
                      id="question-min"
                      type="number"
                      value={field.min ?? ""}
                      onChange={(e) =>
                        patchField(
                          "min",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-max">Máximo</Label>
                    <Input
                      id="question-max"
                      type="number"
                      value={field.max ?? ""}
                      onChange={(e) =>
                        patchField(
                          "max",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              )}
              {["texto", "textarea", "institucion", "carrera"].includes(
                field.type,
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="question-length">Máximo de caracteres</Label>
                  <Input
                    id="question-length"
                    type="number"
                    min={1}
                    max={5000}
                    value={field.maxLength ?? 250}
                    onChange={(e) =>
                      patchField("maxLength", Number(e.target.value))
                    }
                  />
                </div>
              )}
              {field.type === "correo" && (
                <div className="space-y-2">
                  <Label htmlFor="question-email-domain">Tipo de correo</Label>
                  <AdminSelect
                    id="question-email-domain"
                    value={field.emailDomain || ""}
                    onChange={(e) => patchField("emailDomain", e.target.value)}
                  >
                    <option value="">Cualquier correo electrónico</option>
                    <option value="unitru.edu.pe">
                      Correo institucional UNT
                    </option>
                  </AdminSelect>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {field.emailDomain === "unitru.edu.pe"
                      ? "Solo se aceptarán correos terminados en @unitru.edu.pe. No se exige un código de matrícula antes de la arroba."
                      : "Se aceptan correos personales e institucionales con formato válido."}
                  </p>
                </div>
              )}
              {["dni", "celular", "matricula"].includes(field.type) && (
                <p className="rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                  {
                    {
                      dni: "DNI peruano: exactamente 8 dígitos.",
                      celular: "Celular peruano: exactamente 9 dígitos.",
                      matricula:
                        "Código de matrícula UNT: exactamente 10 dígitos.",
                      correo:
                        "Se comprobará el formato del correo electrónico.",
                    }[field.type]
                  }
                </p>
              )}
              {!locked && previousFields.length > 0 && (
                <div className="space-y-3 border-t pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="question-condition">
                      Mostrar según una respuesta
                    </Label>
                    <Switch
                      id="question-condition"
                      checked={Boolean(field.condition)}
                      onCheckedChange={(checked) =>
                        patchField(
                          "condition",
                          checked
                            ? { fieldId: "", operator: "equals", value: "" }
                            : null,
                        )
                      }
                    />
                  </div>
                  {field.condition && (
                    <>
                      <AdminSelect
                        aria-label="Pregunta que activa la condición"
                        value={field.condition.fieldId}
                        onChange={(e) =>
                          patchField("condition", {
                            fieldId: e.target.value,
                            operator: "equals",
                            value: "",
                          })
                        }
                      >
                        <option value="">Elige una pregunta anterior</option>
                        {previousFields.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </AdminSelect>
                      <AdminSelect
                        aria-label="Operador de condición"
                        value={field.condition.operator}
                        onChange={(e) =>
                          patchField("condition", {
                            ...field.condition,
                            operator: e.target.value,
                          })
                        }
                      >
                        <option value="equals">Es igual a</option>
                        <option value="not_equals">Es diferente de</option>
                        {previousFields.find(
                          (item) => item.id === field.condition.fieldId,
                        )?.type === "multiple" && (
                          <option value="contains">Incluye</option>
                        )}
                      </AdminSelect>
                      <RuleValue
                        label="Respuesta que muestra la pregunta"
                        field={previousFields.find(
                          (item) => item.id === field.condition.fieldId,
                        )}
                        value={field.condition.value}
                        onChange={(value) =>
                          patchField("condition", { ...field.condition, value })
                        }
                      />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Solo se solicitará esta respuesta cuando se cumpla la
                        condición.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
              <DialogTitle>Prueba tu formulario</DialogTitle>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <Button
                  variant={device === "desktop" ? "outline" : "ghost"}
                  size="icon-sm"
                  aria-label="Vista de escritorio"
                  aria-pressed={device === "desktop"}
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor />
                </Button>
                <Button
                  variant={device === "mobile" ? "outline" : "ghost"}
                  size="icon-sm"
                  aria-label="Vista de móvil"
                  aria-pressed={device === "mobile"}
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone />
                </Button>
              </div>
            </div>
            <DialogDescription>
              Explora las preguntas y sus condiciones. Esta vista previa no
              guarda inscripciones.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "mx-auto w-full rounded-xl bg-muted p-3 sm:p-6",
              publicFormStyles.previewFrame,
              device === "mobile" ? "max-w-[390px]" : "max-w-full",
            )}
          >
            <EventFormRunner
              key={`${device}-${preview}`}
              form={form}
              preview
              qrEnabled={qrEnabled}
              onSubmit={async () => {}}
            />
          </div>
        </DialogContent>
      </Dialog>
      <AdminConfirm
        show={Boolean(replaceTemplate)}
        title="Reemplazar el borrador"
        message="Se reemplazarán las preguntas y reglas del borrador por la plantilla elegida. Las versiones publicadas y sus respuestas se conservarán."
        confirmText="Usar plantilla"
        onCancel={() => setReplaceTemplate(null)}
        onConfirm={() => {
          onChange(createDefaultForm(replaceTemplate));
          setSectionId("identidad");
          setFieldId(null);
          setValidation({});
          setReplaceTemplate(null);
        }}
      />
      <AdminConfirm
        show={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === "section"
            ? "Eliminar sección"
            : "Eliminar pregunta"
        }
        message="Se eliminará del borrador y se quitarán las reglas que dependan de ella. Las respuestas de versiones anteriores se conservan."
        confirmText="Eliminar del borrador"
        type="error"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteSelected}
      />
    </div>
  );
}
