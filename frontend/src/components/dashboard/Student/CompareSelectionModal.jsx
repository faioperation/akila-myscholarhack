import { Icon } from "@iconify/react";
import { useState } from "react";

export default function CompareSelectionModal({ isOpen, onClose, originalEssay, allEssays, onConfirmSelection }) {
    const [selectedId, setSelectedId] = useState(null);

    if (!isOpen || !originalEssay) return null;

    // Filter essays: same subject, excluding the current one
    const compatibleEssays = allEssays.filter(
        (e) => e.subject === originalEssay.subject && e.id !== originalEssay.id
    );

    const handleConfirm = () => {
        if (selectedId) {
            const selectedEssay = allEssays.find(e => e.id === selectedId);
            onConfirmSelection(selectedEssay);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#F0F0F2]">
                    <h2 className="text-xl font-bold text-[#0C0C0D]">Compare Essay</h2>
                    <p className="text-sm text-[#6D6E73] mt-1">
                        Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-sm font-semibold text-[#0C0C0D] mb-3">Select an essay to compare</h3>

                    {compatibleEssays.length > 0 ? (
                        <div className="space-y-3">
                            {compatibleEssays.map((essay) => (
                                <div
                                    key={essay.id}
                                    onClick={() => setSelectedId(essay.id)}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedId === essay.id
                                        ? "border-[#FFCA42] bg-[#FFF9E5] ring-1 ring-[#FFCA42]"
                                        : "border-[#E2E4E9] hover:border-[#CED2E5] hover:bg-[#F8F9FA]"
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-[#0C0C0D] line-clamp-1">{essay.title}</h4>
                                            <p className="text-xs text-[#6D6E73] mt-1">{essay.date}</p>
                                        </div>
                                        {selectedId === essay.id && (
                                            <div className="bg-[#FFCA42] text-[#0C0C0D] p-1 rounded-full">
                                                <Icon icon="lucide:check" width="12" height="12" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-[#F8F9FA] rounded-xl border border-dashed border-[#E2E4E9]">
                            <Icon icon="lucide:files" className="w-8 h-8 mx-auto text-[#9CA3AF] mb-2" />
                            <p className="text-sm text-[#6D6E73]">No other essays found for Subject: <strong>{originalEssay.subject}</strong></p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#F0F0F2] flex justify-end gap-3 bg-[#FCFCFD] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#6D6E73] hover:bg-[#F0F0F2] rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedId}
                        className="px-5 py-2.5 text-sm font-medium text-[#0C0C0D] bg-[#FFCA42] hover:bg-[#EDB91C] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Compare Now
                    </button>
                </div>
            </div>
        </div>
    );
}
