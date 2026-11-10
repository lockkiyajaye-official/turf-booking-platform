import {
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    ShieldAlert,
    Wallet,
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
import type {
    AdminPaymentSummary,
    AdminPayout,
    AdminPayoutStats,
    PayoutStatus,
} from "./types";

export default function AdminPayments() {
    const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
    const [stats, setStats] = useState<AdminPayoutStats | null>(null);
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">("all");
    const [search, setSearch] = useState("");

    // Processing Payout Modal
    const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
    const [processAction, setProcessAction] = useState<"completed" | "rejected">("completed");
    const [processNotes, setProcessNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Feedback
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchData();
        fetchPayouts();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/payments/admin/summary");
            setSummary(res.data.payments);
            setStats(res.data.payouts);
        } catch (error) {
            console.error("Failed to fetch payment summary:", error);
            showFeedback("error", "Failed to fetch financial summary.");
        }
    };

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payments/admin/payouts");
            setPayouts(res.data || []);
        } catch (error) {
            console.error("Failed to fetch payouts:", error);
            showFeedback("error", "Failed to load owner payout requests.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 3500);
    };

    const handleOpenProcessModal = (payout: AdminPayout) => {
        setSelectedPayout(payout);
        setProcessAction("completed");
        setProcessNotes("");
    };

    const handleConfirmProcess = async () => {
        if (!selectedPayout) return;

        try {
            setProcessing(true);
            await api.patch(`/payments/admin/payouts/${selectedPayout.id}`, {
                status: processAction,
                notes: processNotes.trim(),
            });
            showFeedback(
                "success",
                `Payout of ₹${selectedPayout.amount} marked as ${processAction}.`,
            );
            await fetchData();
            await fetchPayouts();
            setSelectedPayout(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to update payout status",
            );
        } finally {
            setProcessing(false);
        }
    };

    // Payout counts
    const payoutCounts = useMemo(() => {
        const counts = {
            all: payouts.length,
            requested: 0,
            completed: 0,
            rejected: 0,
        };
        payouts.forEach((p) => {
            if (counts[p.status] !== undefined) counts[p.status]++;
        });
        return counts;
    }, [payouts]);

    // Filtered payouts
    const filteredPayouts = useMemo(() => {
        let list = [...payouts];

        if (statusFilter !== "all") {
            list = list.filter((p) => p.status === statusFilter);
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
                    (p.ownerEmail && p.ownerEmail.toLowerCase().includes(term)) ||
                    p.id.toLowerCase().includes(term),
            );
        }

        return list;
    }, [payouts, statusFilter, search]);

    // Pagination slice
    const paginatedPayouts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPayouts.slice(start, start + pageSize);
    }, [filteredPayouts, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Financial Overview & Payouts"
                description="Platform transaction volumes, payment gateway success rates, and partner withdrawal requests"
                badge="Treasury Log"
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

            {/* Financial Overview Cards */}
            {summary && stats ? (
                <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        Gateway & Volume Metrics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <AdminStatCard
                            title="Total Volume"
                            value={`₹${summary.totalVolume.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                            icon={DollarSign}
                            iconColor="text-gray-900"
                            iconBg="bg-gray-100"
                            description={`${summary.totalCount} total charges`}
                        />
                        <AdminStatCard
                            title="Successful Payments"
                            value={summary.successCount}
                            icon={CheckCircle2}
                            iconColor="text-emerald-600"
                            iconBg="bg-emerald-50"
                            trend={{
                                value: `${summary.totalCount > 0 ? Math.round((summary.successCount / summary.totalCount) * 100) : 0}% success`,
                                isPositive: true,
                            }}
                        />
                        <AdminStatCard
                            title="Failed Transactions"
                            value={summary.failedCount}
                            icon={ShieldAlert}
                            iconColor="text-rose-600"
                            iconBg="bg-rose-50"
                            trend={{
                                value: summary.failedCount > 0 ? "Requires review" : "Optimal",
                                isPositive: summary.failedCount === 0,
                            }}
                        />
                        <AdminStatCard
                            title="Pending Payouts"
                            value={`₹${stats.totalRequestedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                            icon={Clock}
                            iconColor="text-amber-600"
                            iconBg="bg-amber-50"
                            description={`${stats.requestedCount} claims waiting`}
                        />
                        <AdminStatCard
                            title="Disbursed Volume"
                            value={`₹${stats.totalCompletedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                            icon={Wallet}
                            iconColor="text-indigo-600"
                            iconBg="bg-indigo-50"
                            description={`${stats.completedCount} transfers settled`}
                        />
                    </div>
                </div>
            ) : null}

            {/* Payout Management Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#E33E33]" />
                        Turf Owner Withdrawal Requests
                    </h2>
                </div>

                {/* Filter Bar */}
                <AdminFilterBar
                    search={search}
                    onSearchChange={(val) => {
                        setSearch(val);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search by owner name, email, or payout ID..."
                    tabs={[
                        { id: "all", label: "All Requests", count: payoutCounts.all },
                        { id: "requested", label: "Pending Claims", count: payoutCounts.requested },
                        { id: "completed", label: "Completed", count: payoutCounts.completed },
                        { id: "rejected", label: "Rejected", count: payoutCounts.rejected },
                    ]}
                    activeTab={statusFilter}
                    onTabChange={(tab) => {
                        setStatusFilter(tab as PayoutStatus | "all");
                        setCurrentPage(1);
                    }}
                    hasActiveFilters={Boolean(search || statusFilter !== "all")}
                    onResetFilters={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setCurrentPage(1);
                    }}
                />

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 text-sm animate-pulse">
                            Loading withdrawal claims...
                        </div>
                    ) : filteredPayouts.length === 0 ? (
                        <AdminEmptyState
                            title="No payout requests found"
                            description="Try changing the status tab or searching for another partner."
                            onResetFilters={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[760px]">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3 px-5">Claim ID & Date</th>
                                            <th className="py-3 px-5">Partner Information</th>
                                            <th className="py-3 px-5">Withdrawal Amount</th>
                                            <th className="py-3 px-5">Status</th>
                                            <th className="py-3 px-5 text-right">Process Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                        {paginatedPayouts.map((p) => {
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="hover:bg-gray-50/70 transition-colors"
                                                >
                                                    {/* Date & ID */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs">
                                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                <span>
                                                                    {new Date(
                                                                        p.createdAt,
                                                                    ).toLocaleDateString("en-IN", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year: "numeric",
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <p className="font-mono text-[10px] text-gray-400">
                                                                #{p.id.slice(0, 8)}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Owner */}
                                                    <td className="py-3.5 px-5">
                                                        <div>
                                                            <p className="font-bold text-gray-900">
                                                                {p.ownerName || "Partner"}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500">
                                                                {p.ownerEmail || p.ownerId.slice(0, 8)}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="py-3.5 px-5 font-black text-gray-900 text-sm sm:text-base">
                                                        ₹
                                                        {p.amount.toLocaleString("en-IN", {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-5">
                                                        <div className="space-y-1">
                                                            <AdminBadge status={p.status} />
                                                            {p.processedAt && (
                                                                <p className="text-[10px] text-gray-400">
                                                                    Processed{" "}
                                                                    {new Date(
                                                                        p.processedAt,
                                                                    ).toLocaleDateString("en-IN")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="py-3.5 px-5 text-right">
                                                        {p.status === "requested" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenProcessModal(p)
                                                                }
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-[#E33E33] rounded-lg transition-colors shadow-xs"
                                                            >
                                                                <span>Process Claim</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                Settled
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination
                                currentPage={currentPage}
                                totalItems={filteredPayouts.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={setPageSize}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Payout Processing Modal */}
            <AdminModal
                isOpen={Boolean(selectedPayout)}
                onClose={() => setSelectedPayout(null)}
                title="Process Partner Withdrawal"
                description={
                    selectedPayout
                        ? `Claim of ₹${selectedPayout.amount} from ${selectedPayout.ownerName || "Partner"}`
                        : undefined
                }
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                        <p className="text-gray-500">
                            <strong>Partner:</strong> {selectedPayout?.ownerName}
                        </p>
                        <p className="text-gray-500">
                            <strong>Email:</strong> {selectedPayout?.ownerEmail || "—"}
                        </p>
                        <p className="text-gray-900 font-black text-sm pt-1">
                            Amount: ₹{selectedPayout?.amount.toLocaleString("en-IN")}
                        </p>
                    </div>

                    {/* Partner Payout Account Details */}
                    {selectedPayout?.payoutDetails && (
                        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                            <p className="font-bold text-indigo-900 uppercase tracking-wider text-[11px]">
                                Partner Payout Account Details
                            </p>
                            {selectedPayout.payoutDetails.bankAccountNumber ? (
                                <>
                                    <p className="text-gray-700">
                                        <strong>Account Holder:</strong>{" "}
                                        {selectedPayout.payoutDetails.accountHolderName || "—"}
                                    </p>
                                    {selectedPayout.payoutDetails.bankName && (
                                        <p className="text-gray-700">
                                            <strong>Bank Name:</strong>{" "}
                                            {selectedPayout.payoutDetails.bankName}
                                        </p>
                                    )}
                                    <p className="text-gray-700">
                                        <strong>Account Number:</strong>{" "}
                                        <span className="font-mono font-bold">
                                            {selectedPayout.payoutDetails.bankAccountNumber}
                                        </span>
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>IFSC Code:</strong>{" "}
                                        <span className="font-mono font-bold">
                                            {selectedPayout.payoutDetails.ifscCode || "—"}
                                        </span>
                                    </p>
                                </>
                            ) : null}
                            {selectedPayout.payoutDetails.upiId && (
                                <p className="text-gray-700">
                                    <strong>UPI ID:</strong>{" "}
                                    <span className="font-mono font-bold">
                                        {selectedPayout.payoutDetails.upiId}
                                    </span>
                                </p>
                            )}
                            {!selectedPayout.payoutDetails.bankAccountNumber &&
                                !selectedPayout.payoutDetails.upiId && (
                                    <p className="text-amber-700">
                                        No bank account or UPI details saved by partner yet.
                                    </p>
                                )}
                        </div>
                    )}

                    {/* Action Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select Action
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setProcessAction("completed")}
                                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${processAction === "completed"
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                ✓ Complete Payout
                            </button>
                            <button
                                type="button"
                                onClick={() => setProcessAction("rejected")}
                                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${processAction === "rejected"
                                        ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-100"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                ✕ Reject Request
                            </button>
                        </div>
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Transaction Reference / Notes
                        </label>
                        <input
                            type="text"
                            value={processNotes}
                            onChange={(e) => setProcessNotes(e.target.value)}
                            placeholder="e.g. Bank UTR reference, NEFT number, or rejection reason"
                            className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                        />
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setSelectedPayout(null)}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmProcess}
                            disabled={processing}
                            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 ${processAction === "completed"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-rose-600 hover:bg-rose-700"
                                }`}
                        >
                            {processing && (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {processAction === "completed"
                                ? "Confirm Completed"
                                : "Confirm Rejection"}
                        </button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
