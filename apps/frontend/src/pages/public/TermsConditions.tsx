import { FileText, CheckCircle, AlertTriangle, Clock, Users, CreditCard } from "lucide-react";

export default function TermsConditions() {
    const sections = [
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Acceptance of Terms",
            content: "By accessing and using Lock Kiya Jaye, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "User Accounts",
            content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password."
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Booking Terms",
            content: "All bookings are subject to availability and confirmation by the turf owner. You must provide accurate information when booking and agree to follow all rules and regulations of the turf facility."
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Payment Terms",
            content: "Payments must be made at the time of booking unless otherwise specified. All prices are listed in local currency and are inclusive of applicable taxes."
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Cancellation Policy",
            content: "Cancellation policies vary by turf owner. Please review the specific cancellation terms for each booking before confirming. Some bookings may be non-refundable."
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: "Limitation of Liability",
            content: "Lock Kiya Jaye shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Terms and Conditions"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <FileText className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-bold tracking-wider">
                                Terms & Conditions
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Terms &{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Conditions
                            </span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-xl leading-relaxed">
                            Please read these terms carefully before using our turf booking platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* Last Updated */}
            <section className="py-8 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <p className="text-gray-600 font-medium">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Introduction */}
                        <div className="bg-light p-8 rounded-[2rem] mb-16">
                            <h2 className="text-3xl font-black text-gray-900 mb-6">
                                Welcome to Lock Kiya Jaye
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                These Terms and Conditions govern your use of Lock Kiya Jaye's turf booking platform and services. By using our platform, you agree to these terms and our Privacy Policy.
                            </p>
                        </div>

                        {/* Terms Sections */}
                        <div className="space-y-12">
                            {sections.map((section, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex items-start space-x-4 mb-6">
                                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent flex-shrink-0">
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {section.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-lg pl-20">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Additional Terms */}
                        <div className="bg-gray-50 p-8 rounded-[2rem] mt-16">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Additional Important Terms
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Prohibited Activities</h4>
                                    <p className="text-gray-700">You may not use our platform for any illegal or unauthorized purpose. You agree not to use the service to: submit false or misleading information, harass or abuse other users, or violate any applicable laws.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Intellectual Property</h4>
                                    <p className="text-gray-700">All content, features, and functionality of the Lock Kiya Jaye platform are owned by Lock Kiya Jaye and are protected by trademark, copyright, and other intellectual property laws.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Termination</h4>
                                    <p className="text-gray-700">We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-accent rounded-[2rem] p-8 mt-16 text-white">
                            <h3 className="text-2xl font-bold mb-4">
                                Questions About Our Terms?
                            </h3>
                            <p className="text-white/80 mb-6">
                                If you have any questions about these Terms and Conditions, please contact our legal team.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-accent px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    Contact Legal
                                </button>
                                <button className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                                    Email Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Points */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Important Reminders
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                📖
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Read Carefully</h4>
                            <p className="text-gray-600 text-sm">
                                Take time to understand all terms before booking
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                ✅
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Follow Rules</h4>
                            <p className="text-gray-600 text-sm">
                                Respect turf rules and regulations at all times
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                🤝
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Fair Use</h4>
                            <p className="text-gray-600 text-sm">
                                Use the platform responsibly and ethically
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
