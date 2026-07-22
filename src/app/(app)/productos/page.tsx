import { Plus } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { Categoria, StockActual } from "@/lib/types/database";
import { AccionesProducto } from "./acciones-producto";
import { DialogProducto } from "./dialog-producto";
import { FiltrosProductos } from "./filtros-productos";

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ESTILOS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "bg-blue-50 text-blue-700",
  comidas: "bg-amber-50 text-amber-700",
  cocina: "bg-emerald-50 text-emerald-700",
};

const MENSAJES_VACIO: Record<string, string> = {
  activos: "No hay productos activos",
  bajo: "No hay productos con stock bajo",
  inactivos: "No hay productos inactivos",
  todos: "No se encontraron productos",
};

interface ProductosPageProps {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    filtro?: string;
  }>;
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;

  const q = params.q ?? "";
  const categoria = params.categoria ?? "todas";
  const filtro = params.filtro ?? "activos";

  const supabase = await createClient();

  const [{ count: totalActivos }, { count: totalInactivos }] =
    await Promise.all([
      supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("activo", true),
      supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("activo", false),
    ]);

  let query = supabase
    .from("stock_actual")
    .select("*")
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  if (q) {
    query = query.ilike("nombre", `%${q}%`);
  }

  if (categoria !== "todas") {
    query = query.eq("categoria", categoria);
  }

  if (filtro === "activos") {
    query = query.eq("activo", true);
  } else if (filtro === "inactivos") {
    query = query.eq("activo", false);
  }

  const { data } = await query;
  let productos = (data as StockActual[] | null) ?? [];

  if (filtro === "bajo") {
    productos = productos.filter(
      (p) => p.stock_minimo > 0 && p.stock <= p.stock_minimo
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-muted-foreground">
            {(totalActivos ?? 0).toLocaleString("es-AR")} activos,{" "}
            {(totalInactivos ?? 0).toLocaleString("es-AR")} inactivos
          </p>
        </div>
        <DialogProducto
          modo="crear"
          trigger={
            <Button type="button">
              <Plus className="size-4" />
              Nuevo producto
            </Button>
          }
        />
      </div>

      <FiltrosProductos q={q} categoria={categoria} filtro={filtro} />

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            {MENSAJES_VACIO[filtro] ?? MENSAJES_VACIO.todos}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Stock actual</TableHead>
                <TableHead>Stock mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => {
                const sinStock = producto.stock <= 0;
                const stockBajo =
                  !sinStock &&
                  producto.stock_minimo > 0 &&
                  producto.stock <= producto.stock_minimo;

                return (
                  <TableRow
                    key={producto.id}
                    className={cn(!producto.activo && "opacity-60")}
                  >
                    <TableCell className="font-medium">
                      {producto.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent",
                          ESTILOS_CATEGORIA[producto.categoria]
                        )}
                      >
                        {ETIQUETAS_CATEGORIA[producto.categoria]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {producto.unidad}
                    </TableCell>
                    <TableCell
                      className={cn(
                        sinStock
                          ? "text-red-600"
                          : stockBajo
                          ? "text-amber-600"
                          : "text-foreground"
                      )}
                    >
                      {producto.stock.toLocaleString("es-AR")}{" "}
                      {producto.unidad}
                    </TableCell>
                    <TableCell>
                      {producto.stock_minimo === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        `${producto.stock_minimo.toLocaleString("es-AR")} ${producto.unidad}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          producto.activo
                            ? "bg-green-600 text-white"
                            : "bg-neutral-400 text-white"
                        )}
                      >
                        {producto.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AccionesProducto producto={producto} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
