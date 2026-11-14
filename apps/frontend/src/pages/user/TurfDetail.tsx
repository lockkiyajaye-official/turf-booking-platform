import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    Heart,
    Mail,
    MapPin,
    MessageSquare,
    Minus,
    Phone,
    Plus,
    Shield,
    ShieldCheck,
    Star,
    Trash2,
    Users,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { addFavorite, checkFavorite, removeFavorite } from "../../services/favorites";
import { loadRazorpayScript } from "../../utils/razorpay";
import type { Turf } from "./types";

interface TurfReview {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user?: {
        id: string;
        firstName?: string;
        lastName?: string;
        name?: string;
    };
    userName?: string;
}

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

function formatSlot12H(slot: string): string {
    if (slot.includes("-")) {
        const parts = slot.split("-");
        return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
    }
    return format12Hour(slot);
}

export default function TurfDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [turf, setTurf] = useState<Turf | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [playerCount, setPlayerCount] = useState(10);
    const [feeBreakdown, setFeeBreakdown] = useState<{
        basePrice: number;
        platformFee: number;
        gatewayFee: number;
        totalPrice: number;
    } | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<TurfReview[]>([]);
    const [userReview, setUserReview] = useState<TurfReview | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTurf();
            fetchReviews();
            if (user) {
                checkFavorite(id).then(setIsFavorite).catch(() => {});
                fetchMyReview();
            }
        }
    }, [id, user]);

    useEffect(() => {
        if (id && selectedDate) {
            fetchBookedSlots(selectedDate);
        } else {
            setBookedSlots([]);
        }
    }, [id, selectedDate]);

    useEffect(() => {
        if (!id || !selectedSlot) {
            setFeeBreakdown(null);
            return;
        }
        const [startTime, endTime] = selectedSlot.split("-");
        const startHour = parseInt(startTime?.split(":")[0] || "0");
        const endHour = parseInt(endTime?.split(":")[0] || "1");
        const hours = Math.max(1, endHour - startHour);

        api.get(`/payments/fee-preview?turfId=${id}&hours=${hours}`)
            .then((res) => setFeeBreakdown(res.data))
            .catch(() => {
                if (turf) {
                    const basePrice = Number(turf.pricePerHour) * hours;
                    const platformFee = Math.round(basePrice * 0.05 * 100) / 100;
                    const gatewayFee = Math.round((basePrice + platformFee) * 0.0236 * 100) / 100;
                    setFeeBreakdown({
                        basePrice,
                        platformFee,
                        gatewayFee,
                        totalPrice: Math.round((basePrice + platformFee + gatewayFee) * 100) / 100,
                    });
                }
            });
    }, [id, selectedSlot, turf]);

    const fetchTurf = async () => {
        try {
            const response = await api.get(`/turfs/${id}`);
            const data: Turf = response.data;
            setTurf(data);
            if (data.capacity) {
                setPlayerCount(Math.min(10, data.capacity));
            }
        } catch (error) {
            console.error("Failed to fetch turf:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookedSlots = async (date: string) => {
        setLoadingSlots(true);
        try {
            const res = await api.get(`/turfs/${id}/booked-slots?date=${date}`);
            setBookedSlots(Array.isArray(res.data) ? res.data : []);
        } catch {
            setBookedSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/${id}`);
            const data = res.data;
            const list = Array.isArray(data)
                ? data
                : data.reviews || data.data || [];
            setReviews(list);
        } catch (e) {
            console.error("Failed to fetch reviews:", e);
        }
    };

    const fetchMyReview = async () => {
        if (!user || !id) return;
        try {
            const res = await api.get(`/reviews/${id}/my`);
            const rev = res.data?.review || (res.data?.id ? res.data : null);
            if (rev) {
                setUserReview(rev);
                setReviewRating(rev.rating || 5);
                setReviewComment(rev.comment || "");
            }
        } catch {
            setUserReview(null);
        }
    };

    const isSlotBooked = (slot: string) => {
        if (!bookedSlots || bookedSlots.length === 0) return false;
        const cleanSlot = slot.replace(/\s+/g, "").toLowerCase();
        return bookedSlots.some((b) => {
            const cleanB = b.replace(/\s+/g, "").toLowerCase();
            return cleanB === cleanSlot || cleanB.includes(cleanSlot) || cleanSlot.includes(cleanB);
        });
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!id) return;
        try {
            if (isFavorite) {
                await removeFavorite(id);
                setIsFavorite(false);
            } else {
                await addFavorite(id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            navigate("/login", { state: { returnTo: `/turfs/${id}` } });
            return;
        }
        if (!selectedDate || !selectedSlot || !id) {
            alert("Please select a date and time slot");
            return;
        }
        const [startTime, endTime] = selectedSlot.split("-");
        setBooking(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert("Failed to load payment gateway. Please try again.");
                setBooking(false);
                return;
            }
            const { data } = await api.post("/payments/create", {
                turfId: id,
                bookingDate: selectedDate,
                startTime,
                endTime,
            });
            const options = {
                key: data.RazorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Lock Kiya Jaye",
                description: `Booking at ${turf?.name}`,
                order_id: data.orderId,
                prefill: {
                    name: data.customer?.name,
                    email: data.customer?.email,
                    contact: data.customer?.contact,
                },
                theme: { color: "#E33E33" },
                handler: async (response: any) => {
                    try {
                        await api.post("/payments/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: data.bookingId,
                        });
                        alert("Payment successful! Your booking is confirmed.");
                        navigate("/dashboard/bookings");
                    } catch (error: any) {
                        alert(error.response?.data?.message || "Payment verification failed");
                    } finally {
                        setBooking(false);
                    }
                },
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            alert(error.response?.data?.message || "Unable to start payment");
            setBooking(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            setSubmittingReview(true);
            await api.post(`/reviews/${id}`, {
                rating: reviewRating,
                comment: reviewComment.trim() || undefined,
            });
            setShowReviewModal(false);
            await Promise.all([fetchTurf(), fetchReviews(), fetchMyReview()]);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!confirm("Are you sure you want to delete your review?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            setUserReview(null);
            setReviewComment("");
            setReviewRating(5);
            await Promise.all([fetchTurf(), fetchReviews()]);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete review");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <span className="text-gray-500 font-medium animate-pulse">
                    Loading venue details...
                </span>
            </div>
        );
    }

    if (!turf) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 gap-4">
                <span className="text-6xl">🏟️</span>
                <p className="text-gray-800 text-lg font-bold">Turf facility not found</p>
                <Link
                    to="/turfs"
                    className="text-[#E33E33] font-bold hover:underline text-sm"
                >
                    Back to Explore Turfs
                </Link>
            </div>
        );
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const ratingValue =
        typeof turf.rating === "number"
            ? turf.rating
            : turf.rating ? parseFloat(turf.rating as string) : 0;
    const images = turf.images && turf.images.length > 0 ? turf.images : [];
    const maxCapacity = turf.capacity || 14;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-8 animate-in fade-in duration-300">
                {/* Navigation Bar / Breadcrumb */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/turfs"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Turfs</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shadow-xs ${
                                isFavorite
                                    ? "bg-red-50 border-red-200 text-[#E33E33]"
                                    : "bg-white border-gray-200 text-gray-500 hover:text-red-500"
                            }`}
                            title={isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#E33E33]" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Hero Gallery */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
                    <div className="relative h-72 sm:h-96 lg:h-[460px] bg-gray-950 overflow-hidden">
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage]}
                                alt={turf.name}
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-8xl opacity-20">🏟️</span>
                            </div>
                        )}

                        {/* Top Overlays */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white shadow-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-extrabold text-sm">
                                    {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
                                </span>
                                {turf.totalReviews > 0 && (
                                    <span className="text-xs text-gray-300">
                                        ({turf.totalReviews})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Bar */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-md rounded-2xl max-w-[90%] overflow-x-auto">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-14 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                            idx === activeImage
                                                ? "border-[#E33E33] scale-105"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid: 2 Col Details, 1 Col Sticky Booking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Venue Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title, Address & Quick Specs */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                        {turf.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                        <MapPin className="w-4 h-4 text-[#E33E33] shrink-0" />
                                        <span>
                                            {[turf.address, turf.city, turf.state, turf.pincode]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    </div>
                                </div>

                                {(turf.googleMapUrl || turf.mapUrl) && (
                                    <a
                                        href={turf.googleMapUrl || turf.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-[#E33E33] hover:bg-red-100 font-bold text-xs rounded-xl transition-colors shrink-0 self-start sm:self-auto"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>View on Google Maps</span>
                                    </a>
                                )}
                            </div>

                            {/* Sports Badges */}
                            {turf.sports && turf.sports.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {turf.sports.map((sport) => (
                                        <span
                                            key={sport}
                                            className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-lg border border-red-100"
                                        >
                                            {sport}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Quick Specs Row */}
                            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Surface Type
                                    </p>
                                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                                        {turf.surfaceType || "Artificial Turf"}
                                    </p>
                                </div>
                                <div className="border-x border-gray-200/60 px-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Capacity
                                    </p>
                                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                                        {turf.capacity ? `${turf.capacity} Players` : "Flexible"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Time Slots
                                    </p>
                                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                                        {turf.availableSlots?.length || 0} Open
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="pt-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    About This Venue
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {turf.description}
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        {turf.amenities && turf.amenities.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Venue Amenities
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {turf.amenities.map((amenity, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-700"
                                        >
                                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="truncate">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancellation & Refund Policy (matching mobile feature) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Cancellation & Refund Policy
                                    </h3>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        turf.cancellationPolicyEnabled !== false
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {turf.cancellationPolicyEnabled !== false
                                        ? "Refund Protected"
                                        : "Non-refundable"}
                                </span>
                            </div>

                            {turf.cancellationPolicyEnabled !== false ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                            100% Full Refund
                                        </p>
                                        <p className="text-sm font-extrabold text-gray-900">
                                            Up to {turf.fullRefundHours ?? 24} hours before slot
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Full refund transferred to your original payment method.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                            {turf.partialRefundPercentage ?? 50}% Partial Refund
                                        </p>
                                        <p className="text-sm font-extrabold text-gray-900">
                                            Up to {turf.partialRefundHours ?? 6} hours before slot
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Partial refund processed if cancelled within this window.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    This venue does not allow automated cancellations. All sales are final.
                                </p>
                            )}
                        </div>

                        {/* Rules & Guidelines */}
                        {turf.rules && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Turf Rules & Guidelines
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed">
                                    {turf.rules}
                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        {(turf.contactPhone || turf.contactEmail) && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Venue Contact & Support
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {turf.contactPhone && (
                                        <a
                                            href={`tel:${turf.contactPhone}`}
                                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-red-50/50 rounded-2xl border border-gray-100 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center shrink-0">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-gray-400 uppercase">
                                                    Phone
                                                </p>
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {turf.contactPhone}
                                                </p>
                                            </div>
                                        </a>
                                    )}

                                    {turf.contactEmail && (
                                        <a
                                            href={`mailto:${turf.contactEmail}`}
                                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-red-50/50 rounded-2xl border border-gray-100 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center shrink-0">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-gray-400 uppercase">
                                                    Email
                                                </p>
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {turf.contactEmail}
                                                </p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ratings & Reviews Section (full mobile feature parity) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Player Reviews & Ratings
                                        </h3>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="font-extrabold text-sm text-gray-900">
                                                {ratingValue > 0 ? ratingValue.toFixed(1) : "0.0"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({turf.totalReviews || reviews.length})
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Feedback from players who booked this venue
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate("/login", { state: { returnTo: `/turfs/${id}` } });
                                            return;
                                        }
                                        setShowReviewModal(true);
                                    }}
                                    className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-2 self-start sm:self-auto"
                                >
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span>{userReview ? "Edit My Review" : "Write a Review"}</span>
                                </button>
                            </div>

                            {/* User's own review box if exists */}
                            {userReview && (
                                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-amber-900">
                                                Your Review
                                            </span>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${
                                                            s <= userReview.rating
                                                                ? "text-amber-500 fill-amber-500"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowReviewModal(true)}
                                                className="text-xs font-bold text-amber-900 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDeleteReview}
                                                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                    {userReview.comment && (
                                        <p className="text-xs text-amber-950">
                                            {userReview.comment}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Reviews list */}
                            {reviews.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Be the first player to review this venue!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                    {reviews.map((rev) => {
                                        const name =
                                            rev.user?.name ||
                                            `${rev.user?.firstName || ""} ${rev.user?.lastName || ""}`.trim() ||
                                            rev.userName ||
                                            "Player";
                                        return (
                                            <div
                                                key={rev.id}
                                                className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-red-100 text-[#E33E33] font-bold text-xs flex items-center justify-center">
                                                            {name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900">
                                                                {name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400">
                                                                {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-xs font-extrabold text-gray-800">
                                                            {rev.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                {rev.comment && (
                                                    <p className="text-xs text-gray-600 leading-relaxed pl-10.5">
                                                        {rev.comment}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 sticky top-6 space-y-6">
                            {/* Rate Display */}
                            <div className="flex items-baseline justify-between pb-5 border-b border-gray-100">
                                <div>
                                    <span className="text-3xl font-black text-gray-900">
                                        ₹{turf.pricePerHour.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-gray-500 font-medium text-sm ml-1">
                                        / hour
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                    Instant Booking
                                </span>
                            </div>

                            {/* Number of Players Stepper (matching Mobile) */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#E33E33]" />
                                        Players
                                    </span>
                                    <span className="text-gray-400 font-normal text-[11px]">
                                        Max {maxCapacity} players
                                    </span>
                                </label>
                                <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setPlayerCount((p) => Math.max(1, p - 1))}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        disabled={playerCount <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-extrabold text-sm text-gray-900">
                                        {playerCount} Players
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPlayerCount((p) => Math.min(maxCapacity, p + 1))}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                        disabled={playerCount >= maxCapacity}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Select Date */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#E33E33]" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-sm transition-all"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedSlot("");
                                    }}
                                />
                            </div>

                            {/* Select Time Slot */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#E33E33]" />
                                        Select Time Slot
                                    </label>
                                    {loadingSlots && (
                                        <span className="text-[11px] text-gray-400 font-medium animate-pulse">
                                            Checking availability...
                                        </span>
                                    )}
                                </div>

                                {!turf.availableSlots || turf.availableSlots.length === 0 ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                        No time slots configured for this venue.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-gray-100 rounded-2xl bg-gray-50/50">
                                        {turf.availableSlots.map((slot, idx) => {
                                            const isBooked = isSlotBooked(slot);
                                            const isSelected = selectedSlot === slot;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={isBooked}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                                                        isBooked
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                                                            : isSelected
                                                            ? "bg-[#E33E33] text-white border-[#E33E33] shadow-xs"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    {formatSlot12H(slot)}
                                                    {isBooked && (
                                                        <span className="block text-[9px] font-normal text-gray-400">
                                                            Booked
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            {selectedSlot && !isSlotBooked(selectedSlot) && (
                                <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Selected Slot</span>
                                        <span className="font-bold text-gray-900">
                                            {formatSlot12H(selectedSlot)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Slot Rate</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{(feeBreakdown?.basePrice ?? turf.pricePerHour).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Platform Fee (5%)</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{(feeBreakdown?.platformFee ?? Math.round(turf.pricePerHour * 0.05)).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Taxes & Gateway (2% + GST)</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{(feeBreakdown?.gatewayFee ?? Math.round((turf.pricePerHour * 1.05) * 0.0236)).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-extrabold text-gray-900 border-t border-gray-200/80 pt-2.5 mt-2 text-sm">
                                        <span>Total Amount</span>
                                        <span className="text-[#E33E33]">
                                            ₹{(feeBreakdown?.totalPrice ?? Math.round(turf.pricePerHour * 1.05 * 1.0236)).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            {user && user.role === "user" ? (
                                <button
                                    onClick={handleBooking}
                                    disabled={
                                        !selectedDate ||
                                        !selectedSlot ||
                                        isSlotBooked(selectedSlot) ||
                                        booking
                                    }
                                    className="w-full bg-[#E33E33] hover:bg-red-700 text-white py-3.5 rounded-xl font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200 active:scale-[0.98]"
                                >
                                    {booking ? "Processing Payment..." : "Proceed to Book & Pay"}
                                </button>
                            ) : user ? (
                                <div className="text-center py-2 text-xs text-gray-500 font-medium">
                                    Logged in as {user.role}. Sign in as a regular player account to book online.
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    state={{ returnTo: `/turfs/${id}` }}
                                    className="block w-full bg-[#E33E33] hover:bg-red-700 text-white py-3.5 rounded-xl font-extrabold text-center transition-all shadow-md shadow-red-200 active:scale-[0.98]"
                                >
                                    Sign In to Book Turf
                                </Link>
                            )}

                            {/* Guarantees */}
                            <div className="pt-2 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Instant slot lock with Razorpay verification</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Cancellation & refund policy protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Write / Edit Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    {userReview ? "Edit Your Review" : "Rate This Venue"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Share your experience at {turf.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                                    Your Rating
                                </label>
                                <div className="flex items-center justify-center gap-2 py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="p-1 text-gray-300 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${
                                                    star <= reviewRating
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-gray-200"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Comments & Feedback (Optional)
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="How was the turf surface, lighting, and amenities? Let other players know..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-6 py-2.5 bg-[#E33E33] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
                                >
                                    {submittingReview ? "Saving..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
