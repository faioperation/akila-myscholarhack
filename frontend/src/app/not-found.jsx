"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#FFCA42]/10 rounded-full flex items-center justify-center">
            <Icon icon="solar:sad-circle-bold" className="text-[#FFCA42] text-6xl" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-500 mb-8">
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#FFCA42] text-[#1B1B1B] px-6 py-3 rounded-xl font-medium hover:bg-[#FFCA42]/90 transition-colors"
        >
          <Icon icon="solar:home-2-bold" className="text-xl" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
