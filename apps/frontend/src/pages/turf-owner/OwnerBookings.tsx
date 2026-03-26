import { Calendar as CalendarIcon, Clock, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { Booking, BookingStatus } from "./types";

export default function OwnerBookings() {
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
                b.turf.name.toLowerCase().includes(term)
            );
        });
    }, [bookings, statusFilter, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading bookings...
                </span>
            </div>
        );
    }

    const getStatusStyle = (status: BookingStatus) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-700 border-green-200";
            case "pending":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "completed":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Turf Bookings
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage and review all bookings for your turfs
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
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 font-bold"
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
                            placeholder="Search customer or turf..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                    Customer
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                    Turf Details
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                    Schedule & Price
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">
                                    Status Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-gray-500 font-medium"
                                    >
                                        No bookings match your current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-5 px-6">
                                            <div className="font-bold text-gray-900">
                                                {b.user.firstName}{" "}
                                                {b.user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                                {b.user.phone || b.user.email}
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-gray-400 mt-2">
                                                ID: {b.id.split("-")[0]}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-bold text-gray-900 line-clamp-1">
                                                {b.turf.name}
                                            </div>
                                            <div className="flex items-start text-xs text-gray-500 mt-1">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">
                                                    {b.turf.address}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center text-sm font-bold text-gray-700">
                                                    <CalendarIcon className="w-4 h-4 mr-2 text-[#E33E33]" />
                                                    {new Date(
                                                        b.bookingDate,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm font-bold text-gray-700">
                                                    <Clock className="w-4 h-4 mr-2 text-[#E33E33]" />
                                                    {b.startTime} - {b.endTime}
                                                </div>
                                                <div className="text-sm font-black text-[#E33E33] mt-1 hover:bg-red-50 inline-block px-2 py-0.5 rounded -ml-2 transition-colors">
                                                    ₹{b.totalPrice}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`px-3 py-1.5 text-xs font-black rounded-lg capitalize border ${getStatusStyle(b.status)}`}
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
                                                    className={`text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50 border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors
                                                        ${updatingBookingId === b.id ? "animate-pulse" : ""}
                                                    `}
                                                >
                                                    <option value="pending">
                                                        Mark Pending
                                                    </option>
                                                    <option value="confirmed">
                                                        Confirm Slot
                                                    </option>
                                                    <option value="completed">
                                                        Mark Completed
                                                    </option>
                                                    <option value="cancelled">
                                                        Cancel Booking
                                                    </option>
                                                </select>
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
