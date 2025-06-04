import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Terms from "@/pages/Terms";
import UserDashboard from "@/pages/dashboard/UserDashboard";
import UserWallet from "@/pages/dashboard/UserWallet";
import UserInvestments from "@/pages/dashboard/UserInvestments";
import UserGenealogyTree from "@/pages/dashboard/UserGenealogyTree";
import UserTransactions from "@/pages/dashboard/UserTransactions";
import UserReferrals from "@/pages/dashboard/UserReferrals";
import UserSettings from "@/pages/dashboard/UserSettings";
import UserNetworkHeatmap from "@/pages/dashboard/UserNetworkHeatmap";
import UserMessages from "@/pages/dashboard/UserMessages";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminDeposits from "@/pages/admin/AdminDeposits";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminPaymentSettings from "@/pages/admin/AdminPaymentSettings";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminWithdraw from "@/pages/admin/AdminWithdraw";
import Plans from "@/pages/Plans";
import { ProtectedRoute, AdminRoute } from "@/lib/auth";
import LiveChat from "@/components/LiveChat";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/plans" component={Plans} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/terms" component={Terms} />

      {/* User Dashboard Routes */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/wallet">
        {() => (
          <ProtectedRoute>
            <UserWallet />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/investments">
        {() => (
          <ProtectedRoute>
            <UserInvestments />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/genealogy">
        {() => (
          <ProtectedRoute>
            <UserGenealogyTree />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/transactions">
        {() => (
          <ProtectedRoute>
            <UserTransactions />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/referrals">
        {() => (
          <ProtectedRoute>
            <UserReferrals />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/settings">
        {() => (
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/network-heatmap">
        {() => (
          <ProtectedRoute>
            <UserNetworkHeatmap />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/messages">
        {() => (
          <ProtectedRoute>
            <UserMessages />
          </ProtectedRoute>
        )}
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin">
        {() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/members">
        {() => (
          <AdminRoute>
            <AdminMembers />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/withdrawals">
        {() => (
          <AdminRoute>
            <AdminWithdrawals />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/deposits">
        {() => (
          <AdminRoute>
            <AdminDeposits />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/plans">
        {() => (
          <AdminRoute>
            <AdminPlans />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/payment-settings">
        {() => (
          <AdminRoute>
            <AdminPaymentSettings />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/messages">
        {() => (
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/withdraw">
        {() => (
          <AdminRoute>
            <AdminWithdraw />
          </AdminRoute>
        )}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <LiveChat />
      <Router />
    </TooltipProvider>
  );
}

export default App;