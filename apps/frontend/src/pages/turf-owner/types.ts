export interface DashboardStats {
    overview: {
        totalTurfs: number;
        publishedTurfs: number;
        draftTurfs: number;
        totalBookings: number;
        confirmedBookings: number;
        pendingBookings: number;
        cancelledBookings: number;
        completedBookings: number;
        totalRevenue: number;
        recentRevenue: number;
    };
    bookingsByTurf: Array<{
        turfId: string;
        turfName: string;
        totalBookings: number;
        revenue: number;
    }>;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    turf: {
        id: string;
        name: string;
        address: string;
    };
}

export interface OwnerPayout {
    id: string;
    amount: number;
    status: "requested" | "completed" | "rejected";
    createdAt: string;
    processedAt?: string;
}

export interface WalletSummary {
    walletBalance: number;
    totalEarnings: number;
    totalPayouts: number;
    payouts: OwnerPayout[];
}

export interface Turf {
    id: string;
    name: string;
    description: string;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    pricePerHour: number;
    surfaceType?: string;
    capacity?: number;
    sports?: string[];
    amenities?: string[];
    images?: string[];
    primaryImageIndex?: number;
    availableSlots?: string[];
    rules?: string;
    contactPhone?: string;
    contactEmail?: string;
    isActive: boolean;
    isPublished: boolean;
    isDraft: boolean;
}
