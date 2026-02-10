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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: overview */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-8">
                            My Profile
                        </h1>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 pb-6 border-b">
                                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-gray-600 capitalize">
                                        {user.role.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-start space-x-3">
                                        <Phone className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{user.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {user.role === "turf_owner" && user.businessName && (
                                    <div className="flex items-start space-x-3">
                                        <Building className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Business Name</p>
                                            <p className="font-medium">{user.businessName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Onboarding Status</p>
                                        <p className="font-medium capitalize">
                                            {user.onboardingStatus.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: profile navigation */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold mb-3">Profile sections</h2>
                            <div className="space-y-2 text-sm">
                                <Link
                                    to="/dashboard/profile/account"
                                    className="block px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    Account details
                                </Link>
                                <Link
                                    to="/dashboard/profile/security"
                                    className="block px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    Security
                                </Link>
                                <Link
                                    to="/dashboard/profile/notifications"
                                    className="block px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    Notifications
                                </Link>
                                <Link
                                    to="/dashboard/payments"
                                    className="block px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    Payments
                                </Link>
                                <Link
                                    to="/dashboard/payments/history"
                                    className="block px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    Payment history
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

