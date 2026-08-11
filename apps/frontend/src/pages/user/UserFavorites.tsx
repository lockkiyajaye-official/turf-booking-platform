import { Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TurfCard from "../../components/TurfCard";
import { getFavorites, removeFavorite, type Turf } from "../../services/favorites";

export default function UserFavorites() {
    const [favorites, setFavorites] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-red-50 text-[#E33E33] rounded-xl">
                        <Heart className="w-6 h-6 fill-[#E33E33]" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                            Favorite Venues
                        </h1>
                        <p className="text-gray-500 text-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((turf) => (
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
            )}
        </div>
    );
}
