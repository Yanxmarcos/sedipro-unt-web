"use client";

import { useId, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VenueMap } from "@/components/event-forms/venue-map";
import { panelApi } from "@/lib/panel-api";

export function VenuePicker({ value, onChange, disabled }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function search() {
    if (busy || query.trim().length < 3 || disabled) return;
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const response = await panelApi(
        "/api/eventos/lugares?q=" + encodeURIComponent(query.trim()),
        { signal: AbortSignal.timeout(12000) },
      );
      setResults(response.data);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="space-y-4 rounded-xl border p-4 sm:p-5"
      aria-labelledby={id + "-title"}
    >
      <div>
        <h3
          id={id + "-title"}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <MapPin className="size-4" />
          Lugar del evento
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Busca un lugar o toca el mapa. Después puedes ajustar el punto
          arrastrándolo.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={id + "-search"}>Buscar lugar</Label>
        <div className="flex gap-2">
          <Input
            id={id + "-search"}
            value={query}
            maxLength={120}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Universidad Nacional de Trujillo"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || busy || query.trim().length < 3}
            onClick={search}
          >
            <Search />
            {busy ? "Buscando…" : "Buscar"}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-xs leading-5 text-destructive">
            {error}
          </p>
        )}
        {results && (
          <div role="status" className="space-y-1">
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No encontramos ese lugar. Prueba con la dirección o elige el
                punto en el mapa.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {results.map((result, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      disabled={disabled}
                      className="w-full px-3 py-3 text-left text-sm leading-5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                      onClick={() => {
                        onChange({
                          lugar: result.label,
                          ubicacion: {
                            latitud: result.latitud,
                            longitud: result.longitud,
                          },
                        });
                        setResults(null);
                      }}
                    >
                      {result.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="grid min-w-0 gap-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0" inert={disabled || undefined}>
          <VenueMap
            point={value.ubicacion}
            editable
            onChange={(point) => {
              if (!disabled) onChange({ ubicacion: point });
            }}
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={id + "-name"}>Nombre del lugar o dirección</Label>
            <Input
              id={id + "-name"}
              required
              maxLength={250}
              disabled={disabled}
              value={value.lugar}
              onChange={(e) => onChange({ lugar: e.target.value })}
              placeholder="Ej. Auditorio de la UNT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id + "-reference"}>Referencia (opcional)</Label>
            <Textarea
              id={id + "-reference"}
              rows={4}
              maxLength={500}
              disabled={disabled}
              value={value.referencia}
              onChange={(e) => onChange({ referencia: e.target.value })}
              placeholder="Ej. Ingreso por la puerta principal, junto a la biblioteca"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Esta indicación acompañará al mapa en la inscripción.
            </p>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Ingresar coordenadas
            </summary>
            <div className="mt-3 grid gap-3">
              {[
                ["latitud", "Latitud", -90, 90],
                ["longitud", "Longitud", -180, 180],
              ].map(([key, label, min, max]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={id + key}>{label}</Label>
                  <Input
                    id={id + key}
                    type="number"
                    step="any"
                    min={min}
                    max={max}
                    disabled={disabled}
                    value={value.ubicacion?.[key] ?? ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        onChange({ ubicacion: null });
                        return;
                      }
                      onChange({
                        ubicacion: {
                          ...(value.ubicacion || { latitud: 0, longitud: 0 }),
                          [key]: Number(e.target.value),
                        },
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
