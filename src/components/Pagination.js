import React from 'react';
import './Pagination.css';

/**
 * Build list of page numbers and ellipsis to display.
 * e.g. [1, 2, 3, '...', 197] when on page 1; [1, '...', 5, 6, 7, '...', 197] in middle.
 */
function getPageItems(currentPage, lastPage) {
  if (lastPage <= 0) return [];
  if (lastPage <= 5) return Array.from({ length: lastPage }, (_, i) => i + 1);

  const items = [];
  if (currentPage <= 3) {
    for (let p = 1; p <= Math.min(3, lastPage); p++) items.push(p);
  } else {
    items.push(1, '...');
    items.push(currentPage - 1, currentPage, currentPage + 1);
  }
  if (currentPage >= lastPage - 2 && currentPage > 3) {
    items.length = 0;
    items.push(1, '...');
    for (let p = Math.max(1, lastPage - 2); p <= lastPage; p++) items.push(p);
  } else if (currentPage <= 3 && lastPage > 3) {
    items.push('...', lastPage);
  } else if (currentPage > 3 && currentPage < lastPage - 2) {
    items.push('...', lastPage);
  }
  return items.filter((v, i, a) => v === '...' || a.indexOf(v) === i);
}

const Pagination = ({ currentPage, lastPage, onPageChange, total, from, to }) => {
  if (lastPage <= 1) return null;

  const pageItems = getPageItems(currentPage, lastPage);

  return (
    <div className="pagination-wrap">
      {(total != null && total > 0) && (
        <span className="pagination-info">
          {`Showing ${from}–${to} of ${total}`}
        </span>
      )}
      <div className="pagination-nav">
        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pageItems.map((item, i) =>
          item === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination-num ${currentPage === item ? 'active' : ''}`}
              onClick={() => onPageChange(item)}
              disabled={currentPage === item}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
