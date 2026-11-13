import {
    BookmarkPlus,
    Edit3,
    Eye,
    EyeOff,
    MapPin,
    Plus,
    Search,
    Star,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DirectBookingModal from "../../components/turf-owner/DirectBookingModal";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { Turf } from "./types";

export default function OwnerTurfs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [directBookingTurfId, setDirectBookingTurfId] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTurfs = useCallback(
        async (targetPage = page, targetPageSize = pageSize, targetSearch = searchQuery) => {
            try {
                setLoading(true);
                const params: Record<string, any> = {
                    page: targetPage,
                    limit: targetPageSize,
                };
                if (targetSearch.trim()) {
                    params.search = targetSearch.trim();
                }
                const response = await api.get("/turfs/my-turfs", { params });
                const data = response.data;

                if (data && typeof data === "object" && "items" in data) {
                    setTurfs(data.items || []);
                    setTotalItems(data.total || 0);
                    setTotalPages(data.totalPages || 1);
                    setPage(data.page || targetPage);
                } else if (Array.isArray(data)) {
                    setTurfs(data);
                    setTotalItems(data.length);
                    setTotalPages(Math.ceil(data.length / targetPageSize) || 1);
                } else {
                    setTurfs([]);
                    setTotalItems(0);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Failed to fetch turfs:", error);
            } finally {
                setLoading(false);
            }
        },
        [page, pageSize, searchQuery]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTurfs(1, pageSize, searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, pageSize]);

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
        if (
            !confirm(
                "Are you sure you want to permanently delete this unpublished turf? This cannot be undone.",
            )
        )
            return;
        try {
            await api.delete(`/turfs/${id}`);
            fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete turf");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                    <div className="flex items-center justify-center p-12 min-h-[50vh]">
                        <span className="text-gray-500 font-medium animate-pulse">
                            Loading your turfs...
                        </span>
                    </div>
                </main>
            </div>
        );
    }

    const isApproved = user?.isApproved;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My Turfs
                        </h1>
                        <p className="text-gray-600 mt-1 font-medium tracking-wide">
                            Manage your sports facilities, availability, and pricing
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDirectBookingTurfId(turfs[0]?.id || "")}
                            disabled={turfs.length === 0}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50"
                        >
                            <BookmarkPlus className="w-4 h-4 text-purple-600" />
                            <span>Direct Booking</span>
                        </button>
                        <button
                            onClick={() => navigate("/owner/turfs/new")}
                            className="bg-[#E33E33] text-white px-5 py-2.5 rounded-xl hover:bg-red-700 flex items-center gap-2 font-bold shadow-xs transition-colors"
                        >
                            <Plus className="w-5 h-5" /> Add New Turf
                        </button>
                    </div>
                </div>

                {/* Search Bar (matching Mobile search capability) */}
                {(totalItems > 0 || searchQuery) && (
                    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your turfs by name, city, address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm font-medium transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                            Total {totalItems} venue{totalItems !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}

                {totalItems === 0 && !searchQuery ? (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl shadow-xs">
                        <span className="text-6xl mb-4 block">🏟️</span>
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                            No turfs listed yet
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                            Create your first turf listing to start managing time slots
                            and receiving online player bookings.
                        </p>
                        <button
                            onClick={() => navigate("/owner/turfs/new")}
                            className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-xs"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Listing
                        </button>
                    </div>
                ) : turfs.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-xs">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            No turfs found
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            No venues matched "{searchQuery}". Try a different search term.
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-[#E33E33] font-bold text-sm hover:underline"
                        >
                            Clear search filter
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {turfs.map((turf) => (
                                <TurfOwnerCard
                                    key={turf.id}
                                    turf={turf}
                                    isApproved={!!isApproved}
                                    onView={() => navigate(`/owner/turfs/${turf.id}`)}
                                    onEdit={() =>
                                        navigate(`/owner/turfs/${turf.id}?edit=true`)
                                    }
                                    onDirectBooking={() =>
                                        setDirectBookingTurfId(turf.id)
                                    }
                                    onPublish={handlePublish}
                                    onUnpublish={handleUnpublish}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            pageSizeOptions={[6, 12, 24]}
                            onPageChange={(newPage) => {
                                setPage(newPage);
                                fetchTurfs(newPage, pageSize, searchQuery);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setPage(1);
                                fetchTurfs(1, newSize, searchQuery);
                            }}
                            accentColor="red"
                        />
                    </div>
                )}
            </main>

            {/* Direct Booking Modal */}
            <DirectBookingModal
                isOpen={directBookingTurfId !== null}
                onClose={() => setDirectBookingTurfId(null)}
                initialTurfId={directBookingTurfId || undefined}
                onSuccess={() => fetchTurfs()}
            />
        </div>
    );
}

interface TurfOwnerCardProps {
    turf: Turf;
    isApproved: boolean;
    onView: () => void;
    onEdit: () => void;
    onDirectBooking: () => void;
    onPublish: (id: string) => void;
    onUnpublish: (id: string) => void;
    onDelete: (id: string) => void;
}

function TurfOwnerCard({
    turf,
    isApproved,
    onView,
    onEdit,
    onDirectBooking,
    onPublish,
    onUnpublish,
    onDelete,
}: TurfOwnerCardProps) {
    const coverImage = turf.images?.[0];
    const ratingNum = typeof (turf as any).rating === "number" ? (turf as any).rating : null;
    const totalReviews = (turf as any).totalReviews || 0;

    return (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div
                className="h-48 bg-gray-50 relative overflow-hidden cursor-pointer"
                onClick={onView}
            >
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={turf.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl opacity-20">🏟️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {ratingNum !== null && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm bg-black/60 backdrop-blur-xs text-white flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {ratingNum.toFixed(1)} {totalReviews > 0 ? `(${totalReviews})` : ""}
                        </span>
                    )}
                    <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm text-white ${
                            turf.isPublished ? "bg-emerald-600" : "bg-gray-600"
                        }`}
                    >
                        {turf.isPublished ? "Published" : "Draft"}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3
                    className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-[#E33E33] transition-colors"
                    onClick={onView}
                >
                    {turf.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">
                    {turf.description}
                </p>

                <div className="flex items-start text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                        {[turf.address, turf.city, turf.state]
                            .filter(Boolean)
                            .join(", ")}
                    </span>
                </div>

                {turf.sports && turf.sports.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {turf.sports.slice(0, 3).map((sport) => (
                            <span
                                key={sport}
                                className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[11px] font-semibold text-gray-600"
                            >
                                {sport}
                            </span>
                        ))}
                        {turf.sports.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[11px] font-semibold text-gray-400">
                                +{turf.sports.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Rate
                        </span>
                        <div className="font-extrabold text-[#E33E33] text-lg">
                            ₹{turf.pricePerHour}
                            <span className="text-xs text-gray-500 font-medium">/hr</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onView}
                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                        >
                            <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                            onClick={onEdit}
                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                            title="Edit Turf Details"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                            onClick={onDirectBooking}
                            title="Lock Direct / Offline Slot"
                            className="p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors shrink-0 border border-purple-200/60"
                        >
                            <BookmarkPlus className="w-4 h-4" />
                        </button>
                        {turf.isPublished ? (
                            <button
                                onClick={() => onUnpublish(turf.id)}
                                className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                            >
                                <EyeOff className="w-3.5 h-3.5" /> Unpublish
                            </button>
                        ) : (
                            <button
                                onClick={() => onPublish(turf.id)}
                                disabled={!isApproved}
                                title={
                                    !isApproved
                                        ? "Awaiting admin approval"
                                        : ""
                                }
                                className="flex-1 bg-[#E33E33] text-white hover:bg-red-700 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                                <Eye className="w-3.5 h-3.5" /> Publish
                            </button>
                        )}
                        {!turf.isPublished && (
                            <button
                                onClick={() => onDelete(turf.id)}
                                title="Delete unpublished turf"
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
