import { CheckCircle, FileText, Search, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { TurfOwner } from "./types";

export default function AdminTurfOwners() {
    const [owners, setOwners] = useState<TurfOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>(
        {},
    );

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const res = await api.get("/users/turf-owners");
            setOwners(res.data);
        } catch (error) {
            console.error("Failed to fetch turf owners:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ownerId: string) => {
        try {
            await api.post(`/users/turf-owners/${ownerId}/approve`, {
                approvalNotes:
                    approvalNotes[ownerId] ||
                    "Approved for business operations",
            });
            await fetchOwners();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner approved!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to approve owner");
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
            await fetchOwners();
            setApprovalNotes({ ...approvalNotes, [ownerId]: "" });
            alert("Turf owner rejected");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to reject owner");
        }
    };

    const handleDelete = async (ownerId: string) => {
        const confirmed = window.confirm(
            "Delete this turf owner and all associated turfs?",
        );
        if (!confirmed) return;
        try {
            await api.delete(`/users/${ownerId}`);
            await fetchOwners();
            alert("Owner deleted successfully.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete owner");
        }
    };

    const filteredOwners = useMemo(() => {
        if (!search.trim()) return owners;
        const term = search.toLowerCase();
        return owners.filter((o) => {
            return (
                `${o.firstName} ${o.lastName}`.toLowerCase().includes(term) ||
                (o.businessName &&
                    o.businessName.toLowerCase().includes(term)) ||
                (o.email && o.email.toLowerCase().includes(term)) ||
                (o.phone && o.phone.toLowerCase().includes(term))
            );
        });
    }, [owners, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading turf owners...
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Turf Owners
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage and approve turf business owners
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search owners or businesses..."
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
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Owner Details
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Business
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Status
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm">
                                    Approval Notes
                                </th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-sm text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOwners.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        No turf owners found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOwners.map((o) => (
                                    <tr
                                        key={o.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-gray-900">
                                                {o.firstName} {o.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {o.email || o.phone}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-gray-800">
                                                {o.businessName || "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-400 line-clamp-1">
                                                {o.address}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    o.isApproved
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                }`}
                                            >
                                                {o.isApproved
                                                    ? "Approved"
                                                    : "Pending"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="relative">
                                                <FileText className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Notes..."
                                                    value={
                                                        approvalNotes[o.id] ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setApprovalNotes({
                                                            ...approvalNotes,
                                                            [o.id]: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {!o.isApproved && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(o.id)
                                                        }
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve Owner"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleReject(o.id)
                                                        }
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Reject Owner"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleDelete(o.id)
                                                }
                                                className="p-2 text-gray-400 hover:text-[#E33E33] hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Owner"
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
