// src/components/events/GuestManager.jsx
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EventService from '../../services/EventService';
import Table from '../Table';
import Button from '../Button';
import Pagination from '../Pagination';
import GuestModal from './GuestModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const GuestManager = ({ eventId }) => {
    const [guests, setGuests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sorting, setSorting] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const GUEST_PAGE_SIZE = 3;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuestId, setEditingGuestId] = useState(null);
    const [guestData, setGuestData] = useState({ name: '', phone: '', role: 'Guest', status: 'Pending' });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState(null);

    const fetchGuests = async () => {
        try {
            const activeSortBy = sorting.length > 0 ? sorting[0].id : null;
            const res = await EventService.getGuests(eventId, currentPage, activeSortBy, searchQuery, GUEST_PAGE_SIZE);
            setGuests(res.data.data.data);
            setPageCount(res.data.data.totalPages);
        } catch (error) {
            console.error("Error fetching guests:", error);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, [eventId, currentPage, searchQuery, sorting]);

    const handleSave = async (payload) => {
        if (editingGuestId) {
            await EventService.updateGuest(editingGuestId, { eventId, ...payload });
        } else {
            await EventService.addGuest({ eventId, ...payload });
        }
        setIsModalOpen(false);
        fetchGuests();
    };

    const handleDelete = async () => {
        try {
            await EventService.deleteGuest(eventId, guestToDelete);
            setDeleteModalOpen(false);
            fetchGuests();
        } catch (error) {
            console.error("Failed to delete guest", error);
        }
    };

    const columns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'role', header: 'Role' },
        {
            accessorKey: 'status',
            header: 'RSVP',
            cell: info => (
                <span style={{ color: info.getValue() === 'Confirmed' ? '#10b981' : '#64748b' }}>
                    {info.getValue()}
                </span>
            )
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const isManager = row.original.role?.toUpperCase() === 'MANAGER';
                return (
                    <div className="actions-cell">
                        <button
                            onClick={() => {
                                setEditingGuestId(row.original.guestId);
                                setGuestData(row.original);
                                setIsModalOpen(true);
                            }}
                            className="icon-btn edit-btn" title="Edit Guest"
                        >
                            <FaEdit />
                        </button>
                        {!isManager && (
                            <button
                                onClick={() => {
                                    setGuestToDelete(row.original.guestId);
                                    setDeleteModalOpen(true);
                                }}
                                className="icon-btn delete-btn" title="Delete Guest"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>Guest List</h2>
                <Button variant="success" onClick={() => {
                    setEditingGuestId(null);
                    setGuestData({ name: '', phone: '', role: 'Guest', status: 'Pending' });
                    setIsModalOpen(true);
                }}>
                    + Add Guest
                </Button>
            </div>

            <Table
                data={guests}
                columns={columns}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sorting={sorting}
                setSorting={setSorting}
            />

            {pageCount > 1 && (
                <div className="table-pagination-wrapper">
                    <Pagination currentPage={currentPage} totalPageCount={pageCount} onPageChange={setCurrentPage} />
                </div>
            )}

            <GuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={guestData}
                isEditing={!!editingGuestId}
            />
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName="guest"
            />
        </div>
    );
};

export default GuestManager;