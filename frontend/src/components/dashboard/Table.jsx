"use client";
import React, { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

export default function Table({
  TableHeads,
  TableRows,
  // Server-side pagination props
  pagination = null, // { total, page, limit }
  onPageChange = null,
  onLimitChange = null,
}) {
  // Client-side pagination state (used when pagination prop is not provided)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use server-side pagination if provided, otherwise use client-side
  const isServerSide = pagination !== null;
  const totalItems = isServerSide ? pagination.total : TableRows.length;
  const totalPages = Math.ceil(totalItems / (isServerSide ? pagination.limit : itemsPerPage));
  const currentPageValue = isServerSide ? pagination.page : currentPage;
  const currentLimit = isServerSide ? pagination.limit : itemsPerPage;

  // For server-side, use all rows (already paginated by server)
  // For client-side, slice the rows
  const currentItems = isServerSide
    ? TableRows
    : TableRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startIndex = isServerSide
    ? (currentPageValue - 1) * currentLimit + 1
    : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = isServerSide
    ? Math.min(currentPageValue * currentLimit, totalItems)
    : Math.min(currentPage * itemsPerPage, totalItems);

  // Sync local state with server-side pagination
  useEffect(() => {
    if (isServerSide && pagination) {
      setCurrentPage(pagination.page);
      setItemsPerPage(pagination.limit);
    }
  }, [isServerSide, pagination]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      if (isServerSide && onPageChange) {
        onPageChange(page);
      } else {
        setCurrentPage(page);
      }
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    if (isServerSide && onLimitChange) {
      onLimitChange(newLimit);
    } else {
      setItemsPerPage(newLimit);
      setCurrentPage(1);
    }
  };

  // Smart pagination: show page range instead of all pages
  const getPageNumbers = () => {
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  return (
    <>
      <table className="w-full my-6 border-collapse">
        {/* ==== TABLE HEADER ==== */}
        <thead>
          <tr className="bg-[#FFFAEC] border-0">
            {TableHeads.map((head, idx) => (
              <th
                key={idx}
                className={cn(
                  "text-center font-medium text-[#0C0C0D] py-[22px]",
                  idx === 0 && "rounded-tl-2xl",
                  idx === TableHeads.length - 1 && "rounded-tr-2xl"
                )}
                style={{ width: head.width }}
              >
                {head.Title}
              </th>
            ))}
          </tr>
        </thead>

        {/* ==== TABLE BODY ==== */}
        <tbody className="bg-white">
          {currentItems.length > 0 ? (
            currentItems.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {TableHeads.map((head, headIdx) => (
                  <td
                    key={headIdx}
                    className="border border-[#F0F0F2] py-[22px] text-center px-3 text-black"
                  >
                    {/* If render function exists, use it — otherwise show plain data */}
                    {
                      head.render ? head.render(row, rowIdx + 1) : row[head.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={TableHeads.length}
                className="border border-[#F0F0F2] py-16 text-center text-[#6D6E73]"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 text-[#CED2E5]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-base font-medium">No data available</p>
                  <p className="text-sm">There are no entries to display at this time.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 bg-white px-6 py-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6D6E73]">Show</span>
          <select
            value={currentLimit}
            onChange={handleItemsPerPageChange}
            className="border border-[#CED2E5] rounded px-3 py-1 text-sm text-black focus:outline-none focus:border-[#FFCA42]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-[#6D6E73]">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPageValue - 1)}
            disabled={currentPageValue === 1 || currentItems.length === 0}
            aria-label="Previous page"
            className="px-4 py-2 text-sm text-[#6D6E73] hover:bg-[#F8F9FA] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-[#6D6E73]">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPageValue === page ? "page" : undefined}
                className={`px-3 py-1 text-sm rounded ${currentPageValue === page
                  ? "bg-[#FFCA42] text-[#0C0C0D]"
                  : "text-[#6D6E73] hover:bg-[#F8F9FA]"
                  }`}
              >
                {page}
              </button>
            )
          ))}
          <button
            onClick={() => handlePageChange(currentPageValue + 1)}
            disabled={currentPageValue === totalPages || currentItems.length === 0}
            aria-label="Next page"
            className="px-4 py-2 text-sm text-[#6D6E73] hover:bg-[#F8F9FA] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <div className="text-sm text-[#6D6E73]">
          Showing {startIndex} to {endIndex} of {totalItems} entries
        </div>
      </div>
    </>
  );
}
