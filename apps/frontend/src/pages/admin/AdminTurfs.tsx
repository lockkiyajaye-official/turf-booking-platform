import {
    ArrowUpDown,
    CheckCircle2,
    Clock,
    Eye,
    Grid,
    List,
    MapPin,
    Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    AdminBadge,
    AdminEmptyState,
    AdminFilterBar,
    AdminPageHeader,
    AdminPagination,
    AdminStatCard,
} from "../../components/admin";
import api from "../../services/api";
import type { Turf } from "./types";

export default function AdminTurfs() {
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusTab, setStatusTab] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "name">("newest");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => {
        fetchTurfs();
    }, []);

    const fetchTurfs = async () => {
        try {
            setLoading(true);
            const res = await api.get("/turfs", { params: { limit: 100 } });
            const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
            setTurfs(items);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const turfStats = useMemo(() => {
        const stats = { all: turfs.length, published: 0, draft: 0 };
        turfs.forEach((t) => {
            if (t.isPublished) stats.published++;
            else stats.draft++;
        });
        return stats;
    }, [turfs]);

    // Filtered & Sorted
    const filteredTurfs = useMemo(() => {
        let list = [...turfs];

        if (statusTab === "published") {
            list = list.filter((t) => t.isPublished);
        } else if (statusTab === "draft") {
            list = list.filter((t) => !t.isPublished);
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            list = list.filter((t) => {
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
        }

        list.sort((a, b) => {
            if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
            if (sortBy === "price_desc") return b.pricePerHour - a.pricePerHour;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return list;
    }, [turfs, statusTab, search, sortBy]);

    // Pagination slice
    const paginatedTurfs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTurfs.slice(start, start + pageSize);
    }, [filteredTurfs, currentPage, pageSize]);

    return (
        <div className="w-full p-5 space-y-6 animate-in fade-in duration-300">
            <AdminPageHeader
                title="Platform Turfs"
                description="Monitor sports facilities, listings publication status, and pricing"
                badge={`${turfs.length} Listed`}
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminStatCard
                    title="Total Arenas"
                    value={turfStats.all}
                    icon={Trophy}
                    iconColor="text-gray-700"
                    iconBg="bg-gray-100"
                    description="Across all partner networks"
                />
                <AdminStatCard
                    title="Live & Published"
                    value={turfStats.published}
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    trend={{
                        value: `${turfStats.all > 0 ? Math.round((turfStats.published / turfStats.all) * 100) : 0}% active`,
                        isPositive: true,
                    }}
                />
                <AdminStatCard
                    title="Drafts & Inactive"
                    value={turfStats.draft}
                    icon={Clock}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                    trend={{
                        value: turfStats.draft > 0 ? "Pending listing" : "None",
                        isPositive: turfStats.draft === 0,
                    }}
                />
            </div>

            {/* Filter Bar */}
            <AdminFilterBar
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search turfs by name, address, or owner..."
                tabs={[
                    { id: "all", label: "All Turfs", count: turfStats.all },
                    { id: "published", label: "Published", count: turfStats.published },
                    { id: "draft", label: "Drafts", count: turfStats.draft },
                ]}
                activeTab={statusTab}
                onTabChange={(tab) => {
                    setStatusTab(tab);
                    setCurrentPage(1);
                }}
                hasActiveFilters={Boolean(search || statusTab !== "all" || sortBy !== "newest")}
                onResetFilters={() => {
                    setSearch("");
                    setStatusTab("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                }}
                rightSlot={
                    <div className="flex items-center gap-2">
                        {/* Sort */}
                        <div className="flex items-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as
                                            | "newest"
                                            | "price_asc"
                                            | "price_desc"
                                            | "name",
                                    )
                                }
                                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-200"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center p-0.5 bg-gray-100 rounded-xl border border-gray-200/80">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                title="Grid View"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    viewMode === "table"
                                        ? "bg-white text-gray-900 shadow-xs"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                }
            />

            {/* Content Display */}
            {loading ? (
                <div className="p-12 text-center text-gray-400 text-sm animate-pulse bg-white rounded-xl border border-gray-200/80">
                    Loading arena directory...
                </div>
            ) : filteredTurfs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs">
                    <AdminEmptyState
                        title="No turfs match your filters"
                        description="Try checking your spelling or selecting 'All Turfs'."
                        onResetFilters={() => {
                            setSearch("");
                            setStatusTab("all");
                        }}
                    />
                </div>
            ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginatedTurfs.map((turf) => {
                            const coverImg =
                                turf.images && turf.images.length > 0
                                    ? turf.images[turf.primaryImageIndex ?? 0]
                                    : null;

                            return (
                                <div
                                    key={turf.id}
                                    className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden flex flex-col group"
                                >
                                    {/* Thumbnail Header */}
                                    <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                        {coverImg ? (
                                            <img
                                                src={coverImg}
                                                alt={turf.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-300">
                                                <Trophy className="w-10 h-10 stroke-[1.5]" />
                                                <span className="text-[11px] font-semibold mt-1">
                                                    No photos
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute top-3 left-3">
                                            <AdminBadge
                                                status={turf.isPublished ? "published" : "draft"}
                                                label={turf.isPublished ? "Published" : "Draft"}
                                            />
                                        </div>

                                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-lg text-xs font-bold">
                                            ₹{turf.pricePerHour}
                                            <span className="text-[10px] font-normal text-gray-300 ml-0.5">
                                                /hr
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                                                {turf.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 line-clamp-1">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>{turf.address}</span>
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase">
                                                    Owner
                                                </p>
                                                <p className="font-bold text-gray-800 line-clamp-1">
                                                    {turf.owner
                                                        ? `${turf.owner.firstName} ${turf.owner.lastName}`
                                                        : "Partner"}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/turfs/${turf.id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#E33E33] hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Preview</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-xs">
                        <AdminPagination
                            currentPage={currentPage}
                            totalItems={filteredTurfs.length}
                            pageSize={pageSize}
                            pageSizeOptions={[12, 24, 48]}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                </div>
            ) : (
                /* Table View */
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[760px]">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-5">Turf</th>
                                    <th className="py-3 px-5">Location</th>
                                    <th className="py-3 px-5">Owner</th>
                                    <th className="py-3 px-5">Rate / Hour</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                {paginatedTurfs.map((turf) => {
                                    const coverImg =
                                        turf.images && turf.images.length > 0
                                            ? turf.images[turf.primaryImageIndex ?? 0]
                                            : null;

                                    return (
                                        <tr
                                            key={turf.id}
                                            className="hover:bg-gray-50/70 transition-colors"
                                        >
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                        {coverImg ? (
                                                            <img
                                                                src={coverImg}
                                                                alt={turf.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Trophy className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {turf.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono">
                                                            ID: {turf.id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-gray-600 max-w-xs truncate">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{turf.address}</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <p className="font-semibold text-gray-800">
                                                    {turf.owner
                                                        ? `${turf.owner.firstName} ${turf.owner.lastName}`
                                                        : "Partner"}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {turf.owner?.email || "—"}
                                                </p>
                                            </td>
                                            <td className="py-3 px-5 font-black text-gray-900">
                                                ₹{turf.pricePerHour}
                                            </td>
                                            <td className="py-3 px-5">
                                                <AdminBadge
                                                    status={turf.isPublished ? "published" : "draft"}
                                                />
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <Link
                                                    to={`/turfs/${turf.id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 p-1.5 text-gray-500 hover:text-[#E33E33] hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Preview live turf"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <AdminPagination
                        currentPage={currentPage}
                        totalItems={filteredTurfs.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            )}
        </div>
    );
}
