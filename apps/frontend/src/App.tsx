import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import GoogleCallback from "./pages/GoogleCallback";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LoginOtp from "./pages/LoginOtp";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ProfileAccount from "./pages/ProfileAccount";
import ProfileSecurity from "./pages/ProfileSecurity";
import ProfileNotifications from "./pages/ProfileNotifications";
import Register from "./pages/Register";
import RegisterOtp from "./pages/RegisterOtp";
import TurfDetail from "./pages/TurfDetail";
import TurfOwnerDashboard from "./pages/TurfOwnerDashboard";
import Turfs from "./pages/Turfs";
import UserBookings from "./pages/UserBookings";
import UserHome from "./pages/UserHome";
import Payments from "./pages/Payments";
import PaymentHistory from "./pages/PaymentHistory";

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/home" element={<UserHome />} />
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/google-callback"
                                element={<GoogleCallback />}
                            />
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
                                path="/dashboard/profile/account"
                                element={<ProfileAccount />}
                            />
                            <Route
                                path="/dashboard/profile/security"
                                element={<ProfileSecurity />}
                            />
                            <Route
                                path="/dashboard/profile/notifications"
                                element={<ProfileNotifications />}
                            />
                            <Route
                                path="/dashboard/payments"
                                element={<Payments />}
                            />
                            <Route
                                path="/dashboard/payments/history"
                                element={<PaymentHistory />}
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
