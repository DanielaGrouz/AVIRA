import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import '../styles/components/Table.css';

export default function Table({
                                  data,
                                  columns,
                                  pageCount = -1,
                                  pagination = { pageIndex: 0, pageSize: 10 },
                                  setPagination,
                                  sorting = [],
                                  setSorting,
                                  searchQuery = "",
                                  setSearchQuery
                              }) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination,
            sorting
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    return (
        <div className="table-container-wrapper">
            {/* Search Bar aligned to the left */}
            {setSearchQuery && (
                <div className="table-search-header">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="table-search-input"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="modern-table-card">
                <div className="modern-table-wrapper">
                    <table className="modern-table">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const canSort = header.column.getCanSort() && setSorting;
                                    const isSorted = header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            // Toggles sorting direction if clicked again
                                            onClick={canSort ? () => setSorting([{ id: header.column.id, desc: isSorted === 'asc' }]) : undefined}
                                            className={canSort ? 'sortable-header' : ''}
                                        >
                                            <div className="header-content">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {/* Modern Sort Indicator Icons */}
                                                {canSort && (
                                                    <span className="sort-indicator">
                                                            {isSorted === 'asc' ? <FaSortUp /> : isSorted === 'desc' ? <FaSortDown /> : <FaSort className="sort-idle" />}
                                                        </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                        </thead>
                        <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="table-row">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="empty-state">
                                    No results found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {setPagination && (
                <div className="pagination-controls">
                    <span className="pagination-info">
                        Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount() === -1 ? 1 : table.getPageCount()}</strong>
                    </span>
                    <div className="pagination-buttons">
                        <button
                            className="page-btn"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <FaChevronLeft /> Previous
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}