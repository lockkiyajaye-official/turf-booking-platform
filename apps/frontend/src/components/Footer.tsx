import { Link } from "react-router-dom";
import {
    Facebook,
    Twitter,
    Instagram,
    Mail,
    Phone,
    Linkedin,
    Send,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-primary text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                                <span className="text-white font-bold text-xl">
                                    ⚽
                                </span>
                            </div>
                            <span className="text-2xl font-black tracking-tight">
                                Lock Kiya Jaye
                            </span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed mb-8">
                            Join thousands of happy players booking their
                            favorite turfs daily. Experience the smoothest
                            booking process ever.
                        </p>
                        <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
                            <input
                                type="text"
                                placeholder="Enter your email..."
                                className="bg-transparent border-none focus:ring-0 text-sm px-3 flex-grow placeholder:text-white/40"
                            />
                            <button className="bg-white/10 p-2 rounded-md hover:bg-white/20 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Contat Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6">Support</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link
                                    to="/help"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/cookies"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/booking-guide"
                                    className="text-white/60 hover:text-accent transition-colors"
                                >
                                    Booking Guide
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3 text-white/60">
                                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                                <span>hello@lockkiyajaye.com</span>
                            </li>
                            <li className="flex items-start space-x-3 text-white/60">
                                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                                <span>+1 (555) 000-1234</span>
                            </li>
                        </ul>
                        <div className="flex space-x-4 mt-8">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-accent hover:border-accent hover:scale-110 transition-all duration-300"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-accent hover:border-accent hover:scale-110 transition-all duration-300"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-accent hover:border-accent hover:scale-110 transition-all duration-300"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-accent hover:border-accent hover:scale-110 transition-all duration-300"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col md:row justify-between items-center text-sm text-white/40 space-y-4 md:space-y-0 text-center md:text-left">
                    <p>
                        &copy; {new Date().getFullYear()} Lock Kiya Jaye. All
                        rights reserved.
                    </p>
                    <div className="flex space-x-8">
                        <Link
                            to="/privacy"
                            className="hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="hover:text-white transition-colors"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>

                <div className="mt-16 flex justify-center opacity-10 pointer-events-none select-none overflow-hidden">
                    <h1 className="text-[12vw] font-black leading-none translate-y-1/2">
                        Lock Kiya Jaye
                    </h1>
                </div>
            </div>
        </footer>
    );
}
