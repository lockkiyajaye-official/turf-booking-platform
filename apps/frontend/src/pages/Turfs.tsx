import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TurfCard from "../components/TurfCard";
import Pagination from "../components/Pagination";
import { addFavorite, getFavorites, removeFavorite } from "../services/favorites";

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
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!user) return;
        getFavorites()
            .then((favs) => setFavoriteIds(new Set(favs.map((f) => f.id))))
            .catch(() => {});
    }, [user]);

    const handleToggleFavorite = async (turfId: string) => {
        if (!user) {
            navigate("/login", { state: { returnTo: "/turfs" } });
            return;
        }
        const isFav = favoriteIds.has(turfId);
        try {
            if (isFav) {
                await removeFavorite(turfId);
                setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    next.delete(turfId);
                    return next;
                });
            } else {
                await addFavorite(turfId);
                setFavoriteIds((prev) => new Set(prev).add(turfId));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const fetchTurfs = useCallback(
        async (targetPage = page, targetPageSize = pageSize, querySearch = search) => {
            try {
                setLoading(true);
                const queryParams: Record<string, any> = {
                    page: targetPage,
                    limit: targetPageSize,
                };
                if (querySearch.trim()) {
                    queryParams.search = querySearch.trim();
                }

                const response = await api.get("/turfs", { params: queryParams });
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
        [page, pageSize, search]
    );

    useEffect(() => {
        const params = new URLSearchParams(routerLocation.search);
        const searchQuery = params.get("search") || "";
        if (searchQuery) {
            setSearch(searchQuery);
        }
        fetchTurfs(1, pageSize, searchQuery);
    }, [routerLocation.search, pageSize]);

    const handleSearchSubmit = () => {
        setPage(1);
        fetchTurfs(1, pageSize, search);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchTurfs(newPage, pageSize, search);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1);
        fetchTurfs(1, newPageSize, search);
    };

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
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                            />
                        </div>
                        <button
                            onClick={handleSearchSubmit}
                            className="bg-[#e53935] text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div
                                key={n}
                                className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 p-4 flex flex-col justify-between"
                            >
                                <div className="bg-gray-200 h-48 rounded-xl w-full mb-4" />
                                <div className="bg-gray-200 h-5 rounded w-3/4 mb-2" />
                                <div className="bg-gray-200 h-4 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : turfs.length > 0 ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {turfs.map((turf) => (
                                <TurfCard
                                    key={turf.id}
                                    {...turf}
                                    isFavorite={favoriteIds.has(turf.id)}
                                    onToggleFavorite={() => handleToggleFavorite(turf.id)}
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

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            pageSizeOptions={[8, 12, 24, 36]}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            accentColor="red"
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-6 shadow-xs">
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
