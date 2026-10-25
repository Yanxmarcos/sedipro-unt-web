"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "@/components/admin/form-controls";
import { loadImageFile } from "@/lib/certificate-renderer.mjs";
import { usePanelSession } from "@/components/admin/panel-session";
import {
  institutionCandidates,
  officialSigner,
  roleLabel,
  titleCase,
} from "@/lib/certificate-data.mjs";

export async function readSignature(file) {
  if (!["image/png", "image/webp"].includes(file.type))
    throw new Error("La firma debe ser PNG o WebP con fondo transparente.");
  const image = await loadImageFile(file, { maxBytes: 4 * 1024 * 1024 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(480, image.naturalWidth);
  canvas.height = Math.max(
    1,
    Math.round((canvas.width * image.naturalHeight) / image.naturalWidth),
  );
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparent = false;
  let visible = false;
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 255) transparent = true;
    if (pixels[index] > 0) visible = true;
  }
  if (!transparent || !visible)
    throw new Error(
      "Usa una firma visible con fondo transparente. Retira el fondo en tu editor antes de cargarla.",
    );
  return { image, fileName: file.name, preview: canvas.toDataURL("image/png") };
}

function SignatureUpload({
  signer,
  asset,
  onAssetChange,
  onUploadStateChange,
  busy,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  const sequence = useRef(0);
  const fileRef = useRef(null);
  const callbacks = useRef({ onAssetChange, onUploadStateChange });
  callbacks.current = { onAssetChange, onUploadStateChange };
  const inputId = `signature-${signer.id}`;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sequence.current += 1;
      callbacks.current.onUploadStateChange?.(signer.id, false);
    };
  }, [signer.id]);
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-sm">
          <p className="break-words font-medium">
            {signer.name || "Nombre del firmante"}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            {signer.title || "Cargo del firmante"}
          </p>
        </div>
        {asset && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={busy || loading}
            aria-label={`Quitar firma de ${signer.name}`}
            onClick={() => onAssetChange(signer.id, null)}
          >
            <X />
          </Button>
        )}
      </div>
      {asset && (
        <div className="flex min-h-20 items-center justify-center rounded bg-white p-2">
          <Image
            src={asset.preview}
            alt={`Firma de ${signer.name}`}
            width={240}
            height={80}
            unoptimized
            className="max-h-20 w-auto object-contain"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || loading}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus />
          {loading
            ? "Leyendo firma…"
            : asset
              ? "Reemplazar firma"
              : "Cargar firma"}
        </Button>
        <input
          ref={fileRef}
          id={inputId}
          className="sr-only"
          type="file"
          accept="image/png,image/webp"
          disabled={busy || loading}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const request = ++sequence.current;
            setLoading(true);
            setError("");
            callbacks.current.onUploadStateChange?.(signer.id, true);
            try {
              const next = await readSignature(file);
              if (mounted.current && request === sequence.current)
                callbacks.current.onAssetChange(signer.id, next);
            } catch (failure) {
              if (mounted.current && request === sequence.current)
                setError(failure.message);
            } finally {
              if (mounted.current && request === sequence.current) {
                setLoading(false);
                callbacks.current.onUploadStateChange?.(signer.id, false);
              }
            }
          }}
        />
        {asset && (
          <span
            className="max-w-full truncate text-xs text-muted-foreground"
            title={asset.fileName}
          >
            {asset.fileName}
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CertificateSignatures({
  kind,
  year,
  participants,
  members,
  directoryLoading,
  directoryError,
  onRefresh,
  value,
  onChange,
  assets,
  onAssetChange,
  onUploadStateChange,
  busy = false,
}) {
  const { permissions } = usePanelSession();
  const candidates = {
    presidentId: institutionCandidates(members, "PRESIDENCIA", year),
    pmoId: institutionCandidates(members, "DIRECCION_AREA", year, "PMO"),
  };
  const selectedMember = (id, key) =>
    candidates[key].find((member) => String(member._id) === String(id));
  const sexOverrides = value.sexOverrides || {};
  const updateSex = (id, sexo) =>
    onChange({ sexOverrides: { ...sexOverrides, [id]: sexo } });
  const officialEntries = [
    {
      key: "presidentId",
      label: "Presidencia de SEDIPRO UNT",
      office: "president",
    },
    { key: "pmoId", label: "Dirección de PMO", office: "pmo" },
  ];
  const signers =
    kind === "sedipranos"
      ? [
          ...officialEntries.flatMap(({ key, office }) => {
            const member = selectedMember(value[key], key);
            if (!member) return [];
            const sexo = sexOverrides[member._id] || member.sexo;
            return [
              {
                id: `member-${member._id}`,
                name: titleCase(`${member.nombres} ${member.apellidos}`),
                title: officialSigner({ ...member, sexo }, office).title,
              },
            ];
          }),
          ...participants
            .filter((person) => person.roleType === "director")
            .map((person) => ({
              id: person.id,
              name: titleCase(person.name),
              title: roleLabel("director", person.sexo),
            })),
        ].filter(
          (person, index, list) =>
            list.findIndex((other) => other.id === person.id) === index,
        )
      : value.external || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Firmas del certificado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Carga firmas PNG o WebP con fondo transparente, de hasta 4 MB. Solo se
          usarán en esta sesión.
        </p>
      </div>
      {kind === "sedipranos" ? (
        <>
          <p className="text-sm text-muted-foreground">
            Para dirección: Presidencia y Dirección de PMO. Para coordinación y
            asesoría: Presidencia y quienes dirigen el proyecto.
          </p>
          {directoryError && (
            <div className="text-sm">
              <p role="alert" className="text-destructive">
                {directoryError}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRefresh}
              >
                Reintentar carga del padrón
              </Button>
            </div>
          )}
          {directoryLoading && (
            <p role="status" className="text-sm text-muted-foreground">
              Cargando titulares del padrón…
            </p>
          )}
          {officialEntries.map(({ key, label }) => {
            const selected = selectedMember(value[key], key);
            const sexo =
              selected && (sexOverrides[selected._id] || selected.sexo);
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`official-${key}`}>
                  {label} · {year}
                </Label>
                <AdminSelect
                  id={`official-${key}`}
                  disabled={busy || directoryLoading}
                  value={value[key] || ""}
                  onChange={(event) => onChange({ [key]: event.target.value })}
                >
                  <option value="">Selecciona a la persona titular</option>
                  {candidates[key].map((member) => (
                    <option key={member._id} value={String(member._id)}>
                      {titleCase(`${member.nombres} ${member.apellidos}`)}
                      {` · ${member.periodoDirectiva}`}
                    </option>
                  ))}
                </AdminSelect>
                {selected && !["MASCULINO", "FEMENINO"].includes(sexo) && (
                  <div className="space-y-2">
                    <Label htmlFor={`official-sex-${key}`}>
                      Tratamiento del cargo
                    </Label>
                    <AdminSelect
                      id={`official-sex-${key}`}
                      disabled={busy}
                      value={sexo || "NO_ESPECIFICADO"}
                      onChange={(event) =>
                        updateSex(selected._id, event.target.value)
                      }
                    >
                      <option value="NO_ESPECIFICADO">
                        Selecciona un tratamiento
                      </option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                    </AdminSelect>
                  </div>
                )}
                {!directoryLoading &&
                  !directoryError &&
                  !candidates[key].length && (
                    <p className="text-sm text-muted-foreground">
                      No hay titular de {label} configurado para {year}.{" "}
                      {permissions.canManage ? (
                        <>
                          <Link
                            href="/panel/sedipranos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4"
                          >
                            Configurar cargo y período en el padrón
                          </Link>{" "}
                          (se abre en otra pestaña para conservar esta sesión).
                        </>
                      ) : (
                        "Solicita a Directiva que actualice el cargo y período en el padrón."
                      )}
                    </p>
                  )}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Solo se muestran las personas activas con el cargo y período
            correspondientes en el padrón.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || directoryLoading}
            onClick={onRefresh}
          >
            Actualizar titulares del padrón
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Añade los firmantes que necesite este proyecto. Puedes emitir un
            certificado sin firmas.
          </p>
          {(value.external || []).map((signer, index) => (
            <div key={signer.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`signer-name-${signer.id}`}>
                  Nombre del firmante {index + 1}
                </Label>
                <Input
                  id={`signer-name-${signer.id}`}
                  value={signer.name}
                  maxLength={180}
                  disabled={busy}
                  onChange={(event) =>
                    onChange({
                      external: value.external.map((person) =>
                        person.id === signer.id
                          ? { ...person, name: event.target.value }
                          : person,
                      ),
                    })
                  }
                />
                <Label htmlFor={`signer-title-${signer.id}`}>Cargo</Label>
                <Input
                  id={`signer-title-${signer.id}`}
                  value={signer.title}
                  maxLength={120}
                  disabled={busy}
                  onChange={(event) =>
                    onChange({
                      external: value.external.map((person) =>
                        person.id === signer.id
                          ? { ...person, title: event.target.value }
                          : person,
                      ),
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={busy}
                className="mt-6"
                aria-label={`Quitar firmante ${index + 1}`}
                onClick={() => {
                  onChange({
                    external: value.external.filter(
                      (person) => person.id !== signer.id,
                    ),
                  });
                  onAssetChange(signer.id, null);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={busy || (value.external || []).length >= 8}
            onClick={() =>
              onChange({
                external: [
                  ...(value.external || []),
                  {
                    id: `external-signer-${crypto.randomUUID()}`,
                    name: "",
                    title: "",
                  },
                ],
              })
            }
          >
            <Plus />
            Añadir firmante
          </Button>
        </>
      )}
      <div className="space-y-3">
        {signers.map((signer) => (
          <SignatureUpload
            key={signer.id}
            signer={signer}
            asset={assets[signer.id]}
            onAssetChange={onAssetChange}
            onUploadStateChange={onUploadStateChange}
            busy={busy}
          />
        ))}
      </div>
    </div>
  );
}
