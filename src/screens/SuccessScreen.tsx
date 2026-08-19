"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { CheckCircle2, Loader2, Clock, AlertTriangle, ArrowRight } from "lucide-react"

type PollingStatus = "loading" | "success" | "timeout" | "expired" | "rejected"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const SuccessScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { clearCart } = useCart()
    const { user, loading: authLoading } = useAuth()
    const [status, setStatus] = useState<PollingStatus>("loading")
    const [pedidoId, setPedidoId] = useState<string | null>(null)

    const clearCartRef = useRef(clearCart)
    useEffect(() => {
        clearCartRef.current = clearCart
    })

    useEffect(() => {
        const extRef = searchParams.get("external_reference") || searchParams.get("pedido_id")
        if (!extRef) {
            setStatus("timeout")
            return
        }
        setPedidoId(extRef)

        if (authLoading) return

        let attempts = 0
        const maxAttempts = 15 // 30 seconds (15 * 2s)
        let timer: ReturnType<typeof setInterval> | null = null

        const pollStatus = async () => {
            attempts++
            try {
                const headers: Record<string, string> = {}
                if (user) {
                    const token = await user.getIdToken()
                    headers["Authorization"] = `Bearer ${token}`
                }

                const res = await fetch(`${API_URL}/ed/pedido/${extRef}/estado`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    const estado = data.estado_efectivo || data.estado_pago

                    if (estado === "pagado") {
                        setStatus("success")
                        clearCartRef.current()
                        return true
                    } else if (estado === "expirado") {
                        setStatus("expired")
                        return true
                    } else if (estado === "rechazado") {
                        setStatus("rejected")
                        return true
                    }
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
                if (isDone && timer) {
                    clearInterval(timer)
                }
            }, 2000)
        })

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [searchParams, user, authLoading])

    return (
        <div className="min-h-screen bg-[var(--color-background)] pt-24 px-4 pb-12">
            <div className="max-w-xl mx-auto">
                <div className="card p-8 text-center shadow-xl rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 animate-fade-in-scale">
                    {status === "loading" && (
                        <div className="py-6 space-y-4">
                            <Loader2 className="animate-spin text-[var(--color-primary)] mx-auto" size={56} />
                            <h2 className="text-2xl font-bold">Confirmando tu pago...</h2>
                            <p className="text-sm text-[var(--color-foreground)]/70 max-w-md mx-auto">
                                Por favor aguardá unos segundos mientras verificamos la transacción con MercadoPago.
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="py-4 space-y-4">
                            <CheckCircle2 className="text-green-500 mx-auto animate-bounce" size={60} />
                            <h2 className="text-3xl font-bold">¡Gracias por tu compra!</h2>
                            <p className="text-base text-[var(--color-foreground)]/80 max-w-md mx-auto">
                                Se realizó correctamente el pago de tu pedido {pedidoId ? `#${String(pedidoId).padStart(4, "0")}` : ""}. Nos comunicaremos pronto y recibirás novedades de tu compra.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                                <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
                                    <span>Ver mis pedidos</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/catalogo" className="px-6 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    Seguir comprando
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === "timeout" && (
                        <div className="py-4 space-y-4">
                            <Clock className="text-amber-500 mx-auto" size={60} />
                            <h2 className="text-2xl font-bold">Estamos confirmando tu pago</h2>
                            <p className="text-base text-[var(--color-foreground)]/80 max-w-md mx-auto">
                                El proceso puede demorar unos minutos. Tan pronto como MercadoPago procese la transacción, te avisamos por email.
                            </p>
                            <div className="pt-4 flex justify-center">
                                <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
                                    <span>Ir a mis pedidos</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === "expired" && (
                        <div className="py-4 space-y-4">
                            <AlertTriangle className="text-red-500 mx-auto" size={60} />
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">La reserva ha expirado</h2>
                            <p className="text-base text-[var(--color-foreground)]/80 max-w-md mx-auto">
                                El tiempo de reserva de los productos venció antes de confirmar el pago. Podés armar el pedido de nuevo desde el carrito.
                            </p>
                            <div className="pt-4 flex justify-center gap-3">
                                <Link to="/comprar" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
                                    <span>Ir al carrito</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === "rejected" && (
                        <div className="py-4 space-y-4">
                            <AlertTriangle className="text-red-500 mx-auto" size={60} />
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">El pago no pudo completarse</h2>
                            <p className="text-base text-[var(--color-foreground)]/80 max-w-md mx-auto">
                                MercadoPago rechazó o canceló la transacción. Podés reintentar el pago desde tu sección de pedidos.
                            </p>
                            <div className="pt-4 flex justify-center">
                                <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
                                    <span>Ir a mis pedidos</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
