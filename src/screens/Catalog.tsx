"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [meta, setMeta] = useState<any>(null)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  // Extraer valores actuales desde query params
  const qParam = searchParams.get("q") || ""
  const categoriaParam = searchParams.get("categoria_id") ? Number(searchParams.get("categoria_id")) : null
  const subcategoriasParam = useMemo(() => {
    const fromArray = searchParams.getAll("subcategorias[]")
    if (fromArray.length > 0) return fromArray.map(Number)
    const single = searchParams.get("subcategorias")
    if (single) return single.split(",").map(Number)
    return []
  }, [searchParams])
  const precioMinParam = searchParams.get("precio_min") || ""
  const precioMaxParam = searchParams.get("precio_max") || ""
  const ordenParam = searchParams.get("orden") || ""
  const dirParam = searchParams.get("dir") || ""

  // Estado local para input de búsqueda (debounce)
  const [searchInput, setSearchInput] = useState(qParam)

  // Sincronizar searchInput cuando el query param q cambie desde la URL
  useEffect(() => {
    setSearchInput(qParam)
  }, [qParam])

  // Helper para actualizar query params
  const updateParams = (newParams: Record<string, any>, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)

      if (resetPage) {
        next.set("page", "1")
      }

      Object.entries(newParams).forEach(([key, value]) => {
        if (key === "subcategorias") {
          next.delete("subcategorias[]")
          next.delete("subcategorias")
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((val) => next.append("subcategorias[]", val.toString()))
          }
        } else {
          next.delete(key)
          if (value !== null && value !== undefined && value !== "") {
            next.set(key, value.toString())
          }
        }
      })

      return next
    })
  }

  // Debounce de 300ms para la búsqueda
  useEffect(() => {
    if (searchInput === qParam) return

    const timer = setTimeout(() => {
      updateParams({ q: searchInput }, true)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, qParam])

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
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showMobileFilters])

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
        setCategorias([])
      } finally {
        setLoadingCategorias(false)
      }
    }

    fetchCategorias()
  }, [])

  // Fetch productos con AbortController y manejo de 422
  useEffect(() => {
    const controller = new AbortController()

    const fetchProductos = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/ed/producto/listar?${searchParams.toString()}`,
          { signal: controller.signal }
        )

        if (response.status === 422) {
          const errData = await response.json()
          const errorMsg =
            errData.message ||
            (errData.errors ? Object.values(errData.errors).flat().join(" ") : "Error de validación")
          setError(errorMsg)
          setProductos([])
          setMeta(null)
          return
        }

        if (!response.ok) {
          throw new Error("Error al obtener productos")
        }

        const data = await response.json()
        setProductos(data.data || [])
        setMeta(data.meta || null)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error al cargar los productos")
          setProductos([])
          setMeta(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()

    return () => {
      controller.abort()
    }
  }, [searchParams])

  // Manejar cambio de categoría
  const handleCategoriaChange = (categoriaId: number | null) => {
    updateParams({ categoria_id: categoriaId, subcategorias: [] }, true)
  }

  // Manejar cambio de subcategoría
  const handleSubcategoriaChange = (subcategoriaId: number, checked: boolean) => {
    let newSubcats: number[]
    if (checked) {
      newSubcats = [...subcategoriasParam, subcategoriaId]
    } else {
      newSubcats = subcategoriasParam.filter((id) => id !== subcategoriaId)
    }
    updateParams({ subcategorias: newSubcats }, true)
  }

  // Mapeo del dropdown SortBy <-> orden & dir
  const currentSortBy = useMemo(() => {
    if (ordenParam === "nombre" && dirParam === "asc") return "name"
    if (ordenParam === "precio" && dirParam === "asc") return "price-low"
    if (ordenParam === "precio" && dirParam === "desc") return "price-high"
    if (ordenParam === "created_at") return "newest"
    return "newest"
  }, [ordenParam, dirParam])

  const handleSortChange = (newSortBy: string) => {
    switch (newSortBy) {
      case "price-low":
        updateParams({ orden: "precio", dir: "asc" }, true)
        break
      case "price-high":
        updateParams({ orden: "precio", dir: "desc" }, true)
        break
      case "name":
        updateParams({ orden: "nombre", dir: "asc" }, true)
        break
      case "newest":
      default:
        updateParams({ orden: "created_at", dir: "desc" }, true)
        break
    }
  }

  // Obtener subcategorías de la categoría seleccionada
  const getSubcategorias = () => {
    if (!categoriaParam) return []
    const categoria = categorias.find((cat) => cat.id === categoriaParam)
    return categoria?.subcategorias || []
  }

  const resetFilters = () => {
    setSearchInput("")
    setSearchParams({})
  }

  const resetOnlyFilters = () => {
    updateParams({
      categoria_id: null,
      subcategorias: [],
      precio_min: null,
      precio_max: null,
      orden: null,
      dir: null,
    }, true)
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
                checked={categoriaParam === null}
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
                  checked={categoriaParam === categoria.id}
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
      {categoriaParam && getSubcategorias().length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategorías</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getSubcategorias().map((subcategoria) => (
              <label key={subcategoria.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={subcategoriasParam.includes(subcategoria.id)}
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
            value={currentSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input w-full pr-10 appearance-none cursor-pointer"
          >
            <option value="newest">Más recientes</option>
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
              value={precioMinParam}
              onChange={(e) => updateParams({ precio_min: e.target.value }, true)}
              className="input w-20 text-sm"
              min="0"
            />
            <span className="text-sm">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={precioMaxParam}
              onChange={(e) => updateParams({ precio_max: e.target.value }, true)}
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
                checked={categoriaParam === null}
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
                  checked={categoriaParam === categoria.id}
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
      {categoriaParam && getSubcategorias().length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategorías</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getSubcategorias().map((subcategoria) => (
              <label key={subcategoria.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={subcategoriasParam.includes(subcategoria.id)}
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
            value={currentSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input w-full pr-10 appearance-none cursor-pointer"
          >
            <option value="newest">Más recientes</option>
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
              value={precioMinParam}
              onChange={(e) => updateParams({ precio_min: e.target.value }, true)}
              className="input w-20 text-sm"
              min="0"
            />
            <span className="text-sm">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={precioMaxParam}
              onChange={(e) => updateParams({ precio_max: e.target.value }, true)}
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

  if (error) {
    return (
      <div
        className={`min-h-screen pt-16 flex items-center justify-center relative transition-opacity duration-1000 ${
          backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[var(--color-background)]" style={{ opacity: isXbox ? 0.9 : 0.93 }}></div>

        <div className="text-center animate-fade-in-scale relative z-10 p-6 max-w-lg">
          <div
            className={`w-16 h-16 rounded-full ${
              isXbox ? "bg-red-100" : "bg-red-900/20"
            } flex items-center justify-center mb-4 mx-auto`}
          >
            <span className="text-2xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Oops! Algo salió mal</h2>
          <p className="text-[var(--color-foreground)]/70 mb-4">{error}</p>
          <button onClick={resetFilters} className="btn-primary">
            Limpiar filtros / Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${
        backgroundLoaded ? "opacity-100" : "opacity-0"
      }`}
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
        {/* Header */}
        <div className="w-full py-12 px-4">
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
            <div>
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input w-full"
              />
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn-secondary flex items-center w-full justify-center"
            >
              <SlidersHorizontal size={20} className="mr-2" />
              Filtros
              {(categoriaParam || subcategoriasParam.length > 0) && (
                <span className="ml-2 px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded-full">
                  {(categoriaParam ? 1 : 0) + subcategoriasParam.length}
                </span>
              )}
            </button>
          </div>

          {/* Layout con sidebar */}
          <div className="flex gap-6">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="card top-24 animate-fade-in-up">
                <DesktopFiltersContent />
              </div>
            </div>

            <div className="flex-1 min-w-0">
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

              {/* Filtros activos */}
              {(categoriaParam || subcategoriasParam.length > 0) && (
                <div className="mb-6 animate-fade-in-up">
                  <div className="flex flex-wrap gap-2">
                    {categoriaParam && (
                      <span className="inline-flex items-center px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded-full">
                        {categorias.find((cat) => cat.id === categoriaParam)?.nombre}
                        <button
                          onClick={() => handleCategoriaChange(null)}
                          className="ml-2 hover:bg-white/20 rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {subcategoriasParam.map((subcatId) => {
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
              ) : productos.length === 0 ? (
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
                  <button onClick={resetFilters} className="btn-primary">
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
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
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  {meta.links.map((link: any, index: number) => {
                    if (link.label.includes("Anterior") || link.label.includes("Siguiente") || link.label === "&laquo; Anterior" || link.label === "Siguiente &raquo;") {
                      return (
                        <button
                          key={index}
                          disabled={!link.url}
                          onClick={() => {
                            if (link.url) {
                              try {
                                const urlObj = new URL(link.url)
                                const pageParam = urlObj.searchParams.get("page")
                                if (pageParam) updateParams({ page: Number(pageParam) }, false)
                              } catch {
                                const pageMatch = link.url.match(/page=(\d+)/)
                                if (pageMatch) updateParams({ page: Number(pageMatch[1]) }, false)
                              }
                            }
                          }}
                          className={`cursor-pointer btn-secondary px-3 py-1 ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {link.label.includes("Anterior") ? "<" : ">"}
                        </button>
                      )
                    } else {
                      return (
                        <button
                          key={index}
                          onClick={() => updateParams({ page: Number(link.label) }, false)}
                          className={`cursor-pointer btn-secondary px-3 py-1 ${
                            link.active ? "bg-[var(--color-primary)] text-white" : ""
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileFilters}></div>
          <div className="relative h-full bg-[var(--color-background)] animate-fade-in-up overflow-y-auto">
            <MobileFiltersContent />
          </div>
        </div>
      )}
    </div>
  )
}
