import {
    Calendar,
    CreditCard,
    Home,
    LogOut,
    MapPin,
    Search,
    User,
    UserCheck,
    Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getHomePath = () => {
        if (user.role === "admin") return "/admin/overview";
        if (user.role === "turf_owner") return "/owner/overview";
        return "/home";
    };

    const getNavItems = () => {
        if (user.role === "admin") {
            return [
                { name: "Overview", path: "/admin/overview", icon: Home },
                { name: "Users", path: "/admin/users", icon: Users },
                { name: "Turf Owners", path: "/admin/owners", icon: UserCheck },
                { name: "Turfs", path: "/admin/turfs", icon: MapPin },
                { name: "Bookings", path: "/admin/bookings", icon: Calendar },
                { name: "Payments", path: "/admin/payments", icon: CreditCard },
            ];
        }
        if (user.role === "turf_owner") {
            return [
                { name: "Overview", path: "/owner/overview", icon: Home },
                { name: "My Turfs", path: "/owner/turfs", icon: MapPin },
                { name: "Bookings", path: "/owner/bookings", icon: Calendar },
                { name: "Finances", path: "/owner/finances", icon: WalletIcon },
                { name: "Profile", path: "/owner/profile", icon: User },
            ];
        }
        // Normal User
        return [
            { name: "Home", path: "/home", icon: Home },
            { name: "Explore", path: "/turfs", icon: Search },
            { name: "Bookings", path: "/dashboard/bookings", icon: Calendar },
            { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
            { name: "Profile", path: "/dashboard/profile", icon: User },
        ];
    };

    const WalletIcon = CreditCard;

    const navItems = getNavItems();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50">
                <div className="p-6 flex items-center space-x-2">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                        <img src="/logo.png" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900">
                        Lock Kiya Jaye
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== getHomePath() &&
                                location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive
                                        ? "bg-red-50 text-[#E33E33] font-bold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-[#E33E33] font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== getHomePath() &&
                                location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                    isActive
                                        ? "text-[#E33E33]"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-[10px] font-bold">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
