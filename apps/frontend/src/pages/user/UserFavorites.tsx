import { Heart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TurfCard from "../../components/TurfCard";
import Pagination from "../../components/Pagination";
import { getFavorites, removeFavorite, type Turf } from "../../services/favorites";

export default function UserFavorites() {
    const [favorites, setFavorites] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const fetchFavoritesList = async () => {
        setLoading(true);
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoritesList();
    }, []);

    const handleRemoveFavorite = async (turfId: string) => {
        try {
            await removeFavorite(turfId);
            setFavorites((prev) => prev.filter((t) => t.id !== turfId));
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-red-50 text-[#E33E33] rounded-xl">
                            <Heart className="w-6 h-6 fill-[#E33E33]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                Favorite Venues
                            </h1>
                            <p className="text-gray-500 text-sm font-medium">
                                Your saved turfs for quick access and instant booking
                            </p>
                        </div>
                    </div>
                </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="bg-white rounded-xl h-80 animate-pulse border border-gray-100 p-4 flex flex-col justify-between"
                        >
                            <div className="bg-gray-200 h-48 rounded-lg w-full mb-4" />
                            <div className="bg-gray-200 h-5 rounded w-3/4 mb-2" />
                            <div className="bg-gray-200 h-4 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12">
                    <div className="w-16 h-16 bg-red-50 text-[#E33E33] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No favorite venues saved yet
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Explore available turfs and click the heart icon on any venue to save it to your favorites.
                    </p>
                    <Link
                        to="/turfs"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E33E33] text-white font-bold rounded-xl hover:bg-[#c93329] transition-colors shadow-md shadow-red-200"
                    >
                        <Search className="w-4 h-4" /> Explore Turfs
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites
                            .slice((page - 1) * pageSize, page * pageSize)
                            .map((turf) => (
                                <TurfCard
                                    key={turf.id}
                                    id={turf.id}
                                    name={turf.name}
                                    description={turf.description}
                                    address={turf.address}
                                    pricePerHour={turf.pricePerHour}
                                    images={turf.images}
                                    rating={turf.rating}
                                    totalReviews={turf.totalReviews}
                                    isFavorite={true}
                                    onToggleFavorite={() => handleRemoveFavorite(turf.id)}
                                />
                            ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={Math.max(1, Math.ceil(favorites.length / pageSize))}
                        totalItems={favorites.length}
                        pageSize={pageSize}
                        pageSizeOptions={[6, 12, 24]}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPage(1);
                        }}
                        accentColor="red"
                    />
                </div>
            )}
            </main>
        </div>
    );
}
