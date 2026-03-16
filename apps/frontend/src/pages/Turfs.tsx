import { MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Turf {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    amenities: string[];
    images: string[];
    rating: number | string;
    totalReviews: number;
}

export default function Turfs() {
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchTurfs();
    }, []);

    const fetchTurfs = async () => {
        try {
            const response = await api.get("/turfs", {
                params: { search },
            });
            setTurfs(response.data);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading turfs...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Find Your Perfect Turf
                    </h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search turfs..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && fetchTurfs()
                            }
                        />
                        <button
                            onClick={fetchTurfs}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {turfs.map((turf) => {
                        const ratingValue =
                            typeof turf.rating === "number"
                                ? turf.rating
                                : turf.rating
                                  ? parseFloat(turf.rating as string)
                                  : 0;

                        return (
                            <Link
                                key={turf.id}
                                to={`/turfs/${turf.id}`}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                {turf.images && turf.images.length > 0 ? (
                                    <img
                                        src={turf.images[0]}
                                        alt={turf.name}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-green-100 flex items-center justify-center">
                                        <span className="text-4xl">⚽</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">
                                        {turf.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {turf.description}
                                    </p>
                                    <div className="flex items-center text-gray-500 text-sm mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="truncate">
                                            {turf.address}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span className="text-sm font-medium">
                                                {ratingValue > 0
                                                    ? ratingValue.toFixed(1)
                                                    : "New"}
                                            </span>
                                            {turf.totalReviews > 0 && (
                                                <span className="text-sm text-gray-500 ml-1">
                                                    ({turf.totalReviews})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-green-600 font-semibold">
                                            <span className="mr-1">₹</span>
                                            <span>
                                                {turf.pricePerHour.toLocaleString(
                                                    "en-IN",
                                                )}
                                                /hr
                                            </span>
                                        </div>
                                    </div>
                                    {turf.amenities &&
                                        turf.amenities.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {turf.amenities
                                                    .slice(0, 3)
                                                    .map((amenity, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {turfs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No turfs found. Try a different search.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
