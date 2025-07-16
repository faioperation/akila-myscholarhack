"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { apiPatch } from "@/lib/api"; // Ensure apiPatch matches your apiService export
import toast from "react-hot-toast";

export default function EditEssayModal({
    isOpen,
    essay,
    onClose,
    onUpdate
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (essay && isOpen) {
            setTitle(essay.title || "");
            // Handle all possible content field names from API
            const essayContent = essay.contentFinal || essay.content || essay.essay || "";
            setContent(essayContent);
            // Debug log to see what we're receiving
            
        } else if (!isOpen) {
            // Reset when modal closes
            setTitle("");
            setContent("");
        }
    }, [essay, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await apiPatch(`/generate-essay/update/${essay.id}`, {
                title,
                contentFinal: content, // Payload usually expects 'essay' or 'content', checking context
            });
            
            if (response.success) {
               toast.success("Essay updated successfully");
               onClose();
               
            } else {
                toast.error(response.message || "Failed to update essay");
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update essay. " + (error.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-[#2D3748]">Edit Essay</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <Icon icon="mdi:close" width={24} height={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F6C844] focus:ring-2 focus:ring-[#F6C844]/20 outline-none transition-all bg-white"
                            placeholder="Essay Title"
                        />
                    </div>
                    
                    <div className="flex-1 h-full min-h-[400px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[400px] px-4 py-4 rounded-xl border border-gray-200 focus:border-[#F6C844] focus:ring-2 focus:ring-[#F6C844]/20 outline-none transition-all resize-y bg-white font-mono text-sm leading-relaxed"
                            placeholder="Write your essay here..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-200 px-8 py-5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-full bg-[#F6C844] text-[#2D3748] font-semibold hover:bg-[#EDB91C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Icon icon="mdi:loading" className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
