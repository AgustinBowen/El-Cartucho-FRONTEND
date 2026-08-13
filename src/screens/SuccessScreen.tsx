import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, Clock, XCircle, HelpCircle, ArrowLeft, ShoppingBag } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useCart } from "../context/CartContext"

export const SuccessScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const status = searchParams.get("status")
    const externalReference = searchParams.get("external_reference") || searchParams.get("preference_id")
    const { isXbox } = useTheme()
    const { clearCart } = useCart()

    const backgroundImage = isXbox
        ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
        : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

    const [backgroundLoaded, setBackgroundLoaded] = useState(false)

    // Limpiar el carrito solo si el pago fue exitoso o está en proceso
    // Si fue rechazado, el carrito se mantiene para que el usuario pueda reintentar
    useEffect(() => {
        if (status === "approved" || status === "pending" || status === "in_process") {
            clearCart()
        }
    }, [status])

    useEffect(() => {
        const img = new Image()
        img.onload = () => setBackgroundLoaded(true)
        img.src = backgroundImage
    }, [backgroundImage])

    const renderContent = () => {
        if (status === "approved") {
            return (
                <>
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-emerald-500/40">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">¡Gracias por tu compra!</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{externalReference.padStart(4, "0")}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        Se realizó correctamente el pago de tu producto. Nos comunicaremos pronto y recibirás novedades de tu compra.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2">
                            Ver mis pedidos
                        </Link>
                        <Link to="/catalogo" className="btn-secondary flex items-center justify-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Seguir comprando
                        </Link>
                    </div>
                </>
            )
        }

        if (status === "pending" || status === "in_process") {
            return (
                <>
                    <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-amber-500/40">
                        <Clock className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Pago en proceso</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{externalReference.padStart(4, "0")}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        Tu pago se encuentra en proceso de acreditación. Te avisaremos apenas se confirme.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2">
                            Ver mis pedidos
                        </Link>
                        <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
                            Ir al inicio
                        </Link>
                    </div>
                </>
            )
        }

        if (status === "rejected") {
            return (
                <>
                    <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-rose-500/40">
                        <XCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Pago no completado</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-rose-400 mb-4">
                            Referencia de pedido: #{externalReference}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        El pago fue rechazado por el medio de pago seleccionado. Podés reintentar desde el carrito.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/comprar" className="btn-primary flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Volver al carrito
                        </Link>
                    </div>
                </>
            )
        }

        return (
            <>
                <div className="w-20 h-20 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-[var(--color-primary)]/40">
                    <HelpCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Resultado del pago</h2>
                {externalReference && (
                    <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                        Referencia de pedido: #{externalReference}
                    </p>
                )}
                <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                    Se registró una actualización sobre la transacción de tu pedido. Podés consultar su estado en tu perfil.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2">
                        Ver mis pedidos
                    </Link>
                    <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
                        Ir al inicio
                    </Link>
                </div>
            </>
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
            {/* Overlay */}
            <div
                className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
                style={{ opacity: isXbox ? 0.3 : 0.85 }}
            />

            <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-8 text-center mb-8 animate-fade-in-scale">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}
