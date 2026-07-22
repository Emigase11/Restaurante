"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIAS } from "@/lib/types/database";

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const FILTROS = [
  { value: "activos", label: "Activos" },
  { value: "bajo", label: "Stock bajo" },
  { value: "inactivos", label: "Inactivos" },
  { value: "todos", label: "Todos" },
];

interface FiltrosProductosProps {
  q: string;
  categoria: string;
  filtro: string;
}

export function FiltrosProductos({ q, categoria, filtro }: FiltrosProductosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function actualizarParam(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(clave, valor);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  useEffect(() => {
    setBusqueda(q);
  }, [q]);

  function handleBusquedaChange(valor: string) {
    setBusqueda(valor);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      actualizarParam("q", valor);
    }, 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tabs value={filtro} onValueChange={(valor) => actualizarParam("filtro", valor)}>
        <TabsList>
          {FILTROS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          className="pl-8"
          value={busqueda}
          onChange={(e) => handleBusquedaChange(e.target.value)}
        />
      </div>

      <Select
        value={categoria}
        onValueChange={(valor) => actualizarParam("categoria", valor)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas las categorías</SelectItem>
          {CATEGORIAS.map((c) => (
            <SelectItem key={c} value={c}>
              {ETIQUETAS_CATEGORIA[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
