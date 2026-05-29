import React from "react";
import "../styles/pagination.css";

/**
 * @typedef {Object} PaginationProps
 * @property {number} [currentPage]
 * @property {(page: number) => void} onPageChange
 * @property {number} [totalItems]
 * @property {number} [itemsPerPage]
 * @property {boolean} [showPageNumbers]
 * @property {boolean} [showPrevNext]
 * @property {string} [prevLabel]
 * @property {string} [nextLabel]
 * @property {string} [className]
 * @property {number} [maxVisiblePages]
 * @property {boolean} [showFirstLast]
 * @property {string} [firstLabel]
 * @property {string} [lastLabel]
 * @property {boolean} [disabled]
 */

/**
 * @param {PaginationProps} props
 */
const Pagination = ({
  currentPage = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 12,
  showPageNumbers = true,
  showPrevNext = true,
  prevLabel = "Previous",
  nextLabel = "Next",
  className = "",
  maxVisiblePages = 5,
  showFirstLast = false,
  firstLabel = "First",
  lastLabel = "Last",
  disabled = false
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't render if only one page
  if (totalPages <= 1) return null;
  
  /**
   * @param {number} page
   */
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  // Calculate visible page numbers with optional leading/trailing ellipsis
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return { pages: Array.from({ length: totalPages }, (_, index) => index + 1), startPage: 1, endPage: totalPages };
    }

    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }

    return { pages, startPage, endPage };
  };

  const { pages: visiblePages, startPage, endPage } = getVisiblePages();

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination-content">
        {showFirstLast && (
          <button
            className="pagination-btn pagination-first"
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1 || disabled}
            aria-label={firstLabel}
          >
            {firstLabel}
          </button>
        )}

        {showPrevNext && (
          <button
            className="pagination-btn pagination-prev"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            aria-label={prevLabel}
          >
            {prevLabel}
          </button>
        )}

        {showPageNumbers && (
          <div className="pagination-pages">
            {startPage > 1 && (
              <>
                <button
                  className="pagination-btn pagination-page"
                  onClick={() => handlePageClick(1)}
                  disabled={disabled}
                  aria-label="Page 1"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="pagination-ellipsis" aria-hidden="true">...</span>
                )}
              </>
            )}

            {visiblePages.map((page) => (
              <button
                key={page}
                className={`pagination-btn pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                disabled={disabled}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="pagination-ellipsis" aria-hidden="true">...</span>
                )}
                <button
                  className="pagination-btn pagination-page"
                  onClick={() => handlePageClick(totalPages)}
                  disabled={disabled}
                  aria-label={`Page ${totalPages}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        )}

        {showPrevNext && (
          <button
            className="pagination-btn pagination-next"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            aria-label={nextLabel}
          >
            {nextLabel}
          </button>
        )}

        {showFirstLast && (
          <button
            className="pagination-btn pagination-last"
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages || disabled}
            aria-label={lastLabel}
          >
            {lastLabel}
          </button>
        )}

        {showPageNumbers && (
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;