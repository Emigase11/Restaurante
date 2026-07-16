import { cn } from "@/lib/utils";

type Tono = "neutral" | "warning" | "danger" | "success";

const ESTILOS_TONO: Record<Tono, string> = {
  neutral: "bg-muted border-border",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  danger: "bg-red-50 border-red-200 text-red-900",
  success: "bg-green-50 border-green-200 text-green-900",
};

interface TarjetaMetricaProps {
  label: string;
  valor: string | number;
  tono?: Tono;
}

export function TarjetaMetrica({
  label,
  valor,
  tono = "neutral",
}: TarjetaMetricaProps) {
  return (
    <div
      className={cn("rounded-lg border p-4", ESTILOS_TONO[tono])}
      style={{ borderWidth: "0.5px" }}
    >
      <p
        className={cn(
          "text-sm",
          tono === "neutral" ? "text-muted-foreground" : "opacity-80"
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-3xl font-medium">{valor}</p>
    </div>
  );
}
