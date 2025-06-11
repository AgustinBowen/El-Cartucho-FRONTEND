"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, ChevronRight, Gamepad2, Zap, Shield, Truck, Award } from "lucide-react"

export const Home: React.FC = () => {
  const [theme, setTheme] = useState("light")
  const [currentSlide, setCurrentSlide] = useState(0)

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

  // Auto-slide para el hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const isXbox = theme === "light"
  const consoleName = isXbox ? "Xbox 360" : "PlayStation 2"

  const heroSlides = [
    {
      title: "Los Mejores Juegos",
      subtitle: `Descubre el catálogo más completo de ${consoleName}`,
      image: isXbox
        ? "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop"
        : "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
    },
    {
      title: "Ofertas Increíbles",
      subtitle: "Hasta 50% de descuento en títulos seleccionados",
      image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop",
    },
    {
      title: "Envío Gratis",
      subtitle: "En compras mayores a $50 - Entrega en 24-48 horas",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop",
    },
  ]

  const features = [
    {
      icon: <Gamepad2 size={32} />,
      title: "Catálogo Extenso",
      description: "Más de 1000 títulos disponibles para tu consola favorita.",
      color: isXbox
        ? "bg-green-100 text-green-600"
        : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      icon: <Truck size={32} />,
      title: "Envío Rápido",
      description: "Recibe tus juegos en menos de 48 horas en cualquier parte del país.",
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
      description: "Solo vendemos juegos originales y en perfecto estado.",
      color: isXbox
        ? "bg-purple-100 text-purple-600"
        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16">
      {/* Hero Section with Carousel */}
      <section className="relative h-[70vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
              <div
                className={`absolute inset-0 ${
                  isXbox
                    ? "bg-gradient-to-r from-green-900/80 to-green-700/60"
                    : "bg-gradient-to-r from-blue-900/80 to-blue-700/60"
                }`}
              ></div>
            </div>

            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-screen-xl mx-auto px-4 w-full">
                <div className="max-w-2xl animate-fade-in-up">
                  <h1 className="game-title text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-white/90 text-xl mb-8 leading-relaxed">{slide.subtitle}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/catalogo" className="btn-primary">
                      <Gamepad2 size={20} className="mr-2" />
                      Explorar Catálogo
                    </Link>
                    <Link to="/ofertas" className="btn-secondary">
                      <Zap size={20} className="mr-2" />
                      Ver Ofertas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `${isXbox ? "bg-green-400" : "bg-blue-400"} scale-125`
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--color-muted)]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Juegos Disponibles" },
              { number: "50K+", label: "Clientes Felices" },
              { number: "24h", label: "Envío Express" },
              { number: "99%", label: "Satisfacción" },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div
                  className={`text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2 ${
                    isXbox ? "xbox-glow" : "ps2-glow"
                  }`}
                >
                  {stat.number}
                </div>
                <div className="text-[var(--color-foreground)] font-medium">{stat.label}</div>
              </div>
            ))}
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

      {/* Featured Games Section */}
      <section className="py-20 bg-[var(--color-muted)]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="game-title text-3xl md:text-4xl text-[var(--color-primary)] mb-2">Juegos Destacados</h2>
              <p className="text-[var(--color-foreground)]/70">Los títulos más populares de {consoleName}</p>
            </div>
            <Link to="/catalogo" className="btn-secondary group">
              Ver todos
              <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Halo 3",
                price: 29.99,
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
              },
              {
                title: "Gears of War",
                price: 24.99,
                image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
              },
              {
                title: "Forza Motorsport",
                price: 34.99,
                image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
              },
            ].map((game, index) => (
              <div
                key={index}
                className="card overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
                        isXbox ? "bg-green-500" : "bg-blue-500"
                      }`}
                    >
                      POPULAR
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="game-title text-xl font-bold mb-2">{game.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[var(--color-primary)]">${game.price}</span>
                    <button className="btn-primary text-sm px-4 py-2">
                      <ShoppingCart size={16} className="mr-1" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <Link to="/catalogo" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              <Gamepad2 size={20} className="mr-2" />
              Explorar Catálogo
            </Link>
            <Link to="/ofertas" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900">
              <Zap size={20} className="mr-2" />
              Ver Ofertas Especiales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
