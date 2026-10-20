import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminLayout } from '@/components/AdminLayout';
import { RouteFallback } from '@/components/RouteFallback';

// Eager — homepage + core layout/auth so first paint is instant
import { LandingPage } from '@/pages/public/LandingPage';

// Lazy — every other page ships in its own chunk, loaded on navigation
const ProductsPage = lazy(() => import('@/pages/public/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const PricingPage = lazy(() => import('@/pages/public/PricingPage').then((m) => ({ default: m.PricingPage })));
const LoginPage = lazy(() => import('@/pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const CheckoutPage = lazy(() => import('@/pages/public/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/public/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const PaymentFailedPage = lazy(() => import('@/pages/public/PaymentFailedPage').then((m) => ({ default: m.PaymentFailedPage })));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })));
const RefundPolicyPage = lazy(() => import('@/pages/public/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })));

// Customer Pages
const AccountDashboard = lazy(() => import('@/pages/customer/AccountDashboard').then((m) => ({ default: m.AccountDashboard })));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })));
const UserLicenses = lazy(() => import('@/pages/admin/UserLicenses').then((m) => ({ default: m.UserLicenses })));
const KeyGenerator = lazy(() => import('@/pages/admin/KeyGenerator').then((m) => ({ default: m.KeyGenerator })));
const ProductCatalog = lazy(() => import('@/pages/admin/ProductCatalog').then((m) => ({ default: m.ProductCatalog })));
const PricingPlans = lazy(() => import('@/pages/admin/PricingPlans').then((m) => ({ default: m.PricingPlans })));
const CouponsPage = lazy(() => import('@/pages/admin/CouponsPage').then((m) => ({ default: m.CouponsPage })));
const InvoiceGenerator = lazy(() => import('@/pages/admin/InvoiceGenerator').then((m) => ({ default: m.InvoiceGenerator })));
const CompanyProfile = lazy(() => import('@/pages/admin/CompanyProfile').then((m) => ({ default: m.CompanyProfile })));
const Integrations = lazy(() => import('@/pages/admin/Integrations').then((m) => ({ default: m.Integrations })));
const UsersControl = lazy(() => import('@/pages/admin/UsersControl').then((m) => ({ default: m.UsersControl })));
const ActivityLogs = lazy(() => import('@/pages/admin/ActivityLogs').then((m) => ({ default: m.ActivityLogs })));
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings').then((m) => ({ default: m.SystemSettings })));
const ThemeSettings = lazy(() => import('@/pages/admin/ThemeSettings').then((m) => ({ default: m.ThemeSettings })));

// Suspense boundary for a lazy route — the surrounding layout stays mounted
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

// Protected Route Guard for Admin — real auth only, no demo bypass
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-(--brand)"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-(--brand)"></div>
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
            <Route path="/products" element={<PublicLayout><LazyPage><ProductsPage /></LazyPage></PublicLayout>} />
            <Route path="/products/:slug" element={<PublicLayout><LazyPage><ProductDetailPage /></LazyPage></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><LazyPage><PricingPage /></LazyPage></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LazyPage><LoginPage /></LazyPage></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><LazyPage><RegisterPage /></LazyPage></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><LazyPage><ForgotPasswordPage /></LazyPage></PublicLayout>} />
            <Route path="/checkout/:planId" element={<PublicLayout><LazyPage><CheckoutPage /></LazyPage></PublicLayout>} />
            <Route path="/payment-success" element={<PublicLayout><LazyPage><PaymentSuccessPage /></LazyPage></PublicLayout>} />
            <Route path="/payment-failed" element={<PublicLayout><LazyPage><PaymentFailedPage /></LazyPage></PublicLayout>} />
            <Route path="/account" element={<PublicLayout><LazyPage><AccountDashboard /></LazyPage></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><LazyPage><PrivacyPolicyPage /></LazyPage></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><LazyPage><TermsPage /></LazyPage></PublicLayout>} />
            <Route path="/refund-policy" element={<PublicLayout><LazyPage><RefundPolicyPage /></LazyPage></PublicLayout>} />

            {/* Admin Routes with Collapsible Sidebar & Super Admin Header */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<LazyPage><AdminDashboard /></LazyPage>} />
              <Route path="licenses" element={<LazyPage><UserLicenses /></LazyPage>} />
              <Route path="keys" element={<LazyPage><KeyGenerator /></LazyPage>} />
              <Route path="products" element={<LazyPage><ProductCatalog /></LazyPage>} />
              <Route path="pricing" element={<LazyPage><PricingPlans /></LazyPage>} />
              <Route path="coupons" element={<LazyPage><CouponsPage /></LazyPage>} />
              <Route path="invoices" element={<LazyPage><InvoiceGenerator /></LazyPage>} />
              <Route path="company" element={<LazyPage><CompanyProfile /></LazyPage>} />
              <Route path="integrations" element={<LazyPage><Integrations /></LazyPage>} />
              <Route path="users" element={<LazyPage><UsersControl /></LazyPage>} />
              <Route path="logs" element={<LazyPage><ActivityLogs /></LazyPage>} />
              <Route path="settings" element={<LazyPage><SystemSettings /></LazyPage>} />
              <Route path="theme" element={<LazyPage><ThemeSettings /></LazyPage>} />
            </Route>

            {/* 404 — premium not-found page */}
            <Route path="*" element={<PublicLayout><LazyPage><NotFoundPage /></LazyPage></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
