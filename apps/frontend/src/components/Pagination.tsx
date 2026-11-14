import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    accentColor?: "red" | "emerald" | "dark";
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [6, 12, 24],
    accentColor = "red",
    className = "",
}: PaginationProps) {
    if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 10))) {
        return null;
    }

    const startItem =
        totalItems !== undefined && pageSize !== undefined
            ? totalItems === 0
                ? 0
                : (currentPage - 1) * pageSize + 1
            : undefined;
    const endItem =
        totalItems !== undefined && pageSize !== undefined
            ? Math.min(totalItems, currentPage * pageSize)
            : undefined;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    const getActiveButtonClass = () => {
        switch (accentColor) {
            case "emerald":
                return "bg-emerald-600 text-white shadow-sm";
            case "dark":
                return "bg-gray-900 text-white shadow-sm";
            case "red":
            default:
                return "bg-[#e53935] text-white shadow-sm";
        }
    };

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100 text-sm shadow-xs ${className}`}
        >
            <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm">
                {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
                    <span>
                        Showing <strong className="text-gray-900 font-bold">{startItem}</strong> to{" "}
                        <strong className="text-gray-900 font-bold">{endItem}</strong> of{" "}
                        <strong className="text-gray-900 font-bold">{totalItems}</strong> items
                    </span>
                ) : (
                    <span>
                        Page <strong className="text-gray-900 font-bold">{currentPage}</strong> of{" "}
                        <strong className="text-gray-900 font-bold">{totalPages}</strong>
                    </span>
                )}

                {onPageSizeChange && pageSize && (
                    <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-xs text-gray-400">Per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                onPageSizeChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400 cursor-pointer"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, idx) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-2 py-1 text-xs text-gray-400 select-none"
                            >
                                ...
                            </span>
                        );
                    }
                    const isCurrent = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`min-w-[34px] h-8 px-2.5 text-xs font-bold rounded-lg transition-all ${
                                isCurrent
                                    ? getActiveButtonClass()
                                    : "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

