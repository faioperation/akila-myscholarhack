"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { logout } from "@/lib/auth";
import toast from "react-hot-toast";

import NotificationDropdown from "./NotificationDropdown";

export default function Topbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/user1.png");
  const [userName, setUserName] = useState("User");
  const router = useRouter();
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/dashboard/admin");
  const settingsPath = isAdmin
    ? "/dashboard/admin/settings"
    : "/dashboard/student/settings";

  // Fetch profile data
  const { data: profileResponse } = useQuery({
    queryKey: ['userProfile', isAdmin], // Include isAdmin in queryKey to trigger refetch on role change
    queryFn: async () => {
      try {
        // Use different endpoints based on role
        if (isAdmin) {
             const response = await apiGet('/admin/settings');
             return response;
        } else {
             const response = await apiGet('/profile/me');
             return response;
        }
      } catch (error) {
        throw error;
      }
    },
  });

  // Update profile image and name when data is fetched
  useEffect(() => {
    if (profileResponse?.data) {
      const profileData = profileResponse.data;

      // Set user name (handle both fullName and name fields)
      if (profileData.fullName) {
        setUserName(profileData.fullName);
      } else if (profileData.name) {
        setUserName(profileData.name);
      }

      // Set profile picture ONLY for students (not admin) || or if you want to support distinct logic
      if (!isAdmin) {
          if (profileData.filePath) {
            const baseURL = process.env.NEXT_PUBLIC_API_MAIN_URL || '';
            const imageUrl = `${baseURL}/${profileData.filePath}`;
            setProfileImage(imageUrl);
          } else if (profileData.profilePicture) {
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const imageUrl = `${baseURL}/uploads/profile/${profileData.profilePicture}`;
            setProfileImage(imageUrl);
          }
      }
    }
  }, [profileResponse, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      apiPost("/auth/logout");
      logout(router);
      toast.success("Logged out successfully");
    } catch (error) {
      logout(router);
    }
  };

  return (
    <nav className="w-full h-[90px] flex justify-between lg:justify-end items-center gap-3 sm:gap-6 px-4 sm:px-8 py-6 bg-white border-b border-gray-200">
      {/* Hamburger Menu for Mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Icon icon="mdi:menu" width={28} height={28} />
      </button>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative">
          <Icon
            icon={"mingcute:notification-line"}
            width={28}
            height={28}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
          />
          {isNotificationOpen && (
            <NotificationDropdown 
              isAdmin={isAdmin} 
              onClose={() => setIsNotificationOpen(false)} 
            />
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="pl-3 sm:pl-6 border-l-2 border-gray-300 flex gap-2 sm:gap-3 items-center cursor-pointer hover:bg-gray-50 p-2 transition-colors"
          >
            <div className={`relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${isAdmin ? 'bg-indigo-100 flex items-center justify-center' : ''}`}>
              {isAdmin ? (
                 <Icon icon="solar:user-bold" className="text-indigo-600 w-8 h-8" />
              ) : (
                profileImage && profileImage !== "/user1.png" ? 
                <Image
                  src={profileImage}
                  fill
                  sizes="48px"
                  alt="Dashboard user"
                  className="object-cover"
                  onError={() => {
                    setProfileImage("/user1.png");
                  }}
                /> :
                <div className="flex items-center justify-center w-full h-full bg-gray-500 text-white text-xl font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-base font-semibold text-gray-900">
                {userName}
              </h4>
              <p className="text-sm font-medium text-gray-500">
                {/* {isAdmin ? "Admin" : "Student"} */}
              </p>
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
              <Link
                href={settingsPath}
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Icon
                  icon="solar:settings-linear"
                  width={20}
                  height={20}
                  className="text-gray-600"
                />
                <span className="text-gray-700 font-medium">Settings</span>
              </Link>

              <div className="border-t border-gray-200 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <Icon
                  icon="solar:logout-2-linear"
                  width={20}
                  height={20}
                  className="text-red-600"
                />
                <span className="text-red-600 font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
