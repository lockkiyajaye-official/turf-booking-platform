export interface RecentBookingItem {
    id: string;
    turfName: string;
    userName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
}

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
    recentBookings?: RecentBookingItem[];
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: BookingStatus;
    bookingSource?: "online" | "direct";
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    notes?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    refundAmount?: number;
    refundStatus?: string;
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
    notes?: string;
    createdAt: string;
    processedAt?: string;
}

export interface PayoutDetails {
    accountHolderName?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    upiId?: string;
}

export interface WalletSummary {
    walletBalance: number;
    totalEarnings: number;
    totalPayouts: number;
    payoutDetails?: PayoutDetails;
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
    cancellationPolicyEnabled?: boolean;
    fullRefundHours?: number;
    partialRefundHours?: number;
    partialRefundPercentage?: number;
    contactPhone?: string;
    contactEmail?: string;
    googleMapUrl?: string;
    mapUrl?: string;
    isActive: boolean;
    isPublished: boolean;
    isDraft: boolean;
}
