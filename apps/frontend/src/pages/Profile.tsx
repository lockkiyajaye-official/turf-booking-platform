import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Calendar, Building } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                    {/* Left: overview */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-8 md:p-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
                            My Profile
                        </h1>

                        <div className="space-y-8">
                            <div className="flex items-center space-x-5 pb-8 border-b border-gray-100">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#e53935] to-red-700 rounded-full flex items-center justify-center shadow-inner ring-4 ring-red-50">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full capitalize">
                                        {user.role.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-[#e53935]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-0.5">Email</p>
                                        <p className="font-semibold text-gray-900">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <Phone className="w-5 h-5 text-[#e53935]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-0.5">Phone</p>
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
                                            <p className="text-sm font-medium text-gray-500 mb-0.5">Business Name</p>
                                            <p className="font-semibold text-gray-900">{user.businessName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-[#e53935]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-0.5">Onboarding Status</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {user.onboardingStatus.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: profile navigation */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 line-clamp">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Profile Sections</h2>
                            <div className="space-y-1">
                                <Link
                                    to="/dashboard/profile/account"
                                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#e53935] text-gray-700 font-medium transition-colors"
                                >
                                    Account details
                                </Link>
                                <Link
                                    to="/dashboard/profile/security"
                                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#e53935] text-gray-700 font-medium transition-colors"
                                >
                                    Security
                                </Link>
                                <Link
                                    to="/dashboard/profile/notifications"
                                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#e53935] text-gray-700 font-medium transition-colors"
                                >
                                    Notifications
                                </Link>
                                <Link
                                    to="/dashboard/payments"
                                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#e53935] text-gray-700 font-medium transition-colors"
                                >
                                    Payments
                                </Link>
                                <Link
                                    to="/dashboard/payments/history"
                                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#e53935] text-gray-700 font-medium transition-colors"
                                >
                                    Payment history
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

