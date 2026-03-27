import { Calendar, Facebook, Instagram, Mail, MapPin, Phone, Send, Shield, Trophy, Twitter, Youtube, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-primary text-white pt-20 pb-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-2">
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                                <img src="/logo.png" alt="Lock Kiya Jaye" className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">
                                Lock Kiya Jaye
                            </span>
                        </div>
                        <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-md">
                            Your trusted platform for booking sports facilities. Find, book, and play your favorite sports with ease.
                        </p>

                        {/* Newsletter */}
                        <div className="mb-8">
                            <h4 className="text-lg font-bold mb-4">Stay Updated</h4>
                            <p className="text-white/60 text-sm mb-4">
                                Get exclusive offers and new turf updates
                            </p>
                            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
                                <input
                                    type="email"
                                    placeholder="Enter your email..."
                                    className="bg-transparent border-none focus:ring-0 text-sm px-4 flex-grow placeholder:text-white/50 text-white"
                                />
                                <button className="bg-accent p-3 rounded-xl hover:bg-accent-hover transition-all">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/turfs"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Browse Turfs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Sports Facilities */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Sports Facilities</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Football Turf
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Cricket Turf
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Badminton Courts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    Basketball Court
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Get In Touch</h4>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <Mail className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Email</p>
                                    <p className="text-white text-sm font-medium">hello@lockkiyajaye.com</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <Phone className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Phone</p>
                                    <p className="text-white text-sm font-medium">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                    <MapPin className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Address</p>
                                    <p className="text-white text-sm font-medium">Mumbai, India</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 mb-16 border border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mx-auto mb-4 border border-white/20">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-white mb-1">Tournaments</h5>
                            <p className="text-white/60 text-sm">Organize & join</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mx-auto mb-4 border border-white/20">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-white mb-1">Easy Booking</h5>
                            <p className="text-white/60 text-sm">Quick & simple</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mx-auto mb-4 border border-white/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-white mb-1">Secure Payment</h5>
                            <p className="text-white/60 text-sm">100% safe</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mx-auto mb-4 border border-white/20">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-white mb-1">Real-time</h5>
                            <p className="text-white/60 text-sm">Live updates</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 mb-12"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <p className="text-white/60 text-sm">
                            © {new Date().getFullYear()} Lock Kiya Jaye. All rights reserved.
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                            Making sports accessible to everyone
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <Link
                            to="/privacy-policy"
                            className="text-white/60 hover:text-white transition-colors text-sm"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms-conditions"
                            className="text-white/60 hover:text-white transition-colors text-sm"
                        >
                            Terms & Conditions
                        </Link>
                        <Link
                            to="/refund-policy"
                            className="text-white/60 hover:text-white transition-colors text-sm"
                        >
                            Refund Policy
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            </div>
        </footer>
    );
}
