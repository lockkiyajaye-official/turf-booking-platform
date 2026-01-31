import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Users, UserCheck, UserX, TrendingUp, AlertCircle } from "lucide-react";

interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user" | "turf_owner";
    isApproved?: boolean;
    businessName?: string;
    createdAt: string;
}

interface Statistics {
    totalUsers: number;
    totalTurfOwners: number;
    totalAdmins: number;
    pendingApprovals: number;
    approvedTurfOwners: number;
}

export default function AdminDashboard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [turfOwners, setTurfOwners] = useState<User[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "turf-owners">("overview");
    const [approvalNotes, setApprovalNotes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, ownersRes] = await Promise.all([
                api.get("/users/statistics"),
                api.get("/users?role=user"),
                api.get("/users/turf-owners"),
            ]);
            setStatistics(statsRes.data);
            setUsers(usersRes.data);
            setTurfOwners(ownersRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ownerId: string) => {
        try {
            await api.post(`/users/turf-owners/${ownerId}/approve`, {
                approvalNotes: approvalNotes[ownerId] || "Approved for business operations",
            });
            await fetchData();
            await refreshUser();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner approved successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to approve turf owner");
        }
    };

    const handleReject = async (ownerId: string) => {
        if (!approvalNotes[ownerId]) {
            alert("Please provide rejection notes");
            return;
        }
        try {
            await api.post(`/users/turf-owners/${ownerId}/reject`, {
                approvalNotes: approvalNotes[ownerId],
            });
            await fetchData();
            await refreshUser();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner rejected");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to reject turf owner");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview"
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "users"
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab("turf-owners")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "turf-owners"
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Turf Owners
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Turf Owners</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.totalTurfOwners}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <UserCheck className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.approvedTurfOwners}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.pendingApprovals}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Admins</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.totalAdmins}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.firstName} {u.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {u.email || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {u.phone || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Turf Owners Tab */}
                {activeTab === "turf-owners" && (
                    <div className="space-y-4">
                        {turfOwners.map((owner) => (
                            <div key={owner.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {owner.firstName} {owner.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{owner.businessName}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {owner.email || owner.phone}
                                        </p>
                                        <div className="mt-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${owner.isApproved
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {owner.isApproved ? "Approved" : "Pending Approval"}
                                            </span>
                                        </div>
                                    </div>
                                    {!owner.isApproved && (
                                        <div className="flex-1 ml-6 space-y-2">
                                            <textarea
                                                placeholder="Approval/Rejection notes..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                                                value={approvalNotes[owner.id] || ""}
                                                onChange={(e) =>
                                                    setApprovalNotes({ ...approvalNotes, [owner.id]: e.target.value })
                                                }
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(owner.id)}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(owner.id)}
                                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
