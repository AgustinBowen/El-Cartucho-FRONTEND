import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Shield, CreditCard, Smartphone } from 'lucide-react';

interface FooterProps {
  isXbox?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isXbox = false }) => {
  return (
    <footer className="bg-[var(--color-muted)]/30 border-t border-[var(--color-border)]">
      {/* Main Footer Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover: ${
                    isXbox ? "bg-[#107C10] xbox-glow " : "bg-[#4a7bc8] ps2-glow"
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
              <p className="text-xs text-[var(--color-foreground)]/50 mt-1">by <a className='text-primary hover:text-[var(--color-primary-hover)]' target='_blank' href={'https://github.com/Bikutah'}>bikuta</a> & <a className='text-primary hover:text-[var(--color-primary-hover)]' target='_blank' href={'https://github.com/AgustinBowen'}>architín777</a></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;