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
    const [guests, setGuests] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const [eventRes, guestsRes, tasksRes] = await Promise.all([
                    EventService.getById(id),
                    EventService.getGuests(id),
                    EventService.getTasks(id)
                ]);

                setEventDetails(eventRes.data.data);
                setGuests(guestsRes.data.data.guests);
                setTasks(tasksRes.data.data);
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };
        fetchEventData();
    }, [id]);

    const guestColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name' },
        { field: 'phone', headerName: 'Phone' },
        { field: 'status', headerName: 'RSVP Status' }
    ];

    const taskColumns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'description', headerName: 'Task Description' },
        { field: 'status', headerName: 'Status' },
        { field: 'assignee', headerName: 'Assigned To' }
    ];

    if (!eventDetails) return <div className="loading-state">Loading...</div>;

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
                {/* Guests Section */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Guests</h2>
                        <Button variant="success" onClick={() => console.log('Add Guest')}>
                            + Add Guest
                        </Button>
                    </div>
                    <Table rowData={guests} columnDefs={guestColumns} height="400px" />
                </div>

                {/* Tasks Section */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Tasks</h2>
                        <Button variant="primary" onClick={() => console.log('Add Task')}>
                            + Add Task
                        </Button>
                    </div>
                    <Table rowData={tasks} columnDefs={taskColumns} height="400px" />
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;