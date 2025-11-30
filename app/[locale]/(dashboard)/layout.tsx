"use client";

import React from "react";
import { DashboardProvider, UserProvider } from "@/shared/context";
import { Header, Sidebar, MobileSidebar } from "@/shared/layout";
import { Toaster } from "@/shared/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <UserProvider>
        <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-950">
          {/* Sidebar */}
          <Sidebar />
          <MobileSidebar />

          {/* Main Content */}
          <div className="flex-1 xl:ms-[270px] transition-all duration-200">
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </div>

        {/* Toast notifications */}
        <Toaster />
      </UserProvider>
    </DashboardProvider>
  );
}
