import { useState, useEffect } from "react";
import api from "../services/api";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
    turf: {
        id: string;
        name: string;
        address: string;
    };
}

export default function UserBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get("/bookings");
            setBookings(response.data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            fetchBookings();
        } catch (error) {
            alert("Failed to cancel booking");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading bookings...</div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
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

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
                    My Bookings
                </h1>

                <div className="space-y-5 max-w-4xl">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {booking.turf.name}
                                    </h3>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{booking.turf.address}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>
                                                {new Date(
                                                    booking.bookingDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>
                                                {booking.startTime} -{" "}
                                                {booking.endTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-900 mt-2">
                                            <span className="font-bold text-lg">
                                                ₹{booking.totalPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 ml-4">
                                    <span
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status}
                                    </span>
                                    {booking.status === "pending" ||
                                        booking.status === "confirmed" ? (
                                        <button
                                            onClick={() =>
                                                handleCancel(booking.id)
                                            }
                                            className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100 mt-6 max-w-4xl">
                        <span className="text-5xl mb-4 block opacity-40">📅</span>
                        <p className="text-gray-500 text-lg mb-4 font-medium">
                            No bookings yet.
                        </p>
                        <a
                            href="/turfs"
                            className="bg-[#e53935] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-600 transition-colors inline-block"
                        >
                            Browse turfs
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}
