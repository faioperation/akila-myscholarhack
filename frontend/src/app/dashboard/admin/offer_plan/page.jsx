"use client";
import Table from "@/components/dashboard/Table";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";

export default function offer_plan() {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create Offer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOffer, setNewOffer] = useState({
    heading: "",
    startDate: "",
    endDate: "",
    subheading: "",
    ctaText: "",
    discount: "",
  });

  // Reactivation Modal State
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);
  const [offerToReactivate, setOfferToReactivate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reactivateDates, setReactivateDates] = useState({
    start_date: "",
    end_date: "",
  });

  // Fetch offers from API
  const { data: offersResponse, isLoading, error: fetchError } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      try {
        const response = await apiGet("/admin/offers");
        
        return response;
      } catch (error) {
        
        throw error;
      }
    },
  });

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Transform API data to table format
  const offers = useMemo(() => {
    
    if (!offersResponse) {
      
      return [];
    }

    // Handle different response structures
    let offersList = [];

    if (Array.isArray(offersResponse)) {
      // If response is directly an array
      offersList = offersResponse;
    } else if (offersResponse?.data) {
      // If response has data property
      if (Array.isArray(offersResponse.data)) {
        offersList = offersResponse.data;
      } else if (offersResponse.data.offers && Array.isArray(offersResponse.data.offers)) {
        offersList = offersResponse.data.offers;
      } else if (offersResponse.data.data && Array.isArray(offersResponse.data.data)) {
        offersList = offersResponse.data.data;
      }
    } else if (offersResponse?.success && offersResponse?.data) {
      // Standard success response
      if (Array.isArray(offersResponse.data)) {
        offersList = offersResponse.data;
      } else if (offersResponse.data.offers && Array.isArray(offersResponse.data.offers)) {
        offersList = offersResponse.data.offers;
      }
    }

    

    return offersList.map((offer, index) => {
      const startDate = offer.startDate || offer.start_date;
      const endDate = offer.endDate || offer.end_date;

      return {
        no: index + 1,
        id: offer.id || offer._id,
        offer_name: offer.heading || offer.offer_name || offer.title || "Untitled Offer",
        discount: offer.discount ? `${offer.discount}%` : "0%",
        start_date: formatDateForDisplay(startDate),
        end_date: formatDateForDisplay(endDate),
        start_date_raw: startDate, // Keep raw date for comparison
        end_date_raw: endDate, // Keep raw date for comparison
        status: offer.status || offer.isActive || false,
      };
    });
  }, [offersResponse]);

  const handleCreateOffer = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewOffer({
      heading: "",
      startDate: "",
      endDate: "",
      subheading: "",
      ctaText: "",
      discount: "",
    });
  };

  const createBanner = async () => {
    if (!newOffer.heading || !newOffer.startDate || !newOffer.endDate || !newOffer.discount) {
      toast.error("Please fill in all required fields (Heading, Start Date, End Date, Discount)");
      return;
    }

    // Validate dates
    if (new Date(newOffer.startDate) > new Date(newOffer.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsCreating(true);
    try {
      // Build payload - match backend field names: title, discountValue, startDate, endDate
      const payload = {
        title: newOffer.heading.trim(), // Backend expects 'title' not 'heading'
        startDate: newOffer.startDate,
        endDate: newOffer.endDate,
      };

      // Add discountValue (required by backend)
      if (newOffer.discount && newOffer.discount.trim()) {
        const discountValue = parseFloat(newOffer.discount);
        if (!isNaN(discountValue) && discountValue >= 0) {
          payload.discountValue = discountValue; // Backend expects 'discountValue' not 'discount'
        } else {
          toast.error("Please enter a valid discount percentage");
          setIsCreating(false);
          return;
        }
      } else {
        toast.error("Discount percentage is required");
        setIsCreating(false);
        return;
      }

      // Add optional fields only if they have values
      if (newOffer.subheading && newOffer.subheading.trim()) {
        payload.subheading = newOffer.subheading.trim();
      }
      if (newOffer.ctaText && newOffer.ctaText.trim()) {
        payload.ctaText = newOffer.ctaText.trim();
      }

  
      const response = await apiPost("/admin/offers", payload);
   

      // Handle different response structures
      if (response?.success) {
        toast.success("Offer created successfully");
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        closeCreateModal();
      } else {
        toast.error(response?.message || "Failed to create offer");
      }
    } catch (error) {
      
      toast.error("Failed to create offer");
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteConfirmation = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirm(false);
    setOfferToDelete(null);
  };

  const confirmDelete = async () => {
    if (!offerToDelete?.id) {
      toast.error("Invalid offer data");
      return;
    }

    setIsDeleting(true);
    try {
      
      const response = await apiDelete(`/admin/offers/${offerToDelete.id}`);
      

      if (response?.success) {
        toast.success("Offer deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        closeDeleteConfirmation();
      } else {
        toast.error(response?.message || "Failed to delete offer");
      }
    } catch (error) {
      
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete offer");
    } finally {
      setIsDeleting(false);
    }
  };

  // Logic for Toggle
  const handleToggle = async (row) => {
    if (!row.id) {
      toast.error("Invalid offer data");
      return;
    }

    const endDateRaw = row.end_date_raw || row.end_date;
    const isExpired = endDateRaw && new Date(endDateRaw) < new Date();
    const isActive = !isExpired && row.status;

    if (!isActive) {
      // Open modal to reactivate
      setOfferToReactivate(row);
      setShowReactivateConfirm(true);
      setReactivateDates({ start_date: "", end_date: "" });
    } else {
      // If already active, deactivate immediately
      setIsUpdating(true);
      try {
        
        const response = await apiPatch(`/admin/offers/toggle/${row.id}`, { status: false });
        

        if (response?.success) {
          toast.success("Offer deactivated successfully");
          queryClient.invalidateQueries({ queryKey: ["offers"] });
        } else {
          toast.error(response?.message || "Failed to update offer status");
        }
      } catch (error) {
        
        toast.error(error?.response?.data?.message || error?.message || "Failed to update offer status");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const closeReactivateConfirmation = () => {
    setShowReactivateConfirm(false);
    setOfferToReactivate(null);
    setReactivateDates({ start_date: "", end_date: "" });
  };

  const confirmReactivation = async () => {
    if (!reactivateDates.start_date || !reactivateDates.end_date) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (!offerToReactivate?.id) {
      toast.error("Invalid offer data");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        status: true,
        startDate: reactivateDates.start_date,
        endDate: reactivateDates.end_date,
      };
      
      const response = await apiPatch(`/admin/offers/toggle/${offerToReactivate.id}`, payload);
      

      if (response?.success) {
        toast.success("Offer activated successfully");
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        closeReactivateConfirmation();
      } else {
        toast.error(response?.message || "Failed to activate offer");
      }
    } catch (error) {
      
      toast.error(error?.response?.data?.message || error?.message || "Failed to activate offer");
    } finally {
      setIsUpdating(false);
    }
  };

  const TableHeads = [
    { Title: "No", key: "no", width: "5%" },
    { Title: "Offer Tittle", key: "offer_name", width: "30%" },
    { Title: "Offer (%)", key: "discount", width: "10%" },
    { Title: "Start  Date", key: "start_date", width: "15%" },
    { Title: "End  Date", key: "end_date", width: "15%" },
    {
      Title: "Status",
      key: "status",
      width: "10%",
      render: (row) => {
        const endDateRaw = row.end_date_raw || row.end_date;
        const isExpired = endDateRaw && new Date(endDateRaw) < new Date();
        const isActive = !isExpired && row.status;

        return (
          <div className="flex items-center justify-center">
            <div
              onClick={() => handleToggle(row)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${isActive ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"
                  }`}
              />
            </div>
          </div>
        );
      },
    },
    {
      Title: "Action",
      key: "action",
      width: "5%",
      render: (row) => (
        <>
          <span
            onClick={() => openDeleteConfirmation(row)}
            className="text-red-500 flex justify-center items-center cursor-pointer"
          >
            <Icon icon={"line-md:trash"} width={28} height={28} />
          </span>
        </>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Plan</h1>
          <p className="text-gray-500 mt-1">Here’s your progress this week.</p>
        </div>

        <div>
          <PrimaryBtn title={"Create offer"} style={"rounded-full"} hendleClick={handleCreateOffer} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading offers...</div>
        </div>
      ) : fetchError ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">
            Error loading offers: {fetchError?.response?.data?.message || fetchError?.message || "Unknown error"}
          </div>
        </div>
      ) : (
        <Table TableHeads={TableHeads} TableRows={offers} />
      )}

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-10 transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Create Offer Banner</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">Heading Text</label>
                <input
                  type="text"
                  placeholder="Ad text"
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newOffer.heading}
                  onChange={(e) => setNewOffer({ ...newOffer, heading: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">Started Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                    value={newOffer.startDate}
                    onChange={(e) => setNewOffer({ ...newOffer, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                    value={newOffer.endDate}
                    onChange={(e) => setNewOffer({ ...newOffer, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">Subheading Text</label>
                  <input
                    type="text"
                    placeholder="Subheading text"
                    className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                    value={newOffer.subheading}
                    onChange={(e) => setNewOffer({ ...newOffer, subheading: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="Discount percentage"
                    min="0"
                    max="100"
                    className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">CTA Text</label>
                <input
                  type="text"
                  placeholder="Call to action text"
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newOffer.ctaText}
                  onChange={(e) => setNewOffer({ ...newOffer, ctaText: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={createBanner}
                disabled={isCreating}
                className="w-full py-4 bg-[#FFCA42] text-gray-900 font-medium text-lg rounded-full hover:bg-[#ffc942c2] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Banner"}
              </button>
            </div>

            {/* Hidden close button overlay for UX optionally, or just relying on standard close logic/button if not in design. 
                Design shows no cancel button, so I will add a way to close it by clicking outside or a subtle X if needed, 
                but for now strictly matching the image which only has "Create Banner". 
                I will add a background click close for usability.
            */}
            <button
              onClick={closeCreateModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="lucide:x" width="24" height="24" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <Icon icon="fluent:delete-24-regular" width="24" height="24" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Offer?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-700">
                {offerToDelete?.offer_name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={closeDeleteConfirmation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      {showReactivateConfirm && offerToReactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Activate Offer</h3>
              <button
                onClick={closeReactivateConfirmation}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="lucide:x" width="24" height="24" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFCA42] focus:border-transparent outline-none"
                  value={reactivateDates.start_date}
                  onChange={(e) =>
                    setReactivateDates({
                      ...reactivateDates,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFCA42] focus:border-transparent outline-none"
                  value={reactivateDates.end_date}
                  onChange={(e) =>
                    setReactivateDates({
                      ...reactivateDates,
                      end_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeReactivateConfirmation}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmReactivation}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-[#FFCA42] text-black font-medium rounded-lg hover:bg-[#ffc942c2] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Activating..." : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
