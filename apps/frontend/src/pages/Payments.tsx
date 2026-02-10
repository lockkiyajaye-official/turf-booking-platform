import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CreditCard, Smartphone, Clock } from "lucide-react";

export default function Payments() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please log in to manage payments</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
          <p className="text-sm text-gray-500 mb-6">
            Online payments for your turf bookings are processed securely in INR via Razorpay.
            Your bookings are confirmed only after a successful payment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-4 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="font-semibold">Cards, UPI & wallets</h2>
              <p className="text-sm text-gray-600">
                Pay using the options supported by Razorpay (cards, UPI apps, and popular wallets)
                during the booking flow.
              </p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold">Secure checkout</h2>
              <p className="text-sm text-gray-600">
                When you click &quot;Book Now&quot; on a turf, a secure Razorpay checkout opens and
                your booking is confirmed after payment succeeds.
              </p>
            </div>
            <Link
              to="/dashboard/payments/history"
              className="border rounded-lg p-4 flex flex-col items-start gap-3 hover:border-green-500"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="font-semibold">Payment history</h2>
              <p className="text-sm text-gray-600">
                View all your past online payments for turf bookings.
              </p>
            </Link>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              To make a new payment, browse turfs, choose a date and time slot, and click
              &quot;Book Now&quot; on the turf detail page. You&apos;ll be taken through Razorpay
              checkout to complete the payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
