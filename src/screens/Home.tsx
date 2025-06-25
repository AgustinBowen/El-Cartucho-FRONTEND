"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Gamepad2, Shield, Truck, Award, ArrowRight, TrendingUp, Clock } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import type { Producto } from "../types/Producto"
import { CardComponent } from "../components/Card"
import { SkeletonCard } from "../components/SkeletonCard"

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
          setProductosRecientes(Array.isArray(data) ? data.slice(0, 6) : [])
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
          setProductosMasVendidos(Array.isArray(data) ? data.slice(0, 6) : [])
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
      icon: <Gamepad2 size={32} />,
      title: "Catálogo Extenso",
      description: "Gran variedad de juegos para todas las consolas y géneros.",
      color: isXbox
        ? "bg-green-100 text-green-600"
        : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      icon: <Truck size={32} />,
      title: "Envíos a Domicilio",
      description: "Recibe tus juegos en la puerta de tu casa.",
      color: isXbox
        ? "bg-blue-100 text-blue-600"
        : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      icon: <Shield size={32} />,
      title: "Garantía Total",
      description: "Todos nuestros productos tienen garantía de 30 días.",
      color: isXbox
        ? "bg-orange-100 text-orange-600"
        : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      icon: <Award size={32} />,
      title: "Calidad Premium",
      description: "Solo vendemos juegos originales y en buen estado.",
      color: isXbox
        ? "bg-purple-100 text-purple-600"
        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16 ">
      {/* Hero Section with Video */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Video Background */}
        {showVideo && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
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
          className={`absolute inset-0 ${
            isXbox
              ? "bg-gradient-to-r from-green-900/80 to-green-700/60"
              : "bg-gradient-to-r from-blue-900/70 to-blue-700/0"
          }`}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="game-title text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
                Los Mejores Juegos
              </h1>
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
      <section className="py-20">
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
                  className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
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

      {/* Productos Recientes Section */}
      <section className="py-20 bg-[var(--color-muted)]/30">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12 animate-fade-in-up">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-xl ${isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"} flex items-center justify-center mr-4`}
              >
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h2 className="game-title text-3xl md:text-4xl text-[var(--color-primary)] mb-2">Recién Llegados</h2>
                <p className="text-[var(--color-foreground)]/70">Los últimos juegos agregados a nuestro catálogo</p>
              </div>
            </div>
            <Link
              to="/catalogo"
              className="hidden md:flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium group transition-colors"
            >
              Ver todos
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                <div key={producto.id} className="animate-fade-in-scale" style={{ animationDelay: `${index * 0.1}s` }}>
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
              <p className="text-[var(--color-foreground)]/70">No hay productos recientes disponibles</p>
            </div>
          )}

          {/* Botón móvil */}
          <div className="md:hidden text-center mt-8">
            <Link to="/catalogo" className="btn-primary">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Más Vendidos Section */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12 animate-fade-in-up">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-xl ${isXbox ? "bg-[#3A96DD]" : "bg-[#006FCD]"} flex items-center justify-center mr-4`}
              >
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h2 className="game-title text-3xl md:text-4xl text-[var(--color-primary)] mb-2">Más Vendidos</h2>
                <p className="text-[var(--color-foreground)]/70">Los favoritos de nuestra comunidad gamer</p>
              </div>
            </div>
            <Link
              to="/catalogo"
              className="hidden md:flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium group transition-colors"
            >
              Ver todos
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                <div key={producto.id} className="animate-fade-in-scale" style={{ animationDelay: `${index * 0.1}s` }}>
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
              <p className="text-[var(--color-foreground)]/70">No hay productos más vendidos disponibles</p>
            </div>
          )}

          {/* Botón móvil */}
          <div className="md:hidden text-center mt-8">
            <Link to="/catalogo" className="btn-primary">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-20 relative overflow-hidden ${
          isXbox ? "bg-gradient-to-br from-green-600 to-green-800" : "bg-gradient-to-br from-blue-600 to-blue-800"
        }`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="game-title text-4xl md:text-5xl text-white mb-6">¿Listo para la aventura?</h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Únete a miles de gamers que ya confían en nosotros. Encuentra tu próximo juego favorito y vive experiencias
            inolvidables.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/juegos"
              className="btn-secondary bg-white text-gray-900 hover:bg-gray-100 flex text-center items-center"
            >
              <Gamepad2 size={20} className="mr-2" />
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
