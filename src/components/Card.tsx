"use client"

import type React from "react"
import { useCart } from "../context/CartContext"
import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"

type CardProps = {
  producto_id: number
  imgSrc: string
  imgAlt: string
  title: string
  price: number
}

// Modificar la función CardComponent para incluir un diseño horizontal en móviles
export const CardComponent: React.FC<CardProps> = ({ producto_id, imgSrc, imgAlt, title, price }) => {
  const { addToCart } = useCart()
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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

  const handleAdd = async () => {
    setIsLoading(true)

    // Simular una pequeña demora para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 300))

    addToCart({
      producto_id,
      title,
      price,
      image: imgSrc,
    })

    setIsLoading(false)
  }
  
  const isXbox = theme === "light"

  // Diseño para móviles (horizontal) y desktop (vertical)
  return (
    <div className="group card h-full flex flex-col overflow-hidden animate-fade-in-scale">
      {/* Diseño para móviles (horizontal) */}
      <div className="md:hidden flex flex-row h-full">
        {/* Imagen a la izquierda */}
        <div className="relative w-2/5 overflow-hidden bg-[var(--color-muted)]">
          {!imageLoaded && <div className="absolute inset-0 shimmer"></div>}

          <img
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={imgSrc || "/placeholder.svg"}
            alt={imgAlt}
            onLoad={() => setImageLoaded(true)}
          />

        </div>

        {/* Contenido a la derecha */}
        <div className="w-3/5 p-3 flex flex-col justify-between">
          <div>
            <h3 className="game-title text-sm font-semibold mb-1 text-[var(--color-foreground)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-300">
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--color-primary)]">${price}</span>
            </div>

            <button
              onClick={handleAdd}
              disabled={isLoading}
              className={`btn-primary text-xs px-2 py-1 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShoppingCart size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Diseño para desktop (vertical - mantiene el diseño original) */}
      <div className="hidden md:flex md:flex-col h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-[var(--color-muted)]">
          {!imageLoaded && <div className="absolute inset-0 shimmer"></div>}

          <img
            className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={imgSrc || "/placeholder.svg"}
            alt={imgAlt}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Quick Add Button */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className={`p-2 rounded-full text-white transition-all duration-300 transform hover:scale-110 ${
                isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"
              } ${isLoading ? "animate-pulse" : ""}`}
              title="Agregar al carrito"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="truncate game-title text-lg font-semibold mb-2 text-[var(--color-foreground)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-300">
            {title}
          </h3>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-[var(--color-primary)]">${price}</span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={isLoading}
              className={`btn-primary text-sm px-4 py-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <ShoppingCart size={16} />
                  <span>Agregar</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}