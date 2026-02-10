import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar, MapPin, User, Search, CreditCard } from "lucide-react";

export default function UserHome() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role === "turf_owner") {
            navigate("/dashboard/turfs");
            return;
        }

        if (user.role === "admin") {
            navigate("/admin/dashboard");
        }
    }, [user, loading, navigate]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600">
                        Quickly jump to your bookings, discover new turfs, or update your
                        profile.
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Link
                        to="/turfs"
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Search className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Find Turfs</h2>
                            <p className="text-sm text-gray-600">
                                Explore available turfs and book your next game.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/bookings"
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-1">My Bookings</h2>
                            <p className="text-sm text-gray-600">
                                View and manage your upcoming and past bookings.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/profile"
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Profile</h2>
                            <p className="text-sm text-gray-600">
                                Update your personal details and preferences.
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/payments"
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Payments</h2>
                            <p className="text-sm text-gray-600">
                                Manage future INR payments and view payment history.
                            </p>
                        </div>
                    </Link>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Recently added turfs
                    </h2>
                    <p className="text-sm text-gray-600">
                        Head over to the{" "}
                        <Link
                            to="/turfs"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            turfs listing
                        </Link>{" "}
                        to discover new places to play.
                    </p>
                </section>
            </div>
        </div>
    );
}

