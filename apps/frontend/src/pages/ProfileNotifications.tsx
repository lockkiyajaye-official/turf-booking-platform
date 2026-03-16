import { useAuth } from "../context/AuthContext";

export default function ProfileNotifications() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please log in to manage notifications</div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Notification preferences will be saved once the API is ready.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Notification settings
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Choose how you want to be notified about bookings, cancellations,
            payments, and promos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                id="email-bookings"
                type="checkbox"
                className="mt-1"
                defaultChecked
              />
              <label
                htmlFor="email-bookings"
                className="text-sm text-gray-700"
              >
                Email me about booking confirmations, changes, and cancellations.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="email-payments"
                type="checkbox"
                className="mt-1"
                defaultChecked
              />
              <label
                htmlFor="email-payments"
                className="text-sm text-gray-700"
              >
                Email me receipts and payment related updates (INR payments).
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input id="email-promos" type="checkbox" className="mt-1" />
              <label htmlFor="email-promos" className="text-sm text-gray-700">
                Send me offers and promotions from nearby turfs.
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Save preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
