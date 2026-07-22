"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIAS, UNIDADES } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

const productoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  categoria: z.enum(CATEGORIAS, { message: "Seleccioná una categoría" }),
  unidad: z.enum(UNIDADES, { message: "Seleccioná una unidad" }),
  stock_minimo: z
    .number({ message: "Ingresá un stock mínimo" })
    .min(0, "El stock mínimo no puede ser negativo"),
});

export type ProductoInput = z.infer<typeof productoSchema>;

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function nombreYaExiste(nombre: string, excluirId?: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("productos")
    .select("id,nombre")
    .eq("activo", true);

  const productos = (data as { id: string; nombre: string }[] | null) ?? [];
  const nombreNormalizado = nombre.trim().toLowerCase();

  return productos.some(
    (p) =>
      p.nombre.trim().toLowerCase() === nombreNormalizado &&
      p.id !== excluirId
  );
}

export async function crearProducto(data: ProductoInput): Promise<ActionResult> {
  const parsed = productoSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (await nombreYaExiste(parsed.data.nombre)) {
    return { ok: false, error: "Ya existe un producto activo con ese nombre" };
  }

  const supabase = await createClient();

  const { data: creado, error } = await supabase
    .from("productos")
    .insert({
      nombre: parsed.data.nombre,
      categoria: parsed.data.categoria,
      unidad: parsed.data.unidad,
      stock_minimo: parsed.data.stock_minimo,
      activo: true,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/dashboard");

  return { ok: true, id: creado?.id };
}

export async function editarProducto(
  id: string,
  data: ProductoInput
): Promise<ActionResult> {
  const parsed = productoSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (await nombreYaExiste(parsed.data.nombre, id)) {
    return { ok: false, error: "Ya existe un producto activo con ese nombre" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: parsed.data.nombre,
      categoria: parsed.data.categoria,
      unidad: parsed.data.unidad,
      stock_minimo: parsed.data.stock_minimo,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function alternarActivoProducto(
  id: string,
  activo: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .update({ activo })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/dashboard");
  revalidatePath("/movimientos/nuevo");

  return { ok: true };
}
