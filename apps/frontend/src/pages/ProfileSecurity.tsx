import { useAuth } from "../context/AuthContext";

export default function ProfileSecurity() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please log in to manage security settings</div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password and security updates will be integrated soon.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Security</h1>
          <p className="text-sm text-gray-500 mb-6">
            Manage your login security, passwords, and future two-factor
            authentication.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Update password
              </button>
            </div>
          </form>

          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">
              Two-factor authentication
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              We will soon support additional login verification (OTP / app
              based) to protect your INR payments and bookings.
            </p>
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 cursor-not-allowed">
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
