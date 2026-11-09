import { createResourceFile } from "./resource-export.mjs";
import {
  startResourceActivity,
  finishResourceActivity,
} from "./resource-audit.mjs";

let copying = false;
export function canCopyResourceImage() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined" &&
    (typeof ClipboardItem.supports !== "function" ||
      ClipboardItem.supports("image/png"))
  );
}

export async function copyResourceImage(
  asset,
  variant,
  { size = "4096", background = "transparente", hex = "#29295D", signal } = {},
) {
  if (!canCopyResourceImage())
    throw new Error(
      "Este navegador no permite copiar imágenes. Usa Descargar PNG para subirla a Canva.",
    );
  if (copying)
    throw new Error("Ya se está preparando una imagen. Espera a que termine.");
  copying = true;
  let entry;
  let blobReady;
  try {
    const fondo =
      background === "transparente" && variant.transparent
        ? "transparente"
        : background === "personalizado"
          ? hex
          : background === "negro"
            ? "#000000"
            : "#ffffff";
    // Start write synchronously in the click gesture. Safari needs a promised PNG
    // rather than a write after fetching, auditing and rendering have finished.
    blobReady = (async () => {
      entry = await startResourceActivity("copiar_recurso", {
        recursoId: asset.id,
        varianteId: variant.id,
        formato: "png",
        tamano: size,
        fondo,
      });
      signal?.throwIfAborted();
      const file = await createResourceFile(asset, variant, {
        format: "png",
        size,
        background,
        hex,
        signal,
      });
      signal?.throwIfAborted();
      return file.blob;
    })();
    // Observe rejection even if write() immediately refuses clipboard permission.
    void blobReady.catch(() => {});
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blobReady }),
      ]);
    } catch (error) {
      // Wait for a possibly pending start request so no operation is left unowned.
      let preparationError;
      await blobReady.catch((failure) => {
        preparationError = failure;
      });
      if (preparationError) throw preparationError;
      if (error.name === "NotAllowedError")
        throw new Error(
          "No se pudo acceder al portapapeles. Permite copiar imágenes y vuelve a intentarlo, o descarga el PNG.",
        );
      throw error;
    }
    let auditPending = false;
    await finishResourceActivity(entry.id, "copiada").catch(() => {
      auditPending = true;
    });
    return { auditPending };
  } catch (error) {
    if (entry)
      await finishResourceActivity(
        entry.id,
        error.name === "AbortError" ? "cancelada" : "fallida",
      ).catch(() => {});
    throw error;
  } finally {
    copying = false;
  }
}
