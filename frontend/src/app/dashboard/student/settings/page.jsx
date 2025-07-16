"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentSettings, updateStudentSettings, apiGet } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function Settings() {
    const queryClient = useQueryClient();

    // Fetch user profile for email
    const { data: profileResponse } = useQuery({
        queryKey: ["userProfileSettings"],
        queryFn: async () => {
            return await apiGet("/user/me");
        }
    });

    const userEmail = profileResponse?.data?.email;


    const { data: response, isLoading, isError, error } = useQuery({
        queryKey: ["studentSettings"],
        queryFn: getStudentSettings,
    });

    const settings = response?.data;
    

    const mutation = useMutation({
        mutationFn: updateStudentSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studentSettings"] });
            toast.success("Settings updated successfully!");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update settings");
        },
    });

    const [formData, setFormData] = useState({
        fullName: "",
        emailNotifications: false,
        scholarshipUpdate: false,
        applicationReminders: false,
    });


    useEffect(() => {
        if (response?.success && settings) {
            setFormData({
                fullName: settings.fullName || "",
                emailNotifications: settings.emailNotifications ?? false,
                scholarshipUpdate: settings.scholarshipUpdate ?? false,
                applicationReminders: settings.applicationReminders ?? false,
            });
        }
    }, [settings, response]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async () => {
        mutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading settings...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 sm:p-6 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
                    <p className="font-semibold">Error loading settings</p>
                    <p className="text-sm">{error?.message || "Please try again later."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Settings</h1>

            <div className="max-w-4xl space-y-4 sm:space-y-6">

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Profile Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                readOnly
                                disabled
                                value={userEmail || "Loading email..."}
                                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Notification Settings</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                checked={formData.emailNotifications}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors">Email notifications</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="scholarshipUpdate"
                                checked={formData.scholarshipUpdate}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors">Scholarship updates</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="applicationReminders"
                                checked={formData.applicationReminders}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors">Application reminders</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={mutation.isPending}
                        className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-white font-medium transition-all flex items-center justify-center
                            ${mutation.isPending
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
