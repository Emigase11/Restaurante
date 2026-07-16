import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TarjetaMetrica } from "../dashboard/tarjeta-metrica";
import { formatFechaCorta, hoyISO } from "@/lib/utils/date";
import type { Categoria } from "@/lib/types/database";
import { BotonExportarCSV } from "./boton-exportar-csv";
import { FiltrosRango } from "./filtros-rango";
import { GraficoCategorias } from "./grafico-categorias";
import { GraficoDias } from "./grafico-dias";
import { GraficoEvolucion } from "./grafico-evolucion";
import {
  getConsumoPorCategoria,
  getEvolucionDiaria,
  getPatronPorDiaSemana,
  getResumenPeriodo,
  getTopProductosSalida,
  type FiltrosEstadisticas,
} from "./queries";

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

interface EstadisticasPageProps {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    categoria?: string;
  }>;
}

export default async function EstadisticasPage({
  searchParams,
}: EstadisticasPageProps) {
  const params = await searchParams;

  const filtros: FiltrosEstadisticas = {
    desde: params.desde ?? format(subDays(new Date(), 29), "yyyy-MM-dd"),
    hasta: params.hasta ?? hoyISO(),
    categoria: (params.categoria as FiltrosEstadisticas["categoria"]) ?? "todas",
  };

  const [resumen, topProductos, consumoCategoria, patronDias, evolucion] =
    await Promise.all([
      getResumenPeriodo(filtros),
      getTopProductosSalida(filtros),
      getConsumoPorCategoria(filtros),
      getPatronPorDiaSemana(filtros),
      getEvolucionDiaria(filtros),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Estadísticas</h1>
          <p className="text-muted-foreground">
            Del {formatFechaCorta(filtros.desde)} al{" "}
            {formatFechaCorta(filtros.hasta)}
          </p>
        </div>
        <BotonExportarCSV filtros={filtros} />
      </div>

      <div className="sticky top-0 z-10 -mx-6 border-b bg-background px-6">
        <FiltrosRango
          desde={filtros.desde}
          hasta={filtros.hasta}
          categoria={filtros.categoria ?? "todas"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <TarjetaMetrica
          label="Total movimientos"
          valor={resumen.totalMovimientos.toLocaleString("es-AR")}
        />
        <TarjetaMetrica
          label="Entradas"
          valor={resumen.entradas.toLocaleString("es-AR")}
        />
        <TarjetaMetrica
          label="Salidas"
          valor={resumen.salidas.toLocaleString("es-AR")}
        />
        <TarjetaMetrica
          label="Productos únicos"
          valor={resumen.productosUnicos.toLocaleString("es-AR")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 productos con más salidas</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductos.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Sin datos en este período
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad total</TableHead>
                    <TableHead>Movimientos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductos.map((producto) => (
                    <TableRow key={producto.producto_id}>
                      <TableCell className="font-medium">
                        {producto.nombre}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ETIQUETAS_CATEGORIA[producto.categoria]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {producto.totalCantidad.toLocaleString("es-AR")}{" "}
                        {producto.unidad}
                      </TableCell>
                      <TableCell>
                        {producto.totalMovimientos.toLocaleString("es-AR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumo por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoCategorias datos={consumoCategoria} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución en el período</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoEvolucion datos={evolucion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patrón por día de la semana</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoDias datos={patronDias} />
        </CardContent>
      </Card>
    </div>
  );
}
