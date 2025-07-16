"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

// Color mapping for different plans
const PLAN_COLORS = {
    essay_hack: "#5F8BFF",
    essay_hack_plus: "#22C55E",
    essay_hack_pro: "#FFCA42",
};

// Plan name mapping for display
const PLAN_NAME_MAP = {
    essay_hack: "Essay Hack",
    essay_hack_plus: "Essay Hack Plus",
    essay_hack_pro: "Essay Hack Pro",
};

export default function SubscriptionPieChart({ subscriptionSummary }) {
    
    const data = useMemo(() => {
        if (!subscriptionSummary?.data || !Array.isArray(subscriptionSummary.data)) {
            return [];
        }

        return subscriptionSummary.data.map((plan) => ({
            name: PLAN_NAME_MAP[plan.name] || plan.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            value: plan.count || 0,
            percentage: plan.percentage || 0,
            color: PLAN_COLORS[plan.name] || "#5F8BFF",
        }));
    }, [subscriptionSummary]);
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Subscription Summary</h3>

            <div className="space-y-4 mb-6">
                {data?.length > 0 ? (
                    data.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm font-medium text-gray-600 border-b border-gray-50 pb-2 bg-white">
                            <span>{item.name}</span>
                            <span>{item.value}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-gray-400 text-center py-4">No subscription data available</div>
                )}
            </div>

            <div className="h-[180px] w-full relative">
                {data?.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey="value"
                                    animationDuration={2000}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-4 space-y-2">
                            {data.map((item) => (
                                <div key={item.name} className="flex justify-between items-center text-xs font-semibold">
                                    <span className="">{item.name}</span>
                                    <span style={{ color: item.color }}>{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No data to display
                    </div>
                )}
            </div>
        </div>
    );
}
