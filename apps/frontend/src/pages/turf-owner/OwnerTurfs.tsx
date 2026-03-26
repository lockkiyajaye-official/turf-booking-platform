import {
    Clock, Eye, EyeOff, Image, Mail, MapPin, Phone, Plus, Star, Trash2, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ImageUploader, { type UploadedImage } from "../../components/ImageUploader";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { Turf } from "./types";

const SPORTS = ["Football", "Cricket", "Basketball", "Badminton", "Tennis", "Volleyball", "Hockey", "Rugby"];
const SURFACE_TYPES = ["Natural Grass", "Artificial Turf", "Hybrid Grass", "Concrete", "Clay", "Synthetic"];
const AMENITY_OPTIONS = [
    "Parking", "Floodlights", "Changing Rooms", "Showers", "Drinking Water",
    "First Aid", "Cafeteria", "WiFi", "CCTV", "Referee Available",
    "Equipment Rental", "Spectator Seating", "Restrooms", "Security",
];

const DEFAULT_FORM = {
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    pricePerHour: "",
    contactPhone: "",
    contactEmail: "",
    capacity: "",
    surfaceType: "",
    sports: [] as string[],
    amenities: [] as string[],
    availableSlots: [] as string[],
    rules: "",
    latitude: "",
    longitude: "",
};

function generateSlots() {
    const slots: string[] = [];
    for (let h = 5; h < 23; h++) {
        const start = `${String(h).padStart(2, "0")}:00`;
        const end = `${String(h + 1).padStart(2, "0")}:00`;
        slots.push(`${start}-${end}`);
    }
    return slots;
}

const ALL_SLOTS = generateSlots();

export default function OwnerTurfs() {
    const { user } = useAuth();
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [slotSearch, setSlotSearch] = useState("");

    useEffect(() => { fetchTurfs(); }, []);

    const fetchTurfs = async () => {
        try {
            const response = await api.get("/turfs/my-turfs");
            setTurfs(response.data);
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/publish`);
            await fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish turf");
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await api.post(`/turfs/${id}/unpublish`);
            await fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to unpublish turf");
        }
    };

    const toggleSlot = (slot: string) => {
        setFormData((prev) => ({
            ...prev,
            availableSlots: prev.availableSlots.includes(slot)
                ? prev.availableSlots.filter((s) => s !== slot)
                : [...prev.availableSlots, slot].sort(),
        }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const toggleSport = (sport: string) => {
        setFormData((prev) => ({
            ...prev,
            sports: prev.sports.includes(sport)
                ? prev.sports.filter((s) => s !== sport)
                : [...prev.sports, sport],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.availableSlots.length === 0) {
            alert("Please select at least one available time slot.");
            return;
        }
        setSubmitting(true);
        try {
            // Build ordered images array with primary first
            // Put primary image first in the array, track its index
            const orderedImages = images.length > 0
                ? [
                    images[primaryIndex]?.cdnUrl,
                    ...images.filter((_, i) => i !== primaryIndex).map((img) => img.cdnUrl),
                  ].filter(Boolean)
                : [];

            const turfData = {
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
                primaryImageIndex: 0, // primary is always first after reordering
                rules: formData.rules || undefined,
                contactPhone: formData.contactPhone || undefined,
                contactEmail: formData.contactEmail || undefined,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            };

            await api.post("/turfs", turfData);
            setShowForm(false);
            setFormData(DEFAULT_FORM);
            setImages([]);
            setPrimaryIndex(0);
            fetchTurfs();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create turf");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this turf?")) return;
        try {
            await api.delete(`/turfs/${id}`);
            fetchTurfs();
        } catch {
            alert("Failed to delete turf");
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setFormData(DEFAULT_FORM);
        setImages([]);
        setPrimaryIndex(0);
    };

    const filteredSlots = ALL_SLOTS.filter((s) => s.includes(slotSearch));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-500 font-medium animate-pulse">Loading your turfs...</span>
            </div>
        );
    }

    const isApproved = user?.isApproved;

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Turfs</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your turf listings and availability</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[#E33E33] text-white px-5 py-2.5 rounded-xl hover:bg-red-700 flex items-center gap-2 font-bold shadow-sm transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Add New Turf
                    </button>
                )}
            </div>

            {/* Creation Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-[#E33E33]" />
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Create New Listing</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Section: Photos */}
                            <section>
                                <SectionTitle icon={<Image className="w-5 h-5" />} title="Photos" />
                                <p className="text-sm text-gray-500 mb-4">
                                    Upload multiple photos. Click any uploaded image to set it as the primary cover photo.
                                </p>
                                <ImageUploader
                                    images={images}
                                    primaryIndex={primaryIndex}
                                    onChange={setImages}
                                    onPrimaryChange={setPrimaryIndex}
                                />
                            </section>

                            {/* Section: Basic Info */}
                            <section>
                                <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Basic Information" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Turf Name *">
                                        <input type="text" required placeholder="e.g., Green Arena Football Ground"
                                            className={inputCls}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </Field>
                                    <Field label="Price per Hour (₹) *">
                                        <input type="number" step="0.01" min="0" required placeholder="e.g., 1500"
                                            className={inputCls}
                                            value={formData.pricePerHour}
                                            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })} />
                                    </Field>
                                </div>
                                <div className="mt-5">
                                    <Field label="Description *">
                                        <textarea required rows={4}
                                            placeholder="Describe your turf — surface quality, surroundings, what makes it special..."
                                            className={inputCls}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </Field>
                                </div>
                            </section>

                            {/* Section: Location */}
                            <section>
                                <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Location" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <Field label="Street Address *">
                                            <input type="text" required placeholder="e.g., 42, MG Road, Near City Mall"
                                                className={inputCls}
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                        </Field>
                                    </div>
                                    <Field label="City *">
                                        <input type="text" required placeholder="e.g., Bengaluru"
                                            className={inputCls}
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </Field>
                                    <Field label="State">
                                        <input type="text" placeholder="e.g., Karnataka"
                                            className={inputCls}
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                                    </Field>
                                    <Field label="Pincode">
                                        <input type="text" placeholder="e.g., 560001"
                                            className={inputCls}
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                                    </Field>
                                    <Field label="Capacity (players)">
                                        <input type="number" min="1" placeholder="e.g., 22"
                                            className={inputCls}
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                    <Field label="Latitude (optional)">
                                        <input type="number" step="any" placeholder="e.g., 12.9716"
                                            className={inputCls}
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} />
                                    </Field>
                                    <Field label="Longitude (optional)">
                                        <input type="number" step="any" placeholder="e.g., 77.5946"
                                            className={inputCls}
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} />
                                    </Field>
                                </div>
                            </section>

                            {/* Section: Sports & Surface */}
                            <section>
                                <SectionTitle icon={<Star className="w-5 h-5" />} title="Sports & Surface" />
                                <div className="space-y-5">
                                    <Field label="Surface Type">
                                        <select className={inputCls}
                                            value={formData.surfaceType}
                                            onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value })}>
                                            <option value="">Select surface type</option>
                                            {SURFACE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Sports Supported</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPORTS.map((sport) => (
                                                <button key={sport} type="button"
                                                    onClick={() => toggleSport(sport)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                                        formData.sports.includes(sport)
                                                            ? "bg-[#E33E33] text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}>
                                                    {sport}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Amenities */}
                            <section>
                                <SectionTitle icon={<Star className="w-5 h-5" />} title="Amenities" />
                                <div className="flex flex-wrap gap-2">
                                    {AMENITY_OPTIONS.map((amenity) => (
                                        <button key={amenity} type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                                formData.amenities.includes(amenity)
                                                    ? "bg-[#E33E33] text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}>
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Section: Time Slots */}
                            <section>
                                <SectionTitle icon={<Clock className="w-5 h-5" />} title="Available Time Slots *" />
                                <p className="text-sm text-gray-500 mb-3">Select all time slots when your turf is available for booking.</p>
                                <input
                                    type="text"
                                    placeholder="Filter slots..."
                                    className={`${inputCls} mb-3 max-w-xs`}
                                    value={slotSearch}
                                    onChange={(e) => setSlotSearch(e.target.value)}
                                />
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {filteredSlots.map((slot) => (
                                        <button key={slot} type="button"
                                            onClick={() => toggleSlot(slot)}
                                            className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                                formData.availableSlots.includes(slot)
                                                    ? "bg-[#E33E33] text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                                {formData.availableSlots.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formData.availableSlots.length} slot{formData.availableSlots.length > 1 ? "s" : ""} selected
                                    </p>
                                )}
                            </section>

                            {/* Section: Contact */}
                            <section>
                                <SectionTitle icon={<Phone className="w-5 h-5" />} title="Contact Information" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Contact Phone">
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="tel" placeholder="e.g., +91 98765 43210"
                                                className={`${inputCls} pl-10`}
                                                value={formData.contactPhone}
                                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
                                        </div>
                                    </Field>
                                    <Field label="Contact Email">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="email" placeholder="e.g., turf@example.com"
                                                className={`${inputCls} pl-10`}
                                                value={formData.contactEmail}
                                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
                                        </div>
                                    </Field>
                                </div>
                            </section>

                            {/* Section: Rules */}
                            <section>
                                <SectionTitle icon={<Star className="w-5 h-5" />} title="Rules & Guidelines" />
                                <Field label="Turf Rules (optional)">
                                    <textarea rows={3}
                                        placeholder="e.g., No metal studs allowed. Bring your own equipment. No food inside the turf..."
                                        className={inputCls}
                                        value={formData.rules}
                                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })} />
                                </Field>
                            </section>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button type="submit" disabled={submitting}
                                    className="bg-[#E33E33] hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-60">
                                    {submitting ? "Submitting..." : "Submit Listing"}
                                </button>
                                <button type="button" onClick={resetForm}
                                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Turfs grid */}
            {turfs.length === 0 && !showForm ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                    <span className="text-6xl mb-4 block">🏟️</span>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No turfs listed yet</h3>
                    <p className="text-gray-500 mb-6">Create your first turf listing to start receiving bookings.</p>
                    <button onClick={() => setShowForm(true)}
                        className="bg-[#E33E33] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                        Create Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {turfs.map((turf) => (
                        <TurfOwnerCard
                            key={turf.id}
                            turf={turf}
                            isApproved={!!isApproved}
                            onPublish={handlePublish}
                            onUnpublish={handleUnpublish}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Sub-components ── */

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

const inputCls =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E33E33] transition-all text-sm";

interface TurfOwnerCardProps {
    turf: Turf;
    isApproved: boolean;
    onPublish: (id: string) => void;
    onUnpublish: (id: string) => void;
    onDelete: (id: string) => void;
}

function TurfOwnerCard({ turf, isApproved, onPublish, onUnpublish, onDelete }: TurfOwnerCardProps) {
    const coverImage = (turf as any).images?.[0];
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="h-48 bg-gray-50 relative overflow-hidden">
                {coverImage ? (
                    <img src={coverImage} alt={turf.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl opacity-20">🏟️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm text-white ${turf.isPublished ? "bg-green-500" : "bg-gray-500"}`}>
                        {turf.isPublished ? "Published" : "Draft"}
                    </span>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-gray-900 mb-1 line-clamp-1">{turf.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">{turf.description}</p>
                <div className="flex items-start text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{turf.address}</span>
                </div>
                <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                        <div className="font-black text-[#E33E33] text-lg">
                            ₹{turf.pricePerHour}<span className="text-sm text-gray-500 font-medium">/hr</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {turf.isPublished ? (
                            <button onClick={() => onUnpublish(turf.id)}
                                className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                                <EyeOff className="w-4 h-4" /> Unpublish
                            </button>
                        ) : (
                            <button onClick={() => onPublish(turf.id)} disabled={!isApproved}
                                title={!isApproved ? "Awaiting admin approval" : ""}
                                className="flex-1 bg-[#E33E33] text-white hover:bg-red-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                <Eye className="w-4 h-4" /> Publish
                            </button>
                        )}
                        <button onClick={() => onDelete(turf.id)}
                            className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
