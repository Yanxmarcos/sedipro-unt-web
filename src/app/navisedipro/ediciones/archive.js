import archive from "./archive.json";

export const archivePath = "/navisedipro/ediciones";
export const editions = archive;
export const editionPath = (edition) => `${archivePath}/${edition.slug}`;
export const editionMedia = (edition, file) => `${archivePath}/${edition.slug}/${file}`;
export const editionDate = (edition) => edition.alcance?.datos?.find(({ etiqueta }) => etiqueta === "Fecha")?.valor;
