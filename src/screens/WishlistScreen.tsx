import { useWishlist } from "../context/WishlistContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from "lucide-react"
import { useCart } from "../context/CartContext"
import { formatearPrecio } from "../utils/formatearPrecio"

export function WishlistScreen() {
    const { user, loading: authLoading } = useAuth()
    const { wishlist, removeFromWishlist, isLoading } = useWishlist()
    const { addToCart } = useCart()
    const { isXbox } = useTheme()
    const navigate = useNavigate()
    const [backgroundLoaded, setBackgroundLoaded] = useState(false)

    const backgroundImage = isXbox
        ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
        : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

    useEffect(() => {
        const img = new Image()
        img.onload = () => setBackgroundLoaded(true)
        img.src = backgroundImage
    }, [backgroundImage])

    useEffect(() => {
        if (!authLoading && !user) navigate("/")
    }, [user, authLoading, navigate])

    const handleAddToCart = (item: typeof wishlist[0]) => {
        addToCart({
            producto_id: item.producto_id,
            title: item.nombre,
            price: item.precio,
            image: item.image ?? "",
            stock: item.stock,
        })
    }

    if (authLoading || isLoading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"}`}
            style={{
                backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div
                className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
                style={{ opacity: isXbox ? 0.3 : 0.85 }}
            ></div>

            <div className="relative z-10 pb-12">
                {/* Header banner */}
                <div className={`}`}>
                    <div className="absolute inset-0 opacity-10" />
                    <div className="relative max-w-screen-xl mx-auto px-4 py-12">
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`p-3 rounded-xl ${isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"}`}>
                                <Heart size={28} className="text-white" fill="white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white game-title">Lista de Deseados</h1>
                                <p className="text-white/60 mt-1">{wishlist.length} {wishlist.length === 1 ? "producto guardado" : "productos guardados"}</p>
                            </div>
                        </div>
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mt-4"
                        >
                            <ArrowLeft size={16} />
                            Seguir explorando el catálogo
                        </Link>
                    </div>
                </div>

                <div className="max-w-screen-xl mx-auto px-4 py-8">
                    {wishlist.length === 0 ? (
                        <div className="text-center py-24 animate-fade-in-scale">
                            <div className="w-28 h-28 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-6">
                                <Heart size={56} className="text-[var(--color-foreground)]/20" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 game-title">Tu lista está vacía</h2>
                            <p className="text-[var(--color-foreground)]/60 mb-8 max-w-sm mx-auto">
                                Explorá el catálogo y guardá los productos que te interesan para comprarlos más tarde.
                            </p>
                            <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
                                <Star size={18} />
                                Explorar catálogo
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wishlist.map((item, index) => (
                                <div
                                    key={item.wishlist_id}
                                    className="card flex flex-col sm:flex-row gap-4 p-4 sm:p-5 animate-fade-in-up group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-[var(--color-background)]/90"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Image */}
                                    <Link to={`/producto/${item.producto_id}`} className="flex-shrink-0">
                                        <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-[var(--color-muted)]">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.nombre}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <Link
                                                to={`/producto/${item.producto_id}`}
                                                className="font-bold text-lg game-title hover:text-[var(--color-primary)] transition-colors line-clamp-2"
                                            >
                                                {item.nombre}
                                            </Link>
                                            <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">
                                                {formatearPrecio(item.precio)}
                                            </p>
                                            <p className={`text-sm mt-1 ${item.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                                                {item.stock > 0 ? `✓ En stock (${item.stock} disponibles)` : "✗ Sin stock"}
                                            </p>
                                            <p className="text-xs text-[var(--color-foreground)]/40 mt-1">
                                                Agregado el {new Date(item.created_at).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 items-center sm:flex-col sm:items-end">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={item.stock <= 0}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors ${item.stock > 0
                                                    ? isXbox
                                                        ? "bg-[#107C10] hover:bg-[#0c5f0c] cursor-pointer"
                                                        : "bg-[#4a7bc8] hover:bg-[#3a5ba8] cursor-pointer"
                                                    : "bg-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <ShoppingCart size={16} />
                                                <span className="hidden sm:inline">Agregar al carrito</span>
                                                <span className="sm:hidden">Agregar</span>
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlist(item.producto_id)}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors cursor-pointer"
                                                title="Eliminar de deseados"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
