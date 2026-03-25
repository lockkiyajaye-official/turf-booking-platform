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
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10 max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Payments</h1>
                    <p className="text-base text-gray-500 mb-8">
                        Online payments for your turf bookings are processed securely in INR via Razorpay.
                        Your bookings are confirmed only after a successful payment.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="border border-gray-100 rounded-xl p-6 flex flex-col items-start gap-4 hover:border-red-100 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100/50 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-[#e53935]" />
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg">Cards, UPI & wallets</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Pay using the options supported by Razorpay (cards, UPI apps, and popular wallets)
                                during the booking flow.
                            </p>
                        </div>
                        
                        <div className="border border-gray-100 rounded-xl p-6 flex flex-col items-start gap-4 hover:border-red-100 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/50 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-gray-700" />
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg">Secure checkout</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                When you click &quot;Book Now&quot; on a turf, a secure Razorpay checkout opens and
                                your booking is confirmed after payment succeeds.
                            </p>
                        </div>

                        <Link
                            to="/dashboard/payments/history"
                            className="border border-gray-100 rounded-xl p-6 flex flex-col items-start gap-4 hover:border-[#e53935] hover:shadow-md transition-all group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100/50 flex items-center justify-center group-hover:bg-[#e53935] transition-colors">
                                <Clock className="w-6 h-6 text-[#e53935] group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg group-hover:text-[#e53935] transition-colors">Payment history</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                View all your past online payments for turf bookings.
                            </p>
                        </Link>
                    </div>

                    <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p>
                            To make a new payment, browse turfs, choose a date and time slot, and click
                            <strong className="text-gray-700 mx-1">&quot;Book Now&quot;</strong> on the turf detail page. You&apos;ll be taken through Razorpay
                            checkout to complete the payment.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
