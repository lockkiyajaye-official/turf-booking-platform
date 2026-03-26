import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    Mail,
    MapPin,
    Phone,
    Star,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { loadRazorpayScript } from "../../utils/razorpay";
import type { Turf } from "./types";

export default function TurfDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [turf, setTurf] = useState<Turf | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [booking, setBooking] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if (id) fetchTurf();
    }, [id]);

    const fetchTurf = async () => {
        try {
            const response = await api.get(`/turfs/${id}`);
            setTurf(response.data);
        } catch (error) {
            console.error("Failed to fetch turf:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user) { navigate("/login"); return; }
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
                        alert("Payment successful! Booking confirmed.");
                        navigate("/dashboard/bookings");
                    } catch (error: any) {
                        alert(error.response?.data?.message || "Payment verification failed");
                    } finally {
                        setBooking(false);
                    }
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            alert(error.response?.data?.message || "Unable to start payment");
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="text-gray-500 font-medium animate-pulse">Loading turf details...</span>
            </div>
        );
    }

    if (!turf) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <span className="text-5xl">🏟️</span>
                <p className="text-gray-600 font-semibold">Turf not found</p>
                <Link to="/turfs" className="text-[#E33E33] font-bold hover:underline">
                    Back to Turfs
                </Link>
            </div>
        );
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const ratingValue =
        typeof turf.rating === "number"
            ? turf.rating
            : turf.rating ? parseFloat(turf.rating as string) : 0;

    const images = turf.images && turf.images.length > 0 ? turf.images : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero image gallery */}
            <div className="relative bg-gray-900 h-72 sm:h-96 lg:h-[480px] overflow-hidden">
                {images.length > 0 ? (
                    <>
                        <img
                            src={images[activeImage]}
                            alt={turf.name}
                            className="w-full h-full object-cover opacity-90 transition-all duration-500"
                        />
                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                            idx === activeImage
                                                ? "border-white scale-110"
                                                : "border-white/40 opacity-60 hover:opacity-90"
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-8xl opacity-20">🏟️</span>
                    </div>
                )}

                {/* Back button */}
                <Link
                    to="/turfs"
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-sm text-sm"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Link>

                {/* Rating badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-black text-gray-900 text-sm">
                        {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
                    </span>
                    {turf.totalReviews > 0 && (
                        <span className="text-gray-500 text-xs">({turf.totalReviews})</span>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & location */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{turf.name}</h1>
                            <div className="flex items-start gap-2 text-gray-500 mb-4">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#E33E33]" />
                                <span className="text-sm">{turf.address}</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{turf.description}</p>
                        </div>

                        {/* Amenities */}
                        {turf.amenities && turf.amenities.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-black text-gray-900 mb-4">Amenities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {turf.amenities.map((amenity, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 text-[#E33E33]" />
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available slots preview */}
                        {turf.availableSlots && turf.availableSlots.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#E33E33]" />
                                    Available Time Slots
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {turf.availableSlots.map((slot, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium text-center"
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact info */}
                        {(turf.contactPhone || turf.contactEmail) && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#E33E33]" />
                                    Contact
                                </h2>
                                <div className="space-y-3">
                                    {turf.contactPhone && (
                                        <a
                                            href={`tel:${turf.contactPhone}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-[#E33E33] transition-colors"
                                        >
                                            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-[#E33E33]" />
                                            </div>
                                            <span className="font-medium">{turf.contactPhone}</span>
                                        </a>
                                    )}
                                    {turf.contactEmail && (
                                        <a
                                            href={`mailto:${turf.contactEmail}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-[#E33E33] transition-colors"
                                        >
                                            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-[#E33E33]" />
                                            </div>
                                            <span className="font-medium">{turf.contactEmail}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Booking card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            {/* Price */}
                            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-black text-gray-900">
                                    ₹{turf.pricePerHour.toLocaleString("en-IN")}
                                </span>
                                <span className="text-gray-500 mb-1 font-medium">/hour</span>
                            </div>

                            {user && user.role === "user" ? (
                                <div className="space-y-4">
                                    {/* Date picker */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-[#E33E33]" />
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            min={minDate}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all text-sm"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setSelectedSlot("");
                                            }}
                                        />
                                    </div>

                                    {/* Slot picker */}
                                    {selectedDate && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-[#E33E33]" />
                                                Select Time Slot
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                                                {turf.availableSlots.map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${
                                                            selectedSlot === slot
                                                                ? "bg-[#E33E33] text-white shadow-sm"
                                                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#E33E33] hover:text-[#E33E33]"
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Price summary */}
                                    {selectedSlot && (
                                        <div className="bg-gray-50 rounded-xl p-3 text-sm">
                                            <div className="flex justify-between text-gray-600 mb-1">
                                                <span>Slot</span>
                                                <span className="font-medium">{selectedSlot}</span>
                                            </div>
                                            <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-2 mt-2">
                                                <span>Total</span>
                                                <span>₹{turf.pricePerHour.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedDate || !selectedSlot || booking}
                                        className="w-full bg-[#E33E33] hover:bg-red-700 text-white py-3 rounded-xl font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {booking ? "Processing..." : "Book Now"}
                                    </button>
                                </div>
                            ) : user ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm mb-4">
                                        Only regular users can book turfs.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-gray-500 text-sm text-center">
                                        Sign in to book this turf
                                    </p>
                                    <Link
                                        to="/login"
                                        state={{ returnTo: `/turfs/${id}` }}
                                        className="block w-full bg-[#E33E33] hover:bg-red-700 text-white py-3 rounded-xl font-black text-center transition-colors"
                                    >
                                        Login to Book
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
