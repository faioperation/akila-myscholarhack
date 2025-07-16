"use client";
import { useState, useEffect, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { apiGet } from "@/lib/api";

export default function SalesTrackGraph() {
    const [filter, setFilter] = useState("Day");
    const [salesTrackData, setSalesTrackData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Map filter to API type
    const getApiType = (filterValue) => {
        const typeMap = {
            Day: "day",
            Week: "week",
            Month: "month",
        };
        return typeMap[filterValue] || "day";
    };

    // Format date label based on type
    const formatLabel = (label, type) => {
        if (type === "day") {
            // Format: "2026-01-19" -> "Jan 19" or "01/19"
            const date = new Date(label);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (type === "week") {
            // Format: "2026-01-18" -> "Jan 18" (end of week)
            const date = new Date(label);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (type === "month") {
            // Format: "2026-01" -> "Jan" or "Jan 2026"
            const [year, month] = label.split("-");
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleDateString("en-US", { month: "short" });
        }
        return label;
    };

    // Fetch sales track data
    useEffect(() => {
        const fetchSalesTrack = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const apiType = getApiType(filter);
                const response = await apiGet(`/admin/dashboard/sales-track?type=${apiType}`);

                if (response?.success && response?.data) {
                    setSalesTrackData(response);
                } else {
                    setError(response?.message || "Failed to fetch sales data");
                }
            } catch (err) {
                setError(err?.message || "An error occurred while fetching sales data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesTrack();
    }, [filter]);

    // Transform API data to chart format
    const chartData = useMemo(() => {
        if (!salesTrackData?.data || !Array.isArray(salesTrackData.data)) {
            return [];
        }

        return salesTrackData.data.map((item) => ({
            name: formatLabel(item.label, salesTrackData.type),
            value: item.value || 0,
            value2: item.value || 0, // Using same value for both areas
        }));
    }, [salesTrackData]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Sales Track</h3>
                    {salesTrackData?.range && (
                        <p className="text-sm text-gray-500 mt-1">{salesTrackData.range}</p>
                    )}
                </div>
                <div className="bg-gray-100 rounded-lg p-1 flex">
                    {["Day", "Week", "Month"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            disabled={isLoading}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${filter === item
                                ? "bg-[#FFCA42] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-blue-400 text-sm">Loading sales data...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 text-sm">{error}</div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-sm">No sales data available</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFCA42" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#FFCA42" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value2"
                                stroke="#22C55E"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue2)"
                                animationDuration={3000}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#FFCA42"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                animationDuration={3000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
