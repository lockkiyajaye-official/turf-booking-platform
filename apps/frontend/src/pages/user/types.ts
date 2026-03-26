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
    pricePerHour: number;
    amenities: string[];
    images: string[];
    availableSlots: string[];
    rating: number | string;
    totalReviews: number;
    contactPhone?: string;
    contactEmail?: string;
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
