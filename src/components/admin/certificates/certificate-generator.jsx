"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_CERTIFICATE,
  FIELDS,
  MAX_BATCH,
  MAX_FILE_SIZE,
  canvasToPng,
  createCertificatePdf,
  downloadBlob,
  drawCertificate,
  loadTemplate,
  parseCertificateRows,
  safeFilename,
  todayInTrujillo,
  validateCertificate,
} from "@/lib/certificates.mjs";
import styles from "./certificate-generator.module.css";

const PLACEHOLDERS = {
  name: "Ej. María Fernanda López García",
  role: "Ej. Asesor",
  area: "Ej. Gestión del Talento Humano",
  date: "Ej. Trujillo, 08 de agosto de 2026",
};
const PAGE_SIZE = 10;

export default function CertificateGenerator() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const cancelRef = useRef(false);
  const workingRef = useRef(false);
  const [mode, setMode] = useState("individual");
  const [form, setForm] = useState({ ...EMPTY_CERTIFICATE });
  const [fieldErrors, setFieldErrors] = useState({});
  const [template, setTemplate] = useState(null);
  const [templateError, setTemplateError] = useState("");
  const [retry, setRetry] = useState(0);
  const [records, setRecords] = useState([]);
  const [filename, setFilename] = useState("");
  const [selected, setSelected] = useState(0);
  const [tablePage, setTablePage] = useState(0);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });

  const invalidCount = records.filter(
    (record) => Object.keys(record.errors).length,
  ).length;
  const completedFields = FIELDS.filter(({ key }) => form[key].trim()).length;
  const selectedRecord = mode === "batch" ? records[selected] : null;
  const preview = mode === "batch" ? selectedRecord || EMPTY_CERTIFICATE : form;
  const percentage = progress.total
    ? Math.round((progress.current / progress.total) * 100)
    : 0;
  const totalPages = Math.ceil(records.length / PAGE_SIZE);

  useEffect(() => {
    let active = true;
    loadTemplate()
      .then((image) => {
        if (active) {
          setTemplate(image);
          setTemplateError("");
        }
      })
      .catch((error) => {
        if (active) setTemplateError(error.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    if (!template || !canvasRef.current) return;
    try {
      drawCertificate(canvasRef.current, template, preview);
    } catch (error) {
      setTemplateError(error.message);
    }
  }, [template, preview]);

  useEffect(() => {
    cancelRef.current = false;
    return () => {
      cancelRef.current = true;
    };
  }, []);

  async function downloadIndividual(format) {
    if (workingRef.current || !template) return;
    const errors = validateCertificate(form);
    setFieldErrors(errors);
    setNotice(null);
    if (Object.keys(errors).length) {
      document.getElementById(`certificate-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    workingRef.current = true;
    setBusy(format);
    try {
      // Render again from the current form so a download never uses a stale preview.
      const canvas = drawCertificate(
        document.createElement("canvas"),
        template,
        form,
      );
      const blob =
        format === "pdf"
          ? await createCertificatePdf(canvas)
          : await canvasToPng(canvas);
      if (cancelRef.current) return;
      downloadBlob(blob, `Certificado-${safeFilename(form.name)}.${format}`);
      setNotice({
        type: "success",
        text: `Certificado ${format.toUpperCase()} listo. Se inició la descarga.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.message ||
          "No se pudo descargar el certificado. Inténtalo otra vez.",
      });
    } finally {
      workingRef.current = false;
      setBusy("");
    }
  }

  async function downloadExcelTemplate() {
    if (workingRef.current) return;
    workingRef.current = true;
    setBusy("example");
    setNotice(null);
    try {
      const XLSX = await import("xlsx");
      const sheet = XLSX.utils.aoa_to_sheet([
        ["Nombre", "Rol", "Área", "Fecha"],
        [
          "María Fernanda López García",
          "Asesora",
          "Gestión del Talento Humano",
          "Trujillo, 08 de agosto de 2026",
        ],
        [
          "Juan Carlos Pérez Ruiz",
          "Miembro",
          "Tecnologías de la Información",
          "Trujillo, 08 de agosto de 2026",
        ],
      ]);
      sheet["!cols"] = [{ wch: 38 }, { wch: 22 }, { wch: 40 }, { wch: 38 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Participantes");
      const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
      downloadBlob(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Plantilla-participantes-SEDIPRO.xlsx",
      );
      setNotice({
        type: "success",
        text: "Plantilla descargada. Reemplaza las dos filas de ejemplo con tus participantes.",
      });
    } catch {
      setNotice({
        type: "error",
        text: "No se pudo descargar la plantilla de Excel. Inténtalo otra vez.",
      });
    } finally {
      workingRef.current = false;
      setBusy("");
    }
  }

  async function importExcel(file) {
    if (!file || workingRef.current) return;
    setNotice(null);
    // Clear the previous selection to prevent exporting an older file after an error.
    setRecords([]);
    setFilename("");
    setSelected(0);
    setTablePage(0);
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setNotice({
        type: "error",
        text: "Selecciona un archivo Excel con extensión .xlsx o .xls.",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setNotice({
        type: "error",
        text: "El Excel supera los 10 MB. Divide el archivo antes de subirlo.",
      });
      return;
    }
    workingRef.current = true;
    setBusy("import");
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
        cellDates: true,
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet)
        throw new Error("El archivo no contiene una hoja de cálculo.");
      const range = sheet["!ref"] && XLSX.utils.decode_range(sheet["!ref"]);
      if (range && (range.e.r > 10000 || range.e.c > 100)) {
        throw new Error(
          "La hoja contiene demasiadas filas o columnas. Copia los participantes a la plantilla de ejemplo.",
        );
      }
      const imported = parseCertificateRows(
        XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: true,
          blankrows: true,
        }),
      );
      if (cancelRef.current) return;
      setRecords(imported);
      setFilename(file.name);
      const errors = imported.filter(
        (record) => Object.keys(record.errors).length,
      ).length;
      setNotice(
        errors
          ? {
              type: "error",
              text: `${errors} fila${errors === 1 ? " necesita" : "s necesitan"} corrección. Revisa la tabla, corrige el Excel y vuelve a cargarlo.`,
            }
          : {
              type: "success",
              text: `${imported.length} participante${imported.length === 1 ? "" : "s"} listo${imported.length === 1 ? "" : "s"}. Revisa la vista previa antes de generar el ZIP.`,
            },
      );
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.message?.includes("columna") ||
          error.message?.includes("archivo") ||
          error.message?.includes("Excel") ||
          error.message?.includes("hoja")
            ? error.message
            : "No se pudo leer el Excel. Comprueba que no esté dañado ni protegido con contraseña.",
      });
    } finally {
      workingRef.current = false;
      setBusy("");
    }
  }

  async function downloadBatch() {
    if (workingRef.current || !template || !records.length || invalidCount)
      return;
    workingRef.current = true;
    cancelRef.current = false;
    setBusy("batch");
    setNotice(null);
    setProgress({
      current: 0,
      total: records.length,
      stage: "Generando certificados",
    });
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const folder = zip.folder("Certificados-SEDICHAMPIONS");
      const canvas = document.createElement("canvas");
      for (let index = 0; index < records.length; index++) {
        if (cancelRef.current) break;
        drawCertificate(canvas, template, records[index]);
        const pdf = await createCertificatePdf(canvas);
        if (cancelRef.current) break;
        // The sequence number preserves every certificate, even for repeated names.
        folder.file(
          `${String(index + 1).padStart(3, "0")}-Certificado-${safeFilename(records[index].name)}.pdf`,
          await pdf.arrayBuffer(),
        );
        setProgress({
          current: index + 1,
          total: records.length,
          stage: "Generando certificados",
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (cancelRef.current) {
        setNotice({
          type: "info",
          text: "Generación cancelada. Puedes revisar el lote y volver a intentarlo.",
        });
        return;
      }
      setProgress({
        current: records.length,
        total: records.length,
        stage: "Preparando el archivo ZIP",
      });
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "STORE",
      });
      if (!cancelRef.current) {
        downloadBlob(blob, "Certificados-SEDIPRO.zip");
        setNotice({
          type: "success",
          text: `Se inició la descarga del ZIP con ${records.length} certificados PDF.`,
        });
      } else
        setNotice({
          type: "info",
          text: "Generación cancelada. No se descargó el archivo.",
        });
    } catch (error) {
      if (!cancelRef.current)
        setNotice({
          type: "error",
          text:
            error.message ||
            "No se pudo generar el lote. Prueba con menos participantes.",
        });
    } finally {
      workingRef.current = false;
      cancelRef.current = false;
      setBusy("");
    }
  }

  function switchMode(nextMode, focus = false) {
    if (busy) return;
    setMode(nextMode);
    setNotice(null);
    if (focus) document.getElementById(`tab-${nextMode}`)?.focus();
  }

  return (
    <div className={styles.generator} aria-busy={Boolean(busy)}>
      <div className={styles.breadcrumb}>
        <span>Herramientas</span>
        <ChevronRight aria-hidden="true" />
        <span>Certificados</span>
      </div>
      <header className={styles.pageHeader}>
        <div>
          <h1>Generador de certificados</h1>
          <p>Reconoce a quienes hacen posible cada proyecto.</p>
        </div>
        <span className={styles.projectBadge}>
          <Award aria-hidden="true" /> SEDICHAMPIONS
        </span>
      </header>

      {notice && (
        <div
          className={`${styles.notice} ${styles[notice.type]}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.type === "error" ? (
            <AlertCircle aria-hidden="true" />
          ) : notice.type === "success" ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <Info aria-hidden="true" />
          )}
          <p>{notice.text}</p>
          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setNotice(null)}
          >
            <X />
          </button>
        </div>
      )}

      <div className={styles.workspace}>
        <section className={styles.previewCard} aria-labelledby="preview-title">
          <div className={styles.cardHeading}>
            <div className={styles.headingLabel}>
              <Eye aria-hidden="true" />
              <h2 id="preview-title">Vista previa</h2>
            </div>
            <span className={styles.liveBadge}>
              <span /> En tiempo real
            </span>
          </div>
          <div className={styles.previewStage}>
            {templateError ? (
              <div className={styles.emptyState} role="alert">
                <AlertCircle />
                <p>{templateError}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTemplateError("");
                    setRetry((value) => value + 1);
                  }}
                >
                  <RefreshCw /> Reintentar
                </Button>
              </div>
            ) : (
              <>
                {!template && (
                  <div className={styles.emptyState}>
                    <LoaderCircle className={styles.spin} />
                    <p>Cargando plantilla…</p>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className={styles.certificate}
                  style={{ display: template ? "block" : "none" }}
                  role="img"
                  aria-label={`Vista previa del certificado de ${preview.name || "un participante"}`}
                />
              </>
            )}
          </div>
          <div className={styles.previewFooter}>
            <div>
              <strong>Certificado de reconocimiento</strong>
              <span>Plantilla del proyecto · A4 horizontal</span>
            </div>
            <span className={styles.formatBadge}>PDF / PNG</span>
          </div>
          {mode === "batch" && records.length > 0 && (
            <div className={styles.previewPagination}>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Participante anterior"
                disabled={selected === 0 || Boolean(busy)}
                onClick={() => setSelected((value) => value - 1)}
              >
                <ArrowLeft />
              </Button>
              <span>
                Participante <strong>{selected + 1}</strong> de {records.length}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Participante siguiente"
                disabled={selected === records.length - 1 || Boolean(busy)}
                onClick={() => setSelected((value) => value + 1)}
              >
                <ArrowRight />
              </Button>
            </div>
          )}
          <div className={styles.previewHint}>
            <Info aria-hidden="true" />
            <p>
              {mode === "individual"
                ? "Completa los datos y revisa el certificado antes de descargarlo."
                : "Selecciona un participante en la tabla para comprobar su certificado."}{" "}
              Los nombres largos se ajustan automáticamente.
            </p>
          </div>
        </section>

        <section className={styles.editorCard} aria-label="Datos y descarga">
          <div
            className={styles.modeTabs}
            role="tablist"
            aria-label="Modo de generación"
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                switchMode(
                  event.key === "Home"
                    ? "individual"
                    : event.key === "End"
                      ? "batch"
                      : mode === "individual"
                        ? "batch"
                        : "individual",
                  true,
                );
              }
            }}
          >
            <button
              type="button"
              id="tab-individual"
              role="tab"
              aria-selected={mode === "individual"}
              aria-controls="panel-individual"
              tabIndex={mode === "individual" ? 0 : -1}
              disabled={Boolean(busy)}
              onClick={() => switchMode("individual")}
            >
              <UserRound /> Individual
            </button>
            <button
              type="button"
              id="tab-batch"
              role="tab"
              aria-selected={mode === "batch"}
              aria-controls="panel-batch"
              tabIndex={mode === "batch" ? 0 : -1}
              disabled={Boolean(busy)}
              onClick={() => switchMode("batch")}
            >
              <UsersRound /> Desde Excel
            </button>
          </div>

          {mode === "individual" ? (
            <div
              id="panel-individual"
              role="tabpanel"
              aria-labelledby="tab-individual"
              className={styles.editorBody}
            >
              <div className={styles.editorTitle}>
                <div>
                  <h2>Datos del participante</h2>
                  <p>Personaliza un certificado.</p>
                </div>
                <span>{completedFields}/4</span>
              </div>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  downloadIndividual("pdf");
                }}
              >
                <fieldset disabled={Boolean(busy)} className={styles.fields}>
                  <legend className="sr-only">
                    Información del certificado
                  </legend>
                  {FIELDS.map(({ key, label, limit }) => (
                    <div key={key} className={styles.field}>
                      <div className={styles.fieldLabel}>
                        <label htmlFor={`certificate-${key}`}>
                          {label} <span aria-hidden="true">*</span>
                        </label>
                        {key === "date" && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm((value) => ({
                                ...value,
                                date: todayInTrujillo(),
                              }));
                              setFieldErrors((value) => ({
                                ...value,
                                date: undefined,
                              }));
                            }}
                          >
                            Usar hoy
                          </button>
                        )}
                      </div>
                      <Input
                        id={`certificate-${key}`}
                        value={form[key]}
                        placeholder={PLACEHOLDERS[key]}
                        maxLength={limit}
                        required
                        autoComplete="off"
                        aria-invalid={Boolean(fieldErrors[key])}
                        aria-describedby={
                          fieldErrors[key] ? `error-${key}` : undefined
                        }
                        onChange={(event) => {
                          setForm((value) => ({
                            ...value,
                            [key]: event.target.value,
                          }));
                          setFieldErrors((value) => ({
                            ...value,
                            [key]: undefined,
                          }));
                          setNotice(null);
                        }}
                      />
                      {fieldErrors[key] && (
                        <p className={styles.fieldError} id={`error-${key}`}>
                          {fieldErrors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </fieldset>
                <div className={styles.downloadActions}>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={
                      Boolean(busy) || !template || Boolean(templateError)
                    }
                  >
                    {busy === "pdf" ? (
                      <LoaderCircle className={styles.spin} />
                    ) : (
                      <ArrowDownToLine />
                    )}{" "}
                    Descargar PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={
                      Boolean(busy) || !template || Boolean(templateError)
                    }
                    onClick={() => downloadIndividual("png")}
                  >
                    {busy === "png" ? (
                      <LoaderCircle className={styles.spin} />
                    ) : (
                      <FileImage />
                    )}{" "}
                    Descargar PNG
                  </Button>
                </div>
              </form>
              <p className={styles.smallNote}>
                Todos los campos son obligatorios. El certificado conserva los
                logos y las firmas de la plantilla.
              </p>
            </div>
          ) : (
            <div
              id="panel-batch"
              role="tabpanel"
              aria-labelledby="tab-batch"
              className={styles.editorBody}
            >
              <div className={styles.editorTitle}>
                <div>
                  <h2>Certificados por lote</h2>
                  <p>Un PDF por participante, en un solo ZIP.</p>
                </div>
              </div>
              <div className={styles.excelStep}>
                <span>1</span>
                <div>
                  <strong>Prepara tu lista</strong>
                  <p>
                    Usa las columnas Nombre, Rol, Área y Fecha. Se leerá la
                    primera hoja.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className={styles.fullWidth}
                disabled={Boolean(busy)}
                onClick={downloadExcelTemplate}
              >
                {busy === "example" ? (
                  <LoaderCircle className={styles.spin} />
                ) : (
                  <FileSpreadsheet />
                )}{" "}
                Descargar plantilla Excel
              </Button>
              <div className={styles.excelStep}>
                <span>2</span>
                <div>
                  <strong>Importa y revisa</strong>
                  <p>Reemplaza las filas de ejemplo con tus datos.</p>
                </div>
              </div>
              <div
                className={`${styles.dropZone} ${dragging ? styles.dragging : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (!busy) importExcel(event.dataTransfer.files?.[0]);
                }}
              >
                {busy === "import" ? (
                  <LoaderCircle className={styles.spin} />
                ) : (
                  <Upload />
                )}
                <strong>
                  {busy === "import"
                    ? "Leyendo participantes…"
                    : "Arrastra tu Excel aquí"}
                </strong>
                <span>
                  .xlsx o .xls · Máx. 10 MB · {MAX_BATCH} participantes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(busy)}
                  onClick={() => fileRef.current?.click()}
                >
                  {filename ? "Reemplazar archivo" : "Seleccionar archivo"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  aria-label="Archivo de participantes Excel"
                  className="sr-only"
                  tabIndex={-1}
                  disabled={Boolean(busy)}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    importExcel(file);
                  }}
                />
              </div>
              {filename && (
                <div className={styles.loadedFile}>
                  <FileSpreadsheet />
                  <div>
                    <strong title={filename}>{filename}</strong>
                    <span>
                      {records.length} participantes ·{" "}
                      {invalidCount
                        ? `${invalidCount} por corregir`
                        : "Datos completos"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    aria-label="Quitar archivo"
                    onClick={() => {
                      setRecords([]);
                      setFilename("");
                      setSelected(0);
                      setTablePage(0);
                      setNotice(null);
                    }}
                  >
                    <X />
                  </button>
                </div>
              )}
              <div className={styles.excelStep}>
                <span>3</span>
                <div>
                  <strong>Descarga tus certificados</strong>
                  <p>
                    {invalidCount
                      ? "Corrige las filas señaladas antes de continuar."
                      : "Revisa la vista previa y genera el archivo ZIP."}
                  </p>
                </div>
              </div>
              {busy === "batch" && (
                <div
                  className={styles.progressBlock}
                  role="status"
                  aria-live="polite"
                >
                  <div>
                    <span>{progress.stage}</span>
                    <strong>{percentage}%</strong>
                  </div>
                  <progress
                    max="100"
                    value={percentage}
                    aria-label="Progreso de generación"
                  />
                  <span>
                    {progress.current} de {progress.total} certificados
                  </span>
                </div>
              )}
              <Button
                size="lg"
                className={styles.fullWidth}
                disabled={
                  Boolean(busy) ||
                  !template ||
                  Boolean(templateError) ||
                  !records.length ||
                  invalidCount > 0
                }
                onClick={downloadBatch}
              >
                {busy === "batch" ? (
                  <LoaderCircle className={styles.spin} />
                ) : (
                  <FolderArchive />
                )}
                {busy === "batch"
                  ? "Generando certificados…"
                  : `Generar ZIP${records.length ? ` (${records.length})` : ""}`}
              </Button>
              {busy === "batch" && (
                <Button
                  variant="ghost"
                  className={styles.fullWidth}
                  onClick={() => {
                    cancelRef.current = true;
                  }}
                >
                  Cancelar generación
                </Button>
              )}
            </div>
          )}
          <div className={styles.privacyNote}>
            <ShieldCheck aria-hidden="true" />
            <p>Tus datos se procesan en este navegador.</p>
          </div>
        </section>
      </div>

      {mode === "batch" && records.length > 0 && (
        <section className={styles.recordsCard} aria-labelledby="records-title">
          <div className={styles.cardHeading}>
            <div className={styles.headingLabel}>
              <UsersRound />
              <h2 id="records-title">Participantes importados</h2>
              <span className={styles.count}>{records.length}</span>
            </div>
            <span className={styles.tableStatus}>
              {invalidCount ? (
                `${invalidCount} por corregir`
              ) : (
                <>
                  <Check /> Todo listo para generar
                </>
              )}
            </span>
          </div>
          <div
            className={styles.tableScroll}
            tabIndex={0}
            aria-label="Tabla de participantes, desplazable horizontalmente"
          >
            <table>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Participante</th>
                  <th>Rol / Área</th>
                  <th>Fecha</th>
                  <th>Revisión</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE)
                  .map((record, index) => {
                    const position = tablePage * PAGE_SIZE + index;
                    const errors = Object.entries(record.errors);
                    return (
                      <tr
                        key={record.row}
                        data-selected={selected === position}
                      >
                        <td className={styles.rowNumber}>{record.row}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.participantButton}
                            disabled={Boolean(busy)}
                            onClick={() => setSelected(position)}
                            aria-label={`Vista previa de ${record.name || `fila ${record.row}`}`}
                            aria-pressed={selected === position}
                          >
                            <span className={styles.avatar}>
                              {record.name
                                ? record.name.trim()[0].toUpperCase()
                                : "?"}
                            </span>
                            <strong>{record.name || "Sin nombre"}</strong>
                            <Eye />
                          </button>
                        </td>
                        <td>
                          <span>{record.role || "Sin rol"}</span>
                          <small>{record.area || "Sin área"}</small>
                        </td>
                        <td>{record.date || "Sin fecha"}</td>
                        <td>
                          {errors.length ? (
                            <span className={styles.rowErrors}>
                              <AlertCircle />
                              {errors
                                .map(
                                  ([key, message]) =>
                                    `${FIELDS.find((field) => field.key === key).label}: ${message}`,
                                )
                                .join(" ")}
                            </span>
                          ) : (
                            <span className={styles.validRow}>
                              <CheckCircle2 /> Listo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className={styles.tableFooter}>
            <span>
              Mostrando {tablePage * PAGE_SIZE + 1}–
              {Math.min((tablePage + 1) * PAGE_SIZE, records.length)} de{" "}
              {records.length}
            </span>
            <div>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Página anterior"
                disabled={tablePage === 0}
                onClick={() => setTablePage((value) => value - 1)}
              >
                <ArrowLeft />
              </Button>
              <span>
                {tablePage + 1} / {totalPages}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Página siguiente"
                disabled={tablePage + 1 >= totalPages}
                onClick={() => setTablePage((value) => value + 1)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>
      )}
      <footer className={styles.moduleFooter}>
        <FileText aria-hidden="true" />
        <span>SEDIPRO UNT · Certificados SEDICHAMPIONS</span>
      </footer>
    </div>
  );
}
