"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import { apiPost } from "@/lib/api";

function ScoreCard({ analysis, isWinner }) {
    if (!analysis) return null;

    // Handle different analysis structures if keys differ from mock
    // Assuming analysis has { totalScore, breakdown: [{label, score, max}] }
    // passing the raw analysis object for now, adapting if needed.
    
    // Construct breakdown if not present but individual scores are
    const totalScore = analysis.totalScore || analysis.score || 0;
    const breakdown = analysis.breakdown || [
        { label: "Content", score: analysis.contentScore || 0, max: 10 },
        { label: "Relevance", score: analysis.relevanceScore || 0, max: 10 },
        { label: "Structure", score: analysis.structureScore || 0, max: 10 },
        { label: "Grammar", score: analysis.grammarScore || 0, max: 10 },
    ];

    return (
        <div className={`p-4 rounded-xl mb-4 ${isWinner ? 'bg-[#FFF9E5] border border-[#FFCA42]' : 'bg-[#F8F9FA] border border-[#E2E4E9]'}`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-[#6D6E73] font-medium uppercase tracking-wide">Overall Score</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${isWinner ? 'text-[#0C0C0D]' : 'text-[#6D6E73]'}`}>{totalScore}</span>
                        <span className="text-sm text-[#9CA3AF]">/100</span>
                    </div>
                </div>
                {isWinner && (
                    <div className="bg-[#FFCA42] text-[#0C0C0D] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Icon icon="lucide:trophy" width="14" height="14" />
                        Winning
                    </div>
                )}
            </div>

            <div className="space-y-2">
                {breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-[#4A4B57]">{item.label}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[#E2E4E9] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isWinner ? 'bg-[#FFCA42]' : 'bg-[#9CA3AF]'}`}
                                    style={{ width: `${(item.score / (item.max || 10)) * 100}%` }}
                                ></div>
                            </div>
                            <span className="font-medium text-[#0C0C0D] w-6 text-right">{item.score}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);

    useEffect(() => {
        const fetchComparison = async () => {
            const essayAId = searchParams.get("original");
            const essayBId = searchParams.get("target");

            if (!essayAId || !essayBId) {
                setError("Missing essay IDs for comparison.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await apiPost('/essay-comparison/compare', {
                    essayAId,
                    essayBId
                });

                if (response.success) {
                    setComparisonData(response.data);
                } else {
                    setError(response.message || "Failed to compare essays.");
                }
            } catch (err) {
                console.error("Comparison API Error:", err);
                setError("An error occurred while comparing essays.");
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCA42] mb-4"></div>
                <p className="text-gray-500">Analyzing essays...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Icon icon="mdi:alert-circle" className="text-red-500 mb-2" width={48} height={48} />
                <p className="text-gray-800 font-semibold mb-1">Comparison Failed</p>
                <p className="text-gray-500">{error}</p>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!comparisonData) return null;

    // Destructure data assuming response keys. 
    // Adapting to probable structure: { essayA, essayB } where each has { title, content, scoreObject }
    // Or response might be { original: {...}, target: {...} }
    // Let's safe guard access.
    
    // Note: User request example body: "essayAId", "essayBId"
    // Response likely mirrors this naming or uses generic "essay1", "essay2" OR "original", "target" if the backend is smart.
    // Based on "Compare" context, usually it returns the two objects comparison.
    // Let's assume response.data has keys that contain the essay details.
    
    const essayA = comparisonData.essayA || comparisonData.original || comparisonData.essay1 || {};
    const essayB = comparisonData.essayB || comparisonData.target || comparisonData.essay2 || {};
    
    // Fallback info if API doesn't return full essay objects (maybe just comparison scores)
    const essayATitle = essayA.title || "Original Essay";
    const essayBTitle = essayB.title || "Target Essay";
    const essayAContent = essayA.content || essayA.essay || essayA.contentFinal || "Content not available";
    const essayBContent = essayB.content || essayB.essay || essayB.contentFinal || "Content not available";
    
    // Analysis/Score objects
    const analysisA = essayA.analysis || essayA.score || essayA; 
    const analysisB = essayB.analysis || essayB.score || essayB;

    const scoreA = analysisA.totalScore || analysisA.score || 0;
    const scoreB = analysisB.totalScore || analysisB.score || 0;
    
    const isOriginalWinner = scoreA >= scoreB;

    const handleSelect = (essay) => {
        // Update Application Tracker if active
        // NOTE: This logic relies on title/content being present
        const activeId = localStorage.getItem("current_active_scholarship");
        if (activeId) {
            const currentData = JSON.parse(localStorage.getItem("application_tracker_data") || "[]");
            const appIndex = currentData.findIndex(item => item.id === activeId);

            if (appIndex >= 0) {
                currentData[appIndex] = {
                    ...currentData[appIndex],
                    status: "Done",
                    essayTitle: essay.title || "Selected Essay",
                    essayContent: essay.content || essay.essay || essay.contentFinal
                };
                localStorage.setItem("application_tracker_data", JSON.stringify(currentData));
                localStorage.removeItem("current_active_scholarship");
            }
        }

        router.push('/dashboard/student/application_tracker');
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0C0C0D]">Essay Comparison</h1>
                    <p className="text-[#6D6E73] mt-1">Comparing essays</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6D6E73] hover:text-[#0C0C0D] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                >
                    <Icon icon="lucide:arrow-left" width="18" height="18" />
                    Back to List
                </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                {/* Original Essay (Essay A) */}
                <div className={`bg-white border-2 rounded-xl flex flex-col h-full overflow-hidden transition-all ${isOriginalWinner ? 'border-[#E2E4E9] shadow-sm' : 'border-[#E2E4E9] opacity-90'}`}>
                    <div className="bg-[#F8F9FA] p-4 border-b border-[#E2E4E9] sticky top-0 z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#EBF0FF] text-[#5069E5] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Version A</span>
                            <span className="text-xs text-[#6D6E73]">{essayA.date ? new Date(essayA.date).toLocaleDateString() : ""}</span>
                        </div>
                        <h2 className="text-lg font-bold text-[#0C0C0D] line-clamp-1 mb-4">{essayATitle}</h2>

                        <ScoreCard analysis={analysisA} isWinner={isOriginalWinner} />
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-white">
                        <div className="prose prose-sm max-w-none text-[#4A4B57]">
                            <div className="whitespace-pre-wrap">{essayAContent}</div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#E2E4E9] bg-[#F8F9FA]">
                        <button
                            onClick={() => handleSelect(essayA)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E2E4E9] text-[#0C0C0D] font-medium rounded-lg hover:bg-[#F0F0F2] hover:border-[#CED2E5] transition-all"
                        >
                            Select this Essay
                        </button>
                    </div>
                </div>

                {/* Target Essay (Essay B) */}
                <div className={`bg-white border-2 rounded-xl flex flex-col h-full overflow-hidden transition-all ${!isOriginalWinner ? 'border-[#FFCA42] shadow-xl shadow-yellow-500/10 scale-[1.01]' : 'border-[#E2E4E9]'}`}>
                    <div className={`${!isOriginalWinner ? 'bg-[#FFF9E5]' : 'bg-[#F8F9FA]'} p-4 border-b border-[#E2E4E9] sticky top-0 z-10`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#FFCA42] text-[#0C0C0D] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Version B</span>
                            {/* <span className="text-xs text-[#6D6E73]">{essayB.date}</span> */}
                        </div>
                        <h2 className="text-lg font-bold text-[#0C0C0D] line-clamp-1 mb-4">{essayBTitle}</h2>

                        <ScoreCard analysis={analysisB} isWinner={!isOriginalWinner} />
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-white">
                        <div className="prose prose-sm max-w-none text-[#4A4B57]">
                            <div className="whitespace-pre-wrap">{essayBContent}</div>
                        </div>
                    </div>

                    <div className={`p-4 border-t border-[#E2E4E9] ${!isOriginalWinner ? 'bg-[#FFF9E5]' : 'bg-[#F8F9FA]'}`}>
                        <button
                            onClick={() => handleSelect(essayB)}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all ${!isOriginalWinner
                                ? 'bg-[#FFCA42] text-[#0C0C0D] hover:bg-[#EDB91C] shadow-sm'
                                : 'bg-white border border-[#E2E4E9] text-[#0C0C0D] hover:bg-[#F0F0F2]'}`}
                        >
                            Select this Essay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CompareEssayPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#FCFCFD]">
            <Suspense fallback={<div>Loading...</div>}>
                <CompareContent />
            </Suspense>
        </div>
    );
}
