'use client';

interface PropertyPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);

  if (page > 2) pages.add(page - 1);
  if (page < totalPages - 1) pages.add(page + 1);

  return [...pages].sort((a, b) => a - b);
}

export default function PropertyPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PropertyPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ''}`}
      aria-label="Property pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#4b5563] transition hover:border-[#1e4636]/30 hover:text-[#1e4636] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeftIcon />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = previousPage !== undefined && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="flex items-center gap-1">
              {showEllipsis ? (
                <span className="px-2 text-sm text-[#9ca3af]">…</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                disabled={disabled}
                aria-current={pageNumber === page ? 'page' : undefined}
                className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pageNumber === page
                    ? 'bg-[#1e4636] text-white shadow-sm'
                    : 'border border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#1e4636]/30 hover:text-[#1e4636]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#4b5563] transition hover:border-[#1e4636]/30 hover:text-[#1e4636] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRightIcon />
      </button>
    </nav>
  );
}
