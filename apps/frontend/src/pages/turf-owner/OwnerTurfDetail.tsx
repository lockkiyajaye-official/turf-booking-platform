import {
    ArrowLeft, Clock, Eye, EyeOff, Image, Mail, MapPin, Pencil, Phone, Save, Star, Trash2, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function generateSlots() {
    const slots: string[] = [];
    for (let h = 5; h < 23; h++) {
        slots.push(`${String(h).padStart(2, "0")}:00-${String(h + 1).padStart(2, "0")}:00`);
    }
    return slots;
}
const ALL_SLOTS = generateSlots();

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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-800 font-medium">{value}</p>
            </div>
        </div>
    );
}

export default function OwnerTurfDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [turf, setTurf] = useState<Turf | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [slotSearch, setSlotSearch] = useState("");
    const [activeImage, setActiveImage] = useState(0);

    // Edit form state
    const [formData, setFormData] = useState({
        name: "", description: "", address: "", city: "", state: "", pincode: "",
        pricePerHour: "", contactPhone: "", contactEmail: "", capacity: "",
        surfaceType: "", sports: [] as string[], amenities: [] as string[],
        availableSlots: [] as string[], rules: "", latitude: "", longitude: "",
    });
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);

    useEffect(() => {
        if (id) fetchTurf();
    }, [id]);

    const fetchTurf = async () => {
        try {
            const { data } = await api.get(`/turfs/${id}`);
            setTurf(data);
            populateForm(data);
        } catch {
            navigate("/owner/turfs");
        } finally {
            setLoading(false);
        }
    };

    const populateForm = (t: Turf) => {
        setFormData({
            name: t.name ?? "",
            description: t.description ?? "",
            address: t.address ?? "",
            city: t.city ?? "",
            state: t.state ?? "",
            pincode: t.pincode ?? "",
            pricePerHour: String(t.pricePerHour ?? ""),
            contactPhone: t.contactPhone ?? "",
            contactEmail: t.contactEmail ?? "",
            capacity: t.capacity ? String(t.capacity) : "",
            surfaceType: t.surfaceType ?? "",
            sports: t.sports ?? [],
            amenities: t.amenities ?? [],
            availableSlots: t.availableSlots ?? [],
            rules: t.rules ?? "",
            latitude: (t as any).latitude ? String((t as any).latitude) : "",
            longitude: (t as any).longitude ? String((t as any).longitude) : "",
        });
        // Represent existing images as UploadedImage objects for the uploader
        const existingImages: UploadedImage[] = (t.images ?? []).map((url) => ({
            cdnUrl: url,
            uuid: url,
            name: "",
        }));
        setImages(existingImages);
        setPrimaryIndex(0);
    };

    const set = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

    const toggle = (key: "sports" | "amenities" | "availableSlots", val: string) =>
        set(key, formData[key].includes(val)
            ? formData[key].filter((v: string) => v !== val)
            : key === "availableSlots"
                ? [...formData[key], val].sort()
                : [...formData[key], val]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.availableSlots.length === 0) {
            alert("Please select at least one available time slot.");
            return;
        }
        setSaving(true);
        try {
            const orderedImages = images.length > 0
                ? [images[primaryIndex]?.cdnUrl, ...images.filter((_, i) => i !== primaryIndex).map((img) => img.cdnUrl)].filter(Boolean)
                : [];

            const { data } = await api.patch(`/turfs/${id}`, {
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
            });
            setTurf(data);
            setEditing(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            await api.post(`/turfs/${id}/publish`);
            await fetchTurf();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish turf");
        }
    };

    const handleUnpublish = async () => {
        try {
            await api.post(`/turfs/${id}/unpublish`);
            await fetchTurf();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to unpublish turf");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this turf? This cannot be undone.")) return;
        try {
            await api.delete(`/turfs/${id}`);
            navigate("/owner/turfs");
        } catch {
            alert("Failed to delete turf");
        }
    };

    const cancelEdit = () => {
        if (turf) populateForm(turf);
        setEditing(false);
    };

    const filteredSlots = ALL_SLOTS.filter((s) => s.includes(slotSearch));
    const isApproved = user?.isApproved;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-screen">
                <span className="text-gray-500 font-medium animate-pulse">Loading turf details...</span>
            </div>
        );
    }

    if (!turf) return null;

    const coverImages = turf.images ?? [];

    return (
        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/owner/turfs")}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{turf.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md text-white ${turf.isPublished ? "bg-green-500" : "bg-gray-400"}`}>
                                {turf.isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {!editing && (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    )}
                    {turf.isPublished ? (
                        <button onClick={handleUnpublish}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-sm transition-colors">
                            <EyeOff className="w-4 h-4" /> Unpublish
                        </button>
                    ) : (
                        <button onClick={handlePublish} disabled={!isApproved}
                            title={!isApproved ? "Awaiting admin approval" : ""}
                            className="flex items-center gap-2 px-4 py-2 bg-[#E33E33] hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Eye className="w-4 h-4" /> Publish
                        </button>
                    )}
                    <button onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Detail View */}
            {!editing && (
                <div className="space-y-6">
                    {/* Images */}
                    {coverImages.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="h-72 sm:h-96 relative overflow-hidden bg-gray-50">
                                <img src={coverImages[activeImage]} alt={turf.name}
                                    className="w-full h-full object-cover" />
                            </div>
                            {coverImages.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {coverImages.map((img, i) => (
                                        <button key={i} onClick={() => setActiveImage(i)}
                                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? "border-[#E33E33]" : "border-transparent"}`}>
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest text-[#E33E33]">Details</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{turf.description}</p>
                            <div className="space-y-3 pt-2">
                                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address"
                                    value={[turf.address, turf.city, turf.state, turf.pincode].filter(Boolean).join(", ")} />
                                <InfoRow icon={<Star className="w-4 h-4" />} label="Price"
                                    value={`₹${turf.pricePerHour}/hour`} />
                                <InfoRow icon={<Star className="w-4 h-4" />} label="Surface"
                                    value={turf.surfaceType} />
                                <InfoRow icon={<Star className="w-4 h-4" />} label="Capacity"
                                    value={turf.capacity ? `${turf.capacity} players` : undefined} />
                                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone"
                                    value={turf.contactPhone} />
                                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email"
                                    value={turf.contactEmail} />
                            </div>
                        </div>

                        {/* Sports & Amenities */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                            {turf.sports && turf.sports.length > 0 && (
                                <div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest text-[#E33E33] mb-3">Sports</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {turf.sports.map((s) => (
                                            <span key={s} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {turf.amenities && turf.amenities.length > 0 && (
                                <div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest text-[#E33E33] mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {turf.amenities.map((a) => (
                                            <span key={a} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {turf.availableSlots && turf.availableSlots.length > 0 && (
                                <div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest text-[#E33E33] mb-3">
                                        Available Slots ({turf.availableSlots.length})
                                    </h3>
                                    <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                                        {turf.availableSlots.map((slot) => (
                                            <span key={slot} className="px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium text-center">{slot}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {turf.rules && (
                                <div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest text-[#E33E33] mb-2">Rules</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{turf.rules}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {editing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-1 bg-[#E33E33]" />
                    <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900">Edit Turf Details</h2>
                            <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <section>
                            <SectionTitle icon={<Image className="w-5 h-5" />} title="Photos" />
                            <p className="text-sm text-gray-500 mb-4">Upload or replace photos. Click any to set as primary cover.</p>
                            <ImageUploader images={images} primaryIndex={primaryIndex} onChange={setImages} onPrimaryChange={setPrimaryIndex} />
                        </section>

                        <section>
                            <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Basic Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Turf Name *">
                                    <input type="text" required className={inputCls} value={formData.name}
                                        onChange={(e) => set("name", e.target.value)} />
                                </Field>
                                <Field label="Price per Hour (₹) *">
                                    <input type="number" step="0.01" min="0" required className={inputCls}
                                        value={formData.pricePerHour} onChange={(e) => set("pricePerHour", e.target.value)} />
                                </Field>
                            </div>
                            <div className="mt-5">
                                <Field label="Description *">
                                    <textarea required rows={4} className={inputCls} value={formData.description}
                                        onChange={(e) => set("description", e.target.value)} />
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle icon={<MapPin className="w-5 h-5" />} title="Location" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <Field label="Street Address *">
                                        <input type="text" required className={inputCls} value={formData.address}
                                            onChange={(e) => set("address", e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="City *">
                                    <input type="text" required className={inputCls} value={formData.city}
                                        onChange={(e) => set("city", e.target.value)} />
                                </Field>
                                <Field label="State">
                                    <input type="text" className={inputCls} value={formData.state}
                                        onChange={(e) => set("state", e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input type="text" className={inputCls} value={formData.pincode}
                                        onChange={(e) => set("pincode", e.target.value)} />
                                </Field>
                                <Field label="Capacity (players)">
                                    <input type="number" min="1" className={inputCls} value={formData.capacity}
                                        onChange={(e) => set("capacity", e.target.value)} />
                                </Field>
                                <Field label="Latitude (optional)">
                                    <input type="number" step="any" className={inputCls} value={formData.latitude}
                                        onChange={(e) => set("latitude", e.target.value)} />
                                </Field>
                                <Field label="Longitude (optional)">
                                    <input type="number" step="any" className={inputCls} value={formData.longitude}
                                        onChange={(e) => set("longitude", e.target.value)} />
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle icon={<Star className="w-5 h-5" />} title="Sports & Surface" />
                            <div className="space-y-5">
                                <Field label="Surface Type">
                                    <select className={inputCls} value={formData.surfaceType}
                                        onChange={(e) => set("surfaceType", e.target.value)}>
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
                            <input type="text" placeholder="Filter slots..." className={`${inputCls} mb-3 max-w-xs`}
                                value={slotSearch} onChange={(e) => setSlotSearch(e.target.value)} />
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {filteredSlots.map((slot) => (
                                    <button key={slot} type="button" onClick={() => toggle("availableSlots", slot)}
                                        className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.availableSlots.includes(slot) ? "bg-[#E33E33] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            {formData.availableSlots.length > 0 && (
                                <p className="text-xs text-gray-500 mt-2">{formData.availableSlots.length} slot{formData.availableSlots.length > 1 ? "s" : ""} selected</p>
                            )}
                        </section>

                        <section>
                            <SectionTitle icon={<Phone className="w-5 h-5" />} title="Contact Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Contact Phone">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="tel" className={`${inputCls} pl-10`} value={formData.contactPhone}
                                            onChange={(e) => set("contactPhone", e.target.value)} />
                                    </div>
                                </Field>
                                <Field label="Contact Email">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="email" className={`${inputCls} pl-10`} value={formData.contactEmail}
                                            onChange={(e) => set("contactEmail", e.target.value)} />
                                    </div>
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle icon={<Star className="w-5 h-5" />} title="Rules & Guidelines" />
                            <Field label="Turf Rules (optional)">
                                <textarea rows={3} className={inputCls} value={formData.rules}
                                    onChange={(e) => set("rules", e.target.value)} />
                            </Field>
                        </section>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 bg-[#E33E33] hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-60">
                                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button type="button" onClick={cancelEdit}
                                className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
