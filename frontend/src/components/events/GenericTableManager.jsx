import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Table from '../Table';
import Button from '../Button';
import Pagination from '../Pagination';
import DeleteConfirmModal from './DeleteConfirmModal';

const GenericTableManager = ({
  title,
  itemName,
  idField,
  initialFormState,
  baseColumns,
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  FormModal,
  canDelete = () => true,
  mapRowToForm = (row) => row,
  updatedItem,
}) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 3;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = async () => {
    try {
      let activeSortBy = null;
      let sortDirection = 1;
      if (sorting.length > 0) {
        activeSortBy = sorting[0].id;
        sortDirection = sorting[0].desc ? -1 : 1;
      }
      const res = await fetchItems(
        currentPage,
        activeSortBy,
        searchQuery,
        PAGE_SIZE,
        sortDirection
      );
      setData(res.data.data.data);
      setPageCount(res.data.data.totalPages);
    } catch (error) {
      console.error(`Error fetching ${itemName}s:`, error);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery, sorting]);

  useEffect(() => {
    if (updatedItem) {
      setData((prevData) =>
        prevData.map((item) =>
          item[idField] === updatedItem[idField] ? { ...item, ...updatedItem } : item
        )
      );
    }
  }, [updatedItem, idField]);

  const handleSave = async (payload) => {
    try {
      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        await addItem(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(`Failed to save ${itemName}`, error);
      throw error; // Let the FormModal catch this if needed
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(itemToDelete);
      setDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error(`Failed to delete ${itemName}`, error);
    }
  };

  const columnsWithActions = [
    ...baseColumns,
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            onClick={() => {
              setEditingId(row.original[idField]);
              setFormData(mapRowToForm(row.original));
              setIsModalOpen(true);
            }}
            className="icon-btn edit-btn"
            title={`Edit ${itemName}`}
          >
            <FaEdit />
          </button>
          {canDelete(row.original) && (
            <button
              onClick={() => {
                setItemToDelete(row.original[idField]);
                setDeleteModalOpen(true);
              }}
              className="icon-btn delete-btn"
              title={`Delete ${itemName}`}
            >
              <FaTrash />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>{title}</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
        >
          + Add {itemName.charAt(0).toUpperCase() + itemName.slice(1)}
        </Button>
      </div>

      <Table
        data={data}
        columns={columnsWithActions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sorting={sorting}
        setSorting={setSorting}
      />

      {pageCount > 1 && (
        <div className="table-pagination-wrapper">
          <Pagination
            currentPage={currentPage}
            totalPageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={formData}
        isEditing={!!editingId}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={itemName}
      />
    </div>
  );
};

export default GenericTableManager;
