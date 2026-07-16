"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportarMovimientos } from "./actions";
import type { FiltrosEstadisticas } from "./queries";

export function BotonExportarCSV({ filtros }: { filtros: FiltrosEstadisticas }) {
  const [exportando, setExportando] = useState(false);

  async function handleClick() {
    setExportando(true);

    try {
      const csv = await exportarMovimientos(filtros);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `movimientos_${filtros.desde}_${filtros.hasta}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo exportar el CSV");
    } finally {
      setExportando(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={exportando}>
      <Download className="size-4" />
      {exportando ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
