"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TIPOS_MOVIMIENTO } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

const crearMovimientoSchema = z.object({
  producto_id: z.string().uuid("Seleccioná un producto"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora: z.string().min(1, "La hora es obligatoria"),
  tipo: z.enum(TIPOS_MOVIMIENTO),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  nota: z.string().max(500, "La nota no puede superar los 500 caracteres").optional(),
});

export type CrearMovimientoInput = z.infer<typeof crearMovimientoSchema>;

type ActionResult = { ok: true } | { ok: false; error: string };

export async function crearMovimiento(
  data: CrearMovimientoInput
): Promise<ActionResult> {
  const parsed = crearMovimientoSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("movimientos").insert({
    producto_id: parsed.data.producto_id,
    fecha: parsed.data.fecha,
    hora: parsed.data.hora,
    tipo: parsed.data.tipo,
    cantidad: parsed.data.cantidad,
    nota: parsed.data.nota || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/movimientos");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function eliminarMovimiento(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("movimientos").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/movimientos");
  revalidatePath("/dashboard");

  return { ok: true };
}
