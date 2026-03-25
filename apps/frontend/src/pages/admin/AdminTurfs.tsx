import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { Turf } from "./types";

export default function AdminTurfs() {
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchTurfs();
    }, []);

    const fetchTurfs = async () => {
        try {
            const res = await api.get("/turfs");
            setTurfs(res.data);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTurfs = useMemo(() => {
        if (!search.trim()) return turfs;
        const term = search.toLowerCase();
        return turfs.filter((t) => {
            const ownerName = t.owner
                ? `${t.owner.firstName} ${t.owner.lastName}`.toLowerCase()
                : "";
            return (
                t.name.toLowerCase().includes(term) ||
                t.address.toLowerCase().includes(term) ||
                ownerName.includes(term) ||
                (t.owner?.email && t.owner.email.toLowerCase().includes(term))
            );
        });
    }, [turfs, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium tracking-wide animate-pulse">
                    Loading turfs...
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Platform Turfs
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        View all registered turfs across the platform
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search turfs or owners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTurfs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-100 rounded-2xl">
                        No turfs found matching "{search}".
                    </div>
                ) : (
                    filteredTurfs.map((turf) => (
                        <div
                            key={turf.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                        >
                            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                                    <img src="/logo.png" />
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span
                                        className={`px-2.5 py-1 text-xs font-bold rounded-md shadow-sm ${
                                            turf.isPublished
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-400 text-white"
                                        }`}
                                    >
                                        {turf.isPublished
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-black text-gray-900 mb-1">
                                    {turf.name}
                                </h3>
                                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />{" "}
                                        {turf.address}
                                    </span>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Owner
                                            </p>
                                            <p className="text-sm font-bold text-gray-800">
                                                {turf.owner?.firstName}{" "}
                                                {turf.owner?.lastName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                Price
                                            </p>
                                            <p className="text-lg font-black text-[#E33E33]">
                                                ₹{turf.pricePerHour}
                                                <span className="text-xs text-gray-500 font-medium">
                                                    /hr
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
