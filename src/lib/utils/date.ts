import { format } from "date-fns";
import { es } from "date-fns/locale";

function parseFechaISO(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatFechaCorta(fecha: string): string {
  return format(parseFechaISO(fecha), "dd/MM/yyyy", { locale: es });
}

export function formatFechaLarga(fecha: string): string {
  return format(parseFechaISO(fecha), "EEEE d 'de' MMMM", { locale: es });
}

export function formatHora(hora: string): string {
  return hora.slice(0, 5);
}

export function hoyISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function ahoraISO(): string {
  return format(new Date(), "HH:mm");
}
