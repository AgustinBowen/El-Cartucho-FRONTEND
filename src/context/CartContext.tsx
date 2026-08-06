"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.producto_id === item.producto_id)
      if (existingItem) {
        const newQty = Math.min(existingItem.stock, existingItem.quantity + 1)
        return prevItems.map((i) => (i.producto_id === item.producto_id ? { ...i, quantity: newQty } : i))
      } else {
        // Asegurarse de no agregar si el stock es 0
        if (item.stock <= 0) return prevItems
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCartItems((prevItems) =>
        prevItems.map((i) => {
          if (i.producto_id === id) {
            const checkedQty = Math.min(i.stock, quantity)
            return { ...i, quantity: checkedQty }
          }
          return i
        })
      )
    }
  }

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.producto_id !== id))
  }

  const updateCartItems = (items: CartItem[]) => {
    setCartItems(items)
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, total, updateCartItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
