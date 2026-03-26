import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, CreditCard, MapPin, Receipt } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { UserPayment } from "./types";

export default function PaymentHistory() {
    const { user } = useAuth();
    const [payments, setPayments] = useState<UserPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "success" | "failed">("all");

    useEffect(() => {
        if (!user) return;
        const fetchPayments = async () => {
            try {
                const { data } = await api.get("/payments/history");
                setPayments(data);
            } catch (error) {
                console.error("Failed to fetch payment history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "success":
                return "bg-green-100 text-green-700";
            case "failed":
                return "bg-red-100 text-red-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const successfulPayments = payments.filter(p => p.status.toLowerCase() === "success");
    const failedPayments = payments.filter(p => p.status.toLowerCase() === "failed");

    const getDisplayedPayments = () => {
        if (activeTab === "success") return successfulPayments;
        if (activeTab === "failed") return failedPayments;
        return payments;
    };

    const displayedPayments = getDisplayedPayments();

    const calculateDaysAgo = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        if (days < 0) return "Upcoming";
        return `${days} days ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-xl font-medium text-gray-500">
                    Loading payment history...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        Payment History
                    </h1>
                    <p className="text-gray-600 font-medium tracking-wide">
                        View and manage your payment transactions
                    </p>
                </div>

                <div className="flex gap-4 mb-8">
                    {(["all", "success", "failed"] as const).map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === tab
                                        ? "bg-[#e53935] text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === "all" && ` (${payments.length})`}
                                {tab === "success" && ` (${successfulPayments.length})`}
                                {tab === "failed" && ` (${failedPayments.length})`}
                            </button>
                        ),
                    )}
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left Column: Payment Cards */}
                    <div className="flex-1 space-y-6">
                        {displayedPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md"
                            >
                                <div className="w-full md:w-80 h-48 md:h-auto shrink-0 bg-gradient-to-br from-[#e53935] to-red-700 flex items-center justify-center">
                                    <Receipt className="w-16 h-16 text-white opacity-50" />
                                </div>
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {payment.turfName || "Turf Booking"}
                                            </h3>
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                                    payment.status,
                                                )}`}
                                            >
                                                {payment.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-gray-600">
                                            <div className="flex items-center text-sm font-medium">
                                                <Calendar className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span>
                                                    {payment.bookingDate && new Date(payment.bookingDate).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                    {payment.startTime && payment.endTime && (
                                                        <span className="mx-2 text-gray-300">|</span>
                                                    )}
                                                    {payment.startTime && payment.endTime && (
                                                        <span>
                                                            {payment.startTime} - {payment.endTime}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm font-medium md:justify-end">
                                                <Clock className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span>
                                                    Paid{" "}
                                                    <span className="font-bold text-gray-900 ml-1">
                                                        {calculateDaysAgo(payment.createdAt)}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm font-medium">
                                                <CreditCard className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span className="text-xs">
                                                    ID: {payment.bookingId}
                                                </span>
                                            </div>
                                            {payment.razorpayPaymentId && (
                                                <div className="flex items-center text-sm font-medium md:justify-end">
                                                    <span className="text-xs text-gray-400">
                                                        Razorpay: {payment.razorpayPaymentId.slice(0, 12)}...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                                        <div className="text-2xl font-extrabold text-gray-900">
                                            ₹{payment.amount.toLocaleString("en-IN")}
                                        </div>
                                        <Link
                                            to={`/dashboard/bookings`}
                                            className="bg-[#e53935] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            View Booking
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {displayedPayments.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <span className="text-6xl mb-6 block opacity-20">
                                    💳
                                </span>
                                <p className="text-gray-500 text-xl font-medium mb-6">
                                    No {activeTab === "all" ? "" : activeTab} payments yet.
                                </p>
                                <Link
                                    to="/turfs"
                                    className="bg-[#e53935] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors inline-block shadow-sm"
                                >
                                    Book a Turf
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary Panels */}
                    <div className="w-full xl:w-[400px] shrink-0 space-y-8">
                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    Payment Summary
                                </h2>
                                <Receipt className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Total Payments</span>
                                    <span className="text-lg font-bold text-gray-900">{payments.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Successful</span>
                                    <span className="text-lg font-bold text-green-600">{successfulPayments.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Failed</span>
                                    <span className="text-lg font-bold text-red-600">{failedPayments.length}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Total Spent</span>
                                        <span className="text-xl font-extrabold text-[#e53935]">
                                            ₹{successfulPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
                                Quick Actions
                            </h2>
                            <div className="space-y-4">
                                <Link
                                    to="/dashboard/bookings"
                                    className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#e53935] transition-colors">
                                                View Bookings
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Manage your turf bookings
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                <Link
                                    to="/turfs"
                                    className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <MapPin className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#e53935] transition-colors">
                                                Browse Turfs
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Discover new venues
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
