"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SecoundryBtn from "./SecoundryBtn";
import PrimaryBtn from "./PrimaryBtn";
import { Icon } from "@iconify/react";
import { isAuthenticated, logout, getDashboardRoute } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";


import toast from "react-hot-toast";

export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    // Check authentication status on client side
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
    };

    checkAuth();

    // Listen for storage events to update state if auth changes in another tab
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Fetch profile data from API
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!isLoggedIn) return null;
      try {
        const response = await apiGet('/profile/me');

        const userInfo = await apiGet('/user/me');
        setUserInfo(userInfo?.data || null);
        return response;
      } catch (error) {
        // If 401, maybe logout? For now just return null
        return null;
      }
    },
    enabled: isLoggedIn, // Only run query if logged in
    retry: 1,
  });

  const userData = profileResponse?.data;

  const handleLogout = () => {
    logout(router);
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    // Optionally invalidate queries
  };

  const dashboardRoute = getDashboardRoute();

  const handleDashboardClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    setShowProfileMenu(false);
    console.log("userData", userInfo);

    if (userInfo?.role === "STUDENT" && !userInfo?.isPlan) {
      toast.error("Please buy a plan to access the dashboard.");

      setTimeout(() => {
        router.push("/pricing");
      }, 1000);
    } else {

      document.cookie = `activePlan=${userInfo?.isPlan}; path=/`;
      router.push(dashboardRoute);
    }
  };

  const getProfileImage = () => {
    if (!userData) return null; 

    // Check for filePath (common pattern in this codebase)
    if (userData.filePath) {
      const baseURL = process.env.NEXT_PUBLIC_API_MAIN_URL || "";
      return `${baseURL}/${userData.filePath}`;
    }
    // Check for profilePicture field
    else if (userData.profilePicture) {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      return `${baseURL}/uploads/profile/${userData.profilePicture}`;
    }

    return null;
  };

  const Nablink = [
    {
      Tiltle: "About",
      pathName: "/about",
    },
    {
      Tiltle: "Features",
      pathName: "/feature",
    },
    {
      Tiltle: "Pricing",
      pathName: "/pricing",
    },
    {
      Tiltle: "How it Works",
      pathName: "/how-to-work",
    },
    {
      Tiltle: "FAQs",
      pathName: "/faq",
    },
  ];

  return (
    <nav className="flex items-center justify-between pt-8 relative">
      <div className="text-white flex items-center gap-4">
        <Link href="/">
          <Image src={"/logo.png"} height={48} width={48} alt="MyScholarHack" />
        </Link>
        <Link href="/">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
            MyScholarHack
          </h1>
        </Link>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex text-white text-base font-medium items-center gap-10">
        {Nablink.map((link, idx) => (
          <li
            className={cn(pathName === link.pathName && "text-[#FFCA42]")}
            key={idx}
          >
            <Link href={link.pathName}>{link.Tiltle}</Link>
          </li>
        ))}
      </ul>

      <div className="hidden lg:flex justify-center gap-4 items-center">
        {!isLoggedIn ? (
          <>
            <Link href={"/signin"}>
              <SecoundryBtn
                style={"rounded-full hover:text-black"}
                title={"Sign in"}
              />
            </Link>
            <Link href={"/register"}>
              <PrimaryBtn style={"rounded-full"} title={"Register"} />
            </Link>
          </>
        ) : (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 focus:outline-none"
            >
              {getProfileImage() ? (
                <div className="relative w-15 h-15 rounded-full overflow-hidden border-4 border-[#FFCA42] hover:scale-105 transition-transform">
                  <Image
                    src={getProfileImage()}
                    alt="Profile"
                    fill
                    sizes="60px"
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/ceoProfile.png"; // Fallback to a default image if the provided URL fails
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-15 h-15 rounded-full bg-gray-500 text-white text-xl font-bold border-4 border-[#FFCA42] hover:scale-105 transition-transform">
                  {userData?.fullName?.charAt(0).toUpperCase() || userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-5">
                <p className="pl-5 text-lg font-medium">Hello, {userData?.fullName?.split(" ").slice(0, 1).join(" ") || userInfo?.name?.split(" ").slice(0, 1).join(" ") || "User"}</p>
                <button
                  onClick={handleDashboardClick}
                  className="w-full text-left flex items-center gap-4 px-4 py-2 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Icon
                    icon="ic:round-dashboard"
                    width="24"
                    height="24"
                    className="text-[#FFCA42]"
                  />
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-4 px-4 py-2 hover:bg-gray-50 transition-colors font-medium text-red-500"
                >
                  <Icon icon="solar:logout-2-bold" width="24" height="24" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Icon
            icon={isOpen ? "mingcute:close-fill" : "mingcute:menu-fill"}
            width="32"
            height="32"
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {/* Mobile Menu Overlay & Panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
      >
        {/* Backdrop / Overlay */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 w-[270px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-2">
                {/* Reusing Logo logic or just Text if preferred, sticking to simple text/logo combo */}
                <Image
                  src={"/logo.png"}
                  height={32}
                  width={32}
                  alt="MyScholarHack"
                />
                <span className="text-xl font-bold text-gray-900">
                  MyScholar
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Icon icon="mingcute:close-line" width="24" height="24" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            {/* User Info in Mobile Menu if Logged In */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                {getProfileImage() ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden relative border border-gray-200">
                    <Image
                      src={getProfileImage()}
                      alt="Profile"
                      fill
                      sizes="56px"
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/ceoProfile.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-500 text-white text-xl font-bold border border-gray-200">
                    {userData?.fullName?.charAt(0).toUpperCase() || userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate text-gray-900">
                    {userData?.fullName || userInfo?.name || "User"}
                  </p>
                  {/* Email removed */}
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-2">
              {Nablink.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.pathName}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      pathName === link.pathName
                        ? "bg-[#FFFAEC] text-gray-900 border-l-4 border-[#FFCA42]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    {link.Tiltle}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-gray-100 pt-6 flex flex-col gap-3">
              {!isLoggedIn ? (
                <>
                  <Link href={"/signin"} onClick={() => setIsOpen(false)}>
                    <SecoundryBtn
                      style={
                        "w-full justify-center rounded-lg text-black border border-gray-200"
                      }
                      title={"Sign in"}
                    />
                  </Link>
                  <Link href={"/register"} onClick={() => setIsOpen(false)}>
                    <PrimaryBtn
                      style={"w-full justify-center rounded-lg"}
                      title={"Register"}
                    />
                  </Link>
                </>
              ) : (
                <>
                  <PrimaryBtn
                    style={"w-full justify-center rounded-lg"}
                    title={"Dashboard"}
                    hendleClick={handleDashboardClick}
                  />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 rounded-lg border border-red-100 text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="solar:logout-2-bold" width="20" height="20" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
