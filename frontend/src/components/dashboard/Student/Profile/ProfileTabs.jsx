"use client";
import { cn } from "@/lib/utils";

export default function ProfileTabs({ currentTab, onTabChange, tabs }) {
    return (
        <div className="w-full mb-6">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                            currentTab === tab.id
                                ? "bg-[#FFCA42] text-[#1B1B1B] shadow-sm"
                                : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
