"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PatronDiaSemana } from "./queries";

function TooltipDia({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PatronDiaSemana }[];
}) {
  if (!active || !payload?.length) return null;

  const dato = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{dato.dia}</p>
      <p className="text-muted-foreground">
        {dato.totalMovimientos.toLocaleString("es-AR")} movimientos
      </p>
    </div>
  );
}

export function GraficoDias({ datos }: { datos: PatronDiaSemana[] }) {
  const sinDatos = datos.every((d) => d.totalMovimientos === 0);

  if (sinDatos) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Sin datos en este período
      </div>
    );
  }

  return (
    <div style={{ height: 260, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            width={40}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip content={<TooltipDia />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="totalMovimientos" fill="#404040" radius={[0, 4, 4, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
