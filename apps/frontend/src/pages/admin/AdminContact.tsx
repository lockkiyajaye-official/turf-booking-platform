import {
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    Mail,
    MessageSquare,
    Reply,
    Send,
    Trash2,
    User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    AdminBadge,
    AdminConfirmModal,
    AdminEmptyState,
    AdminFilterBar,
    AdminModal,
    AdminPageHeader,
    AdminPagination,
    AdminStatCard,
} from "../../components/admin";
import api from "../../services/api";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "pending" | "in_progress" | "resolved" | "closed";
    adminResponse?: string;
    respondedAt?: string;
    respondedBy?: string;
    createdAt: string;
    updatedAt: string;
}

interface ContactStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

export default function AdminContact() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Reply Modal
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    // Status Modal
    const [messageToUpdateStatus, setMessageToUpdateStatus] = useState<ContactMessage | null>(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState<ContactMessage["status"]>("pending");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Delete Modal
    const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Pagination for left list
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Feedback
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchMessages();
        fetchStats();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get("/contact/admin", { params: { limit: 100 } });
            const result = response.data;
            if (result.success) {
                const raw = result.data;
                const items = Array.isArray(raw) ? raw : (raw?.items || []);
                setMessages(items);
                if (items.length > 0 && !selectedMessage) {
                    setSelectedMessage(items[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            showFeedback("error", "Failed to fetch contact inquiries.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get("/contact/admin/stats");
            const result = response.data;
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 3500);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!messageToUpdateStatus) return;
        if (messageToUpdateStatus.status === selectedNewStatus) {
            setMessageToUpdateStatus(null);
            return;
        }
        try {
            setUpdatingStatus(true);
            const response = await api.put(
                `/contact/admin/${messageToUpdateStatus.id}/status`,
                { status: selectedNewStatus },
            );
            if (response.data.success) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageToUpdateStatus.id
                            ? { ...m, status: selectedNewStatus }
                            : m,
                    ),
                );
                if (selectedMessage?.id === messageToUpdateStatus.id) {
                    setSelectedMessage((prev) =>
                        prev ? { ...prev, status: selectedNewStatus } : null,
                    );
                }
                fetchStats();
                showFeedback(
                    "success",
                    `Inquiry status updated to ${selectedNewStatus.replace("_", " ")}.`,
                );
                setMessageToUpdateStatus(null);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            showFeedback("error", "Failed to update inquiry status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const sendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;

        setSubmittingReply(true);
        try {
            const response = await api.put(`/contact/admin/${selectedMessage.id}`, {
                adminResponse: replyText.trim(),
                status: "resolved",
            });

            if (response.data.success) {
                setShowReplyModal(false);
                setReplyText("");
                showFeedback("success", `Response sent to ${selectedMessage.name}.`);
                await fetchMessages();
                await fetchStats();
            }
        } catch (error) {
            console.error("Failed to send reply:", error);
            showFeedback("error", "Failed to send response.");
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!messageToDelete) return;

        try {
            setDeleting(true);
            const response = await api.delete(`/contact/admin/${messageToDelete.id}`);
            if (response.data.success) {
                setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
                if (selectedMessage?.id === messageToDelete.id) {
                    setSelectedMessage(null);
                }
                showFeedback("success", "Inquiry deleted successfully.");
                setMessageToDelete(null);
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to delete message:", error);
            showFeedback("error", "Failed to delete inquiry.");
        } finally {
            setDeleting(false);
        }
    };

    const filteredMessages = useMemo(() => {
        return messages.filter((message) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                message.name.toLowerCase().includes(term) ||
                message.email.toLowerCase().includes(term) ||
                message.subject.toLowerCase().includes(term) ||
                message.message.toLowerCase().includes(term);
            const matchesStatus =
                statusFilter === "all" || message.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [messages, searchTerm, statusFilter]);

    // Paginated messages for left pane
    const paginatedMessages = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMessages.slice(start, start + pageSize);
    }, [filteredMessages, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Support & Inquiries"
                description="Manage user questions, service support tickets, and direct email replies"
                badge={stats ? `${stats.total} Total` : undefined}
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

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    <AdminStatCard
                        title="Total Messages"
                        value={stats.total}
                        icon={MessageSquare}
                        iconColor="text-gray-700"
                        iconBg="bg-gray-100"
                    />
                    <AdminStatCard
                        title="Pending"
                        value={stats.pending}
                        icon={Clock}
                        iconColor="text-amber-600"
                        iconBg="bg-amber-50"
                        trend={{
                            value: stats.pending > 0 ? "Needs reply" : "Clear",
                            isPositive: stats.pending === 0,
                        }}
                    />
                    <AdminStatCard
                        title="In Progress"
                        value={stats.inProgress}
                        icon={Send}
                        iconColor="text-sky-600"
                        iconBg="bg-sky-50"
                    />
                    <AdminStatCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={CheckCircle2}
                        iconColor="text-emerald-600"
                        iconBg="bg-emerald-50"
                    />
                    <AdminStatCard
                        title="Closed"
                        value={stats.closed}
                        icon={Eye}
                        iconColor="text-gray-500"
                        iconBg="bg-gray-100"
                    />
                </div>
            )}

            {/* Filter Bar */}
            <AdminFilterBar
                search={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search by name, email, subject, or message text..."
                tabs={[
                    { id: "all", label: "All Messages", count: stats?.total },
                    { id: "pending", label: "Pending", count: stats?.pending },
                    { id: "in_progress", label: "In Progress", count: stats?.inProgress },
                    { id: "resolved", label: "Resolved", count: stats?.resolved },
                    { id: "closed", label: "Closed", count: stats?.closed },
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
                {/* Left Column: Message List */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 text-xs animate-pulse">
                                Loading inquiries...
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <AdminEmptyState
                                title="No inquiries found"
                                description="Try adjusting your filter or search."
                                onResetFilters={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {paginatedMessages.map((message) => {
                                    const isSelected = selectedMessage?.id === message.id;

                                    return (
                                        <div
                                            key={message.id}
                                            onClick={() => setSelectedMessage(message)}
                                            className={`p-4 cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-red-50/40 border-l-4 border-l-[#E33E33]"
                                                    : "hover:bg-gray-50/70 border-l-4 border-l-transparent"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="truncate">
                                                    <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                                        {message.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 truncate">
                                                        {message.email}
                                                    </p>
                                                </div>
                                                <AdminBadge status={message.status} />
                                            </div>

                                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                                                {message.subject}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                {message.message}
                                            </p>

                                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <span>
                                                    {new Date(
                                                        message.createdAt,
                                                    ).toLocaleDateString("en-IN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredMessages.length > 0 && (
                            <AdminPagination
                                currentPage={currentPage}
                                totalItems={filteredMessages.length}
                                pageSize={pageSize}
                                pageSizeOptions={[8, 16, 32]}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={setPageSize}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Message Detail */}
                <div className="lg:col-span-7">
                    {selectedMessage ? (
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-extrabold text-gray-900">
                                            {selectedMessage.subject}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {selectedMessage.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                {selectedMessage.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date(
                                                    selectedMessage.createdAt,
                                                ).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons & Status change */}
                                    <div className="flex items-center gap-2">
                                        <AdminBadge status={selectedMessage.status} />
                                        <button
                                            onClick={() => {
                                                setMessageToUpdateStatus(selectedMessage);
                                                setSelectedNewStatus(selectedMessage.status);
                                            }}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-xs"
                                            title="Update inquiry status"
                                        >
                                            Update Status
                                        </button>

                                        <button
                                            onClick={() => setShowReplyModal(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E33E33] hover:bg-[#c9352b] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                                            title="Reply to message"
                                        >
                                            <Reply className="w-3.5 h-3.5" />
                                            <span>Reply</span>
                                        </button>

                                        <button
                                            onClick={() => setMessageToDelete(selectedMessage)}
                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200"
                                            title="Delete message"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="p-5 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Customer Message
                                    </h4>
                                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                {/* Previous Admin Reply if any */}
                                {selectedMessage.adminResponse && (
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            Admin Response Sent
                                        </h4>
                                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.adminResponse}
                                            {selectedMessage.respondedBy && (
                                                <p className="text-[11px] text-gray-400 mt-2 border-t border-emerald-200/50 pt-1.5">
                                                    Responded by {selectedMessage.respondedBy} on{" "}
                                                    {selectedMessage.respondedAt &&
                                                        new Date(
                                                            selectedMessage.respondedAt,
                                                        ).toLocaleString("en-IN")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-12 text-center text-gray-400 text-sm">
                            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            Select an inquiry from the list to view details and respond.
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            <AdminModal
                isOpen={showReplyModal && Boolean(selectedMessage)}
                onClose={() => {
                    setShowReplyModal(false);
                    setReplyText("");
                }}
                title={selectedMessage ? `Reply to ${selectedMessage.name}` : "Reply"}
                description={
                    selectedMessage ? `Subject: ${selectedMessage.subject}` : undefined
                }
                maxWidth="lg"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <span className="text-gray-400 uppercase font-semibold block mb-1">
                            Original Inquirer
                        </span>
                        <p className="text-gray-800 font-bold">
                            {selectedMessage?.name} ({selectedMessage?.email})
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Your Administrative Response
                        </label>
                        <textarea
                            rows={6}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your official response here. This will update the status to Resolved and notify the customer..."
                            className="w-full p-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                setShowReplyModal(false);
                                setReplyText("");
                            }}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={sendReply}
                            disabled={!replyText.trim() || submittingReply}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#E33E33] hover:bg-[#c9352b] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {submittingReply ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Send Official Reply</span>
                        </button>
                    </div>
                </div>
            </AdminModal>

            {/* Status Update Modal */}
            <AdminModal
                isOpen={Boolean(messageToUpdateStatus)}
                onClose={() => setMessageToUpdateStatus(null)}
                title="Update Inquiry Status"
                description={
                    messageToUpdateStatus
                        ? `Inquiry from ${messageToUpdateStatus.name}: "${messageToUpdateStatus.subject}"`
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
                                setSelectedNewStatus(e.target.value as ContactMessage["status"])
                            }
                            className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                        >
                            <option value="pending">Pending (Awaiting initial review / reply)</option>
                            <option value="in_progress">In Progress (Under active investigation)</option>
                            <option value="resolved">Resolved (Issue addressed & answered)</option>
                            <option value="closed">Closed (Inquiry archived)</option>
                        </select>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                        <span>Current Status:</span>
                        <strong className="text-gray-800 uppercase font-bold">
                            {messageToUpdateStatus?.status.replace("_", " ")}
                        </strong>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setMessageToUpdateStatus(null)}
                            disabled={updatingStatus}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmStatusUpdate}
                            disabled={updatingStatus || selectedNewStatus === messageToUpdateStatus?.status}
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

            {/* Delete Confirmation Modal */}
            <AdminConfirmModal
                isOpen={Boolean(messageToDelete)}
                onClose={() => setMessageToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete Support Inquiry"
                variant="danger"
                confirmText="Delete Message"
                message={
                    messageToDelete ? (
                        <div>
                            Are you sure you want to permanently delete the inquiry from{" "}
                            <strong className="text-gray-900">{messageToDelete.name}</strong> regarding{" "}
                            "{messageToDelete.subject}"?
                        </div>
                    ) : null
                }
            />
        </div>
    );
}
