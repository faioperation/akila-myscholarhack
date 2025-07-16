"use client";
import { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ revenue }) {
    const [period, setPeriod] = useState("1 Year");

    // Transform API data to chart format
    const chartData = useMemo(() => {
        if (!revenue || typeof revenue !== "object") {
            return [];
        }

        // Get the appropriate data based on period
        const periodData = period === "1 Year" ? revenue.yearly : revenue.monthly;

        if (!periodData || !periodData.labels || !periodData.data) {
            return [];
        }

        // Combine labels and data arrays into chart format
        return periodData.labels.map((label, index) => ({
            name: label,
            value: periodData.data[index] || 0,
        }));
    }, [revenue, period]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Revenue</h3>
                <div className="bg-gray-100 rounded-lg p-1 flex">
                    {["1 Year", "Month"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setPeriod(item)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${period === item
                                ? "bg-[#FFCA42] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-sm">No revenue data available</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                        >
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
                                formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#22C55E"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 8, fill: "#22C55E", stroke: "white", strokeWidth: 2 }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
