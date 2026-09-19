import crypto from "crypto";

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cleanDni(value) {
  const dni = String(value || "").replace(/\D/g, "");
  return dni.length === 8 ? dni : null;
}

export function cleanEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function registrationCode() {
  return `SED-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function qrToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function eventManagerName(user) {
  return (
    `${user?.nombres || ""} ${user?.apellidos || ""}`.trim() ||
    user?.user ||
    "SEDIPRO"
  );
}
