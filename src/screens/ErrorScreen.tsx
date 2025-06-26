"use client"

import type React from "react"
import { useAnimatedBackground } from "../hooks/useAnimatedBackground"

export const ErrorScreen: React.FC = () => {
  const { backgroundImage, backgroundLoaded, isXbox } = useAnimatedBackground({
    xboxBackground: "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750967969/MqJZFT8_wmwa22.gif", // Tu fondo para tema Xbox
    defaultBackground: "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750966921/SoundTest_ei4i7g.webp", // Tu fondo para tema normal
  })

  return (
    <div
      className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${
        backgroundLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay para el fondo */}
      <div
        className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
        style={{ opacity: isXbox ? 0.3 : 0.60 }}
      ></div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Mensaje de error */}
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto">
            <div className="card p-8 text-center mb-8 animate-fade-in-scale">
              <h2 className="text-xl font-bold mb-4">¡Te perdiste!</h2>
              <p className="text-sm text-[var(--color-foreground)]/80 mb-6">
                La página que estás buscando no existe.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => window.history.back()} className="btn-secondary">
                  Volver atrás
                </button>
                <button onClick={() => (window.location.href = "/")} className="btn-primary">
                  Ir al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
