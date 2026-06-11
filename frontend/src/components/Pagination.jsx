import React from 'react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 1) return [1];

    const delta = 1;
    const range = [];

    for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
    ) {
        range.push(i);
    }

    if (currentPage - delta > 2) {
        range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
        range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
        range.push(totalPages);
    }

    return range;
};

const Pagination = ({ currentPage, totalPageCount, onPageChange }) => {
    // If there is only 1 page (or none), don't render the pagination at all
    if (totalPageCount <= 1) return null;

    const paginationRange = getPaginationRange(currentPage, totalPageCount);

    const handlePrevious = () => {
        onPageChange(Math.max(currentPage - 1, 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(currentPage + 1, totalPageCount));
    };

    return (
        <div className="pagination-container">
            <button
                className="pagination-btn icon-btn"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <FiChevronLeft size={20} />
            </button>

            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                            &#8230;
                        </span>
                    );
                }

                return (
                    <button
                        key={pageNumber}
                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                        onClick={() => onPageChange(pageNumber)}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={currentPage === pageNumber ? "page" : undefined}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            <button
                className="pagination-btn icon-btn"
                onClick={handleNext}
                disabled={currentPage === totalPageCount}
                aria-label="Next page"
            >
                <FiChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;