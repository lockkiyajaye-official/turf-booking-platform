import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUserRole = async (
        targetUser: User,
        newRole: User["role"],
    ) => {
        if (targetUser.role === newRole) return;
        if (user && targetUser.id === user.id && newRole !== "admin") {
            alert("You cannot change your own role from admin.");
            return;
        }
        try {
            await api.patch(`/users/${targetUser.id}`, { role: newRole });
            await fetchUsers();
            alert("User role updated successfully.");
        } catch (error: any) {
            alert(
                error.response?.data?.message || "Failed to update user role",
            );
        }
    };

    const handleDeleteUser = async (targetUser: User) => {
        if (user && targetUser.id === user.id) {
            alert("You cannot delete your own account from the admin panel.");
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${targetUser.firstName} ${targetUser.lastName}?`,
        );
        if (!confirmed) return;
        try {
            await api.delete(`/users/${targetUser.id}`);
            await fetchUsers();
            alert("User deleted successfully.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const term = search.toLowerCase();
        return users.filter((u) => {
            const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
            return (
                fullName.includes(term) ||
                (u.email && u.email.toLowerCase().includes(term)) ||
                (u.phone && u.phone.toLowerCase().includes(term))
            );
        });
    }, [users, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading users...
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Platform Users
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage administrators and regular users
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm w-1/3">
                                    User
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Contact
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Role
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-b border-gray-50 hover:bg-red-50/30 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#E33E33] font-bold">
                                                    {u.firstName.charAt(0)}
                                                    {u.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {u.firstName}{" "}
                                                        {u.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Joined{" "}
                                                        {new Date(
                                                            u.createdAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm">
                                                {u.email && (
                                                    <div className="text-gray-900">
                                                        {u.email}
                                                    </div>
                                                )}
                                                {u.phone && (
                                                    <div className="text-gray-500">
                                                        {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={u.role}
                                                onChange={(e) =>
                                                    handleUpdateUserRole(
                                                        u,
                                                        e.target.value as any,
                                                    )
                                                }
                                                className={`text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-red-100 font-semibold appearance-none ${
                                                    u.role === "admin"
                                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                                        : u.role ===
                                                            "turf_owner"
                                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                          : "bg-gray-50 text-gray-700 border-gray-200"
                                                }`}
                                            >
                                                <option value="user">
                                                    User
                                                </option>
                                                <option value="turf_owner">
                                                    Turf Owner
                                                </option>
                                                <option value="admin">
                                                    Admin
                                                </option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(u)
                                                }
                                                disabled={user?.id === u.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
