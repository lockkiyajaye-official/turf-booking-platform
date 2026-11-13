import {
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    ShieldAlert,
    Wallet,
    Percent,
    Save,
    Calculator,
    Info,
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

    // Fee & Commission Settings state
    const [platformFeePercent, setPlatformFeePercent] = useState<number>(5.0);
    const [gatewayFeePercent, setGatewayFeePercent] = useState<number>(2.0);
    const [gatewayGstPercent, setGatewayGstPercent] = useState<number>(18.0);
    const [savingSettings, setSavingSettings] = useState(false);
    const [simulatedBaseRate, setSimulatedBaseRate] = useState<number>(1200);

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
        fetchFeeSettings();
    }, []);

    const fetchFeeSettings = async () => {
        try {
            const res = await api.get("/payments/admin/settings");
            if (res.data) {
                setPlatformFeePercent(Number(res.data.platformFeePercent ?? 5.0));
                setGatewayFeePercent(Number(res.data.gatewayFeePercent ?? 2.0));
                setGatewayGstPercent(Number(res.data.gatewayGstPercent ?? 18.0));
            }
        } catch (error) {
            console.error("Failed to fetch platform fee settings:", error);
        }
    };

    const handleSaveFeeSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingSettings(true);
            await api.patch("/payments/admin/settings", {
                platformFeePercent: Number(platformFeePercent),
                gatewayFeePercent: Number(gatewayFeePercent),
                gatewayGstPercent: Number(gatewayGstPercent),
            });
            showFeedback("success", "Platform fee and gateway rates saved successfully!");
        } catch (error: any) {
            showFeedback("error", error.response?.data?.message || "Failed to update fee settings.");
        } finally {
            setSavingSettings(false);
        }
    };

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
            const res = await api.get("/payments/admin/payouts", { params: { limit: 100 } });
            const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
            setPayouts(items);
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

            {/* Payment Charges & Commission Configuration Card */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-50 text-[#E33E33] rounded-lg">
                            <Percent className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Payment Charges & Platform Commission Architecture
                            </h3>
                            <p className="text-xs text-gray-500">
                                Configure default platform fee and Razorpay gateway fees applied to turf bookings
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                        Supports Per-Owner Overrides
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Form Controls */}
                    <form onSubmit={handleSaveFeeSettings} className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Platform Fee (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={platformFeePercent}
                                        onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                                        required
                                    />
                                    <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Default platform revenue share</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Gateway Fee (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={gatewayFeePercent}
                                        onChange={(e) => setGatewayFeePercent(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                                        required
                                    />
                                    <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Razorpay base charge (2%)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    GST on Gateway (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="28"
                                        value={gatewayGstPercent}
                                        onChange={(e) => setGatewayGstPercent(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                                        required
                                    />
                                    <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">18% GST on the 2% fee</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-amber-900 leading-relaxed">
                                <strong>Individual Partner Rates:</strong> You can set custom commission rates for individual turf owners on the{" "}
                                <a href="/admin/turf-owners" className="font-bold underline text-amber-950">
                                    Turf Owners Management
                                </a>{" "}
                                page. If a turf owner has a custom rate set, it overrides the global platform fee above.
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E33E33] hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {savingSettings ? "Saving Settings..." : "Save Default Fee Rates"}
                            </button>
                        </div>
                    </form>

                    {/* Live Calculator Preview */}
                    <div className="lg:col-span-5 bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                                <Calculator className="w-3.5 h-3.5 text-gray-500" />
                                Live Booking Breakdown Simulator
                            </span>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-500 text-[11px]">Base:</span>
                                <input
                                    type="number"
                                    value={simulatedBaseRate}
                                    onChange={(e) => setSimulatedBaseRate(parseFloat(e.target.value) || 0)}
                                    className="w-16 px-1.5 py-0.5 text-xs font-bold font-mono text-right bg-white border border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        {(() => {
                            const simBase = Number(simulatedBaseRate) || 0;
                            const simPlatform = Math.round(simBase * (Number(platformFeePercent) / 100) * 100) / 100;
                            const effectiveGatewayRate = Number(gatewayFeePercent) * (1 + Number(gatewayGstPercent) / 100);
                            const simGateway = Math.round((simBase + simPlatform) * (effectiveGatewayRate / 100) * 100) / 100;
                            const simTotal = Math.round((simBase + simPlatform + simGateway) * 100) / 100;

                            return (
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Turf Slot Price</span>
                                        <span className="font-mono font-medium">₹{simBase.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Platform Charge ({platformFeePercent}%)</span>
                                        <span className="font-mono font-medium text-purple-700">+₹{simPlatform.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Razorpay Gateway ({(effectiveGatewayRate).toFixed(2)}% incl. GST)</span>
                                        <span className="font-mono font-medium text-blue-700">+₹{simGateway.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-gray-900 text-sm">
                                        <span>Customer Pays Total</span>
                                        <span className="text-[#E33E33] font-mono">₹{simTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex justify-between font-semibold mt-2">
                                        <span>Credited to Owner's Wallet:</span>
                                        <span className="font-mono font-bold">₹{simBase.toFixed(2)}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

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
