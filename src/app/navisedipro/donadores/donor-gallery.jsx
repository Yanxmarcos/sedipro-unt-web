"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleAlert, Gift } from "lucide-react";
import { donationForm } from "../links";
import styles from "../donor.module.css";

const endpoint = "/api/navisedipro/public/gallery";

async function readGallery(signal) {
  const response = await fetch(endpoint, { cache: "no-store", signal });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("La galería no está disponible en este momento.");
  return (await response.json()).data;
}

export default function DonorGallery() {
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    readGallery(controller.signal).then((gallery) => {
      if (!controller.signal.aborted) setPhotos(gallery);
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, []);

  async function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: form.get("dni").trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo iniciar sesión.");
      }
      const gallery = await readGallery();
      if (!gallery) throw new Error("El navegador no guardó tu sesión de donador.");
      setPhotos(gallery);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");
    try {
      if (!(await fetch(endpoint, { method: "DELETE" })).ok) throw new Error("No se pudo cerrar tu sesión.");
      setPhotos(null);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p role="status">Verificando acceso…</p>;

  return <>
    {error && <div className={styles.accessAlert} role="alert">
      <CircleAlert size={21} aria-hidden="true" />
      <div>
        <strong>No pudimos completar la solicitud</strong>
        <p>{error}</p>
      </div>
    </div>}
    {photos ? <>
      <button type="button" className={styles.primary} disabled={busy} onClick={logout}>Cerrar sesión</button>
      {photos.length === 0 ? <p>Aún no hay fotos publicadas.</p> : <div className={styles.photos}>
        {photos.map((photo) => <figure key={photo._id}>
          <Image src={`${endpoint}/${photo._id}`} alt={photo.alt} fill unoptimized sizes="(max-width: 640px) 90vw, 30vw" />
        </figure>)}
      </div>}
    </> : <div className={styles.accessPanel}>
      <form className={styles.donorForm} onSubmit={login}>
        <p>Ingresa el DNI con el que registraste tu donación.</p>
        <label>DNI
          <input name="dni" inputMode="numeric" pattern="[0-9]{8}" autoComplete="username" required
            onChange={({ currentTarget }) => {
              currentTarget.value = currentTarget.value.replace(/[^0-9]/g, "").slice(0, 8);
            }} />
        </label>
        <button className={styles.primary} disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button>
      </form>
      <div className={styles.donationPrompt}>
        <p>¿Aún no donas?</p>
        <a href={donationForm} target="_blank" rel="noopener noreferrer">
          <Gift size={18} aria-hidden="true" />
          Quiero hacer una donación
        </a>
      </div>
    </div>}
  </>;
}
