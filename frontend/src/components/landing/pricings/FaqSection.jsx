"use client";
import React, { useState } from "react";
import StatusBtn from "../statusBtn";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const { data: faqsResponse } = useQuery({
        queryKey: ["faqs"],
        queryFn: async () => {
            try {
                const response = await apiGet("/admin/faqs/public", {}, { _skipAuthRedirect: true });
                return response;
            } catch (error) {
                console.error("Failed to fetch FAQs:", error);
                return [];
            }
        },
    });

    const faqs = React.useMemo(() => {
        if (!faqsResponse) return [];

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

        // Filter for Pricing category (handle both UPPERCASE and Title Case for compatibility)
        return faqsList.filter(faq => 
            faq.category === "PRICING" || faq.category === "Pricing"
        );
    }, [faqsResponse]);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-10 lg:my-20">
            {/* Left Column: Header */}
            <div className="lg:col-span-5">
                <div className="flex justify-start mb-4">
                    <StatusBtn title="FAQ" style="bg-[#E6F8F3] text-[#00A47E] border border-[#00A47E]" />
                </div>
                <h2 className="text-5xl font-semibold text-gray-800 mb-6 leading-tight">
                    Frequently Asked Questions
                </h2>
                      </div>

            {/* Right Column: Accordion */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                {faqs.map((faq, index) => (
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
            </div>
        </div>
    );
};

export default FaqSection;
