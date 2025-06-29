"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Producto } from "../types/Producto"
import type { Categoria } from "../types/Categoria"
import { CardComponent } from "../components/Card"
import { SkeletonCard } from "../components/SkeletonCard"
import { SlidersHorizontal, Gamepad2, ChevronDown, X, Filter } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingCategorias, setLoadingCategorias] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { isXbox } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null)
  const [selectedSubcategorias, setSelectedSubcategorias] = useState<number[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  const [searchParams] = useSearchParams()

  // Imagen de fondo única
  const backgroundImage = isXbox
    ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
    : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

  // Precargar imagen de fondo
  useEffect(() => {
    const img = new Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = backgroundImage
  }, [backgroundImage])

  // Efecto para controlar el scroll del body cuando se abren los filtros móviles
  useEffect(() => {
    if (showMobileFilters) {
      // Bloquear scroll del body
      document.body.style.overflow = "hidden"
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = "unset"
    }

    // Cleanup function para restaurar el scroll cuando el componente se desmonte
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showMobileFilters])

  useEffect(() => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  // Fetch categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/categorias`)
        if (!response.ok) {
          throw new Error("Error al obtener categorías")
        }

        const data = await response.json()
        setCategorias(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error("Error fetching categorias:", err.message)
        setCategorias([]) // Asegurar que siempre sea un array
      } finally {
        setLoadingCategorias(false)
      }
    }

    fetchCategorias()
  }, [])

  // Fetch productos con filtros
  useEffect(() => {
    const fetchProductos = async (page = 1) => {
      try {
        setLoading(true)

        // Construir URL con filtros
        const params = new URLSearchParams()
        params.append("page", page.toString())

        if (selectedCategoria) {
          params.append("categoria_id", selectedCategoria.toString())
        }

        if (selectedSubcategorias.length > 0) {
          selectedSubcategorias.forEach((subcatId) => {
            params.append("subcategorias[]", subcatId.toString())
          })
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/listar?${params.toString()}`)
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
  }, [currentPage, selectedCategoria, selectedSubcategorias])

  // Manejar cambio de categoría
  const handleCategoriaChange = (categoriaId: number | null) => {
    setSelectedCategoria(categoriaId)
    setSelectedSubcategorias([]) // Limpiar subcategorías cuando cambia la categoría
    setCurrentPage(1) // Resetear a la primera página
  }

  // Manejar cambio de subcategoría
  const handleSubcategoriaChange = (subcategoriaId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubcategorias((prev) => [...prev, subcategoriaId])
    } else {
      setSelectedSubcategorias((prev) => prev.filter((id) => id !== subcategoriaId))
    }
    setCurrentPage(1) // Resetear a la primera página
  }

  // Obtener subcategorías de la categoría seleccionada
  const getSubcategorias = () => {
    if (!selectedCategoria) return []
    const categoria = categorias.find((cat) => cat.id === selectedCategoria)
    return categoria?.subcategorias || []
  }

  const filteredAndSortedProducts = productos
    .filter((producto) => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const precio = typeof producto.precio === "string" ? Number.parseFloat(producto.precio) : producto.precio
      const matchesPrice =
        priceRange[1] === 100 ? precio >= priceRange[0] : precio >= priceRange[0] && precio <= priceRange[1]
      return matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      const precioA = typeof a.precio === "string" ? Number.parseFloat(a.precio) : a.precio
      const precioB = typeof b.precio === "string" ? Number.parseFloat(b.precio) : b.precio

      switch (sortBy) {
        case "price-low":
          return precioA - precioB
        case "price-high":
          return precioB - precioA
        case "name":
        default:
          return a.nombre.localeCompare(b.nombre)
      }
    })

  const resetFilters = () => {
    setSearchTerm("")
    setPriceRange([0, 100])
    setSortBy("name")
    setSelectedCategoria(null)
    setSelectedSubcategorias([])
    setCurrentPage(1)
  }

  const resetOnlyFilters = () => {
    setPriceRange([0, 100])
    setSortBy("name")
    setSelectedCategoria(null)
    setSelectedSubcategorias([])
    setCurrentPage(1)
  }

  const closeMobileFilters = () => {
    setShowMobileFilters(false)
  }

  // Componente de filtros completo para desktop
  const DesktopFiltersContent = () => (
    <div className="p-4 space-y-6">
      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium mb-2">Buscar</label>
        <input
          type="text"
          placeholder="Buscar juegos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center">
          <Filter size={16} className="mr-2" />
          Categoría
        </label>
        {loadingCategorias ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-full rounded"></div>
            <div className="skeleton h-8 w-full rounded"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="categoria"
                checked={selectedCategoria === null}
                onChange={() => handleCategoriaChange(null)}
                className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm">Todas las categorías</span>
            </label>
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center">
                <input
                  type="radio"
                  name="categoria"
                  checked={selectedCategoria === categoria.id}
                  onChange={() => handleCategoriaChange(categoria.id)}
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm">{categoria.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Subcategorías */}
      {selectedCategoria && getSubcategorias().length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategorías</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getSubcategorias().map((subcategoria) => (
              <label key={subcategoria.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSubcategorias.includes(subcategoria.id)}
                  onChange={(e) => handleSubcategoriaChange(subcategoria.id, e.target.checked)}
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm">{subcategoria.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ordenar */}
      <div>
        <label className="block text-sm font-medium mb-2">Ordenar por</label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full pr-10 appearance-none cursor-pointer"
          >
            <option value="name">Nombre</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
          </select>
          <ChevronDown
            size={20}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium mb-2">Rango de precio</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Mín"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              className="input w-20 text-sm"
              min="0"
            />
            <span className="text-sm">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100])}
              className="input w-20 text-sm"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <button onClick={resetFilters} className="w-full btn-secondary text-sm cursor-pointer">
          Limpiar filtros
        </button>
      </div>
    </div>
  )

  // Componente de filtros solo para móvil (sin búsqueda)
  const MobileFiltersContent = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Filtros</h2>
        <button onClick={closeMobileFilters} className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center">
          <Filter size={16} className="mr-2" />
          Categoría
        </label>
        {loadingCategorias ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-full rounded"></div>
            <div className="skeleton h-8 w-full rounded"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="categoria-mobile"
                checked={selectedCategoria === null}
                onChange={() => handleCategoriaChange(null)}
                className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm">Todas las categorías</span>
            </label>
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center">
                <input
                  type="radio"
                  name="categoria-mobile"
                  checked={selectedCategoria === categoria.id}
                  onChange={() => handleCategoriaChange(categoria.id)}
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm">{categoria.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Subcategorías */}
      {selectedCategoria && getSubcategorias().length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategorías</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getSubcategorias().map((subcategoria) => (
              <label key={subcategoria.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSubcategorias.includes(subcategoria.id)}
                  onChange={(e) => handleSubcategoriaChange(subcategoria.id, e.target.checked)}
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm">{subcategoria.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ordenar */}
      <div>
        <label className="block text-sm font-medium mb-2">Ordenar por</label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full pr-10 appearance-none cursor-pointer"
          >
            <option value="name">Nombre</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
          </select>
          <ChevronDown
            size={20}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium mb-2">Rango de precio</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Mín"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              className="input w-20 text-sm"
              min="0"
            />
            <span className="text-sm">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100])}
              className="input w-20 text-sm"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
        <button onClick={resetOnlyFilters} className="w-full btn-secondary text-sm">
          Limpiar filtros
        </button>
        <button onClick={closeMobileFilters} className="w-full btn-primary">
          Aplicar filtros
        </button>
      </div>
    </div>
  )

  // Resto del componente permanece igual...
  if (error) {
    return (
      <div
        className={`min-h-screen pt-16 flex items-center justify-center relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{
          backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay para el error */}
        <div className="absolute inset-0 bg-[var(--color-background)]" style={{ opacity: isXbox ? 0.9 : 0.93 }}></div>

        <div className="text-center animate-fade-in-scale relative z-10">
          <div
            className={`w-16 h-16 rounded-full ${isXbox ? "bg-red-100" : "bg-red-900/20"
              } flex items-center justify-center mb-4 mx-auto`}
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
    <div
      className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
      style={{
        backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay único para toda la página */}
      <div
        className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
        style={{ opacity: isXbox ? 0.3 : 0.85 }}
      ></div>

      {/* Todo el contenido dentro del contenedor principal */}
      <div className="relative z-10">
        {/* Header */}
        <div className={`w-full py-12 px-4`}>
          <div className="max-w-screen-xl mx-auto animate-fade-in-up">
            <div className="flex items-center mb-4">
              {isXbox ? (
                <img
                  className="w-32 h-32"
                  src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302080/yoshi_hzevum.gif"
                  alt="Yoshi"
                  loading="eager"
                />
              ) : (
                <img
                  className="w-32 h-32"
                  src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302080/toad_p9ufsf.gif"
                  alt="Toad"
                  loading="eager"
                />
              )}
              <div>
                <h1 className="game-title text-4xl md:text-5xl text-white mb-2">Catálogo</h1>
                <p className="text-white/90 text-lg">Consolas legendarias, juegos eternos. Memory Card no incluida.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-screen mx-auto px-4 py-8">
          {/* Búsqueda y filtros móvil */}
          <div className="lg:hidden mb-6 space-y-4 animate-fade-in-up">
            {/* Campo de búsqueda */}
            <div>
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn-secondary flex items-center w-full justify-center"
            >
              <SlidersHorizontal size={20} className="mr-2" />
              Filtros
              {(selectedCategoria || selectedSubcategorias.length > 0) && (
                <span className="ml-2 px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded-full">
                  {(selectedCategoria ? 1 : 0) + selectedSubcategorias.length}
                </span>
              )}
            </button>
          </div>

          {/* Layout con sidebar */}
          <div className="flex gap-6">
            {/* Sidebar de filtros (solo desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="card top-24 animate-fade-in-up">
                <DesktopFiltersContent />
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              {/* Información de resultados */}
              <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <p className={`font-semibold ${isXbox ? "text-[var(--color-accent)]" : "text-[var(--color-primary)]"}`}>
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

              {/* Filtros activos */}
              {(selectedCategoria || selectedSubcategorias.length > 0) && (
                <div className="mb-6 animate-fade-in-up">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoria && (
                      <span className="inline-flex items-center px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded-full">
                        {categorias.find((cat) => cat.id === selectedCategoria)?.nombre}
                        <button
                          onClick={() => handleCategoriaChange(null)}
                          className="ml-2 hover:bg-white/20 rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedSubcategorias.map((subcatId) => {
                      const subcategoria = getSubcategorias().find((sub) => sub.id === subcatId)
                      return subcategoria ? (
                        <span
                          key={subcatId}
                          className="inline-flex items-center px-3 py-1 text-sm bg-[var(--color-secondary)] text-white rounded-full"
                        >
                          {subcategoria.nombre}
                          <button
                            onClick={() => handleSubcategoriaChange(subcatId, false)}
                            className="ml-2 hover:bg-white/20 rounded-full p-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Grid de productos */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-scale">
                  <div
                    className={`w-24 h-24 rounded-full ${isXbox ? "bg-gray-100" : "bg-gray-800"
                      } flex items-center justify-center mb-6 mx-auto`}
                  >
                    <Gamepad2 size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No se encontraron juegos</h3>
                  <p className="text-[var(--color-foreground)]/70 mb-6 max-w-md mx-auto">
                    No hay productos que coincidan con tu búsqueda. Intenta con otros términos o ajusta los filtros.
                  </p>
                  <button onClick={resetFilters} className="btn-primary">
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
                  {filteredAndSortedProducts.map((producto, index) => (
                    <div
                      key={producto.id}
                      className="animate-fade-in-scale"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
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

              {/* Paginación */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  {meta.links.map((link: any, index: number) => {
                    if (link.label === "&laquo; Anterior" || link.label === "Siguiente &raquo;") {
                      return (
                        <button
                          key={index}
                          disabled={!link.url}
                          onClick={() =>
                            link.url && setCurrentPage(new URL(link.url).searchParams.get("page") as unknown as number)
                          }
                          className={`cursor-pointer btn-secondary px-3 py-1 ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {link.label.includes("Anterior") ? "<" : ">"}
                        </button>
                      )
                    } else {
                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(Number(link.label))}
                          className={`cursor-pointer btn-secondary px-3 py-1 ${link.active ? "bg-[var(--color-primary)] text-white" : ""
                            }`}
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
        </div>
      </div>

      {/* Modal de filtros móvil */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileFilters}></div>

          {/* Modal content */}
          <div className="relative h-full bg-[var(--color-background)] animate-fade-in-up overflow-y-auto">
            <MobileFiltersContent />
          </div>
        </div>
      )}
    </div>
  )
}
