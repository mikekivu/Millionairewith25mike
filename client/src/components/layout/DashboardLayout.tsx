import React from 'react';
import { useAuth } from '@/lib/auth';
import UserSidebar from '@/components/dashboard/UserSidebar';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import NotificationBell from '@/components/ui/notification-bell';
import { Redirect } from 'wouter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {user.role === 'admin' ? <AdminSidebar /> : <UserSidebar />}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm h-16 flex items-center justify-between px-6">
          <div className="font-bold text-xl text-primary">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Member Dashboard'}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative bg-orange-100 p-2 rounded-full hover:bg-orange-200 transition-colors">
              <NotificationBell userRole={user.role === 'admin' ? 'admin' : 'user'} />
            </div>
            <div className="text-sm font-medium flex items-center">
              <span className="mr-1">Welcome,</span>
              <span className="font-semibold">{user.firstName} {user.lastName}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50 to-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}