import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Search, Bell } from "lucide-react";
import api from "../../services/api";
import TurfCard from "../../components/TurfCard";

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

export default function UserHome() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [location, setLocation] = useState("Andhra Pradesh");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSport, setSelectedSport] = useState("All");
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [turfsLoading, setTurfsLoading] = useState(true);

    const sports = ["All", "Football", "Cricket", "Badminton"];

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role === "turf_owner") {
            navigate("/dashboard/turfs");
            return;
        }
        if (user.role === "admin") {
            navigate("/admin/dashboard");
            return;
        }

        // Location Detection Mechanism
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
                        );
                        if (!res.ok)
                            throw new Error("Reverse geocoding failed");
                        const data = await res.json();
                        const city =
                            data.address.city ||
                            data.address.town ||
                            data.address.state_district ||
                            "Andhra Pradesh";
                        setLocation(city);
                    } catch (error) {
                        console.error(
                            "Geocoding failed, keeping default:",
                            error,
                        );
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                },
                { timeout: 10000 },
            );
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (!user || user.role !== "user") return;

        const fetchTurfs = async () => {
            try {
                setTurfsLoading(true);
                // Combine location, search, and selected sport
                let query = location === "Andhra Pradesh" ? "" : location;
                if (searchQuery) query += ` ${searchQuery}`;
                if (selectedSport !== "All") query += ` ${selectedSport}`;

                const response = await api.get("/turfs", {
                    params: { search: query.trim() },
                });
                setTurfs(response.data);
            } catch (error) {
                console.error("Failed to fetch turfs:", error);
            } finally {
                setTurfsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchTurfs, 300); // Debounce fetch
        return () => clearTimeout(timeoutId);
    }, [location, searchQuery, selectedSport, user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Top Bar Header */}
            <header className="bg-white px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                <div className="flex items-center text-gray-700 min-w-max">
                    <MapPin className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium">{location}</span>
                </div>

                <div className="w-full md:max-w-xl lg:max-w-2xl">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search turf by location, name or sport"
                            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-end">
                    <button className="p-2.5 bg-gray-50 rounded-full text-red-500 hover:bg-red-50 transition-colors relative">
                        <Bell className="w-5 h-5 fill-red-500" />
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
                {/* Filter Chips Layer */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {sports.map((sport) => (
                        <button
                            key={sport}
                            onClick={() => setSelectedSport(sport)}
                            className={`px-6 py-2 rounded-md whitespace-nowrap text-sm font-semibold transition-all ${
                                selectedSport === sport
                                    ? "bg-[#e53935] text-white shadow-md shadow-red-500/20"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {sport}
                        </button>
                    ))}
                </div>

                {/* Promotional Banner */}
                <div className="mt-4 relative bg-[#d63a3a] rounded-xl shadow-sm border border-red-700/20 overflow-hidden min-h-[220px]">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 border-[1px] border-white/20 rounded-full blur-sm"></div>
                    <div className="absolute right-10 -bottom-10 w-72 h-72 border-[1px] border-white/10 rounded-full blur-sm"></div>

                    <div className="relative h-full flex flex-col md:flex-row items-center justify-between p-8 md:px-12">
                        <div className="text-white z-10 max-w-lg">
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                                Special Weekend Offer
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 mb-7 leading-snug">
                                Get 20% off on all
                                <br />
                                Bookings this weekend
                            </p>
                            <button className="bg-white text-[#d63a3a] font-bold px-8 py-2.5 rounded hover:bg-gray-50 transition-colors shadow-sm tracking-wide">
                                20% OFF
                            </button>
                        </div>
                        <div className="hidden lg:block absolute right-0 bottom-0 h-[115%] z-10 translate-x-12 translate-y-6">
                            {/* Decorative Football Player Layout matching reference banner */}
                            <img
                                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"
                                alt="Football player celebration"
                                className="h-full object-cover select-none mask-image-gradient drop-shadow-2xl brightness-110 contrast-125 rounded-bl-full"
                                style={{
                                    WebkitMaskImage:
                                        "linear-gradient(to right, transparent, black 15%)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="mt-10">
                    <h3 className="sr-only">Available Turfs</h3>

                    {turfsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="animate-pulse bg-white rounded-xl h-96 border border-gray-100"
                                ></div>
                            ))}
                        </div>
                    ) : turfs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {turfs.map((turf) => (
                                <TurfCard key={turf.id} {...turf} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                            <span className="text-4xl mb-4 block opacity-50">
                                🌱
                            </span>
                            <p className="text-gray-500 text-lg font-medium">
                                No turfs matched your search.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
