"use client"

import type React from "react"
import { useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, X, Plus, Minus, Trash2, CreditCard } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { formatearPrecio } from "@/utils/formatearPrecio"

interface OffcanvasCartProps {
  isOpen: boolean
  onClose: () => void
}

export const OffcanvasCart: React.FC<OffcanvasCartProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart()
  const navigate = useNavigate()
  const { isXbox } = useTheme();

  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;

      // Bloquear el scroll del body
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restaurar el scroll del body
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restaurar la posición del scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function para restaurar el scroll al desmontar
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }
  }, [isOpen])

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate("/comprar")
  }

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId)
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ease-in-out ${isOpen
          ? 'backdrop-blur-sm bg-black/30 dark:bg-black/50'
          : 'backdrop-blur-0 bg-transparent pointer-events-none'
          }`}
        onClick={handleBackdropClick}
      />

      {/* Offcanvas */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-background)] shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          } ${isXbox ? "" : "ps2-glow"}`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b border-[var(--color-border)] ${isXbox ? "bg-gradient-to-r from-green-50 to-green-100" : "bg-gradient-to-r from-blue-900/10 to-blue-800/10"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart size={24} className="text-[var(--color-primary)] mr-3" />
              <div>
                <h2 className="text-xl font-bold">Tu Carrito</h2>
                <p className="text-sm text-[var(--color-foreground)]/70">
                  {cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
              title="Cerrar carrito"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div
                className={`w-20 h-20 rounded-full ${isXbox ? "bg-gray-100" : "bg-gray-800"
                  } flex items-center justify-center mb-4`}
              >
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Tu carrito está vacío</h3>
              <p className="text-[var(--color-foreground)]/70 mb-4">
                ¡Agrega algunos juegos increíbles!
              </p>
              <button
                onClick={onClose}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${isXbox ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                aria-label="Eliminar item de carrito"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.producto_id}
                    className="card p-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-[var(--color-muted)] rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.parentElement!.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center text-lg">🎮</div>'
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.producto_id)}
                            className="cursor-pointer p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                            title="Eliminar"
                            aria-label="Eliminar producto de carrito"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.producto_id, item.quantity - 1)}
                              className="cursor-pointer w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                              aria-label="Disminuir cantidad producto carrito"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.producto_id, item.quantity + 1)}
                              className="cursor-pointer w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
                              aria-label="Aumentar cantidad producto carrito"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm font-bold text-[var(--color-primary)]">
                              {formatearPrecio((item.price * item.quantity).toFixed(2))}
                            </div>
                            <div className="text-xs text-[var(--color-foreground)]/70">{formatearPrecio(item.price)} c/u</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--color-border)] p-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">${total.toFixed(2)}</span>
                </div>

                {/* Shipping Info */}
                <div className="text-center">
                  <p className="text-sm text-green-600 dark:text-green-400">Envío gratis en la zona</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-6">
                  <button
                    onClick={handleCheckout}
                    className={`cursor-pointer w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 ${isXbox ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    aria-label="Proceder al pago"
                  >
                    <div className="flex items-center justify-center">
                      <CreditCard size={20} className="mr-2" />
                      Proceder al pago
                    </div>
                  </button>

                  <button
                    onClick={onClose}
                    className="cursor-pointer w-full py-2 px-4 rounded-lg font-medium border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
                    aria-label="Continuar comprando"
                  >
                    Continuar comprando
                  </button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center text-xs text-[var(--color-foreground)]/70">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Compra 100% segura
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}