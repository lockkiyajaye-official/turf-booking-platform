import { Calendar, Clock, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Booking, Turf } from "./types";

export default function UserBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [discoverTurfs, setDiscoverTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        "upcoming" | "completed" | "cancelled"
    >("upcoming");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, turfsRes] = await Promise.all([
                api.get("/bookings"),
                api.get("/turfs?limit=5"),
            ]);

            const bookingsData = bookingsRes.data;
            const items = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.items || []);
            setBookings(items);

            // Extract some turfs for Discover section
            const turfsData = Array.isArray(turfsRes.data)
                ? turfsRes.data
                : turfsRes.data.data;
            if (Array.isArray(turfsData)) {
                setDiscoverTurfs(turfsData.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            // Fallback if turfs api fails
            try {
                const response = await api.get("/bookings");
                const data = response.data;
                setBookings(Array.isArray(data) ? data : (data?.items || []));
            } catch (e) {
                console.error("Failed to fetch bookings fallback", e);
            }
        } finally {
            setLoading(false);
        }
    };

    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
    const [cancellationPreview, setCancellationPreview] = useState<any>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [cancelReason, setCancelReason] = useState("Schedule clash / Change of plans");
    const [customReason, setCustomReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const openCancelModal = async (booking: Booking) => {
        setCancellingBooking(booking);
        setLoadingPreview(true);
        setCancellationPreview(null);
        setCancelReason("Schedule clash / Change of plans");
        setCustomReason("");
        try {
            const { data } = await api.get(`/bookings/${booking.id}/cancellation-preview`);
            setCancellationPreview(data);
        } catch (error) {
            console.error("Failed to fetch cancellation preview", error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancellingBooking) return;
        setCancelling(true);
        try {
            const reason = cancelReason === "Other" ? (customReason.trim() || "User requested cancellation") : cancelReason;
            await api.post(`/bookings/${cancellingBooking.id}/cancel`, { reason });
            setCancellingBooking(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to cancel booking");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-xl font-medium text-gray-500">
                    Loading bookings...
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const upcomingBookings = bookings.filter((b) =>
        ["pending", "confirmed"].includes(b.status.toLowerCase()),
    );
    const completedBookings = bookings.filter(
        (b) => b.status.toLowerCase() === "completed",
    );
    const cancelledBookings = bookings.filter(
        (b) => b.status.toLowerCase() === "cancelled",
    );

    const getDisplayedBookings = () => {
        if (activeTab === "upcoming") return upcomingBookings;
        if (activeTab === "completed") return completedBookings;
        return cancelledBookings;
    };

    const displayedBookings = getDisplayedBookings();

    const recentActivity = [...completedBookings, ...cancelledBookings]
        .sort(
            (a, b) =>
                new Date(b.bookingDate).getTime() -
                new Date(a.bookingDate).getTime(),
        )
        .slice(0, 3);

    const calculateTimeRemaining = (dateStr: string, startTime: string) => {
        try {
            const [hours, minutes] = startTime.split(":");
            const bookDate = new Date(dateStr);
            bookDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const now = new Date();
            const diff = bookDate.getTime() - now.getTime();
            if (diff <= 0) return "Started";

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${h}h ${m}m`;
        } catch {
            return "Soon";
        }
    };

    const calculateDaysAgo = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        if (days < 0) return "Upcoming";
        return `${days} days ago`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        My Bookings
                    </h1>
                    <p className="text-gray-600 font-medium tracking-wide">
                        View and Manage your booking history
                    </p>
                </div>

                <div className="flex gap-4 mb-8">
                    {(["upcoming", "completed", "cancelled"] as const).map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                                    activeTab === tab
                                        ? "bg-[#e53935] text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ),
                    )}
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left Column: Booking Cards */}
                    <div className="flex-1 space-y-6">
                        {displayedBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md"
                            >
                                <div className="w-full md:w-80 h-48 md:h-auto shrink-0 bg-gray-100">
                                    <img
                                        src={
                                            booking.turf.images?.[0] ||
                                            "https://images.unsplash.com/photo-1545809074-59472b3f5ecc?w=800&q=80"
                                        }
                                        alt={booking.turf.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {booking.turf.name}
                                            </h3>
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                                    booking.status,
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-gray-600">
                                            <div className="flex items-center text-sm font-medium">
                                                <Calendar className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span>
                                                    {new Date(
                                                        booking.bookingDate,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                    <span className="mx-2 text-gray-300">
                                                        |
                                                    </span>
                                                    {booking.startTime} -{" "}
                                                    {booking.endTime}
                                                </span>
                                            </div>
                                            {activeTab === "upcoming" && (
                                                <div className="flex items-center text-sm font-medium md:justify-end">
                                                    <Clock className="w-4 h-4 mr-2.5 text-gray-400" />
                                                    <span>
                                                        Starts in{" "}
                                                        <span className="font-bold text-gray-900 ml-1">
                                                            {calculateTimeRemaining(
                                                                booking.bookingDate,
                                                                booking.startTime,
                                                            )}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm font-medium">
                                                <MapPin className="w-4 h-4 mr-2.5 text-gray-400" />
                                                <span className="truncate max-w-[250px]">
                                                    {booking.turf.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === "cancelled" && (booking.refundAmount !== undefined || booking.cancellationReason) && (
                                        <div className="mt-4 p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs space-y-1">
                                            {booking.cancellationReason && (
                                                <p className="text-gray-700">
                                                    <span className="font-bold text-gray-900">Reason:</span> {booking.cancellationReason}
                                                </p>
                                            )}
                                            {Number(booking.refundAmount || 0) > 0 ? (
                                                <p className="text-green-700 font-bold">
                                                    ₹{booking.refundAmount} Refund Processed via Razorpay ({booking.refundStatus || "full"})
                                                </p>
                                            ) : (
                                                <p className="text-gray-500 font-medium">Non-refundable cancellation</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-gray-50">
                                        {activeTab === "upcoming" && (
                                            <button
                                                onClick={() => openCancelModal(booking)}
                                                className="text-[#e53935] hover:bg-red-50 font-bold px-5 py-2.5 rounded-xl border border-red-200 transition-colors text-sm"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                        <Link
                                            to={`/turfs/${booking.turf.id}`}
                                            className="bg-[#e53935] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {displayedBookings.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <span className="text-6xl mb-6 block opacity-20">
                                    📅
                                </span>
                                <p className="text-gray-500 text-xl font-medium mb-6">
                                    No {activeTab} bookings yet.
                                </p>
                                <Link
                                    to="/turfs"
                                    className="bg-[#e53935] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors inline-block shadow-sm"
                                >
                                    Browse turfs
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Panels */}
                    <div className="w-full xl:w-[400px] shrink-0 space-y-8">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    Recent Activity
                                </h2>
                                <button className="text-[#e53935] text-sm font-bold hover:underline">
                                    View All
                                </button>
                            </div>
                            <div className="space-y-6">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex justify-between items-center group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={
                                                    activity.turf.images?.[0] ||
                                                    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=200&q=80"
                                                }
                                                alt={activity.turf.name}
                                                className="w-14 h-14 rounded-xl object-cover"
                                            />
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#e53935] transition-colors">
                                                    {activity.turf.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                    <span>
                                                        {calculateDaysAgo(
                                                            activity.bookingDate,
                                                        )}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span>
                                                        ₹
                                                        {activity.totalPrice.toLocaleString(
                                                            "en-IN",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs font-bold ${activity.status.toLowerCase() === "completed" ? "text-green-600" : "text-gray-500"} capitalize`}
                                        >
                                            {activity.status}
                                        </span>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-sm font-medium text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                                        No recent activity.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Discover New Turfs */}
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                                Discover New Turfs
                            </h2>
                            <div className="space-y-4">
                                {discoverTurfs.map((turf) => (
                                    <Link
                                        key={turf.id}
                                        to={`/turfs/${turf.id}`}
                                        className="block"
                                    >
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow group">
                                            <img
                                                src={
                                                    turf.images?.[0] ||
                                                    "https://images.unsplash.com/photo-1518605338461-1d70a4b3d735?w=200&q=80"
                                                }
                                                alt={turf.name}
                                                className="w-24 h-20 rounded-xl object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-[#e53935] transition-colors">
                                                    {turf.name}
                                                </h4>
                                                <div className="flex items-center text-xs font-medium text-gray-500 mb-3">
                                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                    <span className="truncate max-w-[160px]">
                                                        {turf.address}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="font-extrabold text-gray-900">
                                                        ₹
                                                        {turf.pricePerHour.toLocaleString(
                                                            "en-IN",
                                                        )}
                                                        <span className="text-xs font-medium text-gray-400 ml-1">
                                                            /hr
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                                                        {turf.rating || "4.5"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {discoverTurfs.length === 0 && (
                                    <p className="text-sm font-medium text-gray-500 py-4">
                                        No turfs available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Cancellation Modal */}
            {cancellingBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
                                <p className="text-xs text-gray-500">{cancellingBooking.turf.name}</p>
                            </div>
                            <button
                                onClick={() => setCancellingBooking(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingPreview ? (
                            <div className="py-8 text-center text-sm font-medium text-gray-500">
                                Calculating cancellation policy & refund eligibility...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Policy Breakdown Card */}
                                {cancellationPreview && (
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Booking Total:</span>
                                            <span className="font-bold text-gray-900">₹{cancellationPreview.totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Time remaining:</span>
                                            <span className="font-bold text-gray-900">{cancellationPreview.hoursRemaining} hours</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Eligible Refund %:</span>
                                            <span className="font-bold text-[#e53935]">{cancellationPreview.refundPercentage}%</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                                            <span className="font-bold text-gray-800">Refund Amount:</span>
                                            <span className="font-black text-green-600 text-base">₹{cancellationPreview.refundAmount}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 italic mt-1">
                                            {cancellationPreview.ruleApplied}
                                        </p>
                                        {cancellationPreview.refundAmount > 0 && (
                                            <p className="text-[11px] text-blue-600 font-medium pt-1">
                                                ✓ Eligible refund will be automatically refunded back to your original payment method via Razorpay.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Reason Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Reason for Cancellation *
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#e53935]"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    >
                                        <option value="Schedule clash / Change of plans">Schedule clash / Change of plans</option>
                                        <option value="Booked wrong date or time slot">Booked wrong date or time slot</option>
                                        <option value="Health or weather condition">Health or weather condition</option>
                                        <option value="Other">Other (Please specify)</option>
                                    </select>
                                </div>

                                {cancelReason === "Other" && (
                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Please describe why you are cancelling..."
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#e53935]"
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelling || loadingPreview}
                                className="flex-1 bg-[#e53935] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
                            >
                                {cancelling ? "Processing Cancellation..." : "Confirm Cancellation"}
                            </button>
                            <button
                                onClick={() => setCancellingBooking(null)}
                                className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm"
                            >
                                Keep Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
