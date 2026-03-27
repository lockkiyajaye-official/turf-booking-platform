import { Calendar, HelpCircle, MessageSquare, Shield, Users, Zap } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How do I book a turf?",
            answer: "Simply create an account, browse available turfs, select your preferred date and time slot, and confirm your booking. It's that easy!",
            category: "Booking"
        },
        {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel your booking from your dashboard. Please note that cancellation policies may vary depending on the turf owner.",
            category: "Booking"
        },
        {
            question: "How do I list my turf?",
            answer: "Sign up as a turf owner, complete the onboarding process with your business details, and then you can start listing your turfs with all the details.",
            category: "Turf Owners"
        },
        {
            question: "What payment methods are accepted?",
            answer: "Currently, we support various payment methods. Payment details are handled securely through our platform.",
            category: "Payment"
        },
        {
            question: "How do I know if a slot is available?",
            answer: "The platform shows real-time availability. When you select a date, you'll see all available time slots for that day.",
            category: "Booking"
        },
        {
            question: "Can I book multiple slots?",
            answer: "Yes, you can book multiple slots. Each booking is processed separately, so you can book as many slots as you need.",
            category: "Booking"
        },
        {
            question: "Is my payment information secure?",
            answer: "Absolutely! We use industry-standard encryption and secure payment gateways to protect all your financial information.",
            category: "Payment"
        },
        {
            question: "How do I manage my team bookings?",
            answer: "Our app allows you to manage team members, split payments, and coordinate group bookings seamlessly.",
            category: "Features"
        }
    ];

    const categories = ["All", "Booking", "Payment", "Turf Owners", "Features"];
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredFaqs = activeCategory === "All"
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const helpTopics = [
        {
            icon: <Calendar className="w-6 h-6" />,
            title: "Booking Process",
            desc: "Learn how to book your favorite turf"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Payment & Security",
            desc: "Secure payment methods and policies"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Account Management",
            desc: "Manage your profile and preferences"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Mobile App Features",
            desc: "Get the most out of our mobile app"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="FAQ"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-white text-sm font-bold tracking-wider">
                                Help Center
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Frequently Asked{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Questions
                            </span>
                        </h1>
                        <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                            Find answers to common questions about Lock Kiya Jaye and get the most out of your turf booking experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Help Topics */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Browse Help Topics
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {helpTopics.map((topic, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
                            >
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                    {topic.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {topic.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {topic.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Categories */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-8">
                            Common Questions
                        </h2>

                        <div className="flex flex-wrap justify-center gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all ${activeCategory === category
                                        ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                                        : "bg-light text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4">
                        {filteredFaqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                <button
                                    onClick={() =>
                                        setOpenIndex(
                                            openIndex === idx ? null : idx
                                        )
                                    }
                                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 flex-shrink-0">
                                            <HelpCircle className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-xl text-gray-900 block mb-1">
                                                {faq.question}
                                            </span>
                                            <span className="text-sm text-accent font-medium">
                                                {faq.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-accent text-2xl font-light group-hover:scale-110 transition-transform">
                                            {openIndex === idx ? "−" : "+"}
                                        </span>
                                    </div>
                                </button>
                                {openIndex === idx && (
                                    <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still Need Help */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="bg-accent rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
                        <div className="max-w-3xl mx-auto">
                            <MessageSquare className="w-16 h-16 text-white mx-auto mb-6" />
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Still Need Help?
                            </h2>
                            <p className="text-white/80 text-lg mb-8">
                                Can't find the answer you're looking for? Our friendly support team is here to help you 24/7.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="bg-white text-accent px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                                    <MessageSquare className="w-5 h-5 inline mr-2" />
                                    Live Chat
                                </button>
                                <button className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                                    Email Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                                24/7
                            </div>
                            <div className="text-gray-500 font-bold text-sm tracking-wide">
                                Support Available
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                                &lt;2hrs
                            </div>
                            <div className="text-gray-500 font-bold text-sm tracking-wide">
                                Average Response Time
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                                98%
                            </div>
                            <div className="text-gray-500 font-bold text-sm tracking-wide">
                                Customer Satisfaction
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
