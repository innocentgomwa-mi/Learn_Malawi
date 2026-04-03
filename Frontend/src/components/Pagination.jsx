import React from "react";
import "../styles/pagination.css";

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
  
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  // Calculate visible page numbers
  const getVisiblePages = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };
  
  const visiblePages = getVisiblePages();

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
            {visiblePages.map(page => (
              <button
                key={page}
                className={`pagination-btn pagination-page ${
                  currentPage === page ? 'active' : ''
                }`}
                onClick={() => handlePageClick(page)}
                disabled={disabled}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>
        )}
        
        {showPageNumbers && totalPages > maxVisiblePages && currentPage < totalPages - 2 && (
          <span className="pagination-ellipsis">...</span>
        )}
        
        {showPageNumbers && totalPages > maxVisiblePages && currentPage < totalPages - 1 && (
          <button
            className="pagination-btn pagination-page"
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled}
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </button>
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