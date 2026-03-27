import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: <Eye className="w-6 h-6" />,
            title: "Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, book a turf, or contact us. This includes your name, email address, phone number, payment information, and usage data."
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: "How We Use Your Information",
            content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Data Security",
            content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using industry-standard SSL technology."
        },
        {
            icon: <UserCheck className="w-6 h-6" />,
            title: "Your Rights",
            content: "You have the right to access, update, or delete your personal information. You can also object to processing of your personal data, request data portability, or withdraw consent where applicable."
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: "Third-Party Services",
            content: "We may share your information with trusted third-party service providers who assist us in operating our platform, such as payment processors and hosting services, only as necessary to perform their functions."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Privacy Policy"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <Shield className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-bold tracking-wider">
                                Privacy Policy
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Your Privacy{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Matters
                            </span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-xl leading-relaxed">
                            We're committed to protecting your personal information and ensuring your privacy.
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
                                Our Commitment to Privacy
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                At Lock Kiya Jaye, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our turf booking platform.
                            </p>
                        </div>

                        {/* Privacy Sections */}
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

                        {/* Contact Information */}
                        <div className="bg-accent rounded-[2rem] p-8 mt-16 text-white">
                            <h3 className="text-2xl font-bold mb-4">
                                Questions About Your Privacy?
                            </h3>
                            <p className="text-white/80 mb-6">
                                If you have any questions about this Privacy Policy or how we handle your personal information, please don't hesitate to contact us.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-accent px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    Email Us
                                </button>
                                <button className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                                    Contact Support
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
                            Key Privacy Principles
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                🛡️
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Protection First</h4>
                            <p className="text-gray-600 text-sm">
                                Your data security is our top priority
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                🔒
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Secure Storage</h4>
                            <p className="text-gray-600 text-sm">
                                Industry-standard encryption and security measures
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                            <div className="text-3xl font-black text-accent mb-3">
                                👁️
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Transparency</h4>
                            <p className="text-gray-600 text-sm">
                                Clear information about data usage and rights
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
