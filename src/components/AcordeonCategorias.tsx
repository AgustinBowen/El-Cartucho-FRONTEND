import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import type { Categoria } from "../types/Categoria"
import type { Subcategoria } from "../types/Subcategoria"

interface AcordeonCategoriasProps {
  categorias: Categoria[]
  categoriaSeleccionada: number | null
  subcategoriasSeleccionadas: number[]
  onSeleccionarCategoria: (id: number) => void
  onToggleSubcategoria: (id: number) => void
}

export const AcordeonCategorias: React.FC<AcordeonCategoriasProps> = ({
  categorias,
  categoriaSeleccionada,
  subcategoriasSeleccionadas,
  onSeleccionarCategoria,
  onToggleSubcategoria,
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  // Expandir automáticamente si hay una categoría seleccionada al montar
  useEffect(() => {
    if (categoriaSeleccionada) {
      setExpanded((prev) => ({ ...prev, [categoriaSeleccionada]: true }))
    }
  }, [categoriaSeleccionada])

  const toggleExpand = (id: number, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCategoryClick = (id: number) => {
    onSeleccionarCategoria(id)
    if (!expanded[id]) {
      setExpanded((prev) => ({ ...prev, [id]: true }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: number, isChevron: boolean) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (isChevron) {
        toggleExpand(id)
      } else {
        handleCategoryClick(id)
      }
    }
  }

  return (
    <div className="space-y-1">
      {categorias.map((categoria) => {
        const isExpanded = !!expanded[categoria.id]
        const isSelected = categoriaSeleccionada === categoria.id
        const panelId = `panel-categoria-${categoria.id}`
        const headerId = `header-categoria-${categoria.id}`

        return (
          <div key={categoria.id} className="border-b border-[var(--color-border)] last:border-0 pb-1">
            <div className="flex items-center">
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => handleCategoryClick(categoria.id)}
                onKeyDown={(e) => handleKeyDown(e, categoria.id, false)}
                className={`flex-1 flex items-center justify-between py-3 px-2 text-left text-sm font-medium transition-colors rounded hover:bg-[var(--color-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  isSelected ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-foreground)]"
                }`}
              >
                {categoria.nombre}
              </button>
              
              <button
                aria-label={isExpanded ? `Contraer ${categoria.nombre}` : `Expandir ${categoria.nombre}`}
                onClick={(e) => toggleExpand(categoria.id, e)}
                onKeyDown={(e) => handleKeyDown(e, categoria.id, true)}
                className="p-3 text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
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
              <div className="px-4 py-2 space-y-3 bg-[var(--color-background)]/50 rounded-b-md">
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
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent"
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
