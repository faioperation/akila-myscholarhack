"use client";
import { Icon } from "@iconify/react";

export default function LoadingModal({ isOpen, progress, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fade-in">
                {/* Loading Animation Circle */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-32 h-32">
                        {/* Spinning outer ring */}
                        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                        <div
                            className="absolute inset-0 rounded-full border-8 border-[#F6C844] border-t-transparent animate-spin"
                            style={{ animationDuration: '1.5s' }}
                        ></div>

                        {/* Inner pulsing circle */}
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#F6C844] to-[#EDB91C] flex items-center justify-center animate-pulse">
                            <Icon icon="mdi:file-document-edit" className="text-white text-4xl" />
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#2D3748] mb-3">
                        Generating Your Essay
                    </h3>
                    <p className="text-[#718096] text-base">
                        Your essay is generating. Please don't leave the site.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#4A5568]">Progress</span>
                        <span className="text-sm font-bold text-[#F6C844]">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#F6C844] to-[#EDB91C] rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Progress dots animation */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-[#F6C844] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#F6C844] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#F6C844] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
