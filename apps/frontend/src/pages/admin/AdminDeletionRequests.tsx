import {
    Calendar,
    CheckCircle2,
    Clock,
    Database,
    RefreshCw,
    Trash2,
    UserX,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    AdminBadge,
    AdminConfirmModal,
    AdminEmptyState,
    AdminFilterBar,
    AdminPageHeader,
    AdminPagination,
    AdminStatCard,
} from "../../components/admin";
import api from "../../services/api";

interface DeletionItem {
    id: string;
    email: string;
    userId?: string;
    userName?: string;
    reason?: string;
    status: "pending" | "in_progress" | "completed" | "rejected" | "cancelled";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedRequest, setSelectedRequest] = useState<DeletionItem | null>(null);

    // Modal states
    const [purgeModalOpen, setPurgeModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Pagination for list
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Feedback
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [delRes, usersRes] = await Promise.all([
                api.get("/deletion-requests/admin", { params: { limit: 100 } }),
                api.get("/users", { params: { limit: 100 } }),
            ]);

            if (delRes.data.success) {
                const raw = delRes.data.data;
                const items: DeletionItem[] = Array.isArray(raw) ? raw : (raw?.items || []);
                setDeletionMessages(items);
                if (items.length > 0 && !selectedRequest) {
                    setSelectedRequest(items[0]);
                }
            }
            const uRaw = usersRes.data;
            setUsers(Array.isArray(uRaw) ? uRaw : (uRaw?.items || []));
        } catch (err) {
            console.error("Failed to fetch deletion requests or users:", err);
            showFeedback("error", "Failed to load deletion requests.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 3500);
    };

    const findMatchingUser = (email: string) => {
        return users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    };

    const handlePurgeConfirmed = async () => {
        if (!selectedRequest) return;

        setProcessing(true);
        try {
            await api.post(`/deletion-requests/admin/${selectedRequest.id}/purge`);
            showFeedback(
                "success",
                `Account and data purged for ${selectedRequest.email}. Request completed.`,
            );
            setPurgeModalOpen(false);
            await fetchData();
        } catch (err: unknown) {
            console.error("Error processing deletion request:", err);
            const errorObj = err as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                errorObj.response?.data?.message || "Failed to complete account deletion.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectConfirmed = async () => {
        if (!selectedRequest) return;

        setProcessing(true);
        try {
            await api.put(`/deletion-requests/admin/${selectedRequest.id}/status`, {
                status: "rejected",
            });
            showFeedback("success", "Deletion request marked as rejected/dismissed.");
            setRejectModalOpen(false);
            await fetchData();
        } catch {
            showFeedback("error", "Failed to update request status.");
        } finally {
            setProcessing(false);
        }
    };

    // Stats
    const requestStats = useMemo(() => {
        const counts = { all: deletionMessages.length, pending: 0, completed: 0, rejected: 0 };
        deletionMessages.forEach((r) => {
            if (r.status === "completed") counts.completed++;
            else if (r.status === "rejected" || r.status === "cancelled") counts.rejected++;
            else counts.pending++;
        });
        return counts;
    }, [deletionMessages]);

    // Filtered requests
    const filteredRequests = useMemo(() => {
        return deletionMessages.filter((req) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                (req.userName && req.userName.toLowerCase().includes(term)) ||
                req.email.toLowerCase().includes(term) ||
                (req.reason && req.reason.toLowerCase().includes(term));

            let matchesStatus = true;
            if (statusFilter === "pending") {
                matchesStatus = req.status === "pending" || req.status === "in_progress";
            } else if (statusFilter === "completed") {
                matchesStatus = req.status === "completed";
            } else if (statusFilter === "rejected") {
                matchesStatus = req.status === "rejected" || req.status === "cancelled";
            }

            return matchesSearch && matchesStatus;
        });
    }, [deletionMessages, searchTerm, statusFilter]);

    // Paginated requests for left column
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRequests.slice(start, start + pageSize);
    }, [filteredRequests, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Account Deletion Requests"
                description="Review and execute user data purge and account termination requests for Google Play & GDPR compliance"
                badge={`${deletionMessages.length} Requests`}
                actions={
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh List</span>
                    </button>
                }
            />

            {/* Notification alert banner */}
            {feedback && (
                <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
                        feedback.type === "success"
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

            {/* Top Stat Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <AdminStatCard
                    title="Total Requests"
                    value={requestStats.all}
                    icon={UserX}
                    iconColor="text-gray-700"
                    iconBg="bg-gray-100"
                />
                <AdminStatCard
                    title="Pending Purge"
                    value={requestStats.pending}
                    icon={Clock}
                    iconColor="text-rose-600"
                    iconBg="bg-rose-50"
                    trend={{
                        value: requestStats.pending > 0 ? "Action required" : "Clear",
                        isPositive: requestStats.pending === 0,
                    }}
                />
                <AdminStatCard
                    title="Completed Purges"
                    value={requestStats.completed}
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    description="Full data purge executed"
                />
                <AdminStatCard
                    title="Dismissed / Rejected"
                    value={requestStats.rejected}
                    icon={XCircle}
                    iconColor="text-gray-500"
                    iconBg="bg-gray-100"
                />
            </div>

            {/* Filter Bar */}
            <AdminFilterBar
                search={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search by user email, name, or reason..."
                tabs={[
                    { id: "all", label: "All Requests", count: requestStats.all },
                    { id: "pending", label: "Pending Claims", count: requestStats.pending },
                    { id: "completed", label: "Purged & Completed", count: requestStats.completed },
                    { id: "rejected", label: "Dismissed", count: requestStats.rejected },
                ]}
                activeTab={statusFilter}
                onTabChange={(tab) => {
                    setStatusFilter(tab);
                    setCurrentPage(1);
                }}
                hasActiveFilters={Boolean(searchTerm || statusFilter !== "all")}
                onResetFilters={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                }}
            />

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Request List */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 text-xs animate-pulse">
                                Loading deletion claims...
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <AdminEmptyState
                                title="No deletion requests found"
                                description="Try adjusting your filter or searching for another user."
                                onResetFilters={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {paginatedRequests.map((req) => {
                                    const matchedUser = findMatchingUser(req.email);
                                    const isSelected = selectedRequest?.id === req.id;

                                    return (
                                        <div
                                            key={req.id}
                                            onClick={() => setSelectedRequest(req)}
                                            className={`p-4 cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-red-50/40 border-l-4 border-l-[#E33E33]"
                                                    : "hover:bg-gray-50/70 border-l-4 border-l-transparent"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="truncate">
                                                    <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                                        {req.userName || req.email}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-gray-500 truncate">
                                                        {req.email}
                                                    </p>
                                                </div>
                                                <AdminBadge status={req.status} />
                                            </div>

                                            {matchedUser ? (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 my-1">
                                                    <Database className="w-2.5 h-2.5" />
                                                    <span>Active DB Account ({matchedUser.role})</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200/60 my-1">
                                                    <span>No Active Record Match</span>
                                                </div>
                                            )}

                                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <span>
                                                    Submitted{" "}
                                                    {new Date(
                                                        req.createdAt,
                                                    ).toLocaleDateString("en-IN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredRequests.length > 0 && (
                            <AdminPagination
                                currentPage={currentPage}
                                totalItems={filteredRequests.length}
                                pageSize={pageSize}
                                pageSizeOptions={[8, 16, 32]}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={setPageSize}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Request Detail */}
                <div className="lg:col-span-7">
                    {selectedRequest ? (
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-bold text-[#E33E33] uppercase tracking-wider block mb-1">
                                        Data Purge Claim
                                    </span>
                                    <h2 className="text-xl font-extrabold text-gray-900">
                                        {selectedRequest.userName || selectedRequest.email}
                                    </h2>
                                    <p className="font-mono text-xs text-gray-500 mt-0.5">
                                        Target Email: <strong>{selectedRequest.email}</strong>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <AdminBadge status={selectedRequest.status} />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(selectedRequest.createdAt).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-5">
                                {/* Reason Box */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Stated Reason for Deletion
                                    </h4>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedRequest.reason || "No explicit reason stated by user."}
                                    </div>
                                </div>

                                {/* Database Match Card */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Associated Database Record
                                    </h4>
                                    {findMatchingUser(selectedRequest.email) ? (
                                        (() => {
                                            const u = findMatchingUser(selectedRequest.email)!;
                                            return (
                                                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">
                                                            {u.firstName} {u.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-mono mt-0.5">
                                                            User ID: {u.id} • Phone: {u.phone || "—"}
                                                        </p>
                                                    </div>
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full capitalize">
                                                        {u.role.replace("_", " ")}
                                                    </span>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                                            No active account in database matches{" "}
                                            <strong>{selectedRequest.email}</strong>. The user may have
                                            already been deleted or registered under a different email.
                                        </div>
                                    )}
                                </div>

                                {/* Status specific note */}
                                {selectedRequest.status === "completed" && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span>
                                            This deletion request was executed. User profile and associated
                                            records were purged.
                                        </span>
                                    </div>
                                )}

                                {selectedRequest.status === "rejected" && (
                                    <div className="p-4 bg-gray-100 rounded-xl text-gray-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                        <span>This request was dismissed/rejected by an administrator.</span>
                                    </div>
                                )}

                                {/* Action Controls */}
                                {selectedRequest.status !== "completed" &&
                                    selectedRequest.status !== "rejected" &&
                                    selectedRequest.status !== "cancelled" && (
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-wrap">
                                            <button
                                                onClick={() => setRejectModalOpen(true)}
                                                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                            >
                                                Dismiss Request
                                            </button>
                                            <button
                                                onClick={() => setPurgeModalOpen(true)}
                                                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Purge & Terminate Account</span>
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-12 text-center text-gray-400 text-sm">
                            <UserX className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            Select an account deletion claim from the list to view details.
                        </div>
                    )}
                </div>
            </div>

            {/* Purge Confirm Modal */}
            <AdminConfirmModal
                isOpen={purgeModalOpen}
                onClose={() => setPurgeModalOpen(false)}
                onConfirm={handlePurgeConfirmed}
                loading={processing}
                title="Execute Account Data Purge"
                variant="danger"
                confirmText="Permanently Purge"
                message={
                    <div>
                        <p className="font-bold text-gray-900 mb-2">
                            This action is permanent and cannot be undone.
                        </p>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Purging will permanently delete all profile records, login credentials,
                            and personal identity data associated with{" "}
                            <strong>{selectedRequest?.email}</strong> in compliance with Google Play
                            and Apple privacy policies.
                        </p>
                    </div>
                }
            />

            {/* Reject Confirm Modal */}
            <AdminConfirmModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleRejectConfirmed}
                loading={processing}
                title="Dismiss Deletion Request"
                variant="warning"
                confirmText="Confirm Dismissal"
                message={
                    <div>
                        Are you sure you want to dismiss/reject the deletion claim for{" "}
                        <strong>{selectedRequest?.email}</strong> without purging any database
                        records?
                    </div>
                }
            />
        </div>
    );
}
