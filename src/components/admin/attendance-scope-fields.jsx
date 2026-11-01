"use client";
import { AdminSelect } from "@/components/admin/form-controls";
import { ATTENDANCE_AREAS } from "@/lib/attendance-scope.mjs";
import { AREA_TEXT_CLASSES } from "@/lib/member-areas.mjs";

export function AttendanceScopeFields({ value, onChange, disabled = false }) {
  const scope = value || {
    tipo: "general",
    areas: [],
    incluirPresidencia: false,
    incluirVicepresidencia: false,
  };
  return (
    <fieldset disabled={disabled} className="mb-4 space-y-3">
      <legend className="mb-2 text-sm font-semibold">Convocados</legend>
      <AdminSelect
        disabled={disabled}
        value={scope.tipo}
        onChange={(event) =>
          onChange({
            tipo: event.target.value,
            areas: [],
            incluirPresidencia: false,
            incluirVicepresidencia: false,
          })
        }
        aria-label="Alcance de la asistencia"
      >
        <option value="general">Todo SEDIPRO</option>
        <option value="areas">Por áreas</option>
      </AdminSelect>
      {scope.tipo === "areas" ? (
        <>
          <p className="text-sm text-muted-foreground">
            Selecciona una o varias áreas. Se incluirán automáticamente sus
            directores activos.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {ATTENDANCE_AREAS.map((area) => (
              <label
                key={area}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium ${AREA_TEXT_CLASSES[area]}`}
              >
                <input
                  type="checkbox"
                  checked={scope.areas.includes(area)}
                  onChange={(event) =>
                    onChange({
                      ...scope,
                      areas: event.target.checked
                        ? [...scope.areas, area]
                        : scope.areas.filter((item) => item !== area),
                    })
                  }
                  className="size-4 accent-primary"
                />
                {area}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {[
              ["incluirPresidencia", "Incluir asistencia de Presidencia"],
              [
                "incluirVicepresidencia",
                "Incluir asistencia de Vicepresidencia",
              ],
            ].map(([key, label]) => (
              <label
                key={key}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  className="size-4 accent-primary"
                  type="checkbox"
                  checked={scope[key]}
                  onChange={(event) =>
                    onChange({ ...scope, [key]: event.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Incluye a todos los miembros activos, sus directores, Presidencia y
          Vicepresidencia.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        La lista queda fijada al crear la sesión. Los cambios posteriores en el
        padrón no modificarán esta asistencia.
      </p>
    </fieldset>
  );
}
