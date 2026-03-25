export interface Statistics {
    totalUsers: number;
    totalTurfOwners: number;
    totalAdmins: number;
    pendingApprovals: number;
    approvedTurfOwners: number;
}

export interface AdminOverviewRevenue {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
}

export interface AdminOverviewBookings {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
}

export interface AdminOverviewUsers {
    totalUsers: number;
    totalTurfOwners: number;
    totalAdmins: number;
    newUsers7d: number;
    newTurfOwners7d: number;
}

export interface AdminOverviewWallet {
    totalLiability: number;
}

export interface AdminOverviewAlerts {
    failedPayments24h: number;
    failedPayments7d: number;
    payoutsRequested: number;
    inactiveTurfs: number;
}

export interface AdminOverviewTopTurf {
    turfId: string;
    turfName: string;
    ownerName?: string;
    revenue: number;
    bookings: number;
}

export interface AdminOverviewData {
    revenue: AdminOverviewRevenue;
    bookings: AdminOverviewBookings;
    users: AdminOverviewUsers;
    wallet: AdminOverviewWallet;
    alerts: AdminOverviewAlerts;
    topTurfsByRevenue: AdminOverviewTopTurf[];
}

export interface TurfOwner {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    isApproved?: boolean;
    createdAt: string;
    address?: string;
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
        ownerId: string;
    };
}

export type PayoutStatus = "requested" | "completed" | "rejected";

export interface AdminPaymentSummary {
    totalVolume: number;
    totalCount: number;
    successCount: number;
    failedCount: number;
}

export interface AdminPayoutStats {
    requestedCount: number;
    completedCount: number;
    rejectedCount: number;
    totalRequestedAmount: number;
    totalCompletedAmount: number;
    totalRejectedAmount: number;
}

export interface AdminPayout {
    id: string;
    amount: number;
    status: PayoutStatus;
    createdAt: string;
    processedAt?: string;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
}

export interface Turf {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    isActive: boolean;
    isPublished: boolean;
    isDraft: boolean;
    createdAt: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
}
