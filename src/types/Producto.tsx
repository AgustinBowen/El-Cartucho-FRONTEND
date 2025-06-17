export type Producto = {
  id: number
  nombre: string
  precio: number
  imagen: string // Para compatibilidad con el listado
  imagenes?: string[] // Array de imágenes para el detalle
  descripcion?: string
  categoria?: string
  subcategorias?: string[]
  stock?: number
}
