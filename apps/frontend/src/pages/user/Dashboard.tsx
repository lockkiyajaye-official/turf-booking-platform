import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
            return;
        }

        if (user) {
            if (user.onboardingStatus !== "completed") {
                navigate("/onboarding");
                return;
            }

            // Redirect based on role
            if (user.role === "turf_owner") {
                navigate("/dashboard/turfs");
            } else if (user.role === "user") {
                navigate("/dashboard/bookings");
            } else if (user.role === "admin") {
                navigate("/dashboard/admin");
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">Loading dashboard...</div>
        </div>
    );
}
