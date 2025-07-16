"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import AdminStatsCard from "@/components/dashboard/Admin/AdminStatsCard";
import ScholershipCard from "@/components/dashboard/Student/ScholershipCard";
import Table from "@/components/dashboard/Table";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { getDashboardStats, apiPost, apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function StudentDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState("");
  const { data: profileResponse } = useQuery({
    queryKey: ["userProfileDashboard"],
    queryFn: async () => {
      try {
        const response = await apiGet("/profile/me");
        return response;
      } catch (error) {
        return null; // Handle error silently or as needed
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const userData = profileResponse?.data;

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async (silent = false) => {
      if (!silent) setIsLoading(true);
      setError("");

      try {
        const response = await getDashboardStats();

        if (!isMounted) return;
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.message || "Failed to load dashboard data");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.message || "Failed to load dashboard data. Try again later.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardStats();

    // Background Sync Logic
    const syncResult = async () => {
      if (isMounted) setIsLoadingRecommendations(true);
      try {
        // Trigger sync (user sees existing data meanwhile)
        await apiPost("/essay-recommendation/generate");

        // Once synced, refetch the dashboard data to update UI
        if (isMounted) await fetchDashboardStats(true);
      } catch (error) {
        console.error("Background sync failed:", error);
      } finally {
        if (isMounted) setIsLoadingRecommendations(false);
      }
    };

    // Delay sync to prioritize UI rendering
    const timer = setTimeout(() => {
      if (isMounted) syncResult();
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const TableHeads = [
    {
      Title: "Essay",
      key: "essay",
      width: "70%",
      render: (row) => (
        <div className="text-left pl-4">
          <h3 className="font-semibold text-gray-900 text-base">{row.title}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{row.subject}</p>
        </div>
      ),
    },
    {
      Title: "Status",
      key: "status",
      width: "20%",
      render: (row) => (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "SAVED"
                ? "bg-green-100 text-green-700"
                : row.status === "EDITED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
          >
            {row.status}
          </span>
        </div>
      ),
    },
    {
      Title: "View",
      key: "view",
      width: "10%",
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() =>
              router.push(`/dashboard/student/view_essay?id=${row.id}`)
            }
            className="w-10 h-10 rounded-lg border border-[#FFCA42] text-[#FFCA42] flex items-center justify-center hover:bg-[#FFF9E5] transition-colors"
          >
            <Icon icon="lucide:eye" width={20} height={20} />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      icon: "mdi:file-document-edit-outline",
      label: "Total Essays",
      value: dashboardData?.totalEssays?.toString().padStart(2, "0") || "00",
      iconColor: "text-[#ECA20E]",
      bgIconColor: "bg-[#FEF5E3]",
    },
    {
      icon: "mdi:school-outline",
      label: "Scholarship Added",
      value:
        dashboardData?.scholarshipAdded?.toString().padStart(2, "0") || "00",
      iconColor: "text-[#36B37E]",
      bgIconColor: "bg-[#EBF9F3]",
    },
    {
      icon: "mdi:clock-time-four-outline",
      label: "Upcoming Application Deadlines",
      value:
        dashboardData?.upcomingDeadlineCount?.toString().padStart(2, "0") ||
        "00",
      iconColor: "text-[#FF5630]",
      bgIconColor: "bg-[#FFF0ED]",
    },
  ];

  if (isLoading) return <Loader fullScreen={false} />;

  // Filter recommendations
  const filteredRecommendations =
    dashboardData?.recommendations
      ?.filter((item) => {
        const scholarship = item.scholarship || {};
        const hasAmount = scholarship.amount && Number(scholarship.amount) > 0;
        const hasDescription =
          scholarship.description && scholarship.description.trim().length > 0;
        return hasAmount && hasDescription;
      })
      .slice(0, 4) || [];

  const handleApply = (scholarship) => {
    // Save full scholarship details to local storage for the Essay page to consume
    localStorage.setItem(
      "selected_scholarship_for_application",
      JSON.stringify(scholarship),
    );

    // Also update Application Tracker as "Processing"
    const currentData = JSON.parse(
      localStorage.getItem("application_tracker_data") || "[]",
    );
    const existingIndex = currentData.findIndex(
      (item) => item.id === scholarship.id,
    );

    if (existingIndex === -1) {
      currentData.push({
        id: scholarship.id,
        title: scholarship.title,
        provider: scholarship.provider,
        subject: scholarship.subject,
        description: scholarship.description, // Saving description as requested
        essayTitle: "Pending Selection...",
        essayContent: "",
        amount: scholarship.amount,
        deadline: scholarship.deadline,
        status: "Processing",
      });
      localStorage.setItem(
        "application_tracker_data",
        JSON.stringify(currentData),
      );
    }

    // Set active for the session
    localStorage.setItem("current_active_scholarship", scholarship.id);

    router.push("/dashboard/student/essays");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userData?.fullName || userData?.name || "Student"}
        </h1>
        <p className="text-gray-500 mt-1">Here’s your progress this week.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <AdminStatsCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            iconColor={stat.iconColor}
            bgIconColor={stat.bgIconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Your Essays Table */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Your Essays</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">
                Loading essays...
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">{error}</div>
            ) : dashboardData?.essays?.length > 0 ? (
              <Table TableHeads={TableHeads} TableRows={dashboardData.essays} />
            ) : (
              <div className="text-center py-20 text-gray-500">
                No essays found. Start writing!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommended Scholarships */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Featured Scholarships
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            { isLoadingRecommendations ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-gradient-to-br from-[#FFF9E5] to-[#FFFAEC] rounded-2xl border-2 border-[#FFCA42]/20 shadow-lg">
                <div className="relative">
                  {/* Animated Spinner */}
                  <div className="w-16 h-16 border-4 border-[#FFCA42]/20 border-t-[#FFCA42] rounded-full animate-spin mb-4"></div>
                  {/* Pulsing Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="mdi:school-outline"
                      className="text-[#FFCA42] animate-pulse"
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-gray-800 animate-pulse">
                    Finding Scholarships
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 justify-center">
                    <span className="inline-block w-2 h-2 bg-[#FFCA42] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="inline-block w-2 h-2 bg-[#FFCA42] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="inline-block w-2 h-2 bg-[#FFCA42] rounded-full animate-bounce"></span>
                  </p>
                </div>
              </div>
            ) : filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((item, idx) => {
                const scholarship = item.scholarship || item;
                return (
                  <ScholershipCard
                    key={idx}
                    Details={scholarship}
                    onApply={() => handleApply(scholarship)}
                    compact={true}
                    isRecommended={true}
                  />
                );
              })
            ) : (
              <div className="col-span-2 text-gray-500 text-center py-10 bg-white rounded-2xl border border-gray-100">
                Please fill out your profile information first to get personalized recommendations. <br />
                <Link href="/dashboard/student/profile" className="text-blue-500 hover:text-blue-700 cursor-pointer hover:underline">Fill out your profile information</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
