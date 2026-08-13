import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, Truck, MapPin, Mail, Clock, AlertCircle, Copy, Check } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { formatearPrecio } from "../utils/formatearPrecio"

interface OrderDetail {
  id: number
  estado_pago: string
  estado_envio: string | null
  estado_visible: string
  created_at: string
  total: number
  subtotal_productos: number
  costo_envio: number
  zona_envio: string
  envio: {
    domicilio: string | null
    ciudad: string | null
    codigo_postal: string | null
    email: string | null
    transportista: string | null
    tracking_numero: string | null
    enviado_at: string | null
    entregado_at: string | null
  }
  productos: Array<{
    nombre: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    imagen: string | null
  }>
  historial: Array<{
    estado: string
    fecha: string
  }>
}

export const OrderDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedTracking, setCopiedTracking] = useState(false)

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!user || !id) return

      setLoading(true)
      setError(null)

      try {
        const token = await user.getIdToken()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/mis-pedidos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "x-vercel-protection-bypass": import.meta.env.protectionBypassToken || "",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.status === 404) {
          setError("El pedido solicitado no existe o no tenés permiso para verlo.")
          return
        }

        if (!response.ok) {
          throw new Error("Error al obtener los detalles del pedido.")
        }

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetail()
  }, [user, id])

  const copyTrackingToClipboard = (tracking: string) => {
    navigator.clipboard.writeText(tracking)
    setCopiedTracking(true)
    setTimeout(() => setCopiedTracking(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Botón Volver */}
        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]/70 hover:text-[var(--color-primary)] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[var(--color-foreground)]/60">Cargando detalle del pedido...</p>
          </div>
        )}

        {error && (
          <div className="card p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pedido no encontrado</h2>
            <p className="text-sm text-[var(--color-foreground)]/70 mb-6">{error}</p>
            <button onClick={() => navigate("/perfil")} className="btn-primary">
              Volver a mis pedidos
            </button>
          </div>
        )}

        {order && !loading && (
          <div className="space-y-6 animate-fade-in-scale">

            {/* Header del Pedido */}
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">
                    Pedido #{String(order.id).padStart(4, "0")}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                    {order.estado_visible}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-foreground)]/60">
                  Realizado el {new Date(order.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--color-foreground)]/60 block">Total abonado</span>
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  {formatearPrecio(order.total)}
                </span>
              </div>
            </div>

            {/* Timeline de Historial */}
            {order.historial && order.historial.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--color-primary)]" /> Seguimiento del pedido
                </h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-foreground)]/10">
                  {order.historial.map((step, idx) => {
                    const isLast = idx === order.historial.length - 1
                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isLast
                              ? "bg-[var(--color-primary)] text-white shadow-md ring-4 ring-[var(--color-primary)]/20"
                              : "bg-emerald-500 text-white"
                            }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isLast ? "text-[var(--color-primary)]" : ""}`}>
                            {step.estado}
                          </p>
                          <p className="text-xs text-[var(--color-foreground)]/50 mt-0.5">
                            {new Date(step.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Transportista y Tracking (si existe) */}
            {order.envio.tracking_numero ? (
              <div className="card p-6 border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[var(--color-primary)] text-white rounded-xl">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] block">
                        Envío en curso ({order.envio.transportista || "Transportista no especificado"})
                      </span>
                      <p className="text-lg font-mono font-bold mt-0.5">
                        {order.envio.tracking_numero}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyTrackingToClipboard(order.envio.tracking_numero!)}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 cursor-pointer"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedTracking ? "Copiado" : "Copiar número"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-4 flex items-center gap-3 text-sm text-[var(--color-foreground)]/70">
                <Truck className="w-5 h-5 text-[var(--color-foreground)]/40" />
                <span>Número de seguimiento de envío aún no disponible. Se generará una vez despachado el paquete.</span>
              </div>
            )}

            {/* Grid 2 columnas: Datos de Envío y Desglose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Datos de envío */}
              <div className="card p-6 space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-primary)]" /> Dirección de entrega
                </h3>
                <div className="space-y-2 text-sm">
                  {order.envio.domicilio && (
                    <p><span className="text-[var(--color-foreground)]/60">Domicilio:</span> <span className="font-medium">{order.envio.domicilio}</span></p>
                  )}
                  {order.envio.ciudad && (
                    <p><span className="text-[var(--color-foreground)]/60">Ciudad:</span> <span className="font-medium">{order.envio.ciudad}</span></p>
                  )}
                  {order.envio.codigo_postal && (
                    <p><span className="text-[var(--color-foreground)]/60">Código Postal:</span> <span className="font-medium">{order.envio.codigo_postal}</span></p>
                  )}
                  {order.envio.email && (
                    <p className="flex items-center gap-1.5 text-xs text-[var(--color-foreground)]/70 pt-2 border-t border-gray-200/10">
                      <Mail className="w-3.5 h-3.5" /> {order.envio.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Desglose de Pago */}
              <div className="card p-6 space-y-3">
                <h3 className="text-base font-bold">Resumen de costos</h3>
                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between text-[var(--color-foreground)]/80">
                    <span>Subtotal productos</span>
                    <span>{formatearPrecio(order.subtotal_productos)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-foreground)]/80">
                    <span>Envío ({order.zona_envio})</span>
                    <span>{order.costo_envio === 0 ? "Gratis" : formatearPrecio(order.costo_envio)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200/10 text-[var(--color-primary)]">
                    <span>Total</span>
                    <span>{formatearPrecio(order.total)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Listado de Productos */}
            <div className="card p-6">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--color-primary)]" /> Productos en el pedido
              </h3>
              <div className="divide-y divide-gray-200/10">
                {order.productos.map((prod, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200/20 bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[var(--color-foreground)]/5 flex items-center justify-center text-[var(--color-foreground)]/40">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{prod.nombre}</p>
                      <p className="text-xs text-[var(--color-foreground)]/60 mt-0.5">
                        {formatearPrecio(prod.precio_unitario)} × {prod.cantidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatearPrecio(prod.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
