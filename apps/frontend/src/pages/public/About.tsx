export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">About TurfBook</h1>
                    <p className="text-xl text-green-100">
                        Connecting football enthusiasts with the best turfs in
                        town
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="text-gray-700 leading-relaxed">
                        At TurfBook, we believe that everyone should have easy
                        access to quality football facilities. Our mission is to
                        simplify the process of finding and booking football
                        turfs, making it easier for players to enjoy their
                        favorite sport.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-3xl font-bold mb-4">What We Do</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        TurfBook is a comprehensive platform that connects turf
                        owners with players looking to book football facilities.
                        We provide:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Easy turf discovery and search</li>
                        <li>Real-time availability checking</li>
                        <li>Secure booking system</li>
                        <li>Turf management tools for owners</li>
                        <li>User-friendly interface for all</li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Founded in 2024, TurfBook was born out of a simple need:
                        making it easier to find and book football turfs. We
                        noticed that players often struggled to find available
                        turfs and owners had difficulty managing their bookings.
                        TurfBook bridges this gap, creating a seamless
                        experience for both players and turf owners.
                    </p>
                </div>
            </div>
        </div>
    );
}
