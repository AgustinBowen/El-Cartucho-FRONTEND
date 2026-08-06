import { useSearchParams } from "react-router-dom"
import { useCallback, useMemo, useRef, useEffect } from "react"

interface FiltrosEstado {
  categoriaId: number | null
  subcategorias: number[]
  precioMin: string
  precioMax: string
  searchQuery: string
  sortBy: string
  page: number
}

export function useFiltrosCatalogo() {
  const [searchParams, setSearchParams] = useSearchParams()

  const estado = useMemo<FiltrosEstado>(() => {
    const categoriaStr = searchParams.get("categoria_id")
    const subcatsStr = searchParams.getAll("subcategorias[]")
    
    return {
      categoriaId: categoriaStr ? parseInt(categoriaStr, 10) : null,
      subcategorias: subcatsStr.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
      precioMin: searchParams.get("precio_min") || "",
      precioMax: searchParams.get("precio_max") || "",
      searchQuery: searchParams.get("q") || "",
      sortBy: (() => {
        const o = searchParams.get("orden")
        const d = searchParams.get("dir")
        if (o === "precio" && d === "asc") return "price-low"
        if (o === "precio" && d === "desc") return "price-high"
        if (o === "nombre" && d === "asc") return "name"
        return "newest"
      })(),
      page: parseInt(searchParams.get("page") || "1", 10)
    }
  }, [searchParams])

  const updateUrl = useCallback((newParams: Record<string, string | string[] | null>) => {
    setSearchParams(prev => {
      const current = new URLSearchParams(prev)
      
      let changingPage = false

      Object.entries(newParams).forEach(([key, value]) => {
        if (key === "page") changingPage = true

        current.delete(key)
        
        if (value === null || value === "" || value === undefined) {
          return
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(v => current.append(key, v))
          }
        } else {
          current.set(key, value)
        }
      })

      if (!changingPage) {
        current.delete("page")
      }

      return current
    })
  }, [setSearchParams])

  const seleccionarCategoria = useCallback((id: number, mantenerSubcategorias = false) => {
    if (estado.categoriaId === id) {
      updateUrl({
        categoria_id: null,
        "subcategorias[]": null 
      })
    } else {
      updateUrl({
        categoria_id: id.toString(),
        "subcategorias[]": mantenerSubcategorias ? estado.subcategorias.map(String) : null
      })
    }
  }, [estado.categoriaId, estado.subcategorias, updateUrl])

  const toggleSubcategoria = useCallback((subId: number) => {
    const isSelected = estado.subcategorias.includes(subId)
    let nuevas: number[]
    
    if (isSelected) {
      nuevas = estado.subcategorias.filter(id => id !== subId)
    } else {
      nuevas = [...estado.subcategorias, subId]
    }

    updateUrl({ "subcategorias[]": nuevas.length > 0 ? nuevas.map(String) : null })
  }, [estado.subcategorias, updateUrl])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const aplicarPrecio = useCallback((min: string, max: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateUrl({
        precio_min: min || null,
        precio_max: max || null
      })
    }, 500)
  }, [updateUrl])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const setBúsqueda = useCallback((q: string) => {
    updateUrl({ q: q || null })
  }, [updateUrl])

  const setSortBy = useCallback((sort: string) => {
    let orden = null;
    let dir = null;
    
    switch (sort) {
      case "price-low":
        orden = "precio";
        dir = "asc";
        break;
      case "price-high":
        orden = "precio";
        dir = "desc";
        break;
      case "name":
        orden = "nombre";
        dir = "asc";
        break;
      case "newest":
      default:
        orden = "created_at";
        dir = "desc";
        break;
    }
    
    updateUrl({ orden, dir })
  }, [updateUrl])

  const setPage = useCallback((page: number) => {
    updateUrl({ page: page > 1 ? page.toString() : null })
  }, [updateUrl])

  const limpiarFiltros = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    estado,
    seleccionarCategoria,
    toggleSubcategoria,
    aplicarPrecio,
    setBúsqueda,
    setSortBy,
    setPage,
    limpiarFiltros
  }
}
