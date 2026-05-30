import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

export default function Table({
                                  data,
                                  columns,
                                  pageCount = -1,
                                  pagination = { pageIndex: 0, pageSize: 10 },
                                  setPagination
                              }) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <>
            <div className="modern-table-wrapper">
                <table className="modern-table">
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
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
        </>
    );
}