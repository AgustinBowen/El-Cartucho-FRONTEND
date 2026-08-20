"use client"

import type React from "react"

import { useCart } from "../context/CartContext"
import { useState, useEffect } from "react"
import { ShoppingCart, Trash2, CreditCard, ArrowLeft, Plus, Minus, MapPin, Mail, Loader2, AlertTriangle, AlertCircle, Lock } from "lucide-react"
import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { formatearPrecio } from "../utils/formatearPrecio"
import { useAuth, isProfileIncomplete } from "../context/AuthContext"
import { PedidoPendienteBanner, type PendingOrder } from "../components/PedidoPendienteBanner"

export const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, total, updateCartItems, refreshCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isXbox } = useTheme()
  const { user, profile, updateProfileData } = useAuth()

  // Estado para pedido pendiente activo
  const [activePendingOrder, setActivePendingOrder] = useState<PendingOrder | null>(null)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflictActionLoading, setConflictActionLoading] = useState<"retry" | "cancel" | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    apellido: "",
    domicilio: "",
    ciudad: "",
    codigo_postal: "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileFormError, setProfileFormError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setProfileFormData({
        name: profile.name || "",
        apellido: profile.apellido || "",
        domicilio: profile.domicilio || "",
        ciudad: profile.ciudad || "",
        codigo_postal: profile.codigo_postal || "",
      })
    }
  }, [profile])

  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileFormError(null)

    if (!profileFormData.name.trim()) {
      setProfileFormError("El nombre es requerido.")
      return
    }
    if (!profileFormData.apellido.trim()) {
      setProfileFormError("El apellido es requerido.")
      return
    }
    if (!profileFormData.domicilio.trim()) {
      setProfileFormError("El domicilio es requerido.")
      return
    }
    if (!profileFormData.ciudad.trim()) {
      setProfileFormError("La ciudad es requerida.")
      return
    }
    if (!profileFormData.codigo_postal.trim() || !/^\d{4}$/.test(profileFormData.codigo_postal.trim())) {
      setProfileFormError("El código postal debe tener exactamente 4 dígitos.")
      return
    }

    setSavingProfile(true)
    try {
      await updateProfileData(profileFormData)
      setCodigoPostal(profileFormData.codigo_postal.trim())
    } catch (err) {
      setProfileFormError("Error al actualizar el perfil. Intentá nuevamente.")
    } finally {
      setSavingProfile(false)
    }
  }
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  // Auto-fill email and CP from profile
  const [codigoPostal, setCodigoPostal] = useState(profile?.codigo_postal ?? "")
  const [costoEnvio, setCostoEnvio] = useState<number | null>(null)
  const [validandoCP, setValidandoCP] = useState(false)
  const [errorCP, setErrorCP] = useState<string | null>(null)
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "")
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.codigo_postal && !codigoPostal) {
      setCodigoPostal(profile.codigo_postal)
    }
    if ((profile?.email || user?.email) && !email) {
      setEmail(profile?.email ?? user?.email ?? "")
    }
  }, [profile, user])

  // Estado para advertencias de stock
  const [stockWarnings, setStockWarnings] = useState<string[]>([])

  // Imagen de fondo única
  const backgroundImage = isXbox
    ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
    : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

  // Precargar imagen de fondo y validar stock
  useEffect(() => {
    const img = new Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = backgroundImage
  }, [backgroundImage])

  useEffect(() => {
    const revalidateStock = async () => {
      if (cartItems.length === 0) return

      let adjusted = false
      const warnings: string[] = []

      const updatedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/${item.producto_id}`)
            if (response.ok) {
              const productData = await response.json()
              const liveStock = productData.stock ?? 0

              let newQty = item.quantity
              if (item.quantity > liveStock) {
                newQty = liveStock
                adjusted = true
                if (liveStock === 0) {
                  warnings.push(`"${item.title}" se quedó sin stock y fue removido del carrito.`)
                } else {
                  warnings.push(`El stock de "${item.title}" disminuyó. Cantidad ajustada a ${liveStock}.`)
                }
              }

              return { ...item, stock: liveStock, quantity: newQty }
            }
          } catch (err) {
            console.error("Error revalidating stock for item:", item.producto_id, err)
          }
          return item
        })
      )

      const finalItems = updatedItems.filter(item => item.quantity > 0)
      if (finalItems.length !== updatedItems.length) {
        adjusted = true
      }

      if (adjusted) {
        updateCartItems(finalItems)
      }

      if (warnings.length > 0) {
        setStockWarnings(warnings)
      }
    }

    revalidateStock()
  }, [])

  const handleConfirmPurchase = async (skipPendingCheck = false) => {
    // Require login
    if (!user) {
      setError("Debes iniciar sesión para completar la compra.")
      return
    }
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

    // Si hay un pedido pendiente activo y no se salteó la verificación -> abrir modal de conflicto
    if (!skipPendingCheck && activePendingOrder) {
      setConflictError(null)
      setShowConflictModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await user.getIdToken()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-protection-bypass": import.meta.env.protectionBypassToken,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productos: cartItems.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.quantity,
          })),
          email: email,
          codigo_postal: codigoPostal,
          domicilio: profile?.domicilio ?? "",
          ciudad: profile?.ciudad ?? "",
          costo_envio: costoEnvio,
        }),
      })

      if (response.status === 401) {
        throw new Error("Tu sesión expiró o no tenés permiso. Por favor, iniciá sesión nuevamente.")
      }

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json()
          if (errorData.code === "PEDIDO_PENDIENTE_EXISTENTE") {
            setActivePendingOrder({
              id: errorData.pedido_id,
              total: 0,
              expira_at: null,
              init_point_disponible: true,
            })
            setShowConflictModal(true)
            return
          }
          throw new Error(errorData.error || errorData.message || "Stock insuficiente para completar la compra.")
        }
        throw new Error(`Error al crear pedido: ${response.statusText}`)
      }

      const data = await response.json()
      await refreshCart()
      window.location.href = data.mercado_pago_url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleConflictRetry = async () => {
    if (!activePendingOrder || !user) return
    setConflictActionLoading("retry")
    setConflictError(null)

    try {
      const token = await user.getIdToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/${activePendingOrder.id}/reintentar-pago`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.init_point) {
          window.location.href = data.init_point
          return
        }
      }

      if (res.status === 409) {
        const errData = await res.json()
        if (errData.code === "RESERVA_EXPIRADA") {
          setConflictError("La reserva expiró. Armá el pedido de nuevo.")
          setActivePendingOrder(null)
        } else if (errData.code === "SIN_LINK_PAGO") {
          setConflictError("No se puede retomar este pedido.")
        } else if (errData.code === "ESTADO_NO_VALIDO") {
          setConflictError("El estado del pedido cambió.")
          setActivePendingOrder(null)
        } else {
          setConflictError(errData.error || "No se pudo reintentar el pago.")
        }
      } else {
        setConflictError("Error al generar el link de pago.")
      }
    } catch (err) {
      setConflictError("Error de conexión al reintentar el pago.")
    } finally {
      setConflictActionLoading(null)
    }
  }

  const handleConflictCancelAndCreateNew = async () => {
    if (!activePendingOrder || !user) return
    setConflictActionLoading("cancel")
    setConflictError(null)

    try {
      const token = await user.getIdToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/${activePendingOrder.id}/cancelar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await refreshCart()
        setShowConflictModal(false)
        setActivePendingOrder(null)
        // Proceder con la creación del nuevo pedido
        await handleConfirmPurchase(true)
        return
      }

      if (res.status === 409) {
        const errData = await res.json()
        if (errData.code === "PAGO_EN_CURSO") {
          setConflictError("Detectamos un pago en proceso, esperá unos segundos")
        } else if (errData.code === "ESTADO_NO_VALIDO") {
          setConflictError("El estado del pedido cambió.")
          setActivePendingOrder(null)
        } else {
          setConflictError(errData.error || "No se pudo cancelar el pedido anterior.")
        }
      } else {
        setConflictError("Error al cancelar el pedido anterior.")
      }
    } catch (err) {
      setConflictError("Error de conexión al cancelar el pedido anterior.")
    } finally {
      setConflictActionLoading(null)
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

      if (response.status === 418 || response.status === 422) {
        const errorData = await response.json()
        setErrorCP(errorData.message || errorData.error || "El código postal ingresado no es válido.")
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
      className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${
        backgroundLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay único para toda la página */}
      <div
        className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
        style={{ opacity: isXbox ? 0.3 : 0.85 }}
      ></div>

      {/* Todo el contenido dentro del contenedor principal */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full py-12 px-4">
          <div className="max-w-screen-xl mx-auto animate-fade-in-up">
            <div className="flex items-center mb-4">
              {isXbox ? (
                <img
                  className="w-32 h-32"
                  src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750487805/koopatroopasmall_ylfqpo.gif"
                  alt="KoopaTroopa"
                  loading="eager"
                />
              ) : (
                <img
                  className="w-32 h-32"
                  src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750487784/donkeykong_lcc3en.gif"
                  alt="DonkeyKong"
                  loading="eager"
                />
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

          <PedidoPendienteBanner
            onPendingOrderChange={setActivePendingOrder}
            className="mb-6 animate-fade-in-up"
          />

          {stockWarnings.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border-2 border-orange-500 bg-orange-950/90 backdrop-blur-md shadow-lg shadow-orange-900/30 animate-fade-in-up">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-white text-base">
                <AlertTriangle className="text-orange-400 flex-shrink-0" size={22} />
                Ajustes de stock en tu carrito:
              </h4>
              <ul className="space-y-1.5 pl-1">
                {stockWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-100">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                <h2 className="text-2xl font-bold mb-6 animate-fade-in-up text-white">
                  Productos ({cartItems.length})
                </h2>

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
                          loading="lazy"
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
                              disabled={item.quantity >= item.stock}
                              className={`w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center transition-colors ${
                                item.quantity >= item.stock
                                  ? "opacity-50 cursor-not-allowed bg-[var(--color-muted)]"
                                  : "cursor-pointer hover:bg-[var(--color-muted)]"
                              }`}
                            >
                              <Plus size={14} />
                            </button>
                            {item.quantity >= item.stock && (
                              <span className="text-xs text-orange-400 font-medium">Límite de stock alcanzado</span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm text-[var(--color-foreground)]/70">
                              {formatearPrecio(item.price)} c/u
                            </div>
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
                        className={`cursor-pointer px-4 py-2 rounded-xl font-semibold text-white transition-all bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {validandoCP ? <Loader2 size={16} className="animate-spin" /> : "Calcular Envío"}
                      </button>
                    </div>

                    {errorCP && <p className="text-red-500 text-sm">{errorCP}</p>}

                    {profile?.codigo_postal && codigoPostal.trim() !== "" && codigoPostal.trim() !== profile.codigo_postal.trim() && (
                      <p className="text-xs text-blue-400 dark:text-blue-300 font-medium mt-1">
                        ℹ️ El pedido se enviará a este código postal (CP {codigoPostal}), no al de tu perfil ({profile.codigo_postal}).
                      </p>
                    )}

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

                  {/* Checkout Button, Profile Form, or Login Prompt */}
                  {!user ? (
                    <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-primary)]/40 text-center">
                      <Lock size={24} className="mx-auto mb-2 text-[var(--color-primary)]" />
                      <p className="text-sm font-medium mb-1">Iniciá sesión para comprar</p>
                      <p className="text-xs text-[var(--color-foreground)]/60">Necesitás una cuenta para completar tu compra.</p>
                    </div>
                  ) : isProfileIncomplete(profile) ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                        <AlertTriangle size={18} />
                        <span>Completá tu perfil para continuar</span>
                      </div>
                      <p className="text-xs text-[var(--color-foreground)]/70">
                        Para poder procesar el envío necesitaremos tus datos personales completos.
                      </p>
                      {profileFormError && (
                        <p className="text-xs text-red-500 font-medium">{profileFormError}</p>
                      )}
                      <form onSubmit={handleProfileFormSubmit} className="space-y-3 text-xs">
                        <div>
                          <label htmlFor="cart_profile_name" className="block mb-1 font-medium">Nombre</label>
                          <input
                            id="cart_profile_name"
                            type="text"
                            value={profileFormData.name}
                            onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                            className="input w-full"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cart_profile_apellido" className="block mb-1 font-medium">Apellido</label>
                          <input
                            id="cart_profile_apellido"
                            type="text"
                            value={profileFormData.apellido}
                            onChange={(e) => setProfileFormData({ ...profileFormData, apellido: e.target.value })}
                            className="input w-full"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cart_profile_domicilio" className="block mb-1 font-medium">Domicilio</label>
                          <input
                            id="cart_profile_domicilio"
                            type="text"
                            value={profileFormData.domicilio}
                            onChange={(e) => setProfileFormData({ ...profileFormData, domicilio: e.target.value })}
                            className="input w-full"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor="cart_profile_ciudad" className="block mb-1 font-medium">Ciudad</label>
                            <input
                              id="cart_profile_ciudad"
                              type="text"
                              value={profileFormData.ciudad}
                              onChange={(e) => setProfileFormData({ ...profileFormData, ciudad: e.target.value })}
                              className="input w-full"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="cart_profile_cp" className="block mb-1 font-medium">CP (4 dígitos)</label>
                            <input
                              id="cart_profile_cp"
                              type="text"
                              value={profileFormData.codigo_postal}
                              onChange={(e) => setProfileFormData({ ...profileFormData, codigo_postal: e.target.value })}
                              maxLength={4}
                              className="input w-full"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className={`w-full mt-2 cursor-pointer btn-primary ${savingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {savingProfile ? "Guardando datos..." : "Guardar datos y continuar"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirmPurchase(false)}
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
                  )}

                  {error && (
                    <div
                      className={`p-3 rounded-lg ${
                        isXbox ? "bg-red-100/80 text-red-700" : "bg-red-900/20 text-red-400"
                      }`}
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

      {/* Modal de conflicto cuando existe un pedido pendiente activo al intentar comprar */}
      {showConflictModal && activePendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-scale">
          <div className="card max-w-md w-full p-6 rounded-2xl shadow-2xl border-2 border-[var(--color-warning)]/40">
            <div className="flex items-center gap-3 mb-4" style={{ color: "var(--color-warning)" }}>
              <AlertTriangle size={28} />
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">Tenés un pedido pendiente</h3>
            </div>
            <p className="text-sm text-[var(--color-foreground)]/75 mb-6">
              Ya tenés un pedido esperando pago por{" "}
              <strong style={{ color: "var(--color-warning)" }}>{formatearPrecio(activePendingOrder.total)}</strong>
              . Para proceder con una nueva compra, elegí una opción:
            </p>

            {conflictError && (
              <div className="mb-4 p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{conflictError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConflictRetry}
                disabled={conflictActionLoading !== null}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {conflictActionLoading === "retry" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                <span>Completar el pago pendiente</span>
              </button>

              <button
                onClick={handleConflictCancelAndCreateNew}
                disabled={conflictActionLoading !== null}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-[var(--color-error)] border-[var(--color-error)]/30 hover:border-[var(--color-error)]/60 hover:bg-[var(--color-error)]/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {conflictActionLoading === "cancel" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Cancelar anterior y crear uno nuevo</span>
              </button>

              <button
                onClick={() => {
                  setShowConflictModal(false)
                  setConflictError(null)
                }}
                disabled={conflictActionLoading !== null}
                className="w-full py-2 rounded-xl text-xs font-medium text-[var(--color-foreground)]/50 hover:text-[var(--color-foreground)]/80 cursor-pointer transition-colors bg-transparent border-none"
              >
                Volver al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
