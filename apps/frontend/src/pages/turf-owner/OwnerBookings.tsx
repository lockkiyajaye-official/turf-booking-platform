import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    PlusCircle,
    Search,
    Store,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DirectBookingModal from "../../components/turf-owner/DirectBookingModal";
import Pagination from "../../components/Pagination";
import api from "../../services/api";
import type { Booking, BookingStatus } from "./types";

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

function formatSlot12H(start: string, end?: string): string {
    if (!end) {
        if (start.includes("-")) {
            const parts = start.split("-");
            return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
        }
        return format12Hour(start);
    }
    return `${format12Hour(start)} - ${format12Hour(end)}`;
}

export default function OwnerBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
    const [sourceFilter, setSourceFilter] = useState<"all" | "online" | "direct">("all");
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
    const [showDirectModal, setShowDirectModal] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchBookings = useCallback(
        async (targetPage = page, targetPageSize = pageSize) => {
            try {
                setLoading(true);

                const params: Record<string, any> = {
                    page: targetPage,
                    limit: targetPageSize,
                };

                if (statusFilter !== "all") {
                    params.status = statusFilter;
                }

                if (sourceFilter !== "all") {
                    params.source = sourceFilter;
                }

                if (debouncedSearch.trim()) {
                    params.search = debouncedSearch.trim();
                }

                const response = await api.get("/bookings", { params });
                const data = response.data;
                const items: Booking[] = Array.isArray(data)
                    ? data
                    : data?.items || [];
                const total = data?.total ?? data?.meta?.total ?? items.length;
                const totalP =
                    data?.totalPages ??
                    data?.meta?.totalPages ??
                    Math.max(1, Math.ceil(total / targetPageSize));

                setBookings(items);
                setTotalItems(total);
                setTotalPages(totalP);
                setPage(targetPage);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        },
        [statusFilter, sourceFilter, debouncedSearch, page, pageSize],
    );

    // Reset and fetch page 1 on filter/search change
    useEffect(() => {
        setPage(1);
        fetchBookings(1, pageSize);
    }, [statusFilter, sourceFilter, debouncedSearch, pageSize]);

    const handleUpdateStatus = async (
        bookingId: string,
        status: BookingStatus,
    ) => {
        try {
            setUpdatingBookingId(bookingId);
            if (status === "cancelled") {
                const reason = prompt(
                    "Please enter reason for cancellation:",
                    "Slot unavailable / Turf maintenance",
                );
                if (reason === null) return;
                await api.post(`/bookings/${bookingId}/cancel`, {
                    reason: reason.trim() || "Cancelled by Turf Owner",
                });
                alert("Booking cancelled successfully.");
            } else {
                await api.patch(`/bookings/${bookingId}/status`, { status });
            }
            fetchBookings(page, pageSize);
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                    "Failed to update booking status",
            );
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const getStatusBadgeStyle = (status: BookingStatus) => {
        switch (status) {
            case "confirmed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "completed":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8 animate-in fade-in duration-300">
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Turf Bookings
                        </h1>
                        <p className="text-gray-600 mt-1 font-medium tracking-wide">
                            Manage online reservations and record offline walk-in slots
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => setShowDirectModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E33E33] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Mark Direct Booking</span>
                        </button>

                        <select
                            value={sourceFilter}
                            onChange={(e) =>
                                setSourceFilter(
                                    e.target.value as "all" | "online" | "direct",
                                )
                            }
                            className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 font-bold text-sm shadow-xs"
                        >
                            <option value="all">All Sources</option>
                            <option value="online">Online App Bookings</option>
                            <option value="direct">Direct / Offline Only</option>
                        </select>

                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customer, turf..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm transition-all shadow-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Tabs Filter (matching Mobile tabs & UserBookings) */}
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {(
                        [
                            "all",
                            "pending",
                            "confirmed",
                            "completed",
                            "cancelled",
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs capitalize whitespace-nowrap ${
                                statusFilter === tab
                                    ? "bg-[#e53935] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/80"
                            }`}
                        >
                            {tab === "all" ? "All Bookings" : tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {loading && bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-16 text-center text-gray-500 font-medium animate-pulse">
                        Loading bookings...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-16 text-center">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            No bookings found
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                            No reservations match your current filter settings. Try selecting a different status or search term.
                        </p>
                        <button
                            onClick={() => {
                                setStatusFilter("all");
                                setSourceFilter("all");
                                setSearch("");
                            }}
                            className="text-[#E33E33] font-bold text-sm hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile & Tablet Card View (< lg screens) */}
                        <div className="lg:hidden space-y-4">
                            {bookings.map((b) => {
                                const isDirect = b.bookingSource === "direct";
                                const customerDisplayName = isDirect
                                    ? b.customerName || "Direct Customer"
                                    : `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim() || "Player";
                                const customerContact = isDirect
                                    ? b.customerPhone || "Direct Walk-in"
                                    : b.user?.phone || b.user?.email || "—";

                                return (
                                    <div
                                        key={b.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-base text-gray-900">
                                                        {customerDisplayName}
                                                    </span>
                                                    {isDirect ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                            <Store className="w-3 h-3" />
                                                            Direct
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                            Online
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {customerContact}
                                                </p>
                                            </div>

                                            <span
                                                className={`px-3 py-1 text-xs font-black rounded-lg capitalize border ${getStatusBadgeStyle(
                                                    b.status,
                                                )}`}
                                            >
                                                {b.status}
                                            </span>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="font-bold text-gray-400 uppercase text-[10px]">
                                                    Turf
                                                </p>
                                                <p className="font-bold text-gray-900 line-clamp-1 mt-0.5">
                                                    {b.turf?.name || "Turf"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-400 uppercase text-[10px]">
                                                    Schedule
                                                </p>
                                                <p className="font-bold text-gray-800 mt-0.5">
                                                    {new Date(b.bookingDate).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}{" "}
                                                    &bull; {formatSlot12H(b.startTime, b.endTime)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-400 uppercase text-[10px]">
                                                    Amount
                                                </p>
                                                <p className="font-extrabold text-sm text-[#E33E33] mt-0.5">
                                                    ₹{b.totalPrice}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-400 uppercase text-[10px]">
                                                    Action
                                                </p>
                                                {b.status !== "cancelled" ? (
                                                    <select
                                                        disabled={updatingBookingId === b.id}
                                                        value={b.status}
                                                        onChange={(e) =>
                                                            handleUpdateStatus(
                                                                b.id,
                                                                e.target.value as BookingStatus,
                                                            )
                                                        }
                                                        className="mt-0.5 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none border border-gray-200 bg-gray-50"
                                                    >
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancel</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-gray-400 font-medium">None</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View (lg+ screens) */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[850px]">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                                Customer & Source
                                            </th>
                                            <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                                Turf Details
                                            </th>
                                            <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                                Schedule & Rate
                                            </th>
                                            <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">
                                                Status & Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.map((b) => {
                                            const isDirect = b.bookingSource === "direct";
                                            const customerDisplayName = isDirect
                                                ? b.customerName || "Direct Customer"
                                                : `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim() || "Player";
                                            const customerContact = isDirect
                                                ? b.customerPhone || "Direct Walk-in"
                                                : b.user?.phone || b.user?.email || "—";

                                            return (
                                                <tr
                                                    key={b.id}
                                                    className="hover:bg-gray-50/60 transition-colors"
                                                >
                                                    {/* Customer & Source */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {customerDisplayName}
                                                            </span>
                                                            {isDirect ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                                    <Store className="w-3 h-3" />
                                                                    Direct
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                                    Online
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                            {customerContact}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-gray-400 mt-1">
                                                            ID: #{b.id.slice(0, 8)}
                                                        </div>
                                                    </td>

                                                    {/* Turf Details */}
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-900 text-sm line-clamp-1">
                                                            {b.turf?.name || "Turf Facility"}
                                                        </div>
                                                        <div className="flex items-start text-xs text-gray-500 mt-1">
                                                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0 mt-0.5" />
                                                            <span className="line-clamp-1">
                                                                {b.turf?.address || "Address N/A"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Schedule & Payment */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center text-sm font-bold text-gray-800">
                                                                <CalendarIcon className="w-4 h-4 mr-1.5 text-[#E33E33]" />
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
                                                            <div className="flex items-center text-xs font-semibold text-gray-600">
                                                                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                                {formatSlot12H(b.startTime, b.endTime)}
                                                            </div>
                                                            <div className="mt-1 flex items-baseline gap-2">
                                                                <span className="text-sm font-black text-[#E33E33]">
                                                                    ₹{b.totalPrice}
                                                                </span>
                                                                {isDirect ? (
                                                                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                                                        Direct Offline
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                                        Platform Wallet
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Action */}
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span
                                                                className={`px-3 py-1 text-xs font-black rounded-lg capitalize border ${getStatusBadgeStyle(
                                                                    b.status,
                                                                )}`}
                                                            >
                                                                {b.status}
                                                            </span>

                                                            {b.status !== "cancelled" && (
                                                                <select
                                                                    disabled={updatingBookingId === b.id}
                                                                    value={b.status}
                                                                    onChange={(e) =>
                                                                        handleUpdateStatus(
                                                                            b.id,
                                                                            e.target.value as BookingStatus,
                                                                        )
                                                                    }
                                                                    className="text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50 border border-gray-200 bg-white shadow-xs cursor-pointer hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <option value="confirmed">
                                                                        Confirmed
                                                                    </option>
                                                                    <option value="completed">
                                                                        Completed
                                                                    </option>
                                                                    <option value="cancelled">
                                                                        Cancel Booking
                                                                    </option>
                                                                </select>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                pageSizeOptions={[10, 25, 50]}
                                onPageChange={(newPage) => {
                                    setPage(newPage);
                                    fetchBookings(newPage, pageSize);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setPage(1);
                                    fetchBookings(1, newSize);
                                }}
                                accentColor="red"
                                className="border-t border-gray-100 rounded-none shadow-none"
                            />
                        </div>
                    </>
                )}
            </main>

            {/* Direct Booking Modal */}
            <DirectBookingModal
                isOpen={showDirectModal}
                onClose={() => setShowDirectModal(false)}
                onSuccess={() => fetchBookings(1, pageSize)}
            />
        </div>
    );
}
