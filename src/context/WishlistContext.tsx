import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { useAuth } from "./AuthContext"

type WishlistItem = {
  wishlist_id: number
  producto_id: number
  nombre: string
  precio: number
  stock: number
  image: string | null
  created_at: string
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  wishlistIds: Set<number>
  toggleWishlist: (productoId: number) => Promise<void>
  isInWishlist: (productoId: number) => boolean
  removeFromWishlist: (productoId: number) => Promise<void>
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType)

export const useWishlist = () => useContext(WishlistContext)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<number | null>(null)
  const { user, openAuthModal, logout, loading: authLoading } = useAuth()

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!user) return {}
    const token = await user.getIdToken()
    return { "Authorization": `Bearer ${token}` }
  }, [user])

  useEffect(() => {
    if (authLoading) return   // Esperar a que el AuthContext termine de inicializar
    if (!user) {
      setWishlist([])
      setWishlistIds(new Set())
      return
    }
    const loadWishlist = async () => {
      setIsLoading(true)
      try {
        // forceRefresh=true evita el 401 de race condition en login reciente
        const token = await user.getIdToken(true)
        const headers = { "Authorization": `Bearer ${token}` }
        const res = await fetch(`${API_URL}/ed/wishlist`, { headers })
        if (res.status === 401) {
          await logout()
          return
        }
        if (res.ok) {
          const data: WishlistItem[] = await res.json()
          setWishlist(data)
          setWishlistIds(new Set(data.map(i => i.producto_id)))
        }
      } catch (e) {
        console.error("Error loading wishlist", e)
      } finally {
        setIsLoading(false)
      }
    }
    loadWishlist()
  }, [user?.uid, authLoading])

  useEffect(() => {
    if (user && pendingProductId) {
      const prodId = pendingProductId
      setPendingProductId(null)
      toggleWishlist(prodId)
    }
  }, [user?.uid, pendingProductId])

  const toggleWishlist = async (productoId: number) => {
    if (!user) {
      setPendingProductId(productoId)
      openAuthModal()
      return
    }
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/ed/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ producto_id: productoId }),
      })
      if (res.status === 401) {
        await logout()
        return
      }
      if (res.ok) {
        const data = await res.json()
        if (data.action === "added") {
          setWishlistIds(prev => new Set([...prev, productoId]))
          // Reload full list to get item details
          const listRes = await fetch(`${API_URL}/ed/wishlist`, { headers: await getAuthHeaders() })
          if (listRes.ok) setWishlist(await listRes.json())
        } else {
          setWishlistIds(prev => { const s = new Set(prev); s.delete(productoId); return s })
          setWishlist(prev => prev.filter(i => i.producto_id !== productoId))
        }
      }
    } catch (e) {
      console.error("Error toggling wishlist", e)
    }
  }

  const removeFromWishlist = async (productoId: number) => {
    if (!user) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_URL}/ed/wishlist/${productoId}`, { method: "DELETE", headers })
      if (res.status === 401) {
        await logout()
        return
      }
      setWishlistIds(prev => { const s = new Set(prev); s.delete(productoId); return s })
      setWishlist(prev => prev.filter(i => i.producto_id !== productoId))
    } catch (e) {
      console.error("Error removing from wishlist", e)
    }
  }

  const isInWishlist = (productoId: number) => wishlistIds.has(productoId)

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistIds, toggleWishlist, isInWishlist, removeFromWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  )
}
