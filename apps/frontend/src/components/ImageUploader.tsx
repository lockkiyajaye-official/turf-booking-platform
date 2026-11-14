import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Crop as CropIcon,
    Eye,
    RefreshCw,
    RotateCw,
    Star,
    Trash2,
    X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
    const [isReplacing, setIsReplacing] = useState(false);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const replaceTargetIndexRef = useRef<number | null>(null);

    // Keyboard navigation in preview modal
    useEffect(() => {
        if (previewIndex === null || croppingIndex !== null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPreviewIndex(null);
            } else if (e.key === "ArrowLeft") {
                setPreviewIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : prev,
                );
            } else if (e.key === "ArrowRight") {
                setPreviewIndex((prev) =>
                    prev !== null && prev < images.length - 1
                        ? prev + 1
                        : prev,
                );
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewIndex, croppingIndex, images.length]);

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
        if (primaryIndex === index) {
            onPrimaryChange(0);
        } else if (primaryIndex > index) {
            onPrimaryChange(primaryIndex - 1);
        }
        if (previewIndex !== null) {
            if (updated.length === 0) {
                setPreviewIndex(null);
            } else if (previewIndex >= updated.length) {
                setPreviewIndex(updated.length - 1);
            }
        }
    };

    const triggerReplace = (index: number) => {
        replaceTargetIndexRef.current = index;
        if (replaceInputRef.current) {
            replaceInputRef.current.value = "";
            replaceInputRef.current.click();
        }
    };

    const handleFileInputReplace = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        const targetIndex = replaceTargetIndexRef.current;
        if (!file || targetIndex === null || targetIndex >= images.length) return;

        try {
            setIsReplacing(true);
            const formData = new FormData();
            formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
            formData.append("UPLOADCARE_STORE", "1");
            formData.append("file", file);

            const res = await fetch("https://upload.uploadcare.com/base/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            const uuid = data.file;

            const updated = [...images];
            updated[targetIndex] = {
                uuid,
                cdnUrl: `https://ucarecdn.com/${uuid}/`,
                name: file.name,
            };
            onChange(updated);
        } catch (error) {
            console.error("Failed to replace image:", error);
            const localUrl = URL.createObjectURL(file);
            const updated = [...images];
            updated[targetIndex] = {
                uuid: String(Date.now()),
                cdnUrl: localUrl,
                name: file.name,
            };
            onChange(updated);
        } finally {
            setIsReplacing(false);
            replaceTargetIndexRef.current = null;
        }
    };

    const handleApplyCrop = (index: number, newCdnUrl: string) => {
        const updated = [...images];
        updated[index] = {
            ...updated[index],
            cdnUrl: newCdnUrl,
        };
        onChange(updated);
        setCroppingIndex(null);
    };

    return (
        <div className="space-y-4">
            {/* Hidden input for photo replacement */}
            <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputReplace}
            />

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => {
                        const isPrimary = idx === primaryIndex;
                        return (
                            <div
                                key={img.uuid || idx}
                                className={`relative group rounded-xl overflow-hidden border-2 transition-all select-none ${
                                    isPrimary
                                        ? "border-[#E33E33] shadow-md ring-2 ring-red-100"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <img
                                    src={img.cdnUrl}
                                    alt={img.name}
                                    className="w-full h-28 object-cover cursor-pointer"
                                    onClick={() => setPreviewIndex(idx)}
                                />

                                {/* Primary Badge */}
                                {isPrimary && (
                                    <div className="absolute top-2 left-2 bg-[#E33E33] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs pointer-events-none">
                                        <Star className="w-2.5 h-2.5 fill-white" />
                                        Primary
                                    </div>
                                )}

                                {/* Hover Actions Toolbar */}
                                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1">
                                        {/* View button */}
                                        <button
                                            type="button"
                                            title="View full size"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewIndex(idx);
                                            }}
                                            className="p-1 rounded-md bg-white/20 hover:bg-white text-white hover:text-gray-900 transition-colors shadow-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Crop button */}
                                        <button
                                            type="button"
                                            title="Crop photo"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCroppingIndex(idx);
                                            }}
                                            className="p-1 rounded-md bg-white/20 hover:bg-white text-white hover:text-gray-900 transition-colors shadow-xs"
                                        >
                                            <CropIcon className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Replace button */}
                                        <button
                                            type="button"
                                            title="Replace photo"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                triggerReplace(idx);
                                            }}
                                            className="p-1 rounded-md bg-white/20 hover:bg-white text-white hover:text-gray-900 transition-colors shadow-xs"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Set primary or Star toggle */}
                                    {!isPrimary && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPrimaryChange(idx);
                                            }}
                                            className="text-[10px] bg-white/25 hover:bg-[#E33E33] text-white font-bold px-2 py-0.5 rounded-md transition-colors"
                                        >
                                            Set Cover
                                        </button>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        title="Remove photo"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(idx);
                                        }}
                                        className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors shadow-xs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Uploadcare File Uploader */}
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
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="font-semibold text-gray-700">Actions:</span>
                    Click any photo to view full size, crop (16:9 banner, 4:3, 1:1), replace, or reorder before saving.
                </p>
            )}

            {/* Fullscreen Photo Viewing & Editing Modal */}
            {previewIndex !== null && images[previewIndex] && croppingIndex === null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
                    onClick={() => setPreviewIndex(null)}
                >
                    {/* Top Bar */}
                    <div
                        className="flex items-center justify-between text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-sm sm:text-base">
                                Photo {previewIndex + 1} of {images.length}
                            </span>
                            {previewIndex === primaryIndex && (
                                <span className="bg-[#E33E33] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                    <Star className="w-3 h-3 fill-white" />
                                    Primary Cover
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setPreviewIndex(null)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Close preview (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Middle Image Stage with Prev / Next Navigation */}
                    <div
                        className="relative flex-1 flex items-center justify-center my-3 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Prev button */}
                        {previewIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => setPreviewIndex(previewIndex - 1)}
                                className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors shadow-lg"
                                title="Previous photo (Left arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        <img
                            src={images[previewIndex].cdnUrl}
                            alt={images[previewIndex].name}
                            className="max-h-[68vh] max-w-full rounded-xl shadow-2xl object-contain transition-transform"
                        />

                        {/* Next button */}
                        {previewIndex < images.length - 1 && (
                            <button
                                type="button"
                                onClick={() => setPreviewIndex(previewIndex + 1)}
                                className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors shadow-lg"
                                title="Next photo (Right arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Toolbar with Edit / Reorder Actions */}
                    <div
                        className="bg-gray-900/90 border border-white/10 rounded-2xl max-w-xl mx-auto w-full px-4 py-3 flex items-center justify-around gap-2 text-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Set Cover */}
                        <button
                            type="button"
                            disabled={previewIndex === primaryIndex}
                            onClick={() => onPrimaryChange(previewIndex)}
                            className={`flex flex-col items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${
                                previewIndex === primaryIndex
                                    ? "text-amber-400 opacity-60"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            <Star
                                className={`w-4 h-4 ${
                                    previewIndex === primaryIndex
                                        ? "fill-amber-400"
                                        : ""
                                }`}
                            />
                            <span>{previewIndex === primaryIndex ? "Cover" : "Set Cover"}</span>
                        </button>

                        {/* Crop */}
                        <button
                            type="button"
                            onClick={() => setCroppingIndex(previewIndex)}
                            className="flex flex-col items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <CropIcon className="w-4 h-4 text-emerald-400" />
                            <span>Crop</span>
                        </button>

                        {/* Replace */}
                        <button
                            type="button"
                            disabled={isReplacing}
                            onClick={() => triggerReplace(previewIndex)}
                            className="flex flex-col items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    isReplacing ? "animate-spin text-red-400" : ""
                                }`}
                            />
                            <span>{isReplacing ? "Replacing..." : "Replace"}</span>
                        </button>

                        {/* Delete */}
                        <button
                            type="button"
                            onClick={() => removeImage(previewIndex)}
                            className="flex flex-col items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Interactive Crop Modal */}
            {croppingIndex !== null && images[croppingIndex] && (
                <CropModal
                    image={images[croppingIndex]}
                    onClose={() => setCroppingIndex(null)}
                    onApply={(croppedUrl) =>
                        handleApplyCrop(croppingIndex, croppedUrl)
                    }
                />
            )}
        </div>
    );
}

// ── Interactive Crop Modal Component ──────────────────────────────
interface CropModalProps {
    image: UploadedImage;
    onClose: () => void;
    onApply: (croppedUrl: string) => void;
}

type AspectRatio = "free" | "16:9" | "4:3" | "1:1";

function CropModal({ image, onClose, onApply }: CropModalProps) {
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
    const [rotation, setRotation] = useState<number>(0);
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [naturalSize, setNaturalSize] = useState<{
        width: number;
        height: number;
    }>({ width: 0, height: 0 });

    // Crop box as percentages [0..1]
    const [crop, setCrop] = useState<{
        x: number;
        y: number;
        w: number;
        h: number;
    }>({
        x: 0.05,
        y: 0.15,
        w: 0.9,
        h: 0.7,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const isDraggingRef = useRef<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialCrop: typeof crop }>({
        mouseX: 0,
        mouseY: 0,
        initialCrop: { ...crop },
    });

    // When natural image loads, set initial crop box based on selected ratio
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        const nw = target.naturalWidth;
        const nh = target.naturalHeight;
        setNaturalSize({ width: nw, height: nh });
        adjustCropForRatio(aspectRatio, nw, nh);
    };

    const adjustCropForRatio = (
        ratio: AspectRatio,
        imgWidth = naturalSize.width || 1000,
        imgHeight = naturalSize.height || 600,
    ) => {
        if (ratio === "free") {
            setCrop({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
            return;
        }

        let targetRatio = 16 / 9;
        if (ratio === "4:3") targetRatio = 4 / 3;
        if (ratio === "1:1") targetRatio = 1;

        const imgRatio = imgWidth / imgHeight;

        let w = 0.9;
        let h = 0.9;

        if (targetRatio > imgRatio) {
            // Target is wider than image
            w = 0.92;
            h = (w * imgRatio) / targetRatio;
        } else {
            // Target is taller than image
            h = 0.92;
            w = (h * targetRatio) / imgRatio;
        }

        const x = (1 - w) / 2;
        const y = (1 - h) / 2;

        setCrop({
            x: Math.max(0, x),
            y: Math.max(0, y),
            w: Math.min(1, w),
            h: Math.min(1, h),
        });
    };

    const handleRatioChange = (newRatio: AspectRatio) => {
        setAspectRatio(newRatio);
        adjustCropForRatio(newRatio);
    };

    const handleDragStart = (
        clientX: number,
        clientY: number,
        mode: "move" | "nw" | "ne" | "sw" | "se",
    ) => {
        isDraggingRef.current = mode;
        dragStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            initialCrop: { ...crop },
        };
    };

    const handleMouseDown = (
        e: React.MouseEvent,
        mode: "move" | "nw" | "ne" | "sw" | "se",
    ) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragStart(e.clientX, e.clientY, mode);
    };

    const handleTouchStart = (
        e: React.TouchEvent,
        mode: "move" | "nw" | "ne" | "sw" | "se",
    ) => {
        e.stopPropagation();
        if (e.touches.length > 0) {
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY, mode);
        }
    };

    useEffect(() => {
        const getRatioMultiplier = () => {
            if (aspectRatio === "free" || !naturalSize.width || !naturalSize.height) {
                return null;
            }
            let r = 16 / 9;
            if (aspectRatio === "4:3") r = 4 / 3;
            if (aspectRatio === "1:1") r = 1;
            const imgRatio = naturalSize.width / naturalSize.height;
            // relation: cropH = (cropW * imgRatio) / r
            return imgRatio / r;
        };

        const handlePointerMove = (clientX: number, clientY: number) => {
            if (!isDraggingRef.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const dx = (clientX - dragStartRef.current.mouseX) / rect.width;
            const dy = (clientY - dragStartRef.current.mouseY) / rect.height;
            const init = dragStartRef.current.initialCrop;
            const ratioMult = getRatioMultiplier();

            if (isDraggingRef.current === "move") {
                const nextX = Math.min(Math.max(0, init.x + dx), 1 - init.w);
                const nextY = Math.min(Math.max(0, init.y + dy), 1 - init.h);
                setCrop({ ...init, x: nextX, y: nextY });
            } else if (isDraggingRef.current === "se") {
                let nextW = Math.max(0.08, Math.min(1 - init.x, init.w + dx));
                let nextH = Math.max(0.08, Math.min(1 - init.y, init.h + dy));

                if (ratioMult !== null) {
                    nextH = nextW * ratioMult;
                    if (init.y + nextH > 1) {
                        nextH = 1 - init.y;
                        nextW = nextH / ratioMult;
                    }
                }
                setCrop({ ...init, w: nextW, h: nextH });
            } else if (isDraggingRef.current === "sw") {
                const maxX = init.x + init.w - 0.08;
                let nextX = Math.max(0, Math.min(maxX, init.x + dx));
                let nextW = init.w - (nextX - init.x);
                let nextH = Math.max(0.08, Math.min(1 - init.y, init.h + dy));

                if (ratioMult !== null) {
                    nextH = nextW * ratioMult;
                    if (init.y + nextH > 1) {
                        nextH = 1 - init.y;
                        nextW = nextH / ratioMult;
                        nextX = init.x + init.w - nextW;
                    }
                }
                setCrop({ x: nextX, y: init.y, w: nextW, h: nextH });
            } else if (isDraggingRef.current === "ne") {
                let nextW = Math.max(0.08, Math.min(1 - init.x, init.w + dx));
                const maxY = init.y + init.h - 0.08;
                let nextY = Math.max(0, Math.min(maxY, init.y + dy));
                let nextH = init.h - (nextY - init.y);

                if (ratioMult !== null) {
                    nextH = nextW * ratioMult;
                    nextY = init.y + init.h - nextH;
                    if (nextY < 0) {
                        nextY = 0;
                        nextH = init.y + init.h;
                        nextW = nextH / ratioMult;
                    }
                }
                setCrop({ x: init.x, y: nextY, w: nextW, h: nextH });
            } else if (isDraggingRef.current === "nw") {
                const maxX = init.x + init.w - 0.08;
                const maxY = init.y + init.h - 0.08;
                let nextX = Math.max(0, Math.min(maxX, init.x + dx));
                let nextY = Math.max(0, Math.min(maxY, init.y + dy));
                let nextW = init.w - (nextX - init.x);
                let nextH = init.h - (nextY - init.y);

                if (ratioMult !== null) {
                    nextH = nextW * ratioMult;
                    nextY = init.y + init.h - nextH;
                    if (nextY < 0) {
                        nextY = 0;
                        nextH = init.y + init.h;
                        nextW = nextH / ratioMult;
                        nextX = init.x + init.w - nextW;
                    }
                }
                setCrop({ x: nextX, y: nextY, w: nextW, h: nextH });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            handlePointerMove(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handlePointerUp = () => {
            isDraggingRef.current = null;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handlePointerUp);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handlePointerUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handlePointerUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handlePointerUp);
        };
    }, [crop, aspectRatio, naturalSize]);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const nw = naturalSize.width || 1200;
            const nh = naturalSize.height || 800;

            const finalX = Math.max(0, Math.round(crop.x * nw));
            const finalY = Math.max(0, Math.round(crop.y * nh));
            const finalW = Math.min(nw - finalX, Math.round(crop.w * nw));
            const finalH = Math.min(nh - finalY, Math.round(crop.h * nh));

            // If it's an Uploadcare CDN image URL, apply Uploadcare transformation URL for instant, lossless crop
            const cleanBaseUrl = image.cdnUrl.split("/-/")[0].replace(/\/+$/, "");
            const uuidMatch = cleanBaseUrl.match(
                /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
            );

            if (uuidMatch) {
                const uuid = uuidMatch[1];
                const rotPart = rotation !== 0 ? `-/rotate/${rotation}/` : "";
                const baseUrlWithoutTransform = cleanBaseUrl.includes(uuid)
                    ? cleanBaseUrl.split(uuid)[0] + uuid
                    : `https://ucarecdn.com/${uuid}`;
                const transformedUrl = `${baseUrlWithoutTransform}/${rotPart}-/crop/${finalW}x${finalH}/${finalX},${finalY}/`;
                onApply(transformedUrl);
                return;
            }

            // For local or external images, perform canvas crop
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = image.cdnUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement("canvas");
            canvas.width = finalW;
            canvas.height = finalH;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas context failed");

            ctx.drawImage(img, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);

            // Attempt to upload cropped blob directly to Uploadcare
            const blob = await new Promise<Blob | null>((res) =>
                canvas.toBlob(res, "image/jpeg", 0.92),
            );
            if (blob) {
                try {
                    const formData = new FormData();
                    formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
                    formData.append("UPLOADCARE_STORE", "1");
                    formData.append("file", blob, "crop.jpg");
                    const res = await fetch("https://upload.uploadcare.com/base/", {
                        method: "POST",
                        body: formData,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.file) {
                            onApply(`https://ucarecdn.com/${data.file}/`);
                            return;
                        }
                    }
                } catch {
                    // Fall back to data URL
                }
            }

            const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            onApply(croppedDataUrl);
        } catch {
            onApply(image.cdnUrl);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 text-white"
            onClick={onClose}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between max-w-4xl w-full mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2">
                    <CropIcon className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base sm:text-lg">Crop & Adjust Photo</h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main Crop Viewport Stage */}
            <div
                className="flex-1 flex items-center justify-center my-4 overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    ref={containerRef}
                    className="relative inline-block max-h-[60vh] max-w-2xl select-none shadow-2xl rounded-lg overflow-hidden"
                >
                    <img
                        ref={imageRef}
                        src={image.cdnUrl}
                        alt="Crop target"
                        crossOrigin="anonymous"
                        onLoad={handleImageLoad}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: "transform 0.2s ease",
                        }}
                        className="block max-h-[60vh] max-w-full object-contain pointer-events-none"
                    />

                    {/* Darkened overlay outside the crop box */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(ellipse at ${
                                (crop.x + crop.w / 2) * 100
                            }% ${(crop.y + crop.h / 2) * 100}%, transparent 0%, rgba(0,0,0,0.65) 100%)`,
                        }}
                    />

                    {/* Interactive Draggable Crop Box */}
                    <div
                        className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move transition-shadow touch-none"
                        style={{
                            left: `${crop.x * 100}%`,
                            top: `${crop.y * 100}%`,
                            width: `${crop.w * 100}%`,
                            height: `${crop.h * 100}%`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, "move")}
                        onTouchStart={(e) => handleTouchStart(e, "move")}
                    >
                        {/* Rule of thirds grid lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                            <div className="border-r border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-b border-white" />
                            <div className="border-r border-white" />
                            <div className="border-r border-white" />
                            <div />
                        </div>

                        {/* Corner Resize Handles with generous touch hit target */}
                        {/* Top-Left */}
                        <div
                            className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-gray-900 rounded-xs cursor-nwse-resize shadow-md touch-none"
                            onMouseDown={(e) => handleMouseDown(e, "nw")}
                            onTouchStart={(e) => handleTouchStart(e, "nw")}
                        />
                        {/* Top-Right */}
                        <div
                            className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-gray-900 rounded-xs cursor-nesw-resize shadow-md touch-none"
                            onMouseDown={(e) => handleMouseDown(e, "ne")}
                            onTouchStart={(e) => handleTouchStart(e, "ne")}
                        />
                        {/* Bottom-Left */}
                        <div
                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-gray-900 rounded-xs cursor-nesw-resize shadow-md touch-none"
                            onMouseDown={(e) => handleMouseDown(e, "sw")}
                            onTouchStart={(e) => handleTouchStart(e, "sw")}
                        />
                        {/* Bottom-Right */}
                        <div
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-gray-900 rounded-xs cursor-nwse-resize shadow-md touch-none"
                            onMouseDown={(e) => handleMouseDown(e, "se")}
                            onTouchStart={(e) => handleTouchStart(e, "se")}
                        />
                    </div>
                </div>
            </div>

            {/* Controls & Actions Toolbar */}
            <div
                className="max-w-xl w-full mx-auto bg-gray-900/90 border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ratio presets & rotation */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl">
                        {(["16:9", "4:3", "1:1", "free"] as const).map((ratio) => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={() => handleRatioChange(ratio)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                    aspectRatio === ratio
                                        ? "bg-[#E33E33] text-white shadow-xs"
                                        : "text-gray-300 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {ratio === "16:9"
                                    ? "16:9 Banner"
                                    : ratio === "4:3"
                                      ? "4:3 Standard"
                                      : ratio === "1:1"
                                        ? "1:1 Square"
                                        : "Free"}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Rotate 90 degrees"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Rotate</span>
                        </button>
                    </div>
                </div>

                {/* Footer confirm buttons */}
                <div className="flex items-center justify-end gap-3 pt-1 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={isApplying}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        {isApplying ? "Saving..." : "Apply & Save Crop"}
                    </button>
                </div>
            </div>
        </div>
    );
}
