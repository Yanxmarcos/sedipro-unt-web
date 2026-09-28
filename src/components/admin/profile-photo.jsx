"use client";

import { useRef, useState } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/lib/uploadthing";

export function ProfilePhoto({
  url,
  name,
  sedipranoId,
  onUploaded,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const { startUpload, isUploading } = useUploadThing("fotoPerfil", {
    onUploadProgress: setProgress,
    onUploadError: (error) =>
      toast.error(error.message || "No se pudo subir la foto."),
  });

  async function selectPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("La foto debe pesar como máximo 4 MB.");
      return;
    }
    setProgress(0);
    try {
      const uploaded = await startUpload(
        [file],
        sedipranoId ? { sedipranoId } : {},
      );
      const photo = uploaded?.[0]?.serverData;
      if (!photo?.url) return;
      await onUploaded?.(photo);
      toast.success("Foto de perfil actualizada.");
      window.dispatchEvent(new Event("panel:session-changed"));
    } catch (failure) {
      toast.error(failure.message || "No se pudo actualizar la foto.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20 border border-dashed">
          <AvatarImage src={url || undefined} alt={name || "Foto de perfil"} />
          <AvatarFallback className="text-xl">
            {(name || "SEDIPRO")
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={selectPhoto}
            aria-label="Seleccionar foto de perfil"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <UploadCloud />
            )}
            {isUploading ? "Subiendo foto…" : "Subir foto"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP. Máximo 4 MB.
          </p>
        </div>
      </div>
      {isUploading && (
        <Progress
          value={progress}
          aria-label="Progreso de la foto"
          className="max-w-xs"
        />
      )}
    </div>
  );
}
