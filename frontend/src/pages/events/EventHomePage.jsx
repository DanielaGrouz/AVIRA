import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import '../../styles/events/EventHomePage.css';
import AppRoutes from "../../AppRoutesConfig";
import { FiPlus } from "react-icons/fi";
import CustomSelect from "../../components/CustomSelect";

const EventHomePage = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('id');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);

    const navigate = useNavigate();
    const PAGE_SIZE = 8;

    const fetchEvents = async () => {
        try {
            const response = await EventService.getAll(currentPage, sortBy, searchQuery, PAGE_SIZE);
            setTotalPageCount(response.data.data.totalPages);
            setEvents(response.data.data.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentPage, searchQuery, sortBy]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="home-container">
            <header className="home-header">
                {/* --- NEW HEADER TOP ROW --- */}
                <div className="header-top-row">
                    <h1>My Events</h1>
                    <button
                        className="modern-create-btn"
                        onClick={() => navigate(AppRoutes.CREATE_EVENT)}
                    >
                        <FiPlus size={20} className="btn-icon" />
                        Create Event
                    </button>
                </div>

                <div className="home-controls">
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <CustomSelect
                        value={sortBy}
                        onChange={handleSortChange}
                        options={[
                            { value: 'date', label: 'Sort by Date' },
                            { value: 'title', label: 'Sort by Title' },
                            { value: 'location', label: 'Sort by Location' }

                        ]}
                    />
                </div>
            </header>

            <div className="events-grid">
                {events.length > 0 ? (
                    events.map(event => (
                        <div
                            key={event.eventId}
                            className="event-card"
                            onClick={() => navigate(AppRoutes.getEventDetails(event.eventId))}
                        >
                            <h2 className="event-title">{event.title}</h2>
                            <p className="event-detail">Type: {event.eventType}</p>
                            <p className="event-detail">Guests: {event.guestsCount}</p>
                            <p className="event-detail">Date: {event.date || 'TBD'}</p>
                            <p className="event-detail">Location: {event.location || 'TBD'}</p>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">No events found.</div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPageCount={totalPageCount}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default EventHomePage;