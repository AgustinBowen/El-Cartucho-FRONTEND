"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/context/ThemeContext"

interface UseAnimatedBackgroundOptions {
  xboxBackground?: string
  defaultBackground?: string
  singleBackground?: string 
}

export const useAnimatedBackground = (options?: UseAnimatedBackgroundOptions) => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const { isXbox } = useTheme()

  // Fondos por defecto
  const defaultXboxBackground = "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
  const defaultNormalBackground =
    "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

  // Determinar qué imagen usar
  const backgroundImage = options?.singleBackground
    ? options.singleBackground
    : isXbox
      ? options?.xboxBackground || defaultXboxBackground
      : options?.defaultBackground || defaultNormalBackground

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setBackgroundLoaded(true)
    img.onerror = () => {
      console.warn("Failed to load background image:", backgroundImage)
      setBackgroundLoaded(true) 
    }
    img.src = backgroundImage
  }, [backgroundImage])

  return {
    backgroundImage,
    backgroundLoaded,
    isXbox,
  }
}
