import type React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Clock, User, ShoppingBag } from "lucide-react"

export const PaymentPendingScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const externalReference = searchParams.get("external_reference") || searchParams.get("preference_id") || searchParams.get("payment_id")

    return (
        <div className="min-h-screen bg-[var(--color-background)] pt-16">
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-8 text-center mb-8 animate-fade-in-scale">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Pago pendiente de acreditación</h2>

                        {externalReference && (
                            <p className="text-sm font-medium text-amber-500 mb-4">
                                Número de referencia: #{externalReference}
                            </p>
                        )}

                        <p className="text-lg text-[var(--color-foreground)]/80 mb-4">
                            Tu pago está pendiente de procesamiento. Si realizaste una transferencia bancaria o abonaste en efectivo (tipo Rapipago o Pago Fácil), la acreditación puede demorar algunas horas.
                        </p>
                        <p className="text-sm text-[var(--color-foreground)]/60 mb-6">
                            Una vez acreditado el pago, tu pedido se confirmará automáticamente y recibirás las novedades del envío.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/perfil" className="btn-primary flex items-center justify-center gap-2">
                                <User className="w-4 h-4" /> Ver Mis Pedidos
                            </Link>
                            <Link to="/catalogo" className="btn-secondary flex items-center justify-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Ir al catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
