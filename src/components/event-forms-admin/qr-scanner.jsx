"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Camera, CameraOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "@/components/admin/form-controls";

export function EventQrScanner({ onScan, disabled }) {
  const id = "event-camera-" + useId().replace(/[^a-z0-9]/gi, "");
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const [device, setDevice] = useState("");
  const callback = useRef(onScan),
    blocked = useRef(false),
    last = useRef({});
  const lifecycle = useRef(Promise.resolve());
  callback.current = onScan;
  blocked.current = disabled;
  useEffect(() => {
    if (!active) return;
    let cancelled = false,
      scanner;
    setReady(false);
    const operation = lifecycle.current
      .catch(() => {})
      .then(async () => {
        if (cancelled) return;
        try {
          const { Html5Qrcode, Html5QrcodeSupportedFormats } =
            await import("html5-qrcode");
          const cameras = await Html5Qrcode.getCameras();
          if (cancelled) return;
          setDevices(cameras);
          if (!cameras.length) throw new Error("No hay cámaras disponibles.");
          scanner = new Html5Qrcode(id, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });
          const preferred =
            device ||
            cameras.find((c) => /back|rear|trasera|environment/i.test(c.label))
              ?.id ||
            cameras[0].id;
          await scanner.start(
            preferred,
            {
              fps: 10,
              qrbox: (width, height) => ({
                width: Math.min(240, width * 0.75, height * 0.75),
                height: Math.min(240, width * 0.75, height * 0.75),
              }),
            },
            (text) => {
              if (
                cancelled ||
                blocked.current ||
                (last.current.text === text &&
                  Date.now() - last.current.time < 3000)
              )
                return;
              last.current = { text, time: Date.now() };
              callback.current(text);
            },
            () => {},
          );
          if (!cancelled) setReady(true);
        } catch (failure) {
          if (!cancelled) {
            setError(
              /NotAllowed|Permission|denied/i.test(
                failure?.name + " " + failure?.message + " " + String(failure),
              )
                ? "Permite el acceso a la cámara desde el navegador y vuelve a intentarlo. También puedes buscar al participante."
                : "No se pudo iniciar la cámara. Comprueba que esté conectada y libre, o usa la búsqueda manual.",
            );
            setActive(false);
          }
        }
      });
    lifecycle.current = operation;
    return () => {
      cancelled = true;
      lifecycle.current = operation.finally(async () => {
        if (scanner) {
          if (scanner.isScanning) await scanner.stop().catch(() => {});
          try {
            scanner.clear();
          } catch {
            /* A detached scanner has no view to clear. */
          }
        }
      });
    };
  }, [active, device, id]);
  useEffect(() => {
    const stopHidden = () => {
      if (document.hidden) setActive(false);
    };
    document.addEventListener("visibilitychange", stopHidden);
    return () => document.removeEventListener("visibilitychange", stopHidden);
  }, []);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={active ? "outline" : "default"}
          disabled={disabled && !active}
          onClick={() => {
            setError("");
            setActive((v) => !v);
          }}
        >
          {active ? <CameraOff /> : <Camera />}
          {active ? "Detener cámara" : "Activar cámara"}
        </Button>
        {active && !ready && (
          <span
            role="status"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle className="size-4 animate-spin" /> Iniciando cámara…
          </span>
        )}
      </div>
      {active && devices.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor={id + "-device"}>Cámara</Label>
          <AdminSelect
            id={id + "-device"}
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          >
            <option value="">Selección automática</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label || "Cámara"}
              </option>
            ))}
          </AdminSelect>
        </div>
      )}
      <div
        id={id}
        hidden={!active}
        className="w-full overflow-hidden rounded-lg [&_video]:rounded-lg"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="text-sm leading-6 text-muted-foreground">
        Acerca el QR de confirmación a la cámara. Se registrará automáticamente
        con el estado seleccionado. La cámara se apaga al salir o cambiar de
        pestaña.
      </p>
    </div>
  );
}
