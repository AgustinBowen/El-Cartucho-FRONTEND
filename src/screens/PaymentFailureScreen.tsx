import type React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react"

export const PaymentFailureScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const externalReference = searchParams.get("external_reference") || searchParams.get("preference_id") || searchParams.get("payment_id")

    return (
        <div className="min-h-screen bg-[var(--color-background)] pt-16">
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-8 text-center mb-8 animate-fade-in-scale">
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Pago no completado</h2>

                        {externalReference && (
                            <p className="text-sm font-medium text-rose-500 mb-4">
                                Número de referencia: #{externalReference}
                            </p>
                        )}

                        <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
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
