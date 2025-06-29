"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useTheme } from "../context/ThemeContext"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { ShoppingCart, Menu, X, Sun, Moon, Search, User } from "lucide-react"
import { OffcanvasCart } from "./OffcanvasCart"

function Navbar() {
  const { cartItems } = useCart()
  const { theme, setTheme, isXbox } = useTheme() // Usar ThemeContext
  const navigate = useNavigate()
  const location = useLocation()

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const toggleTheme = () => {
    // Desactivar transiciones durante el cambio de tema
    document.documentElement.classList.add('no-transitions')
    setTheme(theme === "light" ? "dark" : "light")
    // Re-activar transiciones después del cambio
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions')
    }, 0)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm)}`)
      setSearchOpen(false)
      setMenuOpen(false)
    } else {
      setSearchOpen(false)
    }
  }

  const handleCartClick = () => {
    setCartOpen(true)
  }

  const handleCloseCart = () => {
    setCartOpen(false)
  }

  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${isXbox
          ? "bg-[var(--color-background)]/90 border-b border-[var(--color-border)]"
          : "bg-[var(--color-background)]/90 border-b border-[var(--color-border)] ps2-glow"
        }`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === item.path
                    ? `text-[#f0f0f0] ${isXbox ? "bg-[#107c10]" : "bg-blue-50 dark:bg-blue-900/20"}`
                    : "text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="hidden md:flex relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchTerm}
                      aria-label="Buscar juegos"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar juegos..."
                      className="w-48 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      autoFocus
                    />
                    <button
                      type="button"
                      aria-label="Cerrar búsqueda"
                      onClick={() => setSearchOpen(false)}
                      className="cursor-pointer ml-2 p-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                    >
                      <X size={18} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="cursor-pointer p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300"
                    title="Buscar"
                    aria-label="Abrir búsqueda"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg cursor-pointer text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
                title={`Cambiar a ${theme === "light" ? "PlayStation 2" : "Xbox 360"}`}
                aria-label="Cambiar tema"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative cursor-pointer p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
                title="Carrito de compras"
                aria-label="Abrir carrito"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs text-white rounded-full animate-pulse ${isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"
                      }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User */}
              <button
                onClick={() => {
                  console.log("User account clicked")
                }}
                className="p-2 cursor-pointer rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
                title="Mi cuenta"
                aria-label="Opciones usuario"
              >
                <User size={20} />
              </button>

              {/* Mobile menu button */}
              <button
                aria-label="Abrir menú"
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="md:hidden animate-fade-in-up">
              {/* Background overlay */}
              <div
                className={`absolute left-0 right-0 mt-4 mx-4 rounded-xl border border-[var(--color-border)] backdrop-blur-md ${isXbox
                  ? "bg-[var(--color-background)]/95 shadow-lg"
                  : "bg-[var(--color-background)]/95 shadow-lg ps2-glow"
                  }`}
              >
                <div className="p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${location.pathname === item.path
                        ? `text-[#f0f0f0] ${isXbox ? "bg-[#107c10]" : "bg-blue-50 dark:bg-blue-900/20"}`
                        : "text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Mobile Search */}
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        type="text"
                        aria-label="Buscar juegos"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar juegos..."
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-lg text-white font-medium ${isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"
                          } transition-colors`}
                      >
                        <Search size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <OffcanvasCart isOpen={cartOpen} onClose={handleCloseCart} />
    </>
  )
}

export default Navbar