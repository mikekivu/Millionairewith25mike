import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Public Pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import PlansPage from "@/pages/PlansPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import TermsPage from "@/pages/TermsPage";
import NotFound from "@/pages/not-found";

// User Dashboard Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import WalletPage from "@/pages/dashboard/WalletPage";
import InvestmentsPage from "@/pages/dashboard/InvestmentsPage";
import NetworkPage from "@/pages/dashboard/NetworkPage";
import TransactionsPage from "@/pages/dashboard/TransactionsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";

// Admin Dashboard Pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import MembersPage from "@/pages/admin/MembersPage";
import AdminTransactionsPage from "@/pages/admin/TransactionsPage";
import PaymentSettingsPage from "@/pages/admin/PaymentSettingsPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="richlance-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Switch>
              {/* Public Routes */}
              <Route path="/">
                {() => (
                  <RootLayout>
                    <HomePage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/about">
                {() => (
                  <RootLayout>
                    <AboutPage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/plans">
                {() => (
                  <RootLayout>
                    <PlansPage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/contact">
                {() => (
                  <RootLayout>
                    <ContactPage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/login">
                {() => (
                  <RootLayout showNav={false}>
                    <LoginPage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/register">
                {() => (
                  <RootLayout showNav={false}>
                    <RegisterPage />
                  </RootLayout>
                )}
              </Route>
              <Route path="/terms">
                {() => (
                  <RootLayout>
                    <TermsPage />
                  </RootLayout>
                )}
              </Route>

              {/* User Dashboard Routes */}
              <Route path="/dashboard">
                {() => (
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                )}
              </Route>
              <Route path="/dashboard/wallet">
                {() => (
                  <DashboardLayout>
                    <WalletPage />
                  </DashboardLayout>
                )}
              </Route>
              <Route path="/dashboard/investments">
                {() => (
                  <DashboardLayout>
                    <InvestmentsPage />
                  </DashboardLayout>
                )}
              </Route>
              <Route path="/dashboard/network">
                {() => (
                  <DashboardLayout>
                    <NetworkPage />
                  </DashboardLayout>
                )}
              </Route>
              <Route path="/dashboard/transactions">
                {() => (
                  <DashboardLayout>
                    <TransactionsPage />
                  </DashboardLayout>
                )}
              </Route>
              <Route path="/dashboard/profile">
                {() => (
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                )}
              </Route>

              {/* Admin Dashboard Routes */}
              <Route path="/admin">
                {() => (
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                )}
              </Route>
              <Route path="/admin/members">
                {() => (
                  <AdminLayout>
                    <MembersPage />
                  </AdminLayout>
                )}
              </Route>
              <Route path="/admin/transactions">
                {() => (
                  <AdminLayout>
                    <AdminTransactionsPage />
                  </AdminLayout>
                )}
              </Route>
              <Route path="/admin/payment-settings">
                {() => (
                  <AdminLayout>
                    <PaymentSettingsPage />
                  </AdminLayout>
                )}
              </Route>

              {/* 404 Fallback */}
              <Route component={NotFound} />
            </Switch>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
