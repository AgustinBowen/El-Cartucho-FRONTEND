"use client"

import type React from "react"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart } from "lucide-react"
import { useState} from "react"
import { formatearPrecio } from "../utils/formatearPrecio"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useWishlist } from "../context/WishlistContext"
import { useAuth } from "../context/AuthContext"

type CardProps = {
  producto_id: number
  imgSrc: string
  imgAlt: string
  title: string
  price: number
  stock?: number
}

export const CardComponent: React.FC<CardProps> = ({ producto_id, imgSrc, imgAlt, title, price, stock }) => {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const { isXbox } = useTheme();
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const inWishlist = isInWishlist(producto_id)
  const sinStock = stock !== undefined && stock <= 0

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (sinStock) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    addToCart({ producto_id, title, price, image: imgSrc, stock: stock ?? 0 })
    setIsLoading(false)
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    setWishlistLoading(true)
    await toggleWishlist(producto_id)
    setWishlistLoading(false)
  }

  const handleCardClick = () => {
    navigate(`/producto/${producto_id}`)
  }

  // Diseño para móviles (horizontal) y desktop (vertical)
  return (
    <div 
      className="group card h-full flex flex-col overflow-hidden animate-fade-in-scale cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onClick={handleCardClick}
    >
      {/* Diseño para móviles (horizontal) */}
      <div className="md:hidden flex flex-row h-full">
        {/* Imagen a la izquierda */}
        <div className="relative w-2/5 overflow-hidden bg-[var(--color-muted)]">
          {!imageLoaded && <div className="absolute inset-0 shimmer"></div>}

          {sinStock && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900/90 text-red-400 border border-red-500/30 backdrop-blur-sm z-10" aria-label="Producto sin stock">
              Sin stock
            </span>
          )}

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
              <span className="text-sm font-bold text-[var(--color-primary)]">{formatearPrecio(price)}</span>
            </div>

            <button
              onClick={handleAdd}
              disabled={isLoading || sinStock}
              aria-disabled={sinStock ? "true" : undefined}
              title={sinStock ? "Producto sin stock disponible" : "Agregar al carrito"}
              className={`btn-primary text-xs px-2 py-1 ${isLoading || sinStock ? "opacity-50 cursor-not-allowed" : ""}`}
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

          {sinStock && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold bg-neutral-900/90 text-red-400 border border-red-500/30 backdrop-blur-sm z-10" aria-label="Producto sin stock">
              Sin stock
            </span>
          )}

          <img
            className={`w-full h-48 object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={imgSrc || "/placeholder.svg"}
            alt={imgAlt}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Wishlist + Quick Add Buttons overlay */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
            {user && (
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`cursor-pointer p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  inWishlist
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"
                } ${wishlistLoading ? "animate-pulse" : ""}`}
                title={inWishlist ? "Quitar de deseados" : "Agregar a deseados"}
              >
                <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            )}
            <button
              onClick={handleAdd}
              disabled={isLoading || sinStock}
              aria-disabled={sinStock ? "true" : undefined}
              title={sinStock ? "Producto sin stock disponible" : "Agregar al carrito"}
              className={`p-2 rounded-full text-white transition-all duration-300 transform ${
                sinStock 
                  ? "opacity-50 bg-gray-500 cursor-not-allowed" 
                  : isXbox 
                    ? "bg-[#107C10] hover:bg-[#0c5f0c] hover:scale-110 cursor-pointer" 
                    : "bg-[#4a7bc8] hover:bg-[#3a5ba8] hover:scale-110 cursor-pointer"
              } ${isLoading ? "animate-pulse" : ""}`}
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
                <span className="text-xl font-bold text-[var(--color-primary)]">{formatearPrecio(price)}</span>
              </div>
            </div>

            <button
              onClick={handleCardClick}
              disabled={isLoading}
              className={`btn-primary text-sm px-4 py-2 cursor-pointer`}
            >
                <div className="flex items-center space-x-1 ">
                  <ShoppingCart size={16} />
                  <span>{sinStock ? "Ver detalle" : "Comprar"}</span>
                </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}