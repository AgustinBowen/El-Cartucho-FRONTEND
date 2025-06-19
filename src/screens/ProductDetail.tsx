"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import type { Producto } from "../types/Producto"
import {
  ShoppingCart,
  ArrowLeft,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Gamepad2,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isXbox } = useTheme();
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/${id}`)


        if (!response.ok) {
          throw new Error("Producto no encontrado")
        }

        const data = await response.json()

        setProducto(data)
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

    setAddingToCart(true)

    // Simular delay para mostrar loading
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (let i = 0; i < quantity; i++) {
      addToCart({
        producto_id: producto.id,
        title: producto.nombre,
        price: producto.precio,
        image: getCurrentImage(),
      })
    }

    setAddingToCart(false)
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate("/comprar")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto?.nombre,
          text: `Mira este increíble producto: ${producto?.nombre}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("¡Enlace copiado al portapapeles!")
    }
  }

  const getCurrentImage = () => {
    if (producto?.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes[currentImageIndex]
    }
    return producto?.imagen || "/placeholder.svg"
  }

  const getImages = () => {
    if (producto?.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes
    }
    return producto?.imagen ? [producto.imagen] : ["/placeholder.svg"]
  }

  const nextImage = () => {
    const images = getImages()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setImageLoaded(false)
  }

  const prevImage = () => {
    const images = getImages()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setImageLoaded(false)
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
    setImageLoaded(false)
  }

  const maxQuantity = producto?.stock || 99
  const isOutOfStock = producto?.stock === 0
  const isLowStock = producto?.stock && producto.stock <= 5 && producto.stock > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-16 flex items-center justify-center">
        <span className="flex items-center">
          <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mr-2"></div>
          Cargando productos...
        </span>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-16 flex items-center justify-center">
        <div className="text-center animate-fade-in-scale">
          <div
            className={`w-24 h-24 rounded-full ${isXbox ? "bg-red-100" : "bg-red-900/20"} flex items-center justify-center mb-6 mx-auto`}
          >
            <span className="text-4xl">😞</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Producto no encontrado</h2>
          <p className="text-[var(--color-foreground)]/70 mb-6">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <Link to="/catalogo" className="btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const originalPrice = Math.floor(producto.precio * 1.2)
  const discount = Math.floor(((originalPrice - producto.precio) / originalPrice) * 100)
  const images = getImages()

  return (
    <div className={`min-h-screen bg-[var(--color-background)] pt-16 relative before:absolute before:inset-0 before:bg-[var(--color-background)] before:z-10 ${isXbox ? "before:opacity-20" : "before:opacity-85"
      }`}
      style={{
        backgroundImage: `url('${isXbox
          ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750316271/icegif-1062_cojpk2.gif"
          : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750306013/3td_ip4a6r.gif"
          }')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="relative z-20">
        {/* Breadcrumb */}
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-[var(--color-foreground)]/90 animate-fade-in-up">
            <Link to="/" className="hover:text-[var(--color-primary)]">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/catalogo" className="hover:text-[var(--color-primary)]">
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-[var(--color-primary)]">{producto.nombre}</span>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galería de imágenes */}
            <div className="animate-fade-in-up">
              <div className="space-y-4">
                {/* Imagen principal */}
                <div className="relative bg-[var(--color-muted)] rounded-2xl overflow-hidden group">
                  {!imageLoaded && (
                    <div className="absolute inset-0 shimmer flex items-center justify-center">
                      <Gamepad2 size={64} className="text-gray-400" />
                    </div>
                  )}

                  <img
                    src={getCurrentImage() || "/placeholder.svg"}
                    alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                    className={`w-full h-96 lg:h-[500px] object-cover transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {/* Navegación de imágenes */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Indicador de imagen actual */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => selectImage(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                              }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">

                    {isLowStock && (
                      <span className="px-3 py-1 text-sm font-bold text-white bg-orange-500 rounded-full">
                        ¡ÚLTIMAS UNIDADES!
                      </span>
                    )}

                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">

                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-300"
                      title="Compartir producto"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => selectImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentImageIndex
                          ? `border-[var(--color-primary)] ${isXbox ? "xbox-glow" : "ps2-glow"}`
                          : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                          }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Vista ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-6">
                {/* Título y categoría */}
                <div>
                  {producto.categoria && (
                    <div className="flex items-center mb-3">
                      <Tag size={16} className="mr-2 text-[var(--color-primary)]" />
                      <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wide">
                        {producto.categoria}
                      </span>
                    </div>
                  )}

                  <h1 className="game-title text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                    {producto.nombre}
                  </h1>

                </div>

                {/* Stock */}
                {producto.stock !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-[var(--color-primary)]" />
                    <span className="text-sm font-medium">
                      {isOutOfStock ? (
                        <span className="text-red-500 flex items-center">
                          <AlertTriangle size={16} className="mr-1" />
                          Sin stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-orange-500">Solo quedan {producto.stock} unidades</span>
                      ) : (
                        <span className="text-[var(--color-primary)">{producto.stock} unidades disponibles</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Precio */}
                <div className="space-y-2">
                  {discount > 0 && <span className="text-lg text-gray-500 line-through">${originalPrice}</span>}
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-[var(--color-primary)]">${producto.precio}</span>
                    {discount > 0 && (
                      <span className="px-2 py-1 text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                        Ahorra ${(originalPrice - producto.precio).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {producto.descripcion && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Info size={20} className="mr-2" />
                      Descripción
                    </h3>
                    <p className="text-[var(--color-foreground)]/80 leading-relaxed">{producto.descripcion}</p>
                  </div>
                )}

                {/* Subcategorías */}
                {producto.subcategorias && producto.subcategorias.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Características</h3>
                    <div className="flex flex-wrap gap-2">
                      {producto.subcategorias.map((subcategoria, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-full border border-[var(--color-border)]"
                        >
                          {subcategoria}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cantidad y acciones */}
                {!isOutOfStock && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">Cantidad:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                          className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {maxQuantity < 99 && (
                        <span className="text-sm text-[var(--color-foreground)]/70">Máx: {maxQuantity}</span>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <button
                        onClick={handleBuyNow}
                        disabled={addingToCart}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"
                          } ${addingToCart ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {addingToCart ? (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Agregando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center cursor-pointer">
                            <ShoppingCart size={24} className="mr-2" />
                            Comprar ahora
                          </div>
                        )}
                      </button>

                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full py-3 px-6 rounded-xl font-semibold bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:scale-105  cursor-pointer transition-all duration-300"
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                )}

                {/* Mensaje de sin stock */}
                {isOutOfStock && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center">
                      <AlertTriangle size={20} className="text-red-500 mr-2" />
                      <span className="font-medium text-red-700 dark:text-red-400">
                        Producto agotado - Te notificaremos cuando esté disponible
                      </span>
                    </div>
                  </div>
                )}

                {/* Garantías y beneficios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${isXbox ? "bg-green-100 text-green-600" : "bg-blue-900/20 text-blue-400"}`}
                    >
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Envíos</p>
                      <p className="text-xs text-[var(--color-foreground)]/70">A todo el pais</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${isXbox ? "bg-green-100 text-green-600" : "bg-blue-900/20 text-blue-400"}`}
                    >
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Garantía</p>
                      <p className="text-xs text-[var(--color-foreground)]/70">30 días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${isXbox ? "bg-green-100 text-green-600" : "bg-blue-900/20 text-blue-400"}`}
                    >
                      <RotateCcw size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Devoluciones</p>
                      <p className="text-xs text-[var(--color-foreground)]/70">Sin costo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón volver */}
          <div className="mt-12 animate-fade-in-up">
            <Link
              to="/catalogo"
              className="inline-flex font-semibold underline items-center text-[var(--color-link)] hover:text-[var(--color-link)]/80 group transition-colors"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
