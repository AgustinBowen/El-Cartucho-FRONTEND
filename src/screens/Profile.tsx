import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { useAuth, isProfileIncomplete } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formatearPrecio";
import { CronometroReserva } from "../components/CronometroReserva";
import { CreditCard, Loader2, AlertCircle, Bell, BellOff, BellRing } from "lucide-react";
import {
    isPushSupported,
    getPermissionState,
    subscribeToPush,
    unsubscribeFromPush,
    checkSubscriptionStatus,
} from "../lib/pushNotifications";

type Order = {
    id: number;
    estado: string;
    estado_pago?: string;
    estado_efectivo?: string;
    estado_envio?: string | null;
    estado_visible?: string;
    costo_envio?: number;
    tiene_tracking?: boolean;
    total: number;
    created_at: string;
    expira_at?: string | null;
    init_point_disponible?: boolean;
    productos: {
        nombre: string;
        cantidad: number;
        precio_unitario: number;
        image?: string | null;
    }[];
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ESTADO_COLORS: Record<string, string> = {
    // Etiquetas legibles (estado_visible)
    "Pago confirmado": "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30",
    "Preparando tu pedido": "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
    "En camino": "bg-purple-500/15 text-purple-600 border border-purple-500/20",
    "Entregado": "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30",
    "Esperando pago": "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30",
    "Pago rechazado": "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30",
    "Expirado": "bg-[var(--color-foreground)]/10 text-[var(--color-foreground)]/60 border border-[var(--color-border)]",
    "Reembolsado": "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30",

    // Estados técnicos (estado_pago / estado_efectivo)
    pagado: "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30",
    pendiente: "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30",
    expirado: "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30",
    cancelado: "bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30",
    reembolsado: "bg-purple-500/15 text-purple-600 border border-purple-500/20",
};

export function Profile() {
    const { user, profile, loading, logout, updateProfileData } = useAuth();
    const { isXbox } = useTheme();
    const navigate = useNavigate();
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);

    const backgroundImage = isXbox
      ? "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750461496/latest_howx98.png"
      : "https://res.cloudinary.com/dud5m1ltq/image/upload/v1750302558/3fd4849288fe473940092cc5d5a9bb0b_tuhurb.gif";

    useEffect(() => {
      const img = new Image();
      img.onload = () => setBackgroundLoaded(true);
      img.src = backgroundImage;
    }, [backgroundImage]);

    const [activeTab, setActiveTab] = useState<"perfil" | "pedidos">("perfil");
    const [formData, setFormData] = useState({
        name: "",
        apellido: "",
        domicilio: "",
        ciudad: "",
        codigo_postal: ""
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [cpError, setCpError] = useState("");

    // Orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [nearExpiryMap, setNearExpiryMap] = useState<Record<number, boolean>>({});
    const [expiredMap, setExpiredMap] = useState<Record<number, boolean>>({});
    const [retryLoadingMap, setRetryLoadingMap] = useState<Record<number, boolean>>({});
    const [retryErrorMap, setRetryErrorMap] = useState<Record<number, string | null>>({});

    useEffect(() => {
        if (!loading && !user) navigate("/");
    }, [user, loading, navigate]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                apellido: profile.apellido || "",
                domicilio: profile.domicilio || "",
                ciudad: profile.ciudad || "",
                codigo_postal: profile.codigo_postal || ""
            });
        }
    }, [profile]);

    const loadOrders = useCallback(async () => {
        if (!user) return;
        setOrdersLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/ed/mis-pedidos`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.status === 401) {
                await logout();
                navigate("/");
                return;
            }
            if (res.ok) setOrders(await res.json());
        } catch (e) {
            console.error("Error loading orders", e);
        } finally {
            setOrdersLoading(false);
        }
    }, [user, logout, navigate]);

    useEffect(() => {
        if (activeTab === "pedidos" && user) {
            loadOrders();
        }
    }, [activeTab, user, loadOrders]);

    const handleRetryPayment = async (orderId: number) => {
        if (!user) return;
        setRetryLoadingMap(prev => ({ ...prev, [orderId]: true }));
        setRetryErrorMap(prev => ({ ...prev, [orderId]: null }));

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/ed/pedido/${orderId}/reintentar-pago`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.init_point) {
                    window.location.href = data.init_point;
                    return;
                }
            }

            if (res.status === 409) {
                const errorData = await res.json();
                if (errorData.code === "RESERVA_EXPIRADA") {
                    setRetryErrorMap(prev => ({ ...prev, [orderId]: "La reserva expiró. Armá el pedido de nuevo." }));
                    await loadOrders();
                } else if (errorData.code === "SIN_LINK_PAGO") {
                    setRetryErrorMap(prev => ({ ...prev, [orderId]: "No se puede retomar este pedido." }));
                } else if (errorData.code === "ESTADO_NO_VALIDO") {
                    setRetryErrorMap(prev => ({ ...prev, [orderId]: "El estado del pedido cambió." }));
                    await loadOrders();
                } else {
                    setRetryErrorMap(prev => ({ ...prev, [orderId]: errorData.error || "No se pudo reintentar el pago." }));
                }
            } else {
                setRetryErrorMap(prev => ({ ...prev, [orderId]: "Error al procesar la solicitud de reintento." }));
            }
        } catch (e) {
            console.error("Error retrying payment", e);
            setRetryErrorMap(prev => ({ ...prev, [orderId]: "Error de conexión al reintentar el pago." }));
        } finally {
            setRetryLoadingMap(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const checkOrderStatus = async (orderId: number) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/ed/pedido/${orderId}/estado`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.estado_efectivo === "expirado" || data.estado_pago === "pagado") {
                    await loadOrders();
                }
            }
        } catch (e) {
            console.error("Error checking order status", e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "codigo_postal") setCpError("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setCpError("");

        if (!formData.codigo_postal.trim() || !/^\d{4}$/.test(formData.codigo_postal.trim())) {
            setCpError("El código postal debe tener 4 dígitos.");
            setSaving(false);
            return;
        }

        try {
            await updateProfileData(formData);
            setMessage("Perfil actualizado correctamente");
        } catch {
            setMessage("Hubo un error al actualizar el perfil");
        } finally {
            setSaving(false);
        }
    };

    // ─── Push Notifications state (¡siempre antes de cualquier return!) ───
    const [pushSupported, setPushSupported] = useState(false);
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [pushLoading, setPushLoading] = useState(true);
    const [pushError, setPushError] = useState<string | null>(null);
    const pushChecked = useRef(false);

    useEffect(() => {
        if (pushChecked.current) return;
        pushChecked.current = true;
        const supported = isPushSupported();
        setPushSupported(supported);
        if (supported && getPermissionState() === "granted") {
            checkSubscriptionStatus().then((subscribed) => {
                setPushSubscribed(subscribed);
                setPushLoading(false);
            });
        } else {
            setPushLoading(false);
        }
    }, []);

    if (loading || !user) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    async function handleTogglePush() {
        setPushError(null);
        setPushLoading(true);
        if (pushSubscribed) {
            const ok = await unsubscribeFromPush();
            setPushSubscribed(!ok);
            if (!ok) setPushError("No se pudo desactivar. Intentá de nuevo.");
        } else {
            const result = await subscribeToPush();
            if (result === "ok") {
                setPushSubscribed(true);
            } else if (result === "denied") {
                setPushError("Permiso denegado. Habílitalo desde la configuración de tu navegador.");
            } else {
                setPushError("No se pudo activar. Intentá de nuevo.");
            }
        }
        setPushLoading(false);
    }

    const profileIncomplete = isProfileIncomplete(profile);

    return (
        <div
            className={`min-h-screen pt-16 relative transition-opacity duration-1000 ${backgroundLoaded ? "opacity-100" : "opacity-0"}`}
            style={{
                backgroundImage: backgroundLoaded ? `url('${backgroundImage}')` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div
                className={`absolute inset-0 ${isXbox ? "bg-[#141414]" : "bg-[var(--color-background)]"}`}
                style={{ opacity: isXbox ? 0.3 : 0.85 }}
            ></div>

            <div className="relative z-10 pt-8 px-4 pb-12">
                <div className="max-w-3xl mx-auto">

                    {/* User header card */}
                    <div className={`card p-4 sm:p-6 mb-6 ${isXbox ? "bg-[#1A1A1A]/90 border border-[#107C10]" : ""}`}>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <img
                                src={user.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? "U")}&background=4a7bc8&color=fff`}
                                alt="Avatar"
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 border-2 border-[var(--color-primary)] bg-white"
                            />
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-2xl font-bold truncate text-[var(--color-foreground)]">{user.displayName || "Usuario"}</h1>
                                <p className="text-xs sm:text-sm truncate text-[var(--color-foreground)]/60">{user.email}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                                Salir
                            </button>
                        </div>
                        <div className="mt-3 sm:hidden">
                            <Link to="/wishlist" className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-foreground)]/20 text-[var(--color-foreground)]/70 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors">
                                ♥ Deseados
                            </Link>
                        </div>
                        <div className="hidden sm:flex justify-end mt-0">
                            <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-foreground)]/20 text-[var(--color-foreground)]/70 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors">
                                ♥ Deseados
                            </Link>
                        </div>
                    </div>

                    {/* Alert banner for incomplete profile */}
                    {profileIncomplete && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--color-warning)]/15 border border-[var(--color-warning)]/40 text-[var(--color-warning)] flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm font-medium">
                                Tu perfil está incompleto. Completá tu apellido, domicilio, ciudad y código postal (4 dígitos) para realizar compras.
                            </p>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className={`card flex gap-1 p-1 mb-6 ${isXbox ? "bg-[#111]/90" : ""}`}>
                        {(["perfil", "pedidos"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize transition-all cursor-pointer ${activeTab === tab
                                    ? isXbox
                                        ? "bg-[#107C10] text-white shadow"
                                        : "bg-[var(--color-primary)] text-white shadow"
                                    : "text-[var(--color-foreground)]/50 hover:text-[var(--color-foreground)] hover:bg-[var(--color-foreground)]/5"
                                    }`}
                            >
                                {tab === "perfil" ? "Mi Perfil" : "Mis Pedidos"}
                            </button>
                        ))}
                    </div>

                    {/* TAB: PERFIL */}
                    {activeTab === "perfil" && (
                        <>
                        <div className={`card p-4 sm:p-8 ${isXbox ? "bg-[#1A1A1A]/95 border border-[#107C10]" : ""}`}>
                            {message && (
                                <div className={`p-4 mb-6 rounded-lg ${message.includes("error") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                                    {message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="profile_name" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Nombre</label>
                                        <input id="profile_name" type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
                                    </div>
                                    <div>
                                        <label htmlFor="profile_apellido" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Apellido</label>
                                        <input id="profile_apellido" type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="input" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="profile_email" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Email (No modificable)</label>
                                    <input id="profile_email" type="email" value={user.email || ""} disabled className="input opacity-70 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label htmlFor="profile_domicilio" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Domicilio</label>
                                    <input id="profile_domicilio" type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="input" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="profile_ciudad" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Ciudad</label>
                                        <input id="profile_ciudad" type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="input" required />
                                    </div>
                                    <div>
                                        <label htmlFor="profile_codigo_postal" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Código Postal (4 dígitos)</label>
                                        <input id="profile_codigo_postal" type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} maxLength={4} className={`input ${cpError ? "border-[var(--color-error)]" : ""}`} required />
                                        {cpError && <p className="text-[var(--color-error)] text-xs mt-1">{cpError}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-stretch sm:justify-end pt-4 border-t border-[var(--color-border)]">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`btn-primary w-full sm:w-auto ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ─── Notificaciones Push ─── */}
                        <div className={`card p-5 mt-4 ${isXbox ? "bg-[#1A1A1A]/95 border border-[#107C10]" : ""}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                    <BellRing size={18} className="text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--color-foreground)] text-sm">Notificaciones Push</h3>
                                    <p className="text-xs text-[var(--color-foreground)]/60">
                                        Recibí alertas de nuevos productos y promociones exclusivas
                                    </p>
                                </div>
                            </div>

                            {!pushSupported ? (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-foreground)]/5 text-[var(--color-foreground)]/60 text-xs">
                                    <BellOff size={15} />
                                    <span>Tu navegador no soporta notificaciones push. Instalá la PWA en Chrome o Edge para usarlas.</span>
                                </div>
                            ) : getPermissionState() === "denied" ? (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs">
                                    <AlertCircle size={15} />
                                    <span>Permiso denegado. Para activarlas, habílitálas en la configuración de tu navegador (îcono de candado en la barra de dirección).</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                            pushSubscribed
                                                ? "bg-[var(--color-success)]/15"
                                                : "bg-[var(--color-foreground)]/8"
                                        }`}>
                                            {pushSubscribed
                                                ? <Bell size={18} className="text-[var(--color-success)]" />
                                                : <BellOff size={18} className="text-[var(--color-foreground)]/40" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                                {pushSubscribed ? "Notificaciones activadas" : "Notificaciones desactivadas"}
                                            </p>
                                            <p className="text-xs text-[var(--color-foreground)]/60">
                                                {pushSubscribed
                                                    ? "Te llegaran alertas de nuevos productos y ofertas"
                                                    : "Activálas para no perderte ningún lanzamiento"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toggle switch */}
                                    <button
                                        id="push-toggle"
                                        onClick={handleTogglePush}
                                        disabled={pushLoading}
                                        aria-label={pushSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                                            pushSubscribed
                                                ? "bg-[var(--color-success)]"
                                                : "bg-[var(--color-foreground)]/20"
                                        }`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                            pushSubscribed ? "translate-x-6" : "translate-x-1"
                                        }`}>
                                            {pushLoading && (
                                                <Loader2 size={12} className="animate-spin text-[var(--color-primary)] absolute inset-0 m-auto" />
                                            )}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {pushError && (
                                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs">
                                    <AlertCircle size={13} />
                                    <span>{pushError}</span>
                                </div>
                            )}
                        </div>

                        </>
                    )}

                    {/* TAB: PEDIDOS */}
                    {activeTab === "pedidos" && (
                        <div className="animate-fade-in-up">
                            {ordersLoading ? (
                                <div className="flex justify-center py-16">
                                    <div className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className={`card p-8 text-center ${isXbox ? "bg-[#1A1A1A]/95 border border-[#107C10]" : ""}`}>
                                    <div className="text-5xl mb-4">📦</div>
                                    <h3 className="text-xl font-bold mb-2 text-[var(--color-foreground)]">Todavía no tenés pedidos</h3>
                                    <p className="mb-6 text-[var(--color-foreground)]/60">¡Explorá el catálogo y hacé tu primera compra!</p>
                                    <Link to="/catalogo" className="btn-primary inline-block px-6 py-2">Ir al catálogo</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order, idx) => {
                                        const isPendiente = order.estado_efectivo === "pendiente";
                                        const isNearExpiry = !!nearExpiryMap[order.id];
                                        const isExpired = !!expiredMap[order.id];
                                        const isRetryLoading = !!retryLoadingMap[order.id];
                                        const retryError = retryErrorMap[order.id];

                                        // El backend puede seguir devolviendo "Esperando pago" en estado_visible
                                        // hasta que corra el cron. estado_efectivo manda.
                                        const etiqueta = order.estado_efectivo === "expirado"
                                            ? "Expirado"
                                            : (order.estado_visible ?? order.estado);

                                        return (
                                            <div
                                                key={order.id}
                                                className={`card p-4 sm:p-6 animate-fade-in-up transition-all ${
                                                    isPendiente ? "border-2 border-amber-400/50 shadow-md" : ""
                                                }`}
                                                style={{ animationDelay: `${idx * 0.1}s` }}
                                            >
                                                {/* Header */}
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                                    <div className="min-w-0">
                                                        <span className="font-mono text-sm font-bold text-[var(--color-foreground)]/80">
                                                            Pedido #{String(order.id).padStart(4, "0")}
                                                        </span>
                                                        <p className="text-xs mt-0.5 text-[var(--color-foreground)]/50">
                                                            {new Date(order.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                                                        {isPendiente && order.expira_at && (
                                                            <CronometroReserva
                                                                expiraAt={order.expira_at}
                                                                onExpire={() => checkOrderStatus(order.id)}
                                                                onNearExpiryChange={(near, expired) => {
                                                                    setNearExpiryMap(prev => ({ ...prev, [order.id]: near }));
                                                                    setExpiredMap(prev => ({ ...prev, [order.id]: expired }));
                                                                }}
                                                            />
                                                        )}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[etiqueta] ?? "bg-gray-100 text-gray-600"}`}>
                                                            {etiqueta}
                                                        </span>
                                                        <span className="text-base sm:text-lg font-bold text-[var(--color-primary)]">
                                                            {formatearPrecio(order.total)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Reintento de pago */}
                                                {isPendiente && (
                                                    <div className="mb-4 pt-3 pb-2 border-t border-[var(--color-warning)]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="text-xs">
                                                            {isExpired ? (
                                                                <span className="font-semibold flex items-center gap-1.5 text-[var(--color-error)]">
                                                                    <AlertCircle size={15} />
                                                                    La reserva expiró.
                                                                </span>
                                                            ) : isNearExpiry ? (
                                                                <span className="font-semibold flex items-center gap-1.5 text-[var(--color-warning)] animate-pulse">
                                                                    <AlertCircle size={15} />
                                                                    Quedan menos de 60 segundos, completá el pago ahora
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-warning)]/15 border border-[var(--color-warning)]/30 text-[var(--color-warning)] font-semibold">
                                                                    <AlertCircle size={13} />
                                                                    Podés reintentar el pago antes de que expire la reserva.
                                                                </span>
                                                            )}
                                                        </div>

                                                        {order.init_point_disponible && (
                                                            <button
                                                                onClick={() => handleRetryPayment(order.id)}
                                                                disabled={isExpired || isRetryLoading}
                                                                className={`btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                                                    isNearExpiry && !isExpired ? "animate-pulse" : ""
                                                                }`}
                                                            >
                                                                {isRetryLoading ? (
                                                                    <>
                                                                        <Loader2 size={15} className="animate-spin" />
                                                                        <span>Generando link...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CreditCard size={15} />
                                                                        <span>{isNearExpiry ? "Completar pago ahora" : "Completar pago"}</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Error de reintento */}
                                                {retryError && (
                                                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                                                        <AlertCircle size={15} />
                                                        <span>{retryError}</span>
                                                    </div>
                                                )}

                                                {/* Productos */}
                                                <div className="space-y-2">
                                                    {order.productos.map((p, i) => (
                                                        <div key={i} className="flex items-center gap-3 text-sm text-[var(--color-foreground)]/80">
                                                            {p.image && <img src={p.image} alt={p.nombre} className="w-10 h-10 rounded object-cover border border-gray-200/20" />}
                                                            <span className="flex-1 truncate">{p.nombre}</span>
                                                            <span className="text-xs opacity-60">×{p.cantidad}</span>
                                                            <span className="font-medium">{formatearPrecio(p.precio_unitario)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Footer */}
                                                <div className="mt-4 pt-3 border-t border-gray-200/10 flex items-center justify-between">
                                                    {order.tiene_tracking ? (
                                                        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                                            📦 En envío con seguimiento
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <Link
                                                        to={`/mis-pedidos/${order.id}`}
                                                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        Ver detalle del pedido →
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}