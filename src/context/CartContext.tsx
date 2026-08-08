"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { useAuth } from "./AuthContext"

export type CartItem = {
  producto_id: number
  title: string
  price: number
  quantity: number
  image: string
  stock: number
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  updateQuantity: (id: number, quantity: number) => void
  removeFromCart: (id: number) => void
  total: number
  updateCartItems: (items: CartItem[]) => void
  clearCart: () => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, logout } = useAuth()

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!user) return {}
    const token = await user.getIdToken()
    return { "Authorization": `Bearer ${token}` }
  }, [user])

  // Load cart from backend when user logs in
  useEffect(() => {
    if (!user) return

    const loadCart = async () => {
      setIsLoading(true)
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/ed/carrito`, { headers })
        if (res.status === 401) {
          await logout()
          return
        }
        if (res.ok) {
          const backendItems: CartItem[] = await res.json()

          // Merge local (guest) cart with backend cart
          setCartItems(prev => {
            if (prev.length === 0) return backendItems

            // Upload any local items not yet in backend
            const mergedMap = new Map(backendItems.map(i => [i.producto_id, i]))
            prev.forEach(localItem => {
              if (mergedMap.has(localItem.producto_id)) {
                const existing = mergedMap.get(localItem.producto_id)!
                const merged = { ...existing, quantity: Math.min(existing.stock, existing.quantity + localItem.quantity) }
                mergedMap.set(localItem.producto_id, merged)
              } else {
                mergedMap.set(localItem.producto_id, localItem)
              }
            })
            const merged = Array.from(mergedMap.values())
            // Sync merged cart to backend
            merged.forEach(item => syncToBackend(item.producto_id, item.quantity))
            return merged
          })
        }
      } catch (e) {
        console.error("Error loading cart", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user?.uid])

  // Clear cart items when user logs out
  useEffect(() => {
    if (!user) {
      setCartItems([])
    }
  }, [user])

  const syncToBackend = async (productoId: number, cantidad: number) => {
    if (!user) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/ed/carrito`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ producto_id: productoId, cantidad }),
      })
      if (res.status === 401) {
        await logout()
      }
    } catch (e) {
      console.error("Error syncing cart to backend", e)
    }
  }

  const removeFromBackend = async (productoId: number) => {
    if (!user) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/ed/carrito/${productoId}`, {
        method: "DELETE",
        headers,
      })
      if (res.status === 401) {
        await logout()
      }
    } catch (e) {
      console.error("Error removing from cart backend", e)
    }
  }

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.producto_id === item.producto_id)
      let newItems: CartItem[]
      if (existingItem) {
        const newQty = Math.min(existingItem.stock, existingItem.quantity + 1)
        newItems = prevItems.map(i => (i.producto_id === item.producto_id ? { ...i, quantity: newQty } : i))
        if (user) syncToBackend(item.producto_id, newQty)
      } else {
        if (item.stock <= 0) return prevItems
        newItems = [...prevItems, { ...item, quantity: 1 }]
        if (user) syncToBackend(item.producto_id, 1)
      }
      return newItems
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCartItems(prevItems =>
        prevItems.map(i => {
          if (i.producto_id === id) {
            const checkedQty = Math.min(i.stock, quantity)
            if (user) syncToBackend(id, checkedQty)
            return { ...i, quantity: checkedQty }
          }
          return i
        })
      )
    }
  }

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.producto_id !== id))
    if (user) removeFromBackend(id)
  }

  const clearCart = async () => {
    setCartItems([])
    if (user) {
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${API_URL}/ed/carrito`, { method: "DELETE", headers })
        if (res.status === 401) {
          await logout()
        }
      } catch (e) {
        console.error("Error clearing cart", e)
      }
    }
  }

  const updateCartItems = (items: CartItem[]) => {
    setCartItems(items)
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, total, updateCartItems, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
