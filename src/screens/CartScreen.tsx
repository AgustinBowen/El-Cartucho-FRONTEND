"use client"

import { useCart } from "../context/CartContext"
import { useState, useEffect } from "react"
import { ShoppingCart, Trash2, CreditCard, ArrowLeft, Plus, Minus, Heart, Gift } from "lucide-react"
import { Link } from "react-router-dom"

export const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState("light")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [showPromoInput, setShowPromoInput] = useState(false)

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

  const isXbox = theme === "light"
  const consoleName = isXbox ? "Xbox 360" : "PlayStation 2"

  const handleConfirmPurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-protection-bypass": import.meta.env.protectionBypassToken,
        },
        body: JSON.stringify({
          productos: cartItems.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al crear pedido: ${response.statusText}`)
      }

      const data = await response.json()
      window.location.href = data.mercado_pago_url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId)
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "gaming10") {
      setPromoApplied(true)
      setShowPromoInput(false)
    } else {
      // Show error for invalid code
      alert("Código promocional inválido. Intenta con 'GAMING10'")
    }
  }

  const discount = promoApplied ? total * 0.1 : 0
  const finalTotal = total - discount

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16">
      {/* Header */}
      <div
        className={`w-full py-12 px-4 ${
          isXbox ? "bg-gradient-to-br from-green-500 to-green-700" : "bg-gradient-to-br from-blue-500 to-blue-700"
        }`}
      >
        <div className="max-w-screen-xl mx-auto animate-fade-in-up">
          <div className="flex items-center mb-4">
            <ShoppingCart className="mr-3 text-white" size={40} />
            <div>
              <h1 className="game-title text-4xl md:text-5xl text-white mb-2">Tu Carrito</h1>
              <p className="text-white/90 text-lg">Revisa tus productos y completa tu compra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <Link
          to="/catalogo"
          className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 mb-8 group transition-colors animate-fade-in-up"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Continuar comprando
        </Link>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-scale">
            <div
              className={`w-32 h-32 rounded-full ${
                isXbox ? "bg-gray-100" : "bg-gray-800"
              } flex items-center justify-center mb-8 mx-auto`}
            >
              <ShoppingCart size={64} className="text-gray-400" />
            </div>
            <h2 className="game-title text-3xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-[var(--color-foreground)]/70 mb-8 max-w-md mx-auto text-lg">
              ¿No sabes qué comprar? ¡Cientos de juegos increíbles te esperan!
            </p>
            <Link to="/catalogo" className="btn-primary">
              <ShoppingCart size={20} className="mr-2" />
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold mb-6 animate-fade-in-up">Productos ({cartItems.length})</h2>

              {cartItems.map((item, index) => (
                <div
                  key={item.producto_id}
                  className="card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 bg-[var(--color-muted)] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.parentElement!.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center text-2xl">🎮</div>'
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          <p className="text-sm text-[var(--color-foreground)]/70">Juego para {consoleName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.producto_id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.producto_id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.producto_id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm text-[var(--color-foreground)]/70">${item.price} c/u</div>
                          <div className="text-xl font-bold text-[var(--color-primary)]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Wishlist Suggestion */}
              <div className="card p-4 border-dashed animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart size={20} className="text-red-500 mr-2" />
                    <span className="text-sm">¿Quieres guardar algo para después?</span>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implement wishlist functionality
                      console.log("View wishlist clicked")
                    }}
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Ver lista de deseos
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24 animate-fade-in-up">
                <h3 className="text-xl font-bold mb-6">Resumen del pedido</h3>

                {/* Promo Code */}
                <div className="mb-6">
                  {!showPromoInput ? (
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className="flex items-center text-[var(--color-primary)] hover:underline"
                    >
                      <Gift size={16} className="mr-2" />
                      ¿Tienes un código promocional?
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Código promocional"
                          className="input flex-1"
                        />
                        <button onClick={applyPromoCode} className="btn-secondary px-4">
                          Aplicar
                        </button>
                      </div>
                      {promoApplied && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          ✓ Código aplicado: 10% de descuento
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} productos)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuento (GAMING10)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="text-green-600 dark:text-green-400">Gratis</span>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[var(--color-primary)]">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className={`w-full btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard size={20} className="mr-2" />
                      Proceder al pago
                    </div>
                  )}
                </button>

                {error && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      isXbox ? "bg-red-100 text-red-700" : "bg-red-900/20 text-red-400"
                    }`}
                  >
                    <p className="text-sm font-medium">Error al procesar el pago</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Security Info */}
                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center text-sm text-[var(--color-foreground)]/70">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    Pago 100% seguro con encriptación SSL
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
