import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { CronometroReserva } from "./CronometroReserva"
import { formatearPrecio } from "../utils/formatearPrecio"
import { AlertCircle, CreditCard, XCircle, Loader2, CheckCircle2 } from "lucide-react"

export type PendingOrder = {
    id: number
    total: number
    expira_at: string | null
    init_point_disponible: boolean
}

interface PedidoPendienteBannerProps {
    onPendingOrderChange?: (order: PendingOrder | null) => void
    className?: string
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const PedidoPendienteBanner: React.FC<PedidoPendienteBannerProps> = ({
    onPendingOrderChange,
    className = "",
}) => {
    const { user, loading: authLoading } = useAuth()
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
                setSuccessMsg("Pedido cancelado correctamente.")
                setPendingOrder(null)
                onPendingOrderChange?.(null)
                setTimeout(() => setSuccessMsg(null), 4000)
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
            <div className={`p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 flex items-center gap-3 text-sm font-medium ${className}`}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
            </div>
        )
    }

    if (!pendingOrder) return null

    return (
        <div className={`p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/40 shadow-lg ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-900 dark:text-amber-200 text-base">
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 disabled:opacity-50 cursor-pointer transition-all"
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

            {showCancelConfirm && (
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-amber-800 dark:text-amber-300 font-medium">
                        ¿Cancelar el pedido pendiente? Se liberarán los productos reservados.
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                            Sí, cancelar
                        </button>
                        <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                        >
                            No, mantener
                        </button>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    )
}
