import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "../../components/GoogleAuthButton";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";

export default function Register() {
    const [identifier, setIdentifier] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<"phone" | "email" | null>(null);

    const {
        registerWithPhoneOtp,
        registerWithEmailOtp,
        requestPhoneOtp,
        requestEmailOtp,
    } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignup = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!firstName.trim() || !lastName.trim()) {
            setError("Please fill in your name first.");
            return;
        }
        if (!identifier.trim()) {
            setError("Please enter your email or phone number.");
            return;
        }

        const isEmail = identifier.includes("@");
        setMethod(isEmail ? "email" : "phone");
        setLoading(true);

        try {
            if (isEmail) {
                await requestEmailOtp(identifier);
            } else {
                await requestPhoneOtp(identifier);
            }
            setOtpSent(true);
            setCountdown(300); // 5 minutes
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
            setError(
                err.response?.data?.message ||
                "Failed to send OTP. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (method === "email") {
                await registerWithEmailOtp({
                    email: identifier,
                    otp,
                    firstName,
                    lastName,
                    role: "user",
                });
            } else {
                await registerWithPhoneOtp({
                    phone: identifier,
                    otp,
                    firstName,
                    lastName,
                    role: "user",
                });
            }
            navigate("/onboarding");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center pt-20 pb-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                        <img src="/logo.png" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 font-medium">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-[#FF4D4D] hover:text-[#d63a3a] transition-colors"
                    >
                        Sign in instead
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form
                        className="space-y-6"
                        onSubmit={otpSent ? handleRegister : handleRequestOtp}
                    >
                        {error && (
                            <div className="bg-red-50 border-l-4 border-[#FF4D4D] p-4 rounded-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!otpSent ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="block text-sm font-bold text-gray-700"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            className="mt-2 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="block text-sm font-bold text-gray-700"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            className="mt-2 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="identifier"
                                        className="block text-sm font-bold text-gray-700"
                                    >
                                        Email Address or Phone Number
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="identifier"
                                            name="identifier"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-sm font-medium"
                                            placeholder="you@example.com or +1234567890"
                                            value={identifier}
                                            onChange={(e) =>
                                                setIdentifier(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            !identifier ||
                                            !firstName ||
                                            !lastName
                                        }
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#FF4D4D]/20 text-sm font-bold text-white bg-[#E33E33] hover:bg-[#c9352c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D4D] transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                    >
                                        {loading
                                            ? "Sending OTP..."
                                            : "Continue"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label
                                        htmlFor="otp"
                                        className="block text-sm font-bold text-gray-700 text-center"
                                    >
                                        Enter the verification code
                                    </label>
                                    <p className="text-xs text-center text-gray-500 mt-1 mb-4">
                                        We sent a code to{" "}
                                        <span className="font-semibold text-gray-800">
                                            {identifier}
                                        </span>
                                    </p>
                                    <div className="mt-1">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            required
                                            maxLength={6}
                                            className="appearance-none block w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] focus:border-transparent transition-all sm:text-2xl text-center tracking-[0.5em] font-bold"
                                            placeholder="••••••"
                                            value={otp}
                                            onChange={(e) =>
                                                setOtp(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    {countdown > 0 && (
                                        <p className="text-sm text-center text-gray-500 mt-4 font-medium">
                                            Code expires in{" "}
                                            <span className="text-[#FF4D4D] font-bold">
                                                {Math.floor(countdown / 60)}:
                                                {(countdown % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#FF4D4D]/20 text-sm font-bold text-white bg-[#E33E33] hover:bg-[#c9352c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D4D] transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                    >
                                        {loading
                                            ? "Verifying..."
                                            : "Verify & Register"}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    {!otpSent && (
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">
                                        Or sign up with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <GoogleAuthButton
                                    label="Google"
                                    onClick={handleGoogleSignup}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
