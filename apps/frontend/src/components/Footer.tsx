import { Link } from "react-router-dom";
import { Mail, Phone, Send } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-green-900 text-white pt-16 pb-8 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    {/* Get Exclusive Updates Offers */}
                    <div className="col-span-2">
                        <h3 className="text-xl font-bold mb-4">
                            Get Exclusive Updates Offers
                        </h3>
                        <p className="text-white/80 text-sm mb-4 leading-relaxed">
                            Subscribe to our newsletter and be the first to know
                            about new features and exclusive offers.
                        </p>
                        <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
                            <input
                                type="email"
                                placeholder="Enter your email..."
                                className="bg-transparent border-none focus:ring-0 text-sm px-3 flex-grow placeholder:text-white/60 text-white"
                            />
                            <button className="bg-green-600 p-2 rounded-md hover:bg-green-700 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Have a question or feedback? */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            Have a question or feedback?
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2 text-white/80">
                                <Mail className="w-4 h-4 text-green-400" />
                                <span>hello@lockkiyajaye.com</span>
                            </div>
                            <div className="flex items-center space-x-2 text-white/80">
                                <Phone className="w-4 h-4 text-green-400" />
                                <span>+123445566789</span>
                            </div>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Facilities</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Football Turf
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Cricket Turf
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Badminton Courts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Basketball Court
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    FAQ's
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/help"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/chat"
                                    className="text-white/80 hover:text-green-400 transition-colors"
                                >
                                    Live Chat Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 mb-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
                    <p className="mb-4 md:mb-0">
                        Lock Kiya Jaye {new Date().getFullYear()} All right
                        reserved
                    </p>
                    <div className="flex space-x-8">
                        <Link
                            to="/privacy"
                            className="hover:text-white transition-colors"
                        >
                            Privacy & Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="hover:text-white transition-colors"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Watermark */}
            <div className="pt-10 flex items-center justify-center pointer-events-none select-none opacity-5">
                <h1 className="text-[12vw] font-black leading-none text-white">
                    Lock Kiya Jaye
                </h1>
            </div>
        </footer>
    );
}
