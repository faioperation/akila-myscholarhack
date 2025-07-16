"use client";
import RevenueChart from "@/components/dashboard/Admin/Analytics/RevenueChart";
import EssayGenerationChart from "@/components/dashboard/Admin/Analytics/EssayGenerationChart";
import ActiveUserChart from "@/components/dashboard/Admin/Analytics/ActiveUserChart";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Analytics() {
    const [isLoading, setIsLoading] = useState(false);
    const [revenue, setRevenue] = useState([]);
    const [overview, setOverview] = useState([]);
    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const revenueResponse = await apiGet("/admin/analytics/revenue");
                const overviewResponse = await apiGet("/admin/analytics/overview");

                if (revenueResponse?.success && overviewResponse?.success) {
                    setRevenue(revenueResponse?.data);
                    setOverview(overviewResponse?.data);
                } else {
                    toast.error(revenueResponse?.message || overviewResponse?.message || "Failed to fetch analytics data");
                }
            } catch (error) {
                toast.error("An error occurred while fetching analytics data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);
    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-6 bg-[#FAFAFA] min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500 mt-1">Here's your progress this week.</p>
            </div>

            {/* Top Row: Revenue and Essay Generation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-[400px]">
                    <RevenueChart revenue={revenue} />
                </div>
                <div className="h-[400px]">
                    <EssayGenerationChart essayGeneration={overview?.dailyEssayGeneration
} />
                </div>
            </div>

            {/* Bottom Row: Active Users (Full Width) */}
            <div className="h-[500px]">
                <ActiveUserChart activeUsers={overview?.activeUsers} impressions={overview?.impressions} />
            </div>
        </div>
    );
}
