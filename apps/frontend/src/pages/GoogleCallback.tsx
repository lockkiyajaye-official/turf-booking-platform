import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallback() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setAuthFromToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            // If there's no token, redirect back to login
            navigate("/login", { replace: true });
            return;
        }

        const handleToken = async () => {
            try {
                await setAuthFromToken(token);
                // After Google sign-in, take normal users to their home page
                navigate("/home", { replace: true });
            } catch {
                navigate("/login", { replace: true });
            }
        };

        void handleToken();
    }, [location.search, navigate, setAuthFromToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">⚽</span>
                    </div>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Finishing Google sign-in...
                </h1>
                <p className="text-gray-600 text-sm">
                    Please wait while we securely complete your login.
                </p>
            </div>
        </div>
    );
}

