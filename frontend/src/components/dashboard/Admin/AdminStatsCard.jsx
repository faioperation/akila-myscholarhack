import { Icon } from "@iconify/react";

export default function AdminStatsCard({ icon, label, value, trend, trendValue, iconColor, bgIconColor }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[200px]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${bgIconColor}`}>
                <Icon icon={icon} className={`text-2xl ${iconColor}`} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    {trendValue && (
                        <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend === "up"
                                    ? "text-green-600 bg-green-50"
                                    : "text-red-500 bg-red-50"
                                }`}
                        >
                            
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
