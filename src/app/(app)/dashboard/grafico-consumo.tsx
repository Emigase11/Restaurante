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
import { formatFechaLarga } from "@/lib/utils/date";
import type { ConsumoDia } from "./queries";

function TooltipConsumo({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ConsumoDia }[];
}) {
  if (!active || !payload?.length) return null;

  const dato = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium capitalize">{formatFechaLarga(dato.fecha)}</p>
      <p className="text-muted-foreground">
        {dato.total.toLocaleString("es-AR")}{" "}
        {dato.total === 1 ? "movimiento" : "movimientos"}
      </p>
    </div>
  );
}

export function GraficoConsumo({ datos }: { datos: ConsumoDia[] }) {
  return (
    <div style={{ height: 260, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="diaCorto"
            axisLine={false}
            tickLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={28}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip content={<TooltipConsumo />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="total" fill="#262626" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
