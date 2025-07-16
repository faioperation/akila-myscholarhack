"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function ExtraCurricular() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        activityName: '',
        yearsInvolved: '',
        leadership: '',
    });

    // Fetch extra curricular activities
    const { data: extraCurricularResponse, isLoading } = useQuery({
        queryKey: ['extraCurricular'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/extra-curricular-activities');
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
                const response = await apiPost('/profile/extra-curricular-activities/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Extra curricular activities updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['extraCurricular'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update extra curricular activities';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (extraCurricularResponse?.data) {
            setFormData({
                activityName: extraCurricularResponse.data.activityName || '',
                yearsInvolved: extraCurricularResponse.data.yearsInvolved || '',
                leadership: extraCurricularResponse.data.leadership || '',
            });
        }
    }, [extraCurricularResponse]);

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
            activityName: formData.activityName?.trim() || null,
            yearsInvolved: formData.yearsInvolved?.trim() || null,
            leadership: formData.leadership?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update extra curricular activities');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Extra Curricular Activities"
            description="Highlight your involvement in clubs, sports, and other organizations."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Activity Name</label>
                            <input
                                name="activityName"
                                value={formData.activityName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. Debate Club"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Years Involved</label>
                            <input
                                name="yearsInvolved"
                                value={formData.yearsInvolved}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. 2021 - 2023"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Leadership positions held</label>
                        <input
                            name="leadership"
                            value={formData.leadership}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            type="text"
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="e.g. President, Treasurer"
                        />
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
