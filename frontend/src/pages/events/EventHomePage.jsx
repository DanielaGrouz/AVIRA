import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Button from '../../components/Button';
import '../../styles/events/EventHomePage.css';
import AppRoutes from "../../AppRoutesConfig";
import {FiPlus} from "react-icons/fi";

const EventHomePage = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            let response;
            if (searchQuery) {
                response = await EventService.search(searchQuery);
            } else {
                response = await EventService.getAll(1, sortBy);
            }
            setEvents(response.data.data.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [searchQuery, sortBy]);

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>My Events</h1>

                <div className="home-controls">
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="id">Sort by ID</option>
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </header>

            <div className="events-grid">
                {events.map(event => (
                    <div
                        key={event.id}
                        className="event-card"
                        onClick={() => navigate(AppRoutes.getEventDetails(event.id))}
                    >
                        <h2 className="event-title">{event.title || event.name || 'Untitled Event'}</h2>
                        <p className="event-detail">Date: {event.date || 'TBD'}</p>
                        <p className="event-detail">Location: {event.location || 'TBD'}</p>
                        <span className="event-id-badge">ID: {event.id}</span>
                    </div>
                ))}
            </div>

            {/* A perfectly round FAB with a Plus Icon */}
            <Button
                variant="fab"
                onClick={() => navigate(AppRoutes.CREATE_EVENT)} // Make sure to add this to your Routes
                title="Create New Event"
            >
                <FiPlus size={28} />
            </Button>
        </div>
    );
};

export default EventHomePage;