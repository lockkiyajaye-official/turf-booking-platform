import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    PlusCircle,
    Search,
    Store,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import type { Booking, BookingStatus, Turf } from "./types";

function format12Hour(time24: string): string {
    if (!time24) return "";
    const trimmed = time24.trim();
    if (trimmed.includes("AM") || trimmed.includes("PM")) return trimmed;
    const [hStr, mStr] = trimmed.split(":");
    let h = parseInt(hStr, 10);
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
    const [sourceFilter, setSourceFilter] = useState<"all" | "online" | "direct">("all");
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

    // Direct booking modal state
    const [showDirectModal, setShowDirectModal] = useState(false);
    const [myTurfs, setMyTurfs] = useState<Turf[]>([]);
    const [selectedTurfId, setSelectedTurfId] = useState("");
    const [bookingDate, setBookingDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customPrice, setCustomPrice] = useState<number | "">("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [notes, setNotes] = useState("");
    const [submittingDirect, setSubmittingDirect] = useState(false);

    const isFetchingRef = useRef(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch owner turfs for direct booking modal
    useEffect(() => {
        api.get("/turfs/my-turfs")
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setMyTurfs(list);
                if (list.length > 0 && !selectedTurfId) {
                    setSelectedTurfId(list[0].id);
                    setCustomPrice(list[0].pricePerHour || 0);
                }
            })
            .catch((err) => console.error("Failed to load my turfs:", err));
    }, []);

    // Update price when selected turf changes
    useEffect(() => {
        if (!selectedTurfId || myTurfs.length === 0) return;
        const currentTurf = myTurfs.find((t) => t.id === selectedTurfId);
        if (currentTurf) {
            setCustomPrice(currentTurf.pricePerHour || 0);
        }
    }, [selectedTurfId, myTurfs]);

    // Fetch booked slots when turf or date changes
    useEffect(() => {
        if (!selectedTurfId || !bookingDate) {
            setBookedSlots([]);
            return;
        }
        setLoadingSlots(true);
        api.get(`/turfs/${selectedTurfId}/booked-slots?date=${bookingDate}`)
            .then((res) => {
                setBookedSlots(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setBookedSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [selectedTurfId, bookingDate]);

    const fetchBookings = useCallback(async (pageNum: number, isReset = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params: Record<string, any> = {
                page: pageNum,
                limit: 10,
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

            const res = await api.get("/bookings", { params });
            const data = res.data;

            let newItems: Booking[] = [];
            let moreAvailable = false;

            if (Array.isArray(data)) {
                newItems = data;
                moreAvailable = false;
            } else if (data && Array.isArray(data.items)) {
                newItems = data.items;
                moreAvailable = Boolean(data.hasMore);
            }

            if (isReset || pageNum === 1) {
                setBookings(newItems);
            } else {
                setBookings((prev) => {
                    const existingIds = new Set(prev.map((b) => b.id));
                    const filteredNew = newItems.filter((b) => !existingIds.has(b.id));
                    return [...prev, ...filteredNew];
                });
            }

            setHasMore(moreAvailable);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [statusFilter, sourceFilter, debouncedSearch]);

    // Reset and fetch page 1 on filter/search change
    useEffect(() => {
        fetchBookings(1, true);
    }, [statusFilter, sourceFilter, debouncedSearch, fetchBookings]);

    // Infinite scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300 &&
                hasMore &&
                !loadingMore &&
                !loading &&
                !isFetchingRef.current
            ) {
                fetchBookings(page + 1, false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, loadingMore, loading, page, fetchBookings]);

    const handleCreateDirectBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTurfId) {
            alert("Please select a turf.");
            return;
        }
        if (!bookingDate) {
            alert("Please select a date.");
            return;
        }
        if (!selectedSlot) {
            alert("Please select an available time slot.");
            return;
        }
        if (!customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        const slotParts = selectedSlot.split("-").map((s) => s.trim());
        const startTime = slotParts[0] || selectedSlot;
        const endTime = slotParts[1] || "";

        try {
            setSubmittingDirect(true);
            await api.post("/bookings/direct", {
                turfId: selectedTurfId,
                bookingDate,
                startTime,
                endTime,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim() || undefined,
                customPrice: customPrice !== "" ? Number(customPrice) : undefined,
                paymentMethod,
                notes: notes.trim() || undefined,
            });

            alert("Direct booking created successfully! The slot has been locked to prevent duplicate bookings.");
            setShowDirectModal(false);
            setCustomerName("");
            setCustomerPhone("");
            setSelectedSlot("");
            setNotes("");
            // Refresh bookings
            fetchBookings(1, true);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create direct booking");
        } finally {
            setSubmittingDirect(false);
        }
    };

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
            await fetchBookings(1, true);
        } catch (error: any) {
            alert(
                error.response?.data?.message ||
                    "Failed to update booking status",
            );
        } finally {
            setUpdatingBookingId(null);
        }
    };

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

    const selectedTurfObj = myTurfs.find((t) => t.id === selectedTurfId);
    const availableSlotsList = selectedTurfObj?.availableSlots || [];

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Turf Bookings
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage and review all bookings for your turfs
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setShowDirectModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E33E33] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
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
                        className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 font-bold text-sm"
                    >
                        <option value="all">All Sources</option>
                        <option value="online">Online App Bookings</option>
                        <option value="direct">Direct / Offline Only</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as BookingStatus | "all",
                            )
                        }
                        className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 font-bold text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customer, turf..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                    Customer & Source
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider w-1/4">
                                    Turf Details
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                    Schedule & Payment
                                </th>
                                <th className="py-5 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">
                                    Status Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && bookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-gray-500 font-medium animate-pulse"
                                    >
                                        Loading bookings...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-gray-500 font-medium"
                                    >
                                        No bookings match your current filters.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((b) => {
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
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                        >
                                            {/* Customer & Source */}
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">
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
                                                <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                                    {customerContact}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1.5">
                                                    ID: #{b.id.slice(0, 8)}
                                                </div>
                                            </td>

                                            {/* Turf Details */}
                                            <td className="py-5 px-6">
                                                <div className="font-bold text-gray-900 line-clamp-1">
                                                    {b.turf?.name || "Turf Facility"}
                                                </div>
                                                <div className="flex items-start text-xs text-gray-500 mt-1">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">
                                                        {b.turf?.address || "Address N/A"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Schedule & Payment */}
                                            <td className="py-5 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm font-bold text-gray-700">
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
                                                    <div className="flex items-center text-xs font-bold text-gray-600">
                                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                        {formatSlot12H(b.startTime, b.endTime)}
                                                    </div>
                                                    <div className="mt-1 flex items-baseline gap-2">
                                                        <span className="text-sm font-black text-[#E33E33]">
                                                            ₹{b.totalPrice}
                                                        </span>
                                                        {isDirect ? (
                                                            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                                                Offline (Not in Balance)
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
                                            <td className="py-5 px-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-black rounded-lg capitalize border ${getStatusStyle(b.status)}`}
                                                    >
                                                        {b.status}
                                                    </span>
                                                    {b.status !== "cancelled" && (
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
                                                            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50 border border-gray-200 bg-white shadow-xs cursor-pointer hover:bg-gray-50 transition-colors
                                                                ${updatingBookingId === b.id ? "animate-pulse" : ""}
                                                            `}
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {loadingMore && (
                    <div className="py-4 text-center text-xs font-bold text-gray-500 bg-gray-50/50 border-t border-gray-100 animate-pulse">
                        Loading more bookings...
                    </div>
                )}
            </div>

            {/* Direct Booking Modal */}
            {showDirectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    Mark Direct / Offline Booking
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Lock slot for walk-in or phone reservations
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDirectModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDirectBooking} className="p-6 space-y-5">
                            {/* Offline Notice Banner */}
                            <div className="p-3.5 bg-purple-50/80 border border-purple-200/60 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5">
                                <Store className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Offline Booking Notice:</span> Payment is collected directly by you outside the platform. This booking will <strong>not</strong> be added to your app wallet balance.
                                </div>
                            </div>

                            {/* Turf Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Select Turf
                                </label>
                                <select
                                    value={selectedTurfId}
                                    onChange={(e) => setSelectedTurfId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-sm"
                                >
                                    {myTurfs.map((turf) => (
                                        <option key={turf.id} value={turf.id}>
                                            {turf.name} (₹{turf.pricePerHour}/hr)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Picker */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Booking Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-sm"
                                />
                            </div>

                            {/* Slot Picker */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Select Time Slot (12-Hour)
                                    </label>
                                    {loadingSlots && (
                                        <span className="text-[11px] text-gray-400 animate-pulse">
                                            Checking availability...
                                        </span>
                                    )}
                                </div>

                                {availableSlotsList.length === 0 ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                        No slots configured for this turf. Please configure available slots first.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                                        {availableSlotsList.map((slot) => {
                                            const isBooked = bookedSlots.some(
                                                (b) =>
                                                    b === slot ||
                                                    b.replace(/\s/g, "") === slot.replace(/\s/g, ""),
                                            );
                                            const isSelected = selectedSlot === slot;
                                            const displaySlot = formatSlot12H(slot);

                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    disabled={isBooked}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                                        isBooked
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                                                            : isSelected
                                                            ? "bg-[#E33E33] text-white border-[#E33E33] shadow-xs"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {displaySlot}
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

                            {/* Customer Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Customer Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Sharma"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Customer Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Price & Payment Method */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Total Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Amount collected"
                                        value={customPrice}
                                        onChange={(e) =>
                                            setCustomPrice(
                                                e.target.value === "" ? "" : Number(e.target.value),
                                            )
                                        }
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Offline Payment Mode
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm"
                                    >
                                        <option value="cash">Cash at Venue</option>
                                        <option value="direct_upi">Direct UPI (To Owner)</option>
                                        <option value="offline">Other Offline</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Notes (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Phone booking, advance collected"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDirectModal(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDirect || !selectedSlot || !customerName.trim()}
                                    className="px-6 py-2.5 bg-[#E33E33] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                                >
                                    {submittingDirect ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Locking Slot...</span>
                                        </>
                                    ) : (
                                        <span>Confirm & Lock Slot</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
