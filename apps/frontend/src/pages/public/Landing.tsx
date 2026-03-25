import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Quote,
    Search,
    Shield,
    Star,
    Trophy,
    Users,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppleLogo, PlayStoreLogo } from "../../components/Icons";

export default function Landing() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState("All Turfs");
    const [location, setLocation] = useState("");
    const [sport, setSport] = useState("");
    const [date, setDate] = useState("");

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.append("search", location);
        if (sport) params.append("sport", sport);
        if (date) params.append("date", date);
        navigate(`/turfs?${params.toString()}`);
    };

    const turfs = [
        {
            id: 1,
            name: "Elite Arena Football Turf",
            location: "San Francisco, CA",
            rating: 4.8,
            price: "1,200",
            tag: "5x5 Turf",
            image: "/images/turf.png",
        },
        {
            id: 2,
            name: "Victory Football Arena",
            location: "Los Angeles, CA",
            rating: 4.9,
            price: "1,800",
            tag: "7x7 Turf",
            image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 3,
            name: "Night Strikerz Turf",
            location: "New York, NY",
            rating: 4.7,
            price: "1,500",
            tag: "Floodlight Turf",
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center pt-20">
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
                                Available 24/7
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Book Your Perfect <br />
                            <span className="text-accent underline decoration-white/20 underline-offset-8">
                                Sports Turf
                            </span>{" "}
                            Today
                        </h1>
                        <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                            Find and reserve sports facilities in minutes from
                            football to cricket discover the best turfs near
                            you.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 max-w-4xl border border-gray-100">
                            <div
                                className="flex-1 flex items-center space-x-3 px-4 border-r border-gray-100 last:border-0 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-xl py-2 cursor-text"
                                onClick={() =>
                                    document
                                        .getElementById("search-location")
                                        ?.focus()
                                }
                            >
                                <MapPin className="text-accent w-5 h-5 flex-shrink-0" />
                                <div className="flex flex-col w-full">
                                    <label
                                        htmlFor="search-location"
                                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-text"
                                    >
                                        Location
                                    </label>
                                    <input
                                        id="search-location"
                                        type="text"
                                        value={location}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                        placeholder="Find Location"
                                        className="bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-bold text-gray-800 placeholder:text-gray-300 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 flex items-center space-x-3 px-4 border-r border-gray-100 last:border-0 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-xl py-2 cursor-pointer">
                                <Trophy className="text-accent w-5 h-5 flex-shrink-0" />
                                <div className="flex flex-col w-full relative">
                                    <label
                                        htmlFor="search-sport"
                                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer"
                                    >
                                        Sport
                                    </label>
                                    <select
                                        id="search-sport"
                                        value={sport}
                                        onChange={(e) =>
                                            setSport(e.target.value)
                                        }
                                        className="bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-bold text-gray-800 w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Sport</option>
                                        <option value="Football">
                                            Football
                                        </option>
                                        <option value="Cricket">Cricket</option>
                                        <option value="Basketball">
                                            Basketball
                                        </option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-3 text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center space-x-3 px-4 border-r border-gray-100 last:border-0 w-full md:w-auto hover:bg-gray-50 transition-colors rounded-xl py-2 cursor-pointer">
                                <Calendar className="text-accent w-5 h-5 flex-shrink-0" />
                                <div className="flex flex-col w-full relative">
                                    <label
                                        htmlFor="search-date"
                                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer"
                                    >
                                        Date
                                    </label>
                                    <input
                                        id="search-date"
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        className="bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-bold text-gray-800 w-full cursor-pointer [color-scheme:light]"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 w-full md:w-auto shadow-lg shadow-accent/20"
                            >
                                <Search className="w-5 h-5" />
                                <span>Search Turf</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            {/* Redesigned About Us Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    {/* Badge */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-block bg-white border border-gray-100 px-8 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-gray-800 font-bold text-lg">
                            About Us
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row gap-8 mb-16 items-start">
                        <h2 className="md:w-3/5 text-5xl md:text-6xl font-black text-gray-900 leading-[1.1]">
                            Empowering{" "}
                            <span className="text-[#FF4D4D]">Every Game</span>
                            <br />
                            With Seamless Turf Booking
                        </h2>
                        <p className="md:w-2/5 text-gray-400 text-lg leading-relaxed pt-2">
                            We are more than just a turf booking platform we are
                            a growing community of players, teams, and sports
                            lovers. Our mission is to make turf booking simple,
                            fast, and reliable, so you can focus on what truly
                            matters the game.
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Large Card */}
                        <div className="md:col-span-2 relative h-[450px] rounded-[3rem] overflow-hidden shadow-sm">
                            <img
                                src="/images/about_kids.png"
                                alt="Our Mission"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <p className="text-white text-lg font-medium leading-relaxed max-w-lg">
                                    Our Mission to make sports accessible to
                                    everyone by providing high-quality turf
                                    facilities with real-time booking and
                                    seamless management.
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:col-span-2">
                            <div className="flex flex-col md:flex-row w-full gap-5">
                                <div className="h-[280px] rounded-[3rem] overflow-hidden mb-8 shadow-sm">
                                    <img
                                        src="/images/about_turf_line.png"
                                        alt="Turf Quality"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="h-[280px] rounded-[3rem] overflow-hidden mb-8 shadow-sm">
                                    <img
                                        src="/images/about_coaches.png"
                                        alt="Professional Support"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="">
                                    <div className="text-4xl font-black text-gray-900 mb-2">
                                        10,000+
                                    </div>
                                    <div className="text-gray-500 font-bold text-sm tracking-wide">
                                        Games Successfully Booked
                                    </div>
                                </div>
                                <div className="">
                                    <div className="text-4xl font-black text-gray-900 mb-2">
                                        98%
                                    </div>
                                    <div className="text-gray-500 font-bold text-sm tracking-wide">
                                        Satisfaction Rate
                                    </div>
                                </div>
                                <div className="">
                                    <div className="text-4xl font-black text-gray-900 mb-2">
                                        5+ Years
                                    </div>
                                    <div className="text-gray-500 font-bold text-sm tracking-wide">
                                        Experience
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:border-gray-300 transition-all">
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button className="w-14 h-14 rounded-full bg-[#E33E33] flex items-center justify-center text-white shadow-xl shadow-red-500/20 hover:bg-[#c9352c] transition-all">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Download App */}
            <section className="py-24 bg-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-gray-900 mb-4">
                            Why Download Our App?
                        </h2>
                        <div className="w-24 h-1 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                        {[
                            {
                                icon: <Calendar className="w-6 h-6" />,
                                title: "Easy Booking",
                                desc: "Book your favorite turf in just 3 clicks with our seamless UI.",
                            },
                            {
                                icon: <Shield className="w-6 h-6" />,
                                title: "Secure Payment",
                                desc: "100% secure payment gateways for all your transactions.",
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: "Team Management",
                                desc: "Manage your team and split payments directly in the app.",
                            },
                            {
                                icon: <Clock className="w-6 h-6" />,
                                title: "Real-time Slot",
                                desc: "Get real-time updates on slot availability and stadium news.",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 hover:-translate-y-2 group"
                            >
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-gray-200/50 flex items-center space-x-4 active:scale-95 group">
                            <AppleLogo className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-70 leading-none">
                                    Download on the
                                </p>
                                <p className="text-xl font-black italic">
                                    App Store
                                </p>
                            </div>
                        </button>
                        <button className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-gray-200/50 flex items-center space-x-4 active:scale-95 group">
                            <PlayStoreLogo className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-50 leading-none text-gray-500">
                                    Get it on
                                </p>
                                <p className="text-xl font-black italic">
                                    Google Play
                                </p>
                            </div>
                        </button>
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
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-xl">
                            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6">
                                Services
                            </div>
                            <h2 className="text-5xl font-black text-white mb-6">
                                Built For Intense Matches And Big Moments
                            </h2>
                            <p className="text-white/60">
                                Professional fields for professionals. Whether
                                it's a friendly match or a tournament, we've got
                                you covered.
                            </p>
                        </div>
                        <button className="bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent-hover transition-all whitespace-nowrap">
                            View All Services
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Pitch Booking",
                                icon: <CheckCircle2 className="w-6 h-6" />,
                            },
                            {
                                title: "Match Scheduling",
                                icon: <Calendar className="w-6 h-6" />,
                            },
                            {
                                title: "Match & Tournaments",
                                icon: <Trophy className="w-6 h-6" />,
                            },
                            {
                                title: "Night Floodlight Games",
                                icon: <Zap className="w-6 h-6" />,
                            },
                        ].map((service, idx) => (
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
                                    Experience the best quality surfaces and
                                    facilities for your games.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Turfs */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-light border border-primary/10 px-4 py-1.5 rounded-full text-primary font-bold text-sm mb-6">
                            Featured Turfs
                        </div>
                        <h2 className="text-5xl font-black text-gray-900 mb-12">
                            Explore Top Football Turfs
                        </h2>

                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                "All Turfs",
                                "5x5 Turf",
                                "7x7 Turf",
                                "Floodlight Turf",
                            ].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                                        activeFilter === filter
                                            ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                                            : "bg-light text-gray-500 hover:bg-gray-100"
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {turfs.map((turf) => (
                            <div
                                key={turf.id}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={turf.image}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-black text-gray-800">
                                            {turf.rating}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-primary/80 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-lg border border-white/20 uppercase tracking-widest leading-none">
                                            {turf.tag}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-accent transition-colors">
                                        {turf.name}
                                    </h3>
                                    <div className="flex items-center text-gray-400 mb-6 space-x-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {turf.location}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-50 pt-6 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs font-bold">
                                                Starts from
                                            </span>
                                            <span className="text-2xl font-black text-accent">
                                                ₹{turf.price}{" "}
                                                <span className="text-gray-400 text-sm font-medium">
                                                    / hour
                                                </span>
                                            </span>
                                        </div>
                                        <button className="w-12 h-12 bg-light group-hover:bg-accent group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300">
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download Promo Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="bg-[#1e3a2b] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 -skew-x-12 translate-x-1/2"></div>

                        <div className="md:w-1/2 relative z-10 text-center md:text-left">
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
                                Download Our App For Easy Booking
                            </h2>
                            <p className="text-white/60 text-lg mb-12">
                                Join 50,000+ players today. Available for both
                                iOS and Android. Search, book and play on the
                                go!
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                <button className="bg-white text-primary px-8 py-4 rounded-2xl flex items-center space-x-3 hover:bg-gray-100 transition-all font-bold shadow-xl active:scale-95 group">
                                    <AppleLogo className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-black opacity-50">
                                            Download on the
                                        </div>
                                        <div className="text-xl">App Store</div>
                                    </div>
                                </button>
                                <button className="bg-white text-primary px-8 py-4 rounded-2xl flex items-center space-x-3 hover:bg-gray-100 transition-all font-bold shadow-xl active:scale-95 group">
                                    <PlayStoreLogo className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-black opacity-50">
                                            Get it on
                                        </div>
                                        <div className="text-xl">
                                            Google Play
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="md:w-1/2 relative">
                            <div className="relative z-10 animate-float">
                                <img
                                    src="/images/mobile.png"
                                    className="w-full max-w-sm mx-auto rounded-[3rem]"
                                    alt="App mockup"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent rounded-full opacity-20 blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    {/* Header with Badge and Navigation */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="inline-block bg-white border border-gray-200 px-6 py-2 rounded-full text-gray-800 font-bold text-sm">
                            Testimonials
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#E33E33] flex items-center justify-center text-white shadow-lg hover:bg-[#c9352c] transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="">
                        {/* Left Side - Heading and Quote */}
                        <div className="flex gap-10 lg:w-1/2">
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                                What Our Players Say
                            </h2>
                            <div className="text-gray-300 mb-6">
                                <Quote className="w-20 h-20 fill-current" />
                            </div>
                        </div>

                        {/* Right Side - Testimonial Card */}
                        <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                            {/* Image */}
                            <div className="rounded-2xl overflow-hidden">
                                <img
                                    src="/images/testimonials.png"
                                    alt="Player with cricket gear"
                                    className="object-cover "
                                />
                            </div>

                            {/* Content */}
                            <div className="">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-3">
                                        Best Turf Experience In The City
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm lg:text-lg mb-4">
                                        I absolutely enjoy playing here every
                                        weekend. The turf is always
                                        well-maintained, the lighting is perfect
                                        for night matches, and booking slots is
                                        super easy. It's the ideal place for
                                        friendly games and competitive matches.
                                    </p>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                        <img
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                                            alt="Rahul K."
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">
                                            Rahul K.
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Amateur Football Player
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-20px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(6deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
