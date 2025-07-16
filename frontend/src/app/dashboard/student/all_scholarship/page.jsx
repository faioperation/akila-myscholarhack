"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import ScholershipCard from "@/components/dashboard/Student/ScholershipCard";
import Loader from "@/components/Loader";
import { apiPost, apiGet } from "@/lib/api";

export default function AllScholarship() {
  const [recommendedScholarships, setRecommendedScholarships] = useState([]);
  const [allScholarships, setAllScholarships] = useState([]);
  const [originalScholarships, setOriginalScholarships] = useState([]); // Store all original data
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  const router = useRouter();

  // Load all data on mount and when pagination changes (only if no filters)
  useEffect(() => {
    let isMounted = true;
    
    // Function to load data
    const loadData = async (page) => {
        setLoading(true);
        try {
            // Parallel fetch: Recommended (Page 1 only) & All Scholarships (Paginated)
            const promises = [
                apiGet(`/essay-recommendation/scholarships?page=${page}&limit=${itemsPerPage}`)
            ];

            let recomPromise = null;
            if (page === 1) {
                // Fetch recommendations specifically
                recomPromise = apiGet("/essay-recommendation");
                promises.push(recomPromise);
            }

            const results = await Promise.all(promises);
            const apiRes = results[0];
            const recomRes = page === 1 ? results[1] : null;

            if (isMounted) {
                // 1. All Scholarships
                if (apiRes && apiRes.success) {
                    let data = apiRes.data || [];
                    
                    // Sort: Items with amount come first
                    data = data.sort((a, b) => {
                        const getVal = (val) => {
                             if (!val) return 0;
                             const num = Number(String(val).replace(/[^0-9.-]+/g,""));
                             return isNaN(num) ? 0 : num;
                        };
                        const amountA = getVal(a.amount);
                        const amountB = getVal(b.amount);
                        
                        if (amountA > 0 && amountB === 0) return -1;
                        if (amountA === 0 && amountB > 0) return 1;
                        if (amountA > 0 && amountB > 0) return amountB - amountA; // Descending
                        return 0;
                    });
    
                    // Load all pages to have complete data for filtering
                    if (page === 1 && apiRes.meta && apiRes.meta.totalPage > 1) {
                        // Fetch all remaining pages
                        const remainingPromises = [];
                        for (let p = 2; p <= apiRes.meta.totalPage; p++) {
                            remainingPromises.push(apiGet(`/essay-recommendation/scholarships?page=${p}&limit=${itemsPerPage}`));
                        }
                        
                        try {
                            const remainingResults = await Promise.all(remainingPromises);
                            remainingResults.forEach(res => {
                                if (res && res.success && res.data && isMounted) {
                                    data = [...data, ...res.data];
                                }
                            });
                            
                            // Re-sort after adding all data
                            data = data.sort((a, b) => {
                                const getVal = (val) => {
                                    if (!val) return 0;
                                    const num = Number(String(val).replace(/[^0-9.-]+/g,""));
                                    return isNaN(num) ? 0 : num;
                                };
                                const amountA = getVal(a.amount);
                                const amountB = getVal(b.amount);
                                
                                if (amountA > 0 && amountB === 0) return -1;
                                if (amountA === 0 && amountB > 0) return 1;
                                if (amountA > 0 && amountB > 0) return amountB - amountA;
                                return 0;
                            });
                        } catch (err) {
                            console.error("Error loading additional pages:", err);
                        }
                    }
    
                    setOriginalScholarships(data);
                    setAllScholarships(data);
                    
                    if (apiRes.meta) {
                        setTotalPages(apiRes.meta.totalPage);
                    }
                }

                // 2. Recommended Scholarships (Logic from Dashboard)
                if (recomRes && recomRes.success) {
                    const rawRecom = recomRes.data || [];
                    // Apply filtering logic: Amount > 0 && Description exists
                    const filteredRecom = rawRecom.filter(item => {
                         const scholarship = item.scholarship || item;
                         const hasAmount = scholarship.amount && Number(String(scholarship.amount).replace(/[^0-9.-]+/g,"")) > 0;
                         const hasDescription = scholarship.description && scholarship.description.trim().length > 0;
                         return hasAmount && hasDescription;
                    }).slice(0, 4).map(item => item.scholarship || item);

                    setRecommendedScholarships(filteredRecom);
                }
            }
        } catch (err) {
            console.error("Failed to load scholarships", err);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    // Only load data if no filters are active (filters work on client-side)
    const hasActiveFilters = searchQuery.trim() || selectedSubject !== "All Subjects";
    if (!hasActiveFilters) {
        loadData(currentPage);
    }

    // Background Sync Logic (Only on mount)
    if (currentPage === 1 && !hasActiveFilters) {
        const syncResult = async () => {
            try {
                await apiPost("/essay-recommendation/sync-scholarships");
                // Reload data after sync
                if (isMounted) loadData(1);
            } catch (error) {
                console.error("Background sync failed:", error);
            }
        };
        syncResult();
    }

    return () => { isMounted = false; };
  }, [currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject]);

  // Filter scholarships based on search query and selected subject
  const filteredScholarships = useMemo(() => {
    let filtered = [...originalScholarships];

    // Filter by subject
    if (selectedSubject !== "All Subjects") {
      filtered = filtered.filter(
        (item) => item.subject === selectedSubject
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const provider = (item.provider || "").toLowerCase();
        const subject = (item.subject || "").toLowerCase();
        const amount = String(item.amount || "").toLowerCase();

        return (
          title.includes(query) ||
          description.includes(query) ||
          provider.includes(query) ||
          subject.includes(query) ||
          amount.includes(query)
        );
      });
    }

    return filtered;
  }, [originalScholarships, searchQuery, selectedSubject]);

  // Get unique subjects from all original scholarships with counts
  const subjectsWithCounts = useMemo(() => {
    const subjectCounts = {};
    originalScholarships.forEach((item) => {
      if (item.subject) {
        subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
      }
    });
    
    return Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }, [originalScholarships]);

  if (loading) return <Loader fullScreen={false} />;

  const Recomended = recommendedScholarships;

  const handleApplyClick = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedScholarship(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          Scholarships
        </h1>
        <p className="text-sm sm:text-base font-medium text-gray-600 max-w-4xl leading-relaxed">
          We collect scholarship information from various reliable sources and
          bring them together on one platform. Based on your profile details, we
          analyze and match the most relevant opportunities. The scholarships
          shown here are carefully recommended because they best align with your
          background and eligibility.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Featured Scholarships
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="bg-white border border-gray-200 rounded-lg py-2.5 px-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <Icon icon="lucide:search" width={20} height={20} className="text-gray-400" />
            <input
              type="search"
              placeholder="Search Scholarships"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:outline-none text-sm w-full sm:w-64"
            />
          </div>

          <div className="relative z-50" ref={categoryDropdownRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-5 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 justify-center min-w-[150px] max-w-[250px] relative z-50"
            >
              <Icon icon="lucide:filter" width={18} height={18} className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">{selectedSubject === "All Subjects" ? "Categorize" : selectedSubject}</span>
              <Icon icon={showCategoryDropdown ? "lucide:chevron-up" : "lucide:chevron-down"} width={16} height={16} className="flex-shrink-0" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 top-full z-[9999] mt-2 w-80 rounded-lg bg-white shadow-2xl border border-gray-200 max-h-60 overflow-y-auto scrollbar-hide">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setSelectedSubject("All Subjects");
                      setShowCategoryDropdown(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm w-full text-left transition-colors ${selectedSubject === "All Subjects"
                      ? "bg-amber-50 text-amber-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span className="flex-1 min-w-0 pr-2">All Subjects</span>
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                      {originalScholarships.length}
                    </span>
                  </button>
                  {subjectsWithCounts.map(({ subject, count }) => (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setShowCategoryDropdown(false);
                      }}
                      className={`flex items-start justify-between px-4 py-2.5 text-sm w-full text-left transition-colors group ${selectedSubject === subject
                        ? "bg-amber-50 text-amber-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span className="flex-1 min-w-0 pr-2 break-words leading-relaxed">{subject}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 mt-0.5 ${
                        selectedSubject === subject
                          ? "bg-amber-200 text-amber-800"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Recomended && Recomended.length > 0 && (
          <div className="bg-linear-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:star" width={24} height={24} className="text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recommended for You ({Recomended.length})
              </h3>
            </div>
            <div className={`grid gap-4 ${Recomended.length === 1 ? 'grid-cols-1 max-w-md' :
              Recomended.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' :
                Recomended.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
              {Recomended.map((item, idx) => (
                <ScholershipCard key={idx} Details={item} onApply={handleApplyClick} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Available Scholarships
            </h3>
            {(searchQuery || selectedSubject !== "All Subjects") && (
              <span className="text-sm text-gray-600">
                Showing {filteredScholarships.length} of {originalScholarships.length} scholarships
              </span>
            )}
          </div>

          {/* Pagination for filtered results */}
          {(() => {
            const filteredTotalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedScholarships = filteredScholarships.slice(startIndex, endIndex);

            return (
              <>
                {paginatedScholarships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedScholarships.map((item, idx) => (
                      <ScholershipCard key={item.id || idx} Details={item} onApply={handleApplyClick} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon icon="lucide:search-x" width={48} height={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">No scholarships found</p>
                    <p className="text-sm text-gray-500">
                      {searchQuery || selectedSubject !== "All Subjects"
                        ? "Try adjusting your search or filter criteria"
                        : "No scholarships available at the moment"}
                    </p>
                    {(searchQuery || selectedSubject !== "All Subjects") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSubject("All Subjects");
                        }}
                        className="mt-4 text-sm text-[#FFCA42] hover:text-[#FFB834] font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredTotalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 gap-2">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon icon="lucide:chevron-left" width={20} height={20} />
                    </button>
                    
                    <span className="text-sm text-gray-600 font-medium px-2">
                      Page {currentPage} of {filteredTotalPages}
                    </span>

                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, filteredTotalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === filteredTotalPages}
                      className={`p-2 rounded-lg border ${currentPage === filteredTotalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon icon="lucide:chevron-right" width={20} height={20} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {showModal && selectedScholarship && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Scholarship Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon icon="mdi:close" width={24} height={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedScholarship.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Icon icon="mdi:clock-outline" width={16} height={16} className="text-orange-500" />
                    <span>Deadline: {selectedScholarship.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:domain" width={20} height={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Provider</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">{selectedScholarship.provider}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:book-outline" width={20} height={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Subject</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">{selectedScholarship.subject}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:currency-usd" width={20} height={20} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">Scholarship Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{selectedScholarship.amount}</p>
                </div>
              </div>

              {selectedScholarship.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedScholarship.description}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  // Track application start
                  const currentData = JSON.parse(localStorage.getItem("application_tracker_data") || "[]");
                  // Check if already exists to avoid dupes or overwrites if unintended, 
                  // but for this flow we update/overwrite to set active
                  const existingIndex = currentData.findIndex(item => item.id === selectedScholarship.id);
                  const newEntry = {
                    id: selectedScholarship.id,
                    title: selectedScholarship.title,
                    essayTitle: "Pending Selection...",
                    essayContent: "",
                    amount: selectedScholarship.amount,
                    deadline: selectedScholarship.deadline,
                    status: "Processing"
                  };

                  if (existingIndex >= 0) {
                    currentData[existingIndex] = { ...currentData[existingIndex], status: "Processing" }; // Update status if re-applying? Or keep existing. Let's just update active.
                  } else {
                    currentData.push(newEntry);
                  }

                  localStorage.setItem("application_tracker_data", JSON.stringify(currentData));
                  localStorage.setItem("current_active_scholarship", selectedScholarship.id);
                  
                  // Save for Essay Page pre-filling
                  localStorage.setItem("selected_scholarship_for_application", JSON.stringify(selectedScholarship));

                  router.push('/dashboard/student/essays');
                }}
                className="flex-1 bg-linear-to-r from-[#FFCA42] to-[#FFB834] hover:from-[#FFB834] hover:to-[#FFCA42] text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:pencil" width={20} height={20} />
                <span>Write Essay</span>
              </button>
              <button
                onClick={() => {
                  // Track application start
                  const currentData = JSON.parse(localStorage.getItem("application_tracker_data") || "[]");
                  const existingIndex = currentData.findIndex(item => item.id === selectedScholarship.id);
                  const newEntry = {
                    id: selectedScholarship.id,
                    title: selectedScholarship.title,
                    essayTitle: "Pending Selection...",
                    essayContent: "",
                    amount: selectedScholarship.amount,
                    deadline: selectedScholarship.deadline,
                    status: "Processing"
                  };

                  if (existingIndex >= 0) {
                    // Keep existing entry but set as active
                  } else {
                    currentData.push(newEntry);
                  }

                  localStorage.setItem("application_tracker_data", JSON.stringify(currentData));
                  localStorage.setItem("current_active_scholarship", selectedScholarship.id);

                  router.push(`/dashboard/student/view_essay?subject=${encodeURIComponent(selectedScholarship.subject)}`);
                }}
                className="flex-1 bg-white border-2 border-[#FFCA42] text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-amber-50 flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:file-document-outline" width={20} height={20} />
                <span>Select Best Essay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
