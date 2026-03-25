import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TurfCard from "../components/TurfCard";

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
    const { user } = useAuth();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(routerLocation.search);
        const searchQuery = params.get("search");
        
        const fetchTurfsQuery = async () => {
            try {
                setLoading(true);
                const queryParams: any = {};
                if (searchQuery) {
                    queryParams.search = searchQuery;
                    setSearch(searchQuery);
                }
                const response = await api.get("/turfs", { params: queryParams });
                setTurfs(response.data);
            } catch (error) {
                console.error("Failed to fetch turfs:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTurfsQuery();
    }, [routerLocation.search]);

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
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                <div className="mb-10 max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Find Your Perfect Turf
                    </h1>
                    <p className="text-lg text-gray-500 mb-6">
                        Discover top-rated turfs around you and book instantly.
                    </p>
                    
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by location, name or sport..."
                                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-base transition-colors shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && fetchTurfs()}
                            />
                        </div>
                        <button
                            onClick={fetchTurfs}
                            className="bg-[#e53935] text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-sm whitespace-nowrap"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {turfs.map((turf) => (
                        <TurfCard
                            key={turf.id}
                            {...turf}
                            onClick={() => {
                                if (user) {
                                    navigate(`/turfs/${turf.id}`);
                                } else {
                                    navigate("/login", {
                                        state: { returnTo: `/turfs/${turf.id}` },
                                    });
                                }
                            }}
                        />
                    ))}
                </div>

                {turfs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 mt-6">
                        <span className="text-5xl mb-4 block opacity-40">🏟️</span>
                        <p className="text-gray-500 text-lg font-medium">
                            No turfs found. Try a different search.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
