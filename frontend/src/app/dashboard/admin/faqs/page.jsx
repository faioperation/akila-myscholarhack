"use client";
import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import Loading from "@/components/Loading/Loading";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";

const CATEGORY_UI_TO_API = {
  "Pricing": "PRICING",
  "Getting Started": "GETTING_STARTED",
  "How It Works": "HOW_IT_WORKS",
  "Privacy": "PRIVACY",
  "Scholarships": "SCHOLARSHIPS",
  "Technical Questions": "TECHNICAL",
  "Support": "SUPPORT",
  "Academic Integrity": "ACADEMIC_INTEGRITY"
};

const CATEGORY_API_TO_UI = {
  "PRICING": "Pricing",
  "GETTING_STARTED": "Getting Started",
  "HOW_IT_WORKS": "How It Works",
  "PRIVACY": "Privacy",
  "SCHOLARSHIPS": "Scholarships",
  "TECHNICAL": "Technical Questions",
  "SUPPORT": "Support",
  "ACADEMIC_INTEGRITY": "Academic Integrity"
};

export default function FAQs() {
  const queryClient = useQueryClient();
  const [openIndex, setOpenIndex] = useState(-1);

  const { data: faqsResponse, isLoading, error: fetchError } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      try {
        const response = await apiGet("/admin/faqs");
        
        return response;
      } catch (error) {
          
        throw error;
      }
    },
  });

  // Extract FAQs from response and group by category
  const { faqs, categories } = useMemo(() => {
    if (!faqsResponse) return { faqs: [], categories: [] };

    let faqsList = [];

    // Handle different response structures
    if (Array.isArray(faqsResponse)) {
      faqsList = faqsResponse;
    } else if (faqsResponse?.data) {
      if (Array.isArray(faqsResponse.data)) {
        faqsList = faqsResponse.data;
      } else if (faqsResponse.data.faqs && Array.isArray(faqsResponse.data.faqs)) {
        faqsList = faqsResponse.data.faqs;
      }
    }

    // Normalize FAQs categories from API format to UI format
    const normalizedFaqs = faqsList.map(faq => ({
      ...faq,
      category: CATEGORY_API_TO_UI[faq.category] || faq.category
    }));

    // Predefined categories as requested
    const PREDEFINED_CATEGORIES = [
      "Pricing",
      "Getting Started",
      "How It Works",
      "Privacy",
      "Scholarships",
      "Technical Questions",
      "Support",
      "Academic Integrity"
    ];

    return {
      faqs: normalizedFaqs,
      categories: PREDEFINED_CATEGORIES
    };
  }, [faqsResponse]);

  // Get active category (first category by default)
  const [activeTab, setActiveTab] = useState(categories[0] || "General");

  // Filter FAQs by active category
  const filteredFaqs = useMemo(() => {
    if (!activeTab) return faqs;
    return faqs.filter(faq => faq.category === activeTab);
  }, [faqs, activeTab]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      
      const response = await apiPost("/admin/faqs", payload);
      
      return response;
    },
    onSuccess: () => {
      toast.success("FAQ created successfully");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      
      // Handle error structure from apiClient interceptor (error.data) or axios (error.response.data)
      
      toast.error("Failed to create FAQ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      
      const response = await apiPut(`/admin/faqs/${id}`, payload);
      
      return response;
    },
    onSuccess: () => {
      toast.success("FAQ updated successfully");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      
      toast.error("Failed to update FAQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      
      const response = await apiDelete(`/admin/faqs/${id}`);
      
      return response;
    },
    onSuccess: () => {
      toast.success("FAQ deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => {
      
      toast.error("Failed to delete FAQ");
    },
  });

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const openEditModal = (e, faq) => {
    e.stopPropagation();
    setEditingFaq({ ...faq });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingFaq(null);
  };

  const saveFaq = async () => {
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        question: editingFaq.question.trim(),
        answer: editingFaq.answer.trim(),
        ...(editingFaq.category && { 
            category: CATEGORY_UI_TO_API[editingFaq.category] || editingFaq.category 
        }),
      };

      await updateMutation.mutateAsync({ id: editingFaq.id || editingFaq._id, payload });
      closeEditModal();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsUpdating(false);
    }
  };

  // Add FAQ Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: categories[0] || "",
    question: "",
    answer: ""
  });

  const handleAddFaq = () => {
    setNewFaq({
      category: categories[0] || "",
      question: "",
      answer: ""
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewFaq({ category: categories[0] || "", question: "", answer: "" });
  };

  const saveNewFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newFaq.category) {
      toast.error("Please select a category");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
        category: CATEGORY_UI_TO_API[newFaq.category] || newFaq.category || "GENERAL",
      };

      
      await createMutation.mutateAsync(payload);
      closeAddModal();
    } catch (error) {
      // Error is handled by mutation's onError callback
      // But we log it here for additional debugging
      
    } finally {
      setIsCreating(false);
    }
  };

  // Delete FAQ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteConfirm = (e, faq) => {
    e.stopPropagation();
    setFaqToDelete(faq);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setFaqToDelete(null);
  };

  const confirmDelete = async () => {
    if (!faqToDelete?.id && !faqToDelete?._id) {
      toast.error("Invalid FAQ data");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(faqToDelete.id || faqToDelete._id);
      closeDeleteConfirm();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
    }
  };

  // Update activeTab when categories change
  React.useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit FAQ</h1>
          <p className="text-gray-500 mt-1">Manage the frequently asked questions.</p>
        </div>

        <div>
          <PrimaryBtn
            title={"Add Question & Answer"}
            style={"rounded-full flex-row-reverse"}
            icon={'mdi:book-add'}
            hendleClick={handleAddFaq}
          />
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading FAQs: {fetchError?.response?.data?.message || fetchError?.message || "Unknown error"}
        </div>
      )}

      {/* Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveTab(category);
                setOpenIndex(-1);
              }}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === category
                ? "bg-[#FCD34D] border-[#FCD34D] text-gray-900"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Accordion */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No FAQs available in this category. Add your first FAQ!
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <div
              key={faq.id || faq._id || index}
              className={`border rounded-xl transition-all duration-300 bg-white overflow-hidden ${openIndex === index
                ? "border-yellow-400 shadow-sm"
                : "border-gray-100"
                }`}
            >
              <div
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-6 cursor-pointer select-none"
              >
                <span
                  className={`text-lg font-medium pr-8 ${openIndex === index ? "text-gray-900" : "text-gray-700"
                    }`}
                >
                  {faq.question}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => openEditModal(e, faq)}
                    className="p-2 text-gray-400 hover:text-[#FFCA42] hover:bg-yellow-50 rounded-full transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Icon icon="lucide:edit-2" width="20" height="20" />
                  </button>
                  <button
                    onClick={(e) => openDeleteConfirm(e, faq)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Icon icon="line-md:trash" width="20" height="20" />
                  </button>
                  <span
                    className={`transform transition-transform duration-300 text-gray-400 ${openIndex === index ? "rotate-180" : ""
                      }`}
                  >
                    <Icon icon="lucide:chevron-down" width="24" height="24" />
                  </span>
                </div>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out px-6 ${openIndex === index
                  ? "max-h-96 opacity-100 pb-6"
                  : "max-h-0 opacity-0 pb-0"
                  }`}
              >
                <div className="text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New FAQ</h2>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" width="24" height="24" />
              </button>
            </div>

            <div className="space-y-5">
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors bg-white cursor-pointer"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <Icon icon="lucide:chevron-down" width="16" height="16" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  placeholder="Enter your question"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newFaq.question}
                  onChange={(e) =>
                    setNewFaq({ ...newFaq, question: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  placeholder="Enter the answer"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors min-h-[120px]"
                  value={newFaq.answer}
                  onChange={(e) =>
                    setNewFaq({ ...newFaq, answer: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={closeAddModal}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveNewFaq}
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-[#FFCA42] text-gray-900 font-semibold rounded-full hover:bg-[#ffc942c2] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit FAQ</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" width="24" height="24" />
              </button>
            </div>

            <div className="space-y-5">
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors bg-white cursor-pointer"
                      value={editingFaq.category || categories[0]}
                      onChange={(e) =>
                        setEditingFaq({ ...editingFaq, category: e.target.value })
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <Icon icon="lucide:chevron-down" width="16" height="16" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={editingFaq.question || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors min-h-[120px]"
                  value={editingFaq.answer || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
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
                onClick={saveFaq}
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
      {showDeleteConfirm && faqToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <Icon icon="fluent:delete-24-regular" width="24" height="24" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete FAQ?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-700">{faqToDelete.question}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
