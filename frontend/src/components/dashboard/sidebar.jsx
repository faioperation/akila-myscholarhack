"use client";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { navLink_Student, navLink_Admin } from "./navigationConfig";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  const isStudent = pathname.startsWith("/dashboard/student");
  const navLink = isStudent ? navLink_Student : navLink_Admin;

  return (
    <aside className="w-[270px] min-h-screen bg-white p-6 border-r border-gray-200 flex flex-col">
      {/* Header with Close Button for Mobile */}
      <div className="mb-8 flex items-center gap-3 justify-between">
        <div onClick={()=> redirect("/")} className="flex items-center gap-3 hover:cursor-pointer">
            <Image
              src="/logo.png"
              alt="MyScholar Logo"
              width={40}
              height={40}
            />
          <h3 className="text-2xl font-bold text-gray-900">MyScholarHack</h3>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Icon icon="mdi:close" width={24} height={24} />
          </button>
        )}
      </div>

      <nav className="flex-1">
        <div className="space-y-3 py-8">
          {navLink.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${pathname === link.path
                  ? "bg-[#FFFAEC] text-gray-900 font-semibold border-l-4 border-[#FFCA42]"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-normal"
                }`}
            >
              {link.icon && <Icon icon={link.icon} height={24} width={24} />}
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
