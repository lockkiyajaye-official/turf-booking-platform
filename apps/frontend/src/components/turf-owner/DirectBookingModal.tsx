import { Store, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import type { Turf } from "../../pages/turf-owner/types";

interface DirectBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialTurfId?: string;
}

function format12Hour(time24: string): string {
    if (!time24) return "";
    const trimmed = time24.trim();
    if (trimmed.includes("AM") || trimmed.includes("PM")) return trimmed;
    const [hStr, mStr] = trimmed.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr ? parseInt(mStr, 10) : 0;
    if (isNaN(h)) return trimmed;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function formatSlot12H(start: string, end?: string): string {
    if (!end) {
        if (start.includes("-")) {
            const parts = start.split("-");
            return `${format12Hour(parts[0])} - ${format12Hour(parts[1])}`;
        }
        return format12Hour(start);
    }
    return `${format12Hour(start)} - ${format12Hour(end)}`;
}

export default function DirectBookingModal({
    isOpen,
    onClose,
    onSuccess,
    initialTurfId,
}: DirectBookingModalProps) {
    const [myTurfs, setMyTurfs] = useState<Turf[]>([]);
    const [selectedTurfId, setSelectedTurfId] = useState(initialTurfId || "");
    const [bookingDate, setBookingDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customPrice, setCustomPrice] = useState<number | "">("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [notes, setNotes] = useState("");
    const [submittingDirect, setSubmittingDirect] = useState(false);

    // Fetch my turfs on mount or open
    useEffect(() => {
        if (!isOpen) return;
        api.get("/turfs/my-turfs", { params: { limit: 100 } })
            .then((res) => {
                const list: Turf[] = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setMyTurfs(list);
                if (list.length > 0) {
                    const targetTurf = initialTurfId
                        ? list.find((t) => t.id === initialTurfId) || list[0]
                        : list[0];
                    setSelectedTurfId(targetTurf.id);
                    setCustomPrice(targetTurf.pricePerHour || 0);
                }
            })
            .catch((err) => console.error("Failed to load my turfs:", err));
    }, [isOpen, initialTurfId]);

    // Update price when selected turf changes
    useEffect(() => {
        if (!selectedTurfId || myTurfs.length === 0) return;
        const currentTurf = myTurfs.find((t) => t.id === selectedTurfId);
        if (currentTurf) {
            setCustomPrice(currentTurf.pricePerHour || 0);
        }
    }, [selectedTurfId, myTurfs]);

    // Fetch booked slots when turf or date changes
    useEffect(() => {
        if (!isOpen || !selectedTurfId || !bookingDate) {
            setBookedSlots([]);
            return;
        }
        setLoadingSlots(true);
        api.get(`/turfs/${selectedTurfId}/booked-slots?date=${bookingDate}`)
            .then((res) => {
                setBookedSlots(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setBookedSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [isOpen, selectedTurfId, bookingDate]);

    if (!isOpen) return null;

    const selectedTurfObj = myTurfs.find((t) => t.id === selectedTurfId);
    const availableSlotsList = selectedTurfObj?.availableSlots || [];

    const handleCreateDirectBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTurfId) {
            alert("Please select a turf.");
            return;
        }
        if (!bookingDate) {
            alert("Please select a date.");
            return;
        }
        if (!selectedSlot) {
            alert("Please select an available time slot.");
            return;
        }
        if (!customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        const slotParts = selectedSlot.split("-").map((s) => s.trim());
        const startTime = slotParts[0] || selectedSlot;
        const endTime = slotParts[1] || "";

        try {
            setSubmittingDirect(true);
            await api.post("/bookings/direct", {
                turfId: selectedTurfId,
                bookingDate,
                startTime,
                endTime,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim() || undefined,
                customPrice: customPrice !== "" ? Number(customPrice) : undefined,
                paymentMethod,
                notes: notes.trim() || undefined,
            });

            alert("Direct booking created successfully! The slot has been locked to prevent duplicate bookings.");
            onClose();
            setCustomerName("");
            setCustomerPhone("");
            setSelectedSlot("");
            setNotes("");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create direct booking");
        } finally {
            setSubmittingDirect(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">
                            Mark Direct / Offline Booking
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Lock slot for walk-in or phone reservations
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleCreateDirectBooking} className="p-6 space-y-5">
                    {/* Offline Notice Banner */}
                    <div className="p-3.5 bg-purple-50/80 border border-purple-200/60 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5">
                        <Store className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Offline Booking Notice:</span> Payment is collected directly by you outside the platform. This booking will <strong>not</strong> be added to your app wallet balance.
                        </div>
                    </div>

                    {/* Turf Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select Turf
                        </label>
                        <select
                            value={selectedTurfId}
                            onChange={(e) => setSelectedTurfId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-sm"
                        >
                            {myTurfs.map((turf) => (
                                <option key={turf.id} value={turf.id}>
                                    {turf.name} (₹{turf.pricePerHour}/hr)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Booking Date
                        </label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] font-bold text-sm"
                        />
                    </div>

                    {/* Slot Picker */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Select Time Slot (12-Hour)
                            </label>
                            {loadingSlots && (
                                <span className="text-[11px] text-gray-400 animate-pulse">
                                    Checking availability...
                                </span>
                            )}
                        </div>

                        {availableSlotsList.length === 0 ? (
                            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                No slots configured for this turf. Please configure available slots first.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                                {availableSlotsList.map((slot) => {
                                    const isBooked = bookedSlots.some(
                                        (b) =>
                                            b === slot ||
                                            b.replace(/\s/g, "") === slot.replace(/\s/g, ""),
                                    );
                                    const isSelected = selectedSlot === slot;
                                    const displaySlot = formatSlot12H(slot);

                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                                isBooked
                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                                                    : isSelected
                                                    ? "bg-[#E33E33] text-white border-[#E33E33] shadow-xs"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            {displaySlot}
                                            {isBooked && (
                                                <span className="block text-[9px] font-normal text-gray-400">
                                                    Booked
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Customer Phone (Optional)
                            </label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Price & Payment Method */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Total Price (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Amount collected"
                                value={customPrice}
                                onChange={(e) =>
                                    setCustomPrice(
                                        e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                }
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Offline Payment Mode
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] text-sm"
                            >
                                <option value="cash">Cash at Venue</option>
                                <option value="direct_upi">Direct UPI (To Owner)</option>
                                <option value="offline">Other Offline</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Phone booking, advance collected"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] placeholder:text-gray-400 text-sm"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submittingDirect || !selectedSlot || !customerName.trim()}
                            className="px-6 py-2.5 bg-[#E33E33] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                            {submittingDirect ? "Saving..." : "Lock & Confirm Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

