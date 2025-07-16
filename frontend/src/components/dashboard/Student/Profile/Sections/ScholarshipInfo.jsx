"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';
import { cn } from "@/lib/utils";

const SCHOLARSHIP_TYPES = [
    "Merit-based", "Athletic scholarships", "Need-based", "Community service scholarships",
    "Leadership scholarships", "Essay contests", "Major-specific", "No preference", "Identity-based"
];

export default function ScholarshipInfo() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        scholarshipsInterested: [], // Array of selected scholarship types
        specificScholarships: '',
        scholarshipDeadline: '',
    });

    // Fetch scholarship specific info
    const { data: scholarshipInfoResponse, isLoading } = useQuery({
        queryKey: ['scholarshipInfo'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/scholarship-specific-info');
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
                const response = await apiPost('/profile/scholarship-specific-info/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Scholarship specific info updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['scholarshipInfo'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update scholarship specific info';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (scholarshipInfoResponse?.data) {
            setFormData({
                scholarshipsInterested: scholarshipInfoResponse.data.scholarshipsInterested || [],
                specificScholarships: scholarshipInfoResponse.data.specificScholarships || '',
                scholarshipDeadline: scholarshipInfoResponse.data.scholarshipDeadline || '',
            });
        }
    }, [scholarshipInfoResponse]);

    const handleCheckboxChange = (type) => {
        setFormData((prev) => {
            const currentInterested = prev.scholarshipsInterested || [];
            const isSelected = currentInterested.includes(type);

            return {
                ...prev,
                scholarshipsInterested: isSelected
                    ? currentInterested.filter((t) => t !== type)
                    : [...currentInterested, type],
            };
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // Prepare payload
        const payload = {
            scholarshipsInterested: formData.scholarshipsInterested.length > 0 ? formData.scholarshipsInterested : null,
            specificScholarships: formData.specificScholarships?.trim() || null,
            scholarshipDeadline: formData.scholarshipDeadline || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update scholarship specific info');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Scholarship Specific Info"
            description="Information specific to scholarship eligibility requirements."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">What types of scholarships are you most interested in?</label>
                        <div className="flex flex-wrap gap-3">
                            {SCHOLARSHIP_TYPES.map((type) => {
                                const isChecked = formData.scholarshipsInterested?.includes(type) || false;
                                return (
                                    <label
                                        key={type}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition-all",
                                            isChecked
                                                ? "border-[#FFCA42] bg-[#FFCA42]/10"
                                                : "border-gray-200",
                                            !isEditing ? "opacity-75 pointer-events-none bg-gray-50" : "hover:border-[#FFCA42] hover:bg-[#FFCA42]/5"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCheckboxChange(type)}
                                            disabled={!isEditing}
                                            className="w-4 h-4 text-[#FFCA42] rounded border-gray-300 focus:ring-[#FFCA42]"
                                        />
                                        <span className="text-gray-700">{type}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Do you have specific scholarships you're planning to apply for?</label>
                        <textarea
                            name="specificScholarships"
                            value={formData.specificScholarships}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[100px] disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="List any specific scholarships..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">What's your scholarship deadline timeline?</label>
                        <select
                            name="scholarshipDeadline"
                            value={formData.scholarshipDeadline}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all text-gray-700 cursor-pointer disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                        >
                            <option value="">Select timeline</option>
                            <option value="SIX_PLUS_MONTHS">I'm just starting to explore (6+ months out)</option>
                            <option value="THREE_TO_SIX_MONTHS">I'm planning ahead (3–6 months out)</option>
                            <option value="ONE_TO_THREE_MONTHS">I'm actively applying (1–3 months out)</option>
                            <option value="LESS_THAN_ONE_MONTH">I need help ASAP (less than 1 month!)</option>
                        </select>
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
