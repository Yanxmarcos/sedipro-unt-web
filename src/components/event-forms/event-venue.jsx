"use client";
import { MapPin, Monitor, Layers } from "lucide-react";
import { VenueMap } from "./venue-map";
import {
  MODALITIES,
  VIRTUAL_PLATFORMS,
  hasPhysicalVenue,
  hasVirtualVenue,
  validPoint,
} from "@/lib/event-location.mjs";
import styles from "./public-form.module.css";

export function EventVenue({ event }) {
  const mode = event.modalidad || "presencial";
  return (
    <>
      <dl className={styles.venueDetails}>
        <div>
          <dt>
            <Layers size={18} />
            Modalidad
          </dt>
          <dd>{MODALITIES.find((item) => item.value === mode)?.label}</dd>
        </div>
        {hasVirtualVenue(mode) && (
          <div>
            <dt>
              <Monitor size={18} />
              Participación virtual
            </dt>
            <dd>
              {VIRTUAL_PLATFORMS.find(
                (item) => item.value === event.plataformaVirtual,
              )?.label || "Plataforma por confirmar"}
            </dd>
          </div>
        )}
        {hasPhysicalVenue(mode) && event.lugar && (
          <div>
            <dt>
              <MapPin size={18} />
              Lugar
            </dt>
            <dd>{event.lugar}</dd>
          </div>
        )}
      </dl>
      {hasPhysicalVenue(mode) && validPoint(event.ubicacion) && (
        <div className={styles.venueMap}>
          <VenueMap point={event.ubicacion} />
        </div>
      )}
      {hasPhysicalVenue(mode) && event.referencia && (
        <div className={styles.venueReference}>
          <span>Referencia</span>
          <p>{event.referencia}</p>
        </div>
      )}
    </>
  );
}
