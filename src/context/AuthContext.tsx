import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    apellido?: string | null;
    domicilio?: string | null;
    ciudad?: string | null;
    codigo_postal?: string | null;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/ed";

    const fetchProfile = async (firebaseUser: FirebaseUser) => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                headers: {
                    "X-Firebase-UID": firebaseUser.uid,
                    "X-User-Email": firebaseUser.email || "",
                    "X-User-Name": firebaseUser.displayName || "",
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                console.error("Failed to fetch profile:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const updateProfileData = async (data: Partial<UserProfile>) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Firebase-UID": user.uid,
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error((errorData as { error?: string }).error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile", error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, updateProfileData }}>
            {children}
        </AuthContext.Provider>
    );
};
