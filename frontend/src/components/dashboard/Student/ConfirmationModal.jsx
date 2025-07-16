"use client";
import { Icon } from "@iconify/react";

export default function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    isProcessing = false, 
    icon = "mdi:alert-circle-outline", 
    iconColor = "text-red-600", 
    bgIconColor = "bg-red-100",
    confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
    singleButton = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-zoomIn z-10">
                
                {/* Header / Icon */}
                <div className={`bg-gray-50 p-6 flex justify-center border-b border-gray-100`}>
                    <div className={`w-16 h-16 ${bgIconColor} rounded-full flex items-center justify-center`}>
                        <Icon icon={icon} className={iconColor} width={32} height={32} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!singleButton && (
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors w-full sm:w-auto"
                                disabled={isProcessing}
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`px-6 py-2.5 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm ${confirmButtonClass}`}
                        >
                            {isProcessing ? (
                                <>
                                    <Icon icon="svg-spinners:3-dots-fade" width="20" height="20" />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
