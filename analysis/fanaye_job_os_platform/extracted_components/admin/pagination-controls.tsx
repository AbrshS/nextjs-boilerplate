"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

export interface PaginationControlsProps {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export function PaginationControls({
  page,
  limit,
  totalCount,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 30, 40, 50],
  className = "",
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages || Math.ceil(totalCount / limit) || 1);
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalCount, currentPage * limit);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 ${className}`}
    >
      {/* Items per page selector & Total info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              onLimitChange(newLimit);
              onPageChange(1); // Reset to page 1 on limit change
            }}
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Rows per page"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          Showing {startItem}-{endItem} of {totalCount}
        </div>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          aria-label="Go to first page"
          title="First page"
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Go to previous page"
          title="Previous page"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page indicator */}
        <span className="text-sm font-medium px-2">
          Page {currentPage} of {safeTotalPages}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Go to next page"
          title="Next page"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={!canGoNext}
          aria-label="Go to last page"
          title="Last page"
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
