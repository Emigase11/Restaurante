"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Categoria } from "@/lib/types/database";
import type { ConsumoCategoria } from "./queries";

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const COLOR_CATEGORIA: Record<Categoria, string> = {
  bebidas: "#64748b",
  comidas: "#78716c",
  cocina: "#52525b",
};

function TooltipCategoria({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ConsumoCategoria }[];
}) {
  if (!active || !payload?.length) return null;

  const dato = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{ETIQUETAS_CATEGORIA[dato.categoria]}</p>
      <p className="text-muted-foreground">
        {dato.totalMovimientos.toLocaleString("es-AR")} movimientos
      </p>
    </div>
  );
}

export function GraficoCategorias({ datos }: { datos: ConsumoCategoria[] }) {
  const total = datos.reduce((acc, d) => acc + d.totalMovimientos, 0);

  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        Sin datos en este período
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div style={{ height: 220, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="totalMovimientos"
              nameKey="categoria"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {datos.map((d) => (
                <Cell key={d.categoria} fill={COLOR_CATEGORIA[d.categoria]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipCategoria />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {datos.map((d) => (
          <div key={d.categoria} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: COLOR_CATEGORIA[d.categoria] }}
              />
              <span>{ETIQUETAS_CATEGORIA[d.categoria]}</span>
            </div>
            <span className="text-muted-foreground">
              {d.totalMovimientos.toLocaleString("es-AR")} (
              {total > 0 ? Math.round((d.totalMovimientos / total) * 100) : 0}
              %)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
