"use client";
import { useState, useMemo } from "react";
import Table from "@/components/dashboard/Table";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";

export default function AddAdmin() {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", phone: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch admins
  const { data: adminsResponse, isLoading } = useQuery({
    queryKey: ["admins", page, limit],
    queryFn: () => apiGet("/admin/admins", { page, limit }),
  });

  // Transform API data to table format
  const TableRows = useMemo(() => {
    

    if (!adminsResponse?.success) {
    
      return [];
    }

    if (!adminsResponse?.data?.admins || !Array.isArray(adminsResponse.data.admins)) {
      return [];
    }

    return adminsResponse.data.admins.map((admin) => ({
      no: admin.no,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone_number: admin.phone || "-",
    }));
  }, [adminsResponse]);

  const openDeleteConfirmation = (admin) => {
    setUserToDelete(admin);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleAddAdmin = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewAdmin({ name: "", email: "", phone: "", password: "" });
  };

  // Handle add admin
  const saveAdmin = async () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim(),
        phone: newAdmin.phone.trim(),
        ...(newAdmin.password && { password: newAdmin.password }),
      };

      const response = await apiPost("/admin/admins", payload);
      if (response?.success) {
        toast.success("Admin added successfully");
        queryClient.invalidateQueries({ queryKey: ["admins", page, limit] });
        closeAddModal();
      } else {
        toast.error(response?.message || "Failed to add admin");
      }
    } catch (error) {




      toast.error("An error occurred while adding admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete admin
  const confirmDelete = async () => {
    if (!userToDelete?.id) {
      toast.error("Admin ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      
      // Try using the same endpoint as users since admins are also users
      const response = await apiDelete(`/admin/users/${userToDelete.id}`);

      // Handle different response structures
      if (response?.success || (response && !response.error)) {
        toast.success("Admin deleted successfully");
        // If current page becomes empty after deletion, go to previous page
        const currentPageItemCount = adminsResponse?.data?.admins?.length || 0;
        const newPage = currentPageItemCount === 1 && page > 1 ? page - 1 : page;
        if (newPage !== page) {
          setPage(newPage);
        }
        queryClient.invalidateQueries({ queryKey: ["admins", newPage, limit] });
        closeDeleteConfirmation();
      } else {
        toast.error(response?.message || response?.error || "Failed to delete admin");
      }
    } catch (error) {



      toast.error("An error occurred while deleting admin");
    } finally {
      setIsDeleting(false);
    }
  };


  const TableHeads = [
    { Title: "No", key: "no", width: "5%" },
    { Title: "Name", key: "name", width: "20%" },
    { Title: "Email", key: "email", width: "30%" },
    { Title: "Phone Number", key: "phone_number", width: "20%" },
    {
      Title: "Action",
      key: "action",
      width: "15%",
      render: (row) => (
        <button
          onClick={() => openDeleteConfirmation(row)}
          className="text-red-500 flex justify-center items-center cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors"
          title="Delete Admin"
        >
          <Icon icon={"line-md:trash"} width={28} height={28} />
        </button>
      ),
    },
  ];


  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-500 mt-1">Manage admin users and their access.</p>
        </div>

        <div>
          <PrimaryBtn title={"Add Admin"} style={"rounded-full"} hendleClick={handleAddAdmin} />
        </div>
      </div>

      <Table
        TableHeads={TableHeads}
        TableRows={TableRows}
        pagination={adminsResponse?.data?.meta ? {
          total: adminsResponse.data.meta.total,
          page: adminsResponse.data.meta.page,
          limit: adminsResponse.data.meta.limit,
        } : null}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={closeAddModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Add Admin</h2>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  required
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  required
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  required
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Password <span className="text-gray-400 text-sm">(Optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter password (auto-generated if empty)"
                  className="w-full border border-gray-200 rounded-full px-6 py-3.5 text-gray-600 focus:outline-none focus:border-[#FFCA42] focus:ring-1 focus:ring-[#FFCA42] transition-colors"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={closeAddModal}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 border border-red-500 text-red-500 font-medium rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAdmin}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 bg-[#FFCA42] text-gray-900 font-semibold rounded-full hover:bg-[#ffc942c2] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Save Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={closeDeleteConfirmation}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <Icon icon="fluent:delete-24-regular" width="24" height="24" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Admin?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-700">{userToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={closeDeleteConfirmation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
    </div>
  );
}
