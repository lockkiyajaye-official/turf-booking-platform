import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { X, Star } from "lucide-react";

export interface UploadedImage {
    uuid: string;
    cdnUrl: string;
    name: string;
}

interface ImageUploaderProps {
    images: UploadedImage[];
    primaryIndex: number;
    onChange: (images: UploadedImage[]) => void;
    onPrimaryChange: (index: number) => void;
}

const UPLOADCARE_PUBLIC_KEY =
    import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || "demopublickey";

export default function ImageUploader({
    images,
    primaryIndex,
    onChange,
    onPrimaryChange,
}: ImageUploaderProps) {
    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
        if (primaryIndex === index) {
            onPrimaryChange(0);
        } else if (primaryIndex > index) {
            onPrimaryChange(primaryIndex - 1);
        }
    };

    return (
        <div className="space-y-4">
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                        <div
                            key={img.uuid}
                            className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                idx === primaryIndex
                                    ? "border-[#E33E33] shadow-md"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => onPrimaryChange(idx)}
                        >
                            <img
                                src={img.cdnUrl}
                                alt={img.name}
                                className="w-full h-28 object-cover"
                            />
                            {idx === primaryIndex && (
                                <div className="absolute top-2 left-2 bg-[#E33E33] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-white" />
                                    Primary
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(idx);
                                }}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            {idx !== primaryIndex && (
                                <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full font-medium">
                                        Set as primary
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <FileUploaderRegular
                pubkey={UPLOADCARE_PUBLIC_KEY}
                multiple
                imgOnly
                onFileUploadSuccess={(file) => {
                    const newImg: UploadedImage = {
                        uuid: (file as any).uuid ?? String(Date.now()),
                        cdnUrl: (file as any).cdnUrl ?? "",
                        name: (file as any).name ?? "image",
                    };
                    const updated = [...images, newImg];
                    onChange(updated);
                    if (images.length === 0) onPrimaryChange(0);
                }}
                classNameUploader="uc-light"
            />

            {images.length > 0 && (
                <p className="text-xs text-gray-400">
                    Click any image to set it as the primary photo shown to customers.
                </p>
            )}
        </div>
    );
}
