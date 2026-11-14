import {
    Building2,
    CheckCircle2,
    Clock,
    MapPin,
    Trash2,
    Phone,
    Mail,
    FileText,
    ExternalLink,
    ShieldCheck,
    Percent,
    Eye,
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
import type { TurfOwner } from "./types";

export default function AdminTurfOwners() {
    const [owners, setOwners] = useState<TurfOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusTab, setStatusTab] = useState<string>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Review / Approval Modal
    const [activeOwner, setActiveOwner] = useState<TurfOwner | null>(null);
    const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [customFeeInput, setCustomFeeInput] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);

    // Delete Modal
    const [ownerToDelete, setOwnerToDelete] = useState<TurfOwner | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Feedback message
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users/turf-owners", { params: { limit: 100 } });
            const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
            setOwners(items);
        } catch (error) {
            console.error("Failed to fetch turf owners:", error);
            showFeedback("error", "Failed to load turf partners.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 3500);
    };

    const handleOpenReview = (owner: TurfOwner, action: "approve" | "reject") => {
        setActiveOwner(owner);
        setReviewAction(action);
        setReviewNotes(
            action === "approve"
                ? "Approved for platform operations and turf listings"
                : "",
        );
        setCustomFeeInput(
            owner.customPlatformFeePercent !== null && owner.customPlatformFeePercent !== undefined
                ? String(owner.customPlatformFeePercent)
                : "",
        );
    };

    const handleTriggerApproveAction = () => {
        if (!activeOwner) return;
        setShowApproveConfirmModal(true);
    };

    const handleConfirmReview = async () => {
        if (!activeOwner || !reviewAction) return;

        if (reviewAction === "reject" && !reviewNotes.trim()) {
            showFeedback("error", "Please provide notes/reason for rejection.");
            return;
        }

        try {
            setSubmittingReview(true);
            if (reviewAction === "approve") {
                await api.post(`/users/turf-owners/${activeOwner.id}/approve`, {
                    approvalNotes: reviewNotes.trim(),
                });

                // If commission override is entered or changed, update it
                const feeValue = customFeeInput.trim() ? parseFloat(customFeeInput) : null;
                await api.patch(`/users/turf-owners/${activeOwner.id}/commission`, {
                    customPlatformFeePercent: feeValue,
                });

                showFeedback(
                    "success",
                    `Approved ${activeOwner.firstName} ${activeOwner.lastName} (${activeOwner.businessName || "Partner"}).`,
                );
            } else {
                await api.post(`/users/turf-owners/${activeOwner.id}/reject`, {
                    approvalNotes: reviewNotes.trim(),
                });
                showFeedback(
                    "success",
                    `Rejected partner application for ${activeOwner.firstName} ${activeOwner.lastName}.`,
                );
            }
            await fetchOwners();
            setActiveOwner(null);
            setReviewAction(null);
            setShowApproveConfirmModal(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to process application.",
            );
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!ownerToDelete) return;
        try {
            setDeleting(true);
            await api.delete(`/users/${ownerToDelete.id}`);
            setOwners((prev) => prev.filter((o) => o.id !== ownerToDelete.id));
            showFeedback(
                "success",
                `Turf owner ${ownerToDelete.firstName} ${ownerToDelete.lastName} and associated assets removed.`,
            );
            setOwnerToDelete(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to delete turf owner",
            );
        } finally {
            setDeleting(false);
        }
    };

    // Owner counts
    const ownerCounts = useMemo(() => {
        const counts = { all: owners.length, pending: 0, approved: 0 };
        owners.forEach((o) => {
            if (o.isApproved) counts.approved++;
            else counts.pending++;
        });
        return counts;
    }, [owners]);

    // Filtered Owners
    const filteredOwners = useMemo(() => {
        let list = [...owners];

        if (statusTab === "pending") {
            list = list.filter((o) => !o.isApproved);
        } else if (statusTab === "approved") {
            list = list.filter((o) => Boolean(o.isApproved));
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            list = list.filter((o) => {
                const name = `${o.firstName} ${o.lastName}`.toLowerCase();
                return (
                    name.includes(term) ||
                    (o.businessName && o.businessName.toLowerCase().includes(term)) ||
                    (o.email && o.email.toLowerCase().includes(term)) ||
                    (o.phone && o.phone.toLowerCase().includes(term)) ||
                    (o.address && o.address.toLowerCase().includes(term))
                );
            });
        }

        return list;
    }, [owners, statusTab, search]);

    // Pagination slice
    const paginatedOwners = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOwners.slice(start, start + pageSize);
    }, [filteredOwners, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Turf Owners"
                description="Review business applications, verify turf owner documentation, and manage partner accounts"
                badge={`${owners.length} Partners`}
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminStatCard
                    title="Total Partners"
                    value={ownerCounts.all}
                    icon={Building2}
                    iconColor="text-gray-700"
                    iconBg="bg-gray-100"
                    description="Registered turf providers"
                />
                <AdminStatCard
                    title="Approved Partners"
                    value={ownerCounts.approved}
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    trend={{
                        value: `${ownerCounts.all > 0 ? Math.round((ownerCounts.approved / ownerCounts.all) * 100) : 0}% verified`,
                        isPositive: true,
                    }}
                />
                <AdminStatCard
                    title="Pending Verification"
                    value={ownerCounts.pending}
                    icon={Clock}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                    trend={{
                        value: ownerCounts.pending > 0 ? "Action required" : "Up to date",
                        isPositive: ownerCounts.pending === 0,
                    }}
                />
            </div>

            {/* Filter Bar */}
            <AdminFilterBar
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search by owner, business, phone, or location..."
                tabs={[
                    { id: "all", label: "All Owners", count: ownerCounts.all },
                    { id: "pending", label: "Pending Approvals", count: ownerCounts.pending },
                    { id: "approved", label: "Approved Partners", count: ownerCounts.approved },
                ]}
                activeTab={statusTab}
                onTabChange={(tab) => {
                    setStatusTab(tab);
                    setCurrentPage(1);
                }}
                hasActiveFilters={Boolean(search || statusTab !== "all")}
                onResetFilters={() => {
                    setSearch("");
                    setStatusTab("all");
                    setCurrentPage(1);
                }}
            />

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm animate-pulse">
                        Loading turf owners...
                    </div>
                ) : filteredOwners.length === 0 ? (
                    <AdminEmptyState
                        title="No turf owners found"
                        description="Try clearing your search or switching to another status tab."
                        onResetFilters={() => {
                            setSearch("");
                            setStatusTab("all");
                        }}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[760px]">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-5">Partner</th>
                                        <th className="py-3 px-5">Phone Number</th>
                                        <th className="py-3 px-5">Business & Turfs</th>
                                        <th className="py-3 px-5">Platform Fee</th>
                                        <th className="py-3 px-5">Status</th>
                                        <th className="py-3 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {paginatedOwners.map((o) => {
                                        const initials = `${o.firstName.charAt(0)}${o.lastName.charAt(0)}`.toUpperCase();

                                        return (
                                            <tr
                                                key={o.id}
                                                className="hover:bg-gray-50/70 transition-colors"
                                            >
                                                {/* Owner Details */}
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                            {initials || "P"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">
                                                                {o.firstName} {o.lastName}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                                {o.email || "No email"}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400">
                                                                Joined{" "}
                                                                {new Date(
                                                                    o.createdAt,
                                                                ).toLocaleDateString("en-IN", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Phone Number */}
                                                <td className="py-3.5 px-5">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200/80 text-xs font-mono font-medium text-gray-800">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span>{o.phone || "—"}</span>
                                                    </div>
                                                </td>

                                                {/* Business Details & Turfs */}
                                                <td className="py-3.5 px-5">
                                                    <div className="space-y-1.5 max-w-xs">
                                                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate">{o.businessName || "Unnamed Business"}</span>
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                                                                (o.turfs?.length ?? 0) > 0
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {o.turfs?.length ?? 0} {o.turfs?.length === 1 ? "Turf" : "Turfs"}
                                                            </span>
                                                            {(o.businessRegistrationDoc || o.identityDoc) && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-200">
                                                                    <FileText className="w-3 h-3" />
                                                                    Docs Attached
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Platform Fee */}
                                                <td className="py-3.5 px-5">
                                                    {o.customPlatformFeePercent !== null && o.customPlatformFeePercent !== undefined ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200">
                                                            <Percent className="w-3 h-3" />
                                                            {o.customPlatformFeePercent}% (Custom)
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            Default (5%)
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Verification Status */}
                                                <td className="py-3.5 px-5">
                                                    <AdminBadge
                                                        status={
                                                            o.isApproved
                                                                ? "approved"
                                                                : "pending"
                                                        }
                                                        label={
                                                            o.isApproved
                                                                ? "Approved"
                                                                : "Pending Approval"
                                                        }
                                                    />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() =>
                                                                handleOpenReview(
                                                                    o,
                                                                    o.isApproved ? "reject" : "approve",
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                                                                !o.isApproved
                                                                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                                                    : "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200"
                                                            }`}
                                                            title="Review partner application"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>{o.isApproved ? "Manage" : "Review"}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => setOwnerToDelete(o)}
                                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                                                            title="Delete owner"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                            totalItems={filteredOwners.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </>
                )}
            </div>

            {/* Comprehensive Turf Owner Review & Verification Modal */}
            <AdminModal
                isOpen={Boolean(activeOwner && reviewAction)}
                onClose={() => {
                    setActiveOwner(null);
                    setReviewAction(null);
                }}
                title={
                    reviewAction === "approve"
                        ? "Verify & Approve Turf Partner"
                        : "Manage Turf Business Partner"
                }
                description={
                    activeOwner
                        ? `Application details for ${activeOwner.firstName} ${activeOwner.lastName} (${activeOwner.businessName || "Partner"})`
                        : undefined
                }
                maxWidth="lg"
            >
                {activeOwner && (
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {/* Status banner */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            activeOwner.isApproved
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}>
                            <div className="flex items-center gap-2 font-semibold">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Verification Status: {activeOwner.isApproved ? "Approved Partner" : "Pending Verification"}</span>
                            </div>
                            <span className="text-[11px] opacity-75">
                                Joined {new Date(activeOwner.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>

                        {/* Section 1: Contact & Personal Details */}
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                Partner Identity & Contact Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Full Name</span>
                                    <span className="font-semibold text-gray-900">{activeOwner.firstName} {activeOwner.lastName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Registered Phone</span>
                                    <span className="font-semibold text-emerald-700 font-mono text-xs flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3 text-emerald-600" />
                                        {activeOwner.phone || "Not provided"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Email Address</span>
                                    <span className="font-medium text-gray-800 flex items-center gap-1 mt-0.5">
                                        <Mail className="w-3 h-3 text-gray-400" />
                                        {activeOwner.email || "Not provided"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Personal Address</span>
                                    <span className="text-gray-700">{activeOwner.address || "Not specified"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Information */}
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                Business & Facility Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Business Name</span>
                                    <span className="font-semibold text-gray-900">{activeOwner.businessName || "Unnamed Business"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Business Phone</span>
                                    <span className="font-mono text-gray-800">{activeOwner.businessPhone || activeOwner.phone || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Facility Address</span>
                                    <span className="text-gray-700">{activeOwner.businessAddress || activeOwner.address || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Tax ID / GSTIN</span>
                                    <span className="font-mono font-medium text-gray-800">{activeOwner.taxId || "Not registered"}</span>
                                </div>
                                {activeOwner.businessDescription && (
                                    <div className="sm:col-span-2">
                                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Business Description</span>
                                        <p className="text-gray-600 text-xs mt-0.5">{activeOwner.businessDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Official Verification Documents */}
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                                    Official Verification Documentation
                                </span>
                                {(activeOwner.businessRegistrationDoc || activeOwner.identityDoc) ? (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Documents Submitted (Fast Track)
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-medium text-gray-400">
                                        No docs uploaded (Optional)
                                    </span>
                                )}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                                <div className="p-2.5 bg-white rounded-lg border border-gray-200/80 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-[11px]">Business Registration / License</p>
                                        <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                                            {activeOwner.businessRegistrationDoc ? "Document file provided" : "Not submitted"}
                                        </p>
                                    </div>
                                    {activeOwner.businessRegistrationDoc ? (
                                        <a
                                            href={activeOwner.businessRegistrationDoc}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-semibold text-[11px] transition-colors"
                                        >
                                            <span>View</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-gray-400 italic">None</span>
                                    )}
                                </div>

                                <div className="p-2.5 bg-white rounded-lg border border-gray-200/80 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-[11px]">Owner Identity Proof (ID/PAN/Aadhaar)</p>
                                        <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                                            {activeOwner.identityDoc ? "ID document attached" : "Not submitted"}
                                        </p>
                                    </div>
                                    {activeOwner.identityDoc ? (
                                        <a
                                            href={activeOwner.identityDoc}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-semibold text-[11px] transition-colors"
                                        >
                                            <span>View</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-gray-400 italic">None</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Turfs Added by This Owner */}
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                                    Turfs Created by This Owner ({activeOwner.turfs?.length ?? 0})
                                </span>
                            </h4>

                            {activeOwner.turfs && activeOwner.turfs.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                    {activeOwner.turfs.map((t) => (
                                        <div
                                            key={t.id}
                                            className="p-2.5 bg-white rounded-lg border border-gray-200/80 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900">{t.name}</p>
                                                <p className="text-[11px] text-gray-500">
                                                    {t.location || t.city || "Location not set"} • <span className="font-semibold text-emerald-700">₹{t.pricePerHour}/hr</span>
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                t.isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                            }`}>
                                                {t.isPublished ? "Published" : "Draft / Unpublished"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-white rounded-lg border border-dashed border-gray-200 text-center text-xs text-gray-500">
                                    This partner hasn't added any turfs yet.
                                </div>
                            )}
                        </div>

                        {/* Section 5: Custom Platform Commission Rate Override */}
                        <div className="bg-purple-50/50 rounded-xl p-3.5 border border-purple-100">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                                    <Percent className="w-3.5 h-3.5 text-purple-600" />
                                    Custom Platform Fee Override (%)
                                </label>
                                <span className="text-[10px] text-purple-700 font-medium">Default: 5%</span>
                            </div>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={customFeeInput}
                                onChange={(e) => setCustomFeeInput(e.target.value)}
                                placeholder="e.g. 3.5 (Leave empty to use global default)"
                                className="w-full p-2 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <p className="text-[10px] text-purple-700 mt-1">
                                Customize the platform commission fee for this specific partner's turfs.
                            </p>
                        </div>

                        {/* Section 6: Approval Notes / Terms */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {reviewAction === "approve"
                                    ? "Verification Notes / Terms"
                                    : "Reason for Rejection (Required)"}
                            </label>
                            <textarea
                                rows={2}
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder={
                                    reviewAction === "approve"
                                        ? "Add internal verification notes..."
                                        : "Specify why the application is being rejected..."
                                }
                                className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                            />
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveOwner(null);
                                    setReviewAction(null);
                                }}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>

                            {reviewAction === "reject" ? (
                                <button
                                    type="button"
                                    onClick={handleConfirmReview}
                                    disabled={submittingReview}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submittingReview && (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    Confirm Rejection
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleTriggerApproveAction}
                                    disabled={submittingReview}
                                    className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve Partner...
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>

            {/* Step 2: Approval Confirmation Modal */}
            <AdminConfirmModal
                isOpen={showApproveConfirmModal}
                onClose={() => setShowApproveConfirmModal(false)}
                onConfirm={handleConfirmReview}
                loading={submittingReview}
                title="Confirm Partner Approval"
                variant="primary"
                confirmText="Yes, Approve & Activate Partner"
                message={
                    activeOwner ? (
                        <div className="space-y-3 text-xs text-gray-600">
                            <p>
                                Are you sure you want to approve{" "}
                                <strong className="text-gray-900 font-bold">
                                    {activeOwner.firstName} {activeOwner.lastName}
                                </strong>{" "}
                                ({activeOwner.businessName || "Partner"})?
                            </p>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1 font-mono text-[11px]">
                                <div><strong>Phone:</strong> {activeOwner.phone || "—"}</div>
                                <div><strong>Turfs:</strong> {activeOwner.turfs?.length || 0} registered</div>
                                <div>
                                    <strong>Platform Commission:</strong>{" "}
                                    {customFeeInput.trim() ? `${customFeeInput}% (Custom)` : "5.00% (Default)"}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500">
                                This will grant the partner immediate authorization to list facilities, accept user bookings, and collect payout balances.
                            </p>
                        </div>
                    ) : null
                }
            />

            {/* Delete Confirmation Modal */}
            <AdminConfirmModal
                isOpen={Boolean(ownerToDelete)}
                onClose={() => setOwnerToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete Turf Owner"
                variant="danger"
                confirmText="Delete Partner"
                message={
                    ownerToDelete ? (
                        <div>
                            Are you sure you want to permanently delete{" "}
                            <strong className="text-gray-900">
                                {ownerToDelete.firstName} {ownerToDelete.lastName}
                            </strong>{" "}
                            ({ownerToDelete.businessName || "Turf Owner"}) and all their registered
                            facilities? This cannot be undone.
                        </div>
                    ) : null
                }
            />
        </div>
    );
}
