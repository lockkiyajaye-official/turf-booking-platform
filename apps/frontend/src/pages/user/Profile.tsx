import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { User, Mail, Phone, Calendar, Building, Shield, Save, Check, X } from "lucide-react";

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
    const [phone, setPhone] = useState(user?.phone ?? "");

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

    const handleAccountUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch("/auth/profile", {
                firstName,
                lastName,
                phone,
            });
            await refreshUser();
            showMessage("success", "Profile updated successfully!");
        } catch (error) {
            showMessage("error", "Failed to update profile");
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
                            <div className="w-20 h-20 bg-gradient-to-br from-[#e53935] to-red-700 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login)</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                    value={user.email}
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
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
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
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
                </div>
            </main>
        </div>
    );
}
