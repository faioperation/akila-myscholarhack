"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function AnythingElse() {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState({
        anythingElse: '',
    });

    // Fetch anything else
    const { data: anythingElseResponse, isLoading } = useQuery({
        queryKey: ['anythingElse'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/anything-else');
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
                const response = await apiPost('/profile/anything-else/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Additional information updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['anythingElse'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update additional information';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (anythingElseResponse?.data) {
            setFormData({
                anythingElse: anythingElseResponse.data.anythingElse ||
                    anythingElseResponse.data.additionalInfo ||
                    anythingElseResponse.data.misc ||
                    '',
            });
        }
    }, [anythingElseResponse]);

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
            anythingElse: formData.anythingElse?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update additional information');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Anything Else"
            description="Is there anything else you want to share that didn't fit elsewhere?"
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Is there anything else we should know about you?</label>
                        <textarea
                            name="anythingElse"
                            value={formData.anythingElse}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[150px] resize-y disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            placeholder="Use this space to tell us anything else regarding your profile..."
                        />
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
