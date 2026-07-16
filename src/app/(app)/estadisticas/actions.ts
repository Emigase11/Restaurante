"use server";

import { createClient } from "@/lib/supabase/server";
import { formatFechaCorta, formatHora } from "@/lib/utils/date";
import type { Categoria, TipoMovimiento, Unidad } from "@/lib/types/database";
import type { FiltrosEstadisticas } from "./queries";

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ETIQUETAS_TIPO: Record<TipoMovimiento, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

interface MovimientoExport {
  fecha: string;
  hora: string;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string | null;
  productos: { nombre: string; categoria: Categoria; unidad: Unidad };
}

function escaparCampoCSV(valor: string): string {
  if (valor.includes(";") || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function exportarMovimientos(
  filtros: FiltrosEstadisticas
): Promise<string> {
  const supabase = await createClient();

  let query = supabase
    .from("movimientos")
    .select(
      "fecha,hora,tipo,cantidad,nota,productos!inner(nombre,categoria,unidad)"
    )
    .gte("fecha", filtros.desde)
    .lte("fecha", filtros.hasta)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (filtros.categoria && filtros.categoria !== "todas") {
    query = query.eq("productos.categoria", filtros.categoria);
  }

  const { data } = await query;
  const movimientos = (data as unknown as MovimientoExport[] | null) ?? [];

  const encabezado = [
    "Fecha",
    "Hora",
    "Producto",
    "Categoría",
    "Unidad",
    "Tipo",
    "Cantidad",
    "Nota",
  ].join(";");

  const filas = movimientos.map((m) =>
    [
      formatFechaCorta(m.fecha),
      formatHora(m.hora),
      escaparCampoCSV(m.productos.nombre),
      ETIQUETAS_CATEGORIA[m.productos.categoria],
      m.productos.unidad,
      ETIQUETAS_TIPO[m.tipo],
      m.cantidad.toString().replace(".", ","),
      escaparCampoCSV(m.nota ?? ""),
    ].join(";")
  );

  const BOM = "﻿";
  return BOM + [encabezado, ...filas].join("\r\n");
}
