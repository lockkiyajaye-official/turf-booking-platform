import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LoginOtp from "./pages/LoginOtp";
import Register from "./pages/Register";
import RegisterOtp from "./pages/RegisterOtp";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Turfs from "./pages/Turfs";
import TurfDetail from "./pages/TurfDetail";
import TurfOwnerDashboard from "./pages/TurfOwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserBookings from "./pages/UserBookings";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/login-otp" element={<LoginOtp />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/register-otp" element={<RegisterOtp />} />
                            <Route
                                path="/onboarding"
                                element={<Onboarding />}
                            />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route
                                path="/dashboard/turfs"
                                element={<TurfOwnerDashboard />}
                            />
                            <Route
                                path="/dashboard/bookings"
                                element={<UserBookings />}
                            />
                            <Route
                                path="/dashboard/profile"
                                element={<Profile />}
                            />
                            <Route
                                path="/admin/dashboard"
                                element={<AdminDashboard />}
                            />
                            <Route path="/turfs" element={<Turfs />} />
                            <Route path="/turfs/:id" element={<TurfDetail />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/faq" element={<FAQ />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
