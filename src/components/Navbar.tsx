"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { ShoppingCart, Menu, X, Sun, Moon, Search, User } from "lucide-react"

function Navbar() {
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const [theme, setTheme] = useState("light")
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  // Detectar scroll para cambiar el navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Leer el theme guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"
      setTheme(initialTheme)
      document.documentElement.setAttribute("data-theme", initialTheme)
      localStorage.setItem("theme", initialTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
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

  const isXbox = theme === "light"

  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? `backdrop-blur-md ${
              isXbox
                ? "bg-[var(--color-background)]/90 border-b border-[var(--color-border)]"
                : "bg-[var(--color-background)]/90 border-b border-[var(--color-border)] ps2-glow"
            }`
          : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isXbox ? "bg-[#107C10] xbox-glow" : "bg-[#4a7bc8] ps2-glow"
              }`}
            >
              <span className="text-white font-bold text-lg">EC</span>
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? `text-[var(--color-primary)] ${isXbox ? "bg-green-50" : "bg-blue-50 dark:bg-blue-900/20"}`
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
            <div className="hidden md:flex relative" >
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar juegos..."
                    className="w-48 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-2 p-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300"
                  title="Buscar"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
              title={`Cambiar a ${theme === "light" ? "PlayStation 2" : "Xbox 360"}`}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/comprar")}
              className="relative p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
              title="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs text-white rounded-full animate-pulse ${
                    isXbox ? "bg-[#107C10]" : "bg-[#4a7bc8]"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            <button
              onClick={() => {
                // TODO: Implement user account functionality
                console.log("User account clicked")
              }}
              className="p-2 rounded-lg text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-all duration-300 focus-visible"
              title="Mi cuenta"
            >
              <User size={20} />
            </button>

            {/* Mobile menu button */}
            <button
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
              className={`absolute left-0 right-0 mt-4 mx-4 rounded-xl border border-[var(--color-border)] backdrop-blur-md ${
                isXbox
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
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? `text-[var(--color-primary)] ${isXbox ? "bg-green-50" : "bg-blue-50 dark:bg-blue-900/20"}`
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar juegos..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"
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
  )
}

export default Navbar
