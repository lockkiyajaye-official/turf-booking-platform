import {
    Clock, Image, Mail, MapPin, Phone, Star, X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader, { type UploadedImage } from "../../components/ImageUploader";
import api from "../../services/api";

const SPORTS = ["Football", "Cricket", "Basketball", "Badminton", "Tennis", "Volleyball", "Hockey", "Rugby", "Table Tennis", "Squash", "Futsal"];
const SURFACE_TYPES = ["Natural Grass", "Artificial Turf", "Hybrid Grass", "Concrete", "Clay", "Synthetic"];
const AMENITY_OPTIONS = [
    "Parking", "Floodlights", "Changing Rooms", "Showers", "Drinking Water",
    "First Aid", "Cafeteria", "WiFi", "CCTV", "Referee Available",
    "Equipment Rental", "Spectator Seating", "Restrooms", "Security",
];

const DEFAULT_FORM = {
    name: "", description: "", address: "", city: "", state: "", pincode: "",
    pricePerHour: "", contactPhone: "", contactEmail: "", capacity: "",
    surfaceType: "", sports: [] as string[], amenities: [] as string[],
    availableSlots: [] as string[], rules: "", latitude: "", longitude: "",
    googleMapUrl: "",
    cancellationPolicyEnabled: true,
    fullRefundHours: 24,
    partialRefundHours: 6,
    partialRefundPercentage: 50,
};

const DURATION_OPTIONS = [
    { label: "30 Mins", minutes: 30 },
    { label: "45 Mins", minutes: 45 },
    { label: "60 Mins (1 Hr)", minutes: 60 },
    { label: "90 Mins (1.5 Hr)", minutes: 90 },
    { label: "120 Mins (2 Hr)", minutes: 120 },
];

function formatTime12H(totalMins: number): string {
    const h24 = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const hStr = String(h12).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    return `${hStr}:${mStr} ${period}`;
}

function parseStartMinutes12H(slotStr: string): number {
    const startPart = slotStr.split(" - ")[0];
    if (!startPart) return 0;
    const [time, period] = startPart.split(" ");
    if (!time || !period) return 0;
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + (m || 0);
}

function generate24hSlots(durationMinutes: number): string[] {
    const slots: string[] = [];
    const totalMinutes = 24 * 60;
    let current = 0;
    while (current + durationMinutes <= totalMinutes) {
        const startStr = formatTime12H(current);
        const endStr = formatTime12H(current + durationMinutes);
        slots.push(`${startStr} - ${endStr}`);
        current += durationMinutes;
    }
    return slots;
}

const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all text-sm";

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <span className="text-[#E33E33]">{icon}</span>
            <h3 className="text-base font-black text-gray-800">{title}</h3>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

export default function OwnerCreateTurf() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [slotSearch, setSlotSearch] = useState("");
    const [slotDuration, setSlotDuration] = useState(60);

    const generatedSlots = useMemo(() => generate24hSlots(slotDuration), [slotDuration]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, availableSlots: [...generatedSlots] }));
    }, [generatedSlots]);

    const set = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

    const toggle = (key: "sports" | "amenities" | "availableSlots", val: string) =>
        set(key, formData[key].includes(val)
            ? formData[key].filter((v) => v !== val)
            : [...formData[key], val]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.availableSlots.length === 0) {
            alert("Please select at least one available time slot.");
            return;
        }

        try {
            setSubmitting(true);
            const orderedImages = images.length > 0
                ? [images[primaryIndex]?.cdnUrl, ...images.filter((_, i) => i !== primaryIndex).map((img) => img.cdnUrl)].filter(Boolean)
                : [];

            await api.post("/turfs", {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                city: formData.city || undefined,
                state: formData.state || undefined,
                pincode: formData.pincode || undefined,
                pricePerHour: parseFloat(formData.pricePerHour),
                surfaceType: formData.surfaceType || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                sports: formData.sports.length > 0 ? formData.sports : undefined,
                amenities: formData.amenities,
                availableSlots: formData.availableSlots,
                images: orderedImages,
                primaryImageIndex: 0,
                rules: formData.rules || undefined,
                contactPhone: formData.contactPhone || undefined,
                contactEmail: formData.contactEmail || undefined,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
                googleMapUrl: formData.googleMapUrl || undefined,
                mapUrl: formData.googleMapUrl || undefined,
            });
            navigate("/owner/turfs");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create turf");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSlots = generatedSlots.filter((s: string) => s.includes(slotSearch));

    return (
        <div className="p-4 sm:p-8 w-full max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate("/owner/turfs")} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Listing</h1>
                    <p className="text-gray-500 mt-1 font-medium">Fill in the details to list your turf</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-1 bg-[#E33E33]" />
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    <section>
                        <SectionTitle icon={<Image className="w-5 h-5" />} title="Photos" />
                        <p className="text-sm text-gray-500 mb-4">Upload multiple photos. Click any to set it as the primary cover photo.</p>
                        <ImageUploader images={images} primaryIndex={primaryIndex} onChange={setImages} onPrimaryChange={setPrimaryIndex} />
                    </section>

                    <section>
                        <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Basic Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Turf Name *">
                                <input type="text" required placeholder="e.g., Green Arena Football Ground" className={inputCls}
                                    value={formData.name} onChange={(e) => set("name", e.target.value)} />
                            </Field>
                            <Field label="Price per Hour (₹) *">
                                <input type="number" step="0.01" min="0" required placeholder="e.g., 1500" className={inputCls}
                                    value={formData.pricePerHour} onChange={(e) => set("pricePerHour", e.target.value)} />
                            </Field>
                        </div>
                        <div className="mt-5">
                            <Field label="Description *">
                                <textarea required rows={4} placeholder="Describe your turf..." className={inputCls}
                                    value={formData.description} onChange={(e) => set("description", e.target.value)} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Location" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <Field label="Street Address *">
                                    <input type="text" required placeholder="e.g., 42, MG Road, Near City Mall" className={inputCls}
                                        value={formData.address} onChange={(e) => set("address", e.target.value)} />
                                </Field>
                            </div>
                            <Field label="City *">
                                <input type="text" required placeholder="e.g., Bengaluru" className={inputCls}
                                    value={formData.city} onChange={(e) => set("city", e.target.value)} />
                            </Field>
                            <Field label="State">
                                <input type="text" placeholder="e.g., Karnataka" className={inputCls}
                                    value={formData.state} onChange={(e) => set("state", e.target.value)} />
                            </Field>
                            <Field label="Pincode">
                                <input type="text" placeholder="e.g., 560001" className={inputCls}
                                    value={formData.pincode} onChange={(e) => set("pincode", e.target.value)} />
                            </Field>
                            <Field label="Capacity (players)">
                                <input type="number" min="1" placeholder="e.g., 22" className={inputCls}
                                    value={formData.capacity} onChange={(e) => set("capacity", e.target.value)} />
                            </Field>
                            <Field label="Latitude (optional)">
                                <input type="number" step="any" placeholder="e.g., 12.9716" className={inputCls}
                                    value={formData.latitude} onChange={(e) => set("latitude", e.target.value)} />
                            </Field>
                            <Field label="Longitude (optional)">
                                <input type="number" step="any" placeholder="e.g., 77.5946" className={inputCls}
                                    value={formData.longitude} onChange={(e) => set("longitude", e.target.value)} />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Google Maps Link / Map URL (optional)">
                                    <input type="url" placeholder="e.g., https://maps.google.com/?q=12.9716,77.5946" className={inputCls}
                                        value={formData.googleMapUrl} onChange={(e) => set("googleMapUrl", e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<Star className="w-5 h-5" />} title="Sports & Surface" />
                        <div className="space-y-5">
                            <Field label="Surface Type">
                                <select className={inputCls} value={formData.surfaceType} onChange={(e) => set("surfaceType", e.target.value)}>
                                    <option value="">Select surface type</option>
                                    {SURFACE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sports Supported</label>
                                <div className="flex flex-wrap gap-2">
                                    {SPORTS.map((sport) => (
                                        <button key={sport} type="button" onClick={() => toggle("sports", sport)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${formData.sports.includes(sport) ? "bg-[#E33E33] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<Star className="w-5 h-5" />} title="Amenities" />
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map((amenity) => (
                                <button key={amenity} type="button" onClick={() => toggle("amenities", amenity)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${formData.amenities.includes(amenity) ? "bg-[#E33E33] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<Clock className="w-5 h-5" />} title="Available Time Slots *" />
                        <p className="text-sm text-gray-500 mb-3">Choose slot duration and select all time slots when your turf is open (covering 24 hours).</p>

                        <div className="mb-4 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Slot Duration</label>
                                <div className="flex flex-wrap gap-2">
                                    {DURATION_OPTIONS.map((opt) => (
                                        <button key={opt.minutes} type="button" onClick={() => setSlotDuration(opt.minutes)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${slotDuration === opt.minutes ? "bg-[#E33E33] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, availableSlots: [...generatedSlots] }))}
                                        className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-xs font-bold transition-all">
                                        Select All (24h)
                                    </button>
                                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, availableSlots: [] }))}
                                        className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-xs font-bold transition-all">
                                        Clear All
                                    </button>
                                    <button type="button" onClick={() => {
                                        const daySlots = generatedSlots.filter((s: string) => {
                                            const mins = parseStartMinutes12H(s);
                                            return mins >= 360 && mins < 1320;
                                        });
                                        setFormData((prev) => ({ ...prev, availableSlots: daySlots }));
                                    }} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-bold transition-all">
                                        Daytime (06:00 AM - 10:00 PM)
                                    </button>
                                </div>

                                <input type="text" placeholder="Filter slots..." className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#E33E33]"
                                    value={slotSearch} onChange={(e) => setSlotSearch(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1">
                            {filteredSlots.map((slot) => (
                                <button key={slot} type="button" onClick={() => toggle("availableSlots", slot)}
                                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.availableSlots.includes(slot) ? "bg-[#E33E33] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                        {formData.availableSlots.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">{formData.availableSlots.length} of {generatedSlots.length} slot{formData.availableSlots.length > 1 ? "s" : ""} selected</p>
                        )}
                    </section>

                    <section>
                        <SectionTitle icon={<Phone className="w-5 h-5" />} title="Contact Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Contact Phone">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="tel" placeholder="e.g., +91 98765 43210" className={`${inputCls} pl-10`}
                                        value={formData.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Contact Email">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="email" placeholder="e.g., turf@example.com" className={`${inputCls} pl-10`}
                                        value={formData.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
                                </div>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<Clock className="w-5 h-5" />} title="Cancellation & Refund Policy" />
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Enable User Cancellations & Refunds</h4>
                                    <p className="text-xs text-gray-500">Allow users to cancel bookings according to your set refund windows.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-[#E33E33] rounded cursor-pointer"
                                    checked={formData.cancellationPolicyEnabled}
                                    onChange={(e) => set("cancellationPolicyEnabled", e.target.checked)}
                                />
                            </div>

                            {formData.cancellationPolicyEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                                    <Field label="100% Full Refund Window (Hours)">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 24"
                                            className={inputCls}
                                            value={formData.fullRefundHours}
                                            onChange={(e) => set("fullRefundHours", Number(e.target.value))}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Hours before booking slot start time</p>
                                    </Field>

                                    <Field label="Partial Refund Window (Hours)">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 6"
                                            className={inputCls}
                                            value={formData.partialRefundHours}
                                            onChange={(e) => set("partialRefundHours", Number(e.target.value))}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Hours before booking slot start time</p>
                                    </Field>

                                    <Field label="Partial Refund Percentage (%)">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="e.g. 50"
                                            className={inputCls}
                                            value={formData.partialRefundPercentage}
                                            onChange={(e) => set("partialRefundPercentage", Number(e.target.value))}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Percentage of total price refunded</p>
                                    </Field>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={<Star className="w-5 h-5" />} title="Rules & Guidelines" />
                        <Field label="Turf Rules (optional)">
                            <textarea rows={3} placeholder="e.g., No metal studs allowed..." className={inputCls}
                                value={formData.rules} onChange={(e) => set("rules", e.target.value)} />
                        </Field>
                    </section>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button type="submit" disabled={submitting}
                            className="bg-[#E33E33] hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-60">
                            {submitting ? "Submitting..." : "Submit Listing"}
                        </button>
                        <button type="button" onClick={() => navigate("/owner/turfs")}
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
