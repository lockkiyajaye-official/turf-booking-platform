import {
    AlertCircle,
    CreditCard,
    TrendingUp,
    UserCheck,
    Users,
    Wallet,
    MapPin,
    Search,
    Trash2,
    Eye,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user" | "turf_owner";
    isApproved?: boolean;
    businessName?: string;
    createdAt: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    walletBalance?: number;
    turfs?: TurfSummary[];
    bookings?: BookingSummary[];
}

interface Statistics {
    totalUsers: number;
    totalTurfOwners: number;
    totalAdmins: number;
    pendingApprovals: number;
    approvedTurfOwners: number;
}

interface AdminPaymentSummary {
    totalVolume: number;
    totalCount: number;
    successCount: number;
    failedCount: number;
}

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    turf: {
        id: string;
        name: string;
        address: string;
        ownerId: string;
    };
}

type Turf = {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    isActive: boolean;
    isPublished: boolean;
    isDraft: boolean;
    createdAt: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
};

interface TurfSummary {
    id: string;
    name: string;
}

interface BookingSummary {
    id: string;
    status: BookingStatus;
    totalPrice: number;
}

type PayoutStatus = "requested" | "completed" | "rejected";

interface AdminPayoutStats {
    requestedCount: number;
    completedCount: number;
    rejectedCount: number;
    totalRequestedAmount: number;
    totalCompletedAmount: number;
    totalRejectedAmount: number;
}

interface AdminPayout {
    id: string;
    amount: number;
    status: PayoutStatus;
    createdAt: string;
    processedAt?: string;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
}

interface AdminOverviewRevenue {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
}

interface AdminOverviewBookings {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
}

interface AdminOverviewUsers {
    totalUsers: number;
    totalTurfOwners: number;
    totalAdmins: number;
    newUsers7d: number;
    newTurfOwners7d: number;
}

interface AdminOverviewWallet {
    totalLiability: number;
}

interface AdminOverviewAlerts {
    failedPayments24h: number;
    failedPayments7d: number;
    payoutsRequested: number;
    inactiveTurfs: number;
}

interface AdminOverviewTopTurf {
    turfId: string;
    turfName: string;
    ownerName?: string;
    revenue: number;
    bookings: number;
}

interface AdminOverviewActivityBooking {
    id: string;
    userName: string;
    turfName: string;
    amount: number;
    status: BookingStatus;
    createdAt: string;
}

interface AdminOverviewActivityPayout {
    id: string;
    ownerName: string;
    amount: number;
    status: PayoutStatus;
    createdAt: string;
}

interface AdminOverviewActivityTurfOwner {
    id: string;
    name: string;
    businessName?: string;
    createdAt: string;
}

interface AdminOverviewCharts {
    bookingsPerDay: { date: string; count: number; }[];
    revenuePerDay: { date: string; amount: number; }[];
}

interface AdminOverview {
    revenue: AdminOverviewRevenue;
    bookings: AdminOverviewBookings;
    users: AdminOverviewUsers;
    wallet: AdminOverviewWallet;
    alerts: AdminOverviewAlerts;
    topTurfsByRevenue: AdminOverviewTopTurf[];
    recentActivity: {
        bookings: AdminOverviewActivityBooking[];
        payouts: AdminOverviewActivityPayout[];
        turfOwners: AdminOverviewActivityTurfOwner[];
    };
    charts: AdminOverviewCharts;
}

export default function AdminDashboard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [turfOwners, setTurfOwners] = useState<User[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [paymentSummary, setPaymentSummary] = useState<AdminPaymentSummary | null>(null);
    const [payoutStats, setPayoutStats] = useState<AdminPayoutStats | null>(null);
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [payoutStatusFilter, setPayoutStatusFilter] = useState<PayoutStatus | "all">("requested");
    const [payoutStatusUpdate, setPayoutStatusUpdate] = useState<Record<string, PayoutStatus>>({});
    const [payoutNotesUpdate, setPayoutNotesUpdate] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "turf-owners" | "bookings" | "turfs" | "payments">("overview");
    const [approvalNotes, setApprovalNotes] = useState<{ [key: string]: string }>({});
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsStatusFilter, setBookingsStatusFilter] = useState<BookingStatus | "all">("all");
    const [bookingsSearch, setBookingsSearch] = useState("");
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [turfsSearch, setTurfsSearch] = useState("");
    const [usersSearch, setUsersSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
    const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [
                statsRes,
                usersRes,
                ownersRes,
                paymentsSummaryRes,
                payoutsRes,
                bookingsRes,
                turfsRes,
                adminOverviewRes,
            ] = await Promise.all([
                api.get("/users/statistics"),
                api.get("/users"),
                api.get("/users/turf-owners"),
                api.get("/payments/admin/summary"),
                api.get("/payments/admin/payouts", {
                    params: payoutStatusFilter === "all" ? {} : { status: payoutStatusFilter },
                }),
                api.get("/bookings"),
                api.get("/turfs"),
                api.get("/dashboard/admin-overview"),
            ]);
            setStatistics(statsRes.data);
            setUsers(usersRes.data);
            setTurfOwners(ownersRes.data);
            setPaymentSummary(paymentsSummaryRes.data.payments);
            setPayoutStats(paymentsSummaryRes.data.payouts);
            setPayouts(payoutsRes.data);
            setBookings(bookingsRes.data);
            setTurfs(turfsRes.data);
            setAdminOverview(adminOverviewRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
        try {
            setUpdatingBookingId(bookingId);
            await api.patch(`/bookings/${bookingId}/status`, { status });
            const response = await api.get("/bookings");
            setBookings(response.data);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update booking status");
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const handleUpdateUserRole = async (targetUser: User, newRole: User["role"]) => {
        if (targetUser.role === newRole) return;
        if (user && targetUser.id === user.id && newRole !== "admin") {
            alert("You cannot change your own role from admin.");
            return;
        }
        try {
            await api.patch(`/users/${targetUser.id}`, { role: newRole });
            await fetchData();
            alert("User role updated successfully.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update user role");
        }
    };

    const handleDeleteUser = async (targetUser: User) => {
        if (user && targetUser.id === user.id) {
            alert("You cannot delete your own account from the admin panel.");
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${targetUser.firstName} ${targetUser.lastName}?`
        );
        if (!confirmed) return;
        try {
            await api.delete(`/users/${targetUser.id}`);
            await fetchData();
            alert("User deleted successfully.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete user");
        }
    };

    const refetchPayouts = async (status: PayoutStatus | "all") => {
        try {
            const response = await api.get("/payments/admin/payouts", {
                params: status === "all" ? {} : { status },
            });
            setPayouts(response.data);
        } catch (error) {
            console.error("Failed to fetch payouts:", error);
        }
    };

    const handleUpdatePayout = async (payout: AdminPayout) => {
        const newStatus = payoutStatusUpdate[payout.id];
        const notes = payoutNotesUpdate[payout.id] || "";

        if (!newStatus) {
            alert("Please select a status");
            return;
        }

        try {
            await api.patch(`/payments/admin/payouts/${payout.id}`, {
                status: newStatus,
                notes,
            });
            await fetchData();
            await refetchPayouts(payoutStatusFilter);
            alert("Payout updated successfully");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update payout");
        }
    };

    const handleApprove = async (ownerId: string) => {
        try {
            await api.post(`/users/turf-owners/${ownerId}/approve`, {
                approvalNotes: approvalNotes[ownerId] || "Approved for business operations",
            });
            await fetchData();
            await refreshUser();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner approved successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to approve turf owner");
        }
    };

    const handleReject = async (ownerId: string) => {
        if (!approvalNotes[ownerId]) {
            alert("Please provide rejection notes");
            return;
        }
        try {
            await api.post(`/users/turf-owners/${ownerId}/reject`, {
                approvalNotes: approvalNotes[ownerId],
            });
            await fetchData();
            await refreshUser();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner rejected");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to reject turf owner");
        }
    };

    const filteredUsers = useMemo(() => {
        if (!usersSearch.trim()) return users;
        const term = usersSearch.toLowerCase();
        return users.filter((u) => {
            const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
            return (
                fullName.includes(term) ||
                (u.email && u.email.toLowerCase().includes(term)) ||
                (u.phone && u.phone.toLowerCase().includes(term))
            );
        });
    }, [users, usersSearch]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (bookingsStatusFilter !== "all" && b.status !== bookingsStatusFilter) {
                return false;
            }
            if (!bookingsSearch.trim()) return true;
            const term = bookingsSearch.toLowerCase();
            const userName = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
            return (
                userName.includes(term) ||
                (b.user.email && b.user.email.toLowerCase().includes(term)) ||
                b.turf.name.toLowerCase().includes(term) ||
                b.turf.address.toLowerCase().includes(term)
            );
        });
    }, [bookings, bookingsStatusFilter, bookingsSearch]);

    const filteredTurfs = useMemo(() => {
        if (!turfsSearch.trim()) return turfs;
        const term = turfsSearch.toLowerCase();
        return turfs.filter((t) => {
            const ownerName = t.owner
                ? `${t.owner.firstName} ${t.owner.lastName}`.toLowerCase()
                : "";
            return (
                t.name.toLowerCase().includes(term) ||
                t.address.toLowerCase().includes(term) ||
                ownerName.includes(term) ||
                (t.owner?.email && t.owner.email.toLowerCase().includes(term))
            );
        });
    }, [turfs, turfsSearch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex flex-wrap gap-4">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "overview"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "users"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab("turf-owners")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "turf-owners"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Turf Owners
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "bookings"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab("turfs")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "turfs"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Turfs
                        </button>
                        <button
                            onClick={() => setActiveTab("payments")}
                            className={`py-2 px-3 border-b-2 font-medium text-sm ${activeTab === "payments"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Payments
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && statistics && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-blue-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Turf Owners</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.totalTurfOwners}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <UserCheck className="w-8 h-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Approved</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.approvedTurfOwners}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.pendingApprovals}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-purple-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Admins</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.totalAdmins}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {adminOverview && (
                            <>
                                {/* Revenue and wallet KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Revenue today</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{adminOverview.revenue.today.toFixed(2)}
                                                </p>
                                            </div>
                                            <CreditCard className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Last 7 days revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{adminOverview.revenue.last7Days.toFixed(2)}
                                                </p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Last 30 days revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{adminOverview.revenue.last30Days.toFixed(2)}
                                                </p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Wallet liability (INR)
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{adminOverview.wallet.totalLiability.toFixed(2)}
                                                </p>
                                            </div>
                                            <Wallet className="w-8 h-8 text-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bookings KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <p className="text-sm font-medium text-gray-600">Bookings today</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {adminOverview.bookings.today}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Confirmed: {adminOverview.bookings.confirmed} • Pending:{" "}
                                            {adminOverview.bookings.pending}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <p className="text-sm font-medium text-gray-600">Bookings last 7 days</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {adminOverview.bookings.last7Days}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cancelled: {adminOverview.bookings.cancelled}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <p className="text-sm font-medium text-gray-600">Bookings last 30 days</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {adminOverview.bookings.last30Days}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Completed: {adminOverview.bookings.completed}
                                        </p>
                                    </div>
                                </div>

                                {/* Alerts + Top turfs */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Operational alerts</h3>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex justify-between">
                                                <span className="text-gray-700">
                                                    Failed payments (last 24h)
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {adminOverview.alerts.failedPayments24h}
                                                </span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span className="text-gray-700">
                                                    Failed payments (last 7 days)
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {adminOverview.alerts.failedPayments7d}
                                                </span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span className="text-gray-700">
                                                    Payouts awaiting action
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {adminOverview.alerts.payoutsRequested}
                                                </span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span className="text-gray-700">
                                                    Inactive / unpublished turfs
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {adminOverview.alerts.inactiveTurfs}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Top turfs by revenue</h3>
                                        {adminOverview.topTurfsByRevenue.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No paid bookings yet.
                                            </p>
                                        ) : (
                                            <div className="space-y-2 text-sm">
                                                {adminOverview.topTurfsByRevenue.map((turf) => (
                                                    <div
                                                        key={turf.turfId}
                                                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {turf.turfName}
                                                            </p>
                                                            {turf.ownerName && (
                                                                <p className="text-xs text-gray-500">
                                                                    Owner: {turf.ownerName}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">
                                                                ₹{turf.revenue.toFixed(2)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {turf.bookings} bookings
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Simple time-series charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Bookings (last 14 days)</h3>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            {adminOverview.charts.bookingsPerDay.map((point) => (
                                                <div key={point.date} className="flex items-center gap-2">
                                                    <span className="w-20">{point.date}</span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-2 bg-green-500 rounded-full"
                                                            style={{
                                                                width: `${Math.min(
                                                                    point.count * 10,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-8 text-right">
                                                        {point.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Revenue (last 14 days)</h3>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            {adminOverview.charts.revenuePerDay.map((point) => (
                                                <div key={point.date} className="flex items-center gap-2">
                                                    <span className="w-20">{point.date}</span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-2 bg-emerald-500 rounded-full"
                                                            style={{
                                                                width: `${Math.min(
                                                                    point.amount > 0
                                                                        ? (point.amount / (adminOverview.revenue.last7Days || 1)) * 100
                                                                        : 0,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-16 text-right">
                                                        ₹{point.amount.toFixed(0)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent activity */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent activity</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="font-semibold mb-2 text-gray-800">
                                                Latest bookings
                                            </p>
                                            {adminOverview.recentActivity.bookings.length === 0 ? (
                                                <p className="text-gray-500">
                                                    No bookings yet.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {adminOverview.recentActivity.bookings.map((b) => (
                                                        <div key={b.id}>
                                                            <p className="text-gray-900">
                                                                {b.userName} → {b.turfName}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                ₹{b.amount.toFixed(2)} •{" "}
                                                                {new Date(b.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold mb-2 text-gray-800">
                                                Latest payouts
                                            </p>
                                            {adminOverview.recentActivity.payouts.length === 0 ? (
                                                <p className="text-gray-500">
                                                    No payout activity yet.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {adminOverview.recentActivity.payouts.map((payout) => (
                                                        <div key={payout.id}>
                                                            <p className="text-gray-900">
                                                                {payout.ownerName}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                ₹{payout.amount.toFixed(2)} •{" "}
                                                                {payout.status} •{" "}
                                                                {new Date(payout.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold mb-2 text-gray-800">
                                                New turf owners
                                            </p>
                                            {adminOverview.recentActivity.turfOwners.length === 0 ? (
                                                <p className="text-gray-500">
                                                    No turf owner signups yet.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {adminOverview.recentActivity.turfOwners.map((owner) => (
                                                        <div key={owner.id}>
                                                            <p className="text-gray-900">
                                                                {owner.name}
                                                            </p>
                                                            {owner.businessName && (
                                                                <p className="text-gray-500">
                                                                    {owner.businessName}
                                                                </p>
                                                            )}
                                                            <p className="text-gray-500">
                                                                {new Date(owner.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone"
                                    value={usersSearch}
                                    onChange={(e) => setUsersSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-semibold">{filteredUsers.length}</span> users
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <p className="font-medium text-gray-900">
                                                    {u.firstName} {u.lastName}
                                                </p>
                                                {u.businessName && (
                                                    <p className="text-xs text-gray-500">
                                                        {u.businessName}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <p>{u.email || "-"}</p>
                                                <p className="text-xs">{u.phone || "-"}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                                                    {u.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) =>
                                                        handleUpdateUserRole(
                                                            u,
                                                            e.target.value as User["role"]
                                                        )
                                                    }
                                                    className="inline-flex px-2 py-1 rounded-md border border-gray-300 text-xs text-gray-700 bg-white mr-2"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="turf_owner">Turf owner</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u)}
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50 ml-1"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="px-6 py-8 text-center text-sm text-gray-500">
                                    No users match your search.
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
                                    >
                                        ✕
                                    </button>
                                    <h2 className="text-xl font-semibold mb-4">
                                        User details
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">
                                                Name
                                            </p>
                                            <p>
                                                {selectedUser.firstName} {selectedUser.lastName}
                                            </p>
                                        </div>
                                        {selectedUser.email && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Email
                                                </p>
                                                <p>{selectedUser.email}</p>
                                            </div>
                                        )}
                                        {selectedUser.phone && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Phone
                                                </p>
                                                <p>{selectedUser.phone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">
                                                Role
                                            </p>
                                            <p className="capitalize">
                                                {selectedUser.role.replace("_", " ")}
                                            </p>
                                        </div>
                                        {selectedUser.address && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Address
                                                </p>
                                                <p>
                                                    {selectedUser.address}
                                                    {selectedUser.city ? `, ${selectedUser.city}` : ""}
                                                    {selectedUser.state ? `, ${selectedUser.state}` : ""}
                                                    {selectedUser.country ? `, ${selectedUser.country}` : ""}
                                                </p>
                                            </div>
                                        )}
                                        {typeof selectedUser.walletBalance === "number" && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Wallet balance (INR)
                                                </p>
                                                <p>₹{selectedUser.walletBalance.toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Turfs
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {selectedUser.turfs?.length ?? 0}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase">
                                                    Bookings
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {selectedUser.bookings?.length ?? 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Turf Owners Tab */}
                {activeTab === "turf-owners" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search turf owners by name, email, or business"
                                    value={usersSearch}
                                    onChange={(e) => setUsersSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-semibold">{turfOwners.length}</span> turf owners
                            </p>
                        </div>
                        {turfOwners
                            .filter((owner) => {
                                if (!usersSearch.trim()) return true;
                                const term = usersSearch.toLowerCase();
                                const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
                                return (
                                    fullName.includes(term) ||
                                    (owner.email && owner.email.toLowerCase().includes(term)) ||
                                    (owner.businessName && owner.businessName.toLowerCase().includes(term))
                                );
                            })
                            .map((owner) => (
                                <div key={owner.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {owner.firstName} {owner.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{owner.businessName}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {owner.email || owner.phone}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded ${owner.isApproved
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {owner.isApproved ? "Approved" : "Pending Approval"}
                                                </span>
                                                <span>
                                                    Joined: {new Date(owner.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {!owner.isApproved && (
                                            <div className="flex-1 ml-6 space-y-2">
                                                <textarea
                                                    placeholder="Approval/Rejection notes..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                                    value={approvalNotes[owner.id] || ""}
                                                    onChange={(e) =>
                                                        setApprovalNotes({ ...approvalNotes, [owner.id]: e.target.value })
                                                    }
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(owner.id)}
                                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(owner.id)}
                                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search by user, turf, or location"
                                    value={bookingsSearch}
                                    onChange={(e) => setBookingsSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={bookingsStatusFilter}
                                    onChange={(e) =>
                                        setBookingsStatusFilter(e.target.value as BookingStatus | "all")
                                    }
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Booking
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Turf
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((b) => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <p className="font-medium text-gray-900">
                                                    {b.user.firstName} {b.user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {b.user.email || b.user.phone || "-"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <p className="font-medium text-gray-900">
                                                    {b.turf.name}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    <span className="truncate max-w-xs">
                                                        {b.turf.address}
                                                    </span>
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <p>
                                                    {new Date(b.bookingDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs">
                                                    {b.startTime} - {b.endTime}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{Number(b.totalPrice).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={b.status}
                                                        onChange={(e) =>
                                                            handleUpdateBookingStatus(
                                                                b.id,
                                                                e.target.value as BookingStatus
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                                                        disabled={updatingBookingId === b.id}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${b.status === "confirmed"
                                                            ? "bg-green-100 text-green-800"
                                                            : b.status === "completed"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : b.status === "cancelled"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredBookings.length === 0 && (
                                <div className="px-6 py-8 text-center text-sm text-gray-500">
                                    No bookings match your filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Turfs Tab */}
                {activeTab === "turfs" && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search by turf name, owner, or location"
                                    value={turfsSearch}
                                    onChange={(e) => setTurfsSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-semibold">{filteredTurfs.length}</span> turfs
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTurfs.map((turf) => (
                                <div
                                    key={turf.id}
                                    className="bg-white rounded-lg shadow p-5 flex flex-col space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {turf.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Owner:{" "}
                                                {turf.owner
                                                    ? `${turf.owner.firstName} ${turf.owner.lastName}`
                                                    : "Unknown"}
                                            </p>
                                            {turf.owner?.email && (
                                                <p className="text-xs text-gray-400">
                                                    {turf.owner.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-green-600">
                                                ₹{Number(turf.pricePerHour).toFixed(2)}/hr
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Created{" "}
                                                {new Date(turf.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {turf.description}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="truncate">
                                            {turf.address}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex gap-2 text-xs">
                                            <span
                                                className={`px-2 py-1 rounded-full ${turf.isPublished
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {turf.isPublished ? "Published" : "Draft"}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full ${turf.isActive
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {turf.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredTurfs.length === 0 && (
                            <div className="px-6 py-8 bg-white rounded-lg text-center text-sm text-gray-500">
                                No turfs match your search.
                            </div>
                        )}
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                    <div className="space-y-6">
                        {paymentSummary && payoutStats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <CreditCard className="w-8 h-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Total payment volume (INR)
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{paymentSummary.totalVolume.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <Users className="w-8 h-8 text-blue-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Total payments
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {paymentSummary.totalCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Successful payments
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {paymentSummary.successCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Failed payments
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {paymentSummary.failedCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {payoutStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <Wallet className="w-8 h-8 text-yellow-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Requested payouts
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {payoutStats.requestedCount} / ₹
                                                {payoutStats.totalRequestedAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <Wallet className="w-8 h-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Completed payouts
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {payoutStats.completedCount} / ₹
                                                {payoutStats.totalCompletedAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <Wallet className="w-8 h-8 text-red-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Rejected payouts
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {payoutStats.rejectedCount} / ₹
                                                {payoutStats.totalRejectedAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Payout requests</h2>
                                <select
                                    value={payoutStatusFilter}
                                    onChange={async (e) => {
                                        const value = e.target.value as PayoutStatus | "all";
                                        setPayoutStatusFilter(value);
                                        await refetchPayouts(value);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                                >
                                    <option value="requested">Requested</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="all">All</option>
                                </select>
                            </div>

                            {payouts.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No payouts for the selected filter.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {payouts.map((payout) => (
                                        <div
                                            key={payout.id}
                                            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {payout.ownerName || "Unknown owner"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {payout.ownerEmail}
                                                </p>
                                                <p className="mt-1 text-sm">
                                                    Amount:{" "}
                                                    <span className="font-semibold">
                                                        ₹{payout.amount.toFixed(2)}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Requested:{" "}
                                                    {new Date(
                                                        payout.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                                {payout.processedAt && (
                                                    <p className="text-xs text-gray-500">
                                                        Processed:{" "}
                                                        {new Date(
                                                            payout.processedAt
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex-1 md:max-w-xs space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                                        value={
                                                            payoutStatusUpdate[payout.id] ||
                                                            payout.status
                                                        }
                                                        onChange={(e) =>
                                                            setPayoutStatusUpdate({
                                                                ...payoutStatusUpdate,
                                                                [payout.id]:
                                                                    e.target.value as PayoutStatus,
                                                            })
                                                        }
                                                    >
                                                        <option value="requested">
                                                            Requested
                                                        </option>
                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                        <option value="rejected">
                                                            Rejected
                                                        </option>
                                                    </select>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdatePayout(payout)
                                                        }
                                                        className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                                                    placeholder="Internal notes (optional)"
                                                    value={payoutNotesUpdate[payout.id] || ""}
                                                    onChange={(e) =>
                                                        setPayoutNotesUpdate({
                                                            ...payoutNotesUpdate,
                                                            [payout.id]: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>

                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs capitalize bg-gray-100 text-gray-700">
                                                {payout.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
