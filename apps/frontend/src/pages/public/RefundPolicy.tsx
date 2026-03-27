import { RefreshCw, Clock, AlertCircle, CheckCircle, XCircle, CreditCard } from "lucide-react";

export default function RefundPolicy() {
    const refundScenarios = [
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Full Refund Eligible",
            scenarios: [
                "Cancellation made more than 48 hours before booking time",
                "Turf facility closure due to weather or maintenance",
                "Double payment or technical error confirmed by our team",
                "Turf owner cancels the booking"
            ],
            refund: "100% refund"
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: "Partial Refund Eligible",
            scenarios: [
                "Cancellation between 24-48 hours before booking time",
                "Rescheduling to a different time slot (subject to availability)",
                "Partial facility usage due to technical issues",
                "Early departure with valid reason"
            ],
            refund: "50-75% refund"
        },
        {
            icon: <XCircle className="w-6 h-6" />,
            title: "No Refund",
            scenarios: [
                "Cancellation less than 24 hours before booking time",
                "No-show without prior notification",
                "Violation of turf rules and regulations",
                "Booking confirmed with special discounted rates"
            ],
            refund: "No refund"
        }
    ];

    const process = [
        {
            step: 1,
            title: "Submit Request",
            desc: "Log into your account and submit a refund request through your booking history"
        },
        {
            step: 2,
            title: "Review Process",
            desc: "Our team reviews your request within 24-48 hours"
        },
        {
            step: 3,
            title: "Approval",
            desc: "If approved, refund is processed to original payment method"
        },
        {
            step: 4,
            title: "Confirmation",
            desc: "You'll receive email confirmation once refund is processed"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Refund Policy"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <RefreshCw className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-bold tracking-wider">
                                Refund Policy
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Fair &{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Transparent
                            </span>{" "}
                            Refunds
                        </h1>
                        <p className="text-xl text-white/80 max-w-xl leading-relaxed">
                            Our refund policy is designed to be fair to both customers and turf owners.
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

            {/* Refund Scenarios */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Refund Eligibility
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {refundScenarios.map((scenario, idx) => (
                            <div key={idx} className={`rounded-[2rem] p-8 shadow-sm border-2 ${idx === 0 ? 'bg-green-50 border-green-200' :
                                    idx === 1 ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
                                }`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${idx === 0 ? 'bg-green-100 text-green-600' :
                                        idx === 1 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                    }`}>
                                    {scenario.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {scenario.title}
                                </h3>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${idx === 0 ? 'bg-green-100 text-green-700' :
                                        idx === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {scenario.refund}
                                </div>
                                <ul className="space-y-2">
                                    {scenario.scenarios.map((item, itemIdx) => (
                                        <li key={itemIdx} className="flex items-start space-x-2">
                                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${idx === 0 ? 'bg-green-500' :
                                                    idx === 1 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}></div>
                                            <span className="text-gray-700 text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Refund Process */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            How Refunds Work
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {process.map((step, idx) => (
                                <div key={idx} className="relative">
                                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mx-auto mb-4">
                                            <span className="text-xl font-black">{step.step}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                                        <p className="text-gray-600 text-sm">{step.desc}</p>
                                    </div>
                                    {idx < process.length - 1 && (
                                        <div className="hidden md:block absolute top-12 left-full w-full">
                                            <div className="flex items-center justify-center">
                                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Notes */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-accent rounded-[2rem] p-8 text-white">
                            <h3 className="text-2xl font-bold mb-6">
                                Important Notes
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/90">
                                            Refunds are typically processed within 5-7 business days to your original payment method.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CreditCard className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/90">
                                            Processing fees may apply for certain payment methods and international transactions.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/90">
                                            Some special promotions and discounted bookings may have different refund terms.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-6">
                            Need Help With Refunds?
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Our support team is here to help you with any refund-related questions or concerns.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
                                Contact Support
                            </button>
                            <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200">
                                Check Refund Status
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
