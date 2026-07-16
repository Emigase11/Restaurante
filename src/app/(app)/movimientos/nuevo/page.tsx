import { createClient } from "@/lib/supabase/server";
import type { Producto } from "@/lib/types/database";
import { FormularioMovimiento } from "./formulario-movimiento";

export default async function NuevoMovimientoPage() {
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  return (
    <div className="mx-auto max-w-xl">
      <FormularioMovimiento productos={(productos as Producto[]) ?? []} />
    </div>
  );
}
