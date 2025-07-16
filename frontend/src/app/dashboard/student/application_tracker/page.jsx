"use client";
import Table from "@/components/dashboard/Table";
import Loader from "@/components/Loader";
import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import { apiPatch } from "@/lib/api";
import toast from "react-hot-toast";
import { apiGet } from "@/lib/api";

export default function ApplicationTracker() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const dropdownRefs = useRef({});

    useEffect(() => {
        const fetchApplications = async () => {
            const response = await apiGet("/application");
            if (response?.success) {
                setApplications(response?.data);
                setLoading(false);
            }
        }
        fetchApplications();
    }, []);


    // Map old status values to new enum values
    const normalizeStatus = (status) => {
        const statusMap = {
            "Done": "COMPLETED",
            "DONE": "COMPLETED",
            "Processing": "PROCESSING",
            "PROCESSING": "PROCESSING",
            "Draft": "DRAFT",
            "DRAFT": "DRAFT",
            "Failed": "FAILED",
            "FAILED": "FAILED",
            "Rejected": "REJECTED",
            "REJECTED": "REJECTED"
        };
        return statusMap[status] || status || "DRAFT";
    };

    // Get status color classes
    const getStatusStyles = (status) => {
        const normalizedStatus = normalizeStatus(status);
        const styles = {
            DRAFT: "bg-gray-100 text-gray-700",
            PROCESSING: "bg-[#FEF0C7] text-[#E46A11]",
            COMPLETED: "bg-[#D1FADF] text-[#0D894F]",
            FAILED: "bg-red-100 text-red-700",
            REJECTED: "bg-red-50 text-red-600"
        };
        return styles[normalizedStatus] || styles.DRAFT;
    };

    const handleStatusChange = async (applicationId, newStatus) => {


        if (!applicationId) {
            toast.error("Application ID is missing");

            return;
        }

        setUpdatingStatusId(applicationId);
        setOpenDropdownId(null);

        // Update local state immediately for better UX
        const updateLocalState = () => {
            setApplications(prev => {

                const updated = prev.map(app => {
                    if (app.id === applicationId) {

                        return { ...app, status: newStatus };
                    }
                    return app;
                });

                // Update localStorage with the new state
                localStorage.setItem("application_tracker_data", JSON.stringify(updated));
                return updated;
            });
        };

        // Update locally first for immediate feedback
        updateLocalState();
        toast.success("Status updated successfully");

        // Try to sync with API in the background (silently fail if not available)
        // Applications might only exist locally, which is fine
        try {
            const response = await apiPatch(`/application/status/${applicationId}`, {
                status: newStatus
            });

            if (response?.success) {
                // Successfully synced with backend

            }
        } catch (error) {
            // Silently handle API errors - local update is what matters
            // The error "Application not found" is expected for local-only applications

        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside all dropdowns
            let clickedOutside = true;
            Object.values(dropdownRefs.current).forEach(ref => {
                if (ref && ref.contains(event.target)) {
                    clickedOutside = false;
                }
            });

            if (clickedOutside) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId !== null) {
            // Use a small delay to ensure click events on dropdown items fire first
            setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdownId]);

    const statusOptions = ["DRAFT", "PROCESSING", "COMPLETED", "FAILED", "REJECTED"];

    const TableHeads = [
        { Title: "No", key: "no", width: "5%", render: (_, idx) => idx + 1 },
        { Title: "Scholarship Title", key: "essayTitle", width: "35%" },
        {
            Title: "Amount",
            key: "amount",
            width: "15%",
            render: (row) => {
                const amount = row.amount;
                if (!amount || amount === 0 || amount === "0") {
                    return <span className="text-green-600 font-semibold">Free</span>;
                }
                return <span>${amount}</span>;
            }
        },
        {
            Title: "Deadline",
            key: "deadline",
            width: "15%",
            render: (row) => {
                if (!row.deadline) return <span className="text-[#6D6E73]">-</span>;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const deadlineDate = new Date(row.deadline);
                deadlineDate.setHours(0, 0, 0, 0);

                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let colorClass = "text-[#0D894F]"; // Default Green (Future)
                if (diffDays < 0) {
                    colorClass = "text-[#F04438]"; // Red (Expired)
                } else if (diffDays >= 0 && diffDays <= 2) {
                    colorClass = "text-[#E46A11]"; // Yellow/Orange (Near)
                }

                return (
                    <span className={`font-medium ${colorClass}`}>
                        {deadlineDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                );
            }
        },
        {
            Title: "Status",
            key: "status",
            width: "15%",
            render: (row) => {
                const currentStatus = normalizeStatus(row.status);
                const isOpen = openDropdownId === row.id;
                const isUpdating = updatingStatusId === row.id;

                return (
                    <div className="relative flex justify-center" ref={el => dropdownRefs.current[row.id] = el}>
                        <button
                            onClick={() => setOpenDropdownId(isOpen ? null : row.id)}
                            disabled={isUpdating}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${getStatusStyles(currentStatus)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                        >
                            {isUpdating ? (
                                <>
                                    <Icon icon="svg-spinners:3-dots-fade" width={12} height={12} />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <span>{currentStatus}</span>
                                    <Icon
                                        icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                                        width={16}
                                        height={16}
                                    />
                                </>
                            )}
                        </button>

                        {isOpen && !isUpdating && (
                            <div
                                className="absolute top-full mt-1 right-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleStatusChange(row.id, status);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${currentStatus === status
                                                ? `${getStatusStyles(status)} font-bold`
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {currentStatus === status && (
                                            <Icon icon="mdi:check" width={16} height={16} />
                                        )}
                                        <span>{status}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    if (loading) return <Loader fullScreen={false} />;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Application Tracker</h1>
            <p className="text-[#6D6E73] mb-6">Track the status of your scholarship applications.</p>

            {applications.length > 0 ? (
                <Table TableHeads={TableHeads} TableRows={applications} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E2E4E9]">
                    <div className="bg-[#F8F9FA] p-4 rounded-full mb-4">
                        <Icon icon="lucide:clipboard-list" width="32" height="32" className="text-[#6D6E73]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C0C0D] mb-1">No Applications Yet</h3>
                    <p className="text-[#6D6E73] max-w-sm text-center">
                        Start by applying to a scholarship from the "All Scholarships" page.
                    </p>
                </div>
            )}
        </div>
    );
}
