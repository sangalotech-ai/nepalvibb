"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useLocale();
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-16">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t.pagination.prev}
        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
          currentPage <= 1
            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-primary hover:border-orange-500 hover:text-orange-500 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="w-11 h-11 flex items-center justify-center text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-11 h-11 rounded-full border text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                : 'border-gray-200 text-primary hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t.pagination.next}
        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
          currentPage >= totalPages
            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-primary hover:border-orange-500 hover:text-orange-500 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
