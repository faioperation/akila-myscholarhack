"use client";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ActiveUserChart({ activeUsers, impressions }) {
  // Transform API data to chart format
  const lineChartData = useMemo(() => {
    if (!activeUsers || typeof activeUsers !== "object") {
      return [];
    }

    if (!activeUsers.labels || !activeUsers.thisWeek || !activeUsers.lastWeek) {
      return [];
    }

    // Combine labels, thisWeek, and lastWeek arrays into chart format
    return activeUsers.labels.map((label, index) => ({
      name: label,
      value: activeUsers.thisWeek[index] || 0,
      value2: activeUsers.lastWeek[index] || 0,
    }));
  }, [activeUsers]);

  // Transform impressions API data to chart format
  const impressionsChartData = useMemo(() => {
    if (!impressions || typeof impressions !== "object") {
      return [];
    }

    if (!impressions.labels || !impressions.data) {
      return [];
    }

    // Combine labels and data arrays into chart format
    return impressions.labels.map((label, index) => ({
      name: label,
      value: impressions.data[index] || 0,
    }));
  }, [impressions]);

  // Format percentage change with sign
  const formatPercentageChange = (percentage) => {
    if (percentage === null || percentage === undefined) return "0%";
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage}%`;
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString("en-US");
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col md:flex-row gap-8">
      {/* Left: Line Chart */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-8">Active User</h3>
        <div className="h-[340px] w-full">
          {lineChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">No active user data available</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={true}
                  horizontal={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value, name) => [
                    value,
                    name === "value" ? "This Week" : "Last Week",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4F46E5" // Purple
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#4F46E5" }}
                  animationDuration={2000}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#FFCA42" // Yellow
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#FFCA42" }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Right: Info & Bar Chart */}
      <div className="w-[20%] md:w-1/3 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Weekly</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-xl font-bold text-[#4F46E5]">
                {activeUsers?.comparison?.thisWeekTotal ?? 0}
              </p>
              {activeUsers?.comparison?.percentageChange !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercentageChange(activeUsers.comparison.percentageChange)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Week</p>
              <p className="text-xl font-bold text-[#FFCA42]">
                {activeUsers?.comparison?.lastWeekTotal ?? 0}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800">Impression</h3>
        <div className="h-[220px] w-full">
          {impressionsChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">No impression data available</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impressionsChartData} barSize={25}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  dy={5}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [value, "Impressions"]}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 4, 4]}
                  animationDuration={2000}
                >
                  {impressionsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4338CA" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold text-gray-800">
            {formatNumber(impressions?.total ?? 0)}
          </h4>
          <p className="text-sm text-gray-500">
            <span className="text-[#FFCA42]">Total</span> impressions
          </p>
        </div>
      </div>
    </div>
  );
}
