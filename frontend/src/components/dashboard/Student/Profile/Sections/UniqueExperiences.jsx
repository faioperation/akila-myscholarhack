"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function UniqueExperiences() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        hobbies: '',
        uniqueExperiences: '',
        proudMoment: '',
    });

    // Fetch unique experiences
    const { data: uniqueExperiencesResponse, isLoading } = useQuery({
        queryKey: ['uniqueExperiences'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/unique-experience');
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
                const response = await apiPost('/profile/unique-experience/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Unique experiences updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['uniqueExperiences'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update unique experiences';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (uniqueExperiencesResponse?.data) {
            setFormData({
                hobbies: uniqueExperiencesResponse.data.hobbies || '',
                uniqueExperiences: uniqueExperiencesResponse.data.uniqueExperiences || '',
                proudMoment: uniqueExperiencesResponse.data.proudMoment || '',
            });
        }
    }, [uniqueExperiencesResponse]);

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
            hobbies: formData.hobbies?.trim() || null,
            uniqueExperiences: formData.uniqueExperiences?.trim() || null,
            proudMoment: formData.proudMoment?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update unique experiences');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Unique Experiences"
            description="Share distinct experiences that help tell your ambition story."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">What are your hobbies or interests outside of school?</label>
                        <textarea
                            name="hobbies"
                            value={formData.hobbies}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Have you had any unique or unusual experiences?</label>
                        <textarea
                            name="uniqueExperiences"
                            value={formData.uniqueExperiences}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Describe any unique experiences..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">What are you most proud of?</label>
                        <textarea
                            name="proudMoment"
                            value={formData.proudMoment}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Share your proudest moment..."
                        />
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
