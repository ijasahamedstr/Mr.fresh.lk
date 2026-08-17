import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from "@mui/material"; // <-- Added useMediaQuery import

// Import your pages
import Checkout from "./Page/Checkout";
import Header from "./Page/header";
import Home from "./Page/Home";
import Invoice from "./Page/Invoice";
import ProductView from "./Page/ProductDetails";
import Topbar from "./Page/Topbar";
import Footer from './Page/Footer';
import Login from './Page/Admin/Login/Login';
import Dashboard from "./Page/Admin/Dashboard/Dashboard";

// --- Scroll To Top Component ---
// This listens for route changes and scrolls the window to the top
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- Protected Route Component ---
// Fixed the implicit 'any' type by defining children as React.ReactNode
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// --- Layout Wrapper Component ---
// Handles conditional visibility of Navbar and Footer, and triggers ScrollToTop
const AppContent = () => {
  const location = useLocation();
  
  // Detect if the screen is mobile sized (under 768px)
  const isMobile = useMediaQuery("(max-width:768px)"); // <-- Added Mobile Check

  // Define paths where you don't want Navbar/Footer
  const hideLayoutPaths = ['/login', '/dashboard', '/Dashboard'];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {/* Fires on every route change to scroll to the top */}
      <ScrollToTop /> 
      <Topbar />
      {!shouldHideLayout && <Header />}
      
      <Routes>
        {/* Public Routes */}
         <Route path="/" element={<Home />} />
         <Route path="/product/:id" element={<ProductView />} />
         <Route path="/checkout" element={<Checkout />} />
         <Route path="/order/:id" element={<Invoice />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Route (Dashboard) */}
         <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* Renders Footer ONLY if it's a valid layout path AND it's NOT a mobile device */}
      {!shouldHideLayout && !isMobile && <Footer />}
    </>
  );
};

// --- Main App Component ---
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;