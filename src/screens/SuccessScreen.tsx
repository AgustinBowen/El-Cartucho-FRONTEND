import type React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, Clock, XCircle, HelpCircle, ArrowLeft, ShoppingBag } from "lucide-react"

export const SuccessScreen: React.FC = () => {
    const [searchParams] = useSearchParams()
    const status = searchParams.get("status")
    const externalReference = searchParams.get("external_reference") || searchParams.get("preference_id")

    const renderContent = () => {
        if (status === "approved") {
            return (
                <>
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">¡Gracias por tu compra!</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{externalReference.padStart(4, "0")}
                        </p>
                    )}
                    <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
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
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Pago en proceso</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                            Pedido #{externalReference.padStart(4, "0")}
                        </p>
                    )}
                    <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
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
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Pago no completado</h2>
                    {externalReference && (
                        <p className="text-sm font-medium text-rose-500 mb-4">
                            Referencia de pedido: #{externalReference}
                        </p>
                    )}
                    <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
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
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Resultado del pago</h2>
                {externalReference && (
                    <p className="text-sm font-medium text-[var(--color-primary)] mb-4">
                        Referencia de pedido: #{externalReference}
                    </p>
                )}
                <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
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
        <div className="min-h-screen bg-[var(--color-background)] pt-16">
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-8 text-center mb-8 animate-fade-in-scale">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}
