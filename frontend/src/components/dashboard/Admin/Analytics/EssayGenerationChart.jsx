"use client";
import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

// Color palette for bars (cycling through colors)
const BAR_COLORS = [
    "#95A4FC", // Light Purple
    "#BAEDBD", // Light Green
    "#1C1C1C", // Black
    "#B1E3FF", // Light Blue
    "#A8C5DA", // Greyish Blue
    "#A1E3CB", // Light Teal
    "#FFCA42", // Yellow
    "#22C55E", // Green
];

export default function EssayGenerationChart({ essayGeneration }) {
    // Transform API data to chart format
    const chartData = useMemo(() => {
        if (!essayGeneration || typeof essayGeneration !== "object") {
            return [];
        }

        if (!essayGeneration.labels || !essayGeneration.data) {
            return [];
        }

        // Combine labels and data arrays into chart format
        return essayGeneration.labels.map((label, index) => ({
            name: label,
            value: essayGeneration.data[index] || 0,
            color: BAR_COLORS[index % BAR_COLORS.length], // Cycle through colors
        }));
    }, [essayGeneration]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-8">Total Essay Generation</h3>

            <div className="h-[300px] w-full">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-sm">No essay generation data available</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                            barSize={20}
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
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [value, 'Essays']}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={2000}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
