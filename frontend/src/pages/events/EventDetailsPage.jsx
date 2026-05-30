import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import '../../styles/events/EventDetailsPage.css';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventDetails, setEventDetails] = useState(null);

    // Guest State (Server-side pagination)
    const [guests, setGuests] = useState([]);
    const [guestPageCount, setGuestPageCount] = useState(0);
    const [guestPagination, setGuestPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Task State (Server-side pagination)
    const [tasks, setTasks] = useState([]);
    const [taskPageCount, setTaskPageCount] = useState(0);
    const [taskPagination, setTaskPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // 1. Fetch Static Event Details
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

    // 2. Fetch Guests (Triggers on load and when guestPagination changes)
    useEffect(() => {
        const fetchGuests = async () => {
            try {
                // Assuming your backend expects page (1-indexed) and limit
                const res = await EventService.getGuests(id, {
                    page: guestPagination.pageIndex + 1,
                    limit: guestPagination.pageSize
                });
                setGuests(res.data.data.guests);

                // Assuming backend returns total items to calculate page count
                const totalItems = res.data.data.totalCount || 0;
                setGuestPageCount(Math.ceil(totalItems / guestPagination.pageSize));
            } catch (error) {
                console.error("Error fetching guests:", error);
            }
        };
        fetchGuests();
    }, [id, guestPagination]);

    // 3. Fetch Tasks (Triggers on load and when taskPagination changes)
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await EventService.getTasks(id, {
                    page: taskPagination.pageIndex + 1,
                    limit: taskPagination.pageSize
                });
                setTasks(res.data.data.tasks || res.data.data);

                const totalItems = res.data.data.totalCount || 0;
                setTaskPageCount(Math.ceil(totalItems / taskPagination.pageSize));
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, [id, taskPagination]);

    // TanStack Table Column Definitions (Accessor keys match your data fields)
    const guestColumns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        {
            accessorKey: 'status',
            header: 'RSVP',
            // Example of how easy it is to style specific cells in TanStack
            cell: info => (
                <span style={{
                    color: info.getValue() === 'Confirmed' ? '#10b981' : '#64748b'
                }}>
                    {info.getValue()}
                </span>
            )
        }
    ];

    const taskColumns = [
        { accessorKey: 'description', header: 'Task' },
        { accessorKey: 'assignee', header: 'Assigned To' },
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
                        <Button variant="success" onClick={() => console.log('Add Guest')}>
                            + Add Guest
                        </Button>
                    </div>
                    <Table
                        data={guests}
                        columns={guestColumns}
                        pageCount={guestPageCount}
                        pagination={guestPagination}
                        setPagination={setGuestPagination}
                    />
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <h2>Event Tasks</h2>
                        <Button variant="primary" onClick={() => console.log('Add Task')}>
                            + Add Task
                        </Button>
                    </div>
                    <Table
                        data={tasks}
                        columns={taskColumns}
                        pageCount={taskPageCount}
                        pagination={taskPagination}
                        setPagination={setTaskPagination}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;