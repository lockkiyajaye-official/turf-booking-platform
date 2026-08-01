import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, Trash2, Globe, MapPin, CreditCard, Baby } from "lucide-react";

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: <Eye className="w-6 h-6" />,
            title: "1. Information We Collect",
            content: "To provide seamlessly locked turf slots and venue bookings, Lockkiyajaye collects the following categories of information:",
            bullets: [
                "Personal Information: Name, email address, mobile phone number, date of birth, and profile credentials created upon registration.",
                "Location Data: Precise and coarse device location data when searching for nearby sports turfs, pitches, and venues.",
                "Financial & Transaction Information: Payment transaction history, billing details, and slot booking logs processed securely through certified PCI-DSS compliant third-party payment gateways (we do not store raw card credentials).",
                "Device & Log Information: IP address, device model, operating system version, unique device identifiers, and crash logs to maintain app stability and security."
            ]
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: "2. How We Use Your Information",
            content: "We use the collected information strictly for operational and legal compliance purposes:",
            bullets: [
                "Processing and confirming real-time turf slot reservations.",
                "Enabling search features to display nearby sports facilities based on your location.",
                "Sending booking confirmations, OTP verifications, reminders, and customer support communications.",
                "Preventing fraudulent transactions and ensuring platform security.",
                "Improving app performance, user experience, and features of Lockkiyajaye."
            ]
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "3. Location Data Usage",
            content: "Lockkiyajaye collects location data to display sports turfs near your current location. Location data is accessed only when you use nearby venue search features or explicitly grant location permissions. You can disable location access anytime via your device settings, though distance-based turf sorting may be limited.",
            bullets: []
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "4. Third-Party Payment Services",
            content: "All online payments on Lockkiyajaye are processed by encrypted, industry-standard third-party payment processors (such as Razorpay or Stripe). These service providers adhere to PCI-DSS standards. We do not store sensitive payment card credentials on our servers.",
            bullets: []
        },
        {
            icon: <AlertCircle className="w-6 h-6" />,
            title: "5. Third-Party Data Sharing",
            content: "We do not sell, rent, or trade your personal information. Data is shared only under the following strictly defined conditions:",
            bullets: [
                "With Venue Managers & Turf Owners: Booking details (your name, contact number, slot time) are shared with the specific venue owner for slot verification at the ground.",
                "With Authorized Service Providers: Cloud infrastructure hosting, SMS/OTP gateways, and analytics tools that operate under strict confidentiality agreements.",
                "Legal Requirements: When required by law enforcement or regulatory authorities."
            ]
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "6. Data Security & Encryption",
            content: "We implement robust technical and organizational security controls to protect your data. All communication between the Lockkiyajaye mobile app, web application, and backend servers is encrypted in transit using Transport Layer Security (TLS/HTTPS). Stored user data is protected behind firewalls and access-controlled databases.",
            bullets: []
        },
        {
            icon: <Trash2 className="w-6 h-6" />,
            title: "7. Account & Data Deletion Rights (Google Play Policy Compliance)",
            content: "In compliance with Google Play Developer Policies, Lockkiyajaye provides users with full rights to delete their account and associated data at any time:",
            bullets: [
                "In-App Deletion: Navigate to Profile -> Settings -> Delete Account inside the Lockkiyajaye mobile or web application.",
                "Web & Email Request: You can submit an account deletion request directly via email to support@lockkiyajaye.com with the subject line 'Account Deletion Request'.",
                "Effect of Deletion: Upon account deletion, all personal data (name, email, phone number, saved preferences) will be permanently purged from our primary database within 30 days, except where retention is required by tax or financial auditing laws."
            ]
        },
        {
            icon: <UserCheck className="w-6 h-6" />,
            title: "8. Your Rights & Choices",
            content: "Depending on your jurisdiction, you hold rights regarding your personal data including:",
            bullets: [
                "Right to Access: Request a copy of the personal data we hold about you.",
                "Right to Rectification: Correct inaccurate or incomplete profile details.",
                "Right to Opt-Out: Unsubscribe from promotional SMS or email notifications."
            ]
        },
        {
            icon: <Baby className="w-6 h-6" />,
            title: "9. Children's Privacy",
            content: "Lockkiyajaye is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided personal data without verified parental consent, we promptly delete such information.",
            bullets: []
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "10. Changes to This Privacy Policy",
            content: "We may update this Privacy Policy periodically to reflect app updates or legal compliance changes. Material updates will be notified in-app or posted on this page with an updated revision date.",
            bullets: []
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Privacy Policy - Lockkiyajaye"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white/40 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-white text-sm font-bold tracking-wider uppercase">
                                Lockkiyajaye Policy
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                            Privacy <span className="text-emerald-400">Policy</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
                            Official Privacy Policy for Lockkiyajaye turf booking platform and mobile application.
                        </p>
                    </div>
                </div>
            </section>

            {/* Revision Date Bar */}
            <section className="py-6 bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-sm text-gray-600 font-medium">
                    <p>App Name: <strong className="text-gray-900">Lockkiyajaye</strong></p>
                    <p>Google Play Developer Compliance Version</p>
                    <p>Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </section>

            {/* Main Policy Content */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Scope Box */}
                        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl mb-12">
                            <h2 className="text-2xl font-black text-emerald-950 mb-4">
                                Platform & Application Scope
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                This Privacy Policy applies to the <strong>Lockkiyajaye</strong> mobile application (Android & iOS) and the web portal hosted at <a href="https://lockkiyajaye.com" className="text-emerald-700 font-bold underline">https://lockkiyajaye.com</a>. By downloading, accessing, or using Lockkiyajaye, you consent to the practices described in this policy.
                            </p>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-10">
                            {sections.map((section, idx) => (
                                <div key={idx} className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-emerald-100/80 rounded-2xl flex items-center justify-center text-emerald-700 flex-shrink-0">
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                                {section.title}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 leading-relaxed font-normal mb-4">
                                        {section.content}
                                    </p>

                                    {section.bullets && section.bullets.length > 0 && (
                                        <ul className="space-y-2 pl-4 border-l-2 border-emerald-300">
                                            {section.bullets.map((bullet, bIdx) => (
                                                <li key={bIdx} className="text-gray-700 text-sm md:text-base leading-relaxed flex items-start space-x-2">
                                                    <span className="text-emerald-500 font-bold">•</span>
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Account Deletion Callout Box (Playstore Requirement) */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 mt-14 shadow-xl border border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <Trash2 className="w-7 h-7 text-emerald-400" />
                                <h3 className="text-2xl font-bold">
                                    Request Account & Data Deletion
                                </h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Want to delete your Lockkiyajaye account and all associated booking logs? You can do so directly in-app or by sending an email request to our support desk.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a 
                                    href="mailto:support@lockkiyajaye.com?subject=Account%20Deletion%20Request"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-6 py-3 rounded-xl font-bold transition-all shadow-lg inline-flex items-center gap-2"
                                >
                                    Email Account Deletion Request
                                </a>
                                <a 
                                    href="/contact"
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/20"
                                >
                                    Contact Support Team
                                </a>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-emerald-900 text-white rounded-3xl p-8 mt-10">
                            <h3 className="text-2xl font-bold mb-3">
                                Contact Information & Grievance Officer
                            </h3>
                            <p className="text-emerald-200 text-sm mb-6">
                                For any questions, data access requests, or privacy concerns regarding Lockkiyajaye, contact our Data Protection Office:
                            </p>
                            <div className="space-y-2 text-sm text-emerald-100">
                                <p><strong>App Name:</strong> Lockkiyajaye</p>
                                <p><strong>Email:</strong> support@lockkiyajaye.com</p>
                                <p><strong>Website:</strong> <a href="https://lockkiyajaye.com" className="underline font-bold text-white">https://lockkiyajaye.com</a></p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

