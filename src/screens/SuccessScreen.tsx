"use client"

import type React from "react"

export const SuccessScreen: React.FC = () => {

    return (
        <div className="min-h-screen bg-[var(--color-background)] pt-16">
            {/* Header */}

            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Success Message */}
                    <div className="card p-8 text-center mb-8 animate-fade-in-scale">

                        <h2 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h2>
                        <p className="text-lg text-[var(--color-foreground)]/80 mb-6">
                            Se realizó correctamente el pago de tu producto. Nos comunicaremos pronto y recibirás novedades de tu
                            compra.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
