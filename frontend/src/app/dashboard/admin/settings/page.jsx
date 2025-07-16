"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import Loading from "@/components/Loading/Loading";
import toast from "react-hot-toast";

export default function Settings() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        emailNotifications: false,
        userActivityAlerts: false,
        systemMaintenanceAlerts: false,
    });

    const { data: settingsResponse, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            try {
                const response = await apiGet("/admin/settings");
                return response;
            } catch (error) {
                throw error;
            }
        },
    });

    // Initialize form data when settings are loaded
    useEffect(() => {
        if (settingsResponse?.data) {
            setFormData({
                name: settingsResponse.data.name || "",
                email: settingsResponse.data.email || "",
                emailNotifications: settingsResponse.data.emailNotifications || false,
                userActivityAlerts: settingsResponse.data.userActivityAlerts || false,
                systemMaintenanceAlerts: settingsResponse.data.systemMaintenanceAlerts || false,
            });
        }
    }, [settingsResponse]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (payload) => {
            return apiPatch("/admin/settings", payload);
        },
        onSuccess: () => {
            toast.success("Settings updated successfully");
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                "Failed to update settings";
            toast.error(errorMessage);
        },
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Settings</h1>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-4 sm:space-y-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Profile Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-gray-500 text-xs">(Read Only)</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                readOnly
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">System Settings</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                checked={formData.emailNotifications}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm sm:text-base text-gray-700">Email notifications</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="userActivityAlerts"
                                checked={formData.userActivityAlerts}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm sm:text-base text-gray-700">User activity alerts</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="systemMaintenanceAlerts"
                                checked={formData.systemMaintenanceAlerts}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm sm:text-base text-gray-700">System maintenance notifications</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
