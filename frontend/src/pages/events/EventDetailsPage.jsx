import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EventService from '../../services/EventService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import '../../styles/events/EventDetailsPage.css';
import CustomSelect from "../../components/CustomSelect";
import AppRoutes from "../../AppRoutesConfig";

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventDetails, setEventDetails] = useState(null);

    // --- Pagination States ---
    const [guests, setGuests] = useState([]);
    const [guestPageCount, setGuestPageCount] = useState(0);
    const [guestCurrentPage, setGuestCurrentPage] = useState(1);
    const GUEST_PAGE_SIZE = 1;

    const [tasks, setTasks] = useState([]);
    const [taskPageCount, setTaskPageCount] = useState(0);
    const [taskCurrentPage, setTaskCurrentPage] = useState(1);
    const TASK_PAGE_SIZE = 1;

    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const [editingGuestId, setEditingGuestId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    const [guestData, setGuestData] = useState({ name: '', phone: '', role: 'Guest', status: 'Pending' });
    const [taskData, setTaskData] = useState({ title: '', status: 'Pending', priority: 'Medium' });
    const [guestError, setGuestError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- Delete Handlers ---
    const promptDeleteGuest = (guestId) => {
        setItemToDelete({ id: guestId, type: 'guest'});
        setIsDeleteModalOpen(true);
    };

    const promptDeleteTask = (taskId) => {
        setItemToDelete({ id: taskId, type: 'task' });
        setIsDeleteModalOpen(true);
    };

    // --- Fetchers ---
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await EventService.getById(id);
                setEventDetails(res.data.data);
            } catch (error) {
                return navigate(AppRoutes.NOT_FOUND);
            }
        };
        fetchEvent();
    }, [id]);

    const fetchGuests = async () => {
        try {
            const res = await EventService.getGuests(id, {
                page: guestCurrentPage, limit: GUEST_PAGE_SIZE
            });
            setGuests(res.data.data.guests);
            setGuestPageCount(Math.ceil((res.data.data.totalCount || 0) / GUEST_PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching guests:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await EventService.getTasks(id, {
                page: taskCurrentPage, limit: TASK_PAGE_SIZE
            });
            setTasks(res.data.data.tasks || res.data.data);
            setTaskPageCount(Math.ceil((res.data.data.totalCount || 0) / TASK_PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => { fetchGuests(); }, [id, guestCurrentPage]);
    useEffect(() => { fetchTasks(); }, [id, taskCurrentPage]);

    // --- Open Modal Handlers ---
    const openAddGuestModal = () => {
        setEditingGuestId(null);
        setGuestData({ name: '', phone: '', status: 'Pending' });
        setIsGuestModalOpen(true);
    };

    const openEditGuestModal = (guest) => {
        setEditingGuestId(guest.guestId);
        setGuestData({
            name: guest.name,
            phone: guest.phone,
            status: guest.status
        });
        setIsGuestModalOpen(true);
    };

    const openAddTaskModal = () => {
        setEditingTaskId(null);
        setTaskData({ title: '', status: 'Pending', priority: 'Medium' });
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTaskId(task.taskId);
        setTaskData({
            title: task.title || task.description,
            status: task.status,
            priority: task.priority || 'Medium'
        });
        setIsTaskModalOpen(true);
    };

    // --- Submit Handlers ---
    const handleSaveGuest = async (e) => {
        e.preventDefault();
        setGuestError('');

        const name = guestData.name;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            setGuestError('Name must be a string (min 2 chars)');
            return;
        }

        const cleanPhone = guestData.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
            setGuestError('Please enter a valid Israeli phone number (e.g., 0545368889).');
            return;
        }

        try {
            const payload = { eventId: id, ...guestData, phone: cleanPhone };
            if (editingGuestId) {
                await EventService.updateGuest(editingGuestId, payload);
            } else {
                await EventService.addGuest(payload);
            }

            setIsGuestModalOpen(false);
            fetchGuests();
        } catch (error) {
            console.error("Failed to save guest", error);
            setGuestError('Failed to save guest. Please try again.');
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { eventId: id, ...taskData };
            if (editingTaskId) {
                await EventService.updateTask(editingTaskId, payload);
            } else {
                await EventService.addTask(payload);
            }

            setIsTaskModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'guest') {
            try {
                await EventService.deleteGuest(id, itemToDelete.id);
                fetchGuests();
            } catch (error) {
                console.error("Failed to delete guest", error);
            }
        } else if (itemToDelete.type === 'task') {
            try {
                await EventService.deleteTask(id, itemToDelete.id);
                fetchTasks();
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const guestColumns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'role', header: 'Role' },
        {
            accessorKey: 'status', header: 'RSVP',
            cell: info => (
                <span style={{ color: info.getValue() === 'Confirmed' ? '#10b981' : '#64748b' }}>
                    {info.getValue()}
                </span>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const isManager = row.original.role?.toUpperCase() === 'MANAGER';

                return (
                    <div className="actions-cell">
                        <button onClick={() => openEditGuestModal(row.original)} className="icon-btn edit-btn" title="Edit Guest">
                            <FaEdit />
                        </button>

                        {!isManager && (
                            <button onClick={() => promptDeleteGuest(row.original.guestId)} className="icon-btn delete-btn" title="Delete Guest">
                                <FaTrash />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const taskColumns = [
        { accessorKey: 'title', header: 'Task' },
        { accessorKey: 'priority', header: 'Priority' },
        { accessorKey: 'status', header: 'Status' },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="actions-cell">
                    <button onClick={() => openEditTaskModal(row.original)} className="icon-btn edit-btn" title="Edit Task">
                        <FaEdit />
                    </button>
                    <button onClick={() => promptDeleteTask(row.original.taskId)} className="icon-btn delete-btn" title="Delete Task">
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    if (!eventDetails) return <div className="loading-state">Loading Event Details...</div>;

    return (
        <div className="details-container">
            <Button variant="text" className="back-btn" onClick={() => navigate(-1)}>
                &larr; Back to Events
            </Button>

            <div className="details-header">
                <h1 className="details-title">{eventDetails.name}</h1>
                <p className="details-description">{eventDetails.description}</p>
            </div>

            <div className="tables-layout">
                {/* --- Guests Card --- */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Guest List</h2>
                        <Button variant="success" onClick={openAddGuestModal}>
                            + Add Guest
                        </Button>
                    </div>
                    <Table data={guests} columns={guestColumns} />

                    {guestPageCount > 1 && (
                        <div className="table-pagination-wrapper">
                            <Pagination
                                currentPage={guestCurrentPage}
                                totalPageCount={guestPageCount}
                                onPageChange={setGuestCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {/* --- Tasks Card --- */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Event Tasks</h2>
                        <Button variant="primary" onClick={openAddTaskModal}>
                            + Add Task
                        </Button>
                    </div>
                    <Table data={tasks} columns={taskColumns} />

                    {taskPageCount > 1 && (
                        <div className="table-pagination-wrapper">
                            <Pagination
                                currentPage={taskCurrentPage}
                                totalPageCount={taskPageCount}
                                onPageChange={setTaskCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} title={editingGuestId ? "Edit Guest" : "Edit Guest"}>
                <form onSubmit={handleSaveGuest}>
                    <div className="modal-body">
                        {guestError && (
                            <div style={{
                                color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem',
                                borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #f87171'
                            }}>
                                {guestError}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text" className="form-input" required placeholder="e.g. Jane Doe"
                                value={guestData.name}
                                onChange={(e) => {
                                    setGuestData({...guestData, name: e.target.value});
                                    if (guestError) setGuestError('');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel" className="form-input" required placeholder="e.g. 0545368889"
                                value={guestData.phone}
                                onChange={(e) => {
                                    setGuestData({...guestData, phone: e.target.value});
                                    if (guestError) setGuestError('');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <CustomSelect
                                value={guestData.status}
                                placement="top"
                                onChange={(e) => setGuestData({...guestData, status: e.target.value})}
                                options={[
                                    { value: 'pending', label: 'pending' },
                                    { value: 'confirmed', label: 'confirmed' },
                                    { value: 'cancelled', label: 'cancelled' }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button
                            variant="text" type="button"
                            onClick={() => {
                                setIsGuestModalOpen(false);
                                setGuestError('');
                            }}>Cancel</Button>
                        <Button variant="success" type="submit">{editingGuestId ? "Update Guest" : "Save Guest"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTaskId ? "Edit Task" : "Add New Task"}>
                <form onSubmit={handleSaveTask}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Task Title</label>
                            <input
                                type="text" className="form-input" required placeholder="e.g. Confirm catering menu"
                                value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <CustomSelect
                                value={taskData.priority}
                                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' }
                                ]}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <CustomSelect
                                value={taskData.status}
                                placement="top"
                                onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                                options={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'in progress', label: 'In Progress' },
                                    { value: 'completed', label: 'Completed' }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button variant="text" type="button" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingTaskId ? "Update Task" : "Save Task"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                title="Confirm Deletion"
            >
                <div className="modal-body">
                    <p style={{ margin: 0, color: '#475569', fontSize: '1rem', lineHeight: '1.5' }}>
                        Are you sure you want to delete this {itemToDelete?.type}?
                        <br/><br/>
                        <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <div className="modal-footer">
                    <Button
                        variant="text"
                        onClick={() => {
                            setIsDeleteModalOpen(false);
                            setItemToDelete(null);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="danger"
                        onClick={executeDelete}
                    >
                        Yes, Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default EventDetailsPage;