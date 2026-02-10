import { Calendar, Eye, EyeOff, MapPin, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Turf {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    isActive: boolean;
    isPublished: boolean;
    isDraft: boolean;
}

interface DashboardStats {
    overview: {
        totalTurfs: number;
        publishedTurfs: number;
        draftTurfs: number;
        totalBookings: number;
        confirmedBookings: number;
        pendingBookings: number;
        cancelledBookings: number;
        completedBookings: number;
        totalRevenue: number;
        recentRevenue: number;
    };
    bookingsByTurf: Array<{
        turfId: string;
        turfName: string;
        totalBookings: number;
        revenue: number;
    }>;
    recentBookings: Array<any>;
}

interface OwnerPayout {
    id: string;
    amount: number;
    status: "requested" | "completed" | "rejected";
    createdAt: string;
    processedAt?: string;
}

interface WalletSummary {
    walletBalance: number;
    totalEarnings: number;
    totalPayouts: number;
    payouts: OwnerPayout[];
}

export default function TurfOwnerDashboard() {
    const { user } = useAuth();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [statistics, setStatistics] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"statistics" | "turfs">("statistics");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        pricePerHour: "",
        amenities: "",
        availableSlots: "",
    });
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [payoutAmount, setPayoutAmount] = useState("");

    useEffect(() => {
        fetchTurfs();
        fetchStatistics();
        fetchWallet();
    }, []);

    const fetchTurfs = async () => {
        try {
            const response = await api.get("/turfs/my-turfs");
            setTurfs(response.data);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await api.get("/dashboard/statistics");
            setStatistics(response.data);
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        }
    };

    const fetchWallet = async () => {
        try {
            const response = await api.get("/payments/owner/summary");
            setWallet(response.data);
        } catch (error) {
            console.error("Failed to fetch wallet summary:", error);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/publish`);
            await fetchTurfs();
            alert("Turf published successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish turf");
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/unpublish`);
            await fetchTurfs();
            alert("Turf unpublished successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to unpublish turf");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const turfData = {
                ...formData,
                pricePerHour: parseFloat(formData.pricePerHour),
                amenities: formData.amenities
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                availableSlots: formData.availableSlots
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            };
            await api.post("/turfs", turfData);
            setShowForm(false);
            setFormData({
                name: "",
                description: "",
                address: "",
                pricePerHour: "",
                amenities: "",
                availableSlots: "",
            });
            fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create turf");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this turf?")) return;
        try {
            await api.delete(`/turfs/${id}`);
            fetchTurfs();
        } catch (error) {
            alert("Failed to delete turf");
        }
    };

    const handlePayoutRequest = async () => {
        if (!payoutAmount) return;
        const amountNumber = Number(payoutAmount);
        if (!amountNumber || amountNumber <= 0) {
            alert("Please enter a valid payout amount");
            return;
        }
        try {
            const response = await api.post("/payments/owner/payouts", {
                amount: amountNumber,
            });
            setWallet(response.data);
            setPayoutAmount("");
            alert("Payout requested successfully. Our team will process it soon.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to request payout");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const isApproved = user?.isApproved;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Turf Owner Dashboard
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Turf
                    </button>
                </div>

                {!isApproved && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                        <p className="font-semibold">Account Pending Approval</p>
                        <p className="text-sm">
                            Your account is pending admin approval. You can create turfs, but they will remain as drafts until you are approved.
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("statistics")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "statistics"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab("turfs")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "turfs"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            My Turfs
                        </button>
                    </nav>
                </div>

                {/* Statistics Tab */}
                {activeTab === "statistics" && statistics && (
                    <div className="space-y-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="w-8 h-8 text-blue-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Revenue (INR)</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{statistics.overview.totalRevenue.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {wallet && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <Wallet className="w-8 h-8 text-emerald-500" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Wallet balance (INR)
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{wallet.walletBalance.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        This wallet balance increases automatically when users complete
                                        online payments via Razorpay for your turfs.
                                    </p>
                                </div>
                            )}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Calendar className="w-8 h-8 text-green-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {statistics.overview.totalBookings}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Eye className="w-8 h-8 text-purple-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Published Turfs</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {statistics.overview.publishedTurfs}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <EyeOff className="w-8 h-8 text-gray-500" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Draft Turfs</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {statistics.overview.draftTurfs}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Bookings by Turf</h3>
                            <div className="space-y-2">
                                {statistics.bookingsByTurf.map((item) => (
                                    <div key={item.turfId} className="flex justify-between items-center py-2 border-b">
                                        <span>{item.turfName}</span>
                                        <div className="text-right">
                                            <p className="font-semibold">{item.totalBookings} bookings</p>
                                            <p className="text-sm text-gray-600">
                                                ₹{item.revenue.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {wallet && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Payouts</h3>
                                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                            Request payout amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={payoutAmount}
                                            onChange={(e) => setPayoutAmount(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Available: ₹{wallet.walletBalance.toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handlePayoutRequest}
                                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                                    >
                                        Request payout
                                    </button>
                                </div>

                                {wallet.payouts.length > 0 ? (
                                    <div className="mt-4 space-y-2 text-sm">
                                        {wallet.payouts.map((payout) => (
                                            <div
                                                key={payout.id}
                                                className="flex justify-between items-center py-2 border-b"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        ₹{payout.amount.toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {new Date(payout.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                                                    {payout.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No payout requests yet.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Turfs Tab */}
                {activeTab === "turfs" && (
                    <>

                        {showForm && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-2xl font-semibold mb-4">
                                    Add New Turf
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Turf Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Address *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Price per Hour (₹) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                                value={formData.pricePerHour}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        pricePerHour: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Amenities (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Parking, Changing Room, Water"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                            value={formData.amenities}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    amenities: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Available Slots (comma-separated, e.g.,
                                            06:00-07:00, 07:00-08:00)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="06:00-07:00, 07:00-08:00, 08:00-09:00"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                            value={formData.availableSlots}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    availableSlots: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Create Turf
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {turfs.map((turf) => (
                                <div
                                    key={turf.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                >
                                    <div className="h-48 bg-green-100 flex items-center justify-center">
                                        <span className="text-6xl">⚽</span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {turf.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {turf.description}
                                        </p>
                                        <div className="flex items-center text-gray-500 text-sm mb-2">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="truncate">
                                                {turf.address}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-green-600 font-semibold mb-4">
                                            <span className="mr-1">₹</span>
                                            <span>{turf.pricePerHour}/hr</span>
                                        </div>
                                        <div className="mb-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${turf.isPublished
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {turf.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {turf.isPublished ? (
                                                <button
                                                    onClick={() => handleUnpublish(turf.id)}
                                                    className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 flex items-center justify-center gap-2"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                    Unpublish
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePublish(turf.id)}
                                                    disabled={!isApproved}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    {isApproved ? "Publish" : "Pending Approval"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(turf.id)}
                                                className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {turfs.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500 text-lg mb-4">
                                    No turfs yet. Create your first turf!
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                                >
                                    Add Turf
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
