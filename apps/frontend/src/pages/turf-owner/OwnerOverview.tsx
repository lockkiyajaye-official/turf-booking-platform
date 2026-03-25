import { Calendar, Eye, EyeOff, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { DashboardStats } from "./types";

export default function OwnerOverview() {
    const { user } = useAuth();
    const [statistics, setStatistics] = useState<DashboardStats | null>(null);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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
        }
    };

    if (loading || !statistics) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading overview...
                </span>
            </div>
        );
    }

    const { overview, bookingsByTurf } = statistics;

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Business Overview
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Performance summary for your turf facilities
                </p>
            </div>

            {!user?.isApproved && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start gap-4 shadow-sm">
                    <span className="text-2xl">⏳</span>
                    <div>
                        <h3 className="font-bold">Account Pending Approval</h3>
                        <p className="text-sm mt-1">
                            Your account is pending admin approval. You can
                            create turfs, but they will remain as drafts until
                            approved and users cannot book them.
                        </p>
                    </div>
                </div>
            )}

            {overview.totalTurfs === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl border-dashed">
                    <span className="text-6xl mb-4 block">🏟️</span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No turfs listed yet</h3>
                    <p className="text-gray-500 mb-6">Create your first turf listing to start viewing your business overview and receiving bookings.</p>
                    <Link
                        to="/owner/turfs"
                        className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors inline-block"
                    >
                        Add New Turf
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-bold text-gray-500">
                                        Total Revenue (INR)
                                    </p>
                                    <p className="text-2xl font-black text-gray-900">
                                        ₹{overview.totalRevenue.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {walletBalance !== null && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center">
                                    <Wallet className="w-8 h-8 text-emerald-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-bold text-gray-500">
                                            Available Wallet Balance
                                        </p>
                                        <p className="text-2xl font-black text-gray-900">
                                            ₹{walletBalance.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <Calendar className="w-8 h-8 text-[#E33E33]" />
                                <div className="ml-4">
                                    <p className="text-sm font-bold text-gray-500">
                                        Total Bookings
                                    </p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {overview.totalBookings}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-around hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <Eye className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-500">
                                    Published
                                </p>
                                <p className="text-xl font-black text-gray-900">
                                    {overview.publishedTurfs}
                                </p>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="text-center">
                                <EyeOff className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-500">
                                    Drafts
                                </p>
                                <p className="text-xl font-black text-gray-900">
                                    {overview.draftTurfs}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-6">
                            Performance by Turf
                        </h3>
                        {bookingsByTurf.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No booking data available yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookingsByTurf.map((item) => (
                                    <div
                                        key={item.turfId}
                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-red-50/30 transition-colors"
                                    >
                                        <span className="font-bold text-gray-800">
                                            {item.turfName}
                                        </span>
                                        <div className="text-right flex items-center gap-8">
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    Bookings
                                                </p>
                                                <p className="font-black text-gray-900">
                                                    {item.totalBookings}
                                                </p>
                                            </div>
                                            <div className="text-left min-w-[100px]">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    Revenue
                                                </p>
                                                <p className="font-black text-[#E33E33]">
                                                    ₹{item.revenue.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Link
                            to="/owner/turfs"
                            className="px-6 py-3 bg-[#E33E33] hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                        >
                            Manage My Turfs
                        </Link>
                        <Link
                            to="/owner/finances"
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-colors shadow-sm"
                        >
                            Request Payout
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
