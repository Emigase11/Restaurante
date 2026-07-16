import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/utils/date";

export default async function DashboardPage() {
  const supabase = await createClient();
  const hoy = hoyISO();

  const [{ count: movimientosHoy }, { count: totalProductos }] =
    await Promise.all([
      supabase
        .from("movimientos")
        .select("*", { count: "exact", head: true })
        .eq("fecha", hoy),
      supabase.from("productos").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Movimientos cargados hoy: {movimientosHoy ?? 0}
      </p>
      <p className="text-muted-foreground">
        Total de productos: {totalProductos ?? 0}
      </p>
    </div>
  );
}
