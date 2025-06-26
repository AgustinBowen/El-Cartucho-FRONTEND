"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Gamepad2,
  ArrowRight
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import type { Producto } from "../types/Producto"
import { CardComponent } from "../components/Card"
import { SkeletonCard } from "../components/SkeletonCard"
import  Footer  from "../components/Footer"

export const Home: React.FC = () => {
  const { isXbox } = useTheme()

  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Nuevos estados para productos
  const [productosRecientes, setProductosRecientes] = useState<Producto[]>([])
  const [productosMasVendidos, setProductosMasVendidos] = useState<Producto[]>([])
  const [loadingRecientes, setLoadingRecientes] = useState(true)
  const [loadingMasVendidos, setLoadingMasVendidos] = useState(true)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  // Optimización: Cargar video solo cuando esté visible y conexión lo permita
  useEffect(() => {
    const loadVideo = () => {
      // Verificar si la conexión es buena (opcional)
      const connection = (navigator as any).connection
      const isSlowConnection =
        connection && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")

      if (!isSlowConnection) {
        setShowVideo(true)

        // Precargar el video
        if (videoRef.current) {
          videoRef.current.load()
        }
      }
    }

    // Cargar video después de un pequeño delay para no bloquear el render inicial
    const timer = setTimeout(loadVideo, 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch productos recientes
  useEffect(() => {
    const fetchProductosRecientes = async () => {
      try {
        setLoadingRecientes(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/productosRecientes`)
        if (response.ok) {
          const data = await response.json()
          setProductosRecientes(Array.isArray(data.data) ? data.data.slice(0, 3) : [])
        }
      } catch (error) {
        console.error("Error fetching productos recientes:", error)
        setProductosRecientes([])
      } finally {
        setLoadingRecientes(false)
      }
    }

    fetchProductosRecientes()
  }, [])

  // Fetch productos más vendidos
  useEffect(() => {
    const fetchProductosMasVendidos = async () => {
      try {
        setLoadingMasVendidos(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/productosMasVendidos`)
        if (response.ok) {
          const data = await response.json()
          setProductosMasVendidos(Array.isArray(data.data) ? data.data.slice(0, 3) : [])
        }
      } catch (error) {
        console.error("Error fetching productos más vendidos:", error)
        setProductosMasVendidos([])
      } finally {
        setLoadingMasVendidos(false)
      }
    }

    fetchProductosMasVendidos()
  }, [])

  // Imagen de fondo para secciones de productos
  const productSectionBackground = isXbox
    ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
    : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif"

  // Precargar imagen de fondo
  useEffect(() => {
    const img = new Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = productSectionBackground
  }, [productSectionBackground])

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
    if (videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }

  const handleVideoError = () => {
    console.warn("Video failed to load, showing fallback image")
    setIsVideoLoaded(false)
    setShowVideo(false)
  }

  const features = [
    {
      icon: <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750892890/tumblr_myjokwptjd1qcc19mo1_500_qdudvt.webp" alt="Catalogo extenso" className="w-20 h-20"></img>,
      title: "Catálogo Extenso",
      description: "Gran variedad de juegos para todas las consolas y géneros.",
    },
    {
      icon: <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750892274/e766c949920f4763386acbc793c96f-unscreen_yilu0u.gif" alt="Envíos a Domicilio" className="w-20 h-20"></img>,
      title: "Envíos a Domicilio",
      description: "Recibe tus juegos en la puerta de tu casa.",
    },
    {
      icon: <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750892406/Megaman_retro_3D_by_cezkid_s7mg7y.webp" alt="Garantia total" className="w-12 h-12"></img>,
      title: "Garantía Total",
      description: "Todos nuestros productos tienen garantía de 30 días.",
    },
    {
      icon: <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750901071/Contra_3D_by_cezkid_x84exc.webp" alt="Calidad premium" className="w-12 h-12"></img>,
      title: "Calidad Premium",
      description: "Solo vendemos juegos originales y en buen estado."
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16 ">
      {/* Hero Section with Video */}
      <section className="relative h-[70vh] overflow-hidden border-b border-[var(--color-border)]">
        {/* Video Background */}
        {showVideo && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            style={{ filter: "brightness(0.7)" }}
          >
            <source
              src="https://res.cloudinary.com/dud5m1ltq/video/upload/q_auto,f_auto/herovideo_zwekfy.mp4"
              type="video/mp4"
            />
          </video>
        )}

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 ${isXbox
            ? "bg-gradient-to-r from-green-900/80 to-green-700/60"
            : "bg-gradient-to-r from-blue-900/70 to-blue-700/0"
            }`}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="flex items-center">
                <h1 className="game-title text-5xl md:text-6xl lg:text-6xl text-white mb-6 leading-tight">
                  Los Mejores Juegos
                </h1>
              </div>
              <p className="text-white/90 text-xl mb-8 leading-relaxed">
                Revive tu infancia con los clásicos y descubre nuevas aventuras.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalogo" className="btn-secondary flex text-center items-center">
                  <Gamepad2 size={20} className="mr-2" />
                  Explorar Catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="game-title text-4xl md:text-5xl text-[var(--color-primary)] mb-6">
              ¿Por qué elegir El Cartucho?
            </h2>
            <p className="text-xl text-[var(--color-foreground)]/80 max-w-3xl mx-auto">
              Somos la tienda de videojuegos más confiable, con años de experiencia brindando la mejor experiencia de
              compra para gamers como tú.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center group hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--color-foreground)]">{feature.title}</h3>
                <p className="text-[var(--color-foreground)]/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Sección Unificada de Productos con Fondo Animado */}
      <section
        className={`py-20 relative overflow-hidden transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{
          backgroundImage: backgroundLoaded ? `url('${productSectionBackground}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay para legibilidad */}
        <div
          className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
          style={{ opacity: isXbox ? 0.4 : 0.88 }}
        ></div>

        <div className="max-w-screen-xl mx-auto px-4 relative z-10 space-y-20">
          {/* Productos Recientes */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 animate-fade-in-up">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
                  <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750901461/steamworkshop_guide_223752777_guide_branding_gka7r5.gif" alt="Catalogo extenso" className="w-24 h-24"></img>
                </div>
                <div>
                  <h2
                    className={`game-title text-3xl md:text-4xl mb-2 ${isXbox ? "text-white" : "text-[var(--color-primary)]"
                      }`}
                  >
                    Recién Llegados
                  </h2>
                  <p className={`${isXbox ? "text-white/95" : "text-[var(--color-foreground)]/90"} text-sm sm:text-base`}>
                    Los últimos juegos agregados a nuestro catálogo
                  </p>
                </div>
              </div>

              {/* Botón responsive - visible en tablet y desktop */}
              <div className="hidden sm:block">
                <Link
                  to="/catalogo"
                  className={`btn-primary text-sm px-4 py-2 cursor-pointer inline-flex items-center space-x-1`}
                >
                  <span>Ver todos</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {loadingRecientes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : productosRecientes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosRecientes.map((producto, index) => (
                  <div
                    key={producto.id}
                    className="animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardComponent
                      producto_id={producto.id}
                      imgSrc={producto.imagen}
                      imgAlt={producto.nombre}
                      title={producto.nombre}
                      price={producto.precio}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={`${isXbox ? "text-white/70" : "text-[var(--color-foreground)]/70"}`}>
                  No hay productos recientes disponibles
                </p>
              </div>
            )}

            {/* Botón móvil para recientes - solo visible en móvil */}
            <div className="sm:hidden text-center mt-8">
              <Link
                to="/catalogo"
                className="btn-primary w-full sm:w-auto justify-center inline-flex items-center space-x-2 py-3"
              >
                <span>Ver todos los productos</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 animate-fade-in-up">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4`}>
                  <img src="https://res.cloudinary.com/dud5m1ltq/image/upload/v1750901756/Zskj9C56UonbzviBsopHhiS8HQUyfZoSLKuj5hRuE1atYVrp4mE2rjb9fTxHXxArCrz4fvjVmcHSux2pz7SvyfMwJJCci8ENysyUV892HZXiA1qFzmuf_w6q4cd.gif" alt="Catalogo extenso" className="w-24 h-24"></img>
                </div>
                <div>
                  <h2
                    className={`game-title text-3xl md:text-4xl mb-2 ${isXbox ? "text-white" : "text-[var(--color-primary)]"
                      }`}
                  >
                    Más Vendidos
                  </h2>
                  <p className={`${isXbox ? "text-white/95" : "text-[var(--color-foreground)]/90"} text-sm sm:text-base`}>
                    Los favoritos de nuestra comunidad gamer
                  </p>
                </div>
              </div>

              {/* Botón responsive - visible en tablet y desktop */}
              <div className="hidden sm:block">
                <Link
                  to="/catalogo"
                  className={`btn-primary text-sm px-4 py-2 cursor-pointer inline-flex items-center space-x-1`}
                >
                  <span>Ver todos</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {loadingMasVendidos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : productosMasVendidos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosMasVendidos.map((producto, index) => (
                  <div
                    key={producto.id}
                    className="animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardComponent
                      producto_id={producto.id}
                      imgSrc={producto.imagen}
                      imgAlt={producto.nombre}
                      title={producto.nombre}
                      price={producto.precio}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={`${isXbox ? "text-white/70" : "text-[var(--color-foreground)]/70"}`}>
                  No hay productos más vendidos disponibles
                </p>
              </div>
            )}

            {/* Botón móvil para más vendidos - solo visible en móvil */}
            <div className="sm:hidden text-center mt-8">
              <Link
                to="/catalogo"
                className="btn-primary w-full sm:w-auto justify-center inline-flex items-center space-x-2 py-3"
              >
                <span>Ver todos los productos</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* E-Commerce Footer */}
      <Footer isXbox={isXbox} />
    </div>
  )
}
