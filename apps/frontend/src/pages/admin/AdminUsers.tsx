import {
    ArrowUpDown,
    Check,
    Copy,
    Shield,
    Trash2,
    UserCheck,
    Users,
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
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user" | "turf_owner";
    createdAt: string;
}

export default function AdminUsers() {
    const { user: currentAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleTab, setRoleTab] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Role Change Modal
    const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
    const [selectedNewRole, setSelectedNewRole] = useState<User["role"]>("user");
    const [updatingRole, setUpdatingRole] = useState(false);

    // Delete Modal
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users", { params: { limit: 100 } });
            const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
            setUsers(items);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            showFeedback("error", "Failed to fetch user directory.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type: "success" | "error", text: string) => {
        setActionFeedback({ type, text });
        setTimeout(() => setActionFeedback(null), 3500);
    };

    const handleConfirmRoleChange = async () => {
        if (!userToUpdateRole) return;
        if (userToUpdateRole.role === selectedNewRole) {
            setUserToUpdateRole(null);
            return;
        }
        if (currentAdmin && userToUpdateRole.id === currentAdmin.id && selectedNewRole !== "admin") {
            showFeedback("error", "You cannot demote your own active admin account.");
            setUserToUpdateRole(null);
            return;
        }
        try {
            setUpdatingRole(true);
            await api.patch(`/users/${userToUpdateRole.id}`, { role: selectedNewRole });
            setUsers((prev) =>
                prev.map((u) => (u.id === userToUpdateRole.id ? { ...u, role: selectedNewRole } : u)),
            );
            showFeedback(
                "success",
                `Updated ${userToUpdateRole.firstName}'s role to ${selectedNewRole.replace("_", " ")}.`,
            );
            setUserToUpdateRole(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to update user role",
            );
        } finally {
            setUpdatingRole(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        if (currentAdmin && userToDelete.id === currentAdmin.id) {
            showFeedback("error", "You cannot delete your own account.");
            setUserToDelete(null);
            return;
        }

        try {
            setDeleting(true);
            await api.delete(`/users/${userToDelete.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
            showFeedback(
                "success",
                `User ${userToDelete.firstName} ${userToDelete.lastName} deleted.`,
            );
            setUserToDelete(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showFeedback(
                "error",
                err.response?.data?.message || "Failed to delete user",
            );
        } finally {
            setDeleting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    // User counts
    const userCounts = useMemo(() => {
        const counts = { all: users.length, user: 0, turf_owner: 0, admin: 0 };
        users.forEach((u) => {
            if (counts[u.role] !== undefined) counts[u.role]++;
        });
        return counts;
    }, [users]);

    // Filter & Sort
    const filteredUsers = useMemo(() => {
        let list = [...users];

        if (roleTab !== "all") {
            list = list.filter((u) => u.role === roleTab);
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            list = list.filter((u) => {
                const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                return (
                    fullName.includes(term) ||
                    (u.email && u.email.toLowerCase().includes(term)) ||
                    (u.phone && u.phone.toLowerCase().includes(term))
                );
            });
        }

        list.sort((a, b) => {
            if (sortBy === "name") {
                return a.firstName.localeCompare(b.firstName);
            }
            if (sortBy === "oldest") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return list;
    }, [users, roleTab, search, sortBy]);

    // Pagination slice
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Platform Users"
                description="Manage customer accounts, business turf owners, and admin permissions"
                badge={`${users.length} Total`}
            />

            {/* Notification alert banner */}
            {actionFeedback && (
                <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
                        actionFeedback.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                >
                    <span>{actionFeedback.text}</span>
                    <button
                        onClick={() => setActionFeedback(null)}
                        className="text-xs opacity-75 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Top Stat Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <AdminStatCard
                    title="Total Accounts"
                    value={userCounts.all}
                    icon={Users}
                    iconColor="text-gray-700"
                    iconBg="bg-gray-100"
                />
                <AdminStatCard
                    title="Regular Users"
                    value={userCounts.user}
                    icon={Users}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <AdminStatCard
                    title="Turf Owners"
                    value={userCounts.turf_owner}
                    icon={UserCheck}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <AdminStatCard
                    title="Admins"
                    value={userCounts.admin}
                    icon={Shield}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                />
            </div>

            {/* Filters Toolbar */}
            <AdminFilterBar
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search by name, email, or phone..."
                tabs={[
                    { id: "all", label: "All Roles", count: userCounts.all },
                    { id: "user", label: "Users", count: userCounts.user },
                    { id: "turf_owner", label: "Turf Owners", count: userCounts.turf_owner },
                    { id: "admin", label: "Admins", count: userCounts.admin },
                ]}
                activeTab={roleTab}
                onTabChange={(tab) => {
                    setRoleTab(tab);
                    setCurrentPage(1);
                }}
                hasActiveFilters={Boolean(search || roleTab !== "all" || sortBy !== "newest")}
                onResetFilters={() => {
                    setSearch("");
                    setRoleTab("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                }}
                rightSlot={
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    e.target.value as "newest" | "oldest" | "name",
                                )
                            }
                            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-200"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                }
            />

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 text-sm animate-pulse">
                        Loading platform users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <AdminEmptyState
                        title="No users match your criteria"
                        description="Try modifying your role filter or search term."
                        onResetFilters={() => {
                            setSearch("");
                            setRoleTab("all");
                        }}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-5">User</th>
                                        <th className="py-3 px-5">Contact Details</th>
                                        <th className="py-3 px-5">Role Permission</th>
                                        <th className="py-3 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {paginatedUsers.map((u) => {
                                        const initials = `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
                                        const isSelf = currentAdmin?.id === u.id;

                                        return (
                                            <tr
                                                key={u.id}
                                                className="hover:bg-gray-50/70 transition-colors"
                                            >
                                                {/* User Info */}
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-red-100/70 border border-red-200 text-[#E33E33] font-bold text-xs flex items-center justify-center shrink-0">
                                                            {initials || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                                <span>
                                                                    {u.firstName} {u.lastName}
                                                                </span>
                                                                {isSelf && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-semibold">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                                Joined{" "}
                                                                {new Date(
                                                                    u.createdAt,
                                                                ).toLocaleDateString("en-IN", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="py-3.5 px-5">
                                                    <div className="space-y-0.5">
                                                        {u.email ? (
                                                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                                                <span>{u.email}</span>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(u.email!)
                                                                    }
                                                                    className="text-gray-400 hover:text-gray-600 p-0.5"
                                                                    title="Copy email"
                                                                >
                                                                    {copiedEmail === u.email ? (
                                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">
                                                                No email provided
                                                            </span>
                                                        )}
                                                        {u.phone && (
                                                            <p className="text-[11px] text-gray-500 font-mono">
                                                                {u.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Role Permission */}
                                                <td className="py-3.5 px-5">
                                                    <AdminBadge status={u.role} />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="inline-flex items-center gap-2 justify-end">
                                                        {!isSelf && (
                                                            <button
                                                                onClick={() => {
                                                                    setUserToUpdateRole(u);
                                                                    setSelectedNewRole(u.role);
                                                                }}
                                                                className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                                                                title="Change user role"
                                                            >
                                                                <Shield className="w-3 h-3 text-gray-400" />
                                                                <span>Change Role</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setUserToDelete(u)}
                                                            disabled={isSelf}
                                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title={
                                                                isSelf
                                                                    ? "Cannot delete your own account"
                                                                    : "Delete User"
                                                            }
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
                            totalItems={filteredUsers.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </>
                )}
            </div>

            {/* Role Change Modal */}
            <AdminModal
                isOpen={Boolean(userToUpdateRole)}
                onClose={() => setUserToUpdateRole(null)}
                title="Change User Role"
                description={
                    userToUpdateRole
                        ? `Update permissions for ${userToUpdateRole.firstName} ${userToUpdateRole.lastName} (${userToUpdateRole.email || userToUpdateRole.phone || "No contact"})`
                        : undefined
                }
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select New Role
                        </label>
                        <select
                            value={selectedNewRole}
                            onChange={(e) =>
                                setSelectedNewRole(e.target.value as User["role"])
                            }
                            className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33]"
                        >
                            <option value="user">User (Standard customer / booking account)</option>
                            <option value="turf_owner">Turf Owner (Manage arenas, schedules & payouts)</option>
                            <option value="admin">Admin (Full administrative access)</option>
                        </select>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                        <span>Current Active Role:</span>
                        <strong className="text-gray-800 uppercase font-bold">
                            {userToUpdateRole?.role.replace("_", " ")}
                        </strong>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setUserToUpdateRole(null)}
                            disabled={updatingRole}
                            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmRoleChange}
                            disabled={updatingRole || selectedNewRole === userToUpdateRole?.role}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#E33E33] hover:bg-[#c9352b] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {updatingRole && (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            <span>Confirm Role Change</span>
                        </button>
                    </div>
                </div>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminConfirmModal
                isOpen={Boolean(userToDelete)}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete User Account"
                variant="danger"
                confirmText="Delete Account"
                message={
                    userToDelete ? (
                        <div>
                            Are you sure you want to permanently delete{" "}
                            <strong className="text-gray-900">
                                {userToDelete.firstName} {userToDelete.lastName}
                            </strong>{" "}
                            ({userToDelete.email || userToDelete.phone})? This will revoke access
                            and delete their profile.
                        </div>
                    ) : null
                }
            />
        </div>
    );
}
