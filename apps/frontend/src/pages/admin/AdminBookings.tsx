import { Calendar as CalendarIcon, Clock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { Booking, BookingStatus } from "./types";

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
        "all",
    );
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get("/bookings");
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (
        bookingId: string,
        status: BookingStatus,
    ) => {
        try {
            setUpdatingBookingId(bookingId);
            await api.patch(`/bookings/${bookingId}/status`, { status });
            await fetchBookings();
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                    "Failed to update booking status",
            );
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (statusFilter !== "all" && b.status !== statusFilter)
                return false;

            if (!search.trim()) return true;
            const term = search.toLowerCase();
            const userName =
                `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
            return (
                userName.includes(term) ||
                (b.user.email && b.user.email.toLowerCase().includes(term)) ||
                b.turf.name.toLowerCase().includes(term) ||
                b.turf.address.toLowerCase().includes(term)
            );
        });
    }, [bookings, statusFilter, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-screen">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading bookings...
                </span>
            </div>
        );
    }

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-amber-100 text-amber-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Platform Bookings
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage and override all bookings on the platform
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as BookingStatus | "all",
                            )
                        }
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="relative w-full md:w-80">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users or turfs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Booking Info
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Customer
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Time & Price
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Status Management
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center text-gray-500 font-medium"
                                    >
                                        No bookings found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-gray-900">
                                                {b.turf.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                {b.turf.address}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                ID: {b.id.split("-")[0]}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-gray-800">
                                                {b.user.firstName}{" "}
                                                {b.user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {b.user.phone || b.user.email}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm font-semibold text-gray-700">
                                                    <CalendarIcon className="w-4 h-4 mr-1 text-[#E33E33]" />
                                                    {new Date(
                                                        b.bookingDate,
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 mr-1 text-[#E33E33]" />
                                                    {b.startTime} - {b.endTime}
                                                </div>
                                                <div className="text-sm font-black text-gray-900 mt-1">
                                                    ₹{b.totalPrice}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize ${getStatusColor(b.status)}`}
                                                >
                                                    {b.status}
                                                </span>
                                                <select
                                                    disabled={
                                                        updatingBookingId ===
                                                        b.id
                                                    }
                                                    value={b.status}
                                                    onChange={(e) =>
                                                        handleUpdateStatus(
                                                            b.id,
                                                            e.target
                                                                .value as BookingStatus,
                                                        )
                                                    }
                                                    className="bg-gray-50 border border-gray-200 text-sm font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                                                >
                                                    <option value="pending">
                                                        Set Pending
                                                    </option>
                                                    <option value="confirmed">
                                                        Set Confirmed
                                                    </option>
                                                    <option value="completed">
                                                        Set Completed
                                                    </option>
                                                    <option value="cancelled">
                                                        Set Cancelled
                                                    </option>
                                                </select>
                                                {updatingBookingId === b.id && (
                                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
