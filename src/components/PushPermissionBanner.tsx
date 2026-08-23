import type React from "react"
import { useState, useEffect } from "react"
import { Bell, BellOff, X } from "lucide-react"
import { isPushSupported, getPermissionState, subscribeToPush } from "../lib/pushNotifications"

const DISMISSED_KEY = "push-banner-dismissed"

export const PushPermissionBanner: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => {
        // Evalúa las tres condiciones de visibilidad
        if (!isPushSupported()) return
        if (getPermissionState() !== "default") return
        if (localStorage.getItem(DISMISSED_KEY) === "1") return
        setVisible(true)
    }, [])

    const handleAccept = async () => {
        setLoading(true)
        try {
            const result = await subscribeToPush()
            if (result === "ok") {
                setSuccessMsg("¡Listo! Te avisaremos sobre el estado de tu pedido.")
                setTimeout(() => setVisible(false), 2500)
            } else if (result === "denied") {
                // El usuario denegó el permiso del navegador: ocultar sin guardar en LS
                setVisible(false)
            } else {
                // "error"
                console.error("[PushBanner] Error al suscribirse al push")
                setVisible(false)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "1")
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div
            id="push-permission-banner"
            role="region"
            aria-label="Activar notificaciones"
            className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-primary)]/30 bg-[var(--color-background)]/95 backdrop-blur-md shadow-lg animate-fade-in-scale"
            style={{ marginTop: "1rem" }}
        >
            {/* Borde superior decorativo */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                style={{
                    background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary, var(--color-primary)))",
                    opacity: 0.7,
                }}
            />

            <div className="p-5">
                {successMsg ? (
                    /* Estado de éxito */
                    <div className="flex items-center gap-3 text-[var(--color-success)]">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center flex-shrink-0">
                            <Bell size={18} />
                        </div>
                        <p className="text-sm font-semibold">{successMsg}</p>
                    </div>
                ) : (
                    /* Banner principal */
                    <div className="flex items-start gap-4">
                        {/* Icono */}
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "var(--color-primary)",
                                opacity: 0.9,
                            }}
                        >
                            <Bell size={20} className="text-white" />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--color-foreground)] leading-snug mb-0.5">
                                ¿Te avisamos cuándo llega tu pedido?
                            </p>
                            <p className="text-xs text-[var(--color-foreground)]/65 leading-relaxed">
                                Activá las notificaciones y seguí el estado de tu compra en tiempo real.
                            </p>

                            {/* Botones */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <button
                                    id="push-banner-accept-btn"
                                    onClick={handleAccept}
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                            <span>Activando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bell size={13} />
                                            <span>Sí, avisame</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    id="push-banner-dismiss-btn"
                                    onClick={handleDismiss}
                                    disabled={loading}
                                    className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <BellOff size={13} />
                                    <span>Ahora no</span>
                                </button>
                            </div>
                        </div>

                        {/* Cerrar (X) — equivalente a "Ahora no" */}
                        <button
                            id="push-banner-close-btn"
                            onClick={handleDismiss}
                            aria-label="Cerrar banner de notificaciones"
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-foreground)]/40 hover:text-[var(--color-foreground)]/80 hover:bg-[var(--color-muted)] transition-all cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
