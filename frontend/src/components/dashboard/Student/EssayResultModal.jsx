"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { apiPatch, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

export default function EssayResultModal({
    isOpen,
    essay,
    subject,
    essayId,
    onClose,
    onSave,
    onEdit,
    onRemove
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!essayId) {
            toast.error("Essay ID is missing");
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiPatch(`/generate-essay/save/${essayId}`, {
                status: "SAVED"
            });

            if (response?.success) {
                toast.success("Essay saved successfully");
                if (onSave) {
                    onSave();
                }
            } else {
                toast.error(response?.message || "Failed to save essay");
            }
        } catch (error) {
            const errorMessage = error?.data?.message || 
                               error?.response?.data?.message || 
                               error?.message || 
                               "Failed to save essay";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!essayId) {
            toast.error("Essay ID is missing");
            setShowDeleteConfirm(false);
            return;
        }

        setIsDeleting(true);
        try {
            const response = await apiDelete(`/generate-essay/delete/${essayId}`);

            if (response?.success) {
                toast.success("Essay deleted successfully");
                // Close confirmation modal first
                setShowDeleteConfirm(false);
                setIsDeleting(false);
                // Delay to ensure confirmation modal closes completely before closing parent modal
                setTimeout(() => {
                    if (onRemove) {
                        onRemove();
                    }
                    onClose();
                }, 300);
            } else {
                toast.error(response?.message || "Failed to delete essay");
                setIsDeleting(false);
            }
        } catch (error) {
            const errorMessage = error?.data?.message || 
                               error?.response?.data?.message || 
                               error?.message || 
                               "Failed to delete essay";
            toast.error(errorMessage);
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-fade-in flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[#2D3748]">Generated Essay</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <Icon icon="mdi:close" width={28} height={28} />
                    </button>
                </div>

                {/* Essay Content - Scrollable Area */}
                <div className="px-8 py-6 overflow-y-auto flex-grow bg-gray-50/50">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 min-h-[300px]">
                        {subject && (
                            <div className="mb-6 border-b border-gray-100 pb-4">
                                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Subject</p>
                                <h3 className="text-xl font-bold text-[#2D3748]">{subject}</h3>
                            </div>
                        )}
                        <div className="prose prose-lg max-w-none text-[#2D3748]">
                            {/* Render essay with basic markdown formatting */}
                            {(typeof essay === 'string' ? essay : String(essay || "")).split('\n').map((line, index) => {
                                if (line.startsWith('# ')) {
                                    return <h1 key={index} className="text-3xl font-bold text-[#2D3748] mb-4 mt-6 border-b pb-2">{line.substring(2)}</h1>;
                                } else if (line.startsWith('## ')) {
                                    return <h2 key={index} className="text-2xl font-semibold text-[#2D3748] mb-3 mt-5">{line.substring(3)}</h2>;
                                } else if (line.match(/^\d+\./)) {
                                    return <p key={index} className="text-[#4A5568] leading-relaxed mb-2 ml-4">{line}</p>;
                                } else if (line.trim() === '') {
                                    return <div key={index} className="h-4"></div>;
                                } else {
                                    // Handle bold text **text**
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <p key={index} className="text-[#4A5568] leading-relaxed mb-3 text-justify">
                                            {parts.map((part, i) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={i} className="font-semibold text-[#2D3748]">{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            })}
                                        </p>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="bg-white border-t border-gray-200 px-8 py-5 shrink-0">
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F6C844] to-[#EDB91C] text-[#2D3748] font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSaving ? (
                                <>
                                    <Icon icon="svg-spinners:3-dots-fade" width={20} height={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:content-save" width={20} height={20} />
                                    Save
                                </>
                            )}
                        </button>
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-[#2D3748] font-semibold rounded-full border-2 border-[#F6C844] hover:bg-[#FFF9E6] transform hover:scale-105 transition-all duration-200"
                        >
                            <Icon icon="mdi:pencil" width={20} height={20} />
                            Edit
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-red-600 font-semibold rounded-full border-2 border-red-500 hover:bg-red-50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <Icon icon="mdi:delete" width={20} height={20} />
                            Remove
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Essay?"
                message="Are you sure you want to delete this essay? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isProcessing={isDeleting}
                icon="mdi:delete-forever"
                iconColor="text-red-600"
                bgIconColor="bg-red-100"
                confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
            />
        </div>
    );
}
