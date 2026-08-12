import React, { useState } from "react";
import { Trash2, AlertTriangle, ShieldCheck, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function DeleteAccountPage() {
    const { user, logout } = useAuth();
    const [email, setEmail] = useState(user?.email || "");
    const [reason, setReason] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [deleteAllData, setDeleteAllData] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!deleteAllData) {
            setErrorMessage("Please check the box confirming you want to delete all your account data.");
            return;
        }

        if (confirmText.trim().toUpperCase() !== "DELETE") {
            setErrorMessage('Please type "DELETE" to confirm account deletion.');
            return;
        }

        setLoading(true);

        try {
            await api.post("/deletion-requests", {
                email: email,
                reason: reason || "No reason specified",
                confirmDeleteAllData: deleteAllData,
            });
            setSubmitted(true);
            if (user) {
                setTimeout(() => {
                    logout();
                }, 4000);
            }
        } catch (err: any) {
            console.error("Failed to submit deletion request:", err);
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link
                        to={user ? "/dashboard/profile" : "/"}
                        className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {user ? "Back to Profile" : "Back to Home"}
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-rose-700 p-8 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <Trash2 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">Request Account & Data Deletion</h1>
                        </div>
                        <p className="text-red-100 text-sm md:text-base max-w-xl leading-relaxed">
                            Submit a request to permanently delete your Lockkiyajaye account and associated data in accordance with Google Play Developer Policy & Privacy standards.
                        </p>
                    </div>

                    <div className="p-8">
                        {submitted ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Deletion Request Submitted
                                </h2>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    Your account deletion request for <strong className="text-gray-900">{email}</strong> has been received. All account records and personal data will be purged within 30 days.
                                </p>
                                {user && (
                                    <p className="text-xs text-gray-500 italic mb-6">
                                        Logging you out of your session...
                                    </p>
                                )}
                                <Link
                                    to="/"
                                    className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-md"
                                >
                                    Return to Home Page
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-amber-900 text-base mb-1">
                                                What happens when your account is deleted?
                                            </h3>
                                            <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                                                Your profile credentials, phone number, booking history, and stored preferences will be permanently purged from our database. This action cannot be undone once processed by our team.
                                            </p>

                                            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-amber-200/60">
                                                <input
                                                    type="checkbox"
                                                    checked={deleteAllData}
                                                    onChange={(e) => setDeleteAllData(e.target.checked)}
                                                    className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                                                />
                                                <span className="text-sm font-bold text-amber-950">
                                                    I want to permanently delete all my account data, active bookings, and personal records.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {errorMessage && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Account Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                                placeholder="enter-your-email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            Specify the email registered with your Lockkiyajaye account.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Reason for Leaving (Optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                            placeholder="Tell us why you are requesting account deletion..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Confirmation <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-600 mb-2">
                                            Type <strong className="text-red-600 font-mono">DELETE</strong> in capital letters to confirm.
                                        </p>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-mono tracking-wider"
                                            placeholder="DELETE"
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <button
                                            type="submit"
                                            disabled={loading || !deleteAllData || confirmText.trim().toUpperCase() !== "DELETE"}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            {loading ? "Submitting Request..." : "Submit Deletion Request"}
                                        </button>

                                        <a
                                            href={`mailto:support@lockkiyajaye.com?subject=Account%20Deletion%20Request%20(${encodeURIComponent(email)})`}
                                            className="text-xs text-gray-500 hover:text-gray-800 underline font-medium flex items-center gap-1"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            Or email support directly
                                        </a>
                                    </div>
                                </form>

                                <div className="mt-10 pt-6 border-t border-gray-100 flex items-center space-x-3 text-xs text-gray-500">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                        Requests are verified and processed in compliance with user privacy rights and Google Play Store data policy requirements.
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
