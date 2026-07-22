"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Producto } from "@/lib/types/database";
import { BotonToggleActivo } from "./boton-toggle-activo";
import { DialogProducto } from "./dialog-producto";

export function AccionesProducto({ producto }: { producto: Producto }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Acciones">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setEditOpen(true);
            }}
          >
            Editar
          </DropdownMenuItem>
          <BotonToggleActivo id={producto.id} activo={producto.activo} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogProducto
        modo="editar"
        producto={producto}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
