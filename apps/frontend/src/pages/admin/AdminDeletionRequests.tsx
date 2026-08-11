import { AlertTriangle, Calendar, Check, CheckCircle2, RefreshCw, Search, Trash2, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

interface DeletionItem {
    id: string;
    email: string;
    userId?: string;
    userName?: string;
    reason?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
    adminNotes?: string;
    processedBy?: string;
    processedAt?: string;
    createdAt: string;
}

interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function AdminDeletionRequests() {
    const [deletionMessages, setDeletionMessages] = useState<DeletionItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<DeletionItem | null>(null);
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [delRes, usersRes] = await Promise.all([
                api.get("/deletion-requests/admin"),
                api.get("/users")
            ]);

            if (delRes.data.success) {
                const items = delRes.data.data || [];
                setDeletionMessages(items);
                if (items.length > 0) {
                    setSelectedRequest(items[0]);
                }
            }

            setUsers(usersRes.data || []);
        } catch (err) {
            console.error("Failed to fetch deletion requests or users:", err);
            showAlert("error", "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'error', text: string) => {
        setAlertMsg({ type, text });
        setTimeout(() => setAlertMsg(null), 4000);
    };

    const findMatchingUser = (email: string) => {
        return users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    };

    const handleDeleteUserAccount = async (request: DeletionItem) => {
        const matchingUser = findMatchingUser(request.email);

        const confirmMsg = matchingUser
            ? `Are you sure you want to PERMANENTLY delete user account "${matchingUser.firstName} ${matchingUser.lastName}" (${matchingUser.email}) and mark this request as completed?`
            : `No registered account found with email "${request.email}". Do you want to mark this deletion request as completed?`;

        if (!window.confirm(confirmMsg)) return;

        setProcessingId(request.id);

        try {
            await api.post(`/deletion-requests/admin/${request.id}/purge`);

            showAlert("success", `Account deletion request for ${request.email} processed successfully.`);
            await fetchData();
        } catch (err: any) {
            console.error("Error processing deletion request:", err);
            showAlert("error", err.response?.data?.message || "Failed to complete account deletion.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectOrClose = async (id: string) => {
        if (!window.confirm("Reject/Cancel this deletion request without deleting any user account?")) return;

        try {
            await api.put(`/deletion-requests/admin/${id}/status`, { status: "rejected" });
            showAlert("success", "Request marked as rejected.");
            await fetchData();
        } catch (err) {
            showAlert("error", "Failed to update request status.");
        }
    };

    const filteredRequests = deletionMessages.filter(req => {
        const term = searchTerm.toLowerCase();
        return (
            (req.userName && req.userName.toLowerCase().includes(term)) ||
            req.email.toLowerCase().includes(term) ||
            (req.reason && req.reason.toLowerCase().includes(term))
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading Account Deletion Requests...
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="p-2 bg-red-100 rounded-xl text-red-600">
                            <UserX className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Account Deletion Requests
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                        Review and fulfill user data purge and account deletion requests for Google Play compliance
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh List
                    </button>
                </div>
            </div>

            {alertMsg && (
                <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {alertMsg.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {alertMsg.text}
                </div>
            )}

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user email, name or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                </div>
                <div className="text-xs font-semibold text-gray-500 px-3 py-1 bg-gray-100 rounded-lg">
                    Total Requests: {deletionMessages.length}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Cards Column */}
                <div className="lg:col-span-1 space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500">
                            No deletion requests found.
                        </div>
                    ) : (
                        filteredRequests.map((req) => {
                            const matchedUser = findMatchingUser(req.email);
                            const isSelected = selectedRequest?.id === req.id;
                            const isResolved = req.status === "completed" || req.status === "rejected";

                            return (
                                <div
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${isSelected ? "border-red-500 ring-2 ring-red-100" : "border-gray-100"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{req.userName || req.email}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{req.email}</p>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${isResolved
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-red-100 text-red-700 animate-pulse"
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                    </div>

                                    {matchedUser ? (
                                        <div className="my-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-center justify-between font-medium">
                                            <span>User Account Found</span>
                                            <span className="font-bold uppercase tracking-wider text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                                                {matchedUser.role}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="my-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium">
                                            No Account Entity Matched
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(req.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Selected Detail Column */}
                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                            <div className="flex items-start justify-between border-b border-gray-100 pb-6">
                                <div>
                                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                        Account Deletion Request
                                    </span>
                                    <h2 className="text-2xl font-black text-gray-900 mt-1">
                                        Request from {selectedRequest.userName || selectedRequest.email}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-0.5 font-mono">
                                        Target Email: <strong>{selectedRequest.email}</strong>
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block">Submitted On</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Reason Details */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    User Reason
                                </h4>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                                    {selectedRequest.reason || "No reason provided."}
                                </div>
                            </div>

                            {/* Matching DB User Account Status */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Associated User Record in Database
                                </h4>
                                {findMatchingUser(selectedRequest.email) ? (
                                    (() => {
                                        const u = findMatchingUser(selectedRequest.email)!;
                                        return (
                                            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {u.firstName} {u.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-600">ID: {u.id} • Phone: {u.phone || 'N/A'}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full capitalize">
                                                    {u.role}
                                                </span>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                                        No active database account matches <strong>{selectedRequest.email}</strong> (User may have already been purged or registered with a different email).
                                    </div>
                                )}
                            </div>

                            {/* Admin Action Bar */}
                            <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                                {selectedRequest.status === "completed" ? (
                                    <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        This request was completed & user data purged.
                                        {selectedRequest.adminNotes && (
                                            <p className="text-xs font-normal text-green-700 mt-1">{selectedRequest.adminNotes}</p>
                                        )}
                                    </div>
                                ) : selectedRequest.status === "rejected" || selectedRequest.status === "cancelled" ? (
                                    <div className="w-full p-4 bg-gray-100 rounded-xl text-gray-700 text-sm font-semibold">
                                        This request was rejected / cancelled.
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleDeleteUserAccount(selectedRequest)}
                                            disabled={processingId === selectedRequest.id}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            {processingId === selectedRequest.id
                                                ? "Processing Deletion..."
                                                : "Permanently Purge & Delete User"}
                                        </button>

                                        <button
                                            onClick={() => handleRejectOrClose(selectedRequest.id)}
                                            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                                        >
                                            Dismiss / Reject Request
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                            Select a request to view details & manage account deletion.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
