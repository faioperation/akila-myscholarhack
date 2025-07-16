"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function AcademicInterests() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        major: '',
        interestReason: '',
        collegeCareerGoals: '',
    });

    // Fetch academic interests
    const { data: academicInterestsResponse, isLoading } = useQuery({
        queryKey: ['academicInterests'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/academic-interest');
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
                
                const response = await apiPost('/profile/academic-interest/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Academic interests updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['academicInterests'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update academic interests';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (academicInterestsResponse?.data) {
            setFormData({
                major: academicInterestsResponse.data.intendedMajor || '',
                interestReason: academicInterestsResponse.data.whyThisField || '',
                collegeCareerGoals: academicInterestsResponse.data.careerGoals || '',
            });
        }
    }, [academicInterestsResponse]);

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
            intendedMajor: formData.major?.trim() || null,
            whyThisField: formData.interestReason?.trim() || null,
            careerGoals: formData.collegeCareerGoals?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update academic interests');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Academic Interests"
            description="Share your educational background and future goals."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">You plan to major</label>
                        <input
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            type="text"
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="e.g. Computer Science"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Why does this field interest you?</label>
                        <textarea
                            name="interestReason"
                            value={formData.interestReason}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Tell us why..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">What are your college/career goals?</label>
                        <textarea
                            name="collegeCareerGoals"
                            value={formData.collegeCareerGoals}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Describe your goals..."
                        />
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
