import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formatearPrecio";

type Order = {
    id: number;
    estado: "pendiente" | "pagado" | "cancelado";
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
                const res = await fetch(`${API_URL}/ed/mis-pedidos`, {
                    headers: { "X-Firebase-UID": user.uid }
                });
                if (res.ok) setOrders(await res.json());
            } catch (e) {
                console.error("Error loading orders", e);
            } finally {
                setOrdersLoading(false);
            }
        };
        loadOrders();
    }, [activeTab, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
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
        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-[#4a7bc8]"
        } focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors`;

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
                    <div className={`p-6 rounded-2xl mb-6 flex items-center gap-4 backdrop-blur-md ${isXbox ? "bg-[#1A1A1A]/90 border border-[#107C10]" : "bg-white/90 shadow-lg"}`}>
                        <img
                            src={user.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? "U")}&background=4a7bc8&color=fff`}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-primary)] bg-white"
                        />
                        <div>
                            <h1 className={`text-2xl font-bold ${isXbox ? "text-white" : "text-gray-900"}`}>{user.displayName || "Usuario"}</h1>
                            <p className={`text-sm ${isXbox ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                        </div>
                        <div className="ml-auto flex gap-3">
                            <Link to="/wishlist" className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isXbox ? "border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-black/5"}`}>
                                ♥ Deseados
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                                Salir
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`flex gap-1 p-1 rounded-xl mb-6 backdrop-blur-md ${isXbox ? "bg-[#111]/90" : "bg-white/80 shadow-sm"}`}>
                        {(["perfil", "pedidos"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg font-medium text-sm capitalize transition-all cursor-pointer ${activeTab === tab
                                    ? isXbox
                                        ? "bg-[#107C10] text-white shadow"
                                        : "bg-[var(--color-primary)] text-white shadow"
                                    : isXbox
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                        : "text-gray-600 hover:text-gray-800 hover:bg-black/5"
                                    }`}
                            >
                                {tab === "perfil" ? "Mi Perfil" : "Mis Pedidos"}
                            </button>
                        ))}
                    </div>

                    {/* TAB: PERFIL */}
                    {activeTab === "perfil" && (
                        <div className={`p-8 rounded-2xl backdrop-blur-md ${isXbox ? "bg-[#1A1A1A]/95 border border-[#107C10]" : "bg-white/95 shadow-xl"}`}>
                            {message && (
                                <div className={`p-4 mb-6 rounded-lg ${message.includes("error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    {message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Nombre</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    <div>
                                        <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Apellido</label>
                                        <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Email (No modificable)</label>
                                    <input type="email" value={user.email || ""} disabled className={`${inputClass} opacity-70 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Domicilio</label>
                                    <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Ciudad</label>
                                        <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={`block mb-2 text-sm font-medium ${isXbox ? "text-gray-300" : "text-gray-700"}`}>Código Postal</label>
                                        <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className={inputClass} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700/50">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`px-8 py-3 rounded-lg font-medium text-white transition-colors cursor-pointer ${isXbox ? "bg-[#107C10] hover:bg-[#0c5f0c]" : "bg-[#4a7bc8] hover:bg-[#3a5ba8]"} ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
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
                                <div className={`p-8 rounded-2xl text-center backdrop-blur-md ${isXbox ? "bg-[#1A1A1A]/95 border border-[#107C10]" : "bg-white/95 shadow-xl"}`}>
                                    <div className="text-5xl mb-4">📦</div>
                                    <h3 className={`text-xl font-bold mb-2 ${isXbox ? "text-white" : "text-gray-900"}`}>Todavía no tenés pedidos</h3>
                                    <p className={`mb-6 ${isXbox ? "text-gray-400" : "text-gray-500"}`}>¡Explorá el catálogo y hacé tu primera compra!</p>
                                    <Link to="/catalogo" className="btn-primary inline-block px-6 py-2">Ir al catálogo</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order, idx) => (
                                        <div key={order.id} className={`p-6 rounded-2xl backdrop-blur-md animate-fade-in-up ${isXbox ? "bg-[#1A1A1A]/95 border border-[#222]" : "bg-white/95 shadow-lg"}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className={`font-mono text-sm font-bold ${isXbox ? "text-gray-300" : "text-gray-500"}`}>
                                                        Pedido #{String(order.id).padStart(4, "0")}
                                                    </span>
                                                    <p className={`text-xs mt-0.5 ${isXbox ? "text-gray-500" : "text-gray-400"}`}>
                                                        {new Date(order.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ESTADO_COLORS[order.estado] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {order.estado}
                                                    </span>
                                                    <span className={`text-lg font-bold ${isXbox ? "text-[#107C10]" : "text-[var(--color-primary)]"}`}>
                                                        {formatearPrecio(order.total)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {order.productos.map((p, i) => (
                                                    <div key={i} className={`flex items-center gap-3 text-sm ${isXbox ? "text-gray-300" : "text-gray-700"}`}>
                                                        {p.image && <img src={p.image} alt={p.nombre} className="w-10 h-10 rounded object-cover border border-gray-200/20" />}
                                                        <span className="flex-1 truncate">{p.nombre}</span>
                                                        <span className="text-xs opacity-60">×{p.cantidad}</span>
                                                        <span className="font-medium">{formatearPrecio(p.precio_unitario)}</span>
                                                    </div>
                                                ))}
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
