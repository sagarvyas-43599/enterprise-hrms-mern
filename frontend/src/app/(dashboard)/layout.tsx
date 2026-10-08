"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MarkAttendanceModal } from "@/features/attendance/components/MarkAttendanceModal";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppSelector } from "@/redux/hooks";
import { useGetMeQuery } from "@/redux/services/authApi";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Automatically hydrate current authenticated profile & employee record
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
        {/* Fixed Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Execution Area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <Header />

          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Interactive Modals */}
        <MarkAttendanceModal />
        <UserProfileModal />
      </div>
    </AuthGuard>
  );
}
