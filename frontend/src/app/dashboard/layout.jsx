"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-30">
          <Sidebar />
        </div>



        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-[270px]">
          {/* Topbar - Fixed */}
          <div className="fixed top-0 right-0 left-0 lg:left-[270px] z-20 bg-white">
            <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-auto mt-16 pt-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
