"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductoCombobox } from "@/components/producto-combobox";
import { ahoraISO, hoyISO } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { TIPOS_MOVIMIENTO, type Producto, type TipoMovimiento } from "@/lib/types/database";
import { crearMovimiento } from "../actions";

const formSchema = z.object({
  producto_id: z.string().uuid("Seleccioná un producto"),
  tipo: z.enum(TIPOS_MOVIMIENTO, { message: "Seleccioná un tipo" }),
  cantidad: z
    .string()
    .min(1, "Ingresá una cantidad")
    .refine((val) => !Number.isNaN(Number(val)), "Ingresá una cantidad válida")
    .refine((val) => Number(val) > 0, "La cantidad debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().min(1, "La hora es obligatoria"),
  nota: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TIPO_OPTIONS: {
  value: TipoMovimiento;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "entrada",
    label: "Entrada",
    activeClass: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600/90",
  },
  {
    value: "salida",
    label: "Salida",
    activeClass: "bg-red-600 text-white border-red-600 hover:bg-red-600/90",
  },
  {
    value: "ajuste",
    label: "Ajuste",
    activeClass: "bg-neutral-600 text-white border-neutral-600 hover:bg-neutral-600/90",
  },
];

export function FormularioMovimiento({
  productos,
}: {
  productos: Producto[];
}) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const comboboxRef = useRef<HTMLButtonElement>(null);

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
      producto_id: "",
      tipo: "entrada",
      cantidad: "",
      fecha: hoyISO(),
      hora: ahoraISO(),
      nota: "",
    },
  });

  useEffect(() => {
    comboboxRef.current?.focus();
  }, []);

  const productoIdSeleccionado = watch("producto_id");
  const productoSeleccionado = productos.find(
    (p) => p.id === productoIdSeleccionado
  );

  async function guardar(values: FormValues, seguirCargando: boolean) {
    const cantidad = Number(values.cantidad);

    if (Number.isNaN(cantidad)) {
      toast.error("Cantidad inválida");
      return;
    }

    setGuardando(true);

    const resultado = await crearMovimiento({
      producto_id: values.producto_id,
      fecha: values.fecha,
      hora: values.hora,
      tipo: values.tipo,
      cantidad,
      nota: values.nota,
    });

    setGuardando(false);

    if (!resultado.ok) {
      toast.error("No se pudo guardar el movimiento", {
        description: resultado.error,
      });
      return;
    }

    toast.success("Movimiento guardado");

    if (seguirCargando) {
      reset({
        producto_id: "",
        tipo: values.tipo,
        cantidad: "",
        fecha: values.fecha,
        hora: values.hora,
        nota: values.nota,
      });
      comboboxRef.current?.focus();
      return;
    }

    router.push("/movimientos");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar movimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5">
          <div className="space-y-2">
            <Label>Producto</Label>
            <Controller
              control={control}
              name="producto_id"
              render={({ field }) => (
                <ProductoCombobox
                  ref={comboboxRef}
                  productos={productos}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors.producto_id && (
              <p className="text-sm text-destructive">
                {errors.producto_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <div className="flex gap-2">
                  {TIPO_OPTIONS.map((opcion) => {
                    const activo = field.value === opcion.value;
                    return (
                      <Button
                        key={opcion.value}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1",
                          activo && opcion.activeClass
                        )}
                        onClick={() => field.onChange(opcion.value)}
                      >
                        {opcion.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            />
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cantidad"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                autoComplete="off"
                placeholder="0"
                {...register("cantidad")}
              />
              {productoSeleccionado && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {productoSeleccionado.unidad}
                </span>
              )}
            </div>
            {errors.cantidad && (
              <p className="text-sm text-destructive">
                {errors.cantidad.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" {...register("fecha")} />
              {errors.fecha && (
                <p className="text-sm text-destructive">
                  {errors.fecha.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" {...register("hora")} />
              {errors.hora && (
                <p className="text-sm text-destructive">
                  {errors.hora.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota">Nota</Label>
            <Textarea
              id="nota"
              placeholder="Ej: reposición del proveedor X"
              {...register("nota")}
            />
            {errors.nota && (
              <p className="text-sm text-destructive">{errors.nota.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={guardando}
              onClick={handleSubmit((values) => guardar(values, true))}
            >
              Guardar y seguir cargando
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={guardando}
              onClick={handleSubmit((values) => guardar(values, false))}
            >
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
