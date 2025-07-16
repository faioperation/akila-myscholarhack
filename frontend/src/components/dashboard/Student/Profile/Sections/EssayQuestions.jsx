"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import SectionWrapper from '../SectionWrapper';
import Loading from '../../../../Loading/Loading';

export default function EssayQuestions() {
    const queryClient = useQueryClient();

    // Questions mapping to API field names
    const questions = [
        {
            question: "Who has been the most influential person in your life?",
            fieldName: "influentialPerson"
        },
        {
            question: "What's a mistake you made that taught you something important?",
            fieldName: "mistakeAndLesson"
        },
        {
            question: "What issue or cause do you care deeply about?",
            fieldName: "issueYouCareAbout"
        },
        {
            question: "Describe a time you failed at something.",
            fieldName: "failureStory"
        },
        {
            question: "What makes you different from other students?",
            fieldName: "whatMakesYouDifferent"
        },
        {
            question: "If you could change one thing about your school or community, what would it be?",
            fieldName: "communityChangeIdea"
        }
    ];

    // Form state - initialize with all question fields
    const [formData, setFormData] = useState({
        influentialPerson: '',
        mistakeAndLesson: '',
        issueYouCareAbout: '',
        failureStory: '',
        whatMakesYouDifferent: '',
        communityChangeIdea: '',
    });

    // Fetch essay specific questions
    const { data: essayQuestionsResponse, isLoading } = useQuery({
        queryKey: ['essayQuestions'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/essay-specific-questions');
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
                const response = await apiPost('/profile/essay-specific-questions/upsert', payload);
                return response;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Essay specific questions updated successfully');
            // Invalidate and refetch data
            queryClient.invalidateQueries({ queryKey: ['essayQuestions'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to update essay specific questions';
            toast.error(errorMessage);
        },
    });

    // Initialize form data when data is fetched
    useEffect(() => {
        if (essayQuestionsResponse?.data) {
            setFormData({
                influentialPerson: essayQuestionsResponse.data.influentialPerson || '',
                mistakeAndLesson: essayQuestionsResponse.data.mistakeAndLesson || '',
                issueYouCareAbout: essayQuestionsResponse.data.issueYouCareAbout || '',
                failureStory: essayQuestionsResponse.data.failureStory || '',
                whatMakesYouDifferent: essayQuestionsResponse.data.whatMakesYouDifferent || '',
                communityChangeIdea: essayQuestionsResponse.data.communityChangeIdea || '',
            });
        }
    }, [essayQuestionsResponse]);

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
            influentialPerson: formData.influentialPerson?.trim() || null,
            mistakeAndLesson: formData.mistakeAndLesson?.trim() || null,
            issueYouCareAbout: formData.issueYouCareAbout?.trim() || null,
            failureStory: formData.failureStory?.trim() || null,
            whatMakesYouDifferent: formData.whatMakesYouDifferent?.trim() || null,
            communityChangeIdea: formData.communityChangeIdea?.trim() || null,
        };

        try {
            await updateMutation.mutateAsync(payload);
        } catch (error) {
            toast.error(error?.message || 'Failed to update essay specific questions');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <SectionWrapper
            title="Essay Specific Questions"
            description="Pre-answer common essay prompts to speed up generation."
            onSave={handleSave}
        >
            {({ isEditing }) => (
                <form className="space-y-6">
                    {questions.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{item.question}</label>
                            <textarea
                                name={item.fieldName}
                                value={formData[item.fieldName]}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all placeholder:text-gray-400 min-h-[100px] disabled:bg-white disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-600"
                                placeholder="Draft your answer..."
                            />
                        </div>
                    ))}
                </form>
            )}
        </SectionWrapper>
    );
}
