    "use client";
import AdminStatsCard from "@/components/dashboard/Admin/AdminStatsCard";
import SalesTrackGraph from "@/components/dashboard/Admin/SalesTrackGraph";
import SubscriptionPieChart from "@/components/dashboard/Admin/SubscriptionPieChart";
import { apiGet } from "@/lib/api";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading/Loading";
export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState([]);
    const [subscriptionSummary, setSubscriptionSummary] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const response = await apiGet("/admin/dashboard/overview");

                if (response?.success) {
                    setSummary(response?.data?.summary);
                    setSubscriptionSummary(response?.data?.subscriptionSummary);
                } else {
                    toast.error(response?.message || "Failed to fetch dashboard data");
                }
            } catch (error) {
                
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    const stats = [
        {
            icon: "majesticons:users-line",
            label: "Total User",
            value: summary?.totalUsers,
            trend: "up",
            trendValue: 15,
            iconColor: "text-green-600",
            bgIconColor: "bg-green-50",
        },
        {
            icon: "solar:user-plus-outline",
            label: "Active Subscriber",
            value: summary?.activeSubscribers,
            trend: "up",
            trendValue: 65,
            iconColor: "text-[#5F8BFF]",
            bgIconColor: "bg-[#eef4ff]",
        },
        {
            icon: "solar:dollar-linear",
            label: "Monthly Rev",
            value: "$ " + (summary?.monthlyRevenue ? Number(summary.monthlyRevenue).toFixed(2) : "0.00"),
            trend: "down",
            trendValue: 5,
            iconColor: "text-orange-500",
            bgIconColor: "bg-orange-50",
        },
        {
            icon: "hugeicons:note-02",
            label: "Total Essays",
            value: summary?.totalEssays,    
            trend: "up",
            trendValue: 10,
            iconColor: "text-yellow-600",
            bgIconColor: "bg-[#fff9e6]",
        },
    ];

    return (
        <div className="p-6 bg-[#FAFAFA] min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Here’s your progress this week..</p>
            </div>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <AdminStatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[500px]">
                    <SalesTrackGraph />
                </div>
                {
                    subscriptionSummary && <div className="lg:col-span-1 h-[500px]">
                        <SubscriptionPieChart subscriptionSummary={subscriptionSummary} />
                    </div>
                }
            </div>
        </div>
    );
}
