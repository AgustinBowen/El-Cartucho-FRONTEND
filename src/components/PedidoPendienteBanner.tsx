import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { CronometroReserva } from "./CronometroReserva"
import { formatearPrecio } from "../utils/formatearPrecio"
import { AlertCircle, CreditCard, XCircle, Loader2, CheckCircle2 } from "lucide-react"

export type PendingOrderProduct = {
    producto_id: number
    nombre: string
    cantidad: number
    precio_unitario: number
    imagen?: string | null
}

export type PendingOrder = {
    id: number
    total: number
    expira_at: string | null
    init_point_disponible: boolean
    productos?: PendingOrderProduct[]
}

interface PedidoPendienteBannerProps {
    onPendingOrderChange?: (order: PendingOrder | null) => void
    className?: string
    compacto?: boolean
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const PedidoPendienteBanner: React.FC<PedidoPendienteBannerProps> = ({
    onPendingOrderChange,
    className = "",
    compacto = false,
}) => {
    const { user, loading: authLoading } = useAuth()
    const { refreshCart } = useCart()
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null)
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<"retry" | "cancel" | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const fetchPendingOrder = useCallback(async () => {
        if (!user) {
            setPendingOrder(null)
            onPendingOrderChange?.(null)
            return
        }

        setLoading(true)
        try {
            const token = await user.getIdToken()
            const res = await fetch(`${API_URL}/ed/pedido/pendiente`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                if (data && data.id) {
                    setPendingOrder(data)
                    onPendingOrderChange?.(data)
                } else {
                    setPendingOrder(null)
                    onPendingOrderChange?.(null)
                }
            } else {
                setPendingOrder(null)
                onPendingOrderChange?.(null)
            }
        } catch (err) {
            console.error("Error fetching pending order:", err)
            setPendingOrder(null)
            onPendingOrderChange?.(null)
        } finally {
            setLoading(false)
        }
    }, [user, onPendingOrderChange])

    useEffect(() => {
        if (!authLoading) {
            fetchPendingOrder()
        }
    }, [user?.uid, authLoading, fetchPendingOrder])

    const handleRetry = async () => {
        if (!pendingOrder || !user) return
        setActionLoading("retry")
        setErrorMsg(null)

        try {
            const token = await user.getIdToken()
            const res = await fetch(`${API_URL}/ed/pedido/${pendingOrder.id}/reintentar-pago`, {
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
                    setErrorMsg("La reserva expiró. Armá el pedido de nuevo.")
                    await fetchPendingOrder()
                } else if (errData.code === "SIN_LINK_PAGO") {
                    setErrorMsg("No se puede retomar este pedido.")
                } else if (errData.code === "ESTADO_NO_VALIDO") {
                    setErrorMsg("El estado del pedido cambió.")
                    await fetchPendingOrder()
                } else {
                    setErrorMsg(errData.error || "No se pudo reintentar el pago.")
                }
            } else {
                setErrorMsg("Error al generar el link de pago.")
            }
        } catch (err) {
            setErrorMsg("Error de conexión al reintentar el pago.")
        } finally {
            setActionLoading(null)
        }
    }

    const handleCancel = async () => {
        if (!pendingOrder || !user) return
        setActionLoading("cancel")
        setErrorMsg(null)
        setShowCancelConfirm(false)

        try {
            const token = await user.getIdToken()
            const res = await fetch(`${API_URL}/ed/pedido/${pendingOrder.id}/cancelar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.ok) {
                const data = await res.json()
                await refreshCart()

                let noticeMsg = "Pedido cancelado correctamente."
                if (data.ajustes && Array.isArray(data.ajustes) && data.ajustes.length > 0) {
                    const avisos = data.ajustes.map(
                        (a: { nombre: string; cantidad_final: number }) =>
                            `Agregamos ${a.nombre} pero solo había ${a.cantidad_final} disponible`
                    ).join(". ")
                    noticeMsg += ` ${avisos}.`
                }

                if (data.reposicion_carrito_ok === false) {
                    noticeMsg += " Algunos productos pueden no haber vuelto al carrito."
                }

                setSuccessMsg(noticeMsg)
                setPendingOrder(null)
                onPendingOrderChange?.(null)
                setTimeout(() => setSuccessMsg(null), 6000)
                return
            }

            if (res.status === 409) {
                const errData = await res.json()
                if (errData.code === "PAGO_EN_CURSO") {
                    setErrorMsg("Detectamos un pago en proceso. Esperá unos segundos y volvé a intentar.")
                } else if (errData.code === "ESTADO_NO_VALIDO") {
                    setErrorMsg("El estado del pedido cambió.")
                    await fetchPendingOrder()
                } else {
                    setErrorMsg(errData.error || "No se pudo cancelar el pedido.")
                }
            } else {
                setErrorMsg("Error al cancelar el pedido.")
            }
        } catch (err) {
            setErrorMsg("Error de conexión al cancelar el pedido.")
        } finally {
            setActionLoading(null)
        }
    }

    if (loading || authLoading) return null
    if (!pendingOrder && !successMsg) return null

    if (successMsg) {
        return (
            <div className={`p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] flex items-center gap-2 text-xs font-medium ${className}`}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
            </div>
        )
    }

    if (!pendingOrder) return null

    if (compacto) {
        return (
            <div className={`p-3 rounded-xl bg-[var(--color-background)]/92 backdrop-blur-md border border-[var(--color-warning)]/60 shadow-md ${className}`}>
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="font-bold text-[var(--color-warning)] text-xs block leading-snug">
                                Pedido pendiente: {formatearPrecio(pendingOrder.total)}
                            </span>
                            {pendingOrder.expira_at && (
                                <CronometroReserva
                                    expiraAt={pendingOrder.expira_at}
                                    onExpire={fetchPendingOrder}
                                />
                            )}
                        </div>

                        <button
                            onClick={handleRetry}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--color-warning)] hover:opacity-80 disabled:opacity-50 cursor-pointer transition-all shadow-sm flex-shrink-0"
                        >
                            {actionLoading === "retry" ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <CreditCard size={12} />
                            )}
                            <span>Pagar</span>
                        </button>
                    </div>

                    {pendingOrder.productos && pendingOrder.productos.length > 0 && (
                        <div className="mt-1 pt-1.5 border-t border-[var(--color-warning)]/20 max-h-28 overflow-y-auto space-y-1">
                            {pendingOrder.productos.map((prod) => (
                                <div key={prod.producto_id} className="flex items-center justify-between gap-2 p-1 rounded bg-[var(--color-warning)]/10 text-[11px]">
                                    <span className="font-medium text-[var(--color-foreground)] truncate flex-1">{prod.nombre}</span>
                                    <span className="text-[var(--color-foreground)]/70 font-semibold whitespace-nowrap">
                                        {prod.cantidad} × {formatearPrecio(prod.precio_unitario)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            disabled={actionLoading !== null}
                            className="text-xs text-[var(--color-error)] hover:underline cursor-pointer font-medium disabled:opacity-50 transition-all bg-transparent border-none p-0"
                        >
                            {actionLoading === "cancel" ? "Cancelando..." : "Cancelar pedido"}
                        </button>
                    </div>
                </div>

                {showCancelConfirm && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-warning)]/20 flex flex-col gap-2 text-xs">
                        <span className="text-[var(--color-foreground)]/80 font-medium text-[11px]">
                            ¿Cancelar pedido y liberar productos?
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-2.5 py-1 rounded bg-[var(--color-error)] hover:opacity-80 text-white font-bold text-xs cursor-pointer"
                            >
                                Sí, cancelar
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-2.5 py-1 rounded bg-[var(--color-muted)] text-[var(--color-foreground)]/70 font-medium text-xs cursor-pointer border border-[var(--color-border)]"
                            >
                                No, mantener
                            </button>
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="mt-2 p-2 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-[11px] font-medium flex items-center gap-1.5">
                        <AlertCircle size={13} />
                        <span>{errorMsg}</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`p-5 rounded-2xl bg-[var(--color-background)]/92 backdrop-blur-md border-2 border-[var(--color-warning)]/60 shadow-lg ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--color-warning)] text-base">
                            Tenés un pedido esperando pago por {formatearPrecio(pendingOrder.total)}
                        </span>
                    </div>
                    {pendingOrder.expira_at && (
                        <div className="pt-1">
                            <CronometroReserva
                                expiraAt={pendingOrder.expira_at}
                                onExpire={fetchPendingOrder}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleRetry}
                        disabled={actionLoading !== null}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {actionLoading === "retry" ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CreditCard size={14} />
                        )}
                        <span>Completar pago</span>
                    </button>

                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={actionLoading !== null}
                        className="btn-secondary flex items-center gap-2 text-[var(--color-error)] border-[var(--color-error)]/30 hover:border-[var(--color-error)]/60 hover:bg-[var(--color-error)]/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {actionLoading === "cancel" ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <XCircle size={14} />
                        )}
                        <span>Cancelar pedido</span>
                    </button>
                </div>
            </div>

            {pendingOrder.productos && pendingOrder.productos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-warning)]/20 space-y-2">
                    <span className="text-xs font-semibold text-[var(--color-foreground)]/80 block">
                        Productos en este pedido:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pendingOrder.productos.map((prod) => (
                            <div key={prod.producto_id} className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--color-warning)]/10">
                                {prod.imagen ? (
                                    <img src={prod.imagen} alt={prod.nombre} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded bg-[var(--color-muted)] flex items-center justify-center text-xs flex-shrink-0">🎮</div>
                                )}
                                <div className="min-w-0 flex-1 text-xs">
                                    <p className="font-bold text-[var(--color-foreground)] truncate">{prod.nombre}</p>
                                    <p className="text-[var(--color-foreground)]/60">
                                        {prod.cantidad} x {formatearPrecio(prod.precio_unitario)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showCancelConfirm && (
                <div className="mt-4 pt-3 border-t border-[var(--color-warning)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-[var(--color-foreground)]/80 font-medium">
                        ¿Cancelar el pedido pendiente? Se liberarán los productos reservados.
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 rounded-lg bg-[var(--color-error)] hover:opacity-80 text-white font-bold cursor-pointer"
                        >
                            Sí, cancelar
                        </button>
                        <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--color-muted)] text-[var(--color-foreground)]/70 font-medium cursor-pointer border border-[var(--color-border)]"
                        >
                            No, mantener
                        </button>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    )
}
