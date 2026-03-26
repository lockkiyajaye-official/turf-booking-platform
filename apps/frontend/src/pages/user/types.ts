export type PaymentStatus = "created" | "success" | "failed";

export interface UserPayment {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    bookingId: string;
    turfName?: string;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    createdAt: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
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
    amenities: string[];
    images: string[];
    primaryImageIndex?: number;
    availableSlots: string[];
    rules?: string;
    rating: number | string;
    totalReviews: number;
    contactPhone?: string;
    contactEmail?: string;
    latitude?: number;
    longitude?: number;
}

export interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
    turf: Turf;
}
