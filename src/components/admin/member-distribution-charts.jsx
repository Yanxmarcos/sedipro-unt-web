"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/admin/page-state";

const AREAS = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT", "DIRECTIVA"];
const SEXES = {
  MASCULINO: "Hombres",
  FEMENINO: "Mujeres",
  NO_ESPECIFICADO: "Sin especificar",
};
const CONFIG = { cantidad: { label: "Sedipranos", color: "var(--primary)" } };
function AxisLabel({ x, y, payload }) {
  const lines = [];
  for (const word of String(payload.value).split(" ")) {
    if (!lines.length || lines.at(-1).length + word.length > 22)
      lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fill="var(--muted-foreground)"
      fontSize={10}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i ? 13 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
function DistributionChart({ data, title, careers = false }) {
  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      <ChartContainer
        config={CONFIG}
        className="h-[360px] !aspect-auto w-full"
        style={{ minWidth: careers ? Math.max(480, data.length * 150) : 280 }}
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 28, right: 20, left: 0, bottom: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            interval={0}
            tickLine={false}
            axisLine={false}
            height={careers ? 115 : 36}
            tick={careers ? <AxisLabel /> : { fill: "var(--muted-foreground)" }}
            tickMargin={10}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)" }}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={[0, (maximum) => Math.max(1, maximum)]}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="cantidad"
            fill="var(--color-cantidad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={56}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="cantidad"
              position="top"
              className="fill-foreground text-xs font-semibold"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Categoría</th>
            <th scope="col">Sedipranos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default function MemberDistributionCharts({ distributions = [] }) {
  const [area, setArea] = useState("");
  const selected = distributions.find((row) => row.area === area);
  const careers = (selected?.carreras || [])
    .filter((row) => row.cantidad > 0)
    .map((row) => ({ label: row.carrera, cantidad: row.cantidad }));
  const sexes = (selected?.sexos || [])
    .filter((row) => row.sexo !== "NO_ESPECIFICADO" || row.cantidad > 0)
    .map((row) => ({ label: SEXES[row.sexo], cantidad: row.cantidad }));
  return (
    <section className="space-y-4" aria-label="Distribución del padrón activo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Composición de la comunidad</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sedipranos activos · padrón actual · {selected?.total ?? 0}{" "}
            integrantes{area ? ` de ${area}` : " de todas las áreas"}
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Área de la distribución"
        >
          {["", ...AREAS].map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={area === value ? "default" : "outline"}
              aria-pressed={area === value}
              onClick={() => setArea(value)}
            >
              {value || "Todo SEDIPRO"}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <h3 className="font-semibold">Distribución por carrera</h3>
            <p className="text-sm text-muted-foreground">
              Carreras registradas en las fichas de los integrantes.
            </p>
          </CardHeader>
          <CardContent className="min-w-0 space-y-3">
            {careers.length ? (
              <DistributionChart
                data={careers}
                title="Cantidad de sedipranos por carrera"
                careers
              />
            ) : (
              <EmptyState
                title="Sin carreras para mostrar"
                description={
                  selected?.total
                    ? "Las fichas de esta selección aún no tienen carrera registrada."
                    : "No hay sedipranos activos en esta selección."
                }
              />
            )}
            {selected?.sinCarrera > 0 && (
              <p className="text-xs text-muted-foreground">
                {selected.sinCarrera}{" "}
                {selected.sinCarrera === 1
                  ? "integrante sin carrera registrada"
                  : "integrantes sin carrera registrada"}
                .
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <h3 className="font-semibold">Distribución por sexo</h3>
            <p className="text-sm text-muted-foreground">
              Según el sexo registrado en la ficha de cada integrante.
            </p>
          </CardHeader>
          <CardContent className="min-w-0">
            {selected?.total ? (
              <DistributionChart
                data={sexes}
                title="Cantidad de sedipranos por sexo"
              />
            ) : (
              <EmptyState
                title="Sin integrantes para mostrar"
                description="No hay sedipranos activos en esta selección."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
