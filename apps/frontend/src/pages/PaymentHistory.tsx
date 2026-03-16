import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

type PaymentStatus = "created" | "success" | "failed";

interface UserPayment {
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

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      try {
        const { data } = await api.get("/payments/history");
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payment history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please log in to view payment history</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment history
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            These are your completed and attempted online payments for turf bookings.
          </p>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No payment records yet.</p>
              <Link
                to="/dashboard/bookings"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Go to your bookings
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.turfName || "Turf booking"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Booking ID: {p.bookingId}
                    </p>
                    {p.bookingDate && (
                      <p className="text-xs text-gray-500">
                        Date: {new Date(p.bookingDate).toLocaleDateString()}{" "}
                        {p.startTime && p.endTime && `• ${p.startTime} - ${p.endTime}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Paid at: {new Date(p.createdAt).toLocaleString()}
                    </p>
                    {p.razorpayPaymentId && (
                      <p className="text-xs text-gray-400">
                        Razorpay payment ID: {p.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{p.amount.toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs capitalize ${p.status === "success"
                          ? "bg-green-100 text-green-800"
                          : p.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
