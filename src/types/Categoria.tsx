import type { Subcategoria } from "./Subcategoria"

export interface Categoria {
  id: number
  nombre: string
  subcategorias: Subcategoria[]
}
