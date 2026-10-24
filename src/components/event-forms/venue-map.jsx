"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleMapsLink, validPoint } from "@/lib/event-location.mjs";
import "leaflet/dist/leaflet.css";
import styles from "./venue-map.module.css";

const DEFAULT_CENTER = [-8.115, -79.03];
export function VenueMap({
  point,
  editable = false,
  onChange,
  label = "Ubicación del evento",
}) {
  const container = useRef(null);
  const instance = useRef(null);
  const marker = useRef(null);
  const initialPoint = useRef(point);
  const change = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);
  useEffect(() => {
    let cancelled = false;
    let observer;
    import("leaflet")
      .then((module) => {
        if (cancelled || !container.current) return;
        const L = module.default;
        const initial = initialPoint.current;
        const map = L.map(container.current, {
          scrollWheelZoom: false,
          zoomControl: false,
        }).setView(
          validPoint(initial)
            ? [initial.latitud, initial.longitud]
            : DEFAULT_CENTER,
          validPoint(initial) ? 16 : 13,
        );
        instance.current = map;
        L.control
          .zoom({ zoomInTitle: "Acercar mapa", zoomOutTitle: "Alejar mapa" })
          .addTo(map);
        const tiles = L.tileLayer(
          process.env.NEXT_PUBLIC_EVENT_MAP_TILE_URL ||
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              process.env.NEXT_PUBLIC_EVENT_MAP_ATTRIBUTION ||
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          },
        ).addTo(map);
        tiles.on("tileerror", () => {
          if (!cancelled) setFailed(true);
        });
        const icon = L.divIcon({
          className: styles.pin,
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          html: '<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 1C7.3 1 1 7.2 1 15c0 10 14 22 14 22s14-12 14-22C29 7.2 22.7 1 15 1Z" fill="#662065" stroke="white" stroke-width="2"/><circle cx="15" cy="15" r="5" fill="white"/></svg>',
        });
        const pin = L.marker(
          validPoint(initial)
            ? [initial.latitud, initial.longitud]
            : DEFAULT_CENTER,
          {
            icon,
            draggable: editable,
            title: "Lugar del evento",
            alt: "Punto del evento",
            keyboard: true,
          },
        );
        marker.current = pin;
        if (validPoint(initial)) pin.addTo(map);
        const pick = (latlng) => {
          pin.setLatLng(latlng).addTo(map);
          change.current?.({
            latitud: Number(latlng.lat.toFixed(6)),
            longitud: Number(latlng.lng.toFixed(6)),
          });
        };
        pin.on("dragend", () => pick(pin.getLatLng()));
        if (editable) map.on("click", (event) => pick(event.latlng));
        observer = new ResizeObserver(() =>
          map.invalidateSize({ animate: false }),
        );
        observer.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      instance.current?.remove();
      instance.current = null;
      marker.current = null;
    };
  }, [editable]);
  useEffect(() => {
    if (!ready || !instance.current || !marker.current) return;
    if (validPoint(point)) {
      marker.current
        .setLatLng([point.latitud, point.longitud])
        .addTo(instance.current);
      instance.current.setView(
        [point.latitud, point.longitud],
        Math.max(15, instance.current.getZoom()),
        { animate: false },
      );
    } else marker.current.remove();
  }, [point, ready]);
  const href = googleMapsLink(point);
  return (
    <div className={styles.wrapper}>
      <div ref={container} className={styles.map} aria-label={label} />
      {!ready && !failed && (
        <p className={styles.loading} role="status">
          Cargando mapa…
        </p>
      )}
      {failed && (
        <p className={styles.warning} role="status">
          El mapa no pudo cargar todas sus imágenes.{" "}
          {href
            ? "Puedes abrir la ubicación en Google Maps."
            : "Reintenta la conexión o introduce las coordenadas."}
        </p>
      )}
      {editable && (
        <div className={styles.tools}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!ready}
            onClick={() => {
              const center = instance.current?.getCenter();
              if (center)
                change.current?.({
                  latitud: Number(center.lat.toFixed(6)),
                  longitud: Number(center.lng.toFixed(6)),
                });
            }}
          >
            <Crosshair /> Usar centro del mapa
          </Button>
          <span role="status">
            {validPoint(point)
              ? "Punto seleccionado"
              : "Toca el mapa para elegir el lugar"}
          </span>
        </div>
      )}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Abrir en Google Maps <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}
