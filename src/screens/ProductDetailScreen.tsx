"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Star, 
  Heart,
  Gamepad2,
  Plus,
  Minus,
  Share
} from "lucide-react"
import { formatearPrecio } from "../utils/formatearPrecio"
import type { Producto } from "../types/Producto"

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState("light")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

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
    const fetchProducto = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/${id}`)
        if (!response.ok) {
          throw new Error("Error al obtener el producto")
        }

        const data = await response.json()
        setProducto(data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducto()
  }, [id])

  const handleAddToCart = async () => {
    if (!producto) return
    
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (let i = 0; i < quantity; i++) {
      addToCart({
        producto_id: producto.id,
        title: producto.nombre,
        price: producto.precio,
        image: producto.imagen,
      })
    }

    setIsAddingToCart(false)
  }

  const handleBuyNow = async () => {
    if (!producto) return
    
    setIsBuying(true)
    
    // Primero agregar al carrito
    for (let i = 0; i < quantity; i++) {
      addToCart({
        producto_id: producto.id,
        title: producto.nombre,
        price: producto.precio,
        image: producto.imagen,
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Navegar al checkout o carrito
    navigate("/checkout")
    setIsBuying(false)
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto?.nombre,
          text: `Mira este producto: ${producto?.nombre}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const isXbox = theme === "light"

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-16">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[var(--color-muted)] rounded mr-4"></div>
              <div className="w-32 h-6 bg-[var(--color-muted)] rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="w-full h-96 bg-[var(--color-muted)] rounded-lg"></div>
              <div className="space-y-4">
                <div className="w-3/4 h-8 bg-[var(--color-muted)] rounded"></div>
                <div className="w-1/2 h-6 bg-[var(--color-muted)] rounded"></div>
                <div className="w-full h-24 bg-[var(--color-muted)] rounded"></div>
                <div className="w-1/3 h-12 bg-[var(--color-muted)] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-16 flex items-center justify-center">
        <div className="text-center animate-fade-in-scale">
          <div
            className={`w-16 h-16 rounded-full ${isXbox ? "bg-red-100" : "bg-red-900/20"} flex items-center justify-center mb-4 mx-auto`}
          >
            <span className="text-2xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
          <p className="text-[var(--color-foreground)]/70 mb-4">
            {error || "El producto que buscas no existe o ha sido eliminado."}
          </p>
          <button onClick={() => navigate("/catalog")} className="btn-primary">
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors duration-300"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Imagen del producto */}
          <div className="card p-6">
            <div className="relative overflow-hidden rounded-lg bg-[var(--color-muted)]">
              {!imageLoaded && <div className="absolute inset-0 shimmer"></div>}
              
              <img
                className={`w-full h-96 object-cover transition-all duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                src={producto.imagen || "/placeholder.svg"}
                alt={producto.nombre}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Botón de compartir */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-300"
                title="Compartir producto"
              >
                <Share size={20} className="text-gray-700" />
              </button>

              {/* Botón de favoritos */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-300 ${
                  isFavorite 
                    ? "bg-red-500 text-white" 
                    : "bg-white/80 hover:bg-white text-gray-700"
                }`}
                title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y precio */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="game-title text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {producto.nombre}
                  </h1>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-[var(--color-foreground)]/70">(4.8) 124 reseñas</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-primary)]">
                    {formatearPrecio(producto.precio)}
                  </div>
                  <div className="text-sm text-[var(--color-foreground)]/70">
                    Impuestos incluidos
                  </div>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Cantidad</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                    isXbox 
                      ? "bg-[#107C10] hover:bg-[#0c5f0c]" 
                      : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"
                  } ${isBuying ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"}`}
                >
                  {isBuying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard size={20} />
                      <span>Comprar ahora</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-3 px-6 rounded-lg font-semibold border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Agregando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ShoppingCart size={20} />
                      <span>Agregar al carrito</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Gamepad2 size={20} className="mr-2" />
                Detalles del juego
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-foreground)]/70">Plataforma:</span>
                  <span className="font-medium">Múltiples consolas</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-foreground)]/70">Género:</span>
                  <span className="font-medium">Acción/Aventura</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-foreground)]/70">Clasificación:</span>
                  <span className="font-medium">T (Teen)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[var(--color-foreground)]/70">Disponibilidad:</span>
                  <span className="font-medium text-green-500">En stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}