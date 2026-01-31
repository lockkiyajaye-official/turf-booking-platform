import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginOtp() {
  const [step, setStep] = useState<"method" | "phone" | "email">("method");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithPhoneOtp, loginWithEmailOtp, requestPhoneOtp, requestEmailOtp } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (type: "phone" | "email") => {
    setError("");
    setLoading(true);
    try {
      let response;
      if (type === "phone") {
        if (!phone) {
          setError("Please enter your phone number");
          return;
        }
        response = await requestPhoneOtp(phone);
      } else {
        if (!email) {
          setError("Please enter your email");
          return;
        }
        response = await requestEmailOtp(email);
      }
      setOtpValue(response.otp);
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
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (step === "phone") {
        await loginWithPhoneOtp(phone, otp);
      } else {
        await loginWithEmailOtp(email, otp);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
              Sign in with OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                use email/password
              </Link>
            </p>
          </div>
          <div className="space-y-4">
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
            {step === "phone" ? "Sign in with Phone" : "Sign in with Email"}
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
              <div>
                <label htmlFor={step} className="block text-sm font-medium text-gray-700 mb-2">
                  {step === "phone" ? "Phone Number" : "Email Address"}
                </label>
                <input
                  id={step}
                  type={step === "phone" ? "tel" : "email"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={step === "phone" ? "+1234567890" : "email@example.com"}
                  value={step === "phone" ? phone : email}
                  onChange={(e) => (step === "phone" ? setPhone(e.target.value) : setEmail(e.target.value))}
                />
              </div>
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
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-2xl tracking-widest"
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
                onClick={handleLogin}
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
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
                setPhone("");
                setEmail("");
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
