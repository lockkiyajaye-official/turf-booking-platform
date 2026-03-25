import { ArrowRight, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function Onboarding() {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<"role_selection" | "owner_form">(
        "role_selection",
    );

    const [ownerData, setOwnerData] = useState({
        businessName: "",
        businessAddress: "",
        businessPhone: "",
        businessDescription: "",
        taxId: "",
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.onboardingStatus === "completed") {
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "turf_owner") navigate("/owner/overview");
            else navigate("/home");
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleSelectUser = async () => {
        setLoading(true);
        setError("");
        try {
            // Normal users don't need onboarding details, just mark as complete
            await api.post("/auth/onboarding/user", {});
            await refreshUser();
            navigate("/home");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to complete onboarding",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOwnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/onboarding/turf-owner", ownerData);
            await refreshUser();
            navigate("/dashboard");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to complete onboarding",
            );
        } finally {
            setLoading(false);
        }
    };

    if (step === "role_selection") {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
                    <div className="inline-block bg-[#E33E33]/10 text-[#E33E33] px-4 py-1.5 rounded-full font-bold text-sm mb-6">
                        Welcome to Turf Booking
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        What brings you here?
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Tell us how you'd like to use our platform to get the
                        best experience possible.
                    </p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-[#FF4D4D] p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                        {/* Option 1: User */}
                        <div
                            onClick={handleSelectUser}
                            className={`relative bg-white border-2 border-transparent hover:border-[#E33E33] hover:shadow-xl hover:shadow-[#E33E33]/10 p-8 rounded-3xl cursor-pointer transition-all duration-300 group flex flex-col items-center text-center ${loading ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                                <img src="/logo.png" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Book Turfs
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Find the best venues in your city and book
                                instantly for your next game.
                            </p>
                            <div className="mt-auto flex items-center text-[#E33E33] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>

                        {/* Option 2: Turf Owner */}
                        <div
                            onClick={() => setStep("owner_form")}
                            className={`relative bg-white border-2 border-transparent hover:border-[#E33E33] hover:shadow-xl hover:shadow-[#E33E33]/10 p-8 rounded-3xl cursor-pointer transition-all duration-300 group flex flex-col items-center text-center ${loading ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <div className="w-16 h-16 bg-gray-50 group-hover:bg-[#E33E33] rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                                <span className="text-3xl group-hover:scale-110 transition-transform">
                                    🏟️
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                List My Turf
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Partner with us to manage your bookings and
                                increase your revenue.
                            </p>
                            <div className="mt-auto flex items-center text-[#E33E33] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Start Setup</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <button
                            onClick={logout}
                            disabled={loading}
                            className="inline-flex items-center text-gray-400 hover:text-gray-600 font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "owner_form") {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
                    <button
                        onClick={() => setStep("role_selection")}
                        className="inline-flex items-center text-gray-400 hover:text-gray-600 font-medium transition-colors mb-6"
                    >
                        ← Back to roles
                    </button>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        Business Details
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Let's get your turf set up on our platform.
                    </p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-[#FF4D4D] p-4 rounded-md">
                                <p className="text-sm text-red-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleOwnerSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="e.g. Elite Sports Arena"
                                    value={ownerData.businessName}
                                    onChange={(e) =>
                                        setOwnerData({
                                            ...ownerData,
                                            businessName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Business Address *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium resize-none"
                                    placeholder="Full address of your facility"
                                    value={ownerData.businessAddress}
                                    onChange={(e) =>
                                        setOwnerData({
                                            ...ownerData,
                                            businessAddress: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Business Phone *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="+1234567890"
                                    value={ownerData.businessPhone}
                                    onChange={(e) =>
                                        setOwnerData({
                                            ...ownerData,
                                            businessPhone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Business Description{" "}
                                    <span className="text-gray-400 font-normal">
                                        (Optional)
                                    </span>
                                </label>
                                <textarea
                                    rows={3}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium resize-none"
                                    placeholder="Briefly describe your facilities..."
                                    value={ownerData.businessDescription}
                                    onChange={(e) =>
                                        setOwnerData({
                                            ...ownerData,
                                            businessDescription: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Tax ID{" "}
                                    <span className="text-gray-400 font-normal">
                                        (Optional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="e.g. GSTIN"
                                    value={ownerData.taxId}
                                    onChange={(e) =>
                                        setOwnerData({
                                            ...ownerData,
                                            taxId: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !ownerData.businessName ||
                                        !ownerData.businessAddress ||
                                        !ownerData.businessPhone
                                    }
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#FF4D4D]/20 text-sm font-bold text-white bg-[#E33E33] hover:bg-[#c9352c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D4D] transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                >
                                    {loading
                                        ? "Saving Details..."
                                        : "Complete Setup"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
