"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Eye,
  FileImage,
  FolderArchive,
  ImagePlus,
  LoaderCircle,
  MousePointer2,
  RotateCcw,
  UsersRound,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminCheckbox,
  AdminConfirm,
  AdminSelect,
} from "@/components/admin/form-controls";
import { panelApi } from "@/lib/panel-api";
import { todayInTrujillo, safeFilename } from "@/lib/certificates.mjs";
import {
  BASE_TEMPLATE_URL,
  CERTIFICATE_DIRECTORY_URL,
  EXTERNAL_BODY,
  bodyTemplateErrors,
  buildBodySegments,
  exportNames,
  institutionCandidates,
  officialSigner,
  roleLabel,
  signersForParticipant,
  titleCase,
  validateParticipants,
} from "@/lib/certificate-data.mjs";
import {
  DEFAULT_LAYOUT,
  FONT_OPTIONS,
  canvasToPng,
  createCertificatePdf,
  downloadBlob,
  drawCertificate,
  loadImageFile,
} from "@/lib/certificate-renderer.mjs";
import CertificateSetup from "./certificate-setup";
import CertificateSignatures from "./certificate-signatures";
import styles from "./certificate-generator.module.css";

const STEPS = ["Participantes", "Plantilla y firmas", "Editor y descarga"];
const BLOCKS = [
  { value: "name", label: "Nombre" },
  { value: "body", label: "Texto" },
  { value: "date", label: "Fecha" },
  { value: "signatures", label: "Firmas" },
];
const freshLayout = () =>
  Object.fromEntries(
    Object.entries(DEFAULT_LAYOUT).map(([key, value]) => [key, { ...value }]),
  );
const currentYear = () =>
  Number(
    new Intl.DateTimeFormat("es-PE", {
      timeZone: "America/Lima",
      year: "numeric",
    }).format(new Date()),
  );
const initialSession = () => ({
  project: "",
  year: currentYear(),
  source: "directory",
  participants: [],
  eventId: "",
});
const initialSignatures = () => ({
  presidentId: "",
  pmoId: "",
  sexOverrides: {},
  external: [],
});

function LayoutControl({
  layout,
  onChange,
  block,
  onBlockChange,
  disabled,
  positioning,
  onPositioningChange,
}) {
  const config = layout[block];
  const update = (key, value) =>
    onChange({ ...layout, [block]: { ...config, [key]: value } });
  const fields = [
    { key: "size", label: "Tamaño de letra", min: 8, max: 100 },
    { key: "width", label: "Ancho (%)", min: 10, max: 94 },
    { key: "x", label: "Posición X (%)", min: 5, max: 95 },
    { key: "y", label: "Posición Y (%)", min: 5, max: 95 },
  ];
  if (block === "body")
    fields.push(
      { key: "height", label: "Alto del texto (%)", min: 5, max: 40 },
      { key: "lineHeight", label: "Interlineado", min: 1, max: 2, step: 0.05 },
    );
  if (block === "signatures")
    fields.push({
      key: "imageHeight",
      label: "Alto de firma (%)",
      min: 2,
      max: 18,
    });
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="layout-block">Elemento del certificado</Label>
        <AdminSelect
          id="layout-block"
          value={block}
          disabled={disabled}
          onChange={(event) => onBlockChange(event.target.value)}
        >
          {BLOCKS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AdminSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="layout-font">Tipo de letra</Label>
        <AdminSelect
          id="layout-font"
          value={config.fontFamily}
          disabled={disabled}
          onChange={(event) => update("fontFamily", event.target.value)}
        >
          {FONT_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AdminSelect>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`layout-${field.key}`}>{field.label}</Label>
            <Input
              id={`layout-${field.key}`}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={config[field.key]}
              disabled={disabled}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value))
                  update(
                    field.key,
                    Math.min(field.max, Math.max(field.min, value)),
                  );
              }}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant={positioning ? "secondary" : "outline"}
        className="w-full"
        disabled={disabled}
        aria-pressed={positioning}
        onClick={() => onPositioningChange(!positioning)}
      >
        <MousePointer2 />
        {positioning ? "Cancelar posicionamiento" : "Posicionar con un clic"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Selecciona un elemento y haz clic en la vista previa. También puedes
        ajustar sus coordenadas. Los nombres siempre se mantienen en una línea.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() =>
          onChange({ ...layout, [block]: { ...DEFAULT_LAYOUT[block] } })
        }
      >
        <RotateCcw />
        Restablecer este elemento
      </Button>
    </div>
  );
}

export default function CertificateWorkspace() {
  const [kind, setKind] = useState(null);
  const [step, setStep] = useState(0);
  const [session, setSession] = useState(initialSession);
  const [template, setTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [exampleOpen, setExampleOpen] = useState(false);
  const [signatureConfig, setSignatureConfig] = useState(initialSignatures);
  const [assets, setAssets] = useState({});
  const [pendingUploads, setPendingUploads] = useState({});
  const [directory, setDirectory] = useState({
    rows: [],
    loaded: false,
    loading: false,
    error: "",
  });
  const [layout, setLayout] = useState(freshLayout);
  const [date, setDate] = useState(todayInTrujillo);
  const [externalText, setExternalText] = useState(EXTERNAL_BODY);
  const [selected, setSelected] = useState(0);
  const [controlTab, setControlTab] = useState("texto");
  const [layoutBlock, setLayoutBlock] = useState("name");
  const [positioning, setPositioning] = useState(false);
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState("");
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [selection, setSelection] = useState({});
  const [range, setRange] = useState({ from: 1, to: 50 });
  const [search, setSearch] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);
  const cancelRef = useRef(false);
  const workingRef = useRef(false);
  const mounted = useRef(true);
  const directoryRequest = useRef(0);
  const participants = session.participants;
  const currentIndex = Math.min(selected, Math.max(0, participants.length - 1));
  const current = participants[currentIndex];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelRef.current = true;
    };
  }, []);
  useEffect(() => {
    if (!participants.length && !template) return;
    const guard = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [participants.length, template]);
  const receiveDirectory = useCallback(
    (rows) => setDirectory({ rows, loaded: true, loading: false, error: "" }),
    [],
  );
  const refreshDirectory = useCallback(async () => {
    const request = ++directoryRequest.current;
    setDirectory((value) => ({ ...value, loading: true, error: "" }));
    try {
      const response = await panelApi(CERTIFICATE_DIRECTORY_URL);
      if (mounted.current && request === directoryRequest.current)
        receiveDirectory(response.data || []);
    } catch (failure) {
      if (mounted.current && request === directoryRequest.current)
        setDirectory((value) => ({
          ...value,
          loaded: true,
          loading: false,
          error: failure.message,
        }));
    }
  }, [receiveDirectory]);
  useEffect(() => {
    if (
      kind === "sedipranos" &&
      step > 0 &&
      !directory.loaded &&
      !directory.loading
    )
      void refreshDirectory();
  }, [kind, step, directory.loaded, directory.loading, refreshDirectory]);
  useEffect(() => {
    if (!directory.rows.length || kind !== "sedipranos") return;
    const president = institutionCandidates(
      directory.rows,
      "PRESIDENCIA",
      session.year,
    );
    const pmo = institutionCandidates(
      directory.rows,
      "DIRECCION_AREA",
      session.year,
      "PMO",
    );
    setSignatureConfig((value) => ({
      ...value,
      presidentId:
        value.presidentId ||
        (president.length === 1 ? String(president[0]._id) : ""),
      pmoId: value.pmoId || (pmo.length === 1 ? String(pmo[0]._id) : ""),
    }));
  }, [directory.rows, session.year, kind]);

  const officials = useMemo(() => {
    const member = (id, cargo, area = "") => {
      const found = institutionCandidates(directory.rows, cargo, session.year, area).find(
        (person) => String(person._id) === String(id),
      );
      return found
        ? {
            ...found,
            sexo: signatureConfig.sexOverrides[found._id] || found.sexo,
          }
        : null;
    };
    return {
      president: officialSigner(
        member(signatureConfig.presidentId, "PRESIDENCIA"),
        "president",
      ),
      pmo: officialSigner(member(signatureConfig.pmoId, "DIRECCION_AREA", "PMO"), "pmo"),
    };
  }, [directory.rows, signatureConfig, session.year]);
  const getSigners = useCallback(
    (person) =>
      signersForParticipant(
        person,
        kind,
        officials,
        participants,
        signatureConfig.external,
      ).map((signer) => ({
        ...signer,
        name: titleCase(signer.name),
        image: assets[signer.id]?.image || null,
      })),
    [kind, officials, participants, signatureConfig.external, assets],
  );
  const renderTo = useCallback(
    (canvas, person) =>
      drawCertificate(
        canvas,
        template,
        {
          name: titleCase(person.name),
          bodySegments: buildBodySegments(
            person,
            session.project,
            kind,
            externalText,
          ),
          date,
          signers: getSigners(person),
        },
        layout,
      ),
    [template, session.project, kind, externalText, date, getSigners, layout],
  );
  useEffect(() => {
    if (step < 1 || !template || !current || !canvasRef.current) return;
    try {
      setReport(renderTo(canvasRef.current, current));
    } catch (failure) {
      setReport({ nameSize: 0, bodySize: 0, warnings: [failure.message] });
    }
  }, [step, template, current, renderTo]);

  function updateSession(patch) {
    setSession((value) => ({ ...value, ...patch }));
    setNotice(null);
    if (patch.year !== undefined && Number(patch.year) !== Number(session.year))
      setSignatureConfig((value) => ({ ...value, presidentId: "", pmoId: "" }));
  }
  function updatePerson(patch) {
    updateSession({
      participants: participants.map((person) =>
        person.id === current.id ? { ...person, ...patch } : person,
      ),
    });
  }
  function changeAsset(id, asset) {
    setAssets((value) => {
      const next = { ...value };
      if (asset) next[id] = asset;
      else delete next[id];
      return next;
    });
  }
  const onUploadStateChange = useCallback((id, loading) => {
    setPendingUploads((value) => ({ ...value, [id]: loading }));
  }, []);
  const uploadingSignatures = Object.values(pendingUploads).some(Boolean);
  const changeSignatures = (patch) => {
    setSignatureConfig((value) => ({ ...value, ...patch }));
    setNotice(null);
  };
  const signatureProps = {
    kind,
    year: session.year,
    participants,
    members: directory.rows,
    directoryLoading: directory.loading,
    directoryError: directory.error,
    onRefresh: refreshDirectory,
    value: signatureConfig,
    onChange: changeSignatures,
    assets,
    onAssetChange: changeAsset,
    onUploadStateChange,
    busy: Boolean(busy),
  };

  function readinessErrors(records = participants, requireDirector = true) {
    const errors = validateParticipants(records, kind, { requireDirector });
    if (!session.project.trim() || session.project.trim().length > 160)
      errors.push("Ingresa un nombre de proyecto de hasta 160 caracteres.");
    if (!template)
      errors.push("Carga la imagen de tu plantilla para continuar.");
    if (uploadingSignatures)
      errors.push("Espera a que terminen de cargar las firmas.");
    if (!date.trim())
      errors.push("Completa el lugar y la fecha del certificado.");
    if (kind === "externos") errors.push(...bodyTemplateErrors(externalText));
    if (kind === "sedipranos") {
      const president = institutionCandidates(
        directory.rows,
        "PRESIDENCIA",
        session.year,
      ).find(
        (member) => String(member._id) === String(signatureConfig.presidentId),
      );
      const pmo = institutionCandidates(
        directory.rows,
        "DIRECCION_AREA",
        session.year,
        "PMO",
      ).find((member) => String(member._id) === String(signatureConfig.pmoId));
      if (!president || !pmo)
        errors.push(
          "Configura en el padrón los titulares de Presidencia y Dirección de PMO para este período.",
        );
      if (!officials.president || !officials.pmo)
        errors.push(
          "Selecciona los titulares de Presidencia y Dirección de PMO.",
        );
      for (const official of Object.values(officials))
        if (official && !["MASCULINO", "FEMENINO"].includes(official.sexo))
          errors.push(`Confirma el tratamiento del cargo de ${official.name}.`);
      if (
        officials.president &&
        officials.pmo &&
        officials.president.id === officials.pmo.id
      )
        errors.push(
          "Presidencia y Dirección de PMO deben corresponder a personas distintas.",
        );
    }
    const signers = records
      .flatMap(getSigners)
      .filter(
        (signer, index, all) =>
          all.findIndex((other) => other.id === signer.id) === index,
      );
    for (const signer of signers) {
      if (!signer.name.trim() || !signer.title.trim())
        errors.push("Completa el nombre y el cargo de todos los firmantes.");
      if (!signer.image)
        errors.push(`Carga la firma de ${signer.name || "cada firmante"}.`);
    }
    return [...new Set(errors)];
  }
  async function uploadTemplate(file) {
    if (!file || workingRef.current) return;
    setBusy("template");
    setNotice(null);
    try {
      const image = await loadImageFile(file);
      if (mounted.current) {
        setTemplate(image);
        setTemplateName(file.name);
      }
    } catch (failure) {
      if (mounted.current) setNotice({ type: "error", text: failure.message });
    } finally {
      if (mounted.current) setBusy("");
    }
  }
  function openEditor() {
    const errors = readinessErrors();
    if (errors.length) {
      setNotice({ type: "error", text: errors.slice(0, 6).join(" ") });
      return;
    }
    setNotice(null);
    setStep(2);
    setSelected(0);
  }
  async function exportCurrent(extension) {
    if (workingRef.current || !current) return;
    const errors = readinessErrors([current], false);
    if (errors.length) {
      setNotice({ type: "error", text: errors.slice(0, 5).join(" ") });
      return;
    }
    workingRef.current = true;
    setBusy(extension);
    setNotice(null);
    try {
      const canvas = document.createElement("canvas");
      renderTo(canvas, current);
      const blob =
        extension === "pdf"
          ? await createCertificatePdf(canvas, {
              project: session.project,
              name: current.name,
            })
          : await canvasToPng(canvas);
      if (mounted.current) {
        downloadBlob(blob, exportNames([current], extension)[0]);
        setNotice({
          type: "success",
          text: `Se inició la descarga de ${current.name}.`,
        });
      }
    } catch (failure) {
      if (mounted.current)
        setNotice({
          type: "error",
          text: failure.message || "No se pudo generar el certificado.",
        });
    } finally {
      workingRef.current = false;
      if (mounted.current) setBusy("");
    }
  }

  const exportRecords =
    scope === "selected"
      ? participants.filter((person) => selection[person.id] !== false)
      : scope === "range"
        ? participants.slice(
            Math.max(0, range.from - 1),
            Math.min(participants.length, range.to),
          )
        : participants;
  async function exportBatch() {
    if (workingRef.current) return;
    const errors = readinessErrors(exportRecords, false);
    if (!exportRecords.length)
      errors.push("Selecciona al menos un certificado para descargar.");
    if (errors.length) {
      setNotice({ type: "error", text: errors.slice(0, 5).join(" ") });
      return;
    }
    workingRef.current = true;
    cancelRef.current = false;
    setBusy("batch");
    setNotice(null);
    setProgress({
      current: 0,
      total: exportRecords.length,
      stage: "Generando certificados",
    });
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const canvas = document.createElement("canvas");
      const filenames = exportNames(exportRecords, format);
      let bytes = 0;
      for (let index = 0; index < exportRecords.length; index++) {
        if (cancelRef.current) break;
        const person = exportRecords[index];
        renderTo(canvas, person);
        const blob =
          format === "pdf"
            ? await createCertificatePdf(canvas, {
                project: session.project,
                name: person.name,
              })
            : await canvasToPng(canvas);
        bytes += blob.size;
        if (bytes > 250 * 1024 * 1024)
          throw new Error(
            "El lote supera 250 MB. Descarga un rango más pequeño para evitar agotar la memoria del navegador.",
          );
        if (cancelRef.current) break;
        zip.file(filenames[index], await blob.arrayBuffer());
        if (mounted.current)
          setProgress({
            current: index + 1,
            total: exportRecords.length,
            stage: "Generando certificados",
          });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (!cancelRef.current) {
        if (mounted.current)
          setProgress((value) => ({ ...value, stage: "Preparando ZIP" }));
        const blob = await zip.generateAsync({
          type: "blob",
          compression: "STORE",
        });
        if (!cancelRef.current && mounted.current) {
          downloadBlob(
            blob,
            `Certificados-${safeFilename(session.project)}-${format.toUpperCase()}.zip`,
          );
          setNotice({
            type: "success",
            text: `Se inició la descarga del ZIP con ${exportRecords.length} certificados ${format.toUpperCase()}.`,
          });
        }
      }
      if (cancelRef.current && mounted.current)
        setNotice({
          type: "info",
          text: "Generación cancelada. No se descargó el ZIP; puedes volver a intentarlo.",
        });
    } catch (failure) {
      if (mounted.current)
        setNotice({
          type: "error",
          text:
            failure.message ||
            "No se pudo generar el lote. Prueba con un rango más pequeño.",
        });
    } finally {
      workingRef.current = false;
      if (mounted.current) setBusy("");
    }
  }

  function resetSession() {
    setKind(null);
    setStep(0);
    setSession(initialSession());
    setTemplate(null);
    setTemplateName("");
    setSignatureConfig(initialSignatures());
    setAssets({});
    setPendingUploads({});
    setLayout(freshLayout());
    setDate(todayInTrujillo());
    setExternalText(EXTERNAL_BODY);
    setSelected(0);
    setSelection({});
    setNotice(null);
    setReport(null);
    setResetOpen(false);
    setPositioning(false);
    setScope("all");
    setRange({ from: 1, to: 50 });
    setSearch("");
    setControlTab("texto");
  }
  const filtered = participants.filter((person) =>
    `${person.name} ${person.role} ${person.area}`
      .toLocaleLowerCase("es-PE")
      .includes(search.toLocaleLowerCase("es-PE")),
  );
  return (
    <div className="min-w-0 space-y-6" aria-busy={Boolean(busy)}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-full sm:basis-64">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
            Generador de certificados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prepara certificados para tu proyecto, revisa cada participante y
            descarga los archivos. Los datos, plantillas y firmas son
            temporales: se perderán al salir del módulo, cerrar sesión o
            recargar.
          </p>
        </div>
        {kind && (
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(busy)}
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw />
            Nueva sesión
          </Button>
        )}
      </header>
      {!kind ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-base font-semibold">
              ¿Para quiénes son los certificados?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige el tipo de participantes para preparar la lista y las firmas
              correspondientes.
            </p>
          </div>
          <div className="divide-y rounded-xl border bg-card">
            {[
              {
                kind: "sedipranos",
                icon: UsersRound,
                title: "Sedipranos",
                description:
                  "Dirección de proyecto, coordinación y asesoría de áreas. Desde el padrón o un archivo Excel.",
              },
              {
                kind: "externos",
                icon: UserRound,
                title: "Participantes externos",
                description:
                  "Personas inscritas en tus eventos, un archivo Excel o una lista manual. Texto y firmantes personalizables.",
              },
            ].map((option) => (
              <button
                key={option.kind}
                type="button"
                className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                onClick={() => {
                  setKind(option.kind);
                  setSession((value) => ({
                    ...value,
                    source:
                      option.kind === "sedipranos" ? "directory" : "excel",
                  }));
                }}
              >
                <option.icon className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <nav
            aria-label="Etapas del generador"
            className="flex flex-wrap items-center gap-2 border-b pb-4"
          >
            <Badge variant="secondary" className="mr-2">
              {kind === "sedipranos" ? "Sedipranos" : "Externos"}
            </Badge>
            {STEPS.map((label, index) => (
              <Button
                key={label}
                type="button"
                variant={step === index ? "secondary" : "ghost"}
                size="sm"
                aria-current={step === index ? "step" : undefined}
                disabled={Boolean(busy) || index > step}
                onClick={() => {
                  setStep(index);
                  setNotice(null);
                }}
              >
                <span className="tabular-nums">
                  {index < step ? <Check className="size-3.5" /> : index + 1}
                </span>
                {label}
              </Button>
            ))}
          </nav>
          {notice && (
            <div
              role={notice.type === "error" ? "alert" : "status"}
              className={`rounded-lg border px-4 py-3 text-sm ${notice.type === "error" ? "border-destructive/30 text-destructive" : "bg-muted/40 text-foreground"}`}
            >
              {notice.text}
            </div>
          )}
          {step === 0 && (
            <CertificateSetup
              kind={kind}
              value={session}
              onChange={updateSession}
              onDirectoryLoaded={receiveDirectory}
              onContinue={() => {
                setNotice(null);
                setStep(1);
              }}
              onBack={() => {
                if (participants.length) setResetOpen(true);
                else setKind(null);
              }}
            />
          )}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
                  <div>
                    <h2 className="text-base font-semibold">
                      Plantilla del certificado
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Diseña el fondo en Canva u otro editor. Conserva espacio
                      libre para el nombre, el texto y las firmas: se añadirán
                      aquí.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setExampleOpen(true)}
                  >
                    <Eye />
                    Ver diseño base
                  </Button>
                  <div className="space-y-3 rounded-lg border border-dashed p-5">
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, JPEG o WebP · máximo 10 MB. Recomendado: A4
                      horizontal y al menos 2000 px de ancho.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={Boolean(busy)}
                      onClick={() => uploadRef.current?.click()}
                    >
                      {busy === "template" ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <ImagePlus />
                      )}
                      {template ? "Reemplazar plantilla" : "Cargar plantilla"}
                    </Button>
                    <input
                      ref={uploadRef}
                      type="file"
                      className="sr-only"
                      aria-label="Imagen de la plantilla"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={Boolean(busy)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        void uploadTemplate(file);
                      }}
                    />
                    {template && (
                      <p className="break-words text-sm">
                        <span className="font-medium">{templateName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {template.naturalWidth} × {template.naturalHeight} px
                          · listo para editar
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-date">Lugar y fecha</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="session-date"
                        value={date}
                        maxLength={140}
                        disabled={Boolean(busy)}
                        onChange={(event) => setDate(event.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={Boolean(busy)}
                        onClick={() => setDate(todayInTrujillo())}
                      >
                        Hoy
                      </Button>
                    </div>
                  </div>
                  {template && current && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Vista previa de {current.name}
                      </p>
                      <canvas
                        ref={canvasRef}
                        className={styles.certificate}
                        role="img"
                        aria-label={`Vista previa de ${current.name}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        Las firmas se incorporan a medida que las cargas.
                        Ajustarás la posición y la tipografía en el editor.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Proyecto:{" "}
                    <span className="font-medium text-foreground">
                      {session.project}
                    </span>{" "}
                    · {participants.length} participantes
                  </p>
                </section>
                <section className="rounded-xl border bg-card p-5 sm:p-6">
                  <CertificateSignatures {...signatureProps} />
                </section>
              </div>
              <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    setStep(0);
                    setNotice(null);
                  }}
                >
                  <ArrowLeft />
                  Participantes
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(busy) || uploadingSignatures || !template}
                  onClick={openEditor}
                >
                  Abrir editor
                  <ArrowRight />
                </Button>
              </div>
            </div>
          )}
          {step === 2 && current && (
            <>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
                <section
                  className="sticky top-14 z-20 min-w-0 overflow-hidden rounded-xl border bg-card lg:top-20"
                  aria-label="Vista previa del certificado"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">Vista previa</h2>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {current.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Participante anterior"
                        disabled={currentIndex === 0 || Boolean(busy)}
                        onClick={() => setSelected(currentIndex - 1)}
                      >
                        <ArrowLeft />
                      </Button>
                      <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
                        {currentIndex + 1} / {participants.length}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Participante siguiente"
                        disabled={
                          currentIndex + 1 >= participants.length ||
                          Boolean(busy)
                        }
                        onClick={() => setSelected(currentIndex + 1)}
                      >
                        <ArrowRight />
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`bg-muted/40 p-3 sm:p-5 ${positioning ? "cursor-crosshair" : ""}`}
                  >
                    <canvas
                      ref={canvasRef}
                      className={styles.certificate}
                      role="img"
                      aria-label={`Certificado de ${current.name}`}
                      onClick={(event) => {
                        if (!positioning || busy) return;
                        const bounds =
                          event.currentTarget.getBoundingClientRect();
                        const x = Math.round(
                          ((event.clientX - bounds.left) / bounds.width) * 100,
                        );
                        const y = Math.round(
                          ((event.clientY - bounds.top) / bounds.height) * 100,
                        );
                        setLayout((value) => ({
                          ...value,
                          [layoutBlock]: {
                            ...value[layoutBlock],
                            x: Math.max(5, Math.min(95, x)),
                            y: Math.max(5, Math.min(95, y)),
                          },
                        }));
                        setPositioning(false);
                      }}
                    />
                  </div>
                  <div className="space-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
                    {positioning ? (
                      <p>
                        Haz clic en la posición donde debe centrarse{" "}
                        {BLOCKS.find(
                          (block) => block.value === layoutBlock,
                        )?.label.toLowerCase()}
                        .
                      </p>
                    ) : (
                      <p>
                        Los cambios se reflejan en cada participante. Nombre en
                        una línea; rol, área y proyecto en negrita.
                      </p>
                    )}
                    {report && report.nameSize < layout.name.size - 0.1 && (
                      <p>
                        Nombre ajustado automáticamente a{" "}
                        {Math.round(report.nameSize * 10) / 10} px para
                        conservar una sola línea.
                      </p>
                    )}
                    {report?.warnings?.map((warning, index) => (
                      <p key={`${index}-${warning}`}>{warning}</p>
                    ))}
                  </div>
                </section>
                <section
                  className="min-w-0 rounded-xl border bg-card lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto"
                  aria-label="Controles del editor"
                >
                  <Tabs
                    value={controlTab}
                    onValueChange={(value) => {
                      setControlTab(value);
                      setPositioning(false);
                    }}
                    className="min-w-0 flex-col gap-0"
                  >
                    <div className="sticky top-0 z-10 overflow-x-auto border-b bg-card px-3 pt-2">
                      <TabsList variant="line" className="w-full">
                        <TabsTrigger value="texto">Texto</TabsTrigger>
                        <TabsTrigger value="diseno">Diseño</TabsTrigger>
                        <TabsTrigger value="firmas">Firmas</TabsTrigger>
                        <TabsTrigger value="descarga">Descarga</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="texto" className="space-y-5 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="editor-project">
                          Nombre del proyecto
                        </Label>
                        <Input
                          id="editor-project"
                          value={session.project}
                          maxLength={160}
                          disabled={Boolean(busy)}
                          onChange={(event) =>
                            updateSession({ project: event.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editor-name">
                          Nombre del participante
                        </Label>
                        <Input
                          id="editor-name"
                          value={current.name}
                          maxLength={180}
                          disabled={Boolean(busy)}
                          onChange={(event) =>
                            updatePerson({ name: event.target.value })
                          }
                          onBlur={() =>
                            updatePerson({ name: titleCase(current.name) })
                          }
                        />
                      </div>
                      {kind === "sedipranos" ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="editor-sex">
                              Tratamiento del cargo
                            </Label>
                            <AdminSelect
                              id="editor-sex"
                              value={current.sexo}
                              disabled={Boolean(busy)}
                              onChange={(event) =>
                                updatePerson({
                                  sexo: event.target.value,
                                  role: roleLabel(
                                    current.roleType,
                                    event.target.value,
                                  ),
                                })
                              }
                            >
                              <option value="MASCULINO">Masculino</option>
                              <option value="FEMENINO">Femenino</option>
                            </AdminSelect>
                            <p className="text-xs text-muted-foreground">
                              {current.role}. Este ajuste solo modifica el
                              certificado de esta sesión.
                            </p>
                          </div>
                          {current.roleType !== "director" && (
                            <div className="space-y-2">
                              <Label htmlFor="editor-area">Área</Label>
                              <Input
                                id="editor-area"
                                value={current.area}
                                maxLength={160}
                                disabled={Boolean(busy)}
                                onChange={(event) =>
                                  updatePerson({ area: event.target.value })
                                }
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="editor-role">Rol</Label>
                            <Input
                              id="editor-role"
                              value={current.role}
                              maxLength={120}
                              disabled={Boolean(busy)}
                              onChange={(event) =>
                                updatePerson({ role: event.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="external-body">
                              Texto del certificado
                            </Label>
                            <Textarea
                              id="external-body"
                              value={externalText}
                              maxLength={2000}
                              rows={7}
                              disabled={Boolean(busy)}
                              onChange={(event) =>
                                setExternalText(event.target.value)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Coloca {"{rol}"} y {"{proyecto}"} donde
                              correspondan. También puedes usar {"{nombre}"}.
                              Las variables se muestran en negrita.
                            </p>
                            {bodyTemplateErrors(externalText).map((error) => (
                              <p
                                key={error}
                                className="text-xs text-destructive"
                              >
                                {error}
                              </p>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="editor-date">Lugar y fecha</Label>
                        <Input
                          id="editor-date"
                          value={date}
                          maxLength={140}
                          disabled={Boolean(busy)}
                          onChange={(event) => setDate(event.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        El proyecto, el diseño y la fecha se aplican a todo el
                        lote. Los datos personales se editan por participante.
                      </p>
                    </TabsContent>
                    <TabsContent value="diseno" className="p-4">
                      <LayoutControl
                        layout={layout}
                        onChange={setLayout}
                        block={layoutBlock}
                        onBlockChange={setLayoutBlock}
                        disabled={Boolean(busy)}
                        positioning={positioning}
                        onPositioningChange={setPositioning}
                      />
                    </TabsContent>
                    <TabsContent value="firmas" className="p-4">
                      <CertificateSignatures {...signatureProps} />
                    </TabsContent>
                    <TabsContent value="descarga" className="space-y-5 p-4">
                      <div>
                        <h2 className="text-sm font-semibold">
                          Certificado actual
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {current.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(busy)}
                          onClick={() => void exportCurrent("pdf")}
                        >
                          <Download />
                          PDF actual
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(busy)}
                          onClick={() => void exportCurrent("png")}
                        >
                          <FileImage />
                          PNG actual
                        </Button>
                      </div>
                      <div className="space-y-4 border-t pt-5">
                        <h2 className="text-sm font-semibold">
                          Descargar lote en ZIP
                        </h2>
                        <div className="space-y-2">
                          <Label htmlFor="export-format">
                            Formato de cada certificado
                          </Label>
                          <AdminSelect
                            id="export-format"
                            value={format}
                            disabled={Boolean(busy)}
                            onChange={(event) => setFormat(event.target.value)}
                          >
                            <option value="pdf">PDF</option>
                            <option value="png">PNG</option>
                          </AdminSelect>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="export-scope">
                            Participantes del lote
                          </Label>
                          <AdminSelect
                            id="export-scope"
                            value={scope}
                            disabled={Boolean(busy)}
                            onChange={(event) => setScope(event.target.value)}
                          >
                            <option value="all">Todos los participantes</option>
                            <option value="selected">
                              Seleccionados en la tabla
                            </option>
                            <option value="range">
                              Un rango de participantes
                            </option>
                          </AdminSelect>
                        </div>
                        {scope === "range" && (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: "from", label: "Desde" },
                              { key: "to", label: "Hasta" },
                            ].map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label htmlFor={`export-${field.key}`}>
                                  {field.label}
                                </Label>
                                <Input
                                  id={`export-${field.key}`}
                                  type="number"
                                  min={1}
                                  max={participants.length}
                                  value={range[field.key]}
                                  disabled={Boolean(busy)}
                                  onChange={(event) =>
                                    setRange((value) => ({
                                      ...value,
                                      [field.key]: Math.max(
                                        1,
                                        Math.min(
                                          participants.length,
                                          Number(event.target.value) || 1,
                                        ),
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Un archivo por persona, con su nombre completo. Los
                          nombres repetidos reciben un número para conservar
                          todos los archivos.
                        </p>
                        <Button
                          type="button"
                          className="w-full"
                          disabled={Boolean(busy) || !exportRecords.length}
                          onClick={() => void exportBatch()}
                        >
                          {busy === "batch" ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <FolderArchive />
                          )}
                          {busy === "batch"
                            ? "Generando…"
                            : `Descargar ZIP (${exportRecords.length})`}
                        </Button>
                      </div>
                      {busy === "batch" && (
                        <div
                          role="status"
                          aria-live="polite"
                          className="space-y-2"
                        >
                          <p className="text-sm">
                            {progress.stage} · {progress.current} /{" "}
                            {progress.total}
                          </p>
                          <progress
                            className="h-2 w-full accent-primary"
                            value={progress.current}
                            max={progress.total || 1}
                            aria-label="Progreso de generación"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              cancelRef.current = true;
                            }}
                          >
                            Cancelar generación
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </section>
              </div>
              <section
                className="min-w-0 overflow-hidden rounded-xl border bg-card"
                aria-label="Participantes del lote"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                  <div>
                    <h2 className="text-base font-semibold">
                      Participantes del lote
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {participants.length} certificados ·{" "}
                      {
                        participants.filter(
                          (person) => selection[person.id] !== false,
                        ).length
                      }{" "}
                      seleccionados
                    </p>
                  </div>
                  <Input
                    aria-label="Buscar participante del lote"
                    className="w-full sm:max-w-64"
                    placeholder="Buscar nombre, rol o área"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <AdminCheckbox
                            aria-label="Seleccionar todos los participantes visibles"
                            checked={
                              filtered.length > 0 &&
                              filtered.every(
                                (person) => selection[person.id] !== false,
                              )
                            }
                            disabled={Boolean(busy)}
                            onChange={(event) =>
                              setSelection((value) => ({
                                ...value,
                                ...Object.fromEntries(
                                  filtered.map((person) => [
                                    person.id,
                                    event.target.checked,
                                  ]),
                                ),
                              }))
                            }
                          />
                        </TableHead>
                        <TableHead>Participante</TableHead>
                        <TableHead>Rol</TableHead>
                        {kind === "sedipranos" && <TableHead>Área</TableHead>}
                        <TableHead className="text-right">Revisión</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((person) => (
                        <TableRow
                          key={person.id}
                          data-state={
                            current.id === person.id ? "selected" : undefined
                          }
                        >
                          <TableCell>
                            <AdminCheckbox
                              aria-label={`Seleccionar a ${person.name}`}
                              checked={selection[person.id] !== false}
                              disabled={Boolean(busy)}
                              onChange={(event) =>
                                setSelection((value) => ({
                                  ...value,
                                  [person.id]: event.target.checked,
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {person.name}
                          </TableCell>
                          <TableCell>{person.role}</TableCell>
                          {kind === "sedipranos" && (
                            <TableCell>
                              {person.roleType === "director"
                                ? "—"
                                : person.area}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={Boolean(busy)}
                              onClick={() => {
                                setSelected(
                                  participants.findIndex(
                                    (record) => record.id === person.id,
                                  ),
                                );
                                canvasRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              }}
                            >
                              <Eye />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filtered.length && (
                        <TableRow>
                          <TableCell
                            colSpan={kind === "sedipranos" ? 5 : 4}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No hay participantes que coincidan con la búsqueda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>
            </>
          )}
        </>
      )}
      <Dialog open={exampleOpen} onOpenChange={setExampleOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Diseño base de la plantilla</DialogTitle>
            <DialogDescription>
              Prepara una imagen con los logos y el título. Deja libres el
              nombre, el texto, la fecha y las firmas; se completan en el
              editor.
            </DialogDescription>
          </DialogHeader>
          <Image
            src={BASE_TEMPLATE_URL}
            alt="Ejemplo de plantilla con espacios libres para nombre, texto y firmas"
            width={2000}
            height={1414}
            className="h-auto w-full rounded border"
          />
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={BASE_TEMPLATE_URL}
                download="Plantilla-base-certificados.png"
              />
            }
          >
            <Download />
            Descargar diseño base
          </Button>
        </DialogContent>
      </Dialog>
      <AdminConfirm
        show={resetOpen}
        title="¿Iniciar otra sesión?"
        message="Se perderán la lista, la plantilla, las firmas y los ajustes de esta sesión. Los archivos ya descargados se conservarán en tu equipo."
        confirmText="Iniciar otra sesión"
        onConfirm={resetSession}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
