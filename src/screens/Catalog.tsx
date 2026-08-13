import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Producto } from "../types/Producto"
import type { Categoria } from "../types/Categoria"
import { CardComponent } from "../components/Card"
import { SkeletonCard } from "../components/SkeletonCard"
import { SlidersHorizontal, Gamepad2, ChevronDown, ChevronLeft, ChevronRight, X, Filter, Search } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useFiltrosCatalogo } from "../hooks/useFiltrosCatalogo"
import { AcordeonCategorias } from "../components/AcordeonCategorias"

export const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingCategorias, setLoadingCategorias] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { isXbox } = useTheme()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [meta, setMeta] = useState<any>(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  const [searchParams] = useSearchParams()
  const {
    estado,
    toggleCategoria,
    toggleSubcategoria,
    aplicarPrecio,
    setDisponibilidad,
    setBúsqueda,
    setSortBy,
    setPage,
    limpiarFiltros
  } = useFiltrosCatalogo()

  const [searchInput, setSearchInput] = useState(estado.searchQuery)
  const [localMin, setLocalMin] = useState(estado.precioMin)
  const [localMax, setLocalMax] = useState(estado.precioMax)

  // Sincronizar input local de búsqueda si cambia la URL por fuera
  useEffect(() => {
    setSearchInput(estado.searchQuery)
  }, [estado.searchQuery])

  // Sincronizar precio local si cambia la URL
  useEffect(() => {
    setLocalMin(estado.precioMin)
    setLocalMax(estado.precioMax)
  }, [estado.precioMin, estado.precioMax])

  // Debounce de búsqueda manual simple
  useEffect(() => {
    if (searchInput === estado.searchQuery) return
    const timer = setTimeout(() => {
      setBúsqueda(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, estado.searchQuery, setBúsqueda])

  const handlePrecioChange = (type: "min" | "max", val: string) => {
    if (type === "min") {
      setLocalMin(val)
      aplicarPrecio(val, localMax)
    } else {
      setLocalMax(val)
      aplicarPrecio(localMin, val)
    }
  }

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

  // Scroll móvil
  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [showMobileFilters])

  // Fetch categorías
  useEffect(() => {
    let isMounted = true
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/categorias`)
        if (!response.ok) throw new Error("Error al obtener categorías")
        const data = await response.json()
        if (isMounted) setCategorias(Array.isArray(data) ? data : [])
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching categorias:", err.message)
          setCategorias([])
        }
      } finally {
        if (isMounted) setLoadingCategorias(false)
      }
    }
    fetchCategorias()
    return () => { isMounted = false }
  }, [])

  // Fetch productos con AbortController
  useEffect(() => {
    const controller = new AbortController()

    const fetchProductos = async () => {
      try {
        setLoading(true)
        setError(null)
        // La URL actual contiene todos los parámetros necesarios construidos por el hook
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/ed/producto/listar?${searchParams.toString()}`,
          { signal: controller.signal }
        )

        if (controller.signal.aborted) return

        if (response.status === 422) {
          const errData = await response.json()
          const errorMsg =
            errData.message ||
            (errData.errors ? Object.values(errData.errors).flat().join(" ") : "Error de validación")
          if (!controller.signal.aborted) {
            setError(errorMsg)
            setProductos([])
            setMeta(null)
          }
          return
        }

        if (!response.ok) throw new Error("Error al obtener productos")

        const data = await response.json()
        if (!controller.signal.aborted) {
          setProductos(data.data || [])
          setMeta(data.meta || null)
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Error al cargar los productos")
          setProductos([])
          setMeta(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchProductos()

    return () => {
      controller.abort()
    }
  }, [searchParams])

  const renderTopbarFilters = () => (
    <div className="filter-bar mb-6 p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] shadow-sm animate-fade-in-up">

      {/* Zona de acciones: Buscar + Limpiar */}
      <div className="filter-bar__actions">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar juegos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input w-full py-2"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button onClick={limpiarFiltros} className="btn-secondary whitespace-nowrap text-sm filter-bar__clear-btn">
          Limpiar filtros
        </button>
      </div>

      {/* Zona de filtros: Stock | Ordenar por | Precio */}
      <div className="filter-bar__filters">

        <div className="filter-bar__group">
          <label className="filter-bar__label">Stock</label>
          <div className="relative">
            <select
              value={estado.disponibilidad}
              onChange={(e) => setDisponibilidad(e.target.value)}
              className="input pr-8 py-2 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              <option value="con_stock">Con stock</option>
              <option value="sin_stock">Sin stock</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="filter-bar__group">
          <label className="filter-bar__label">Ordenar por</label>
          <div className="relative">
            <select
              value={estado.sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input pr-8 py-2 text-sm appearance-none cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="name">Nombre</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="filter-bar__group">
          <label className="filter-bar__label">Precio</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={localMin}
              onChange={(e) => handlePrecioChange("min", e.target.value)}
              className="input filter-bar__price-input py-2 text-sm"
              min="0"
            />
            <span className="text-sm text-gray-500 flex-shrink-0">—</span>
            <input
              type="number"
              placeholder="Máx"
              value={localMax}
              onChange={(e) => handlePrecioChange("max", e.target.value)}
              className="input filter-bar__price-input py-2 text-sm"
              min="0"
            />
          </div>
        </div>

      </div>
    </div>
  )

  const renderSidebarCategorias = () => (
    <div className="card top-24 sticky">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <Filter size={18} className="mr-2" />
          Categorías
        </h2>
        {loadingCategorias ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded opacity-70"></div>
            ))}
          </div>
        ) : (
          <AcordeonCategorias
            categorias={categorias}
            categoriasSeleccionadas={estado.categorias}
            subcategoriasSeleccionadas={estado.subcategorias}
            onSeleccionarCategoria={(id, subIds) => toggleCategoria(id, subIds)}
            onToggleSubcategoria={toggleSubcategoria}
          />
        )}
      </div>
    </div>
  )

  if (error) {
    return (
      <div
        className={`min-h-screen pt-16 flex items-center justify-center relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[var(--color-background)]" style={{ opacity: isXbox ? 0.9 : 0.93 }}></div>
        <div className="text-center animate-fade-in-scale relative z-10 p-6 max-w-lg">
          <div className={`w-16 h-16 rounded-full ${isXbox ? "bg-red-100" : "bg-red-900/20"} flex items-center justify-center mb-4 mx-auto`}>
            <span className="text-2xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Oops! Algo salió mal</h2>
          <p className="text-[var(--color-foreground)]/70 mb-4">{error}</p>
          <button onClick={limpiarFiltros} className="btn-primary">
            Limpiar filtros / Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"}`}
      style={{
        backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
        style={{ opacity: isXbox ? 0.3 : 0.85 }}
      ></div>

      <div className="relative z-10">
        <div className="w-full py-12 px-4">
          <div className="max-w-screen-xl mx-auto animate-fade-in-up">
            <div className="flex items-center mb-4">
              <img
                className="w-32 h-32"
                src={isXbox
                  ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302080/yoshi_hzevum.gif"
                  : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302080/toad_p9ufsf.gif"}
                alt={isXbox ? "Yoshi" : "Toad"}
                loading="eager"
              />
              <div>
                <h1 className="game-title text-4xl md:text-5xl text-white mb-2">Catálogo</h1>
                <p className="text-white/90 text-lg">Consolas legendarias, juegos eternos. Memory Card no incluida.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn-secondary flex items-center w-full justify-center"
            >
              <SlidersHorizontal size={20} className="mr-2" />
              Filtros
              {(estado.categorias.length > 0 || estado.subcategorias.length > 0) && (
                <span className="ml-2 px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded-full">
                  {estado.categorias.length + estado.subcategorias.length}
                </span>
              )}
            </button>
          </div>

          {/* Main Content Layout */}
          <div className="flex gap-6 relative items-start">

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0 animate-fade-in-up sticky top-24">
              {renderSidebarCategorias()}
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              {/* Desktop Topbar */}
              <div className="hidden lg:block mb-6">
                {renderTopbarFilters()}
              </div>

              <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <div className={`font-semibold ${isXbox ? "text-[var(--color-accent)]" : "text-[var(--color-primary)]"}`}>
                  {loading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cargando productos...
                    </span>
                  ) : (
                    `Mostrando ${productos.length} de ${meta?.total ?? productos.length} productos`
                  )}
                </div>
              </div>

              {/* Grid de productos */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-scale">
                  <div
                    className={`w-24 h-24 rounded-full ${isXbox ? "bg-gray-100" : "bg-gray-800"} flex items-center justify-center mb-6 mx-auto`}
                  >
                    <Gamepad2 size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No se encontraron juegos</h3>
                  <p className="text-[var(--color-foreground)]/70 mb-6 max-w-md mx-auto">
                    No hay productos que coincidan con tu búsqueda. Intenta con otros términos o ajusta los filtros.
                  </p>
                  <button onClick={limpiarFiltros} className="btn-primary">
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                  {productos.map((producto, index) => (
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
                        stock={producto.stock}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2 overflow-x-auto no-scrollbar">
                  {meta.links.map((link: any, index: number) => {
                    const isPrev = index === 0 || link.label.includes("Anterior") || link.label.includes("&laquo;")
                    const isNext = index === meta.links.length - 1 || link.label.includes("Siguiente") || link.label.includes("&raquo;")

                    if (isPrev || isNext) {
                      return (
                        <button
                          key={index}
                          disabled={!link.url}
                          aria-label={isPrev ? "Página anterior" : "Página siguiente"}
                          onClick={() => {
                            if (link.url) {
                              try {
                                const urlObj = new URL(link.url)
                                const pageParam = urlObj.searchParams.get("page")
                                if (pageParam) setPage(Number(pageParam))
                              } catch {
                                const pageMatch = link.url.match(/page=(\d+)/)
                                if (pageMatch) setPage(Number(pageMatch[1]))
                              }
                            }
                          }}
                          className={`cursor-pointer btn-secondary px-3 py-2 flex items-center justify-center ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isPrev ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                      )
                    } else {
                      return (
                        <button
                          key={index}
                          onClick={() => setPage(Number(link.label))}
                          className={`cursor-pointer btn-secondary px-3 py-2 min-w-[2.5rem] ${link.active ? "bg-[var(--color-primary)] text-white" : ""}`}
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          {/* Panel: flex-col, sin scroll propio — el body interior scrollea */}
          <div className="relative h-full w-full bg-[var(--color-background)] animate-fade-in-up flex flex-col shadow-2xl">

            {/* Área scrolleable */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Filtros</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {renderTopbarFilters()}
              </div>

              {renderSidebarCategorias()}
            </div>

            {/* Footer fijo — siempre visible, fuera del scroll */}
            <div className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-background)]">
              <button onClick={() => setShowMobileFilters(false)} className="w-full btn-primary py-3">
                Ver resultados
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
