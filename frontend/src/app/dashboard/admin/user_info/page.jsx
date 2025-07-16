"use client";
import { useState, useMemo } from "react";
import Table from "@/components/dashboard/Table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";

// Edit Status Modal Component
function EditStatusModal({ user, onClose, onUpdate, isUpdating }) {
  const [selectedStatus, setSelectedStatus] = useState(user.status);

  const handleSubmit = () => {
    if (selectedStatus !== user.status) {
      onUpdate(user.id, selectedStatus);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Edit User Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUpdating}
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">User:</span> {user.name}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCA42] focus:border-[#FFCA42] outline-none"
            disabled={isUpdating}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || selectedStatus === user.status}
            className="px-4 py-2 bg-[#FFCA42] text-white rounded-lg hover:bg-[#eeb526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserInfo() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => apiGet("/admin/users", { page, limit }),
  });

  // Format subscription plan name
  const formatSubscriptionPlan = (plan) => {
    const planMap = {
      essay_hack: "Essay Hack",
      essay_hack_plus: "Essay Hack Plus",
      essay_hack_pro: "Essay Hack Pro",
      Free: "Free",
    };
    return planMap[plan] || plan;
  };

  // Transform API data to table format
  const TableRows = useMemo(() => {
    if (!usersResponse?.success || !usersResponse?.users) {
      return [];
    }

    return usersResponse.users.map((user) => ({
      no: user.no,
      id: user.id,
      name: user.name,
      email: user.email,
      total_essays: user.totalEssays || 0,
      subscription_plans: formatSubscriptionPlan(user.subscriptionPlan || "Free"),
      status: user.status || "INACTIVE",
    }));
  }, [usersResponse]);

  const TableHeads = [
    { Title: "No", key: "no", width: "5%" },
    { Title: "Name", key: "name", width: "18%" },
    { Title: "Email", key: "email", width: "25%" },
    { Title: "Total Essays", key: "total_essays", width: "10%" },
    { Title: "Subscription Plans", key: "subscription_plans", width: "15%" },
    {
      Title: "Status",
      key: "status",
      width: "12%",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${row.status === "ACTIVE"
            ? "bg-[#E6F8EF] text-[#00A47E]"
            : "bg-[#FEE4E2] text-[#B42318]"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      Title: "Actions",
      key: "actions",
      width: "15%",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setEditingUser(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Status"
          >
            <Icon icon="solar:pen-bold" className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDeleteModal(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete User"
          >
            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  // Handle status update
  const handleStatusUpdate = async (userId, newStatus) => {
    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiPatch(`/admin/users/${userId}/status`, { status: newStatus });

      if (response?.success) {
        toast.success("User status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["users", page, limit] });
        setEditingUser(null);
      } else {
        toast.error(response?.message || "Failed to update user status");
      }
    } catch (error) {
      // Extract error message from axios error structure (handled by interceptor)
      const errorMessage = error?.data?.message
        || error?.message
        || `Failed to update user status${error?.status ? ` (Status: ${error.status})` : ''}`;
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    setIsDeleting(true);
    try {
      const response = await apiDelete(`/admin/users/${userId}`);
      
      if (response?.success) {
        toast.success("User deleted successfully");
        // If current page has only one item and we're not on page 1, go to previous page
        const currentPageItemCount = usersResponse?.users?.length || 0;
        const newPage = currentPageItemCount === 1 && page > 1 ? page - 1 : page;
        if (newPage !== page) {
          setPage(newPage);
        }
        queryClient.invalidateQueries({ queryKey: ["users", newPage, limit] });
        setShowDeleteModal(null);
      } else {
        toast.error(response?.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred while deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Information</h1>
        <p className="text-gray-500 mt-1">Manage and view all users.</p>
      </div>

      <Table
        TableHeads={TableHeads}
        TableRows={TableRows}
        pagination={usersResponse?.meta ? {
          total: usersResponse.meta.total,
          page: usersResponse.meta.page,
          limit: usersResponse.meta.limit,
        } : null}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1); // Reset to first page when changing limit
        }}
      />

      {/* Edit Status Modal */}
      {editingUser && (
        <EditStatusModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleStatusUpdate}
          isUpdating={isUpdating}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Delete User</h3>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">User:</span> {showDeleteModal.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Email:</span> {showDeleteModal.email}
              </p>
              <p className="text-sm text-red-600 mt-4">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal.id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
