"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatFechaLarga } from "@/lib/utils/date";
import type { EvolucionDia } from "./queries";

function parseFechaISO(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatFechaCortaSinAnio(fecha: string): string {
  return format(parseFechaISO(fecha), "dd/MM");
}

function TooltipEvolucion({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: EvolucionDia }[];
}) {
  if (!active || !payload?.length) return null;

  const dato = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium capitalize">{formatFechaLarga(dato.fecha)}</p>
      <p className="text-emerald-600">
        Entradas: {dato.entradas.toLocaleString("es-AR")}
      </p>
      <p className="text-rose-600">
        Salidas: {dato.salidas.toLocaleString("es-AR")}
      </p>
    </div>
  );
}

export function GraficoEvolucion({ datos }: { datos: EvolucionDia[] }) {
  const sinDatos = datos.every((d) => d.entradas === 0 && d.salidas === 0);

  if (sinDatos) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        Sin datos en este período
      </div>
    );
  }

  const interval = datos.length > 60 ? Math.ceil(datos.length / 60) - 1 : 0;

  return (
    <div style={{ height: 320, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatFechaCortaSinAnio}
            interval={interval}
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
          <Tooltip content={<TooltipEvolucion />} />
          <Line
            type="monotone"
            dataKey="entradas"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="salidas"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
