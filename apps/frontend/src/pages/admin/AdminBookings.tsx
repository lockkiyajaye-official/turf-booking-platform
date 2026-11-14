import {
    ArrowUpDown,
    Calendar,
    CheckCircle2,
    Clock,
    MapPin,
    Store,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    AdminBadge,
    AdminEmptyState,
    AdminFilterBar,
    AdminModal,
    AdminPageHeader,
    AdminPagination,
    AdminStatCard,
} from "../../components/admin";
import api from "../../services/api";
import type { Booking, BookingStatus } from "./types";

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

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusTab, setStatusTab] = useState<string>("all");
    const [sourceTab, setSourceTab] = useState<"all" | "online" | "direct">("all");
    const [sortBy, setSortBy] = useState<"newest" | "slot_asc" | "slot_desc" | "amount_desc">(
        "newest",
    );
    // Status Update Modal
    const [bookingToUpdate, setBookingToUpdate] = useState<Booking | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<BookingStatus>("pending");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Feedback
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get("/bookings");
            const data = res.data;
            const items = Array.isArray(data) ? data : data?.items || [];
            setBookings(items);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            showFeedback("error", "Failed to load bookings log.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 3500);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!bookingToUpdate) return;
        if (bookingToUpdate.status === selectedNewStatus) {
            setBookingToUpdate(null);
            return;
        }
        try {
            setUpdatingStatus(true);
            await api.patch(`/bookings/${bookingToUpdate.id}/status`, {
                status: selectedNewStatus,
            });
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === bookingToUpdate.id ? { ...b, status: selectedNewStatus } : b,
                ),
            );
            showFeedback(
                "success",
                `Booking #${bookingToUpdate.id.slice(0, 8)} status updated to ${selectedNewStatus}.`,
            );
            setBookingToUpdate(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to update booking status",
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Stats
    const bookingCounts = useMemo(() => {
        const counts = {
            all: bookings.length,
            confirmed: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
        };
        bookings.forEach((b) => {
            if (counts[b.status] !== undefined) counts[b.status]++;
        });
        return counts;
    }, [bookings]);

    // Filter & Sort
    const filteredBookings = useMemo(() => {
        let list = [...bookings];

        if (statusTab !== "all") {
            list = list.filter((b) => b.status === statusTab);
        }

        if (sourceTab !== "all") {
            list = list.filter((b) => (b.bookingSource || "online") === sourceTab);
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            list = list.filter((b) => {
                const customer = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.toLowerCase();
                const directCustomer = (b.customerName || "").toLowerCase();
                const turfName = (b.turf?.name || "").toLowerCase();
                const turfAddr = (b.turf?.address || "").toLowerCase();
                const bookingId = (b.id || "").toLowerCase();
                const customerEmail = (b.user?.email || "").toLowerCase();
                const customerPhone = (b.customerPhone || b.user?.phone || "").toLowerCase();

                return (
                    customer.includes(term) ||
                    directCustomer.includes(term) ||
                    turfName.includes(term) ||
                    turfAddr.includes(term) ||
                    bookingId.includes(term) ||
                    customerEmail.includes(term) ||
                    customerPhone.includes(term)
                );
            });
        }

        list.sort((a, b) => {
            if (sortBy === "slot_asc") {
                return (
                    new Date(a.bookingDate).getTime() -
                    new Date(b.bookingDate).getTime()
                );
            }
            if (sortBy === "slot_desc") {
                return (
                    new Date(b.bookingDate).getTime() -
                    new Date(a.bookingDate).getTime()
                );
            }
            if (sortBy === "amount_desc") {
                return b.totalPrice - a.totalPrice;
            }
            return (
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        });

        return list;
    }, [bookings, statusTab, search, sortBy]);

    // Pagination slice
    const paginatedBookings = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredBookings.slice(start, start + pageSize);
    }, [filteredBookings, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Platform Bookings"
                description="Monitor all turf reservations, match times, financial amounts, and manual status overrides"
                badge={`${bookings.length} Total`}
            />

            {/* Notification alert banner */}
            {feedback && (
                <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 ${feedback.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                >
                    <span>{feedback.text}</span>
                    <button
                        onClick={() => setFeedback(null)}
                        className="text-xs opacity-75 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <AdminStatCard
                    title="Confirmed"
                    value={bookingCounts.confirmed}
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    description="Active confirmed matches"
                />
                <AdminStatCard
                    title="Pending"
                    value={bookingCounts.pending}
                    icon={Clock}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                    description="Awaiting payment confirmation"
                />
                <AdminStatCard
                    title="Completed"
                    value={bookingCounts.completed}
                    icon={Calendar}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                    description="Concluded game sessions"
                />
                <AdminStatCard
                    title="Cancelled"
                    value={bookingCounts.cancelled}
                    icon={XCircle}
                    iconColor="text-rose-600"
                    iconBg="bg-rose-50"
                    description="Refunded / aborted slots"
                />
            </div>

            {/* Filters Toolbar */}
            <AdminFilterBar
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search customer, turf, phone, or Booking ID..."
                tabs={[
                    { id: "all", label: "All Bookings", count: bookingCounts.all },
                    { id: "confirmed", label: "Confirmed", count: bookingCounts.confirmed },
                    { id: "pending", label: "Pending", count: bookingCounts.pending },
                    { id: "completed", label: "Completed", count: bookingCounts.completed },
                    { id: "cancelled", label: "Cancelled", count: bookingCounts.cancelled },
                ]}
                activeTab={statusTab}
                onTabChange={(tab) => {
                    setStatusTab(tab);
                    setCurrentPage(1);
                }}
                hasActiveFilters={Boolean(search || statusTab !== "all" || sourceTab !== "all" || sortBy !== "newest")}
                onResetFilters={() => {
                    setSearch("");
                    setStatusTab("all");
                    setSourceTab("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                }}
                rightSlot={
                    <div className="flex items-center gap-2">
                        <select
                            value={sourceTab}
                            onChange={(e) => {
                                setSourceTab(
                                    e.target.value as "all" | "online" | "direct",
                                );
                                setCurrentPage(1);
                            }}
                            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-200"
                        >
                            <option value="all">All Channels</option>
                            <option value="online">Online App Only</option>
                            <option value="direct">Direct / Offline Only</option>
                        </select>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    e.target.value as
                                    | "newest"
                                    | "slot_asc"
                                    | "slot_desc"
                                    | "amount_desc",
                                )
                            }
                            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-200"
                        >
                            <option value="newest">Created: Newest First</option>
                            <option value="slot_asc">Match Date: Earliest First</option>
                            <option value="slot_desc">Match Date: Latest First</option>
                            <option value="amount_desc">Amount: Highest First</option>
                        </select>
                    </div>
                }
            />

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm animate-pulse">
                        Loading booking log...
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <AdminEmptyState
                        title="No bookings match your criteria"
                        description="Try clearing your search query or selecting 'All Bookings'."
                        onResetFilters={() => {
                            setSearch("");
                            setStatusTab("all");
                        }}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-5">Booking Reference</th>
                                        <th className="py-3 px-5">Arena Facility</th>
                                        <th className="py-3 px-5">Customer Profile</th>
                                        <th className="py-3 px-5">Schedule & Rate</th>
                                        <th className="py-3 px-5 text-right">Status & Override</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {paginatedBookings.map((b) => {
                                        const isDirect = b.bookingSource === "direct";
                                        const initials = isDirect
                                            ? "DB"
                                            : `${b.user?.firstName?.charAt(0) || ""}${b.user?.lastName?.charAt(0) || ""}`.toUpperCase() ||
                                              "C";
                                        const customerName = isDirect
                                            ? b.customerName || "Direct Customer"
                                            : `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim() || "Player";
                                        const customerContact = isDirect
                                            ? b.customerPhone || "Direct Walk-in"
                                            : b.user?.phone || b.user?.email || "—";

                                        return (
                                            <tr
                                                key={b.id}
                                                className="hover:bg-gray-50/70 transition-colors"
                                            >
                                                {/* Booking Ref */}
                                                <td className="py-3.5 px-5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60">
                                                                #{b.id.slice(0, 8)}
                                                            </span>
                                                            {isDirect ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                                    <Store className="w-2.5 h-2.5" />
                                                                    Direct
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                                    Online
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">
                                                            Booked on{" "}
                                                            {new Date(
                                                                b.createdAt,
                                                            ).toLocaleDateString("en-IN", {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Turf Info */}
                                                <td className="py-3.5 px-5">
                                                    <div className="space-y-0.5 max-w-xs">
                                                        <p className="font-bold text-gray-900 line-clamp-1">
                                                            {b.turf?.name || "Facility"}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 flex items-center gap-1 line-clamp-1">
                                                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                                            <span>{b.turf?.address || "Address N/A"}</span>
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`w-8 h-8 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${
                                                                isDirect
                                                                    ? "bg-purple-50 border-purple-200 text-purple-700"
                                                                    : "bg-blue-50 border-blue-200 text-blue-700"
                                                            }`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">
                                                                {customerName}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500">
                                                                {customerContact}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Schedule & Price */}
                                                <td className="py-3.5 px-5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs">
                                                            <Calendar className="w-3.5 h-3.5 text-[#E33E33]" />
                                                            <span>
                                                                {new Date(
                                                                    b.bookingDate,
                                                                ).toLocaleDateString("en-IN", {
                                                                    weekday: "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span>
                                                                {formatSlot12H(b.startTime, b.endTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-gray-900 text-xs">
                                                                ₹{b.totalPrice.toLocaleString("en-IN")}
                                                            </span>
                                                            {isDirect ? (
                                                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                                    Offline (Not in Balance)
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                                    Online Platform
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status & Override */}
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <AdminBadge status={b.status} />
                                                        <button
                                                            onClick={() => {
                                                                setBookingToUpdate(b);
                                                                setSelectedNewStatus(b.status);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                                                            title="Update booking status"
                                                        >
                                                            Update Status
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <AdminPagination
                            currentPage={currentPage}
                            totalItems={filteredBookings.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </>
                )}
            </div>

            {/* Status Update Modal */}
            <AdminModal
                isOpen={Boolean(bookingToUpdate)}
                onClose={() => setBookingToUpdate(null)}
                title="Update Booking Status"
                description={
                    bookingToUpdate
                        ? `Booking #${bookingToUpdate.id.slice(0, 8)} for ${bookingToUpdate.turf?.name || "Facility"}`
                        : undefined
                }
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select New Status
                        </label>
                        <select
                            value={selectedNewStatus}
                            onChange={(e) =>
                                setSelectedNewStatus(e.target.value as BookingStatus)
                            }
                            className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                        >
                            <option value="pending">Pending (Awaiting payment / verification)</option>
                            <option value="confirmed">Confirmed (Slot reserved & active)</option>
                            <option value="completed">Completed (Match concluded)</option>
                            <option value="cancelled">Cancelled (Slot aborted or refunded)</option>
                        </select>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                        <span>Current Booking Status:</span>
                        <strong className="text-gray-800 uppercase font-bold">
                            {bookingToUpdate?.status}
                        </strong>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setBookingToUpdate(null)}
                            disabled={updatingStatus}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmStatusUpdate}
                            disabled={updatingStatus || selectedNewStatus === bookingToUpdate?.status}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#E33E33] hover:bg-[#c9352b] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {updatingStatus && (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Confirm Status Update</span>
                        </button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
