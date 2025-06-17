"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Producto } from "../types/Producto"
import { CardComponent } from "../components/Card"
import { SkeletonCard } from "../components/SkeletonCard"
import { SlidersHorizontal, Gamepad2, ChevronDown } from "lucide-react"

export const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState("light")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)


  const [searchParams] = useSearchParams()

  useEffect(() => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setTheme(document.documentElement.getAttribute("data-theme") || "light")
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchProductos = async (page = 1) => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/listar?page=${page}`)
        if (!response.ok) {
          throw new Error("Error al obtener productos")
        }

        const data = await response.json()
        setProductos(data.data)
        setMeta(data.meta)
        setCurrentPage(data.meta.current_page)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }


    fetchProductos(currentPage)
  }, [currentPage])

  const filteredAndSortedProducts = productos
    .filter((producto) => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice =
        priceRange[1] === 100
          ? producto.precio >= priceRange[0]
          : producto.precio >= priceRange[0] && producto.precio <= priceRange[1]
      return matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.precio - b.precio
        case "price-high":
          return b.precio - a.precio
        case "name":
        default:
          return a.nombre.localeCompare(b.nombre)
      }
    })

  const isXbox = theme === "light"

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-16 flex items-center justify-center">
        <div className="text-center animate-fade-in-scale">
          <div
            className={`w-16 h-16 rounded-full ${isXbox ? "bg-red-100" : "bg-red-900/20"} flex items-center justify-center mb-4 mx-auto`}
          >
            <span className="text-2xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Oops! Algo salió mal</h2>
          <p className="text-[var(--color-foreground)]/70 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16">
      {/* Header */}
      <div
        className={`w-full py-12 px-4 ${
          isXbox ? "bg-gradient-to-br from-green-500 to-green-700" : "bg-gradient-to-br from-blue-500 to-blue-700"
        }`}
      >
        <div className="max-w-screen-xl mx-auto animate-fade-in-up">
          <div className="flex items-center mb-4">
            <Gamepad2 className="mr-3 text-white" size={100} />
            <div>
              <h1 className="game-title text-4xl md:text-5xl text-white mb-2">Catálogo</h1>
              <p className="text-white/90 text-lg">Consolas legendarias, juegos eternos. Memory Card no incluida.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="card p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input pr-10 appearance-none cursor-pointer"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            

            {/* Filters Toggle */}
            <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex text-center items-center">
              <SlidersHorizontal size={20} className="mr-2" />
              Filtros
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-[var(--color-border)] animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Rango de precio</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                        className="input w-20 text-sm"
                        min="0"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100])}
                        className="input w-20 text-sm"
                        min="0"
                      />
                    </div>
                    <button
                      onClick={() => setPriceRange([0, 100])}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <p className="text-[var(--color-foreground)]/70">
            {loading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mr-2"></div>
                Cargando productos...
              </span>
            ) : (
              `Mostrando ${filteredAndSortedProducts.length} de ${productos.length} productos`
            )}
          </p>

        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div
            className={`grid ${
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            } gap-6`}
          >
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-scale">
            <div
              className={`w-24 h-24 rounded-full ${
                isXbox ? "bg-gray-100" : "bg-gray-800"
              } flex items-center justify-center mb-6 mx-auto`}
            >
              <Gamepad2 size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No se encontraron juegos</h3>
            <p className="text-[var(--color-foreground)]/70 mb-6 max-w-md mx-auto">
              No hay productos que coincidan con tu búsqueda. Intenta con otros términos o ajusta los filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setPriceRange([0, 100])
              }}
              className="btn-primary"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 animate-fade-in-up ${
               "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {filteredAndSortedProducts.map((producto, index) => (
              <div key={producto.id} className="animate-fade-in-scale" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardComponent
                  imgSrc={producto.imagen}
                  imgAlt={producto.nombre}
                  title={producto.nombre}
                  producto_id={producto.id}
                  price={producto.precio}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            {meta.links.map((link: any, index: number) => {
              if (link.label === "&laquo; Anterior" || link.label === "Siguiente &raquo;") {
                return (
                  <button
                    key={index}
                    disabled={!link.url}
                    onClick={() => link.url && setCurrentPage(new URL(link.url).searchParams.get("page") as unknown as number)}
                    className={`btn-secondary px-3 py-1 ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {link.label.includes("Anterior") ? "<" : ">"}
                  </button>
                )
              } else {
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(Number(link.label))}
                    className={`btn-secondary px-3 py-1 ${link.active ? "bg-[var(--color-primary)] text-white" : ""}`}
                  >
                    {link.label}
                  </button>
                )
              }
            })}
          </div>
        )}

      </div>
    </div>
  )
}