import { Home, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

    const isLanding = location.pathname === "/";

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled || !isLanding
                    ? "bg-primary py-3 shadow-lg"
                    : "bg-transparent py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                            <span className="text-white font-bold text-xl">
                                ⚽
                            </span>
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">
                            Lock Kiya Jaye
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10">
                        <Link
                            to="/"
                            className="text-white hover:text-accent font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className="text-white/80 hover:text-white font-medium transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="text-white/80 hover:text-white font-medium transition-colors"
                        >
                            Contact
                        </Link>
                        <Link
                            to="#features"
                            className="text-white/80 hover:text-white font-medium transition-colors"
                        >
                            Features
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link
                                    to={getHomePath()}
                                    className="text-white hover:text-accent transition-colors"
                                >
                                    <Home className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/dashboard/profile"
                                    className="text-white hover:text-accent transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white/80 hover:text-red-400 transition-colors px-4 py-2 border border-white/20 rounded-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-white hover:text-accent transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <button className="bg-accent text-white px-6 py-2.5 rounded-lg font-bold hover:bg-accent-hover transition-all shadow-lg hover:shadow-accent/40 active:scale-95">
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
