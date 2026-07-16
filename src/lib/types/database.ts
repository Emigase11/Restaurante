export const CATEGORIAS = ["bebidas", "comidas", "cocina"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const UNIDADES = ["unidad", "kg", "litro"] as const;
export type Unidad = (typeof UNIDADES)[number];

export const TIPOS_MOVIMIENTO = ["entrada", "salida", "ajuste"] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export interface Producto {
  id: string;
  nombre: string;
  categoria: Categoria;
  unidad: Unidad;
  stock_minimo: number;
  activo: boolean;
  created_at: string;
}

export interface Movimiento {
  id: string;
  producto_id: string;
  fecha: string;
  hora: string;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string | null;
  created_at: string;
}

export interface StockActual extends Producto {
  stock: number;
}
