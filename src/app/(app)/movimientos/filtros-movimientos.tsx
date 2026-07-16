"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIAS, TIPOS_MOVIMIENTO } from "@/lib/types/database";

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ETIQUETAS_TIPO: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

interface FiltrosMovimientosProps {
  desde: string;
  hasta: string;
  categoria: string;
  tipo: string;
}

export function FiltrosMovimientos({
  desde,
  hasta,
  categoria,
  tipo,
}: FiltrosMovimientosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function actualizarParam(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(clave, valor);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="desde">Desde</Label>
        <Input
          id="desde"
          type="date"
          value={desde}
          onChange={(e) => actualizarParam("desde", e.target.value)}
          className="w-[160px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hasta">Hasta</Label>
        <Input
          id="hasta"
          type="date"
          value={hasta}
          onChange={(e) => actualizarParam("hasta", e.target.value)}
          className="w-[160px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select
          value={categoria}
          onValueChange={(valor) => actualizarParam("categoria", valor)}
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

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <Select
          value={tipo}
          onValueChange={(valor) => actualizarParam("tipo", valor)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {TIPOS_MOVIMIENTO.map((t) => (
              <SelectItem key={t} value={t}>
                {ETIQUETAS_TIPO[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
