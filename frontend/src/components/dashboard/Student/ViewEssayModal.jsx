import { Icon } from "@iconify/react";

export default function ViewEssayModal({ isOpen, onClose, essay, onCompare, onSelect }) {
    if (!isOpen || !essay) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#F0F0F2]">
                    <div>
                        <h2 className="text-xl font-bold text-[#0C0C0D]">{essay.title}</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-[#6D6E73]">
                            <span className="bg-[#F8F9FA] px-2 py-0.5 rounded text-[#FFCA42] font-medium">
                                {essay.subject}
                            </span>
                            <span>{essay.date}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#6D6E73] hover:text-[#0C0C0D] p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
                    >
                        <Icon icon="lucide:x" width="24" height="24" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-sm max-w-none text-[#4A4B57] leading-relaxed">
                        {/* Using a placeholder text if full content isn't in the object, or rendering passed content */}
                        {essay.content ? (
                            <div className="whitespace-pre-wrap">{essay.content}</div>
                        ) : (
                            <p className="italic text-[#9ca3af]">
                                [Essay content would be displayed here. Since this is dummy data, imagine a well-written essay about {essay.title} in the field of {essay.subject}.]
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#F0F0F2] flex justify-end gap-3 bg-[#FCFCFD] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#6D6E73] hover:bg-[#F0F0F2] rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onSelect(essay)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0C0C0D] bg-white border border-[#FFCA42] hover:bg-[#FFF9E5] rounded-lg transition-all"
                    >
                        <Icon icon="lucide:check" width="18" height="18" />
                        Select This Essay
                    </button>
                    <button
                        onClick={onCompare}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0C0C0D] bg-[#FFCA42] hover:bg-[#EDB91C] rounded-lg shadow-sm transition-all hover:shadow transform active:scale-95"
                    >
                        <Icon icon="lucide:git-compare" width="18" height="18" />
                        Compare
                    </button>
                </div>
            </div>
        </div>
    );
}
