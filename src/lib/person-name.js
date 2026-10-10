export function formatPersonName(...parts) {
  return parts
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(" ")
    .toUpperCase();
}
