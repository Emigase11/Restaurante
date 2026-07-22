"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { alternarActivoProducto } from "./actions";

export function BotonToggleActivo({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);

  async function ejecutar(nuevoActivo: boolean) {
    setProcesando(true);
    const resultado = await alternarActivoProducto(id, nuevoActivo);
    setProcesando(false);

    if (!resultado.ok) {
      toast.error("No se pudo actualizar el producto", {
        description: resultado.error,
      });
      return;
    }

    toast.success(nuevoActivo ? "Producto activado" : "Producto desactivado");
    setConfirmOpen(false);
    router.refresh();
  }

  function handleSelect(event: Event) {
    event.preventDefault();
    if (activo) {
      setConfirmOpen(true);
    } else {
      ejecutar(true);
    }
  }

  return (
    <>
      <DropdownMenuItem onSelect={handleSelect}>
        {activo ? "Desactivar" : "Activar"}
      </DropdownMenuItem>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar producto</DialogTitle>
            <DialogDescription>
              El producto no aparecerá para cargar movimientos, pero los
              movimientos históricos se conservan. Podés reactivarlo en
              cualquier momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={procesando}
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={procesando}
              onClick={() => ejecutar(false)}
            >
              {procesando ? "Desactivando..." : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
