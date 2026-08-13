import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

export const PaymentFailureScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const externalReference = searchParams.get("external_reference") || searchParams.get("preference_id") || searchParams.get("payment_id")
    const { isXbox } = useTheme()

    const backgroundImage = isXbox
        ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
        : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

    const [backgroundLoaded, setBackgroundLoaded] = useState(false)

    useEffect(() => {
        const img = new Image()
        img.onload = () => setBackgroundLoaded(true)
        img.src = backgroundImage
    }, [backgroundImage])

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
                        <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-rose-500/40">
                            <XCircle className="w-12 h-12" />
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Pago no completado</h2>

                        {externalReference && (
                            <p className="text-sm font-medium text-rose-400 mb-4">
                                Número de referencia: #{externalReference}
                            </p>
                        )}

                        <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                            El pago no se pudo procesar correctamente y el pedido no ha sido confirmado.
                            Podés volver al carrito para intentar nuevamente con otro medio de pago.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/comprar" className="btn-primary flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Volver al carrito y reintentar
                            </Link>
                            <Link to="/catalogo" className="btn-secondary flex items-center justify-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Volver al catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
