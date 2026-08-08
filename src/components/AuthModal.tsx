import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const { isXbox } = useTheme();

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            onClose();
        } catch (error) {
            console.error("Error signing in with Google", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`relative w-full max-w-md mx-4 rounded-2xl p-8 overflow-hidden
                ${isXbox ? "bg-[#1A1A1A] text-white border border-[#107C10]" : "bg-white text-gray-900 shadow-2xl"}
            `}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
                >
                    <X size={20} className={isXbox ? "text-gray-400" : "text-gray-500"} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Iniciar sesión</h2>
                    <p className={isXbox ? "text-gray-400" : "text-[#FF4A3D]"}>
                        Para comenzar ingresá con tu cuenta
                    </p>
                </div>

                <div className="space-y-4 mt-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer
                            ${isXbox
                                ? "bg-[#107C10] hover:bg-[#0c5f0c] text-white"
                                : "bg-white border-2 border-gray-200 hover:border-[#4a7bc8] text-gray-700 shadow-sm hover:shadow"
                            }
                        `}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                Continuar con Google
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
