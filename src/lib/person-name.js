export function formatPersonName(...parts) {
  return parts
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(" ")
    .toUpperCase();
}

export function capitalizePersonName(...parts) {
  return parts
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(" ")
    .toLocaleLowerCase("es-PE")
    .replace(/(^|[\s'-])\p{L}/gu, (value) => value.toLocaleUpperCase("es-PE"));
}
