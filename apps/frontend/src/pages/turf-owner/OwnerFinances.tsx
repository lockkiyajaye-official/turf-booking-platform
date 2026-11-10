import {
    AlertCircle,
    Building2,
    CheckCircle,
    Clock,
    Download,
    Eye,
    EyeOff,
    ShieldCheck,
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

    // Payout details state
    const [accountHolderName, setAccountHolderName] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [upiId, setUpiId] = useState("");
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [savingDetails, setSavingDetails] = useState(false);

    // Feedback notifications
    const [detailsFeedback, setDetailsFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [payoutFeedback, setPayoutFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const response = await api.get("/payments/owner/summary");
            const data: WalletSummary = response.data;
            setWallet(data);

            if (data.payoutDetails) {
                const p = data.payoutDetails;
                setAccountHolderName(p.accountHolderName || "");
                setBankName(p.bankName || "");
                setBankAccountNumber(p.bankAccountNumber || "");
                setConfirmAccountNumber(p.bankAccountNumber || "");
                setIfscCode(p.ifscCode || "");
                setUpiId(p.upiId || "");

                const hasExisting = Boolean(
                    (p.bankAccountNumber && p.ifscCode) || p.upiId,
                );
                setIsEditingDetails(!hasExisting);
            } else {
                setIsEditingDetails(true);
            }
        } catch (error) {
            console.error("Failed to fetch wallet summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const hasPayoutDetails = Boolean(
        (wallet?.payoutDetails?.bankAccountNumber &&
            wallet?.payoutDetails?.ifscCode) ||
            wallet?.payoutDetails?.upiId,
    );

    const maskAccountNumber = (acc: string) => {
        const trimmed = acc.trim();
        if (trimmed.length <= 4) return trimmed;
        return `•••• •••• ${trimmed.slice(-4)}`;
    };

    const handleSavePayoutDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setDetailsFeedback(null);

        const acc = bankAccountNumber.trim();
        const confirmAcc = confirmAccountNumber.trim();
        const ifsc = ifscCode.trim().toUpperCase();
        const upi = upiId.trim();
        const holder = accountHolderName.trim();
        const bank = bankName.trim();

        const hasBank = Boolean(acc && ifsc);
        const hasUpi = Boolean(upi);

        if (!hasBank && !hasUpi) {
            setDetailsFeedback({
                type: "error",
                text: "Please provide either Bank Account Number & IFSC Code, or a valid UPI ID.",
            });
            return;
        }

        if (acc && acc !== confirmAcc) {
            setDetailsFeedback({
                type: "error",
                text: "Bank account numbers do not match.",
            });
            return;
        }

        if (hasBank && !holder) {
            setDetailsFeedback({
                type: "error",
                text: "Please enter the account holder name.",
            });
            return;
        }

        try {
            setSavingDetails(true);
            const response = await api.patch("/payments/owner/payout-details", {
                accountHolderName: holder,
                bankName: bank,
                bankAccountNumber: acc,
                ifscCode: ifsc,
                upiId: upi,
            });
            setWallet(response.data);
            setIsEditingDetails(false);
            setDetailsFeedback({
                type: "success",
                text: "Payout account details saved successfully!",
            });
            setTimeout(() => setDetailsFeedback(null), 4000);
        } catch (error: any) {
            setDetailsFeedback({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to save payout account details.",
            });
        } finally {
            setSavingDetails(false);
        }
    };

    const handlePayoutRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayoutFeedback(null);
        if (!payoutAmount) return;

        if (!hasPayoutDetails) {
            setIsEditingDetails(true);
            setPayoutFeedback({
                type: "error",
                text: "Please add and save your payout account details first before withdrawing funds.",
            });
            return;
        }

        const amountNumber = Number(payoutAmount);
        if (!amountNumber || amountNumber <= 0) {
            setPayoutFeedback({
                type: "error",
                text: "Please enter a valid payout amount.",
            });
            return;
        }

        if (wallet && amountNumber > wallet.walletBalance) {
            setPayoutFeedback({
                type: "error",
                text: "Insufficient wallet balance.",
            });
            return;
        }

        try {
            setRequesting(true);
            const response = await api.post("/payments/owner/payouts", {
                amount: amountNumber,
            });
            setWallet(response.data);
            setPayoutAmount("");
            setPayoutFeedback({
                type: "success",
                text: "Payout requested successfully! Our team will process it soon.",
            });
            setTimeout(() => setPayoutFeedback(null), 5000);
        } catch (error: any) {
            setPayoutFeedback({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to request payout.",
            });
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
        <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Finances & Payouts
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Manage your turf earnings, save payout account details, and request withdrawals
                </p>
            </div>

            {/* Stat Cards */}
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
                            Completed & requested payouts
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Request Payout & Payout Account Details */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Request Payout Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-black text-gray-900 mb-4">
                            Request Payout
                        </h3>

                        {payoutFeedback && (
                            <div
                                className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
                                    payoutFeedback.type === "success"
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                            >
                                <span>{payoutFeedback.text}</span>
                                <button
                                    onClick={() => setPayoutFeedback(null)}
                                    className="text-xs opacity-75 hover:opacity-100 ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Destination Account Preview */}
                        {hasPayoutDetails && wallet.payoutDetails ? (
                            <div className="mb-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                            Transfer Destination
                                        </p>
                                        <p className="text-xs font-bold text-gray-900 truncate">
                                            {wallet.payoutDetails.bankAccountNumber
                                                ? `${
                                                      wallet.payoutDetails.bankName ||
                                                      "Bank Account"
                                                  } (${maskAccountNumber(
                                                      wallet.payoutDetails
                                                          .bankAccountNumber,
                                                  )})`
                                                : `UPI: ${wallet.payoutDetails.upiId}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingDetails(true)}
                                    className="text-xs font-bold text-[#E33E33] hover:underline shrink-0 ml-2"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="mb-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-900">
                                    <p className="font-bold">
                                        Payout Account Required
                                    </p>
                                    <p className="mt-0.5 text-amber-700">
                                        Save your bank account or UPI details below
                                        before requesting a withdrawal.
                                    </p>
                                </div>
                            </div>
                        )}

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
                                    !hasPayoutDetails ||
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

                        <div className="mt-5 flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                Payout requests are usually processed within 2-3
                                business days directly to your verified bank
                                account or UPI ID.
                            </p>
                        </div>
                    </div>

                    {/* Payout Account Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E33E33] flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                                        Payout Account
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        Bank or UPI receiving withdrawals
                                    </p>
                                </div>
                            </div>
                            {hasPayoutDetails && !isEditingDetails && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDetailsFeedback(null);
                                        setIsEditingDetails(true);
                                    }}
                                    className="text-xs font-bold text-[#E33E33] hover:underline px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>

                        {detailsFeedback && (
                            <div
                                className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
                                    detailsFeedback.type === "success"
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                            >
                                <span>{detailsFeedback.text}</span>
                                <button
                                    onClick={() => setDetailsFeedback(null)}
                                    className="text-xs opacity-75 hover:opacity-100 ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {hasPayoutDetails && !isEditingDetails ? (
                            /* Saved Payout Details View */
                            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <ShieldCheck className="w-3 h-3" />
                                        Ready for Withdrawals
                                    </span>
                                    {wallet.payoutDetails?.bankAccountNumber && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAccountNumber(
                                                    !showAccountNumber,
                                                )
                                            }
                                            className="text-xs font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
                                        >
                                            {showAccountNumber ? (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    <span>Hide</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Show</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {wallet.payoutDetails?.bankAccountNumber && (
                                    <>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">
                                                Account Holder
                                            </p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {wallet.payoutDetails
                                                    .accountHolderName || "—"}
                                            </p>
                                        </div>
                                        {wallet.payoutDetails.bankName && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">
                                                    Bank Name
                                                </p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {wallet.payoutDetails.bankName}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">
                                                Account Number
                                            </p>
                                            <p className="text-sm font-mono font-bold text-gray-900">
                                                {showAccountNumber
                                                    ? wallet.payoutDetails
                                                          .bankAccountNumber
                                                    : maskAccountNumber(
                                                          wallet.payoutDetails
                                                              .bankAccountNumber,
                                                      )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">
                                                IFSC Code
                                            </p>
                                            <p className="text-sm font-mono font-bold text-gray-900">
                                                {wallet.payoutDetails.ifscCode}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {wallet.payoutDetails?.upiId && (
                                    <div
                                        className={
                                            wallet.payoutDetails
                                                ?.bankAccountNumber
                                                ? "pt-2 border-t border-gray-200/60"
                                                : ""
                                        }
                                    >
                                        <p className="text-[10px] uppercase font-bold text-gray-400">
                                            UPI ID
                                        </p>
                                        <p className="text-sm font-mono font-bold text-gray-900">
                                            {wallet.payoutDetails.upiId}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Enter / Edit Payout Details Form */
                            <form
                                onSubmit={handleSavePayoutDetails}
                                className="space-y-3.5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={accountHolderName}
                                        onChange={(e) =>
                                            setAccountHolderName(e.target.value)
                                        }
                                        placeholder="As registered in bank"
                                        className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) =>
                                            setBankName(e.target.value)
                                        }
                                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                                        className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={bankAccountNumber}
                                            onChange={(e) =>
                                                setBankAccountNumber(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Account number"
                                            className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Confirm Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmAccountNumber}
                                            onChange={(e) =>
                                                setConfirmAccountNumber(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Re-enter account number"
                                            className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        value={ifscCode}
                                        onChange={(e) =>
                                            setIfscCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g. HDFC0001234"
                                        className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-mono uppercase"
                                    />
                                </div>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                                        <span className="bg-white px-2 text-gray-400">
                                            AND / OR UPI ID
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        UPI ID (Optional if Bank Account entered)
                                    </label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) =>
                                            setUpiId(e.target.value)
                                        }
                                        placeholder="e.g. yourname@okaxis"
                                        className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-mono"
                                    />
                                </div>

                                <div className="pt-2 flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={savingDetails}
                                        className="flex-1 bg-[#E33E33] hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        {savingDetails
                                            ? "Saving..."
                                            : "Save Payout Details"}
                                    </button>
                                    {hasPayoutDetails && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDetailsFeedback(null);
                                                setIsEditingDetails(false);
                                            }}
                                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right Column: Payout History */}
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
                                                    {payout.notes && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">
                                                            Note: {payout.notes}
                                                        </p>
                                                    )}
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
