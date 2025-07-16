"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function FamilyBackground() {
    const queryClient = useQueryClient();

    // Helper function to map API formatted income range to form option values
    const mapIncomeRangeToFormValue = (apiValue) => {
        if (!apiValue) return '';
        const mapping = {
            'Under $25,000': 'under_25k',
            '$25,000 - $50,000': '25k_50k',
            '$40,000 - $60,000': '25k_50k', // API might return this format
            '$50,000 - $75,000': '50k_75k',
            '$75,000 - $100,000': '75k_100k',
            'Over $100,000': 'over_100k',
            'Prefer not to say': 'prefer_not_say',
        };
        // Check if it's already a form value
        if (Object.values(mapping).includes(apiValue)) {
            return apiValue;
        }
        // Try to find a match (case-insensitive partial match)
        const found = Object.keys(mapping).find(key =>
            apiValue.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(apiValue.toLowerCase())
        );
        return found ? mapping[found] : apiValue;
    };

    // Form state
    const [formData, setFormData] = useState({
        firstGenStatus: '',
        householdIncomeRange: '',
        householdSize: '',
        familySituations: '',
    });

    // Fetch family background
    const { data: familyBackgroundResponse, isLoading } = useQuery({
        queryKey: ['familyBackground'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/family-background');
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
                const response = await apiPost('/profile/family-background/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Family background updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['familyBackground'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update family background';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (familyBackgroundResponse?.data) {
            setFormData({
                firstGenStatus: familyBackgroundResponse.data.firstGenStatus || '',
                householdIncomeRange: mapIncomeRangeToFormValue(familyBackgroundResponse.data.householdIncomeRange),
                householdSize: familyBackgroundResponse.data.householdSize?.toString() || '',
                familySituations: familyBackgroundResponse.data.familySituations || '',
            });
        }
    }, [familyBackgroundResponse]);

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
            firstGenStatus: formData.firstGenStatus || null,
            householdIncomeRange: formData.householdIncomeRange || null,
            householdSize: formData.householdSize ? parseInt(formData.householdSize) : null,
            familySituations: formData.familySituations?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update family background');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Family Background"
            description="Information about your family background for scholarship eligibility."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Are you a first-generation college student?</label>
                            <select
                                name="firstGenStatus"
                                value={formData.firstGenStatus}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all text-gray-700 cursor-pointer disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            >
                                <option value="">Select option</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">What is your household income range?</label>
                            <select
                                name="householdIncomeRange"
                                value={formData.householdIncomeRange}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all text-gray-700 cursor-pointer disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                            >
                                <option value="">Select range</option>
                                <option value="under_25k">Under $25,000</option>
                                <option value="25k_50k">$25,000–$50,000</option>
                                <option value="50k_75k">$50,000–$75,000</option>
                                <option value="75k_100k">$75,000–$100,000</option>
                                <option value="over_100k">Over $100,000</option>
                                <option value="prefer_not_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Household size</label>
                            <input
                                name="householdSize"
                                value={formData.householdSize}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="number"
                                min="1"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="e.g. 4"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Family situations</label>
                            <input
                                name="familySituations"
                                value={formData.familySituations}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="Enter details..."
                            />
                        </div>
                    </div>
                </form>
            )}
        </SectionWrapper>
    );
}
