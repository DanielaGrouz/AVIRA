import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal'; // Import the new Modal
import '../../styles/events/EventDetailsPage.css';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventDetails, setEventDetails] = useState(null);

    // --- Pagination States ---
    const [guests, setGuests] = useState([]);
    const [guestPageCount, setGuestPageCount] = useState(0);
    const [guestPagination, setGuestPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const [tasks, setTasks] = useState([]);
    const [taskPageCount, setTaskPageCount] = useState(0);
    const [taskPagination, setTaskPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const [guestData, setGuestData] = useState({ name: '', phone: '', role: 'Guest', status: 'Pending' });
    const [taskData, setTaskData] = useState({ title: '', status: 'Pending', priority: 'Medium' });
    const [guestError, setGuestError] = useState('');

    // --- Fetchers ---
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await EventService.getById(id);
                setEventDetails(res.data.data);
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };
        fetchEvent();
    }, [id]);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await EventService.getGuests(id, {
                    page: guestPagination.pageIndex + 1, limit: guestPagination.pageSize
                });
                setGuests(res.data.data.guests);
                setGuestPageCount(Math.ceil((res.data.data.totalCount || 0) / guestPagination.pageSize));
            } catch (error) {
                console.error("Error fetching guests:", error);
            }
        };
        fetchGuests();
    }, [id, guestPagination]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await EventService.getTasks(id, {
                    page: taskPagination.pageIndex + 1, limit: taskPagination.pageSize
                });
                setTasks(res.data.data.tasks || res.data.data);
                setTaskPageCount(Math.ceil((res.data.data.totalCount || 0) / taskPagination.pageSize));
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, [id, taskPagination]);

    const handleAddGuest = async (e) => {
        e.preventDefault();
        setGuestError(''); // Reset previous errors

        // 1. Phone Number Validation
        const cleanPhone = guestData.phone.replace(/\D/g, '');

        if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
            setGuestError('Please enter a valid Israeli phone number (e.g., 0545368889).');
            return; // Stop the form submission
        }

        // 2. API Call
        try {
            // Optional: Save the cleaned phone number to the database instead of the raw input
            const payload = { eventId: id, ...guestData, phone: cleanPhone };

            // await EventService.addGuest(payload);
            console.log("Submitting Guest:", payload);

            // Reset and close on success
            setIsGuestModalOpen(false);
            setGuestData({ name: '', phone: '', role: 'Guest', status: 'Pending' });
        } catch (error) {
            console.error("Failed to add guest", error);
            setGuestError('Failed to add guest. Please try again.');
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            // await EventService.addTask({ eventId: id, ...taskData });
            console.log("Submitting Task:", { eventId: id, ...taskData });

            setIsTaskModalOpen(false);
            setTaskData({ title: '', status: 'Pending', priority: 'Medium' }); // Reset form
            // Optionally re-fetch tasks here to update the table
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    // --- Table Columns ---
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
        }
    ];

    const taskColumns = [
        { accessorKey: 'title', header: 'Task' },
        { accessorKey: 'priority', header: 'Priority' },
        { accessorKey: 'status', header: 'Status' }
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
                <div className="table-card">
                    <div className="table-header">
                        <h2>Guest List</h2>
                        <Button variant="success" onClick={() => setIsGuestModalOpen(true)}>
                            + Add Guest
                        </Button>
                    </div>
                    <Table
                        data={guests} columns={guestColumns}
                        pageCount={guestPageCount} pagination={guestPagination} setPagination={setGuestPagination}
                    />
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <h2>Event Tasks</h2>
                        <Button variant="primary" onClick={() => setIsTaskModalOpen(true)}>
                            + Add Task
                        </Button>
                    </div>
                    <Table
                        data={tasks} columns={taskColumns}
                        pageCount={taskPageCount} pagination={taskPagination} setPagination={setTaskPagination}
                    />
                </div>
            </div>

            {/* --- Modals --- */}

            <Modal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} title="Add New Guest">
                <form onSubmit={handleAddGuest}>
                    <div className="modal-body">
                        {guestError && (
                            <div style={{
                                color: '#b91c1c',
                                backgroundColor: '#fef2f2',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                border: '1px solid #f87171'
                            }}>
                                {guestError}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text" className="form-input" required placeholder="e.g. Jane Doe"
                                value={guestData.name} onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel" className="form-input" required placeholder="e.g. 0545368889"
                                value={guestData.phone}
                                onChange={(e) => {
                                    setGuestData({...guestData, phone: e.target.value});
                                    if (guestError) setGuestError(''); // Clear error when user starts typing again
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={guestData.role} onChange={(e) => setGuestData({...guestData, role: e.target.value})}
                            >
                                <option value="Guest">Guest</option>
                                <option value="VIP">VIP</option>
                                <option value="Vendor">Vendor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={guestData.status} onChange={(e) => setGuestData({...guestData, status: e.target.value})}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Declined">Declined</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button
                            variant="text" type="button"
                            onClick={() => {
                                setIsGuestModalOpen(false);
                                setGuestError('');
                            }}>Cancel</Button>
                        <Button variant="success" type="submit">Save Guest</Button>
                    </div>
                </form>
            </Modal>

            {/* Add Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add New Task">
                <form onSubmit={handleAddTask}>
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
                            <select
                                className="form-select"
                                value={taskData.priority} onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={taskData.status} onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button variant="text" type="button" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Task</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EventDetailsPage;