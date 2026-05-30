import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
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
            {/* Optional Free Text Search */}
            {setSearchQuery && (
                <div className="table-search-header">
                    <input
                        type="text"
                        className="table-search-input"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="modern-table-wrapper">
                <table className="modern-table">
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                const canSort = header.column.getCanSort() && setSorting;
                                return (
                                    <th
                                        key={header.id}
                                        // CHANGED: Explicitly set single column ID and force ascending (desc: false)
                                        onClick={canSort ? () => setSorting([{ id: header.column.id, desc: false }]) : undefined}
                                        className={canSort ? 'sortable-header' : ''}
                                    >
                                        <div className="header-content">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {/* Sort Indicator Arrow */}
                                            <span className="sort-indicator">
                                                    {header.column.getIsSorted() === 'asc' ? ' ▲' : null}
                                                </span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {setPagination && (
                <div className="pagination-controls">
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() === -1 ? 1 : table.getPageCount()}
                    </span>
                    <div className="pagination-buttons">
                        <button
                            className="page-btn"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}