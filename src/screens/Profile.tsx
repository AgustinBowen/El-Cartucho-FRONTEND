import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth, isProfileIncomplete } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formatearPrecio";

type Order = {
    id: number;
    estado: string;
    estado_pago?: string;
    estado_envio?: string | null;
    estado_visible?: string;
    costo_envio?: number;
    tiene_tracking?: boolean;
    total: number;
    created_at: string;
    productos: {
        nombre: string;
        cantidad: number;
        precio_unitario: number;
        image?: string | null;
    }[];
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ESTADO_COLORS: Record<string, string> = {
    "Pago confirmado": "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    "Preparando tu pedido": "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    "En camino": "bg-purple-500/10 text-purple-600 border border-purple-500/20",
    "Entregado": "bg-green-500/10 text-green-600 border border-green-500/20",
    "Esperando pago": "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    "Pago rechazado": "bg-rose-500/10 text-rose-600 border border-rose-500/20",
    "Expirado": "bg-gray-500/10 text-gray-600 border border-gray-500/20",
    "Reembolsado": "bg-rose-500/10 text-rose-600 border border-rose-500/20",
    pagado: "bg-green-100 text-green-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    cancelado: "bg-red-100 text-red-600",
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

    useEffect(() => {
        if (activeTab !== "pedidos" || !user) return;
        const loadOrders = async () => {
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
        };
        loadOrders();
    }, [activeTab, user, logout, navigate]);

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

    if (loading || !user) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const inputClass = `w-full px-4 py-3 rounded-lg border ${isXbox
        ? "bg-[#2A2A2A] border-gray-600 text-white focus:border-[#107C10]"
        : "bg-[var(--color-foreground)]/5 border-[var(--color-foreground)]/15 text-[var(--color-foreground)] focus:border-[var(--color-primary)]"
        } focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors placeholder:text-[var(--color-foreground)]/40`;

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
                    {/* User header card */}
                    <div className={`card p-4 sm:p-6 mb-6 ${isXbox ? "bg-[#1A1A1A]/90 border border-[#107C10]" : ""}`}>
                        {/* Fila superior: avatar + nombre + acciones */}
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
                            {/* Botón salir — siempre visible */}
                            <button
                                onClick={logout}
                                className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                                Salir
                            </button>
                        </div>
                        {/* Fila inferior (solo mobile): botón deseados a ancho completo */}
                        <div className="mt-3 sm:hidden">
                            <Link to="/wishlist" className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-foreground)]/20 text-[var(--color-foreground)]/70 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors">
                                ♥ Deseados
                            </Link>
                        </div>
                        {/* Botón deseados en desktop — al lado del salir */}
                        <div className="hidden sm:flex justify-end mt-0">
                            <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-foreground)]/20 text-[var(--color-foreground)]/70 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors">
                                ♥ Deseados
                            </Link>
                        </div>
                    </div>

                    {/* Alert banner for incomplete profile */}
                    {profileIncomplete && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center gap-3">
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
                                        <input id="profile_name" type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    <div>
                                        <label htmlFor="profile_apellido" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Apellido</label>
                                        <input id="profile_apellido" type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={inputClass} required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="profile_email" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Email (No modificable)</label>
                                    <input id="profile_email" type="email" value={user.email || ""} disabled className={`${inputClass} opacity-70 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label htmlFor="profile_domicilio" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Domicilio</label>
                                    <input id="profile_domicilio" type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="profile_ciudad" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Ciudad</label>
                                        <input id="profile_ciudad" type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    <div>
                                        <label htmlFor="profile_codigo_postal" className="block mb-2 text-sm font-medium text-[var(--color-foreground)]/80">Código Postal (4 dígitos)</label>
                                        <input id="profile_codigo_postal" type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} maxLength={4} className={`${inputClass} ${cpError ? "border-red-500" : ""}`} required />
                                        {cpError && <p className="text-red-500 text-xs mt-1">{cpError}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-stretch sm:justify-end pt-4 border-t border-[var(--color-foreground)]/10">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`w-full sm:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors cursor-pointer ${isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"} ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
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
                                    {orders.map((order, idx) => (
                                        <div key={order.id} className="card p-4 sm:p-6 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                                <div className="min-w-0">
                                                    <span className="font-mono text-sm font-bold text-[var(--color-foreground)]/80">
                                                        Pedido #{String(order.id).padStart(4, "0")}
                                                    </span>
                                                    <p className="text-xs mt-0.5 text-[var(--color-foreground)]/50">
                                                        {new Date(order.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ESTADO_COLORS[order.estado_visible ?? order.estado] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {order.estado_visible ?? order.estado}
                                                    </span>
                                                    <span className="text-base sm:text-lg font-bold text-[var(--color-primary)]">
                                                        {formatearPrecio(order.total)}
                                                    </span>
                                                </div>
                                            </div>
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
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
