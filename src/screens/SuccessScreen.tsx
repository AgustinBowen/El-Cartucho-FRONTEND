import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, Clock, XCircle, HelpCircle, ArrowLeft, ShoppingBag, Loader2, AlertTriangle } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { PushPermissionBanner } from "../components/PushPermissionBanner"

type PollingStatus = "loading" | "success" | "timeout" | "expired" | "rejected" | "desconocido"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const SuccessScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { isXbox } = useTheme()
    const { clearCart } = useCart()
    const { user, loading: authLoading } = useAuth()

    const [status, setStatus] = useState<PollingStatus>("loading")
    const [pedidoId, setPedidoId] = useState<string | null>(null)

    const backgroundImage = isXbox
        ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
        : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

    const [backgroundLoaded, setBackgroundLoaded] = useState(false)

    useEffect(() => {
        const img = new Image()
        img.onload = () => setBackgroundLoaded(true)
        img.src = backgroundImage
    }, [backgroundImage])

    const clearCartRef = useRef(clearCart)
    useEffect(() => {
        clearCartRef.current = clearCart
    })

    useEffect(() => {
        // Solo external_reference / pedido_id sirven para consultar el estado.
        // preference_id NO es el id del pedido.
        const extRef = searchParams.get("external_reference") || searchParams.get("pedido_id")
        if (!extRef) {
            setStatus("desconocido")
            return
        }
        setPedidoId(extRef)

        if (authLoading) return

        let attempts = 0
        const maxAttempts = 15 // 30 segundos (15 × 2s)
        let timer: ReturnType<typeof setInterval> | null = null

        const pollStatus = async (): Promise<boolean> => {
            attempts++
            try {
                const headers: Record<string, string> = {}
                if (user) {
                    const token = await user.getIdToken()
                    headers["Authorization"] = `Bearer ${token}`
                }

                const res = await fetch(`${API_URL}/ed/pedido/${extRef}/estado`, { headers })

                // Errores permanentes: no tiene sentido reintentar
                if (res.status === 403 || res.status === 404) {
                    setStatus("timeout")
                    return true
                }

                if (res.ok) {
                    const data = await res.json()
                    const estado = data.estado_efectivo || data.estado_pago

                    if (estado === "pagado") {
                        setStatus("success")
                        clearCartRef.current()
                        return true
                    }
                    if (estado === "expirado") {
                        setStatus("expired")
                        return true
                    }
                    if (estado === "rechazado") {
                        setStatus("rejected")
                        return true
                    }
                    // 'pendiente' → seguir esperando al webhook
                }
            } catch (err) {
                console.error("Error polling order status:", err)
            }

            if (attempts >= maxAttempts) {
                setStatus("timeout")
                return true
            }
            return false
        }

        pollStatus().then((done) => {
            if (done) return
            timer = setInterval(async () => {
                const isDone = await pollStatus()
                if (isDone && timer) clearInterval(timer)
            }, 2000)
        })

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [searchParams, user?.uid, authLoading])

    const numeroPedido = pedidoId ? String(pedidoId).padStart(4, "0") : null

    const renderContent = () => {
        if (status === "loading") {
            return (
                <>
                    <div className="w-20 h-20 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-[var(--color-primary)]/40">
                        <Loader2 className="w-12 h-12 animate-spin" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Confirmando tu pago...</h2>
                    {numeroPedido && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{numeroPedido}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        Aguardá unos segundos mientras verificamos la transacción con MercadoPago.
                    </p>
                </>
            )
        }

        if (status === "success") {
            return (
                <>
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-emerald-500/40">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">¡Gracias por tu compra!</h2>
                    {numeroPedido && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{numeroPedido}
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

        if (status === "timeout") {
            return (
                <>
                    <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-amber-500/40">
                        <Clock className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Estamos confirmando tu pago</h2>
                    {numeroPedido && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{numeroPedido}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        El proceso puede demorar unos minutos. Apenas MercadoPago procese la transacción, te avisamos por email.
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

        if (status === "expired") {
            return (
                <>
                    <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-rose-500/40">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">La reserva expiró</h2>
                    {numeroPedido && (
                        <p className="text-sm font-medium text-rose-400 mb-4">
                            Pedido #{numeroPedido}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        El tiempo de reserva de los productos venció antes de confirmar el pago. Podés armar el pedido de nuevo desde el carrito.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/comprar" className="btn-primary flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Volver al carrito
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
                    {numeroPedido && (
                        <p className="text-sm font-medium text-rose-400 mb-4">
                            Pedido #{numeroPedido}
                        </p>
                    )}
                    <p className="text-base text-[var(--color-foreground)]/70 mb-8">
                        El pago fue rechazado por el medio de pago seleccionado. Podés reintentar desde tu sección de pedidos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2">
                            Ver mis pedidos
                        </Link>
                        <Link to="/comprar" className="btn-secondary flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Volver al carrito
                        </Link>
                    </div>
                </>
            )
        }

        // desconocido: no vino external_reference en la URL
        return (
            <>
                <div className="w-20 h-20 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-[var(--color-primary)]/40">
                    <HelpCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">Resultado del pago</h2>
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
                    {/* Banner de notificaciones push — solo visible en éxito */}
                    {status === "success" && <PushPermissionBanner />}
                </div>
            </div>
        </div>
    )
}