import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface TurfCardProps {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    amenities?: string[];
    images: string[];
    rating: number | string;
    totalReviews: number;
    onClick?: () => void;
}

export default function TurfCard({
    id,
    name,
    address,
    pricePerHour,
    images,
    rating,
    totalReviews,
    onClick,
}: TurfCardProps) {
    const navigate = useNavigate();
    const ratingValue =
        typeof rating === "number"
            ? rating
            : rating
              ? parseFloat(rating as string)
              : 0;

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/turfs/${id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col group"
        >
            <div className="relative h-56 m-2 mb-0 overflow-hidden rounded-lg bg-gray-50 flex-shrink-0">
                {images && images.length > 0 ? (
                    <img
                        src={images[0]}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-5xl opacity-30">🏟️</span>
                    </div>
                )}

                {/* Rating Overlay on bottom left of image */}
                <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-md flex items-center shadow-md">
                    <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-800">
                        {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
                    </span>
                    {totalReviews > 0 && (
                        <span className="text-[10px] text-gray-500 ml-1 font-medium">
                            ({totalReviews})
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h4 className="text-[1.1rem] font-bold text-[#343a40] mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                    {name}
                </h4>

                <div className="text-sm text-gray-500 mb-5 line-clamp-1">
                    {address}
                </div>

                <div className="mt-auto flex flex-col space-y-4">
                    <div className="font-bold text-[#343a40] text-lg flex items-center">
                        <span>₹{pricePerHour.toLocaleString("en-IN")}</span>
                        <span className="text-sm text-gray-500 font-medium ml-1">
                            /hour
                        </span>
                    </div>
                    <button className="w-full py-2.5 border border-[#e53935] text-[#e53935] font-semibold rounded-md hover:bg-red-50 active:bg-red-100 transition-colors text-sm">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}

