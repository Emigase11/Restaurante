import { addDays, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { Categoria, TipoMovimiento, Unidad } from "@/lib/types/database";

export interface FiltrosEstadisticas {
  desde: string;
  hasta: string;
  categoria?: Categoria | "todas";
}

const CATEGORIAS_ORDEN: Categoria[] = ["bebidas", "comidas", "cocina"];

const DIAS_SEMANA_ISO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

function parseFechaISO(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diaSemanaISO(fecha: string): number {
  const diaJs = parseFechaISO(fecha).getDay();
  return diaJs === 0 ? 6 : diaJs - 1;
}

function rangoDeFechas(desde: string, hasta: string): string[] {
  const fechas: string[] = [];
  let actual = parseFechaISO(desde);
  const limite = parseFechaISO(hasta);

  while (actual <= limite) {
    fechas.push(format(actual, "yyyy-MM-dd"));
    actual = addDays(actual, 1);
  }

  return fechas;
}

interface MovimientoConProducto {
  id: string;
  producto_id: string;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad: number;
  productos: { nombre: string; categoria: Categoria; unidad: Unidad };
}

async function fetchMovimientos(
  filtros: FiltrosEstadisticas,
  columnas: string,
  soloTipo?: TipoMovimiento
) {
  const supabase = await createClient();

  let query = supabase
    .from("movimientos")
    .select(columnas)
    .gte("fecha", filtros.desde)
    .lte("fecha", filtros.hasta);

  if (filtros.categoria && filtros.categoria !== "todas") {
    query = query.eq("productos.categoria", filtros.categoria);
  }

  if (soloTipo) {
    query = query.eq("tipo", soloTipo);
  }

  const { data } = await query;
  return (data as unknown as MovimientoConProducto[] | null) ?? [];
}

export interface ResumenPeriodo {
  totalMovimientos: number;
  entradas: number;
  salidas: number;
  ajustes: number;
  productosUnicos: number;
  diasConActividad: number;
}

export async function getResumenPeriodo(
  filtros: FiltrosEstadisticas
): Promise<ResumenPeriodo> {
  const movimientos = await fetchMovimientos(
    filtros,
    "id,producto_id,fecha,tipo,productos!inner(categoria)"
  );

  const productosUnicos = new Set(movimientos.map((m) => m.producto_id));
  const diasConActividad = new Set(movimientos.map((m) => m.fecha));

  return {
    totalMovimientos: movimientos.length,
    entradas: movimientos.filter((m) => m.tipo === "entrada").length,
    salidas: movimientos.filter((m) => m.tipo === "salida").length,
    ajustes: movimientos.filter((m) => m.tipo === "ajuste").length,
    productosUnicos: productosUnicos.size,
    diasConActividad: diasConActividad.size,
  };
}

export interface TopProductoSalida {
  producto_id: string;
  nombre: string;
  categoria: Categoria;
  unidad: Unidad;
  totalCantidad: number;
  totalMovimientos: number;
}

export async function getTopProductosSalida(
  filtros: FiltrosEstadisticas
): Promise<TopProductoSalida[]> {
  const movimientos = await fetchMovimientos(
    filtros,
    "producto_id,cantidad,productos!inner(nombre,categoria,unidad)",
    "salida"
  );

  const acumulado = new Map<string, TopProductoSalida>();

  for (const movimiento of movimientos) {
    const existente = acumulado.get(movimiento.producto_id);
    if (existente) {
      existente.totalCantidad += movimiento.cantidad;
      existente.totalMovimientos += 1;
    } else {
      acumulado.set(movimiento.producto_id, {
        producto_id: movimiento.producto_id,
        nombre: movimiento.productos.nombre,
        categoria: movimiento.productos.categoria,
        unidad: movimiento.productos.unidad,
        totalCantidad: movimiento.cantidad,
        totalMovimientos: 1,
      });
    }
  }

  return Array.from(acumulado.values())
    .sort((a, b) => b.totalCantidad - a.totalCantidad)
    .slice(0, 10);
}

export interface ConsumoCategoria {
  categoria: Categoria;
  totalMovimientos: number;
}

export async function getConsumoPorCategoria(
  filtros: FiltrosEstadisticas
): Promise<ConsumoCategoria[]> {
  const movimientos = await fetchMovimientos(
    filtros,
    "productos!inner(categoria)",
    "salida"
  );

  const conteo = new Map<Categoria, number>();
  for (const categoria of CATEGORIAS_ORDEN) {
    conteo.set(categoria, 0);
  }

  for (const movimiento of movimientos) {
    const categoria = movimiento.productos.categoria;
    conteo.set(categoria, (conteo.get(categoria) ?? 0) + 1);
  }

  return CATEGORIAS_ORDEN.map((categoria) => ({
    categoria,
    totalMovimientos: conteo.get(categoria) ?? 0,
  }));
}

export interface PatronDiaSemana {
  dia: (typeof DIAS_SEMANA_ISO)[number];
  totalMovimientos: number;
}

export async function getPatronPorDiaSemana(
  filtros: FiltrosEstadisticas
): Promise<PatronDiaSemana[]> {
  const movimientos = await fetchMovimientos(
    filtros,
    "fecha,productos!inner(categoria)"
  );

  const conteo = new Array(7).fill(0);
  for (const movimiento of movimientos) {
    conteo[diaSemanaISO(movimiento.fecha)] += 1;
  }

  return DIAS_SEMANA_ISO.map((dia, i) => ({
    dia,
    totalMovimientos: conteo[i],
  }));
}

export interface EvolucionDia {
  fecha: string;
  entradas: number;
  salidas: number;
}

export async function getEvolucionDiaria(
  filtros: FiltrosEstadisticas
): Promise<EvolucionDia[]> {
  const movimientos = await fetchMovimientos(
    filtros,
    "fecha,tipo,productos!inner(categoria)"
  );

  const porFecha = new Map<string, { entradas: number; salidas: number }>();

  for (const movimiento of movimientos) {
    const actual = porFecha.get(movimiento.fecha) ?? {
      entradas: 0,
      salidas: 0,
    };
    if (movimiento.tipo === "entrada") actual.entradas += 1;
    if (movimiento.tipo === "salida") actual.salidas += 1;
    porFecha.set(movimiento.fecha, actual);
  }

  return rangoDeFechas(filtros.desde, filtros.hasta).map((fecha) => ({
    fecha,
    entradas: porFecha.get(fecha)?.entradas ?? 0,
    salidas: porFecha.get(fecha)?.salidas ?? 0,
  }));
}
