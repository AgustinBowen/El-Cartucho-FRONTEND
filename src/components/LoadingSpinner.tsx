"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", text = "Cargando..." }) => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setTheme(document.documentElement.getAttribute("data-theme") || "light")
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const isXbox = theme === "light"

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in-scale">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-[var(--color-border)] rounded-full animate-spin`}
          style={{
            borderTopColor: isXbox ? "#107C10" : "#4a7bc8",
            animationDuration: "1s",
          }}
        ></div>

        {/* Inner ring */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-6 h-6" : "w-8 h-8"
          } border-2 border-transparent rounded-full animate-spin`}
          style={{
            borderTopColor: isXbox ? "#3A96DD" : "#006FCD",
            animationDuration: "0.7s",
            animationDirection: "reverse",
          }}
        ></div>
      </div>

      {text && <p className={`mt-4 text-[var(--color-foreground)] ${textSizeClasses[size]} font-medium`}>{text}</p>}

      {/* Gaming-style loading dots */}
      <div className="flex space-x-1 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full animate-pulse ${isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"}`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s",
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}
