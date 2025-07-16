"use client";
import { Icon } from "@iconify/react";
import Table from "@/components/dashboard/Table";
import InvoiceModal from "@/components/dashboard/Student/InvoiceModal";
import CancelSubscriptionModal from "@/components/dashboard/Student/CancelSubscriptionModal";
import { useState, useEffect } from "react";
import { getStudentSubscriptions, apiPost, apiPatch } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SubscriptionsPlan() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Filter to get the current active/trail subscription for the "Your Plan" section
    const currentSubscription = subscriptions.find(s =>
        s.subscriptionStatus === "ACTIVE" || s.subscriptionStatus === "TRAIL"
    );

    const currentPlan = currentSubscription ? {
        name: currentSubscription.subscription?.plan?.name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Subscription Plan",
        description: currentSubscription.subscription?.plan?.description || "Perfect for students looking for short-term access to premium scholarship matching and essay assistance tools.",
        price: currentSubscription.subscription?.plan?.monthlyPrice || "0.00",
        totalPrice: currentSubscription.subscription?.plan?.monthlyPrice || "0.00", // Assuming single month for now or simplify
        duration: "1 month",
        features: currentSubscription.subscription?.plan?.features || [
            "AI “Voice” Matching",
            "Unlimited Revisions",
            "Application Trackers",
            "Deadline reminders",
            "Unlimited Essays/Month"
        ]
    } : {
        name: "No Active Plan",
        description: "You don't have an active subscription plan. Upgrade now to unlock all features.",
        price: "0.00",
        totalPrice: "0.00",
        duration: "N/A",
        features: []
    };

    useEffect(() => {
        let isMounted = true;

        const fetchSubscriptions = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await getStudentSubscriptions();

                if (!isMounted) return;
                if (response.success) {

                    setSubscriptions(response.data || []);
                } else {
                    setError(response.message || "Failed to load subscriptions");
                }
            } catch (err) {
                if (!isMounted) return;
                setError(err?.message || "Failed to load subscriptions. Try again later.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchSubscriptions();

        return () => {
            isMounted = false;
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCancelClick = () => {
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!currentSubscription?.id) return;
        setIsCancelling(true);
        try {
            await apiPatch(`/subscription-student/cancel/${currentSubscription.id}`);
            toast.success("Subscription cancelled successfully");
            setIsCancelModalOpen(false);

            // Refresh subscriptions
            const response = await getStudentSubscriptions();
            if (response.success) {
                setSubscriptions(response.data || []);
            }
        } catch (error) {
            toast.error(error?.message || "Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    const TableHeads = [
        {
            Title: "Subscription Plan",
            key: "plan",
            width: "25%",
            render: (row) => (
                <span className="font-medium text-gray-900">
                    {row.subscription?.plan?.name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown Plan"}
                </span>
            )
        },
        {
            Title: "Start",
            key: "start",
            width: "20%",
            render: (row) => formatDate(row.purchaseDate)
        },
        {
            Title: "End",
            key: "end",
            width: "20%",
            render: (row) => formatDate(row.endDate)
        },
        {
            Title: "Status",
            key: "status",
            width: "15%",
            render: (row) => (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${row.subscriptionStatus === 'ACTIVE' || row.subscriptionStatus === 'TRAIL'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {row.subscriptionStatus}
                </span>
            )
        },
        {
            Title: "Invoice",
            key: "invoice",
            width: "20%",
            render: (row) => (
                <button
                    onClick={() => setSelectedInvoice(row)}
                    className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                    View
                </button>
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Subscriptions Plan
                </h1>
                <p className="text-base text-gray-600">
                    Manage your subscription and billing history.
                </p>
            </div>

            {/* Section 1: Your Plan */}
            <div className="mb-12 w-full lg:w-[760px] mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your Plan</h2>
                </div>

                {/* Plan Card */}
                <div className={`relative bg-white border-2 ${currentSubscription ? 'border-[#F6C844]' : 'border-gray-200'} rounded-2xl p-6 shadow-sm mb-6`}>
                    {/* Active Badge */}
                    {currentSubscription && (
                        <div className="absolute top-0 right-6">
                            <p className="bg-[#F6C844] text-gray-900 text-lg font-semibold px-4 py-2 rounded-b-xl">
                                {currentSubscription.subscriptionStatus === 'TRAIL' ? 'Trial Plan' : 'Active Plan'}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-0 lg:pr-24">
                        {/* Left Side - Plan Details */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {currentPlan.name}
                            </h3>
                        </div>

                        {/* Right Side - Pricing & Features */}
                        <div>
                            <div className="mb-4">
                                <p className="text-3xl font-bold text-gray-900">
                                    USD ${currentPlan.price}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {currentSubscription ? `Total for ${currentPlan.duration}: USD $${currentPlan.totalPrice}` : 'Please choose a plan to get started.'}
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2">
                                {currentPlan.features?.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Icon
                                            icon="mdi:check-circle"
                                            width={20}
                                            height={20}
                                            className="text-[#F6C844] mt-0.5 shrink-0"
                                        />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.push('/pricing')}
                        className="px-6 py-3 bg-[#F6C844] hover:bg-[#EDB91C] text-gray-900 font-semibold rounded-lg transition-colors"
                    >
                        {currentSubscription && 'Upgrade Plan'}
                    </button>
                    {currentSubscription && (
                        <button
                            onClick={handleCancelClick}
                            className="px-6 py-3 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Section 2: Previous Plan */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription History</h2>

                {/* Table Container */}
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-20 text-gray-500">Loading subscription history...</div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">{error}</div>
                    ) : subscriptions.length > 0 ? (
                        <Table TableHeads={TableHeads} TableRows={subscriptions} />
                    ) : (
                        <div className="text-center py-20 text-gray-500">No subscription history found.</div>
                    )}

                    <InvoiceModal
                        isOpen={!!selectedInvoice}
                        onClose={() => setSelectedInvoice(null)}
                        data={selectedInvoice}
                    />

                    <CancelSubscriptionModal
                        isOpen={isCancelModalOpen}
                        onClose={() => setIsCancelModalOpen(false)}
                        onConfirm={handleConfirmCancel}
                        isProcessing={isCancelling}
                    />
                </div>
            </div>
        </div>
    );
}
