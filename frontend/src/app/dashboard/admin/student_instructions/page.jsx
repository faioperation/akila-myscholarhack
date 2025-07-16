"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import toast from "react-hot-toast";

const initialFormData = {
  title: "",
  instructionText: "",
  instructionPrompt: "",
  aboutScholarshipText: "",
};

export default function StudentInstructions() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: instructionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["student-instruction"],
    queryFn: () => apiGet("/student-instruction"),
    retry: false,
  });

  const instructionData = instructionResponse?.data || null;
  const hasExistingData = Boolean(instructionData);
  const isNotFound = error?.status === 404;

  useEffect(() => {
    if (instructionData) {
      setFormData({
        title: instructionData.title || "",
        instructionText: instructionData.instructionText || "",
        instructionPrompt: instructionData.instructionPrompt || "",
        aboutScholarshipText: instructionData.aboutScholarshipText || "",
      });
      setIsEditing(false);
      return;
    }

    if (isNotFound) {
      setFormData(initialFormData);
      setIsEditing(true);
    }
  }, [instructionData, isNotFound]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (instructionData) {
      setFormData({
        title: instructionData.title || "",
        instructionText: instructionData.instructionText || "",
        instructionPrompt: instructionData.instructionPrompt || "",
        aboutScholarshipText: instructionData.aboutScholarshipText || "",
      });
      setIsEditing(false);
      return;
    }

    setFormData(initialFormData);
  };

  const handleSave = async () => {
    const payload = {
      title: formData.title.trim(),
      instructionText: formData.instructionText.trim(),
      instructionPrompt: formData.instructionPrompt.trim(),
      aboutScholarshipText: formData.aboutScholarshipText.trim(),
    };

    if (
      !payload.title ||
      !payload.instructionText ||
      !payload.instructionPrompt ||
      !payload.aboutScholarshipText
    ) {
      toast.error("Please fill in all 4 fields");
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiPost("/student-instruction", payload);

      if (response?.success) {
        toast.success(response?.message || "Student instruction saved successfully");
        await queryClient.invalidateQueries({ queryKey: ["student-instruction"] });
        setIsEditing(false);
      } else {
        toast.error(response?.message || "Failed to save student instruction");
      }
    } catch (saveError) {
      toast.error(saveError?.message || "Failed to save student instruction");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 lg:p-8">
      <div className="">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Student Instructions</h1>
            <p className="mt-1 text-gray-500">
              Fetch, review, and update the instruction content shown to students.
            </p>
          </div>

          {hasExistingData && !isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-full border border-[#FFCA42] bg-[#FFCA42] text-black px-6 py-3 font-medium  transition-colors hover:bg-[#FFF4D6]"
            >
              Edit
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading student instruction...
          </div>
        ) : error && !isNotFound ? (
          <div className="rounded-3xl bg-white p-8 text-center text-red-500 shadow-sm">
            {error?.message || "Failed to fetch student instruction"}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter instruction title"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 focus:border-[#FFCA42] focus:ring-2 focus:ring-[#FFCA42]/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Instruction Text
                </label>
                <textarea
                  rows={3}
                  value={formData.instructionText}
                  onChange={(e) => handleChange("instructionText", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter the instruction text"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 focus:border-[#FFCA42] focus:ring-2 focus:ring-[#FFCA42]/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Instruction Prompt
                </label>
                <textarea
                  rows={3}
                  value={formData.instructionPrompt}
                  onChange={(e) => handleChange("instructionPrompt", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter the prompt for students"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 focus:border-[#FFCA42] focus:ring-2 focus:ring-[#FFCA42]/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  About Scholarship Text
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutScholarshipText}
                  onChange={(e) => handleChange("aboutScholarshipText", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter scholarship description"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 focus:border-[#FFCA42] focus:ring-2 focus:ring-[#FFCA42]/30"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isEditing && hasExistingData && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-[#FFCA42] px-6 py-3 font-medium text-gray-900 transition hover:bg-[#eeb526] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : hasExistingData ? "Save Changes" : "Save Instruction"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}