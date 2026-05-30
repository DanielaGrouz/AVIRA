import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Table = ({ rowData, columnDefs, height = '400px' }) => {
    return (
        <div className="ag-theme-alpine" style={{ height, width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    flex: 1
                }}
                pagination={true}
                paginationPageSize={10}
            />
        </div>
    );
};

export default Table;