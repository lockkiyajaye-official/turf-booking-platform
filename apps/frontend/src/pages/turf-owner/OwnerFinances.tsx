import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    TrendingUp,
    Wallet,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import type { WalletSummary } from "./types";

export default function OwnerFinances() {
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const response = await api.get("/payments/owner/summary");
            setWallet(response.data);
        } catch (error) {
            console.error("Failed to fetch wallet summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payoutAmount) return;

        const amountNumber = Number(payoutAmount);
        if (!amountNumber || amountNumber <= 0) {
            alert("Please enter a valid payout amount.");
            return;
        }

        if (wallet && amountNumber > wallet.walletBalance) {
            alert("Insufficient wallet balance.");
            return;
        }

        try {
            setRequesting(true);
            const response = await api.post("/payments/owner/payouts", {
                amount: amountNumber,
            });
            setWallet(response.data);
            setPayoutAmount("");
            alert(
                "Payout requested successfully. Our team will process it soon.",
            );
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to request payout");
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-screen">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading wallet data...
                </span>
            </div>
        );
    }

    if (!wallet) return null;

    return (
        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Finances & Payouts
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Manage your turf earnings and request withdrawals
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#E33E33] to-red-600 rounded-3xl shadow-sm text-white p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-red-100 font-bold tracking-wide uppercase text-sm">
                                Available Balance
                            </h2>
                            <Wallet className="w-6 h-6 text-white/50" />
                        </div>
                        <p className="text-5xl font-black mb-1">
                            ₹{wallet.walletBalance.toFixed(2)}
                        </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-red-500/30 flex items-center justify-between text-red-100 text-sm font-medium">
                        <span>Withdrawal ready</span>
                        <span>0% platform fee</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-gray-400 font-bold tracking-wide uppercase text-sm">
                                Total Earnings
                            </h2>
                            <TrendingUp className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-1">
                            ₹{wallet.totalEarnings.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm font-medium mt-2">
                            All-time revenue generated
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-gray-400 font-bold tracking-wide uppercase text-sm">
                                Total Withdrawn
                            </h2>
                            <Download className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-1">
                            ₹{wallet.totalPayouts.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm font-medium mt-2">
                            Completed payouts
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Payout Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-black text-gray-900 mb-6">
                            Request Payout
                        </h3>
                        <form
                            onSubmit={handlePayoutRequest}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Withdrawal Amount (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={wallet.walletBalance}
                                        step="0.01"
                                        required
                                        value={payoutAmount}
                                        onChange={(e) =>
                                            setPayoutAmount(e.target.value)
                                        }
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-lg transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs font-semibold text-gray-500">
                                        Max available: ₹
                                        {wallet.walletBalance.toFixed(2)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPayoutAmount(
                                                wallet.walletBalance.toString(),
                                            )
                                        }
                                        className="text-xs font-bold text-[#E33E33] hover:underline"
                                    >
                                        Max Amount
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    requesting ||
                                    wallet.walletBalance <= 0 ||
                                    Number(payoutAmount) <= 0 ||
                                    Number(payoutAmount) > wallet.walletBalance
                                }
                                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                            >
                                {requesting
                                    ? "Processing..."
                                    : "Withdraw Funds"}
                            </button>
                        </form>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                Payout requests are usually processed within 2-3
                                business days. Funds will be transferred to your
                                registered bank account.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payout History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-black text-gray-900">
                                Payout History
                            </h3>
                        </div>
                        <div className="p-0">
                            {wallet.payouts.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium tracking-wide">
                                        No payout requests have been made yet.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {wallet.payouts.map((payout) => (
                                        <li
                                            key={payout.id}
                                            className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                        payout.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-600"
                                                            : payout.status ===
                                                                "rejected"
                                                              ? "bg-red-100 text-red-600"
                                                              : "bg-amber-100 text-amber-600"
                                                    }`}
                                                >
                                                    {payout.status ===
                                                    "completed" ? (
                                                        <CheckCircle className="w-6 h-6" />
                                                    ) : payout.status ===
                                                      "rejected" ? (
                                                        <XCircle className="w-6 h-6" />
                                                    ) : (
                                                        <Clock className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        ₹
                                                        {payout.amount.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <span>
                                                            {new Date(
                                                                payout.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        <span className="mx-2">
                                                            •
                                                        </span>
                                                        <span className="font-mono text-xs text-gray-400">
                                                            ID:{" "}
                                                            {payout.id.slice(
                                                                0,
                                                                8,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex px-3 py-1 text-xs font-black rounded uppercase tracking-wider ${
                                                        payout.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-700 border border-green-200"
                                                            : payout.status ===
                                                                "rejected"
                                                              ? "bg-red-100 text-red-700 border border-red-200"
                                                              : "bg-amber-100 text-amber-700 border border-amber-200"
                                                    }`}
                                                >
                                                    {payout.status}
                                                </span>
                                                {payout.processedAt && (
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-2">
                                                        Processed:{" "}
                                                        {new Date(
                                                            payout.processedAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
