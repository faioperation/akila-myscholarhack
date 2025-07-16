"use client";
import React, { useState } from "react";
import SectionHead from "../SectionHead";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const CATEGORY_API_TO_UI = {
    "PRICING": "Pricing",
    "GETTING_STARTED": "Getting Started",
    "HOW_IT_WORKS": "How It Works",
    "PRIVACY": "Privacy",
    "SCHOLARSHIPS": "Scholarships",
    "TECHNICAL": "Technical Questions",
    "SUPPORT": "Support",
    "ACADEMIC_INTEGRITY": "Academic Integrity"
};

const FaqTabs = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [openIndex, setOpenIndex] = useState(0);

    const { data: faqsResponse } = useQuery({
        queryKey: ["faqs"],
        queryFn: async () => {
            try {
                // Using the same API endpoint as requested
                // Pass _skipAuthRedirect to prevent redirecting to login on 401
                const response = await apiGet("/admin/faqs/public", {}, { _skipAuthRedirect: true });
                return response;
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
                return [];
            }
        },
    });

    const { faqData, categories } = React.useMemo(() => {
        if (!faqsResponse) return { faqData: {}, categories: [] };

        let faqsList = [];
        if (Array.isArray(faqsResponse)) {
            faqsList = faqsResponse;
        } else if (faqsResponse?.data) {
            if (Array.isArray(faqsResponse.data)) {
                faqsList = faqsResponse.data;
            } else if (faqsResponse.data.faqs && Array.isArray(faqsResponse.data.faqs)) {
                faqsList = faqsResponse.data.faqs;
            }
        }

        // Normalize categories and group by category
        const groupedData = {};

        // Initialize with predefined categories to maintain order
        const PREDEFINED_CATEGORIES = [
            "All",
            "Pricing",
            "Getting Started",
            "How It Works",
            "Privacy",
            "Scholarships",
            "Technical Questions",
            "Support",
            "Academic Integrity",
        ];

        PREDEFINED_CATEGORIES.forEach(cat => groupedData[cat] = []);
        groupedData.All = faqsList;

        faqsList.forEach(faq => {
            const normalizedCategory = CATEGORY_API_TO_UI[faq.category] || faq.category;
            if (!groupedData[normalizedCategory]) {
                groupedData[normalizedCategory] = [];
            }
            groupedData[normalizedCategory].push(faq);
        });

        // Filter out empty categories if needed, or keep them to verify against predefined
        const activeCategories = PREDEFINED_CATEGORIES.filter(cat => groupedData[cat]?.length > 0);

        return {
            faqData: groupedData,
            categories: PREDEFINED_CATEGORIES
        };
    }, [faqsResponse]);

    // Effect to set active tab if not set
    React.useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeTab)) {
            setActiveTab("All");
        }
    }, [categories, activeTab]);

    const visibleFaqs =
        activeTab === "All" ? faqData?.All || [] : faqData[activeTab] || [];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="py-12">
            <div className="flex justify-center">
                <SectionHead
                    title="Frequently Asked Questions"
                    description="Each package includes personalized consultation and revisions to guarantee your satisfaction."
                    Status="FAQ"
                    statusStyle="bg-[#E6F8F3] text-[#00A47E] border border-[#00A47E]"
                />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 my-10 max-w-5xl mx-auto">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setActiveTab(category);
                            setOpenIndex(0); // Reset accordion on tab change
                        }}
                        className={`px-6 py-2 rounded-full border transition-all duration-300 font-medium ${activeTab === category
                            ? "bg-[#FCD34D] border-[#FCD34D] text-gray-900"
                            : "bg-white border-[#FCD34D] text-gray-700 hover:bg-yellow-50"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Accordion */}
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {visibleFaqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg transition-all duration-300 overflow-hidden ${openIndex === index
                            ? "border-yellow-400 shadow-sm bg-white"
                            : "border-gray-100 bg-white"
                            }`}
                    >
                        <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                        >
                            <span
                                className={`text-lg font-medium ${openIndex === index ? "text-gray-900" : "text-gray-700"
                                    }`}
                            >
                                {faq.question}
                            </span>
                            <span
                                className={`transform transition-transform duration-300 text-gray-400 ${openIndex === index ? "rotate-180" : ""
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </span>
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out ${openIndex === index
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
                {visibleFaqs.length === 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
                        Not found
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaqTabs;
