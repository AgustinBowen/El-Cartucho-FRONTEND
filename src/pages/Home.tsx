"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Producto } from "@/types/producto"

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])

  useEffect(() => {
    const fetchProductos = async () => {
      const response = await fetch('/ed/producto/listar')
      const json = await response.json()
      const productos: Producto[] = json.data
      setProductos(productos)
    }

    fetchProductos()
  }, [])
  
  console.log('API URL:', import.meta.env.VITE_API_URL)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">Tienda</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Encuentra los mejores objetos para tu aventura</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <Card key={producto.id} className="h-full border border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-8 h-full flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{producto.nombre}</h3>

                <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-cover mb-4 rounded-md" />

                <p className="text-gray-700 text-lg font-semibold mb-4">${producto.precio}</p>

                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Agregar al carrito</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">© 2024 Tienda de Aventureros</p>
        </div>
      </div>
    </div>
  )
}
