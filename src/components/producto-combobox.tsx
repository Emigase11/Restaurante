"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/types/database";

const ETIQUETAS_CATEGORIA: Record<Producto["categoria"], string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

interface ProductoComboboxProps {
  productos: Producto[];
  value?: string;
  onValueChange: (value: string) => void;
}

export const ProductoCombobox = React.forwardRef<
  HTMLButtonElement,
  ProductoComboboxProps
>(function ProductoCombobox({ productos, value, onValueChange }, ref) {
  const [open, setOpen] = React.useState(false);

  const productoSeleccionado = productos.find((p) => p.id === value);

  const productosPorCategoria = React.useMemo(() => {
    const grupos = new Map<Producto["categoria"], Producto[]>();
    for (const producto of productos) {
      const lista = grupos.get(producto.categoria) ?? [];
      lista.push(producto);
      grupos.set(producto.categoria, lista);
    }
    return grupos;
  }, [productos]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {productoSeleccionado ? (
            <span>
              {productoSeleccionado.nombre}{" "}
              <span className="text-muted-foreground">
                ({productoSeleccionado.unidad})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Buscar producto...
            </span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command
          filter={(value, search) => {
            const producto = productos.find((p) => p.id === value);
            if (!producto) return 0;
            return normalizar(producto.nombre).includes(normalizar(search))
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder="Buscar producto..." />
          <CommandList>
            <CommandEmpty>No se encontraron productos.</CommandEmpty>
            {Array.from(productosPorCategoria.entries()).map(
              ([categoria, items]) => (
                <CommandGroup
                  key={categoria}
                  heading={ETIQUETAS_CATEGORIA[categoria].toUpperCase()}
                >
                  {items.map((producto) => (
                    <CommandItem
                      key={producto.id}
                      value={producto.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value === producto.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {producto.nombre}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {producto.unidad}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
