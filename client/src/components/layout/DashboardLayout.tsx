import React from 'react';
import { useAuth } from '@/lib/auth';
import UserSidebar from '@/components/dashboard/UserSidebar';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
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
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50 to-gray-100">
        {children}
      </main>
    </div>
  );
}