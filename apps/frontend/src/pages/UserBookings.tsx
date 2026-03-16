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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    My Bookings
                </h1>

                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">
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
                                        <div className="flex items-center">
                                            <span className="font-semibold">
                                                ₹{booking.totalPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            booking.status.slice(1)}
                                    </span>
                                    {booking.status === "pending" ||
                                        booking.status === "confirmed" ? (
                                        <button
                                            onClick={() =>
                                                handleCancel(booking.id)
                                            }
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
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
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg mb-4">
                            No bookings yet.
                        </p>
                        <a
                            href="/turfs"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Browse turfs to make a booking
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
