import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import type { Categoria } from "../types/Categoria"
import type { Subcategoria } from "../types/Subcategoria"

interface AcordeonCategoriasProps {
  categorias: Categoria[]
  categoriasSeleccionadas?: number[]
  // # DEPRECADO: eliminar en Pasada C
  categoriaSeleccionada?: number | null
  subcategoriasSeleccionadas: number[]
  onSeleccionarCategoria: (id: number, subcategoriaIds?: number[]) => void
  onToggleSubcategoria: (id: number) => void
}

export const AcordeonCategorias: React.FC<AcordeonCategoriasProps> = ({
  categorias,
  categoriasSeleccionadas = [],
  categoriaSeleccionada,
  subcategoriasSeleccionadas,
  onSeleccionarCategoria,
  onToggleSubcategoria,
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  // Obtener lista unificada de categorías seleccionadas (soporta array nuevo o id viejo)
  const selCatList = categoriasSeleccionadas.length > 0 
    ? categoriasSeleccionadas 
    : (categoriaSeleccionada ? [categoriaSeleccionada] : [])

  // Expandir automáticamente si una categoría está seleccionada
  useEffect(() => {
    selCatList.forEach((id) => {
      setExpanded((prev) => ({ ...prev, [id]: true }))
    })
  }, [selCatList])

  const toggleExpand = (id: number, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCategoryClick = (categoria: Categoria) => {
    const subIds = (categoria.subcategorias || []).map((s) => s.id)
    onSeleccionarCategoria(categoria.id, subIds)
    if (!expanded[categoria.id]) {
      setExpanded((prev) => ({ ...prev, [categoria.id]: true }))
    }
  }

  return (
    <div className="space-y-1">
      {categorias.map((categoria) => {
        const isExpanded = !!expanded[categoria.id]
        const isSelected = selCatList.includes(categoria.id)
        const panelId = `panel-categoria-${categoria.id}`
        const headerId = `header-categoria-${categoria.id}`
        const subIds = (categoria.subcategorias || []).map((s) => s.id)

        return (
          <div key={categoria.id} className="border-b border-[var(--color-border)] last:border-0 pb-1">
            <div className="flex items-center px-2 py-1 hover:bg-[var(--color-muted)] rounded transition-colors">
              <input
                type="checkbox"
                id={`cat-checkbox-${categoria.id}`}
                checked={isSelected}
                onChange={() => onSeleccionarCategoria(categoria.id, subIds)}
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent cursor-pointer"
              />
              
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => handleCategoryClick(categoria)}
                className={`flex-1 flex items-center justify-between py-2 px-3 text-left text-sm font-medium transition-colors cursor-pointer ${
                  isSelected ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-foreground)]"
                }`}
              >
                {categoria.nombre}
              </button>
              
              <button
                aria-label={isExpanded ? `Contraer ${categoria.nombre}` : `Expandir ${categoria.nombre}`}
                onClick={(e) => toggleExpand(categoria.id, e)}
                className="p-2 text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded cursor-pointer"
              >
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 py-2 space-y-3 bg-[var(--color-background)]/50 rounded-b-md">
                {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
                  categoria.subcategorias.map((sub: Subcategoria) => {
                    const isSubSelected = subcategoriasSeleccionadas.includes(sub.id)
                    const subId = `subcat-${sub.id}`

                    return (
                      <div key={sub.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={subId}
                          checked={isSubSelected}
                          onChange={() => onToggleSubcategoria(sub.id)}
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent cursor-pointer"
                        />
                        <label
                          htmlFor={subId}
                          className="ml-3 text-sm text-[var(--color-foreground)]/80 cursor-pointer hover:text-[var(--color-foreground)] transition-colors"
                        >
                          {sub.nombre}
                        </label>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-[var(--color-foreground)]/50 italic">
                    Sin subcategorías
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
