import {
    Eye, EyeOff, MapPin, Plus, Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { Turf } from "./types";

export default function OwnerTurfs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTurfs(); }, []);

    const fetchTurfs = async () => {
        try {
            const response = await api.get("/turfs/my-turfs");
            setTurfs(response.data);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/publish`);
            await fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish turf");
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/unpublish`);
            await fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to unpublish turf");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this turf?")) return;
        try {
            await api.delete(`/turfs/${id}`);
            fetchTurfs();
        } catch {
            alert("Failed to delete turf");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-screen">
                <span className="text-gray-500 font-medium animate-pulse">Loading your turfs...</span>
            </div>
        );
    }

    const isApproved = user?.isApproved;

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Turfs</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your turf listings and availability</p>
                </div>
                <button
                    onClick={() => navigate("/owner/turfs/new")}
                    className="bg-[#E33E33] text-white px-5 py-2.5 rounded-xl hover:bg-red-700 flex items-center gap-2 font-bold shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add New Turf
                </button>
            </div>

            {turfs.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                    <span className="text-6xl mb-4 block">🏟️</span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No turfs listed yet</h3>
                    <p className="text-gray-500 mb-6">Create your first turf listing to start receiving bookings.</p>
                    <button onClick={() => navigate("/owner/turfs/new")}
                        className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                        Create Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {turfs.map((turf) => (
                        <TurfOwnerCard
                            key={turf.id}
                            turf={turf}
                            isApproved={!!isApproved}
                            onView={() => navigate(`/owner/turfs/${turf.id}`)}
                            onPublish={handlePublish}
                            onUnpublish={handleUnpublish}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface TurfOwnerCardProps {
    turf: Turf;
    isApproved: boolean;
    onView: () => void;
    onPublish: (id: string) => void;
    onUnpublish: (id: string) => void;
    onDelete: (id: string) => void;
}

function TurfOwnerCard({ turf, isApproved, onView, onPublish, onUnpublish, onDelete }: TurfOwnerCardProps) {
    const coverImage = turf.images?.[0];
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="h-48 bg-gray-50 relative overflow-hidden cursor-pointer" onClick={onView}>
                {coverImage ? (
                    <img src={coverImage} alt={turf.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl opacity-20">🏟️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm text-white ${turf.isPublished ? "bg-green-500" : "bg-gray-500"}`}>
                        {turf.isPublished ? "Published" : "Draft"}
                    </span>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-[#E33E33] transition-colors" onClick={onView}>
                    {turf.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">{turf.description}</p>
                <div className="flex items-start text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{turf.address}</span>
                </div>
                <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                        <div className="font-black text-[#E33E33] text-lg">
                            ₹{turf.pricePerHour}<span className="text-sm text-gray-500 font-medium">/hr</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onView}
                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                            <Eye className="w-4 h-4" /> View
                        </button>
                        {turf.isPublished ? (
                            <button onClick={() => onUnpublish(turf.id)}
                                className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                                <EyeOff className="w-4 h-4" /> Unpublish
                            </button>
                        ) : (
                            <button onClick={() => onPublish(turf.id)} disabled={!isApproved}
                                title={!isApproved ? "Awaiting admin approval" : ""}
                                className="flex-1 bg-[#E33E33] text-white hover:bg-red-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                <Eye className="w-4 h-4" /> Publish
                            </button>
                        )}
                        <button onClick={() => onDelete(turf.id)}
                            className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
