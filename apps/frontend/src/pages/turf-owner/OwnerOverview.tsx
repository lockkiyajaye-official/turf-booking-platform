import {
    ArrowRight,
    BookmarkPlus,
    Calendar,
    Clock,
    Eye,
    EyeOff,
    MapPin,
    Plus,
    RefreshCw,
    TrendingUp,
    User,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DirectBookingModal from "../../components/turf-owner/DirectBookingModal";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { DashboardStats } from "./types";

function format12Hour(time24: string): string {
    if (!time24) return "";
    const trimmed = time24.trim();
    if (trimmed.includes("AM") || trimmed.includes("PM")) return trimmed;
    const [hStr, mStr] = trimmed.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr ? parseInt(mStr, 10) : 0;
    if (isNaN(h)) return trimmed;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function formatSlot12H(start: string, end?: string): string {
    if (!end) {
        if (start.includes("-")) {
            const parts = start.split("-");
            return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
        }
        return format12Hour(start);
    }
    return `${format12Hour(start)} - ${format12Hour(end)}`;
}

export default function OwnerOverview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState<DashboardStats | null>(null);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDirectModal, setShowDirectModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [statsRes, walletRes] = await Promise.all([
                api.get("/dashboard/statistics"),
                api.get("/payments/owner/summary"),
            ]);
            setStatistics(statsRes.data);
            setWalletBalance(walletRes.data.walletBalance);
        } catch (error) {
            console.error("Failed to fetch owner statistics:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "completed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading || !statistics) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                    <div className="flex items-center justify-center p-12 min-h-[50vh]">
                        <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                            Loading overview...
                        </span>
                    </div>
                </main>
            </div>
        );
    }

    const { overview, bookingsByTurf, recentBookings = [] } = statistics;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Welcome back, {user?.firstName || "Owner"}
                        </h1>
                        <p className="text-gray-600 mt-1 font-medium tracking-wide">
                            Performance summary and quick actions for your turf facilities
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowDirectModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E33E33] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all"
                        >
                            <BookmarkPlus className="w-4 h-4" />
                            <span>Mark Direct Booking</span>
                        </button>
                    </div>
                </div>

                {!user?.isApproved && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex items-start gap-4 shadow-xs">
                        <span className="text-2xl">⏳</span>
                        <div>
                            <h3 className="font-bold text-base">Account Pending Approval</h3>
                            <p className="text-sm mt-1 text-amber-800">
                                Your account is pending admin verification. You can
                                create turfs, but they will remain as drafts until
                                approved and players cannot book them yet.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Actions (matching Mobile Dashboard) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button
                            onClick={() => setShowDirectModal(true)}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200/80 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                <BookmarkPlus className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 group-hover:text-[#E33E33]">
                                Direct Booking
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 text-center">
                                Lock offline slot
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/owner/turfs/new")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200/80 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 group-hover:text-[#E33E33]">
                                Add New Turf
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 text-center">
                                Create new venue
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/owner/turfs")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200/80 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 group-hover:text-[#E33E33]">
                                My Turfs
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 text-center">
                                Manage listings
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/owner/bookings")}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200/80 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 group-hover:text-[#E33E33]">
                                Bookings
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5 text-center">
                                View all schedule
                            </span>
                        </button>
                    </div>
                </div>

                {overview.totalTurfs === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl border-dashed">
                        <span className="text-6xl mb-4 block">🏟️</span>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No turfs listed yet</h3>
                        <p className="text-gray-500 mb-6">Create your first turf listing to start viewing your business overview and receiving bookings.</p>
                        <Link
                            to="/owner/turfs/new"
                            className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors inline-block"
                        >
                            Add New Turf
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Total Revenue
                                        </p>
                                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                                            ₹{overview.totalRevenue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {walletBalance !== null && (
                                <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Available Wallet
                                            </p>
                                            <p className="text-2xl font-black text-gray-900 mt-0.5">
                                                ₹{walletBalance.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center shrink-0">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Total Bookings
                                        </p>
                                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                                            {overview.totalBookings}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex items-center justify-around hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <Eye className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Published
                                    </p>
                                    <p className="text-xl font-black text-gray-900 mt-0.5">
                                        {overview.publishedTurfs}
                                    </p>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="text-center">
                                    <EyeOff className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Drafts
                                    </p>
                                    <p className="text-xl font-black text-gray-900 mt-0.5">
                                        {overview.draftTurfs}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings & Performance Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Bookings (matching Mobile) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Recent Bookings
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Latest reservation activity across your venues
                                        </p>
                                    </div>
                                    <Link
                                        to="/owner/bookings"
                                        className="text-xs font-bold text-[#E33E33] hover:underline flex items-center gap-1"
                                    >
                                        <span>See all</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {recentBookings.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-gray-600">No bookings yet</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            New customer and direct bookings will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentBookings.slice(0, 6).map((b) => (
                                            <div
                                                key={b.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/60 rounded-xl hover:bg-red-50/30 transition-colors border border-gray-100/60"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-700 shrink-0">
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {b.userName || "Customer"}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                                                                    b.status,
                                                                )}`}
                                                            >
                                                                {b.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                            <span>{b.turfName}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 text-right pl-13 sm:pl-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            {formatSlot12H(b.startTime, b.endTime)}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400">
                                                            {new Date(b.bookingDate).toLocaleDateString(undefined, {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="font-extrabold text-[#E33E33] text-sm">
                                                        ₹{b.totalPrice}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Performance by Turf */}
                            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex flex-col">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Performance by Turf
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Breakdown of revenue and booking volume
                                    </p>
                                </div>

                                {bookingsByTurf.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-sm flex-1 flex flex-col items-center justify-center">
                                        No booking data available yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                                        {bookingsByTurf.map((item) => (
                                            <div
                                                key={item.turfId}
                                                className="p-4 bg-gray-50/60 rounded-xl border border-gray-100/60 hover:bg-gray-100/70 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-sm text-gray-900 line-clamp-1">
                                                        {item.turfName}
                                                    </span>
                                                    <span className="font-black text-sm text-[#E33E33] shrink-0 ml-2">
                                                        ₹{item.revenue.toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>{item.totalBookings} booking{item.totalBookings !== 1 ? "s" : ""}</span>
                                                    <Link
                                                        to={`/owner/turfs/${item.turfId}`}
                                                        className="text-xs font-semibold text-gray-500 hover:text-[#E33E33]"
                                                    >
                                                        View Turf &rarr;
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link
                                to="/owner/turfs"
                                className="px-6 py-3 bg-[#E33E33] hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                            >
                                Manage My Turfs
                            </Link>
                            <Link
                                to="/owner/finances"
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-colors shadow-xs"
                            >
                                Request Payout
                            </Link>
                        </div>
                    </>
                )}
            </main>

            {/* Direct Booking Modal */}
            <DirectBookingModal
                isOpen={showDirectModal}
                onClose={() => setShowDirectModal(false)}
                onSuccess={() => fetchData()}
            />
        </div>
    );
}
