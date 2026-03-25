import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface User {
    id: string;
    email?: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user" | "turf_owner";
    onboardingStatus: "pending" | "in_progress" | "completed";
    phone?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    isApproved?: boolean;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessDescription?: string;
    taxId?: string;
    approvalNotes?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<User>;
    /**
     * Set auth state directly from an existing JWT token (e.g. Google OAuth callback).
     * This stores the token, updates context, and refreshes the current user.
     */
    setAuthFromToken: (token: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    loginWithPhoneOtp: (
        phone: string,
        otp: string,
    ) => Promise<{ token: string; user: User }>;
    loginWithEmailOtp: (
        email: string,
        otp: string,
    ) => Promise<{ token: string; user: User }>;
    registerWithPhoneOtp: (data: RegisterWithPhoneOtpData) => Promise<void>;
    registerWithEmailOtp: (data: RegisterWithEmailOtpData) => Promise<void>;
    requestPhoneOtp: (
        phone: string,
        isLogin?: boolean,
    ) => Promise<{ otp?: string; expiresIn: number }>;
    requestEmailOtp: (
        email: string,
        isLogin?: boolean,
    ) => Promise<{ otp?: string; expiresIn: number }>;
    adminLogin: (email: string, password: string) => Promise<User>;
    logout: () => void;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "admin" | "user" | "turf_owner";
}

interface RegisterWithPhoneOtpData {
    phone: string;
    otp: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: "user" | "turf_owner";
}

interface RegisterWithEmailOtpData {
    email: string;
    otp: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "user" | "turf_owner";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const response = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        return userData;
    };

    const setAuthFromToken = async (authToken: string) => {
        setToken(authToken);
        localStorage.setItem("token", authToken);
        await fetchUser(authToken);
    };

    const adminLogin = async (email: string, password: string) => {
        const response = await api.post("/auth/admin/login", {
            email,
            password,
        });
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        return userData;
    };

    const register = async (data: RegisterData) => {
        const response = await api.post("/auth/register", data);
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const requestPhoneOtp = async (phone: string, isLogin?: boolean) => {
        const response = await api.post("/auth/otp/phone/request", {
            phone,
            isLogin,
        });
        return response.data;
    };

    const requestEmailOtp = async (email: string, isLogin?: boolean) => {
        const response = await api.post("/auth/otp/email/request", {
            email,
            isLogin,
        });
        return response.data;
    };

    const loginWithPhoneOtp = async (
        phone: string,
        otp: string,
    ): Promise<{ token: string; user: User }> => {
        const response = await api.post("/auth/login/phone", { phone, otp });
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        return response.data;
    };

    const loginWithEmailOtp = async (
        email: string,
        otp: string,
    ): Promise<{ token: string; user: User }> => {
        const response = await api.post("/auth/login/email", { email, otp });
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
        return response.data;
    };

    const registerWithPhoneOtp = async (data: RegisterWithPhoneOtpData) => {
        const response = await api.post("/auth/register/phone", data);
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const registerWithEmailOtp = async (data: RegisterWithEmailOtpData) => {
        const response = await api.post("/auth/register/email", data);
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const refreshUser = async () => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            await fetchUser(storedToken);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                setAuthFromToken,
                adminLogin,
                register,
                loginWithPhoneOtp,
                loginWithEmailOtp,
                registerWithPhoneOtp,
                registerWithEmailOtp,
                requestPhoneOtp,
                requestEmailOtp,
                logout,
                loading,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
