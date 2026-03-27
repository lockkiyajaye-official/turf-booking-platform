import { Calendar, CheckCircle2, Shield, Trophy, Users, Zap } from "lucide-react";

export default function About() {
    const stats = [
        {
            number: "10,000+",
            label: "Games Successfully Booked"
        },
        {
            number: "98%",
            label: "Satisfaction Rate"
        },
        {
            number: "5+ Years",
            label: "Experience"
        },
        {
            number: "50+",
            label: "Premium Turfs"
        }
    ];

    const features = [
        {
            icon: <Calendar className="w-6 h-6" />,
            title: "Easy Booking",
            desc: "Book your favorite turf in just 3 clicks with our seamless UI."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Secure Payment",
            desc: "100% secure payment gateways for all your transactions."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Management",
            desc: "Manage your team and split payments directly in the app."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Real-time Slot",
            desc: "Get real-time updates on slot availability and stadium news."
        }
    ];

    const services = [
        {
            icon: <CheckCircle2 className="w-6 h-6" />,
            title: "Pitch Booking",
            desc: "Professional fields for professionals"
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            title: "Match Scheduling",
            desc: "Flexible scheduling for your games"
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: "Tournaments",
            desc: "Organize and join tournaments"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Night Games",
            desc: "Floodlight facilities for night matches"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/stadium.png"
                        alt="Stadium"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 border border-white px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-white text-sm font-bold tracking-wider">
                                About Lock Kiya Jaye
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Empowering{" "}
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Every Game
                            </span>{" "}
                            With Seamless Turf Booking
                        </h1>
                        <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                            We are more than just a turf booking platform - we are a growing community of players, teams, and sports lovers. Our mission is to make turf booking simple, fast, and reliable.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-500 font-bold text-sm tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 mb-16 items-start">
                        <h2 className="md:w-3/5 text-5xl md:text-6xl font-black text-gray-900 leading-[1.1]">
                            Our{" "}
                            <span className="text-accent">Mission</span>
                            <br />
                            To Make Sports Accessible To Everyone
                        </h2>
                        <p className="md:w-2/5 text-gray-400 text-lg leading-relaxed pt-2">
                            At Lock Kiya Jaye, we believe that everyone should have easy access to quality sports facilities. Our mission is to simplify the process of finding and booking turfs, making it easier for players to enjoy their favorite sport.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative h-[400px] rounded-[3rem] overflow-hidden shadow-sm">
                            <img
                                src="/images/about_kids.png"
                                alt="Our Mission"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <p className="text-white text-lg font-medium leading-relaxed">
                                    Making sports accessible to everyone by providing high-quality turf facilities with real-time booking.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Lock Kiya Jaye is a comprehensive platform that connects turf owners with players looking to book sports facilities.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Easy turf discovery and search",
                                        "Real-time availability checking",
                                        "Secure booking system",
                                        "Turf management tools for owners",
                                        "User-friendly interface for all"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center space-x-3">
                                            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Founded in 2024, Lock Kiya Jaye was born out of a simple need: making it easier to find and book sports turfs. We noticed that players often struggled to find available turfs and owners had difficulty managing their bookings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-gray-900 mb-4">
                            Why Choose Lock Kiya Jaye?
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
                            >
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 opacity-10">
                    <img
                        src="https://images.unsplash.com/photo-1556056504-517173f4aa0b?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-white mb-6">
                            Our Services
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Professional fields for professionals. Whether it's a friendly match or a tournament, we've got you covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all group"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {service.title}
                                </h3>
                                <p className="text-white/40 text-sm">
                                    {service.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="bg-accent rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Ready to Join Our Community?
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                            Download our app and start booking your favorite turfs in minutes. Join thousands of players who trust Lock Kiya Jaye.
                        </p>
                        <button className="bg-white text-accent px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
