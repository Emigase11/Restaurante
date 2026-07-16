"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS } from "@/lib/types/database";
import { hoyISO } from "@/lib/utils/date";

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ISO = "yyyy-MM-dd";

const RANGOS_RAPIDOS = [
  {
    label: "Hoy",
    calcular: () => ({ desde: hoyISO(), hasta: hoyISO() }),
  },
  {
    label: "Últimos 7 días",
    calcular: () => ({
      desde: format(subDays(new Date(), 6), ISO),
      hasta: hoyISO(),
    }),
  },
  {
    label: "Últimos 30 días",
    calcular: () => ({
      desde: format(subDays(new Date(), 29), ISO),
      hasta: hoyISO(),
    }),
  },
  {
    label: "Este mes",
    calcular: () => ({
      desde: format(startOfMonth(new Date()), ISO),
      hasta: hoyISO(),
    }),
  },
  {
    label: "Mes anterior",
    calcular: () => {
      const mesAnterior = subMonths(new Date(), 1);
      return {
        desde: format(startOfMonth(mesAnterior), ISO),
        hasta: format(endOfMonth(mesAnterior), ISO),
      };
    },
  },
];

interface FiltrosRangoProps {
  desde: string;
  hasta: string;
  categoria: string;
}

export function FiltrosRango({ desde, hasta, categoria }: FiltrosRangoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function aplicar(params: Record<string, string>) {
    const nuevos = new URLSearchParams(searchParams.toString());
    for (const [clave, valor] of Object.entries(params)) {
      nuevos.set(clave, valor);
    }
    router.push(`${pathname}?${nuevos.toString()}`);
    router.refresh();
  }

  function actualizarRango(desdeNueva: string, hastaNueva: string) {
    if (desdeNueva > hastaNueva) {
      toast.error("Rango de fechas inválido", {
        description: "La fecha \"desde\" no puede ser posterior a \"hasta\"",
      });
      return;
    }
    aplicar({ desde: desdeNueva, hasta: hastaNueva });
  }

  return (
    <div className="flex flex-wrap items-end gap-4 py-4">
      <div className="flex flex-wrap gap-2">
        {RANGOS_RAPIDOS.map((rango) => (
          <Button
            key={rango.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const { desde: d, hasta: h } = rango.calcular();
              actualizarRango(d, h);
            }}
          >
            {rango.label}
          </Button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="desde">Desde</Label>
          <Input
            id="desde"
            type="date"
            value={desde}
            onChange={(e) => actualizarRango(e.target.value, hasta)}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hasta">Hasta</Label>
          <Input
            id="hasta"
            type="date"
            value={hasta}
            onChange={(e) => actualizarRango(desde, e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select
            value={categoria}
            onValueChange={(valor) => aplicar({ categoria: valor })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {ETIQUETAS_CATEGORIA[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
