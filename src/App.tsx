import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminLayout } from '@/components/AdminLayout';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { ProductsPage } from '@/pages/public/ProductsPage';
import { ProductDetailPage } from '@/pages/public/ProductDetailPage';
import { PricingPage } from '@/pages/public/PricingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { CheckoutPage } from '@/pages/public/CheckoutPage';
import { PaymentSuccessPage } from '@/pages/public/PaymentSuccessPage';
import { PaymentFailedPage } from '@/pages/public/PaymentFailedPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Customer Pages
import { AccountDashboard } from '@/pages/customer/AccountDashboard';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { UserLicenses } from '@/pages/admin/UserLicenses';
import { KeyGenerator } from '@/pages/admin/KeyGenerator';
import { ProductCatalog } from '@/pages/admin/ProductCatalog';
import { PricingPlans } from '@/pages/admin/PricingPlans';
import { InvoiceGenerator } from '@/pages/admin/InvoiceGenerator';
import { CompanyProfile } from '@/pages/admin/CompanyProfile';
import { Integrations } from '@/pages/admin/Integrations';
import { UsersControl } from '@/pages/admin/UsersControl';
import { ActivityLogs } from '@/pages/admin/ActivityLogs';
import { SystemSettings } from '@/pages/admin/SystemSettings';
import { ThemeSettings } from '@/pages/admin/ThemeSettings';

// Protected Route Guard for Admin — real auth only, no demo bypass
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E40FF]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E40FF]"></div>
      </div>
    );
  }

  if (profile && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}

// Public Layout Wrapper with Navbar & Footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Navbar + Footer */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
            <Route path="/products/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
            <Route path="/checkout/:planId" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
            <Route path="/payment-success" element={<PublicLayout><PaymentSuccessPage /></PublicLayout>} />
            <Route path="/payment-failed" element={<PublicLayout><PaymentFailedPage /></PublicLayout>} />
            <Route path="/account" element={<PublicLayout><AccountDashboard /></PublicLayout>} />

            {/* Admin Routes with Collapsible Sidebar & Super Admin Header */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="licenses" element={<UserLicenses />} />
              <Route path="keys" element={<KeyGenerator />} />
              <Route path="products" element={<ProductCatalog />} />
              <Route path="pricing" element={<PricingPlans />} />
              <Route path="invoices" element={<InvoiceGenerator />} />
              <Route path="company" element={<CompanyProfile />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="users" element={<UsersControl />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="theme" element={<ThemeSettings />} />
            </Route>

            {/* 404 — premium not-found page */}
            <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
