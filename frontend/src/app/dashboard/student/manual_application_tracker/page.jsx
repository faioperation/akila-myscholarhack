"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Table from "@/components/dashboard/Table";
import AddScholarshipModal from "@/components/dashboard/Student/AddScholarshipModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function ManualApplicationTrackerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null); // holds the fetched data for edit
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const queryClient = useQueryClient();

  // ── Fetch all manual applications ─────────────────────────────────────────
  const { data: applicationsRes, isLoading, isError } = useQuery({
    queryKey: ["manualApplications"],
    queryFn: () => apiGet("/manual-application"),
  });

  const applications = applicationsRes?.data || [];

  // ── Add mutation ───────────────────────────────────────────────────────────
  const { mutate: addApplication, isPending: isAdding } = useMutation({
    mutationFn: (payload) => apiPost("/manual-application", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["manualApplications"]);
      setIsModalOpen(false);
      toast.success("Application added successfully!");
    },
    onError: (err) => {
      toast.error(err?.data?.message || err?.message || "Failed to add application.");
    },
  });

  // ── Update mutation ────────────────────────────────────────────────────────
  const { mutate: updateApplication, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/manual-application/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["manualApplications"]);
      setIsModalOpen(false);
      setEditingApplication(null);
      toast.success("Application updated successfully!");
    },
    onError: (err) => {
      console.error("[PATCH error] data:", JSON.stringify(err?.data, null, 2));
      toast.error(err?.data?.message || err?.message || "Failed to update application.");
    },
  });

  // ── Delete mutation ────────────────────────────────────────────────────────
  const { mutate: deleteApplication } = useMutation({
    mutationFn: (id) => apiDelete(`/manual-application/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["manualApplications"]);
      toast.success("Application deleted.");
    },
    onError: (err) => {
      toast.error(err?.data?.message || err?.message || "Failed to delete application.");
    },
  });

  // ── Open edit modal — fetch by ID first ───────────────────────────────────
  const handleEditClick = async (id) => {
    setIsFetchingEdit(true);
    try {
      const res = await apiGet(`/manual-application/${id}`);
      const data = res?.data || res;
      setEditingApplication(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setIsFetchingEdit(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
  };

  // ── Normalize payload — clean & convert fields before API call ───────────
  const VALID_STATUSES = ["DRAFT", "PROCESSING", "COMPLETED", "FAILED", "REJECTED"];

  const normalizePayload = (payload) => {
    const normalized = {
      ...payload,
      deadline: payload.deadline
        ? new Date(payload.deadline).toISOString()
        : undefined,
      amount: payload.amount !== "" && payload.amount !== undefined
        ? Number(payload.amount)
        : undefined,
      images: Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : undefined,
      // Only send status if it's a valid enum value
      status: VALID_STATUSES.includes(payload.status) ? payload.status : "DRAFT",
    };
    // Remove undefined / empty string fields so backend doesn't choke
    return Object.fromEntries(
      Object.entries(normalized).filter(([, v]) => v !== undefined && v !== "")
    );
  };

  const handleSubmit = (payload) => {
    const normalized = normalizePayload(payload);
    if (editingApplication) {
      updateApplication({ id: editingApplication.id || editingApplication._id, payload: normalized });
    } else {
      addApplication(normalized);
    }
  };

  // ── Status badge ───────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const styles = {
      DRAFT:      "bg-gray-100 text-gray-600",
      PROCESSING: "bg-blue-100 text-blue-700",
      COMPLETED:  "bg-green-100 text-green-700",
      FAILED:     "bg-red-100 text-red-700",
      REJECTED:   "bg-orange-100 text-orange-700",
    };
    const labels = {
      DRAFT:      "Draft",
      PROCESSING: "Processing",
      COMPLETED:  "Completed",
      FAILED:     "Failed",
      REJECTED:   "Rejected",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const TableHeads = [
    {
      Title: "No",
      key: "no",
      width: "4%",
      render: (_, idx) => <span className="font-semibold text-gray-500">{idx + 1}</span>,
    },
    {
      Title: "Scholarship",
      key: "title",
      width: "22%",
      render: (row) => (
        <div className="text-left space-y-1">
          <p className="font-semibold text-gray-900">
            {row.title || row.scholarshipTitle || row.scholarshipName || "Untitled Scholarship"}
          </p>
          {(row.provider || row.subject) && (
            <p className="text-sm text-gray-500">
              {[row.provider, row.subject].filter(Boolean).join(" • ")}
            </p>
          )}
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      Title: "Prompt",
      key: "prompt",
      width: "24%",
      render: (row) => (
        <div className="text-left">
          <p className="text-black font-medium line-clamp-1">
            {row.type || row.essayTitle || "Manual Application"}
          </p>
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{row.prompt}</p>
        </div>
      ),
    },
    {
      Title: "Amount / Type",
      key: "amount",
      width: "14%",
      render: (row) => (
        <div className="text-left">
          <p className="font-medium text-gray-900">
            {row.amount !== undefined && row.amount !== null && row.amount !== ""
              ? `$${Number(row.amount).toLocaleString()}`
              : "—"}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">{row.type || "Not specified"}</p>
        </div>
      ),
    },
    {
      Title: "Deadline",
      key: "deadline",
      width: "11%",
      render: (row) => {
        const deadline = row.deadline || row.scholarshipDeadline;
        if (!deadline) return <span className="text-gray-400">—</span>;

        const date = new Date(deadline);
        const daysLeft = (date - new Date()) / (1000 * 60 * 60 * 24);
        const isPast = daysLeft < 0;
        const isNear = daysLeft <= 30 && !isPast;
        return (
          <div className="text-left">
            <span className={`text-sm font-semibold ${isPast ? "text-red-500" : isNear ? "text-orange-500" : "text-gray-800"}`}>
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {!isPast && <p className={`text-xs mt-0.5 ${isNear ? "text-orange-400" : "text-gray-400"}`}>{Math.ceil(daysLeft)}d left</p>}
            {isPast && <p className="text-xs mt-0.5 text-red-400">Passed</p>}
          </div>
        );
      },
    },
    {
      Title: "Details",
      key: "description",
      width: "19%",
      render: (row) => (
        <div className="text-left">
          <p className="line-clamp-3 text-black">{row.description || row.details || "—"}</p>
          {row.detailUrl && (
            <a
              href={row.detailUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View source
              <Icon icon="mdi:open-in-new" width={14} height={14} />
            </a>
          )}
        </div>
      ),
    },
    {
      Title: "Actions",
      key: "actions",
      width: "10%",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Edit */}
          <button
            onClick={() => handleEditClick(row.id || row._id)}
            aria-label="Edit application"
            disabled={isFetchingEdit}
            className="w-9 h-9 rounded-lg border border-[#FFCA42]/60 text-[#b8941e] flex items-center justify-center hover:bg-[#FFFAEC] hover:border-[#FFCA42] transition-all disabled:opacity-50"
          >
            {isFetchingEdit ? (
              <Icon icon="svg-spinners:3-dots-fade" width={16} />
            ) : (
              <Icon icon="mdi:pencil-outline" width={17} height={17} />
            )}
          </button>
          {/* Delete */}
          <button
            onClick={() => deleteApplication(row.id || row._id)}
            aria-label="Delete application"
            className="w-9 h-9 rounded-lg border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
          >
            <Icon icon="mdi:trash-can-outline" width={18} height={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loader fullScreen={false} />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Application Tracker</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track scholarships you&apos;ve found and applied to manually.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFCA42] hover:bg-[#f5be2e] text-[#0C0C0D] font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"
        >
          <Icon icon="mdi:plus-circle-outline" width={20} height={20} />
          Add Application
        </button>
      </div>

      {/* Table Card */}
      {isError ? (
        <div className="bg-white rounded-2xl border border-red-100 p-12 text-center text-red-500 shadow-sm">
          <Icon icon="mdi:alert-circle-outline" width={40} className="mx-auto mb-3 text-red-300" />
          <p className="font-semibold">Failed to load applications</p>
          <p className="text-sm text-gray-400 mt-1">Please try refreshing the page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-0 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              All Applications
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {applications.length} entries
              </span>
            </h2>
          </div>
          <Table TableHeads={TableHeads} TableRows={applications} />
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddScholarshipModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isAdding || isUpdating}
        initialData={editingApplication}
      />
    </div>
  );
}
