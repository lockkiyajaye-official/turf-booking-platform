import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./context/AuthContext";

// Auth & Public
import GoogleCallback from "./pages/auth/GoogleCallback";
import Login from "./pages/auth/Login";
import Onboarding from "./pages/auth/Onboarding";
import Register from "./pages/auth/Register";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import FAQ from "./pages/public/FAQ";
import Landing from "./pages/public/Landing";

// Shared / User
import Dashboard from "./pages/user/Dashboard";
import PaymentHistory from "./pages/user/PaymentHistory";
import Profile from "./pages/user/Profile";
import TurfDetail from "./pages/user/TurfDetail";
import Turfs from "./pages/Turfs";
import UserBookings from "./pages/user/UserBookings";
import UserHome from "./pages/user/UserHome";

// Admin
import AdminBookings from "./pages/admin/AdminBookings";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminTurfOwners from "./pages/admin/AdminTurfOwners";
import AdminTurfs from "./pages/admin/AdminTurfs";
import AdminUsers from "./pages/admin/AdminUsers";

// Turf Owner
import OwnerBookings from "./pages/turf-owner/OwnerBookings";
import OwnerFinances from "./pages/turf-owner/OwnerFinances";
import OwnerOverview from "./pages/turf-owner/OwnerOverview";
import OwnerTurfs from "./pages/turf-owner/OwnerTurfs";

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        {/* Public & Auth */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/home" element={<UserHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/google-callback"
                            element={<GoogleCallback />}
                        />
                        <Route path="/register" element={<Register />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/turfs" element={<Turfs />} />
                        <Route path="/turfs/:id" element={<TurfDetail />} />

                        {/* User Dashboard / Shared */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                            path="/dashboard/bookings"
                            element={<UserBookings />}
                        />
                        <Route
                            path="/dashboard/payments/history"
                            element={<PaymentHistory />}
                        />
                        <Route
                            path="/dashboard/profile"
                            element={<Profile />}
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/overview"
                            element={<AdminOverview />}
                        />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route
                            path="/admin/owners"
                            element={<AdminTurfOwners />}
                        />
                        <Route path="/admin/turfs" element={<AdminTurfs />} />
                        <Route
                            path="/admin/bookings"
                            element={<AdminBookings />}
                        />
                        <Route
                            path="/admin/payments"
                            element={<AdminPayments />}
                        />

                        {/* Turf Owner Routes */}
                        <Route
                            path="/owner/overview"
                            element={<OwnerOverview />}
                        />
                        <Route path="/owner/turfs" element={<OwnerTurfs />} />
                        <Route
                            path="/owner/bookings"
                            element={<OwnerBookings />}
                        />
                        <Route
                            path="/owner/finances"
                            element={<OwnerFinances />}
                        />
                        {/* Map /owner/profile to existing Profile */}
                        <Route path="/owner/profile" element={<Profile />} />
                    </Routes>
                </AppLayout>
            </Router>
        </AuthProvider>
    );
}

export default App;
