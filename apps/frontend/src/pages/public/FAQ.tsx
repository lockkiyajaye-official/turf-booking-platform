import { useState } from "react";

const faqs = [
    {
        question: "How do I book a turf?",
        answer: "Simply create an account, browse available turfs, select your preferred date and time slot, and confirm your booking. It's that easy!",
    },
    {
        question: "Can I cancel my booking?",
        answer: "Yes, you can cancel your booking from your dashboard. Please note that cancellation policies may vary depending on the turf owner.",
    },
    {
        question: "How do I list my turf?",
        answer: "Sign up as a turf owner, complete the onboarding process with your business details, and then you can start listing your turfs with all the details.",
    },
    {
        question: "What payment methods are accepted?",
        answer: "Currently, we support various payment methods. Payment details are handled securely through our platform.",
    },
    {
        question: "How do I know if a slot is available?",
        answer: "The platform shows real-time availability. When you select a date, you'll see all available time slots for that day.",
    },
    {
        question: "Can I book multiple slots?",
        answer: "Yes, you can book multiple slots. Each booking is processed separately, so you can book as many slots as you need.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-green-100">
                        Find answers to common questions about TurfBook
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <button
                                onClick={() =>
                                    setOpenIndex(
                                        openIndex === index ? null : index
                                    )
                                }
                                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                            >
                                <span className="font-semibold text-lg">
                                    {faq.question}
                                </span>
                                <span className="text-green-600 text-2xl">
                                    {openIndex === index ? "−" : "+"}
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <p className="text-gray-700">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Can't find the answer you're looking for? Please get in
                        touch with our friendly team.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
