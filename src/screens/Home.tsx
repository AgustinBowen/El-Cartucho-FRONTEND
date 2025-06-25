"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Gamepad2,
  Shield,
  Truck,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  CreditCard,
  Smartphone,
} from "lucide-react"
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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  // Newsletter state
  const [email, setEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setNewsletterStatus("loading")

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNewsletterStatus("success")
      setEmail("")
      setTimeout(() => setNewsletterStatus("idle"), 3000)
    } catch (error) {
      setNewsletterStatus("error")
      setTimeout(() => setNewsletterStatus("idle"), 3000)
    }
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
                <div className={`w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mr-4`}>
                  <Clock size={24} className="text-white" />
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
                <div className={`w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mr-4`}>
                  <TrendingUp size={24} className="text-white" />
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
      <footer className="bg-[var(--color-muted)]/30 border-t border-[var(--color-border)]">
        {/* Main Footer Content */}
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover: ${isXbox ? "bg-[#107C10] xbox-glow " : "bg-[#4a7bc8] ps2-glow"
                      }`}
                  >
                    <img src="/images/navbar.webp" alt="Icon" className="w-7 h-7" />
                  </div>
                  <span className="game-title text-xl font-bold text-[var(--color-primary)] hidden sm:block">
                    El Cartucho
                  </span>
                </Link>
              </div>
              <p className="text-[var(--color-foreground)]/70 mb-6 leading-relaxed">
                Tu tienda de confianza para videojuegos retro y modernos. Más de 10 años conectando gamers con sus
                juegos favoritos.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-[var(--color-foreground)]/70">
                  <MapPin size={18} className="mr-3 text-[var(--color-primary)]" />
                  <span>Av. Siempre Viva 742</span>
                </div>
                <div className="flex items-center text-[var(--color-foreground)]/70">
                  <Phone size={18} className="mr-3 text-[var(--color-primary)]" />
                  <span>+54 (2804) 897865</span>
                </div>
                <div className="flex items-center text-[var(--color-foreground)]/70">
                  <Mail size={18} className="mr-3 text-[var(--color-primary)]" />
                  <span>elcartucho@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-bold text-[var(--color-foreground)] mb-6 text-lg">Tienda</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/catalogo"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Todos los Juegos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold text-[var(--color-foreground)] mb-6 text-lg">Atención al Cliente</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/mi-cuenta"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Mi Cuenta
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pedidos"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/envios"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Información de Envíos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devoluciones"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Devoluciones
                  </Link>
                </li>
                <li>
                  <Link
                    to="/garantia"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Garantía
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacto"
                    className="text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Social */}
            <div>
              <div>
                <h5 className="font-semibold text-[var(--color-foreground)] mb-4">Síguenos</h5>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com/elcartucho"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://instagram.com/elcartucho"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[var(--color-accent)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-2 text-[var(--color-foreground)]/70">
                  <Shield size={18} className="text-[var(--color-primary)]" />
                  <span className="text-sm">Compra 100% Segura</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--color-foreground)]/70">Métodos de pago:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-[var(--color-muted)] rounded flex items-center justify-center">
                      <CreditCard size={14} className="text-[var(--color-foreground)]/70" />
                    </div>
                    <div className="w-8 h-6 bg-[var(--color-muted)] rounded flex items-center justify-center">
                      <Smartphone size={14} className="text-[var(--color-foreground)]/70" />
                    </div>
                    <span className="text-xs text-[var(--color-foreground)]/50">Mercado Pago</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-[var(--color-foreground)]/70">
                  © 2025 El Cartucho. Todos los derechos reservados.
                </p>
                <p className="text-xs text-[var(--color-foreground)]/50 mt-1">by bikuta & architín777</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
