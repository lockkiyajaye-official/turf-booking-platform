import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/api";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

export default function RegisterOtp() {
    const [step, setStep] = useState<"method" | "phone" | "email">("method");
    const [formData, setFormData] = useState({
        phone: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "user" as "user" | "turf_owner",
    });
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState<string | undefined>();
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { registerWithPhoneOtp, registerWithEmailOtp, requestPhoneOtp, requestEmailOtp } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignup = () => {
        // Backend auth routes are under '/api'
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const handleRequestOtp = async (type: "phone" | "email") => {
        setError("");
        if (!formData.firstName || !formData.lastName) {
            setError("Please fill in your name first");
            return;
        }
        if (type === "phone" && !formData.phone) {
            setError("Please enter your phone number");
            return;
        }
        if (type === "email" && !formData.email) {
            setError("Please enter your email");
            return;
        }
        setLoading(true);
        try {
            let response;
            if (type === "phone") {
                response = await requestPhoneOtp(formData.phone);
            } else {
                response = await requestEmailOtp(formData.email);
            }
            setOtpValue(response.otp);
            setOtpSent(true);
            setCountdown(300);
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError("");
        setLoading(true);
        try {
            if (step === "phone") {
                await registerWithPhoneOtp({
                    phone: formData.phone,
                    otp,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email || undefined,
                    role: formData.role,
                });
            } else {
                await registerWithEmailOtp({
                    email: formData.email,
                    otp,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone || undefined,
                    role: formData.role,
                });
            }
            navigate("/onboarding");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (step === "method") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">⚽</span>
                            </div>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Create your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{" "}
                            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                                use email/password
                            </Link>
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I want to
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                            >
                                <option value="user">Book Turfs</option>
                                <option value="turf_owner">List My Turf</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setStep("phone")}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Continue with Phone
                        </button>
                        <button
                            onClick={() => setStep("email")}
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Continue with Email
                        </button>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>
                        <GoogleAuthButton
                            label="Sign up with Google"
                            onClick={handleGoogleSignup}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">⚽</span>
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {step === "phone" ? "Register with Phone" : "Register with Email"}
                    </h2>
                </div>
                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    {!otpSent ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {step === "phone" ? "Phone Number *" : "Email Address *"}
                                </label>
                                <input
                                    type={step === "phone" ? "tel" : "email"}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                    placeholder={step === "phone" ? "+1234567890" : "email@example.com"}
                                    value={step === "phone" ? formData.phone : formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [step === "phone" ? "phone" : "email"]: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            {step === "phone" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            )}
                            {step === "email" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                        placeholder="+1234567890"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            )}
                            <button
                                onClick={() => handleRequestOtp(step)}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </>
                    ) : (
                        <>
                            {otpValue && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                                    <p className="font-semibold">Development Mode - OTP:</p>
                                    <p className="text-2xl font-mono">{otpValue}</p>
                                    <p className="text-sm mt-1">This will not be shown in production</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                />
                                {countdown > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        OTP expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleRegister}
                                disabled={loading || otp.length !== 6}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & Register"}
                            </button>
                            <button
                                onClick={() => {
                                    setOtpSent(false);
                                    setOtp("");
                                    setOtpValue(undefined);
                                }}
                                className="w-full text-sm text-gray-600 hover:text-gray-900"
                            >
                                Change {step === "phone" ? "Phone" : "Email"}
                            </button>
                        </>
                    )}
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setStep("method");
                                setOtpSent(false);
                                setOtp("");
                                setOtpValue(undefined);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Back to method selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
