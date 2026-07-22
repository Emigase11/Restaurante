"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS, UNIDADES, type Producto, type Unidad } from "@/lib/types/database";
import { crearProducto, editarProducto } from "./actions";

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  bebidas: "Bebidas",
  comidas: "Comidas",
  cocina: "Cocina",
};

const ETIQUETAS_UNIDAD: Record<Unidad, string> = {
  unidad: "Unidad",
  kg: "Kg",
  litro: "Litro",
};

const formSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  categoria: z.enum(CATEGORIAS, { message: "Seleccioná una categoría" }),
  unidad: z.enum(UNIDADES, { message: "Seleccioná una unidad" }),
  stock_minimo: z
    .string()
    .min(1, "Ingresá un stock mínimo")
    .refine((val) => !Number.isNaN(Number(val)), "Ingresá un número válido")
    .refine((val) => Number(val) >= 0, "No puede ser negativo"),
});

type FormValues = z.infer<typeof formSchema>;

interface DialogProductoProps {
  modo: "crear" | "editar";
  producto?: Producto;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialogProducto({
  modo,
  producto,
  trigger,
  open,
  onOpenChange,
}: DialogProductoProps) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [openInterno, setOpenInterno] = useState(false);

  const controlado = open !== undefined;
  const isOpen = controlado ? open : openInterno;
  const setIsOpen = controlado ? onOpenChange! : setOpenInterno;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: producto?.nombre ?? "",
      categoria: producto?.categoria ?? "bebidas",
      unidad: producto?.unidad ?? "unidad",
      stock_minimo: producto?.stock_minimo?.toString() ?? "0",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nombre: producto?.nombre ?? "",
        categoria: producto?.categoria ?? "bebidas",
        unidad: producto?.unidad ?? "unidad",
        stock_minimo: producto?.stock_minimo?.toString() ?? "0",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const unidadSeleccionada = watch("unidad");

  async function onSubmit(values: FormValues) {
    const stockMinimo = Number(values.stock_minimo);

    if (Number.isNaN(stockMinimo)) {
      toast.error("Stock mínimo inválido");
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: values.nombre,
      categoria: values.categoria,
      unidad: values.unidad,
      stock_minimo: stockMinimo,
    };

    const resultado =
      modo === "crear"
        ? await crearProducto(payload)
        : await editarProducto(producto!.id, payload);

    setGuardando(false);

    if (!resultado.ok) {
      toast.error(
        modo === "crear" ? "No se pudo crear el producto" : "No se pudo editar el producto",
        { description: resultado.error }
      );
      return;
    }

    toast.success(modo === "crear" ? "Producto creado" : "Producto actualizado");
    setIsOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modo === "crear" ? "Nuevo producto" : "Editar producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              autoFocus
              placeholder="Ej: Coca Cola 500ml"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {ETIQUETAS_CATEGORIA[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria && (
              <p className="text-sm text-destructive">
                {errors.categoria.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Unidad</Label>
            <Controller
              control={control}
              name="unidad"
              render={({ field }) => (
                <div className="flex gap-2">
                  {UNIDADES.map((u) => {
                    const activo = field.value === u;
                    return (
                      <Button
                        key={u}
                        type="button"
                        variant={activo ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => field.onChange(u)}
                      >
                        {ETIQUETAS_UNIDAD[u]}
                      </Button>
                    );
                  })}
                </div>
              )}
            />
            {errors.unidad && (
              <p className="text-sm text-destructive">{errors.unidad.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_minimo">Stock mínimo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="stock_minimo"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                autoComplete="off"
                {...register("stock_minimo")}
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                {ETIQUETAS_UNIDAD[unidadSeleccionada]}
              </span>
            </div>
            {errors.stock_minimo && (
              <p className="text-sm text-destructive">
                {errors.stock_minimo.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Dejá en 0 si no querés recibir alertas para este producto
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={guardando}
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : modo === "crear"
                ? "Crear"
                : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
