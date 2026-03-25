import {
    CheckCircle,
    Clock,
    CreditCard,
    Search,
    ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">(
        "all",
    );
    const [search, setSearch] = useState("");
    const [notesUpdate, setNotesUpdate] = useState<Record<string, string>>({});
    const [statusUpdate, setStatusUpdate] = useState<
        Record<string, PayoutStatus>
    >({});

    useEffect(() => {
        fetchData();
        fetchPayouts(statusFilter);
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            const res = await api.get("/payments/admin/summary");
            setSummary(res.data.payments);
            setStats(res.data.payouts);
        } catch (error) {
            console.error("Failed to fetch payment summary:", error);
        }
    };

    const fetchPayouts = async (status: PayoutStatus | "all") => {
        try {
            setLoading(true);
            const res = await api.get("/payments/admin/payouts", {
                params: status === "all" ? {} : { status },
            });
            setPayouts(res.data);
        } catch (error) {
            console.error("Failed to fetch payouts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePayout = async (payout: AdminPayout) => {
        const newStatus = statusUpdate[payout.id];
        const notes = notesUpdate[payout.id] || "";

        if (!newStatus) {
            alert("Please select a status");
            return;
        }

        try {
            await api.patch(`/payments/admin/payouts/${payout.id}`, {
                status: newStatus,
                notes,
            });
            alert("Payout updated successfully");
            await fetchData();
            await fetchPayouts(statusFilter);
            setStatusUpdate((prev) => {
                const next = { ...prev };
                delete next[payout.id];
                return next;
            });
            setNotesUpdate((prev) => {
                const next = { ...prev };
                delete next[payout.id];
                return next;
            });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update payout");
        }
    };

    const filteredPayouts = useMemo(() => {
        if (!search.trim()) return payouts;
        const term = search.toLowerCase();
        return payouts.filter(
            (p) =>
                (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
                (p.ownerEmail && p.ownerEmail.toLowerCase().includes(term)) ||
                p.id.toLowerCase().includes(term),
        );
    }, [payouts, search]);

    if (!summary || !stats) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading payments...
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Financial Overview
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Manage platform payments and turf owner payouts
                </p>
            </div>

            {/* Platform Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Total Volume
                    </p>
                    <p className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        <CreditCard className="text-[#E33E33] w-6 h-6" /> ₹
                        {summary.totalVolume.toFixed(2)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Total Transactions
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                        {summary.totalCount}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Platform Success
                    </p>
                    <p className="text-3xl font-black text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />{" "}
                        {summary.successCount}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Failed Attempts
                    </p>
                    <p className="text-3xl font-black text-amber-500 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" />{" "}
                        {summary.failedCount}
                    </p>
                </div>
            </div>

            {/* Payout Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Owner Payout Requests
                        </h2>
                        <div className="flex gap-4 mt-2 text-sm font-medium">
                            <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                                Requested: ₹
                                {stats.totalRequestedAmount.toFixed(2)}
                            </span>
                            <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                Completed: ₹
                                {stats.totalCompletedAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as PayoutStatus | "all",
                                )
                            }
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                            <option value="all">All Payouts</option>
                            <option value="requested">Requested</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search owners..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">
                            Loading requests...
                        </div>
                    ) : filteredPayouts.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 font-medium">
                            No payouts found matching the criteria.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                        Date & Details
                                    </th>
                                    <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                        Owner Info
                                    </th>
                                    <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="py-4 px-6 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                        Process Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayouts.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {new Date(
                                                    p.createdAt,
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono">
                                                ID: {p.id.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900">
                                                {p.ownerName || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {p.ownerEmail ||
                                                    p.ownerId.slice(0, 8)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-lg font-black text-[#E33E33]">
                                                ₹{p.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {p.status === "requested" ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={
                                                                statusUpdate[
                                                                    p.id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setStatusUpdate(
                                                                    {
                                                                        ...statusUpdate,
                                                                        [p.id]: e
                                                                            .target
                                                                            .value as PayoutStatus,
                                                                    },
                                                                )
                                                            }
                                                            className="text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-100"
                                                        >
                                                            <option
                                                                value=""
                                                                disabled
                                                            >
                                                                Select Action
                                                            </option>
                                                            <option value="completed">
                                                                Complete Payout
                                                            </option>
                                                            <option value="rejected">
                                                                Reject Request
                                                            </option>
                                                        </select>
                                                        <button
                                                            onClick={() =>
                                                                handleUpdatePayout(
                                                                    p,
                                                                )
                                                            }
                                                            disabled={
                                                                !statusUpdate[
                                                                    p.id
                                                                ]
                                                            }
                                                            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-[#E33E33] transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Optional notes (e.g. UTR number)"
                                                        value={
                                                            notesUpdate[p.id] ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setNotesUpdate({
                                                                ...notesUpdate,
                                                                [p.id]: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="text-xs border border-gray-200 bg-white rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#E33E33]"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-bold rounded capitalize ${
                                                            p.status ===
                                                            "completed"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {p.status}
                                                    </span>
                                                    {p.processedAt && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(
                                                                p.processedAt,
                                                            ).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
