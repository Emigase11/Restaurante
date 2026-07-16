import Link from "next/link";
import { format, subDays } from "date-fns";
import { Inbox, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatFechaCorta, formatHora, hoyISO } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Categoria, Movimiento, TipoMovimiento } from "@/lib/types/database";
import { BotonEliminarMovimiento } from "./boton-eliminar-movimiento";
import { FiltrosMovimientos } from "./filtros-movimientos";

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ESTILOS_TIPO: Record<TipoMovimiento, string> = {
  entrada: "bg-emerald-600 text-white",
  salida: "bg-red-600 text-white",
  ajuste: "bg-neutral-600 text-white",
};

const ETIQUETAS_TIPO: Record<TipoMovimiento, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

type MovimientoConProducto = Movimiento & {
  productos: {
    nombre: string;
    unidad: string;
    categoria: Categoria;
  };
};

interface MovimientosPageProps {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    categoria?: string;
    tipo?: string;
  }>;
}

export default async function MovimientosPage({
  searchParams,
}: MovimientosPageProps) {
  const params = await searchParams;

  const hoy = hoyISO();
  const desde = params.desde ?? format(subDays(new Date(), 7), "yyyy-MM-dd");
  const hasta = params.hasta ?? hoy;
  const categoria = params.categoria ?? "todas";
  const tipo = params.tipo ?? "todos";

  const supabase = await createClient();

  let query = supabase
    .from("movimientos")
    .select("*, productos!inner(nombre,unidad,categoria)")
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false })
    .limit(100);

  if (categoria !== "todas") {
    query = query.eq("productos.categoria", categoria);
  }

  if (tipo !== "todos") {
    query = query.eq("tipo", tipo);
  }

  const { data } = await query;
  const movimientos = (data as MovimientoConProducto[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Movimientos</h1>
        <Button asChild>
          <Link href="/movimientos/nuevo">
            <Plus className="size-4" />
            Nuevo movimiento
          </Link>
        </Button>
      </div>

      <FiltrosMovimientos
        desde={desde}
        hasta={hasta}
        categoria={categoria}
        tipo={tipo}
      />

      <p className="text-sm text-muted-foreground">
        Mostrando {movimientos.length} movimientos
      </p>

      {movimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No hay movimientos en este rango
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                  <TableCell>{formatHora(movimiento.hora)}</TableCell>
                  <TableCell className="font-medium">
                    {movimiento.productos.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ETIQUETAS_CATEGORIA[movimiento.productos.categoria]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(ESTILOS_TIPO[movimiento.tipo])}>
                      {ETIQUETAS_TIPO[movimiento.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {movimiento.cantidad} {movimiento.productos.unidad}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {movimiento.nota ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <BotonEliminarMovimiento id={movimiento.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

