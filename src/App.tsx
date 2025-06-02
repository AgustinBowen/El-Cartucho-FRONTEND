"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ===== TIPOS =====
type Producto = {
  id: number
  nombre: string
  descripcion: string
  precioUnitario: number
  stock: number
  categoria: string
}

type PlayerStats = {
  souls: number
  level: number
}

// ===== DATOS MOCK =====
const mockProductos: Producto[] = [
  {
    id: 1,
    nombre: "Espada del Caballero Negro",
    descripcion: "Una espada forjada en las llamas del abismo.",
    precioUnitario: 15000,
    stock: 1,
    categoria: "ARMAS"
  },
  {
    id: 2,
    nombre: "Armadura de Havel",
    descripcion: "Armadura tallada en roca sólida.",
    precioUnitario: 25000,
    stock: 1,
    categoria: "ARMADURAS"
  },
  {
    id: 3,
    nombre: "Anillo del Favor",
    descripcion: "Aumenta la salud y resistencia.",
    precioUnitario: 8000,
    stock: 2,
    categoria: "ANILLOS"
  },
  {
    id: 4,
    nombre: "Estus Flask +10",
    descripcion: "Frasco que restaura la salud completamente.",
    precioUnitario: 5000,
    stock: 5,
    categoria: "CONSUMIBLES"
  },
  {
    id: 5,
    nombre: "Lanza del Dragón",
    descripcion: "Lanza forjada con escamas de dragón.",
    precioUnitario: 18000,
    stock: 1,
    categoria: "ARMAS"
  },
  {
    id: 6,
    nombre: "Escudo de Artorias",
    descripcion: "Escudo del legendario Caballero Abismal.",
    precioUnitario: 12000,
    stock: 1,
    categoria: "ESCUDOS"
  },
  {
    id: 7,
    nombre: "Catalizador de Logan",
    descripcion: "Bastón mágico que amplifica la magia.",
    precioUnitario: 10000,
    stock: 1,
    categoria: "CATALIZADORES"
  },
  {
    id: 8,
    nombre: "Armadura de Caballero",
    descripcion: "Armadura de acero templado.",
    precioUnitario: 7500,
    stock: 3,
    categoria: "ARMADURAS"
  },
  {
    id: 9,
    nombre: "Anillo de Sacrificio",
    descripcion: "Evita la pérdida de almas al morir.",
    precioUnitario: 3000,
    stock: 4,
    categoria: "ANILLOS"
  },
  {
    id: 10,
    nombre: "Titanita Slab",
    descripcion: "Material de mejora supremo.",
    precioUnitario: 20000,
    stock: 2,
    categoria: "MATERIALES"
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 11,
    nombre: `Objeto ${i + 1}`,
    descripcion: "Un objeto útil para aventureros.",
    precioUnitario: Math.floor(Math.random() * 15000) + 1000,
    stock: Math.floor(Math.random() * 5) + 1,
    categoria: "VARIOS"
  })),
]

const playerStats: PlayerStats = {
  souls: 156789,
  level: 87,
}

// ===== COMPONENTE PRINCIPAL =====
export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">Tienda</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Encuentra los mejores objetos para tu aventura</p>
        </div>

        {/* Player Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-sm mb-12">
          <div className="text-center">
            <div className="text-2xl font-medium text-gray-900">{playerStats.souls.toLocaleString()}</div>
            <div className="text-gray-500">Almas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-gray-900">{playerStats.level}</div>
            <div className="text-gray-500">Nivel</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-gray-900">99</div>
            <div className="text-gray-500">Humanidad</div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProductos.map((producto) => {

            return (
              <Card key={producto.id} className="h-full border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header */}

                  {/* Item name */}
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{producto.nombre}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">{producto.descripcion}</p>

                  {/* Category */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{producto.categoria}</span>
                  </div>

                  {/* Price and stock */}
                  <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        {producto.precioUnitario.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">almas</span>
                    </div>
                    <div className="text-sm text-gray-500">Stock: {producto.stock}</div>
                  </div>

                  {/* Action button */}
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Comprar</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">© 2024 Tienda de Aventureros</p>
        </div>
      </div>
    </div>
  )
}
