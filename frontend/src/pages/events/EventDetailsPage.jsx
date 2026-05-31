import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import AppRoutes from "../../AppRoutesConfig";
import Button from '../../components/Button';
import EventHeader from '../../components/events/EventHeader';
import EventSmartActions from '../../components/events/EventSmartActions';
import GuestManager from '../../components/events/GuestManager';
import TaskManager from '../../components/events/TaskManager';
import '../../styles/events/EventDetailsPage.css';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eventDetails, setEventDetails] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch core event details
    const fetchEvent = async () => {
        try {
            const res = await EventService.getById(id);
            setEventDetails(res.data.data);
        } catch (error) {
            navigate(AppRoutes.NOT_FOUND);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id, navigate]);

    const handleEventUpdate = async () => {
        await fetchEvent();
        setRefreshKey(prevKey => prevKey + 1);
    };

    if (!eventDetails) return <div className="loading-state">Loading Event Details...</div>;

    return (
        <div className="details-container">
            <Button variant="text" className="back-btn" onClick={() => navigate(-1)}>
                &larr; Back to Events
            </Button>

            <EventHeader eventDetails={eventDetails} eventId={id} />

            <EventSmartActions
                eventId={id}
                eventLocation={eventDetails?.location}
                onEventUpdate={handleEventUpdate}
            />

            <div className="tables-layout">
                <GuestManager eventId={id} />
                <TaskManager eventId={id} key={`task-manager-${refreshKey}`} />
            </div>
        </div>
    );
};

export default EventDetailsPage;