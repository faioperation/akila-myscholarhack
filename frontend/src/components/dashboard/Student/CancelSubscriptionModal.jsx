"use client";
import { Icon } from "@iconify/react";

export default function CancelSubscriptionModal({ isOpen, onClose, onConfirm, isProcessing }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-zoomIn">
                
                {/* Header / Icon */}
                <div className="bg-red-50 p-6 flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:alert-circle-outline" className="text-red-600" width={32} height={32} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Cancel Subscription?
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                            disabled={isProcessing}
                        >
                            Keep Subscription
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Icon icon="svg-spinners:3-dots-fade" width="20" height="20" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Cancellation"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
