import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/utils/date";
import type { Categoria, StockActual, TipoMovimiento, Unidad } from "@/lib/types/database";

const DIAS_CORTOS = ["D", "L", "M", "M", "J", "V", "S"] as const;

function parseFechaISO(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function rangoUltimos7Dias(): { desde: string; fechas: string[] } {
  const hoy = parseFechaISO(hoyISO());
  const fechas: string[] = [];
  for (let i = 6; i >= 0; i--) {
    fechas.push(format(subDays(hoy, i), "yyyy-MM-dd"));
  }
  return { desde: fechas[0], fechas };
}

export interface ResumenStock {
  totalProductos: number;
  sinStock: StockActual[];
  stockBajo: StockActual[];
  stockOk: number;
}

export async function getResumenStock(): Promise<ResumenStock> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("stock_actual")
    .select("*")
    .eq("activo", true);

  const productos = (data as StockActual[] | null) ?? [];

  const sinStock = productos
    .filter((p) => p.stock <= 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const stockBajo = productos
    .filter((p) => p.stock > 0 && p.stock_minimo > 0 && p.stock <= p.stock_minimo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const stockOk = productos.filter((p) => p.stock > p.stock_minimo).length;

  return {
    totalProductos: productos.length,
    sinStock,
    stockBajo,
    stockOk,
  };
}

export interface MovimientosHoy {
  total: number;
  entradas: number;
  salidas: number;
  ajustes: number;
}

export async function getMovimientosHoy(): Promise<MovimientosHoy> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movimientos")
    .select("tipo")
    .eq("fecha", hoyISO());

  const movimientos = (data as { tipo: TipoMovimiento }[] | null) ?? [];

  return {
    total: movimientos.length,
    entradas: movimientos.filter((m) => m.tipo === "entrada").length,
    salidas: movimientos.filter((m) => m.tipo === "salida").length,
    ajustes: movimientos.filter((m) => m.tipo === "ajuste").length,
  };
}

export interface ConsumoDia {
  fecha: string;
  diaCorto: string;
  total: number;
}

export async function getConsumoUltimos7Dias(): Promise<ConsumoDia[]> {
  const supabase = await createClient();
  const { desde, fechas } = rangoUltimos7Dias();

  const { data } = await supabase
    .from("movimientos")
    .select("fecha")
    .eq("tipo", "salida")
    .gte("fecha", desde)
    .lte("fecha", hoyISO());

  const movimientos = (data as { fecha: string }[] | null) ?? [];

  const conteoPorFecha = new Map<string, number>();
  for (const movimiento of movimientos) {
    conteoPorFecha.set(
      movimiento.fecha,
      (conteoPorFecha.get(movimiento.fecha) ?? 0) + 1
    );
  }

  return fechas.map((fecha) => ({
    fecha,
    diaCorto: DIAS_CORTOS[parseFechaISO(fecha).getDay()],
    total: conteoPorFecha.get(fecha) ?? 0,
  }));
}

export interface TopProducto {
  nombre: string;
  unidad: Unidad;
  categoria: Categoria;
  totalMovimientos: number;
}

export async function getTopProductosSemana(): Promise<TopProducto[]> {
  const supabase = await createClient();
  const { desde } = rangoUltimos7Dias();

  const { data } = await supabase
    .from("movimientos")
    .select("productos!inner(nombre,unidad,categoria)")
    .eq("tipo", "salida")
    .gte("fecha", desde)
    .lte("fecha", hoyISO());

  const movimientos =
    (data as unknown as {
      productos: { nombre: string; unidad: Unidad; categoria: Categoria };
    }[] | null) ?? [];

  const conteoPorProducto = new Map<string, TopProducto>();

  for (const movimiento of movimientos) {
    const clave = movimiento.productos.nombre;
    const actual = conteoPorProducto.get(clave);
    if (actual) {
      actual.totalMovimientos += 1;
    } else {
      conteoPorProducto.set(clave, {
        nombre: movimiento.productos.nombre,
        unidad: movimiento.productos.unidad,
        categoria: movimiento.productos.categoria,
        totalMovimientos: 1,
      });
    }
  }

  return Array.from(conteoPorProducto.values())
    .sort((a, b) => b.totalMovimientos - a.totalMovimientos)
    .slice(0, 5);
}

export interface UltimoMovimiento {
  id: string;
  hora: string;
  tipo: TipoMovimiento;
  cantidad: number;
  producto: { nombre: string; unidad: Unidad };
}

export async function getUltimosMovimientos(
  limite = 6
): Promise<UltimoMovimiento[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movimientos")
    .select("id,hora,tipo,cantidad,productos!inner(nombre,unidad)")
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false })
    .limit(limite);

  const movimientos =
    (data as unknown as {
      id: string;
      hora: string;
      tipo: TipoMovimiento;
      cantidad: number;
      productos: { nombre: string; unidad: Unidad };
    }[] | null) ?? [];

  return movimientos.map((m) => ({
    id: m.id,
    hora: m.hora,
    tipo: m.tipo,
    cantidad: m.cantidad,
    producto: { nombre: m.productos.nombre, unidad: m.productos.unidad },
  }));
}
