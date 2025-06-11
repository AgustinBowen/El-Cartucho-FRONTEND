"use client"

import type React from "react"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart, Eye, Zap } from "lucide-react"
import { useState, useEffect } from "react"

type CardProps = {
  producto_id: number
  imgSrc: string
  imgAlt: string
  title: string
  description: string
  price: number
}

export const CardComponent: React.FC<CardProps> = ({ producto_id, imgSrc, imgAlt, title, description, price }) => {
  const { addToCart } = useCart()
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
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

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  const isXbox = theme === "light"
  const originalPrice = Math.floor(price * 1.2)
  const discount = Math.floor(((originalPrice - price) / originalPrice) * 100)

  return (
    <div className="group card h-full flex flex-col overflow-hidden animate-fade-in-scale">
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

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              className="p-2 bg-white/90 rounded-full text-gray-800 hover:bg-white transition-all duration-300 transform hover:scale-110"
              title="Vista rápida"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={toggleWishlist}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-800 hover:bg-white"
              }`}
              title={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {discount > 0 && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              -{discount}%
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
              isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"
            }`}
          >
            NUEVO
          </span>
        </div>

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
        <h3 className="game-title text-lg font-semibold mb-2 text-[var(--color-foreground)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-2">{description}</p>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {discount > 0 && <span className="text-xs text-gray-500 line-through">${originalPrice}</span>}
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[var(--color-primary)]">${price}</span>
              {discount > 0 && <Zap size={16} className="text-yellow-500" />}
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
  )
}
