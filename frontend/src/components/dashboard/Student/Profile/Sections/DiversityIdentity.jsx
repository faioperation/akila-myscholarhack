"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function DiversityIdentity() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        selfIdentification: '',
        genderIdentity: '',
        religiousIdentity: '',
    });

    // Fetch diversity identity
    const { data: diversityIdentityResponse, isLoading } = useQuery({
        queryKey: ['diversityIdentity'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/diversity-identity');
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
                const response = await apiPost('/profile/diversity-identity/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Diversity & identity updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['diversityIdentity'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update diversity & identity';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (diversityIdentityResponse?.data) {
            setFormData({
                selfIdentification: diversityIdentityResponse.data.selfIdentification || '',
                genderIdentity: diversityIdentityResponse.data.genderIdentity || '',
                religiousIdentity: diversityIdentityResponse.data.religiousIdentity || '',
            });
        }
    }, [diversityIdentityResponse]);

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
            selfIdentification: formData.selfIdentification?.trim() || null,
            genderIdentity: formData.genderIdentity?.trim() || null,
            religiousIdentity: formData.religiousIdentity?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update diversity & identity');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Diversity and Identity"
            description="Optional information to find scholarships relevant to your background."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">How do you identify?</label>
                        <textarea
                            name="selfIdentification"
                            value={formData.selfIdentification}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[80px] disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="e.g. Latino, LGBTQ+, Person with disability..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Gender Identity</label>
                            <input
                                name="genderIdentity"
                                value={formData.genderIdentity}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. Female, Non-binary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Religious / Cultural Identity</label>
                            <input
                                name="religiousIdentity"
                                value={formData.religiousIdentity}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. Christian, Jewish"
                            />
                        </div>
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
