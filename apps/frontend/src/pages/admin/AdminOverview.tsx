import {
    AlertCircle,
    CreditCard,
    TrendingUp,
    UserCheck,
    Users,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import type { AdminOverviewData, Statistics } from "./types";

export default function AdminOverview() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [overview, setOverview] = useState<AdminOverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, overviewRes] = await Promise.all([
                api.get("/users/statistics"),
                api.get("/dashboard/admin-overview"),
            ]);
            setStatistics(statsRes.data);
            setOverview(overviewRes.data);
        } catch (error) {
            console.error("Failed to fetch overview data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading overview...
                </span>
            </div>
        );
    }

    if (!statistics || !overview) return null;

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Admin Overview
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    Platform statistics and KPIs
                </p>
            </div>

            {/* Top Level User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-bold text-gray-500">
                                Total Users
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                {statistics.totalUsers}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-[#E33E33]" />
                        <div className="ml-4">
                            <p className="text-sm font-bold text-gray-500">
                                Turf Owners
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                {statistics.totalTurfOwners}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <UserCheck className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-bold text-gray-500">
                                Approved Owners
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                {statistics.approvedTurfOwners}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                        <div className="ml-4">
                            <p className="text-sm font-bold text-gray-500">
                                Pending Approvals
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                {statistics.pendingApprovals}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-bold text-gray-500">
                                Admins
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                {statistics.totalAdmins}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue and Wallet KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500">
                                Revenue Today
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                ₹{overview.revenue.today.toFixed(2)}
                            </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500">
                                Last 7 Days Revenue
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                ₹{overview.revenue.last7Days.toFixed(2)}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500">
                                Last 30 Days Revenue
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                ₹{overview.revenue.last30Days.toFixed(2)}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500">
                                Wallet Liability (INR)
                            </p>
                            <p className="text-2xl font-black text-gray-900">
                                ₹{overview.wallet.totalLiability.toFixed(2)}
                            </p>
                        </div>
                        <Wallet className="w-8 h-8 text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Bookings KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-500 mb-1">
                        Bookings Today
                    </p>
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        {overview.bookings.today}
                    </p>
                    <div className="flex gap-4 text-sm font-medium">
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            Confirmed: {overview.bookings.confirmed}
                        </span>
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            Pending: {overview.bookings.pending}
                        </span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-500 mb-1">
                        Bookings (7 Days)
                    </p>
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        {overview.bookings.last7Days}
                    </p>
                    <div className="text-sm font-medium">
                        <span className="text-[#E33E33] bg-red-50 px-2 py-1 rounded-md">
                            Cancelled: {overview.bookings.cancelled}
                        </span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-500 mb-1">
                        Bookings (30 Days)
                    </p>
                    <p className="text-3xl font-black text-gray-900 mb-2">
                        {overview.bookings.last30Days}
                    </p>
                    <div className="text-sm font-medium">
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            Completed: {overview.bookings.completed}
                        </span>
                    </div>
                </div>
            </div>

            {/* Operational Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#E33E33]" />
                    Operational Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                        <span className="font-semibold text-red-900">
                            Failed payments (24h)
                        </span>
                        <span className="text-xl font-black text-[#E33E33]">
                            {overview.alerts.failedPayments24h}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                        <span className="font-semibold text-orange-900">
                            Failed payments (7d)
                        </span>
                        <span className="text-xl font-black text-orange-600">
                            {overview.alerts.failedPayments7d}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                        <span className="font-semibold text-blue-900">
                            Payouts awaiting action
                        </span>
                        <span className="text-xl font-black text-blue-600">
                            {overview.alerts.payoutsRequested}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">
                            Inactive / unpublished turfs
                        </span>
                        <span className="text-xl font-black text-gray-900">
                            {overview.alerts.inactiveTurfs}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
