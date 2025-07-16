"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function BasicInfo() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        grade: '',
        schoolType: '',
        location: '',
        gpa: '',
    });

    // Fetch basic information
    const { data: basicInfoResponse, isLoading } = useQuery({
        queryKey: ['basicInfo'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/basic-information');
                return response;
            } catch (error) {
                throw error;
            }
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (payload) => {
            try {
                const response = await apiPost('/profile/basic-information/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Basic information updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['basicInfo'] });
            // Also invalidate userProfile since fullName is shown in header
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update basic information';

            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (basicInfoResponse?.data) {
            setFormData({
                fullName: basicInfoResponse.data.fullName || '',
                grade: basicInfoResponse.data.grade || '',
                schoolType: basicInfoResponse.data.schoolType || '',
                location: basicInfoResponse.data.location || '',
                gpa: basicInfoResponse.data.gpa || '',
            });
        }
    }, [basicInfoResponse]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.fullName || !formData.grade || !formData.schoolType) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Prepare payload - ensure all values are properly formatted
        const payload = {
            fullName: formData.fullName.trim(),
            grade: formData.grade,
            schoolType: formData.schoolType,
            location: formData.location?.trim() || null,
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        };



        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update basic information');
        }
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <SectionWrapper
            title="Basic Information"
            description="Manage your personal details and contact information."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    {/* Full Name - Full Width */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            type="text"
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Grade - Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Grade <span className="text-red-500">*</span></label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all text-gray-700 cursor-pointer disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            >
                                <option value="">Select Grade</option>
                                <option value="9">9th grade</option>
                                <option value="10">10th grade</option>
                                <option value="11">11th grade</option>
                                <option value="12">12th grade</option>
                                <option value="gap">Gap year</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Type of School - Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Type of School <span className="text-red-500">*</span></label>
                            <select
                                name="schoolType"
                                value={formData.schoolType}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all text-gray-700 cursor-pointer disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            >
                                <option value="">Select School Type</option>
                                <option value="public">Public school</option>
                                <option value="private">Private school</option>
                                <option value="charter">Charter school</option>
                                <option value="HIGH_SCHOOL">High School</option>
                                <option value="homeschool">Homeschool</option>
                                <option value="online">Online school</option>
                                <option value="international">International school</option>
                            </select>
                        </div>

                        {/* Location - Half Width */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Where are you located?</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. New York, USA"
                            />
                        </div>

                        {/* GPA - Half Width */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">GPA</label>
                            <input
                                name="gpa"
                                value={formData.gpa}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="4.0"
                            />
                        </div>
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
