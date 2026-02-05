import React from 'react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = (): (number | string)[] => {
    const range = 1;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 2 + range) pages.push('...');
      for (
        let i = Math.max(2, currentPage - range);
        i <= Math.min(totalPages - 1, currentPage + range);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - (range + 1)) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const fromRecord = (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className="pagination-container"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {/* Left: Info */}
      <div className="pagination-info" style={{ fontSize: '14px' }}>
        Showing {fromRecord} to {toRecord} of {totalCount} results
      </div>

      {/* Center: Page Size Selector */}
      {onPageSizeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label htmlFor="pageSize" style={{ fontSize: '14px' }}>
            Items per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ padding: '4px 8px', fontSize: '14px' }}
          >
            {[5,10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Right: Page Buttons */}
      <div className="pagination-buttons" style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#ccc' : '#333',
            borderRadius: '4px',
          }}
        >
          ‹
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                background: page === currentPage ? '#1890ff' : 'white',
                color: page === currentPage ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              style={{
                padding: '6px 10px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              …
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#ccc' : '#333',
            borderRadius: '4px',
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
