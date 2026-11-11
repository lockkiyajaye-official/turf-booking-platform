import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { User, Mail, Phone, Calendar, Building, Shield, Save, Check, X, Camera } from "lucide-react";
import { FileUploaderRegular as FileUploaderRegularBase } from "@uploadcare/react-uploader";

const FileUploaderRegular = FileUploaderRegularBase as any;
import "@uploadcare/react-uploader/core.css";

const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || "demopublickey";

interface NotificationSettings {
    emailBookings: boolean;
    emailPayments: boolean;
    emailPromos: boolean;
}

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Account form state
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Contact update OTP modal state
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [contactOtp, setContactOtp] = useState("");
    const [otpSending, setOtpSending] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);

    // Notifications state
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailBookings: true,
        emailPayments: true,
        emailPromos: false,
    });

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email ?? "");
            setPhone(user.phone ?? "");

            // Load notification preferences from user object
            setNotifications({
                emailBookings: user.emailBookings ?? true,
                emailPayments: user.emailPayments ?? true,
                emailPromos: user.emailPromos ?? false,
            });
        }
    }, [user]);


    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handlePhotoUpload = async (cdnUrl: string) => {
        setUploadingPhoto(true);
        try {
            await api.patch("/auth/profile", { profileImage: cdnUrl });
            await refreshUser();
            showMessage("success", "Profile photo updated!");
        } catch {
            showMessage("error", "Failed to update profile photo");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const startOtpCountdown = () => {
        setOtpCountdown(300);
        const interval = setInterval(() => {
            setOtpCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendContactOtp = async () => {
        setOtpSending(true);
        try {
            await api.post("/auth/profile/request-contact-otp");
            startOtpCountdown();
            showMessage("success", `OTP sent to ${user?.email}`);
        } catch (error: any) {
            showMessage(
                "error",
                error.response?.data?.message || "Failed to send OTP to your email",
            );
        } finally {
            setOtpSending(false);
        }
    };

    const handleAccountUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEmailChanging =
            email.trim().toLowerCase() !== (user?.email || "").trim().toLowerCase();
        const isPhoneChanging =
            phone.trim() !== (user?.phone || "").trim();

        // If contact details are changing, require OTP
        if (isEmailChanging || isPhoneChanging) {
            setOtpModalOpen(true);
            setContactOtp("");
            await handleSendContactOtp();
            return;
        }

        setLoading(true);
        try {
            await api.patch("/auth/profile", {
                firstName,
                lastName,
            });
            await refreshUser();
            showMessage("success", "Profile updated successfully!");
        } catch (error: any) {
            showMessage("error", error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactOtp.trim()) {
            showMessage("error", "Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            await api.patch("/auth/profile", {
                firstName,
                lastName,
                email: email.trim(),
                phone: phone.trim(),
                otp: contactOtp.trim(),
            });
            await refreshUser();
            setOtpModalOpen(false);
            setContactOtp("");
            showMessage("success", "Contact details and profile updated successfully!");
        } catch (error: any) {
            showMessage(
                "error",
                error.response?.data?.message || "Invalid OTP. Please check and try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch("/auth/notifications", notifications);
            showMessage("success", "Notification preferences saved!");
        } catch (error) {
            showMessage("error", "Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    const handleSecurityUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        showMessage("success", "Security settings updated! OTP-based login is active.");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Please log in to view your profile</div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                        }`}>
                        {message.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}
                <div className="max-w-6xl">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Overview</h1>

                        <div className="flex items-center space-x-6 pb-8 border-b border-gray-100 mb-8">
                            <div className="relative group">
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#e53935] to-red-700 rounded-full flex items-center justify-center">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <FileUploaderRegular
                                        pubkey={UPLOADCARE_PUBLIC_KEY}
                                        multiple={false}
                                        cropPreset="1:1"
                                        onFileUploadSuccess={(file: { cdnUrl: string }) => {
                                            const cdnUrl = file.cdnUrl;
                                            if (cdnUrl) handlePhotoUpload(cdnUrl);
                                        }}
                                        classNameUploader="uc-light"
                                    >
                                        <div slot="file-select-flow">
                                            <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer">
                                                {uploadingPhoto ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Camera className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    </FileUploaderRegular>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full capitalize mt-2">
                                    {user.role.replace("_", " ")}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-[#e53935]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="font-semibold text-gray-900">{user.email}</p>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-[#e53935]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone</p>
                                        <p className="font-semibold text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            )}

                            {user.role === "turf_owner" && user.businessName && (
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <Building className="w-5 h-5 text-[#e53935]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Business</p>
                                        <p className="font-semibold text-gray-900">{user.businessName}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-[#e53935]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {user.onboardingStatus.replace("_", " ")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Turf Owner Payout Account Link */}
                    {user.role === "turf_owner" && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                        Payout & Bank Details
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Manage your registered bank account, IFSC code, or UPI ID for turf revenue withdrawals.
                                    </p>
                                </div>
                                <a
                                    href="/owner/finances"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#e53935] hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm shrink-0"
                                >
                                    Manage Payout Details
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Account Details Section */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Details</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Update your basic information. Email cannot be changed as it's used for OTP login.
                        </p>

                        <form onSubmit={handleAccountUpdate} className="space-y-4 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <span className="text-xs text-gray-400">Requires email OTP verification to change</span>
                                </div>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <span className="text-xs text-gray-400">Requires email OTP verification to change</span>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-[#e53935] text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Saving..." : "Save changes"}
                            </button>
                        </form>
                    </div>

                    {/* Security Settings Section */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Settings</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Your account is secured with OTP-based authentication. Password login is disabled.
                        </p>

                        <div className="space-y-6 max-w-2xl">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-green-800">OTP Authentication Active</h3>
                                </div>
                                <p className="text-sm text-green-700">
                                    Your account is protected by OTP-based login via email and phone. This provides enhanced security compared to traditional passwords.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Login Methods</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Email OTP</p>
                                            <p className="text-sm text-gray-500">Login using OTP sent to {user.email}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Phone OTP</p>
                                                <p className="text-sm text-gray-500">Login using OTP sent to {user.phone}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSecurityUpdate}
                                className="px-6 py-2 bg-[#e53935] text-white font-semibold rounded-lg hover:bg-red-600"
                            >
                                Refresh Security Settings
                            </button>
                        </div>
                    </div>

                    {/* Notification Settings Section */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Settings</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Choose how you want to be notified about bookings, payments, and promotions.
                        </p>

                        <form onSubmit={handleNotificationUpdate} className="space-y-4 max-w-2xl">
                            <div className="flex items-start gap-3">
                                <input
                                    id="email-bookings"
                                    type="checkbox"
                                    className="mt-1"
                                    checked={notifications.emailBookings}
                                    onChange={(e) => setNotifications({ ...notifications, emailBookings: e.target.checked })}
                                />
                                <label htmlFor="email-bookings" className="text-sm text-gray-700">
                                    Email me about booking confirmations, changes, and cancellations.
                                </label>
                            </div>
                            <div className="flex items-start gap-3">
                                <input
                                    id="email-payments"
                                    type="checkbox"
                                    className="mt-1"
                                    checked={notifications.emailPayments}
                                    onChange={(e) => setNotifications({ ...notifications, emailPayments: e.target.checked })}
                                />
                                <label htmlFor="email-payments" className="text-sm text-gray-700">
                                    Email me receipts and payment related updates.
                                </label>
                            </div>
                            <div className="flex items-start gap-3">
                                <input
                                    id="email-promos"
                                    type="checkbox"
                                    className="mt-1"
                                    checked={notifications.emailPromos}
                                    onChange={(e) => setNotifications({ ...notifications, emailPromos: e.target.checked })}
                                />
                                <label htmlFor="email-promos" className="text-sm text-gray-700">
                                    Send me offers and promotions from nearby turfs.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-[#e53935] text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Saving..." : "Save preferences"}
                            </button>
                        </form>
                    </div>

                    {/* Account Deletion Section */}
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-8">
                        <h1 className="text-3xl font-bold text-red-600 mb-2">Delete Account & Data</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            Request permanent deletion of your Lockkiyajaye account and associated data.
                        </p>
                        <a
                            href="/delete-account"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg border border-red-200 transition-colors"
                        >
                            Request Account Deletion Page
                        </a>
                    </div>

                    {/* Contact Update OTP Modal */}
                    {otpModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-red-50 rounded-xl text-[#e53935]">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Verify Contact Update</h3>
                                            <p className="text-xs text-gray-500">OTP confirmation required</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setOtpModalOpen(false)}
                                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleVerifyAndSaveContact} className="mt-4 space-y-4">
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        For your account security, a 6-digit verification code was sent to your current registered email:{" "}
                                        <span className="font-semibold text-gray-900">{user.email}</span>.
                                    </p>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Enter 6-Digit Code
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            autoFocus
                                            value={contactOtp}
                                            onChange={(e) => setContactOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="••••••"
                                            className="w-full text-center text-2xl font-bold tracking-[0.4em] py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e53935] focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Didn't receive the code?</span>
                                        <button
                                            type="button"
                                            disabled={otpSending || otpCountdown > 0}
                                            onClick={handleSendContactOtp}
                                            className="font-bold text-[#e53935] hover:underline disabled:opacity-50"
                                        >
                                            {otpCountdown > 0
                                                ? `Resend in ${otpCountdown}s`
                                                : otpSending
                                                ? "Sending..."
                                                : "Resend Code"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setOtpModalOpen(false)}
                                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || contactOtp.length < 6}
                                            className="px-5 py-2 text-sm font-bold text-white bg-[#e53935] hover:bg-red-600 rounded-xl shadow-md shadow-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            )}
                                            Verify & Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
