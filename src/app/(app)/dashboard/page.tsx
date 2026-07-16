import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFechaLarga, formatHora, hoyISO } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Categoria, StockActual, TipoMovimiento } from "@/lib/types/database";
import { GraficoConsumo } from "./grafico-consumo";
import { TarjetaMetrica } from "./tarjeta-metrica";
import {
  getConsumoUltimos7Dias,
  getMovimientosHoy,
  getResumenStock,
  getTopProductosSemana,
  getUltimosMovimientos,
} from "./queries";

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

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function ItemAlerta({ producto }: { producto: StockActual }) {
  const sinStock = producto.stock <= 0;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{producto.nombre}</p>
        <p className="text-xs text-muted-foreground">
          {ETIQUETAS_CATEGORIA[producto.categoria]}
        </p>
      </div>
      <Badge
        className={cn(
          sinStock
            ? "bg-red-600 text-white"
            : "bg-amber-500 text-white"
        )}
      >
        {producto.stock.toLocaleString("es-AR")} {producto.unidad}
      </Badge>
    </div>
  );
}

export default async function DashboardPage() {
  const [resumenStock, movimientosHoy, consumoSemana, topProductos, ultimosMovimientos] =
    await Promise.all([
      getResumenStock(),
      getMovimientosHoy(),
      getConsumoUltimos7Dias(),
      getTopProductosSemana(),
      getUltimosMovimientos(6),
    ]);

  const alertas = [...resumenStock.sinStock, ...resumenStock.stockBajo].slice(
    0,
    10
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {capitalizar(formatFechaLarga(hoyISO()))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <TarjetaMetrica
          label="Productos activos"
          valor={resumenStock.totalProductos.toLocaleString("es-AR")}
        />
        <TarjetaMetrica
          label="Movimientos hoy"
          valor={movimientosHoy.total.toLocaleString("es-AR")}
        />
        <TarjetaMetrica
          label="Stock bajo"
          valor={resumenStock.stockBajo.length.toLocaleString("es-AR")}
          tono={resumenStock.stockBajo.length > 0 ? "warning" : "neutral"}
        />
        <TarjetaMetrica
          label="Sin stock"
          valor={resumenStock.sinStock.length.toLocaleString("es-AR")}
          tono={resumenStock.sinStock.length > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Alertas de stock</CardTitle>
            <Link
              href="/productos?filtro=bajo"
              className="text-sm text-muted-foreground hover:underline"
            >
              Ver todo
            </Link>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <CheckCircle2 className="size-8 text-green-600" />
                <p className="text-muted-foreground">
                  Todo el stock está en orden
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {alertas.map((producto) => (
                  <ItemAlerta key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Últimos movimientos</CardTitle>
            <Link
              href="/movimientos"
              className="text-sm text-muted-foreground hover:underline"
            >
              Ver todo
            </Link>
          </CardHeader>
          <CardContent>
            {ultimosMovimientos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay movimientos cargados
              </p>
            ) : (
              <div className="divide-y">
                {ultimosMovimientos.map((movimiento) => (
                  <div
                    key={movimiento.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {movimiento.producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatHora(movimiento.hora)} ·{" "}
                        {movimiento.cantidad.toLocaleString("es-AR")}{" "}
                        {movimiento.producto.unidad}
                      </p>
                    </div>
                    <Badge className={ESTILOS_TIPO[movimiento.tipo]}>
                      {ETIQUETAS_TIPO[movimiento.tipo]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>Consumo de la semana</CardTitle>
            <p className="text-sm text-muted-foreground">
              Movimientos de salida por día
            </p>
          </div>
          {topProductos.length > 0 && (
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Más movidos
              </p>
              <div className="mt-1 space-y-0.5">
                {topProductos.map((producto) => (
                  <p key={producto.nombre} className="text-xs">
                    {producto.nombre}{" "}
                    <span className="text-muted-foreground">
                      ({producto.totalMovimientos.toLocaleString("es-AR")})
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <GraficoConsumo datos={consumoSemana} />
        </CardContent>
      </Card>
    </div>
  );
}
