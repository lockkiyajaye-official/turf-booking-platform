import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="text-xl text-gray-500 font-semibold">Loading...</span>
            </div>
        );
    }

    if (user) {
        return (
            <div className="min-h-screen flex bg-gray-50">
                <Sidebar />
                {/* Main Content Area - margin left handles desktop sidebar space, padding bottom handles mobile nav space */}
                <main className="flex-1 md:ml-64 pb-16 md:pb-0 min-h-screen w-full relative">
                    {children}
                </main>
            </div>
        );
    }

    // Unauthenticated layout
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
