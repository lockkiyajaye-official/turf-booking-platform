import { Home, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Pages that should have the scrolling effect
    const scrollEffectPages = ['/', '/about', '/contact', '/privacy-policy', '/terms-conditions', '/refund-policy'];
    const shouldHaveScrollEffect = scrollEffectPages.includes(location.pathname);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        // Only add scroll listener if we're on a page that should have the effect
        if (shouldHaveScrollEffect) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [shouldHaveScrollEffect]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getHomePath = () => {
        if (!user) return "/";
        if (user.role === "admin") return "/admin/dashboard";
        if (user.role === "turf_owner") return "/dashboard/turfs";
        return "/home";
    };

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 py-3 ${shouldHaveScrollEffect
                ? scrolled
                    ? 'bg-white shadow-2xl'
                    : 'bg-transparent'
                : 'bg-white'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 flex items-center justify-center  ">
                            <img src="/logo.png" />
                        </div>
                        <span className={`text-2xl font-black tracking-tight ${shouldHaveScrollEffect
                            ? scrolled ? 'text-gray-900' : 'text-white'
                            : 'text-gray-900'
                            }`}>
                            Lock Kiya Jaye
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10">
                        <Link
                            to="/"
                            className={`font-medium transition-colors ${shouldHaveScrollEffect
                                ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className={`font-medium transition-colors ${shouldHaveScrollEffect
                                ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className={`font-medium transition-colors ${shouldHaveScrollEffect
                                ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                : 'text-gray-700 hover:text-gray-900'
                                }`}
                        >
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link
                                    to={getHomePath()}
                                    className={`transition-colors ${shouldHaveScrollEffect
                                        ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <Home className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/dashboard/profile"
                                    className={`transition-colors ${shouldHaveScrollEffect
                                        ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`transition-colors px-4 py-2 border rounded-lg ${shouldHaveScrollEffect
                                        ? scrolled
                                            ? 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                            : 'text-white border-white/30 hover:bg-white/10'
                                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className={`transition-colors font-medium ${shouldHaveScrollEffect
                                        ? scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    Login
                                </Link>
                                <button className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg active:scale-95 bg-accent text-white hover:bg-accent-hover`}>
                                    Download App
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
