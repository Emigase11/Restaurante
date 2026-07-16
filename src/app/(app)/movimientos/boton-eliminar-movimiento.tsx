"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { eliminarMovimiento } from "./actions";

export function BotonEliminarMovimiento({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const confirmado = window.confirm(
      "¿Eliminar este movimiento? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    startTransition(async () => {
      const resultado = await eliminarMovimiento(id);
      if (!resultado.ok) {
        toast.error("No se pudo eliminar el movimiento", {
          description: resultado.error,
        });
        return;
      }
      toast.success("Movimiento eliminado");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={handleClick}
      aria-label="Eliminar movimiento"
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
