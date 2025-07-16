"use client";
import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiPatch } from "@/lib/api";
import ConfirmationModal from "@/components/dashboard/Student/ConfirmationModal";

export default function EditEssay() {
    const router = useRouter();
    const [essayData, setEssayData] = useState({
        essay: "",
        subject: "",
        id: null
    });
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        isSuccess: true,
        bgIconColor: "bg-green-100",
        icon: "mdi:check",
        iconColor: "text-green-600",
        confirmButtonClass: "bg-green-600 hover:bg-green-700 text-white"
    });

    const showModal = ({ title, message, isSuccess = true }) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            isSuccess,
            bgIconColor: isSuccess ? "bg-green-100" : "bg-red-100",
            icon: isSuccess ? "mdi:check" : "mdi:alert-circle-outline",
            iconColor: isSuccess ? "text-green-600" : "text-red-600",
            confirmButtonClass: isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
        });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const storedData = localStorage.getItem("essay_to_edit");
        if (storedData) {
            setEssayData(JSON.parse(storedData));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEssayData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
          
            if (essayData.id) {
                 const response = await apiPatch(`/generate-essay/update/${essayData.id}`, {
                    essay: essayData.essay,
                    subject: essayData.subject
                });
                
                if (!response.success && response.message) {
                     console.warn("API update failed:", response.message);
                }
            }

            // Always update local storage for immediate UI reflection upon return
            localStorage.setItem("essay_to_edit", JSON.stringify(essayData));
            
            // Optionally, we could set a flag "essay_edited" to true
            localStorage.setItem("essay_edited", "true");

            router.back();
        } catch (error) {
            console.error("Failed to save essay:", error);
            showModal({ title: "Error", message: "Failed to save changes.", isSuccess: false });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!essayData.id) {
            showModal({ title: "Cannot Update", message: "Essay must be saved first (ID required) to update/regenerate.", isSuccess: false });
            return;
        }

        setLoading(true);
        try {
            const response = await apiPatch(`/generate-essay/update/${essayData.id}`, {
                contentFinal: essayData.essay // User requested sending contentFinal
            });

            if (response.success && response.data) {
                // Determine new content from response
                // Logic similar to initial response parsing
                const newContent = response.data.contentFinal || response.data.essay || response.data;
                
                if (newContent && typeof newContent === 'string') {
                    setEssayData(prev => ({ ...prev, essay: newContent }));
                    // Update local storage too so it persists on reload
                    localStorage.setItem("essay_to_edit", JSON.stringify({ ...essayData, essay: newContent }));
                    showModal({ title: "Success", message: "Essay updated successfully!", isSuccess: true });
                } else {
                    console.warn("Unexpected update response:", response);
                    showModal({ title: "Update Incomplete", message: "Update successful but no new content returned.", isSuccess: false });
                }
            } else {
                 showModal({ title: "Error", message: response.message || "Failed to update essay.", isSuccess: false });
            }
        } catch (error) {
            console.error("Failed to update essay:", error);
            showModal({ title: "Error", message: "Failed to update essay.", isSuccess: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-[#2D3748]">Edit Essay</h1>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8 space-y-6">
                        {/* Update Essay Button Section */}
                        <div className="flex justify-end mb-4">
                             <button
                                onClick={handleUpdate}
                                disabled={loading || !essayData.id}
                                className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title={!essayData.id ? "Save first to enable updates" : "Update and regenerate content"}
                            >
                                {loading && <Icon icon="mdi:loading" className="animate-spin" />}
                                <Icon icon="mdi:refresh" width={20} height={20} />
                                Update Essay
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={essayData.subject || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F6C844] focus:ring-2 focus:ring-[#F6C844]/20 outline-none transition-all bg-gray-50 text-[#2D3748] font-semibold text-lg placeholder-gray-400"
                                placeholder="Essay Subject"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Content
                            </label>
                            <textarea
                                name="essay"
                                value={essayData.essay || ""}
                                onChange={handleChange}
                                className="w-full h-[60vh] px-6 py-6 rounded-xl border border-gray-200 focus:border-[#F6C844] focus:ring-2 focus:ring-[#F6C844]/20 outline-none transition-all resize-none bg-gray-50 text-[#2D3748] text-base leading-relaxed font-normal placeholder-gray-400"
                                placeholder="Start writing your essay..."
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Success/Error Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={()=> redirect("/dashboard/student/view_essay")} // Redirect to essays list after confirmation
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText="OK"
                singleButton={true}
                icon={modalConfig.icon}
                iconColor={modalConfig.iconColor}
                bgIconColor={modalConfig.bgIconColor}
                confirmButtonClass={modalConfig.confirmButtonClass}
                
            />
        </div>
    );
}
