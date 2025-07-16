"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function CommunityService() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        volunteerWork: '',
        organization: '',
        totalHours: '',
    });

    // Fetch community service
    const { data: communityServiceResponse, isLoading } = useQuery({
        queryKey: ['communityService'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/volunteer-work');
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
                const response = await apiPost('/profile/volunteer-work/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Community service updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['communityService'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update community service';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (communityServiceResponse?.data) {
            setFormData({
                volunteerWork: communityServiceResponse.data.whatVolunteerWork || '',
                organization: communityServiceResponse.data.organization || '',
                totalHours: communityServiceResponse.data.totalHours || '',
            });
        }
    }, [communityServiceResponse]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // Prepare payload - API expects 'whatVolunteerWork' not 'volunteerWork'
        const payload = {
            whatVolunteerWork: formData.volunteerWork?.trim() || null,
            organization: formData.organization?.trim() || null,
            totalHours: formData.totalHours ? parseInt(formData.totalHours) : null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update community service');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Community Service (Volunteer Work)"
            description="Detail your volunteer work and community engagement."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">What volunteer work or community service have you done?</label>
                        <textarea
                            name="volunteerWork"
                            value={formData.volunteerWork}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Describe your service..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Organization / Cause</label>
                            <input
                                name="organization"
                                value={formData.organization}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. Red Cross"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Total hours</label>
                            <input
                                name="totalHours"
                                value={formData.totalHours}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="number"
                                min="0"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. 50"
                            />
                        </div>
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
