export type Producto = {
  id: number
  nombre: string
  precio: number
  imagen: string // Para compatibilidad con el listado
  imagenes?: string[] // Array de imágenes para el detalle
  descripcion?: string
  // # DEPRECADO: eliminar en Pasada C
  categoria?: string
  categorias?: { id: number; nombre: string }[]
  subcategorias?: string[]
  stock?: number
}
