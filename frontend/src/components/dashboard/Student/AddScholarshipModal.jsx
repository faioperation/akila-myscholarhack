"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
];

const defaultForm = {
  title: "",
  type: "",
  amount: "",
  provider: "",
  deadline: "",
  subject: "",
  description: "",
  images: "",
  detailUrl: "",
  prompt: "",
  status: "DRAFT",
};

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#FFCA42] focus:bg-white focus:ring-2 focus:ring-[#FFCA42]/20";

function Field({ label, required = false, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <Icon icon="mdi:alert-circle-outline" width={14} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddScholarshipModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData = null,
}) {
  const isEditMode = !!initialData;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || initialData.scholarshipTitle || initialData.scholarshipName || "",
        type: initialData.type || "",
        amount: initialData.amount ?? "",
        provider: initialData.provider || "",
        deadline: initialData.deadline
          ? initialData.deadline.slice(0, 10)
          : initialData.scholarshipDeadline
            ? initialData.scholarshipDeadline.slice(0, 10)
            : "",
        subject: initialData.subject || "",
        description: initialData.description || initialData.details || "",
        images: Array.isArray(initialData.images)
          ? initialData.images.join(", ")
          : initialData.images || "",
        detailUrl: initialData.detailUrl || "",
        prompt: initialData.prompt || "",
        status: initialData.status || "DRAFT",
      });
    } else {
      setForm(defaultForm);
    }

    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Scholarship title is required.";
    if (!form.provider.trim()) nextErrors.provider = "Provider is required.";
    if (!form.deadline) nextErrors.deadline = "Deadline is required.";
    if (!form.prompt.trim()) nextErrors.prompt = "Prompt is required.";
    if (form.amount && Number.isNaN(Number(form.amount))) {
      nextErrors.amount = "Amount must be a valid number.";
    }

    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      title: form.title.trim(),
      type: form.type.trim(),
      amount: form.amount,
      provider: form.provider.trim(),
      deadline: form.deadline,
      subject: form.subject.trim(),
      description: form.description.trim(),
      images: form.images
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      detailUrl: form.detailUrl.trim(),
      prompt: form.prompt.trim(),
      status: form.status,
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl animate-fadeInScale">
        <div className="flex items-center justify-between border-b border-[#FFE08A] bg-[#FFF9EA] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFCA42] shadow-sm">
              <Icon
                icon={isEditMode ? "mdi:pencil-outline" : "mdi:file-document-plus-outline"}
                width={22}
                height={22}
                className="text-[#0C0C0D]"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Application" : "Add Application"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditMode
                  ? "Update the manual scholarship information below."
                  : "Fill in the scholarship details to track this manual application."}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <Icon icon="mdi:close" width={20} height={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="scrollbar-hide max-h-[75vh] overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Scholarship Title" required error={errors.title}>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Global Excellence Scholarship"
                  className={inputClassName}
                />
              </Field>

              <Field label="Type">
                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="e.g. Merit-based"
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Amount" error={errors.amount}>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className={inputClassName}
                />
              </Field>

              <Field label="Provider" required error={errors.provider}>
                <input
                  type="text"
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  placeholder="e.g. International Education Foundation"
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Deadline" required error={errors.deadline}>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </Field>

              <Field label="Subject">
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={10}
                placeholder="e.g. A scholarship for international students with outstanding academic records..."
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <Field label="Prompt" required error={errors.prompt}>
              <textarea
                name="prompt"
                value={form.prompt}
                onChange={handleChange}
                rows={10}
                placeholder="e.g. Write a 500-word essay on how you will contribute to the tech industry."
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <Field label="Image URLs">
              <textarea
                name="images"
                value={form.images}
                onChange={handleChange}
                rows={2}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Details URL">
                <input
                  type="url"
                  name="detailUrl"
                  value={form.detailUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/scholarship-details"
                  className={inputClassName}
                />
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`${inputClassName} cursor-pointer`}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFCA42] px-6 py-2.5 text-sm font-semibold text-[#0C0C0D] shadow-sm transition-all duration-200 hover:bg-[#f5be2e] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" width={20} height={20} />
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Icon icon={isEditMode ? "mdi:content-save-outline" : "mdi:plus"} width={18} height={18} />
                    {isEditMode ? "Update Application" : "Add Application"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
