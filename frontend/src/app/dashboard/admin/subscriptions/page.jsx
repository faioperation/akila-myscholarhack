"use client";
import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete, apiPost } from "@/lib/api";
import Loading from "@/components/Loading/Loading";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import toast from "react-hot-toast";

export default function Subscriptions() {
    const queryClient = useQueryClient();
    const [isYearly, setIsYearly] = useState(false);

    const { data: plansResponse, isLoading, error: fetchError } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            try {
                const response = await apiGet("/admin/plans");
                
                return response;
            } catch (error) {
                
                throw error;
            }
        },
    });

    // Extract plans from response
    const plans = useMemo(() => {
        if (!plansResponse) return [];

        // Handle different response structures
        if (Array.isArray(plansResponse)) {
            return plansResponse;
        } else if (plansResponse?.data) {
            if (Array.isArray(plansResponse.data)) {
                return plansResponse.data;
            } else if (plansResponse.data.plans && Array.isArray(plansResponse.data.plans)) {
                return plansResponse.data.plans;
            }
        }

        return [];
    }, [plansResponse]);

    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Edit/Create Form State
    const [editForm, setEditForm] = useState({
        planType: "",
        monthlyPrice: "",
        yearlyPrice: "",
        description: "",
        features: "",
        buttonText: "",
    });

    // Mutations
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }) => {
            return apiPatch(`/admin/plans/toggle/${id}`, { isActive: !isActive });
        },
        onSuccess: () => {
            toast.success("Plan status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
        onError: (error) => {
            
            toast.error(error?.response?.data?.message || error?.message || "Failed to update plan status");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return apiDelete(`/admin/plans/${id}`);
        },
        onSuccess: () => {
            toast.success("Plan deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete plan");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            return apiPatch(`/admin/plans/${id}`, payload);
        },
        onSuccess: () => {
            toast.success("Plan updated successfully");
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update plan");
        },
    });

    const createMutation = useMutation({
        mutationFn: async (payload) => {
            return apiPost("/admin/plans", payload);
        },


        onSuccess: () => {
            toast.success("Plan created successfully");
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to create plan");
        },
    });

    if (isLoading) return <Loading />;

    // Handlers
    const toggleStatus = async (plan) => {
        if (!plan.id) {
            toast.error("Invalid plan data");
            return;
        }
        toggleStatusMutation.mutate({ id: plan.id, isActive: plan.isActive });
    };

    const openDeleteConfirm = (plan) => {
        setSelectedPlan(plan);
        setShowDeleteConfirm(true);
    };

    const closeDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setSelectedPlan(null);
    };

    const confirmDelete = async () => {
        if (!selectedPlan?.id) {
            toast.error("Invalid plan data");
            return;
        }

        setIsDeleting(true);
        try {
            await deleteMutation.mutateAsync(selectedPlan.id);
            closeDeleteConfirm();
        } catch (error) {
            // Error handled by mutation
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (plan) => {
        setSelectedPlan(plan);
        setEditForm({
            planType: plan.planType || "",
            monthlyPrice: plan.monthlyPrice || "",
            yearlyPrice: plan.yearlyPrice || "",
            description: plan.description || "",
            features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
            buttonText: plan.buttonText || "",
        });
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        setSelectedPlan(null);
        setEditForm({
            name: "",
            monthlyPrice: "",
            yearlyPrice: "",
            description: "",
            features: "",
            buttonText: "",
        });
        setShowCreateModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedPlan(null);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setSelectedPlan(null);
    };

    const savePlan = async () => {
        if (!editForm.planType || !editForm.monthlyPrice || !editForm.yearlyPrice) {
            toast.error("Please fill in all required fields (Name, Monthly Price, Yearly Price)");
            return;
        }

        const updatedFeatures = editForm.features
            .split("\n")
            .map(f => f.trim())
            .filter(f => f !== "");

        const payload = {
            planType: editForm.planType.trim(),
            monthlyPrice: parseFloat(editForm.monthlyPrice),
            yearlyPrice: parseFloat(editForm.yearlyPrice),
            description: editForm.description.trim() || "",
            features: updatedFeatures,
            buttonText: editForm.buttonText.trim() || "",
        };

        setIsUpdating(true);
        try {
            await updateMutation.mutateAsync({ id: selectedPlan.id, payload });
            closeEditModal();
        } catch (error) {
            // Error handled by mutation
        } finally {
            setIsUpdating(false);
        }
    };

    const createPlan = async () => {
        if (!editForm.planType || !editForm.monthlyPrice || !editForm.yearlyPrice) {
            toast.error("Please fill in all required fields (Name, Monthly Price, Yearly Price)");
            return;
        }

        const features = editForm.features
            .split("\n")
            .map(f => f.trim())
            .filter(f => f !== "");

        const payload = {
            planType: editForm.planType.trim(),
            monthlyPrice: parseFloat(editForm.monthlyPrice),
            yearlyPrice: parseFloat(editForm.yearlyPrice),
            description: editForm.description.trim() || "",
            features: features,
            buttonText: editForm.buttonText.trim() || "Get Started",
        };

        setIsCreating(true);
        try {
            await createMutation.mutateAsync(payload);
            closeCreateModal();
        } catch (error) {
            // Error handled by mutation
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
                    <p className="text-gray-500 mt-1">Manage pricing packages and plans.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <div className="bg-gray-100 p-1 rounded-full flex items-center">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${!isYearly ? "bg-[#FFCA42] shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${isYearly ? "bg-[#FFCA42] shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Yearly
                        </button>
                    </div>

                    {/* Create Plan Button */}
                    {/* <PrimaryBtn title={"Create Plan"} style={"rounded-full"} hendleClick={openCreateModal} /> */}
                </div>
            </div>

            {fetchError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    Error loading plans: {fetchError?.response?.data?.message || fetchError?.message || "Unknown error"}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {plans.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No plans available. Create your first plan!
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full ${!plan.isActive ? "opacity-60 grayscale-[0.8]" : "shadow-lg hover:shadow-xl border-gray-100"
                                } ${plan.highlight ? "ring-2 ring-[#FFCA42] ring-offset-2" : ""}`}
                            style={{
                                background: !plan.isActive ? "#f9fafb" : "white"
                            }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    onClick={() => toggleStatus(plan)}
                                    className={`cursor-pointer w-10 h-6 rounded-full p-1 transition-colors duration-300 ${plan.isActive ? "bg-green-500" : "bg-gray-300"}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${plan.isActive ? "translate-x-4" : "translate-x-0"}`} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(plan)} className="p-2 text-gray-400 hover:text-[#FFCA42] hover:bg-yellow-50 rounded-full transition-colors cursor-pointer">
                                        <Icon icon="lucide:edit-2" width="18" height="18" />
                                    </button>

                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.planType}</h3>
                            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-gray-900">
                                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                </span>
                                <span className="text-gray-500 text-sm">/{isYearly ? "year" : "mo"}</span>
                            </div>

                            <div className="flex-1 space-y-3 mb-8">
                                {Array.isArray(plan.features) && plan.features.length > 0 ? (
                                    plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                            <Icon icon="mdi:check-circle" className="text-green-500 mt-0.5 shrink-0" width="16" height="16" />
                                            <span>{feature}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400 italic">No features listed</div>
                                )}
                            </div>


                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Plan</h2>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <Icon icon="lucide:x" width="24" height="24" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.planType}
                                    onChange={(e) => setEditForm({ ...editForm, planType: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Price</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                        value={editForm.monthlyPrice}
                                        onChange={(e) => setEditForm({ ...editForm, monthlyPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Yearly Price</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                        value={editForm.yearlyPrice}
                                        onChange={(e) => setEditForm({ ...editForm, yearlyPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (One per line)</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors min-h-[150px]"
                                    value={editForm.features}
                                    onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.buttonText}
                                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                                    placeholder="e.g., Get Started"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePlan}
                                disabled={isUpdating}
                                className="flex-1 px-6 py-3 bg-[#FFCA42] text-gray-900 font-semibold rounded-full hover:bg-[#ffc942c2] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                            <Icon icon="fluent:delete-24-regular" width="24" height="24" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Plan?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to remove <span className="font-semibold text-gray-700">{selectedPlan.name}</span>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={closeDeleteConfirm}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Plan Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create Plan</h2>
                            <button
                                onClick={closeCreateModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <Icon icon="lucide:x" width="24" height="24" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name *</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.planType}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="e.g., Essay Hack"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                        value={editForm.monthlyPrice}
                                        onChange={(e) => setEditForm({ ...editForm, monthlyPrice: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Yearly Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                        value={editForm.yearlyPrice}
                                        onChange={(e) => setEditForm({ ...editForm, yearlyPrice: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Plan description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (One per line)</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors min-h-[150px]"
                                    value={editForm.features}
                                    onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                                    value={editForm.buttonText}
                                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                                    placeholder="e.g., Get Started"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={closeCreateModal}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createPlan}
                                disabled={isCreating}
                                className="flex-1 px-6 py-3 bg-[#FFCA42] text-gray-900 font-semibold rounded-full hover:bg-[#ffc942c2] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? "Creating..." : "Create Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
