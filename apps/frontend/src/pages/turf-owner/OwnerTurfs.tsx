import { Eye, EyeOff, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { Turf } from "./types";

export default function OwnerTurfs() {
    const { user } = useAuth();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        pricePerHour: "",
        amenities: "",
        availableSlots: "",
    });

    useEffect(() => {
        fetchTurfs();
    }, []);

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
            alert("Turf published successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish turf");
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/unpublish`);
            await fetchTurfs();
            alert("Turf unpublished successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to unpublish turf");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const turfData = {
                ...formData,
                pricePerHour: parseFloat(formData.pricePerHour),
                amenities: formData.amenities
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                availableSlots: formData.availableSlots
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            };
            await api.post("/turfs", turfData);
            setShowForm(false);
            setFormData({
                name: "",
                description: "",
                address: "",
                pricePerHour: "",
                amenities: "",
                availableSlots: "",
            });
            fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create turf");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this turf?")) return;
        try {
            await api.delete(`/turfs/${id}`);
            fetchTurfs();
        } catch (error) {
            alert("Failed to delete turf");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading your turfs...
                </span>
            </div>
        );
    }

    const isApproved = user?.isApproved;

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        My Turfs
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage your turf listings and availability
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#E33E33] text-white px-5 py-2.5 rounded-xl hover:bg-red-700 flex items-center gap-2 font-bold shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add New Turf
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#E33E33]"></div>
                    <h2 className="text-2xl font-black text-gray-900 mb-6">
                        Create New Listing
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Turf Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Price per Hour (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                    value={formData.pricePerHour}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pricePerHour: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Description *
                            </label>
                            <textarea
                                required
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Address *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Amenities{" "}
                                    <span className="text-gray-400 font-normal">
                                        (comma-separated)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Parking, Water, Floodlights"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                    value={formData.amenities}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amenities: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Available Slots{" "}
                                    <span className="text-gray-400 font-normal">
                                        (comma-separated)
                                    </span>{" "}
                                    *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 06:00-07:00, 18:00-19:00"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                                    value={formData.availableSlots}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            availableSlots: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                className="bg-[#E33E33] hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors"
                            >
                                Submit Listing
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {turfs.length === 0 && !showForm ? (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl border-dashed">
                    <span className="text-6xl mb-4 block">🏟️</span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        No turfs listed yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Create your first turf listing to start receiving
                        bookings.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                    >
                        Create Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {turfs.map((turf) => (
                        <div
                            key={turf.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all"
                        >
                            <div className="h-48 bg-gray-50 relative flex items-center justify-center group">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                                    <img src="/logo.png" />
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span
                                        className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm text-white ${
                                            turf.isPublished
                                                ? "bg-green-500"
                                                : "bg-gray-500"
                                        }`}
                                    >
                                        {turf.isPublished
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3
                                    className="text-xl font-black text-gray-900 mb-2 line-clamp-1"
                                    title={turf.name}
                                >
                                    {turf.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {turf.description}
                                </p>

                                <div className="flex items-start text-sm text-gray-500 mb-6">
                                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">
                                        {turf.address}
                                    </span>
                                </div>

                                <div className="mt-auto border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Pricing
                                        </span>
                                        <div className="font-black text-[#E33E33] text-lg">
                                            ₹{turf.pricePerHour}
                                            <span className="text-sm text-gray-500 font-medium">
                                                /hr
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {turf.isPublished ? (
                                            <button
                                                onClick={() =>
                                                    handleUnpublish(turf.id)
                                                }
                                                className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                                            >
                                                <EyeOff className="w-4 h-4" />{" "}
                                                Unpublish
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handlePublish(turf.id)
                                                }
                                                disabled={!isApproved}
                                                className="flex-1 bg-[#E33E33] text-white hover:bg-red-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                title={
                                                    !isApproved
                                                        ? "Awaiting admin approval"
                                                        : ""
                                                }
                                            >
                                                <Eye className="w-4 h-4" />{" "}
                                                Publish
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDelete(turf.id)
                                            }
                                            className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                                            title="Delete Turf"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
