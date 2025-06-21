"use client"

import type React from "react"

import { useCart } from "../context/CartContext"
import { useState } from "react"
import { ShoppingCart, Trash2, CreditCard, ArrowLeft, Plus, Minus, MapPin, Mail, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { formatearPrecio } from "../utils/formatearPrecio"

export const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isXbox } = useTheme()

  // Nuevos estados para envío y email
  const [codigoPostal, setCodigoPostal] = useState("")
  const [costoEnvio, setCostoEnvio] = useState<number | null>(null)
  const [validandoCP, setValidandoCP] = useState(false)
  const [errorCP, setErrorCP] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  // Imagen de fondo única (igual que en Catalog)
  const backgroundImage = isXbox 
    ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
    : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

  const handleConfirmPurchase = async () => {
    // Validar que se haya ingresado email
    if (!email.trim()) {
      setEmailError("El email es requerido")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Ingresa un email válido")
      return
    }

    // Validar que se haya validado el código postal
    if (!codigoPostal.trim()) {
      setErrorCP("Debes ingresar un código postal")
      return
    }

    if (costoEnvio === null) {
      setErrorCP("Debes validar el código postal")
      return
    }

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
          email: email,
          codigo_postal: codigoPostal,
          costo_envio: costoEnvio,
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

  const validarCodigoPostal = async () => {
    if (!codigoPostal.trim()) {
      setErrorCP("Ingresa un código postal")
      return
    }

    setValidandoCP(true)
    setErrorCP(null)
    setCostoEnvio(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/costo/${codigoPostal}`)

      if (response.status === 418) {
        const errorData = await response.json()
        setErrorCP(errorData.message || "El código postal ingresado no es válido.")
        return
      }

      if (!response.ok) {
        throw new Error("Error al validar código postal")
      }

      const data = await response.json()
      setCostoEnvio(data.costo_envio)
      setErrorCP(null)
    } catch (err) {
      setErrorCP("Error al validar el código postal. Intenta nuevamente.")
    } finally {
      setValidandoCP(false)
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) {
      setEmailError(null)
    }
  }

  const handleCodigoPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodigoPostal(e.target.value)
    if (errorCP) {
      setErrorCP(null)
    }
    // Reset costo de envío cuando cambia el CP
    if (costoEnvio !== null) {
      setCostoEnvio(null)
    }
  }

  // Calcular total con envío
  const totalConEnvio = costoEnvio !== null ? total + costoEnvio : total

  return (
    <div 
      className="min-h-screen pt-16 relative"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay único para toda la página */}
      <div 
        className={`absolute inset-0 ${isXbox? "bg-[#141414]":"bg-[var(--color-background)]"}`}
        style={{ opacity: isXbox ? 0.30 : 0.85 }}
      ></div>

      {/* Todo el contenido dentro del contenedor principal */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full py-12 px-4">
          <div className="max-w-screen-xl mx-auto animate-fade-in-up">
            <div className="flex items-center mb-4">
              {isXbox ? (
                <img className="w-32 h-32" src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750487805/koopatroopasmall_ylfqpo.gif" alt="KoopaTroopa" />
              ) : (
                <img className="w-32 h-32" src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750487784/donkeykong_lcc3en.gif" alt="DonkeyKong" />
              )}
              <div>
                <h1 className="game-title text-4xl md:text-5xl text-white mb-2">Tu Carrito</h1>
                <p className="text-white/90 text-lg">Revisa tus productos y completa tu compra</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl flex flex-col mx-auto px-4 py-8">
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-end text-white hover:text-white/80 mb-8 group transition-colors animate-fade-in-up"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Continuar comprando
          </Link>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-scale">
              <div
                className={`w-32 h-32 rounded-full ${
                  isXbox ? "bg-gray-100/10" : "bg-gray-800/20"
                } flex items-center justify-center mb-8 mx-auto backdrop-blur-sm`}
              >
                <ShoppingCart size={64} className="text-white/60" />
              </div>
              <h2 className="game-title text-3xl font-bold mb-4 text-white">Tu carrito está vacío</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
                ¿No sabes qué comprar? ¡Cientos de juegos increíbles te esperan!
              </p>
              <Link to="/catalogo" className="btn-primary">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-6 animate-fade-in-up text-white">Productos ({cartItems.length})</h2>

                {cartItems.map((item, index) => (
                  <div
                    key={item.producto_id}
                    className=" card p-6 animate-fade-in-up backdrop-blur-sm bg-[var(--color-background)]/80"
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
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.producto_id)}
                            className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                              className="cursor-pointer w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.producto_id, item.quantity + 1)}
                              className="cursor-pointer w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm text-[var(--color-foreground)]/70">{formatearPrecio(item.price)} c/u</div>
                            <div className="text-xl font-bold text-[var(--color-primary)]">
                              {formatearPrecio(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-24 animate-fade-in-up space-y-6 backdrop-blur-sm bg-[var(--color-background)]/80">
                  <h3 className="text-xl font-bold">Resumen del pedido</h3>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      <Mail size={16} className="inline mr-2" />
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="tu@email.com"
                      className={`input ${emailError ? "border-red-500" : ""}`}
                    />
                    {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  </div>

                  {/* Shipping Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      <MapPin size={16} className="inline mr-2" />
                      Código Postal
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={codigoPostal}
                        onChange={handleCodigoPostalChange}
                        placeholder="1234"
                        className={`input flex-1 ${errorCP ? "border-red-500" : ""}`}
                        maxLength={4}
                      />
                      <button
                        onClick={validarCodigoPostal}
                        disabled={validandoCP || !codigoPostal.trim()}
                        className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                          validandoCP || !codigoPostal.trim()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : isXbox
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {validandoCP ? <Loader2 size={16} className="animate-spin" /> : "Calcular Envío"}
                      </button>
                    </div>

                    {errorCP && <p className="text-red-500 text-sm">{errorCP}</p>}

                    {costoEnvio !== null && (
                      <div className="p-3 bg-green-50 dark:bg-green-200/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                          Costo de envío: ${costoEnvio.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.length} productos)</span>
                      <span>{formatearPrecio(total)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>
                        {costoEnvio !== null ? (
                          `$${costoEnvio.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">A calcular</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-border)]">
                      <span>Total</span>
                      <span className="text-[var(--color-primary)]">{formatearPrecio(totalConEnvio)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={loading || !email.trim() || costoEnvio === null}
                    className={`w-full cursor-pointer btn-primary ${
                      loading || !email.trim() || costoEnvio === null ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                      className={`p-3 rounded-lg ${isXbox ? "bg-red-100/80 text-red-700" : "bg-red-900/20 text-red-400"}`}
                    >
                      <p className="text-sm font-medium">Error al procesar el pago</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Security Info */}
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center text-sm text-[var(--color-foreground)]/70">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Pago 100% seguro con Mercado Pago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}